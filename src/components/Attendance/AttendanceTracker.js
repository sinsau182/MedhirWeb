import React, {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { Search, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import AttendanceTable from "./AttendanceTable";
import LeaveTable from "./LeaveTable";

function AttendanceTracker({ employees = [], employeesLoading = false }) {
  const dispatch = useDispatch();

  const { attendance, loading, err } = useSelector(
    (state) => state.attendances
  );

  // State variables
  const [searchInput, setSearchInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("default", { month: "long" })
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [dates, setDates] = useState([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusFilterRef = useRef(null);
  const calendarRef = useRef(null);
  const departmentFilterRef = useRef(null);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [isDepartmentFilterOpen, setIsDepartmentFilterOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Constants/Options
  const statusOptions = [
    { value: "P", label: "Present", color: "#CCFFCC" },
    { value: "PL", label: "Present with Leave", color: "#E5E5CC" },
    { value: "PH", label: "Present on Holiday", color: "#5cbf85" },
    { value: "P/A", label: "Half Day", color: "#FFFFCC" },
    { value: "PH/A", label: "Half Day on Holiday", color: "#ffcc80" },
    { value: "A", label: "Absent", color: "#FFCCCC" },
    { value: "LOP", label: "Loss of Pay", color: "#e57373" },
    { value: "H", label: "Holiday", color: "#E0E0E0" },
    {
      value: "P/LOP",
      label: "Present Half Day on Loss of Pay",
      color: "#A89EF6",
    },
  ];

  // Combined useEffect for click outside handling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target)
      ) {
        setIsStatusFilterOpen(false);
      }

      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target)
      ) {
        setIsCalendarOpen(false);
      }

      if (
        departmentFilterRef.current &&
        !departmentFilterRef.current.contains(event.target)
      ) {
        setIsDepartmentFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Effects
  useEffect(() => {
    try {
      const generateDates = () => {
        const dates = [];
        const monthIndex = new Date(
          `${selectedMonth} 1, ${selectedYear}`
        ).getMonth();
        const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(selectedYear, monthIndex, i);
          dates.push({
            day: i,
            weekday: date.toLocaleString("default", { weekday: "short" }),
          });
        }
        return dates;
      };
      setDates(generateDates());
    } catch (err) {
      setError("Error generating dates");
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    // Convert month name to numeric month (1-12)
    const monthIndex = new Date(
      `${selectedMonth} 1, ${selectedYear}`
    ).getMonth();
    const numericMonth = monthIndex + 1; // getMonth() returns 0-11, so add 1
    const year = selectedYear;

    const today = new Date();
    const currentDay = today.getDate();

    // Prepare API parameters
    let apiParams = { month: numericMonth, year };

    // If no date is selected, use current date
    let dateToUse = selectedDate;
    if (dateToUse === null) {
      dateToUse = currentDay;
    }

    // Add date parameter
    apiParams.date = dateToUse;

    // Add status filter if any statuses are selected
    if (selectedStatuses.length > 0) {
      apiParams.status = selectedStatuses.join(",");
    }

    dispatch(fetchAllEmployeeAttendanceOneMonth(apiParams));
  }, [dispatch, selectedMonth, selectedYear, selectedDate, selectedStatuses]);

  // Callbacks
  const generateAttendanceData = useCallback(
    (employee) => {
      const attendanceRecord = Array.isArray(attendance)
        ? attendance.find((record) => record.employeeId === employee.employeeId)
        : null;

      if (!attendanceRecord) {
        return {
          id: employee.employeeId,
          name: employee.name,
          department: employee.departmentName,
          p_twd: "0/0",
          attendance: Array(dates.length).fill({ value: null, label: "" }),
        };
      }

      // Helper function to determine attendance status for a given date
      const getAttendanceStatusForDate = (dateString) => {
        const attendanceData = attendanceRecord.attendance;
        if (!attendanceData) return null;

        // Check present dates
        if (attendanceData.presentDates?.includes(dateString)) {
          return "P";
        }

        // Check full leave dates
        if (attendanceData.fullLeaveDates?.includes(dateString)) {
          return "PL";
        }

        // Check half day leave dates
        if (attendanceData.halfDayLeaveDates?.includes(dateString)) {
          return "P/A";
        }

        // Check full comp-off dates
        if (attendanceData.fullCompoffDates?.includes(dateString)) {
          return "P";
        }

        // Check half comp-off dates
        if (attendanceData.halfCompoffDates?.includes(dateString)) {
          return "P/A";
        }

        // Check weekly off dates
        if (attendanceData.weeklyOffDates?.includes(dateString)) {
          return "H";
        }

        // Check absent dates
        if (attendanceData.absentDates?.includes(dateString)) {
          return "A";
        }

        return null;
      };

      const attendanceArray = Array(dates.length)
        .fill(null)
        .map((_, index) => {
          const day = index + 1;
          const monthIndex = new Date(
            `${selectedMonth} 1, ${selectedYear}`
          ).getMonth();
          const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(
            2,
            "0"
          )}-${String(day).padStart(2, "0")}`;

          const status = getAttendanceStatusForDate(dateString);

          if (!status) {
            return { value: null, label: "" };
          }

          let value;
          switch (status.toUpperCase()) {
            case "P":
              value = true;
              break;
            case "PL":
              value = true;
              break;
            case "A":
              value = false;
              break;
            case "P/A":
              value = "half";
              break;
            case "H":
              value = "holiday";
              break;
            case "PH":
              value = "holiday";
              break;
            case "PH/A":
              value = "half";
              break;
            case "LOP":
              value = "absent";
              break;
            case "P/LOP":
              value = "present";
              break;
            default:
              value = null;
          }
          return { value, label: status };
        });

      return {
        id: employee.employeeId,
        name: employee.name,
        department: employee.departmentName,
        p_twd: `${attendanceRecord.payableDays || 0}/${
          attendanceRecord.workingDays || 0
        }`,
        attendance: attendanceArray,
      };
    },
    [dates.length, attendance, selectedMonth, selectedYear]
  );

  const generateLeaveData = useCallback(
    (employee) => {
      const attendanceRecord = Array.isArray(attendance)
        ? attendance.find((record) => record.employeeId === employee.employeeId)
        : null;

      if (!attendanceRecord) {
        return {
          id: employee.employeeId,
          name: employee.name,
          department: employee.departmentName || "",
          noOfPayableDays: "0",
          leavesTaken: "0",
          leavesEarned: "0",
          leavesFromPreviousYear: "0",
          compOffEarned: "0",
          compOffCarriedForward: "0",
          netLeaves: "0",
        };
      }

      return {
        id: employee.employeeId,
        name: employee.name,
        department:
          attendanceRecord.departmentName || employee.departmentName || "",
      };
    },
    [attendance]
  );

  const getAttendanceColor = useCallback((status) => {
    if (status === null) return "bg-gray-100";
    const upperStatus = status.toUpperCase();
    if (upperStatus === "P") return "bg-[#CCFFCC]";
    if (upperStatus === "PL") return "bg-[#E5E5CC]";
    if (upperStatus === "P/A") return "bg-[#FFFFCC]";
    if (upperStatus === "A") return "bg-[#FFCCCC]";
    if (upperStatus === "H") return "bg-[#E0E0E0]";
    if (upperStatus === "PH") return "bg-[#5cbf85]";
    if (upperStatus === "PH/A") return "bg-[#ffcc80]";
    if (upperStatus === "LOP") return "bg-[#e57373]";
    if (upperStatus === "P/LOP") return "bg-[#A89EF6]";
    if (upperStatus === "WEEKEND") return "bg-gray-300";
    return "";
  }, []);

  const toggleStatus = useCallback((status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  }, []);

  const handleDateClick = useCallback((day) => {
    setSelectedDate((prevDate) => (prevDate === day ? null : day));
    setSelectedEmployeeId(null);
  }, []);

  const toggleDepartment = useCallback((department) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  }, []);

  const toggleCalendar = useCallback(
    () => setIsCalendarOpen(!isCalendarOpen),
    [isCalendarOpen]
  );

  const handleMonthSelection = useCallback((month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
    setSelectedDate(null);
    setSelectedEmployeeId(null);
  }, []);

  const handleEmployeeRowClick = useCallback((employeeId) => {
    setSelectedEmployeeId((prevId) =>
      prevId === employeeId ? null : employeeId
    );
    setSelectedDate(null);
  }, []);

  // Memoized values
  const filteredEmployees = useMemo(
    () =>
      employees
        .filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.employeeId
              .toLowerCase()
              .includes(searchInput.toLowerCase()) ||
            (employee.departmentName &&
              employee.departmentName
                .toLowerCase()
                .includes(searchInput.toLowerCase()))
        )
        .map(generateAttendanceData),
    [searchInput, employees, generateAttendanceData]
  );

  const departmentOptions = useMemo(() => {
    const departments = new Set();
    employees.forEach((employee) => {
      if (employee.departmentName) {
        departments.add(employee.departmentName);
      }
    });
    return Array.from(departments).map((dept) => ({
      value: dept,
      label: dept,
    }));
  }, [employees]);

  const filteredAndSearchedLeaveData = useMemo(() => {
    let data = employees.map(generateLeaveData);

    if (selectedDepartments.length > 0) {
      data = data.filter((leave) =>
        selectedDepartments.includes(leave.department)
      );
    }

    if (searchInput) {
      data = data.filter(
        (leave) =>
          leave.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          leave.id.toLowerCase().includes(searchInput.toLowerCase()) ||
          (leave.department &&
            leave.department.toLowerCase().includes(searchInput.toLowerCase()))
      );
    }

    return data;
  }, [searchInput, selectedDepartments, employees, generateLeaveData]);

  const calculateAttendanceSummary = useCallback(
    (employeesData, dateToSummarize = null) => {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalHalfDay = 0;
      let totalHoliday = 0;
      let totalPresentOnHoliday = 0;
      let totalHalfDayOnHoliday = 0;
      let totalLOP = 0;
      let totalPresentOnLOP = 0;
      let totalPresentWithLeave = 0;

      const dataForSummary =
        dateToSummarize !== null
          ? employeesData.filter((employee) => {
              const dayIndex = dateToSummarize - 1;
              return (
                employee.attendance &&
                employee.attendance.length > dayIndex &&
                employee.attendance[dayIndex].label !== null
              );
            })
          : employeesData;

      dataForSummary.forEach((employee) => {
        if (dateToSummarize !== null) {
          const dayIndex = dateToSummarize - 1;
          if (employee.attendance && employee.attendance.length > dayIndex) {
            const att = employee.attendance[dayIndex];
            switch (att.label.toUpperCase()) {
              case "P":
                totalPresent++;
                break;
              case "PL":
                totalPresentWithLeave++;
                break;
              case "A":
                totalAbsent++;
                break;
              case "P/A":
                totalHalfDay++;
                break;
              case "H":
                totalHoliday++;
                break;
              case "PH":
                totalPresentOnHoliday++;
                break;
              case "PH/A":
                totalHalfDayOnHoliday++;
                break;
              case "LOP":
                totalLOP++;
                break;
              case "P/LOP":
                totalPresentOnLOP++;
                break;
            }
          }
        } else {
          employee.attendance.forEach((att) => {
            if (att.label !== null && att.label !== "") {
              switch (att.label.toUpperCase()) {
                case "P":
                  totalPresent++;
                  break;
                case "PL":
                  totalPresentWithLeave++;
                  break;
                case "A":
                  totalAbsent++;
                  break;
                case "P/A":
                  totalHalfDay++;
                  break;
                case "H":
                  totalHoliday++;
                  break;
                case "PH":
                  totalPresentOnHoliday++;
                  break;
                case "PH/A":
                  totalHalfDayOnHoliday++;
                  break;
                case "LOP":
                  totalLOP++;
                  break;
                case "P/LOP":
                  totalPresentOnLOP++;
                  break;
              }
            }
          });
        }
      });

      return {
        totalPresent,
        totalAbsent,
        totalHalfDay,
        totalHoliday,
        totalPresentOnHoliday,
        totalHalfDayOnHoliday,
        totalLOP,
        totalPresentOnLOP,
        totalPresentWithLeave,
      };
    },
    []
  );

  const calculateLeaveSummary = useCallback(() => {
    let totalLeavesTaken = 0;
    let totalLeavesEarned = 0;
    let totalNetLeaveBalance = 0;

    filteredAndSearchedLeaveData.forEach((leave) => {
      totalLeavesTaken += parseFloat(leave.leavesTaken);
      totalLeavesEarned += parseFloat(leave.leavesEarned);
      totalNetLeaveBalance += parseFloat(leave.netLeaves);
    });

    return {
      totalLeavesTaken: totalLeavesTaken.toFixed(1),
      totalLeavesEarned: totalLeavesEarned.toFixed(1),
      totalNetLeaveBalance: totalNetLeaveBalance.toFixed(1),
    };
  }, [filteredAndSearchedLeaveData]);

  const currentDay = today.getDate();
  const currentMonthShort = today.toLocaleString("default", { month: "short" });
  const currentYearFull = today.getFullYear().toString();

  const summaryDate =
    selectedDate !== null
      ? selectedDate
      : selectedMonth.slice(0, 3) === currentMonthShort &&
        selectedYear === currentYearFull
      ? currentDay
      : null;

  const summary = useMemo(() => {
    if (selectedEmployeeId) {
      const emp = filteredEmployees.find((e) => e.id === selectedEmployeeId);
      if (!emp) return calculateAttendanceSummary([], null);
      return calculateAttendanceSummary([emp], null);
    } else {
      return calculateAttendanceSummary(filteredEmployees, summaryDate);
    }
  }, [filteredEmployees, calculateAttendanceSummary, summaryDate, selectedEmployeeId]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 mt-16">
      {/* Header with Search and Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Attendance Management
        </h1>
        {/* Calendar */}
        <div className="relative ml-auto" ref={calendarRef}>
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
              <div className="p-3 border-b flex justify-between items-center">
                <div className="text-sm font-medium text-gray-700">
                  {selectedYear}
                </div>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    if (e.target.value === "2024") {
                      setSelectedMonth("Aug");
                    } else {
                      setSelectedMonth("Jan");
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
                  const currentMonthIdx = new Date().getMonth();
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
                  let startIdx = 0;
                  let endIdx = 11;
                  if (parseInt(selectedYear) === 2024) {
                    startIdx = 7;
                    endIdx = 11;
                  } else if (parseInt(selectedYear) === 2025) {
                    startIdx = 0;
                    endIdx = currentYear === 2025 ? currentMonthIdx : 11;
                  }
                  return months.slice(startIdx, endIdx + 1).map((month) => (
                    <button
                      key={month}
                      className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                        month === selectedMonth.slice(0, 3)
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

      {/* Tabs */}
      <div className="flex gap-6 mb-6">
        {["Attendance Tracker", "Leave Tracker"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Conditionally render based on active tab */}
      {activeTab === "Attendance Tracker" ? (
        <AttendanceTable
          dates={dates}
          statusOptions={statusOptions}
          selectedStatuses={selectedStatuses}
          isStatusFilterOpen={isStatusFilterOpen}
          toggleStatus={toggleStatus}
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedDate={selectedDate}
          handleDateClick={handleDateClick}
          filteredEmployees={filteredEmployees}
          getAttendanceColor={getAttendanceColor}
          attendance={attendance}
          summaryDate={summaryDate}
          summary={summary}
          selectedEmployeeId={selectedEmployeeId}
          handleEmployeeRowClick={handleEmployeeRowClick}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          statusFilterRef={statusFilterRef}
          setIsStatusFilterOpen={setIsStatusFilterOpen}
        />
      ) : (
        <LeaveTable
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          departmentOptions={departmentOptions}
          selectedDepartments={selectedDepartments}
          isDepartmentFilterOpen={isDepartmentFilterOpen}
          toggleDepartment={toggleDepartment}
          filteredAndSearchedLeaveData={filteredAndSearchedLeaveData}
          calculateLeaveSummary={calculateLeaveSummary}
          selectedEmployeeId={selectedEmployeeId}
          setSelectedEmployeeId={setSelectedEmployeeId}
          departmentFilterRef={departmentFilterRef}
          setIsDepartmentFilterOpen={setIsDepartmentFilterOpen}
          setSelectedDepartments={setSelectedDepartments}
        />
      )}
    </div>
  );
}

export default AttendanceTracker; 