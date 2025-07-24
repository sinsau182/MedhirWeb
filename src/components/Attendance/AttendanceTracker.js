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
import { 
  markSingleEmployeeMonthAttendance, 
  markAllEmployeesDateAttendance,
  clearError,
  clearSuccess 
} from "@/redux/slices/manualAttendanceSlice";
import { toast } from "sonner";
import AttendanceTable from "./AttendanceTable";
import LeaveTable from "./LeaveTable";

function AttendanceTracker({ employees = [], employeesLoading = false, role }) {
  const dispatch = useDispatch();

  const { attendance, loading, err } = useSelector(
    (state) => state.attendances
  );

  const { loading: manualAttendanceLoading, error: manualAttendanceError, success: manualAttendanceSuccess, message: manualAttendanceMessage } = useSelector(
    (state) => state.manualAttendance
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
  
  // Single Employee Month Modal State
  const [isSingleEmployeeModalOpen, setIsSingleEmployeeModalOpen] = useState(false);
  const [selectedEmployeeForMonth, setSelectedEmployeeForMonth] = useState(null);
  const [monthAttendanceData, setMonthAttendanceData] = useState({});
  const [monthYear, setMonthYear] = useState({
    month: new Date().toLocaleString("default", { month: "long" }),
    year: new Date().getFullYear().toString()
  });

  // All Employees Date Modal State
  const [isAllEmployeesDateModalOpen, setIsAllEmployeesDateModalOpen] = useState(false);
  const [selectedDateForAll, setSelectedDateForAll] = useState(new Date().toISOString().slice(0, 10));
  const [allEmployeesAttendanceData, setAllEmployeesAttendanceData] = useState({});
  const [allEmployeesSearch, setAllEmployeesSearch] = useState("");

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
    let apiParams = { month: numericMonth, year, role };

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
  }, [dispatch, selectedMonth, selectedYear, selectedDate, selectedStatuses, role]);

  // Handle manual attendance success and error messages
  useEffect(() => {
    if (manualAttendanceSuccess) {
      toast.success(manualAttendanceMessage);
      dispatch(clearSuccess());
    }
    if (manualAttendanceError) {
      toast.error(manualAttendanceError);
      dispatch(clearError());
    }
  }, [manualAttendanceSuccess, manualAttendanceError, manualAttendanceMessage, dispatch]);

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

  // Single Employee Month Modal Functions
  const generateMonthDates = useCallback((month, year) => {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const dates = [];
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, monthIndex, i);
      dates.push({
        day: i,
        weekday: date.toLocaleString("default", { weekday: "short" }),
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isFuture: date > new Date()
      });
    }
    return dates;
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployeeForMonth(employee);
    // Initialize attendance data for the month
    const dates = generateMonthDates(monthYear.month, monthYear.year);
    const initialData = {};
    dates.forEach(({ day }) => {
      initialData[day] = "";
    });
    setMonthAttendanceData(initialData);
  };

  const setAllDaysStatus = (status) => {
    const dates = generateMonthDates(monthYear.month, monthYear.year);
    const newData = {};
    dates.forEach(({ day }) => {
      newData[day] = status;
    });
    setMonthAttendanceData(newData);
  };

  const setDayStatus = (day, status) => {
    setMonthAttendanceData(prev => ({
      ...prev,
      [day]: status
    }));
  };

  const handleSaveMonthAttendance = () => {
    if (!selectedEmployeeForMonth) {
      toast.error("Please select an employee");
      return;
    }

    // Prepare data in API format
    const presentDates = [];
    const absentDates = [];
    
    Object.entries(monthAttendanceData).forEach(([day, status]) => {
      if (status) {
        const date = new Date(monthYear.year, new Date(`${monthYear.month} 1, ${monthYear.year}`).getMonth(), parseInt(day) + 1);
        const dateString = date.toISOString().slice(0, 10);
        
        if (status === "P" || status === "PL" || status === "PH" || status === "P/A" || status === "PH/A" || status === "P/LOP") {
          presentDates.push(dateString);
        } else if (status === "A" || status === "LOP") {
          absentDates.push(dateString);
        }
      }
    });

    console.log(presentDates, absentDates);

    const attendanceData = {
      employeeIds: [selectedEmployeeForMonth.id],
      presentDates,
      absentDates
    };

    dispatch(markSingleEmployeeMonthAttendance(attendanceData)).then((result) => {
      if (!result.error) {
        setIsSingleEmployeeModalOpen(false);
        setSelectedEmployeeForMonth(null);
        setMonthAttendanceData({});
        // Refresh attendance data
        dispatch(fetchAllEmployeeAttendanceOneMonth({ 
          month: new Date(`${monthYear.month} 1, ${monthYear.year}`).getMonth() + 1, 
          year: monthYear.year, 
          role 
        }));
      }
    });
  };

  // All Employees Date Modal Functions
  const handleDateSelectForAll = (date) => {
    setSelectedDateForAll(date);
    // Initialize attendance data for all employees
    const initialData = {};
    filteredEmployees.forEach(employee => {
      initialData[employee.id] = "";
    });
    setAllEmployeesAttendanceData(initialData);
  };

  const setAllEmployeesStatus = (status) => {
    const newData = {};
    filteredEmployees.forEach(employee => {
      newData[employee.id] = status;
    });
    setAllEmployeesAttendanceData(newData);
  };

  const setEmployeeStatus = (employeeId, status) => {
    setAllEmployeesAttendanceData(prev => ({
      ...prev,
      [employeeId]: status
    }));
  };

  const handleSaveAllEmployeesAttendance = () => {
    if (!selectedDateForAll) {
      toast.error("Please select a date");
      return;
    }

    // Prepare data in API format
    const presentEmployeeIds = [];
    const absentEmployeeIds = [];
    
    Object.entries(allEmployeesAttendanceData).forEach(([employeeId, status]) => {
      if (status) {
        if (status === "P" || status === "PL" || status === "PH" || status === "P/A" || status === "PH/A" || status === "P/LOP") {
          presentEmployeeIds.push(employeeId);
        } else if (status === "A" || status === "LOP") {
          absentEmployeeIds.push(employeeId);
        }
      }
    });

    // Create separate API calls for present and absent employees to avoid conflicts
    const promises = [];
    
    if (presentEmployeeIds.length > 0) {
      const presentData = {
        employeeIds: presentEmployeeIds,
        presentDates: [selectedDateForAll],
        absentDates: []
      };
      promises.push(dispatch(markAllEmployeesDateAttendance(presentData)));
    }
    
    if (absentEmployeeIds.length > 0) {
      const absentData = {
        employeeIds: absentEmployeeIds,
        presentDates: [],
        absentDates: [selectedDateForAll]
      };
      promises.push(dispatch(markAllEmployeesDateAttendance(absentData)));
    }

    // If no employees are marked, show error
    if (promises.length === 0) {
      toast.error("Please mark attendance for at least one employee");
      return;
    }

    // Execute all API calls
    Promise.all(promises).then((results) => {
      const hasError = results.some(result => result.error);
      if (!hasError) {
        setIsAllEmployeesDateModalOpen(false);
        setAllEmployeesAttendanceData({});
        setAllEmployeesSearch("");
        toast.success("Attendance marked successfully for all employees");
        // Refresh attendance data
        dispatch(fetchAllEmployeeAttendanceOneMonth({ 
          month: new Date(selectedDateForAll).getMonth() + 1, 
          year: new Date(selectedDateForAll).getFullYear(), 
          role 
        }));
      }
    });
  };

  const filteredEmployeesForModal = useMemo(() => {
    return filteredEmployees.filter(employee =>
      employee.name.toLowerCase().includes(allEmployeesSearch.toLowerCase()) ||
      employee.id.toLowerCase().includes(allEmployeesSearch.toLowerCase()) ||
      (employee.department && employee.department.toLowerCase().includes(allEmployeesSearch.toLowerCase()))
    );
  }, [filteredEmployees, allEmployeesSearch]);

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

      {/* Manual Attendance Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-300"
          onClick={() => setIsSingleEmployeeModalOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Single Employee Month</span>
        </button>
        
        <button
          className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          onClick={() => setIsAllEmployeesDateModalOpen(true)}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>All Employees Date</span>
        </button>
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

      {/* Single Employee Month Modal */}
      {isSingleEmployeeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h2 className="text-xl font-bold">Single Employee Month Attendance</h2>
              </div>
              <button
                onClick={() => {
                  setIsSingleEmployeeModalOpen(false);
                  setSelectedEmployeeForMonth(null);
                  setMonthAttendanceData({});
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Step 1: Employee Selection */}
              {!selectedEmployeeForMonth ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Step 1: Select Employee</h3>
                    <p className="text-gray-600">Choose an employee to mark attendance for the entire month</p>
                  </div>
                  
                  {/* Employee Search */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search employees..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      onChange={(e) => {
                        // TODO: Implement search functionality
                      }}
                    />
                    <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>

                  {/* Employee List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {filteredEmployees.map((employee) => (
                      <div
                        key={employee.id}
                        onClick={() => handleEmployeeSelect(employee)}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-purple-600 font-semibold text-sm">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">{employee.name}</h4>
                            <p className="text-sm text-gray-600 truncate">{employee.id}</p>
                            <p className="text-xs text-gray-500 truncate">{employee.department}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Step 2: Month Selection and Attendance Marking */
                <div className="space-y-6">
                  {/* Selected Employee Info */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                          <span className="text-purple-700 font-bold text-lg">
                            {selectedEmployeeForMonth.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800">{selectedEmployeeForMonth.name}</h3>
                          <p className="text-sm text-gray-600">{selectedEmployeeForMonth.id} • {selectedEmployeeForMonth.department}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedEmployeeForMonth(null)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Change Employee
                      </button>
                    </div>
                  </div>

                  {/* Month/Year Selection */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                      <select
                        value={monthYear.month}
                        onChange={(e) => setMonthYear(prev => ({ ...prev, month: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {[
                          "January", "February", "March", "April", "May", "June",
                          "July", "August", "September", "October", "November", "December"
                        ].map(month => (
                          <option key={month} value={month}>{month}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <select
                        value={monthYear.year}
                        onChange={(e) => setMonthYear(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {[2024, 2025].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3">Quick Actions</h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => setAllDaysStatus("P")}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                      >
                        All Present
                      </button>
                      <button
                        onClick={() => setAllDaysStatus("A")}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                      >
                        All Absent
                      </button>
                      <button
                        onClick={() => setAllDaysStatus("")}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Mark Attendance for {monthYear.month} {monthYear.year}</h4>
                    <div className="grid grid-cols-7 gap-2">
                      {/* Day Headers */}
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                          {day}
                        </div>
                      ))}
                      
                      {/* Calendar Days */}
                      {generateMonthDates(monthYear.month, monthYear.year).map(({ day, weekday, isWeekend, isFuture }) => (
                        <div
                          key={day}
                          className={`p-2 border rounded-lg text-center cursor-pointer transition-all duration-200 ${
                            isFuture 
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                              : isWeekend 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'bg-white border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">{day}</div>
                          <div className="text-xs text-gray-500 mb-2">{weekday}</div>
                          {!isFuture && (
                            <select
                              value={monthAttendanceData[day] || ""}
                              onChange={(e) => setDayStatus(day, e.target.value)}
                              className={`w-full text-xs p-1 rounded border ${
                                monthAttendanceData[day] === "P" ? "bg-green-100 border-green-300" :
                                monthAttendanceData[day] === "A" ? "bg-red-100 border-red-300" :
                                monthAttendanceData[day] === "P/A" ? "bg-yellow-100 border-yellow-300" :
                                monthAttendanceData[day] === "H" ? "bg-gray-100 border-gray-300" :
                                "bg-white border-gray-300"
                              }`}
                            >
                              <option value="">-</option>
                              <option value="P">Present</option>
                              <option value="A">Absent</option>
                              {/* <option value="P/A">Half Day</option>
                              <option value="H">Holiday</option>
                              <option value="LOP">LOP</option> */}
                            </select>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedEmployeeForMonth && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  {Object.values(monthAttendanceData).filter(status => status !== "").length} days marked
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setIsSingleEmployeeModalOpen(false);
                      setSelectedEmployeeForMonth(null);
                      setMonthAttendanceData({});
                    }}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveMonthAttendance}
                    disabled={manualAttendanceLoading}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {manualAttendanceLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Attendance"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All Employees Date Modal */}
      {isAllEmployeesDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 className="text-xl font-bold">All Employees Date Attendance</h2>
              </div>
              <button
                onClick={() => {
                  setIsAllEmployeesDateModalOpen(false);
                  setAllEmployeesAttendanceData({});
                  setAllEmployeesSearch("");
                }}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Date Selection */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Select Date</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                      <input
                        type="date"
                        value={selectedDateForAll}
                        onChange={(e) => handleDateSelectForAll(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Cannot select future dates</p>
                    </div>
                    <div className="flex items-end">
                      <div className="bg-blue-200 p-3 rounded-lg">
                        <div className="text-blue-800 font-bold text-lg">
                          {new Date(selectedDateForAll).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="text-blue-700 text-sm">
                          {new Date(selectedDateForAll).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bulk Actions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Quick Actions for All Employees</h4>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setAllEmployeesStatus("P")}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      All Present
                    </button>
                    <button
                      onClick={() => setAllEmployeesStatus("A")}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      All Absent
                    </button>
                    <button
                      onClick={() => setAllEmployeesStatus("")}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5a2 2 0 002 2h5m5 9v-5a2 2 0 00-2-2h-5" />
                      </svg>
                      Clear All
                    </button>
                  </div>
                </div>

                {/* Employee Search */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={allEmployeesSearch}
                    onChange={(e) => setAllEmployeesSearch(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Employees List */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Mark Attendance for {filteredEmployeesForModal.length} Employee{filteredEmployeesForModal.length !== 1 ? 's' : ''}
                  </h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {filteredEmployeesForModal.map((employee) => (
                      <div
                        key={employee.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {employee.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 truncate">{employee.name}</h4>
                            <p className="text-sm text-gray-600 truncate">{employee.id}</p>
                            <p className="text-xs text-gray-500 truncate">{employee.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={allEmployeesAttendanceData[employee.id] || ""}
                            onChange={(e) => setEmployeeStatus(employee.id, e.target.value)}
                            className={`px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              allEmployeesAttendanceData[employee.id] === "P" ? "bg-green-100 border-green-300" :
                              allEmployeesAttendanceData[employee.id] === "A" ? "bg-red-100 border-red-300" :
                              allEmployeesAttendanceData[employee.id] === "P/A" ? "bg-yellow-100 border-yellow-300" :
                              allEmployeesAttendanceData[employee.id] === "H" ? "bg-gray-100 border-gray-300" :
                              allEmployeesAttendanceData[employee.id] === "LOP" ? "bg-orange-100 border-orange-300" :
                              "bg-white border-gray-300"
                            }`}
                          >
                            <option value="">-</option>
                            <option value="P">Present</option>
                            <option value="A">Absent</option>
                            {/* <option value="P/A">Half Day</option>
                            <option value="H">Holiday</option>
                            <option value="LOP">LOP</option> */}
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                {Object.values(allEmployeesAttendanceData).filter(status => status !== "").length} of {filteredEmployeesForModal.length} employees marked
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setIsAllEmployeesDateModalOpen(false);
                    setAllEmployeesAttendanceData({});
                    setAllEmployeesSearch("");
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                                  <button
                    onClick={handleSaveAllEmployeesAttendance}
                    disabled={manualAttendanceLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {manualAttendanceLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      "Save Attendance"
                    )}
                  </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceTracker; 