import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, Clock, CalendarIcon, Calendar, Play } from "lucide-react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { fetchOneEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.attendanceURL;

const EmployeeAttendance = () => {
  const dispatch = useDispatch();
  const { attendance, loading, error } = useSelector(
    (state) => state.attendances
  );

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [date, setDate] = useState(null); // State to manage selected date
  const [attendanceData, setAttendanceData] = useState([]); // State for attendance data for the calendar
  const [showReasonForm, setShowReasonForm] = useState(false); // State to control reason form visibility
  const [reason, setReason] = useState(""); // State to store the reason
  const [showToast, setShowToast] = useState(false); // State to control toast visibility
  const [reasonSubmitted, setReasonSubmitted] = useState(false); // State to track if reason was submitted
  const [monthlySummary, setMonthlySummary] = useState({}); // State to store monthly attendance summary counts
  const calendarRef = useRef(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // State for real-time updates
  const [dailyAttendanceData, setDailyAttendanceData] = useState(null); // State for daily attendance data
  const prevErrorRef = useRef();

  // Get current date info
  const today = new Date();
  const currentMonth = today.toLocaleString("default", { month: "short" });
  const currentYear = today.getFullYear().toString();

  // Initialize with current month and year
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Add useEffect for calendar click outside handling
  useEffect(() => {
    const handleCalendarClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleCalendarClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleCalendarClickOutside);
    };
  }, []);

  // Update current time every second for real-time calculations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const toggleCalendar = useCallback(
    () => setIsCalendarOpen(!isCalendarOpen),
    [isCalendarOpen]
  );

  const handleMonthSelection = useCallback(
    (month, year) => {
      setSelectedMonth(month);
      setSelectedYear(year);
      setIsCalendarOpen(false);

      // Get employee ID from session storage
      const employeeId = sessionStorage.getItem("employeeId");
      if (!employeeId) {
        toast.error("Employee ID not found in session storage.");
        return;
      }

      // Dispatch the action to fetch attendance data
      dispatch(
        fetchOneEmployeeAttendanceOneMonth({
          employeeId,
          month,
          year,
        })
      );
    },
    [dispatch]
  );

  // Initial data fetch when component mounts
  useEffect(() => {
    const employeeId = sessionStorage.getItem("employeeId");
    if (!employeeId) {
      toast.error("Employee ID not found in session storage.");
      return;
    }

    // Fetch data for current month and year
    dispatch(
      fetchOneEmployeeAttendanceOneMonth({
        employeeId,
        month: currentMonth,
        year: currentYear,
      })
    );
  }, [dispatch, currentMonth, currentYear]);

  // Update attendance data when Redux store changes
  useEffect(() => {
    if (attendance && !loading && !error) {
      const monthIndex = new Date(
        `${selectedMonth} 1, ${selectedYear}`
      ).getMonth();
      const daysInMonth = new Date(
        parseInt(selectedYear),
        monthIndex + 1,
        0
      ).getDate();

      const formattedData = [];
      // Initialize summary counts from the response statusCounts
      const summaryCounts = {
        Present: attendance.statusCounts?.P || 0,
        "Approved Leave": attendance.statusCounts?.AL || 0,
        "Present on Holiday": 0, // Will be calculated from days
        "Half Day on Holiday": 0, // Will be calculated from days
        "Half Day": 0, // Will be calculated from days
        "On Leave": 0,
        Holiday: attendance.statusCounts?.H || 0,
        Weekend: 0,
        "Loss of Pay": attendance.statusCounts?.LOP || 0,
        Absent: attendance.statusCounts?.A || 0,
        "Present Half Day on Loss of Pay": 0, // Will be calculated from days
      };

      // Helper function to determine attendance status for a given date
      const getAttendanceStatusForDate = (dayNumber) => {
        // Check if the day exists in the days object
        if (attendance.days && attendance.days[dayNumber]) {
          return attendance.days[dayNumber].statusCode;
        }
        
        // Return null if no status code is available (empty box)
        return null;
      };

      for (let day = 1; day <= daysInMonth; day++) {
        // Get status code for the current day
        const status = getAttendanceStatusForDate(day.toString());

        let fullStatus = "No Data";
        let leaveType = null;

        // Only process status if it's not null
        if (status) {
          switch (status) {
            case "P":
              fullStatus = "Present";
              break;
            case "AL":
              fullStatus = "Approved Leave";
              break;
            case "A":
              fullStatus = "Absent";
              break;
            case "H":
              fullStatus = "Holiday";
              break;
            case "W":
              fullStatus = "Weekend";
              break;
            case "PH":
              fullStatus = "Present on Holiday";
              leaveType = "On Holiday";
              break;
            case "PH/A":
              fullStatus = "Half Day on Holiday";
              leaveType = "Half Day on Holiday";
              break;
            case "P/A":
              fullStatus = "Half Day";
              leaveType = "Half Day";
              break;
            case "LOP":
              fullStatus = "Loss of Pay";
              leaveType = "Loss of Pay";
              break;
            case "P/LOP":
              fullStatus = "Present Half Day on Loss of Pay";
              leaveType = "Present Half Day on Loss of Pay";
              break;
            default:
              fullStatus = "No Data"; // Keep as "No Data" for unknown status codes
          }
        }

        formattedData.push({
          date: new Date(parseInt(selectedYear), monthIndex, day),
          status: fullStatus,
          isLate: false,
          checkIn: null,
          checkOut: null,
          leaveType: leaveType,
          checkinTimes: attendance?.checkinTimes || [],
          checkoutTimes: attendance?.checkoutTimes || [],
          totalWorkingMinutes: attendance?.totalWorkingMinutes || 0,
        });

        // Update summary counts for statuses that need to be calculated from days
        if (fullStatus === "Present on Holiday" || fullStatus === "Half Day on Holiday" || 
            fullStatus === "Half Day" || fullStatus === "Present Half Day on Loss of Pay") {
          summaryCounts[fullStatus] = (summaryCounts[fullStatus] || 0) + 1;
        }
      }
      setAttendanceData(formattedData);
      setMonthlySummary(summaryCounts);
    } else if (error && prevErrorRef.current !== error) {
      toast.error(`Failed to fetch attendance data: ${error}`);
      prevErrorRef.current = error;
      setAttendanceData([]);
      setMonthlySummary({});
    }
  }, [attendance, loading, error, selectedMonth, selectedYear]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const generateCalendarDays = () => {
    const monthIndex = new Date(
      `${selectedMonth} 1, ${selectedYear}`
    ).getMonth();
    const year = parseInt(selectedYear);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    let daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, monthIndex, day));
    }

    return daysArray;
  };

  const handleSubmitReason = (e) => {
    e.preventDefault();

    // Show toast notification
    setShowToast(true);

    // Mark reason as submitted
    setReasonSubmitted(true);

    // Close form and reset reason
    setShowReasonForm(false);
    setReason("");
  };

  // Function to fetch attendance data for a specific date
  const fetchAttendanceData = async (selectedDate) => {
    try {
      const employeeId = sessionStorage.getItem("employeeId");
      const token = getItemFromSessionStorage("token", null);

      if (!employeeId || !token) {
        toast.error("Employee ID or token not found in session storage.");
        return;
      }

      // Fix: Format date properly without timezone conversion
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      // Construct the URL in the new format: /employee/{employeeId}/month/{monthShortName}/year/{fullYear}
      const url = `${API_BASE_URL}/employee/daily/${employeeId}/${formattedDate}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Store the daily attendance data
      setDailyAttendanceData(data);

      // Update state with fetched data while preserving status and color information
      setAttendanceData((prevData) => {
        const updatedData = prevData.map((d) => {
          if (d.date.toDateString() === selectedDate.toDateString()) {
            return {
              ...d,
              // Store the new API response data
              dailyAttendanceData: data,
              // Preserve the status and other display properties
              status: d.status,
              isLate: d.isLate,
              leaveType: d.leaveType,
            };
          }
          return d;
        });
        return updatedData;
      });
    } catch (error) {
      toast.error(`Failed to fetch attendance data: ${error.message}`);
    }
  };

  // Update the onClick handler for each date
  const handleDateClick = (day) => {
    setDate(day);
    
    // Find attendance data for the selected date
    const selectedDayData = attendanceData.find(
      (d) => d.date.toDateString() === day.toDateString()
    );
    
    // Only fetch daily attendance data for present dates
    if (selectedDayData && (selectedDayData.status === "Present" || selectedDayData.status === "Present Half Day on Loss of Pay")) {
      fetchAttendanceData(day);
    } else {
      // Clear daily attendance data for non-present dates
      setDailyAttendanceData(null);
    }
  };

  const calendarDays = generateCalendarDays();

  // Helper function to format time in AM/PM
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getDayName = (dateObj) => {
    return dateObj.toLocaleDateString("en-US", { weekday: "long" });
  };

  // Helper function to parse time duration string (HH:MM:SS) to minutes
  const parseTimeDuration = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 60 + minutes + seconds / 60;
  };

  // Helper function to calculate additional time since latest checkin
  const calculateAdditionalTimeFromLatestCheckin = (latestCheckin) => {
    if (!latestCheckin) return 0;
    const latestCheckinTime = new Date(latestCheckin);
    const timeDiff = currentTime.getTime() - latestCheckinTime.getTime();
    return timeDiff / (1000 * 60); // Convert to minutes
  };

  // Helper function to format live working hours (using latestCheckin)
  const formatLiveWorkingHours = (workingHoursTillNow, latestCheckin) => {
    const baseMinutes = parseTimeDuration(workingHoursTillNow);
    const additionalMinutes = calculateAdditionalTimeFromLatestCheckin(latestCheckin);
    const totalMinutes = baseMinutes + additionalMinutes;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}h ${minutes}m`;
  };

  // Helper function to format workingHoursTillNow string to xh ym format
  const formatWorkingHoursString = (workingHoursString) => {
    if (!workingHoursString) return "0h 0m";
    const [hours, minutes, seconds] = workingHoursString.split(':').map(Number);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Content */}
        <div className="p-6 space-y-6 mt-16">
          {" "}
          {/* Increased mt-16 for more spacing */}
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Monthly Summary</CardTitle>
              <CardDescription>
                Your attendance statistics for this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {/* Present */}
                  <div className="flex flex-col bg-[#CCFFCC] p-3 rounded-lg">
                    <span className="font-medium text-green-800">
                      Present (P)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Present"] || 0}
                    </span>
                  </div>
                  {/* Approved Leave */}
                  <div className="flex flex-col bg-[#E5E5CC] p-3 rounded-lg">
                    <span className="font-medium text-yellow-800">
                      Approved Leave (AL)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Approved Leave"] || 0}
                    </span>
                  </div>
                  {/* Half Day */}
                  <div className="flex flex-col bg-[#FFFFCC] p-3 rounded-lg">
                    <span className="font-medium text-yellow-800">
                      Half Day (P/A)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Half Day"] || 0}
                    </span>
                  </div>
                  {/* Absent */}
                  <div className="flex flex-col bg-[#FFCCCC] p-3 rounded-lg">
                    <span className="font-medium text-red-900">Absent (A)</span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Absent"] || 0}
                    </span>
                  </div>
                  {/* Holiday */}
                  <div className="flex flex-col bg-[#E0E0E0] p-3 rounded-lg">
                    <span className="font-medium text-gray-700">
                      Holiday (H)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Holiday"] || 0}
                    </span>
                  </div>
                  {/* Present on Holiday */}
                  <div className="flex flex-col bg-[#5cbf85] p-3 rounded-lg">
                    <span className="font-medium text-white">
                      Present on Holiday (PH)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Present on Holiday"] || 0}
                    </span>
                  </div>
                  {/* Half Day on Holiday */}
                  <div className="flex flex-col bg-[#ffcc80] p-3 rounded-lg">
                    <span className="font-medium text-orange-800">
                      Half Day on Holiday (PH/A)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Half Day on Holiday"] || 0}
                    </span>
                  </div>
                  {/* Loss of Pay */}
                  <div className="flex flex-col bg-[#e57373] p-3 rounded-lg">
                    <span className="font-medium text-white">
                      Loss of Pay (LOP)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Loss of Pay"] || 0}
                    </span>
                  </div>
                  {/* Present Half Day on Loss of Pay */}
                  <div className="flex flex-col bg-[#A89EF6] p-3 rounded-lg">
                    <span className="font-medium text-white">
                      Present Half Day on Loss of Pay (P/LOP)
                    </span>
                    <span className="text-2xl font-bold">
                      {monthlySummary["Present Half Day on Loss of Pay"] || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Calendar */}
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">
                      Attendance Calendar
                    </CardTitle>
                    <CardDescription>
                      View and track your attendance history
                    </CardDescription>
                  </div>
                  <div className="relative" ref={calendarRef}>
                    <Badge
                      variant="outline"
                      className="px-4 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                      onClick={toggleCalendar}
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {selectedYear}-{selectedMonth}
                      </span>
                    </Badge>
                    {isCalendarOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                        {/* Existing calendar content */}
                        <div className="p-3 border-b flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-700">
                            {selectedYear}
                          </div>
                          <select
                            value={selectedYear}
                            onChange={(e) => {
                              const newYear = e.target.value;
                              setSelectedYear(newYear);

                              // Set default month based on year
                              if (newYear === "2024") {
                                setSelectedMonth("Aug");
                                // Fetch data for August 2024
                                const employeeId =
                                  sessionStorage.getItem("employeeId");
                                if (employeeId) {
                                  dispatch(
                                    fetchOneEmployeeAttendanceOneMonth({
                                      employeeId,
                                      month: "Aug",
                                      year: newYear,
                                    })
                                  );
                                }
                              } else {
                                setSelectedMonth("Jan");
                                // Fetch data for January 2025
                                const employeeId =
                                  sessionStorage.getItem("employeeId");
                                if (employeeId) {
                                  dispatch(
                                    fetchOneEmployeeAttendanceOneMonth({
                                      employeeId,
                                      month: "Jan",
                                      year: newYear,
                                    })
                                  );
                                }
                              }
                            }}
                            className="ml-2 border rounded px-2 py-1 text-sm"
                          >
                            {[2024, 2025].map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 p-3">
                          {(() => {
                            const currentYear = new Date().getFullYear();
                            const currentMonthIdx = new Date().getMonth(); // 0-based
                            let months = [
                              "Jan",
                              "Feb",
                              "Mar",
                              "Apr",
                              "May",
                              "Jun",
                              "Jul",
                              "Aug",
                              "Sep",
                              "Oct",
                              "Nov",
                              "Dec",
                            ];

                            // Determine which months to show based on year
                            let startIdx = 0;
                            let endIdx = 11;

                            if (parseInt(selectedYear) === 2024) {
                              startIdx = 7; // August (0-based)
                              endIdx = 11; // December
                            } else if (parseInt(selectedYear) === 2025) {
                              startIdx = 0; // January
                              endIdx =
                                currentYear === 2025 ? currentMonthIdx : 11;
                            }

                            return months
                              .slice(startIdx, endIdx + 1)
                              .map((month) => (
                                <button
                                  key={month}
                                  className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                                    month === selectedMonth
                                      ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                                      : "hover:bg-gray-50 text-gray-700"
                                  }`}
                                  onClick={() =>
                                    handleMonthSelection(month, selectedYear)
                                  }
                                >
                                  {month}
                                </button>
                              ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Calendar Days */}
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <p>Loading attendance data...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8  text-muted-foreground/60" />
                    <p className="text-lg font-medium">
                      Error loading attendance data
                    </p>
                    <p className="text-sm text-muted-foreground/80">{error}</p>
                  </div>
                ) : !attendance ||
                  (!attendance.days && !attendance.statusCounts) ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                    <p className="text-lg font-medium">
                      No attendance data available
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      There is no attendance data for the selected month.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 border rounded-md p-2">
                    {calendarDays.map((day, index) => {
                      // Find attendance status for the current day
                      const dayData = attendanceData.find(
                        (d) => d.date.toDateString() === day.toDateString()
                      );
                      const status = dayData?.status;
                      const dayNumber = day.getDate();

                      // Determine background color based on status
                      let bgColorClass = "hover:bg-gray-200";
                      if (dayData) {
                        switch (status) {
                          case "Present":
                            bgColorClass =
                              "bg-[#CCFFCC] hover:bg-[#B8FFB8] text-green-800";
                            break;
                          case "Approved Leave":
                            bgColorClass =
                              "bg-[#E5E5CC] hover:bg-[#D4D4B8] text-yellow-800";
                            break;
                          case "Absent":
                            bgColorClass =
                              "bg-[#FFCCCC] hover:bg-[#FFB8B8] text-red-900";
                            break;
                          case "Half Day":
                            bgColorClass =
                              "bg-[#FFFFCC] hover:bg-[#FFFFB8] text-yellow-800";
                            break;
                          case "Holiday":
                            bgColorClass =
                              "bg-[#E0E0E0] hover:bg-[#D4D4D4] text-gray-700";
                            break;
                          case "Present on Holiday":
                            bgColorClass =
                              "bg-[#5cbf85] hover:bg-[#4CAF50] text-white";
                            break;
                          case "Half Day on Holiday":
                            bgColorClass =
                              "bg-[#ffcc80] hover:bg-[#FFB74D] text-orange-800";
                            break;
                          case "Loss of Pay":
                            bgColorClass =
                              "bg-[#e57373] hover:bg-[#EF5350] text-white";
                            break;
                          case "Present Half Day on Loss of Pay":
                            bgColorClass =
                              "bg-[#A89EF6] hover:bg-[#9C7CF6] text-white";
                            break;
                          case "Weekend":
                            bgColorClass =
                              "bg-gray-300 hover:bg-gray-400 text-gray-600";
                            break;
                          case "No Data":
                            bgColorClass =
                              "bg-white hover:bg-gray-50 text-gray-400 border border-gray-200";
                            break;
                          default:
                            bgColorClass = "hover:bg-gray-200";
                        }
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => handleDateClick(day)}
                          className={`w-[6.5%] text-center p-2 cursor-pointer rounded-md transition ${bgColorClass}`}
                        >
                          {dayNumber}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Legend Table removed */}
              </CardContent>
            </Card>

            {/* Attendance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {date ? (
                    <>
                      {date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <div className="text-base font-semibold text-gray-800 mt-1">
                        {getDayName(date)}
                      </div>
                    </>
                  ) : (
                    "Select a date"
                  )}
                </CardTitle>
                <CardDescription>Attendance details</CardDescription>
              </CardHeader>
              <CardContent>
                {date ? (
                  (() => {
                    // Find attendance details for the selected date
                    const selectedDayData = attendanceData.find(
                      (d) => d.date.toDateString() === date.toDateString()
                    );

                    if (!selectedDayData) {
                      return (
                        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                          <p>No attendance data for this date.</p>
                        </div>
                      );
                    }

                    const {
                      status,
                      checkinTimes,
                      checkoutTimes,
                      totalWorkingMinutes,
                      dailyAttendanceData,
                    } = selectedDayData;

                    // Calculate total working hours
                    const totalWorkingHours = (
                      totalWorkingMinutes / 60
                    ).toFixed(1);

                    // Check if this is a present date and has daily attendance data
                    const isPresentDate = (status === "Present" || status === "Present Half Day on Loss of Pay") && (dailyAttendanceData || (date && dailyAttendanceData));
                    
                    // Get check-in and check-out times for present dates
                    const attendanceDataForDate = dailyAttendanceData || selectedDayData?.dailyAttendanceData;
                    const checkInTime = isPresentDate ? attendanceDataForDate?.firstCheckin : null;
                    const checkOutTime = isPresentDate ? attendanceDataForDate?.lastCheckout : null;
                    const workingHoursTillNow = isPresentDate ? attendanceDataForDate?.workingHoursTillNow : null;
                    
                    // Determine if employee is currently checked in (has latest check-in after last check-out)
                    const isCurrentlyCheckedIn = isPresentDate && 
                      attendanceDataForDate?.latestCheckin && 
                      attendanceDataForDate?.lastCheckout &&
                      new Date(attendanceDataForDate.latestCheckin) > new Date(attendanceDataForDate.lastCheckout);

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <span
                            className={`${
                              status === "Present"
                                ? "bg-[#CCFFCC] text-green-800"
                                : status === "Approved Leave"
                                ? "bg-[#E5E5CC] text-yellow-800"
                                : status === "Absent"
                                ? "bg-[#FFCCCC] text-red-900"
                                : status === "Half Day"
                                ? "bg-[#FFFFCC] text-yellow-800"
                                : status === "Holiday"
                                ? "bg-[#E0E0E0] text-gray-700"
                                : status === "Present on Holiday"
                                ? "bg-[#5cbf85] text-white"
                                : status === "Half Day on Holiday"
                                ? "bg-[#ffcc80] text-orange-800"
                                : status === "Loss of Pay"
                                ? "bg-[#e57373] text-white"
                                : status === "Present Half Day on Loss of Pay"
                                ? "bg-[#A89EF6] text-white"
                                : status === "No Data"
                                ? "bg-white text-gray-400 border border-gray-200"
                                : "bg-gray-100 text-gray-700"
                            } text-xs font-semibold px-2 py-1 rounded-full`}
                          >
                            {status}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Check In
                          </span>
                          <span>
                            {isPresentDate && checkInTime
                              ? formatTime(checkInTime)
                              : checkinTimes?.[0]
                              ? formatTime(checkinTimes[0])
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Check
                            Out
                          </span>
                          <span className="flex items-center gap-1">
                            {isPresentDate && isCurrentlyCheckedIn ? (
                              <>
                                <Play className="h-4 w-4 text-green-500 animate-pulse" />
                                <span className="text-green-600 font-medium">Running</span>
                              </>
                            ) : isPresentDate && checkOutTime ? (
                              formatTime(checkOutTime)
                            ) : checkoutTimes?.[0] ? (
                              formatTime(checkoutTimes[0])
                            ) : (
                              "-"
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Total Working Hours:
                          </span>
                          <span>
                            {isPresentDate && workingHoursTillNow ? (
                              isCurrentlyCheckedIn ? (
                                formatLiveWorkingHours(workingHoursTillNow, attendanceDataForDate?.latestCheckin)
                              ) : (
                                // For past days or when not currently checked in, show workingHoursTillNow in xh ym format
                                formatWorkingHoursString(workingHoursTillNow)
                              )
                            ) : (
                              `${totalWorkingHours}h`
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                    <p>Select a date to view attendance details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Reason Form Modal */}
      {showReasonForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Submit Reason for Unapproved Absence
            </h3>
            <form onSubmit={handleSubmitReason}>
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium mb-2"
                >
                  Reason for unapproved absence
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  rows="4"
                  placeholder="Please provide a reason for your unapproved absence..."
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReasonForm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-400 text-white rounded-md hover:bg-teal-500"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          <span>Reason saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default withAuth(EmployeeAttendance);