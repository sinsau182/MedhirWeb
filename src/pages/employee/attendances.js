import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, X, Clock, CalendarIcon } from "lucide-react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';

const EmployeeAttendance = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [date, setDate] = useState(null); // State to manage selected date
  const [attendanceData, setAttendanceData] = useState([]); // <-- Add state for attendance data
  const [showReasonForm, setShowReasonForm] = useState(false); // State to control reason form visibility
  const [reason, setReason] = useState(""); // State to store the reason
  const [showToast, setShowToast] = useState(false); // State to control toast visibility
  const [reasonSubmitted, setReasonSubmitted] = useState(false); // State to track if reason was submitted

  // Simulate fetching attendance data
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    // Sample data - replace with actual API call
    const sampleData = [
      {
        date: new Date(year, month, 1),
        status: "Present",
        isLate: false,
        checkIn: "08:55 AM",
        checkOut: "06:00 PM",
        leaveType: null,
      },
      {
        date: new Date(year, month, 2),
        status: "Present",
        isLate: false,
        checkIn: "08:50 AM",
        checkOut: "06:05 PM",
        leaveType: null,
      },
      {
        date: new Date(year, month, 3),
        status: "Present",
        isLate: false,
        checkIn: null,
        checkOut: null,
        leaveType: "Half Day",
      },
      {
        date: new Date(year, month, 4),
        status: "Absent",
        isLate: false,
        checkIn: null,
        checkOut: null,
        leaveType: null,
      },
      {
        date: new Date(year, month, 5),
        status: "On Leave",
        isLate: false,
        checkIn: null,
        checkOut: null,
        leaveType: "Full Day",
      },
      {
        date: new Date(year, month, 6),
        status: "Weekend",
        isLate: false,
        checkIn: null,
        checkOut: null,
        leaveType: null,
      },
      {
        date: new Date(year, month, 7),
        status: "Weekend",
        isLate: false,
        checkIn: null,
        checkOut: null,
        leaveType: null,
      },
      {
        date: new Date(year, month, 15),
        status: "Holiday",
        isLate: false,
        checkIn: null,
        checkOut: null,
        leaveType: null,
      },
      // Add more sample data as needed
    ];
    setAttendanceData(sampleData);
  }, []);

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
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
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
      const employeeId = "EMP001";
      const date = new Date(
        selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];

      const url = `http://localhost:8082/attendance/daily-attendance/${employeeId}/${date}`;
      const token = getItemFromSessionStorage("token", null);

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
      
      // Update state with fetched data while preserving status and color information
      setAttendanceData((prevData) => {
        const updatedData = prevData.map((d) => {
          if (d.date.toDateString() === selectedDate.toDateString()) {
            return {
              ...d,
              checkinTimes: data.checkinTimes || d.checkinTimes,
              checkoutTimes: data.checkoutTimes || d.checkoutTimes,
              totalWorkingMinutes: data.totalWorkingMinutes || d.totalWorkingMinutes,
              // Preserve the status and other display properties
              status: d.status,
              isLate: d.isLate,
              leaveType: d.leaveType
            };
          }
          return d;
        });
        return updatedData;
      });
    } catch (error) {
      toast.error(
        `Failed to fetch attendance data: ${error.message}`
      );
    }
  };

  // Update the onClick handler for each date
  const handleDateClick = (day) => {
    setDate(day);
    fetchAttendanceData(day);
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

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
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
                <div className="flex w-full h-24 rounded-lg overflow-hidden border border-gray-200">
                  {/* Simple Present - Dark Green */}
                  <div className="flex-1 bg-green-700 p-4 text-white">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Simple Present</h3>
                        <p className="text-2xl font-bold mt-1">18</p>
                      </div>
                      <div className="text-xs opacity-80">
                        Regular attendance days
                      </div>
                    </div>
                  </div>

                  {/* Present with Approved Leave - Light Green */}
                  <div className="flex-1 bg-green-400 p-4 text-white border-l border-white">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-sm font-medium">
                          Present with Approved Leave
                        </h3>
                        <p className="text-2xl font-bold mt-1">3</p>
                      </div>
                      <div className="text-xs opacity-80">
                        Half-day or approved leave
                      </div>
                    </div>
                  </div>

                  {/* Approved LOP - Yellow */}
                  <div className="flex-1 bg-yellow-200 p-4 text-gray-800 border-l border-gray-300">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-sm font-medium">Approved LOP</h3>
                        <p className="text-2xl font-bold mt-1">2</p>
                      </div>
                      <div className="text-xs opacity-80">Loss of pay days</div>
                    </div>
                  </div>

                  {/* Unapproved Absence - Red */}
                  <div className="flex-1 bg-red-200 p-4 text-gray-800 border-l border-gray-300">
                    <div className="flex flex-col h-full justify-between">
                      <div>
                        <h3 className="text-sm font-medium">
                          Unapproved Absence
                        </h3>
                        <p className="text-2xl font-bold mt-1">1</p>
                      </div>
                      <div className="text-xs opacity-80">
                        Unauthorized absences
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Calendar */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Attendance Calendar</CardTitle>
                <CardDescription>
                  View and track your attendance history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Calendar Days */}
                <div className="flex flex-wrap gap-1 border rounded-md p-2">
                  {calendarDays.map((day, index) => {
                    // Find attendance status for the current day
                    const dayData = attendanceData.find(
                      (d) => d.date.toDateString() === day.toDateString()
                    );
                    const isLate = dayData?.isLate;
                    const status = dayData?.status;
                    const dayNumber = day.getDate();

                    // Determine background color based on date and status
                    let bgColorClass = "hover:bg-gray-200"; // Default hover

                    if (dayData) {
                      if (status === "Present" && !dayData.leaveType) {
                        bgColorClass =
                          "bg-green-700 hover:bg-green-800 text-white";
                      } else if (status === "Present" && dayData.leaveType) {
                        bgColorClass =
                          "bg-green-400 hover:bg-green-500 text-white";
                      } else if (status === "On Leave") {
                        bgColorClass =
                          "bg-yellow-200 hover:bg-yellow-300 text-gray-800";
                      } else if (status === "Absent") {
                        bgColorClass =
                          "bg-red-200 hover:bg-red-300 text-gray-800";
                      } else if (status === "Weekend") {
                        bgColorClass =
                          "bg-gray-300 hover:bg-gray-400 text-gray-800";
                      } else if (status === "Holiday") {
                        bgColorClass =
                          "bg-gray-400 hover:bg-gray-500 text-gray-800";
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
              </CardContent>
            </Card>

            {/* Attendance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {date
                    ? date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select a date"}
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
                    } = selectedDayData;

                    // Calculate total working hours
                    const totalWorkingHours = (
                      totalWorkingMinutes / 60
                    ).toFixed(1);

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <span
                            className={`$ {
                            status === 'Present' ? 'bg-green-700 text-white' :
                            status === 'On Leave' ? 'bg-yellow-400 text-white' :
                            'bg-red-500 text-white'
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
                            {checkinTimes?.[0]
                              ? formatTime(checkinTimes[0])
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" /> Check
                            Out
                          </span>
                          <span>
                            {checkoutTimes?.[0]
                              ? formatTime(checkoutTimes[0])
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            Total Working Hours:
                          </span>
                          <span>{totalWorkingHours} hours</span>
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
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          <span>Reason saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default withAuth(EmployeeAttendance);
