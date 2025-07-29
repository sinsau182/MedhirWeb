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
import {
  fetchAllEmployeeAttendanceOneMonth,
  fetchOneEmployeeAttendanceOneMonth,
} from "@/redux/slices/attendancesSlice";
import { 
  markSingleEmployeeMonthAttendance, 
  markAllEmployeesDateAttendance,
  markManualAttendance,
  clearError,
  clearSuccess,
} from "@/redux/slices/manualAttendanceSlice";
import { toast } from "sonner";
import AttendanceTable from "./AttendanceTable";
import LeaveTable from "./LeaveTable";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

// Utility to convert dateStatusMap to API payload for markManualAttendance (all 9 statuses)
function buildManualAttendancePayload(employeeId, dateStatusMap) {
  return {
    employeeId,
    dateStatusMap,
  };
}

function AttendanceTracker({ employees = [], employeesLoading = false, role }) {
  const dispatch = useDispatch();

  const { attendance, loading, err } = useSelector(
    (state) => state.attendances
  );

  const {
    loading: manualAttendanceLoading,
    error: manualAttendanceError,
    success: manualAttendanceSuccess,
    message: manualAttendanceMessage,
  } = useSelector((state) => state.manualAttendance);

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
  
  // Separate state for Single Employee Month Modal dropdowns
  const [singleEmployeeMarkAsStatus, setSingleEmployeeMarkAsStatus] =
    useState("");
  const [singleEmployeeApplyToScope, setSingleEmployeeApplyToScope] =
    useState("");
  
  // Separate state for All Employees Date Modal dropdowns
  const [allEmployeesMarkAsStatus, setAllEmployeesMarkAsStatus] = useState("");
  const [allEmployeesApplyToScope, setAllEmployeesApplyToScope] = useState("");
  
  // Add state for employee dropdown
  const [employeeDropdownSearch, setEmployeeDropdownSearch] = useState("");
  const [employeeDropdownInput, setEmployeeDropdownInput] = useState("");

  // Add state for employee selection dropdown
  const [isEmployeeDropdownOpen, setIsEmployeeDropdownOpen] = useState(false);
  const employeeDropdownRef = useRef(null);
  
  // Attendance cell popover state
  const [cellPopoverOpen, setCellPopoverOpen] = useState(false);
  const [cellPopoverEmployee, setCellPopoverEmployee] = useState(null);
  const [cellPopoverDate, setCellPopoverDate] = useState(null);
  const [cellPopoverStatus, setCellPopoverStatus] = useState("");
  const [cellPopoverPosition, setCellPopoverPosition] = useState({
    top: 0,
    left: 0,
  });
  const cellPopoverAnchorRef = useRef(null);
  const [popoverOpenCell, setPopoverOpenCell] = useState(null);
  
  // Universal close function for all modals and popups
  const closeAllModals = () => {
    setIsSingleEmployeeModalOpen(false);
    setIsAllEmployeesDateModalOpen(false);
    setSelectedEmployeeForMonth(null);
    setMonthAttendanceData({});
    setAllEmployeesAttendanceData({});
    setAllEmployeesSearch("");
    setSingleEmployeeMarkAsStatus("");
    setSingleEmployeeApplyToScope("");
    setAllEmployeesMarkAsStatus("");
    setAllEmployeesApplyToScope("");
    setEmployeeDropdownSearch("");
    setEmployeeDropdownInput("");
    setIsEmployeeDropdownOpen(false);
    setIsCalendarOpen(false);
    setIsStatusFilterOpen(false);
    setIsDepartmentFilterOpen(false);
    setPopoverOpenCell(null);
    setCellPopoverOpen(false);
  };
  
  // Single Employee Month Modal State
  const [isSingleEmployeeModalOpen, setIsSingleEmployeeModalOpen] =
    useState(false);
  const [selectedEmployeeForMonth, setSelectedEmployeeForMonth] =
    useState(null);
  const [monthAttendanceData, setMonthAttendanceData] = useState({});
  const [monthYear, setMonthYear] = useState({
    month: new Date().toLocaleString("default", { month: "long" }),
    year: new Date().getFullYear().toString(),
  });

  // All Employees Date Modal State
  const [isAllEmployeesDateModalOpen, setIsAllEmployeesDateModalOpen] =
    useState(false);
  const [selectedDateForAll, setSelectedDateForAll] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [allEmployeesAttendanceData, setAllEmployeesAttendanceData] = useState(
    {}
  );
  const [allEmployeesSearch, setAllEmployeesSearch] = useState("");

  // Constants/Options
  const statusOptions = [
    { value: "P", label: "Present", color: "#CCFFCC" },
    { value: "AL", label: "Approved Leave", color: "#E5E5CC" },
    { value: "PH", label: "Present on Holiday", color: "#5cbf85" },
    { value: "P/A", label: "Half Day", color: "#FFFFCC" },
    { value: "PH/A", label: "Half Day on Holiday", color: "#ffcc80" },
    { value: "A", label: "Absent", color: "#FFCCCC" },
    { value: "LOP", label: "Loss of Pay", color: "#e57373" },
    { value: "H", label: "Holiday", color: "#E0E0E0" },
    { value: "P/LOP", label: "Present on Loss of Pay", color: "#A89EF6" },
  ];

  const applyToOptions = [
    { value: "all", label: "All Days" },
    { value: "except_holiday", label: "All Except Holidays" },
    { value: "unmarked", label: "All Unmarked Days" },
    { value: "working", label: "All Working Days" },
    { value: "weekends", label: "All Weekends" },
  ];

  // Separate Apply To options for Single Employee Month (applying to days)
  const singleEmployeeApplyToOptions = [
    { value: "unmarked", label: "All Unmarked Days" },
    { value: "working", label: "All Working Days" },
  ];

  // Separate Apply To options for All Employees Date (applying to employees)
  const allEmployeesApplyToOptions = [
    { value: "all", label: "All Employees" },
    { value: "unmarked", label: "All Unmarked Employees" },
    { value: "except_holiday", label: "All Except Holiday Status" },
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

      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsCalendarOpen(false);
      }

      if (
        departmentFilterRef.current &&
        !departmentFilterRef.current.contains(event.target)
      ) {
        setIsDepartmentFilterOpen(false);
      }

      // Close employee dropdown when clicking outside
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target)
      ) {
        setIsEmployeeDropdownOpen(false);
      }

      // Close cell popover when clicking outside
      if (cellPopoverOpen) {
        const popoverElement = document.querySelector("[data-cell-popover]");
        const clickedElement = event.target;
        
        // Check if click is outside the popover
        if (popoverElement && !popoverElement.contains(clickedElement)) {
          // Don't close if clicking on dropdown elements
          const isDropdownElement =
            clickedElement.closest("[data-radix-popper-content-wrapper]") ||
            clickedElement.closest("[data-radix-popper-trigger]") ||
                                   clickedElement.closest('[role="menuitemradio"]');
          
          if (!isDropdownElement) {
            closePopover();
          }
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cellPopoverOpen]);

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
  }, [
    dispatch,
    selectedMonth,
    selectedYear,
    selectedDate,
    selectedStatuses,
    role,
  ]);

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
  }, [
    manualAttendanceSuccess,
    manualAttendanceError,
    manualAttendanceMessage,
    dispatch,
  ]);

  useEffect(() => {
    // Refresh attendance data when both modals are closed (returning to Attendance Tracker)
    if (!isSingleEmployeeModalOpen && !isAllEmployeesDateModalOpen) {
      // Convert month name to numeric month (1-12)
      const monthIndex = new Date(
        `${selectedMonth} 1, ${selectedYear}`
      ).getMonth();
      const numericMonth = monthIndex + 1;
      const year = selectedYear;
      let apiParams = { month: numericMonth, year, role };
      dispatch(fetchAllEmployeeAttendanceOneMonth(apiParams));
    }
  }, [
    isSingleEmployeeModalOpen,
    isAllEmployeesDateModalOpen,
    selectedMonth,
    selectedYear,
    role,
    dispatch,
  ]);

  // Close cell popover when switching views or opening modals
  useEffect(() => {
    if (
      isSingleEmployeeModalOpen ||
      isAllEmployeesDateModalOpen ||
      activeTab !== "Attendance Tracker"
    ) {
      setCellPopoverOpen(false);
      setPopoverOpenCell(null);
    }
  }, [isSingleEmployeeModalOpen, isAllEmployeesDateModalOpen, activeTab]);

  // Reset dropdown states when All Employees Date modal opens
  useEffect(() => {
    if (isAllEmployeesDateModalOpen) {
      setAllEmployeesMarkAsStatus("");
      setAllEmployeesApplyToScope("");
      setAllEmployeesAttendanceData({});
      setAllEmployeesSearch("");
    }
  }, [isAllEmployeesDateModalOpen]);

  // Callbacks
  const generateAttendanceData = useCallback(
    (employee) => {
      // Handle new response format with monthlyAttendance array
      let attendanceRecord = null;

      if (attendance && attendance.monthlyAttendance) {
        attendanceRecord = attendance.monthlyAttendance.find(
          (record) => record.employeeId === employee.employeeId
        );
      } else if (Array.isArray(attendance)) {
        // Fallback to old format
        attendanceRecord = attendance.find(
          (record) => record.employeeId === employee.employeeId
        );
      }

      if (!attendanceRecord) {
        return {
          id: employee.employeeId,
          name: employee.name,
          department: employee.departmentName,
          p_twd: "0/0",
          attendance: Array(dates.length).fill({ value: null, label: null }),
        };
      }

      // Helper function to determine attendance status for a given date
      const getAttendanceStatusForDate = (dayNumber) => {
        // Handle new format with days object
        if (attendanceRecord.days) {
          if (attendanceRecord.days[dayNumber]) {
            return attendanceRecord.days[dayNumber].statusCode;
          }
          return null; // Return null if no status code is available (empty box)
        }

        // Fallback to old format
        const attendanceData = attendanceRecord.attendance;
        if (!attendanceData) return null; // Return null if no attendance data

        const monthIndex = new Date(
          `${selectedMonth} 1, ${selectedYear}`
        ).getMonth();
        const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(
          2,
          "0"
        )}-${String(dayNumber).padStart(2, "0")}`;

        // Check present dates
        if (attendanceData.presentDates?.includes(dateString)) {
          return "P";
        }

        // Check full leave dates
        if (attendanceData.fullLeaveDates?.includes(dateString)) {
          return "AL";
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

        return null; // Return null if no status found (empty box)
      };

      const attendanceArray = Array(dates.length)
        .fill(null)
        .map((_, index) => {
          const day = index + 1;
          const status = getAttendanceStatusForDate(day.toString());

          // If status is null, return empty object
          if (status === null) {
            return { value: null, label: null };
          }

          let value;
          switch (status.toUpperCase()) {
            case "P":
              value = true;
              break;
            case "AL":
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
    if (upperStatus === "AL") return "bg-[#E5E5CC]";
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
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    // Get the month index for the selected month
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    
    // Determine the date to select immediately
    let dateToSelect;
    if (year === currentYear.toString() && monthIndex === currentMonth) {
      // Coming back to current month - always select current date
      dateToSelect = currentDay;
    } else {
      // Going to a different month - always select the last date of that month
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      dateToSelect = daysInMonth;
    }
    
    // Update all states immediately
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedDate(dateToSelect);
    setIsCalendarOpen(false);
    setSelectedEmployeeId(null);
  }, []);

  const handleEmployeeRowClick = useCallback((employeeId) => {
    setSelectedEmployeeId((prevId) =>
      prevId === employeeId ? null : employeeId
    );
    setSelectedDate(null);
  }, []);

  // Helper to determine if a color is light or dark (for text contrast)
  function isColorLight(hex) {
    if (!hex) return true;
    // Remove # if present
    hex = hex.replace("#", "");
    // Convert 3-digit to 6-digit
    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    }
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Perceived brightness
    return r * 0.299 + g * 0.587 + b * 0.114 > 186;
  }

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
        isFuture: date > new Date(),
      });
    }
    return dates;
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployeeForMonth(employee);
    
    // Fetch existing attendance data for this employee
    const monthIndex = new Date(
      `${monthYear.month} 1, ${monthYear.year}`
    ).getMonth();
    const numericMonth = monthIndex + 1;
    
    dispatch(
      fetchOneEmployeeAttendanceOneMonth({
      employeeId: employee.id,
      month: monthYear.month,
        year: monthYear.year,
      })
    )
      .then((result) => {
      if (!result.error && result.payload) {
        // Merge API response data with employee data
        const attendanceData = result.payload;
        const updatedEmployee = {
          ...employee,
          weeklyOffDays: attendanceData.weeklyOffDays || [],
          statusCounts: attendanceData.statusCounts || {}
        };
        setSelectedEmployeeForMonth(updatedEmployee);
        
        // Initialize attendance data with existing data
        const dates = generateMonthDates(monthYear.month, monthYear.year);
        const initialData = {};
        
        // Helper function to get attendance status for a specific date
          const getAttendanceStatusForDate = (dayNumber) => {
            if (!attendanceData) return null; // Return null if no attendance data

            // Handle new format with days object
            if (attendanceData.days) {
              if (attendanceData.days[dayNumber]) {
                return attendanceData.days[dayNumber].statusCode;
              }
              return null; // Return null if no status code is available (empty box)
            }

            // Fallback to old format
            const monthIndex = new Date(
              `${monthYear.month} 1, ${monthYear.year}`
            ).getMonth();
            const dateString = `${monthYear.year}-${String(
              monthIndex + 1
            ).padStart(2, "0")}-${String(dayNumber).padStart(2, "0")}`;

          // Check present dates
          if (attendanceData.presentDates?.includes(dateString)) {
            return "P";
          }

          // Check full leave dates
          if (attendanceData.fullLeaveDates?.includes(dateString)) {
              return "AL";
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

            return null; // Return null if no status found (empty box)
        };

        dates.forEach(({ day }) => {
            const status = getAttendanceStatusForDate(day.toString());
          initialData[day] = status || null; // Use null instead of empty string
        });
        
        setMonthAttendanceData(initialData);
      } else {
        // If no existing data, initialize with empty values
        const dates = generateMonthDates(monthYear.month, monthYear.year);
        const initialData = {};
        dates.forEach(({ day }) => {
          initialData[day] = null; // Use null instead of empty string
        });
        setMonthAttendanceData(initialData);
      }
      })
      .catch((error) => {
      console.error("Error fetching employee attendance:", error);
      // Initialize with empty values on error
      const dates = generateMonthDates(monthYear.month, monthYear.year);
      const initialData = {};
      dates.forEach(({ day }) => {
        initialData[day] = null; // Use null instead of empty string
      });
      setMonthAttendanceData(initialData);
    });
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
    setMonthAttendanceData((prev) => ({
      ...prev,
      [day]: status,
    }));
  };

  const handleSaveMonthAttendance = () => {
    if (!selectedEmployeeForMonth) {
      toast.error("Please select an employee");
      return;
    }

    // Build dateStatusMap for all days
    const dateStatusMap = {};
    const monthIndex = new Date(
      `${monthYear.month} 1, ${monthYear.year}`
    ).getMonth();
    Object.entries(monthAttendanceData).forEach(([day, status]) => {
      if (status) {
        // Format date without timezone issues
        const date = `${monthYear.year}-${String(monthIndex + 1).padStart(
          2,
          "0"
        )}-${String(parseInt(day)).padStart(2, "0")}`;
        dateStatusMap[date] = status;
      }
    });

    const payload = buildManualAttendancePayload(
      selectedEmployeeForMonth.id,
      dateStatusMap
    );

    dispatch(markManualAttendance(payload)).then((result) => {
      if (!result.error) {
        setIsSingleEmployeeModalOpen(false);
        setSelectedEmployeeForMonth(null);
        setMonthAttendanceData({});
        // Refresh attendance data
        dispatch(
          fetchAllEmployeeAttendanceOneMonth({
            month: monthIndex + 1,
          year: monthYear.year, 
            role,
          })
        );
      }
    });
  };

  // All Employees Date Modal Functions
  const handleDateSelectForAll = (date) => {
    setSelectedDateForAll(date);
    // Initialize attendance data for all employees
    const initialData = {};
    filteredEmployees.forEach((employee) => {
      initialData[employee.id] = null; // Use null instead of empty string
    });
    setAllEmployeesAttendanceData(initialData);
  };

  const setAllEmployeesStatus = (status) => {
    const newData = {};
    filteredEmployees.forEach((employee) => {
      newData[employee.id] = status;
    });
    setAllEmployeesAttendanceData(newData);
  };

  const setEmployeeStatus = (employeeId, status) => {
    setAllEmployeesAttendanceData((prev) => ({
      ...prev,
      [employeeId]: status,
    }));
  };

  const handleSaveAllEmployeesAttendance = () => {
    if (!selectedDateForAll) {
      toast.error("Please select a date");
      return;
    }

    // Prepare data in new API format
    const employeeStatuses = [];
    
    Object.entries(allEmployeesAttendanceData).forEach(
      ([employeeId, status]) => {
      if (status) {
          employeeStatuses.push({
            employeeId,
            statusCode: status,
          });
    }
      }
    );

    // If no employees are marked, show error
    if (employeeStatuses.length === 0) {
      toast.error("Please mark attendance for at least one employee");
      return;
    }

    // Create payload in the new format
    const payload = {
      date: selectedDateForAll,
      employeeStatuses,
    };

    dispatch(markAllEmployeesDateAttendance(payload)).then((result) => {
      if (!result.error) {
        setIsAllEmployeesDateModalOpen(false);
        setAllEmployeesAttendanceData({});
        setAllEmployeesSearch("");
        toast.success("Attendance marked successfully for all employees");
        // Refresh attendance data
        dispatch(
          fetchAllEmployeeAttendanceOneMonth({
          month: new Date(selectedDateForAll).getMonth() + 1, 
          year: new Date(selectedDateForAll).getFullYear(), 
            role,
          })
        );
      }
    });
  };

  const filteredEmployeesForModal = useMemo(() => {
    return filteredEmployees.filter(
      (employee) =>
        employee.name
          .toLowerCase()
          .includes(allEmployeesSearch.toLowerCase()) ||
      employee.id.toLowerCase().includes(allEmployeesSearch.toLowerCase()) ||
        (employee.department &&
          employee.department
            .toLowerCase()
            .includes(allEmployeesSearch.toLowerCase()))
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
      let totalApprovedLeave = 0;

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
              case "AL":
                totalApprovedLeave++;
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
                case "AL":
                  totalApprovedLeave++;
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
        totalApprovedLeave,
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
  }, [
    filteredEmployees,
    calculateAttendanceSummary,
    summaryDate,
    selectedEmployeeId,
  ]);

  // Handler to open popover from AttendanceTable
  const handleCellClick = (employee, date, status, event) => {
    setCellPopoverEmployee(employee);
    setCellPopoverDate(date);
    setCellPopoverStatus(status);
    setCellPopoverOpen(true);
    setPopoverOpenCell(`${employee.id}-${date}`);
    // Position popover just above the clicked cell button, centered horizontally
    const cellRect = event.target.getBoundingClientRect();
    const tableContainer = document.getElementById(
      "attendance-table-container"
    );
    let containerRect = { left: 0, top: 0 };
    if (tableContainer) {
      containerRect = tableContainer.getBoundingClientRect();
    }
    // Default popover size
    const popoverWidth = 320;
    const popoverHeight = 180;
    // Calculate left so popover is centered above the cell
    let left =
      cellRect.left -
      containerRect.left +
      cellRect.width / 2 -
      popoverWidth / 2;
    // Calculate top so popover is just above the cell
    let top = cellRect.top - containerRect.top - popoverHeight - 8;
    // If not enough space above, show below
    if (top < 0) {
      top = cellRect.bottom - containerRect.top + 8;
    }
    // Clamp left to container bounds
    left = Math.max(8, Math.min(left, containerRect.width - popoverWidth - 8));
    setCellPopoverPosition({ top, left });
    cellPopoverAnchorRef.current = event.target;
  };

  // When closing popover, clear popoverOpenCell
  const closePopover = () => {
    setCellPopoverOpen(false);
    setPopoverOpenCell(null);
  };

  // Handler to save status change
  const handleCellPopoverSave = () => {
    if (!cellPopoverEmployee || !cellPopoverDate) return;
    const employeeId = cellPopoverEmployee.id;
    const date = cellPopoverDate;
    const status = cellPopoverStatus;
    // Build dateStatusMap for this single change
    const dateStatusMap = { [date]: status };
    const payload = buildManualAttendancePayload(employeeId, dateStatusMap);
    dispatch(markManualAttendance(payload)).then(() => {
      setCellPopoverOpen(false);
      const monthIndex = new Date(
        `${selectedMonth} 1, ${selectedYear}`
      ).getMonth();
      const numericMonth = monthIndex + 1;
      const year = selectedYear;
      let apiParams = { month: numericMonth, year, role };
      dispatch(fetchAllEmployeeAttendanceOneMonth(apiParams));
    });
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 mt-16" onClick={() => setIsEmployeeDropdownOpen(false)}>
      {/* Header with Search and Title */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold text-gray-800">
          Attendance Management
        </h1>
      </div>

      {/* Manual Attendance Buttons/Toggle */}
      {!isSingleEmployeeModalOpen && !isAllEmployeesDateModalOpen ? (
        // Show buttons when no modal is active
        <div className="flex gap-4 mb-6">
          <div className="relative" ref={employeeDropdownRef}>
          <button
            className="flex items-center gap-3 px-6 py-3 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-500 text-white hover:bg-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsEmployeeDropdownOpen(!isEmployeeDropdownOpen);
            }}
          >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
            </svg>
            <span>Single Employee Month</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
          </button>

            {/* Employee Selection Dropdown */}
            {isEmployeeDropdownOpen && (
              <div
                className="absolute top-full left-0 mt-2 w-[350px] bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Select Employee
                  </h3>
                </div>
                <div className="p-3">
                  {/* Search Input */}
                  <div className="flex items-center gap-2 mb-3 px-2 py-1.5 bg-gray-50 rounded-md">
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={employeeDropdownInput}
                      onChange={(e) => setEmployeeDropdownInput(e.target.value)}
                      className="w-full px-2 py-1 border-none outline-none bg-transparent text-gray-800 text-xs"
                    />
                  </div>

                  {/* Employee List */}
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredEmployees
                      .filter(
                        (e) =>
                          e.name
                            .toLowerCase()
                            .includes(employeeDropdownInput.toLowerCase()) ||
                          e.id
                            .toLowerCase()
                            .includes(employeeDropdownInput.toLowerCase()) ||
                          (e.department &&
                            e.department
                              .toLowerCase()
                              .includes(employeeDropdownInput.toLowerCase()))
                      )
                      .map((employee) => (
                        <button
                          key={employee.id}
                          className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-blue-50 cursor-pointer transition-all border-b border-gray-50 last:border-b-0"
                          onClick={() => {
                            setEmployeeDropdownSearch(employee.id);
                            setIsEmployeeDropdownOpen(false);
                            setSelectedEmployeeForMonth(employee);
                            setIsSingleEmployeeModalOpen(true);
                            // Fetch existing attendance data for this employee
                            const monthIndex = new Date(
                              `${monthYear.month} 1, ${monthYear.year}`
                            ).getMonth();
                            const numericMonth = monthIndex + 1;

                            dispatch(
                              fetchOneEmployeeAttendanceOneMonth({
                                employeeId: employee.id,
                                month: monthYear.month,
                                year: monthYear.year,
                              })
                            )
                              .then((result) => {
                                if (!result.error && result.payload) {
                                  // Merge API response data with employee data
                                  const attendanceData = result.payload;
                                  const updatedEmployee = {
                                    ...employee,
                                    weeklyOffDays: attendanceData.weeklyOffDays || [],
                                    statusCounts: attendanceData.statusCounts || {}
                                  };
                                  setSelectedEmployeeForMonth(updatedEmployee);
                                  
                                  // Initialize attendance data with existing data
                                  const dates = generateMonthDates(
                                    monthYear.month,
                                    monthYear.year
                                  );
                                  const initialData = {};

                                  // Helper function to get attendance status for a specific date
                                  const getAttendanceStatusForDate = (
                                    dayNumber
                                  ) => {
                                    if (!attendanceData) return null; // Return null if no attendance data

                                    // Handle new format with days object
                                    if (attendanceData.days) {
                                      if (attendanceData.days[dayNumber]) {
                                        return attendanceData.days[dayNumber].statusCode;
                                      }
                                      return null; // Return null if no status code is available (empty box)
                                    }

                                    // Fallback to old format
                                    const monthIndex = new Date(
                                      `${monthYear.month} 1, ${monthYear.year}`
                                    ).getMonth();
                                    const dateString = `${
                                      monthYear.year
                                    }-${String(monthIndex + 1).padStart(
                                      2,
                                      "0"
                                    )}-${String(dayNumber).padStart(2, "0")}`;

                                    // Check present dates
                                    if (
                                      attendanceData.presentDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "P";
                                    }

                                    // Check full leave dates
                                    if (
                                      attendanceData.fullLeaveDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "AL";
                                    }

                                    // Check half day leave dates
                                    if (
                                      attendanceData.halfDayLeaveDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "P/A";
                                    }

                                    // Check full comp-off dates
                                    if (
                                      attendanceData.fullCompoffDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "P";
                                    }

                                    // Check half comp-off dates
                                    if (
                                      attendanceData.halfCompoffDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "P/A";
                                    }

                                    // Check weekly off dates
                                    if (
                                      attendanceData.weeklyOffDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "H";
                                    }

                                    // Check absent dates
                                    if (
                                      attendanceData.absentDates?.includes(
                                        dateString
                                      )
                                    ) {
                                      return "A";
                                    }

                                    return null; // Return null if no status found (empty box)
                                  };

                                  dates.forEach(({ day }) => {
                                    const status = getAttendanceStatusForDate(
                                      day.toString()
                                    );
                                    initialData[day] = status || null; // Use null instead of empty string
                                  });

                                  setMonthAttendanceData(initialData);
                                } else {
                                  // If no existing data, initialize with empty values
                                  const dates = generateMonthDates(
                                    monthYear.month,
                                    monthYear.year
                                  );
                                  const initialData = {};
                                  dates.forEach(({ day }) => {
                                    initialData[day] = null; // Use null instead of empty string
                                  });
                                  setMonthAttendanceData(initialData);
                                }
                              })
                              .catch((error) => {
                                console.error(
                                  "Error fetching employee attendance:",
                                  error
                                );
                                // Initialize with empty values on error
                                const dates = generateMonthDates(
                                  monthYear.month,
                                  monthYear.year
                                );
                                const initialData = {};
                                dates.forEach(({ day }) => {
                                  initialData[day] = null; // Use null instead of empty string
                                });
                                setMonthAttendanceData(initialData);
                              });
                          }}
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white text-xs">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate text-sm">
                              {employee.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {employee.id} • {employee.department}
                            </div>
                          </div>
                        </button>
                      ))}
                    {filteredEmployees.filter(
                      (e) =>
                        e.name
                          .toLowerCase()
                          .includes(employeeDropdownInput.toLowerCase()) ||
                        e.id
                          .toLowerCase()
                          .includes(employeeDropdownInput.toLowerCase()) ||
                        (e.department &&
                          e.department
                            .toLowerCase()
                            .includes(employeeDropdownInput.toLowerCase()))
                    ).length === 0 && (
                      <div className="text-gray-400 text-center py-4 text-xs">
                        No employees found
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <button
            className="flex items-center gap-3 px-6 py-3 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 bg-blue-500 text-white hover:bg-blue-600"
            onClick={() => {
              closeAllModals();
              setIsAllEmployeesDateModalOpen(true);
            }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <span>All Employees Date</span>
          </button>
                </div>
      ) : (
        // Show toggle interface when a modal is active
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isSingleEmployeeModalOpen
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => {
                closeAllModals();
                setIsSingleEmployeeModalOpen(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Single Employee Month</span>
            </button>
            
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAllEmployeesDateModalOpen
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => {
                closeAllModals();
                setIsAllEmployeesDateModalOpen(true);
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>All Employees Date</span>
            </button>
          </div>
        </div>
      )}

      {/* Regular Tabs - Only show when no modal is active */}
      {!isSingleEmployeeModalOpen && !isAllEmployeesDateModalOpen && (
        <div className="flex gap-6 mb-6">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "Attendance Tracker"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("Attendance Tracker")}
          >
            Attendance Tracker
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "Leave Tracker"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("Leave Tracker")}
          >
            Leave Tracker
          </button>
        </div>
      )}

      {/* Content Area (relative for overlays) */}
      <div className="relative" id="attendance-table-container">
        {isSingleEmployeeModalOpen ? (
          <div className="bg-white rounded-2xl shadow-xl p-4 w-full h-full flex flex-col border border-gray-100">
            {/* Modern Header - More Compact */}
            <div className="pb-4 mb-4 border-b border-gray-100">
              {/* Employee Info Row - Top */}
              <div className="flex items-center justify-between mb-4">
                {selectedEmployeeForMonth ? (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white text-xs">
                      {selectedEmployeeForMonth.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 text-base">
                      {selectedEmployeeForMonth.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {selectedEmployeeForMonth.id} •{" "}
                      {selectedEmployeeForMonth.department}
                    </span>
                  </div>
                ) : (
                  <div></div> // Empty div to maintain flex layout
                )}

                {/* Back and Close Buttons */}
                <div className="flex items-center gap-2">
                  {selectedEmployeeForMonth && (
                    <button
                      onClick={() => setSelectedEmployeeForMonth(null)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-medium text-gray-700 transition-colors"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      Back
                    </button>
                  )}
                  <button
                    onClick={closeAllModals}
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Divider between employee info and controls */}
              <div className="border-t border-gray-200 mb-4"></div>

              {/* Controls Row - Only show when employee is selected */}
              {selectedEmployeeForMonth && (
                <div className="flex items-center gap-3 mb-4">

                  {/* Mark As Dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Mark As
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-xs bg-white shadow-sm flex items-center justify-between min-w-[120px] hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors h-[28px]">
                          <span className="flex items-center gap-2 text-gray-700 truncate">
                            {singleEmployeeMarkAsStatus ? (
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: statusOptions.find(
                                    (opt) =>
                                      opt.value === singleEmployeeMarkAsStatus
                                  )?.color,
                                }}
                              ></span>
                            ) : null}
                            {singleEmployeeMarkAsStatus
                              ? statusOptions.find(
                                  (opt) =>
                                    opt.value === singleEmployeeMarkAsStatus
                                )?.label
                              : "Select"}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[240px] rounded-md shadow-lg border border-gray-200 bg-white"
                      >
                        <DropdownMenuRadioGroup
                          value={singleEmployeeMarkAsStatus}
                          onValueChange={(value) => {
                          setSingleEmployeeMarkAsStatus(value);
                            console.log(
                              "Single Employee Mark As Status changed to:",
                              value
                            );
                          }}
                        >
                          {statusOptions.map((opt) => (
                            <DropdownMenuRadioItem 
                              key={opt.value} 
                              value={opt.value} 
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  "Single Employee Mark As dropdown item clicked:",
                                  opt.value
                                );
                                setSingleEmployeeMarkAsStatus(opt.value);
                              }}
                            >
                              <span
                                className="inline-block w-3 h-3 rounded-full"
                                style={{ backgroundColor: opt.color }}
                              ></span>
                              {opt.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
        </div>

                  {/* Apply To Dropdown */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      Apply To
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-xs bg-white shadow-sm flex items-center justify-between min-w-[120px] hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors h-[28px]">
                          <span className="text-gray-700 truncate">
                            {singleEmployeeApplyToScope
                              ? singleEmployeeApplyToOptions.find(
                                  (opt) =>
                                    opt.value === singleEmployeeApplyToScope
                                )?.label
                              : "Select"}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[240px] rounded-md shadow-lg border border-gray-200 bg-white"
                      >
                        <DropdownMenuRadioGroup
                          value={singleEmployeeApplyToScope}
                          onValueChange={setSingleEmployeeApplyToScope}
                        >
                          {singleEmployeeApplyToOptions.map((opt) => (
                            <DropdownMenuRadioItem 
                              key={opt.value} 
                              value={opt.value} 
                              className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                            >
                              {opt.label}
                            </DropdownMenuRadioItem>
                          ))}
                        </DropdownMenuRadioGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
      </div>

                  {/* Apply Button */}
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-gray-600">
                      &nbsp;
                    </label>
          <button
                      className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors shadow-sm h-[28px]"
                      onClick={() => {
                        const status = singleEmployeeMarkAsStatus;
                        const scope = singleEmployeeApplyToScope;
                        if (!status || !scope) {
                          toast.error("Please select both status and scope.");
                          return;
                        }
                        const dates = generateMonthDates(
                          monthYear.month,
                          monthYear.year
                        );
                        let daysToApply = [];
                        if (scope === "all") {
                          daysToApply = dates.map((d) => d.day);
                        } else if (scope === "except_holiday") {
                          daysToApply = dates
                            .filter((d) => monthAttendanceData[d.day] !== "H")
                            .map((d) => d.day);
                        } else if (scope === "unmarked") {
                          daysToApply = dates
                            .filter((d) => !monthAttendanceData[d.day] && !d.isFuture)
                            .map((d) => d.day);
                        } else if (scope === "working") {
                          // Get employee's weekly off days from API response
                          const employeeWeeklyOffDays = selectedEmployeeForMonth?.weeklyOffDays || [];
                          
                          // Create mapping from full day names to abbreviated day names
                          const dayNameMapping = {
                            'Monday': 'Mon',
                            'Tuesday': 'Tue', 
                            'Wednesday': 'Wed',
                            'Thursday': 'Thu',
                            'Friday': 'Fri',
                            'Saturday': 'Sat',
                            'Sunday': 'Sun'
                          };
                          
                          console.log('Employee weekly off days:', employeeWeeklyOffDays);
                          console.log('Available dates:', dates.map(d => ({ day: d.day, weekday: d.weekday })));
                          
                          daysToApply = dates
                            .filter((d) => {
                              // Check if this day is not a weekly off day for this employee
                              const isWeeklyOffDay = employeeWeeklyOffDays.some(offDay => {
                                const mappedDay = dayNameMapping[offDay];
                                const matches = mappedDay === d.weekday;
                                if (matches) {
                                  console.log(`Day ${d.day} (${d.weekday}) is a weekly off day (${offDay})`);
                                }
                                return matches;
                              });
                              return !isWeeklyOffDay && !d.isFuture;
                            })
                            .map((d) => d.day);
                          
                          console.log('Days to apply:', daysToApply);
                        } else if (scope === "weekends") {
                          daysToApply = dates
                            .filter(
                              (d) => d.weekday === "Sun" || d.weekday === "Sat"
                            )
                            .map((d) => d.day);
                        }
                        const newData = { ...monthAttendanceData };
                        daysToApply.forEach((day) => {
                          newData[day] = status;
                        });
                        setMonthAttendanceData(newData);
                      }}
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Show calendar directly since employee is already selected */}
              <div className="animate-fade-in-up space-y-3">
                {/* Compact Calendar Grid */}
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">
                  Mark Attendance for {monthYear.month} {monthYear.year}
                </h4>
                  <div className="grid grid-cols-7 gap-2">
                    {/* Day Headers */}
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-semibold text-gray-600 py-2"
                      >
                        {day}
                      </div>
                    )
                  )}
                    {/* Calendar Days */}
                    {(() => {
                    const dates = generateMonthDates(
                      monthYear.month,
                      monthYear.year
                    );
                    const firstDate = new Date(
                      `${monthYear.year}-${String(
                        new Date(
                          `${monthYear.month} 1, ${monthYear.year}`
                        ).getMonth() + 1
                      ).padStart(2, "0")}-01`
                    );
                      const firstDayOfWeek = firstDate.getDay();
                      const daysInMonth = dates.length;
                    const totalCells =
                      Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;
                      const cells = [];
                      let dateIdx = 0;
                      for (let i = 0; i < totalCells; i++) {
                        if (i < firstDayOfWeek || dateIdx >= daysInMonth) {
                          // Blank cell
                        cells.push(
                          <div
                            key={`empty-${i}`}
                            className="p-4 min-h-[60px] bg-white border border-gray-200 rounded"
                          />
                        );
                        } else {
                        const { day, isWeekend, isFuture, weekday } =
                          dates[dateIdx];
                          // Use selectedEmployeeForMonth.weeklyOffDays (array of weekday names) for week offs
                        const weeklyOffDays =
                          selectedEmployeeForMonth?.weeklyOffDays || [];
                        
                        // Create mapping from full day names to abbreviated day names
                        const dayNameMapping = {
                          'Monday': 'Mon',
                          'Tuesday': 'Tue', 
                          'Wednesday': 'Wed',
                          'Thursday': 'Thu',
                          'Friday': 'Fri',
                          'Saturday': 'Sat',
                          'Sunday': 'Sun'
                        };
                        
                        const isWeekOff = weeklyOffDays.some(offDay => {
                          const mappedDay = dayNameMapping[offDay];
                          return mappedDay === weekday;
                        });
                          
                          // Get existing attendance data for this day
                          let value = monthAttendanceData[day] || null;
                          
                          // If no existing data and it's a week off, set to Holiday
                          if (!value && isWeekOff) {
                          value =
                            statusOptions.find((opt) => opt.value === "H")
                              ?.value || null;
                          }
                          
                          // If value changed for week off, update state (only on first render for that day)
                          if (isWeekOff && !monthAttendanceData[day]) {
                            setTimeout(() => setDayStatus(day, value), 0);
                          }
                          cells.push(
                            <div
                              key={day}
                              className={`flex flex-col items-center justify-center p-2 border rounded min-h-[60px] transition-all ${
                                isFuture
                                ? "bg-gray-50 text-gray-400 cursor-not-allowed border-gray-100"
                                  : isWeekOff
                                ? "bg-blue-50 border-blue-200 hover:border-blue-300"
                                : "bg-white border-gray-200 hover:border-blue-400 hover:shadow-sm"
                              }`}
                            >
                            <div className="font-bold text-gray-800 text-base mb-2">
                              {day}
                            </div>
                              {!isFuture && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    {(() => {
                                    const selected = statusOptions.find(
                                      (opt) => opt.value === value
                                    );
                                    const bgColor = selected
                                      ? selected.color
                                      : "#fff";
                                    const textColor = selected
                                      ? isColorLight(selected.color)
                                        ? "text-gray-800"
                                        : "text-white"
                                      : "text-gray-400";
                                      return (
                                        <button
                                          className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${textColor}`}
                                          style={{ backgroundColor: bgColor }}
                                        >
                                          <span className="flex items-center gap-2">
                                            {selected ? (
                                            <span
                                              className="inline-block w-3 h-3 rounded-full"
                                              style={{
                                                backgroundColor: selected.color,
                                              }}
                                            ></span>
                                            ) : (
                                              <span className="text-gray-400 text-xs">□</span>
                                            )}
                                            <span>
                                            {selected
                                              ? selected.label
                                              : "Empty"}
                                            </span>
                                          </span>
                                        <svg
                                          className={`w-4 h-4 ml-2 flex-shrink-0 ${
                                            isColorLight(bgColor)
                                              ? "text-gray-600"
                                              : "text-white"
                                          }`}
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                          />
                                          </svg>
          </button>
                                      );
                                    })()}
                                  </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  side="top"
                                  className="w-[280px] rounded-md shadow-lg border border-gray-200 bg-white max-h-64 overflow-y-auto"
                                >
                                  <DropdownMenuRadioGroup
                                    value={value || ""}
                                    onValueChange={(val) => {
                                      console.log(
                                        "Calendar day status changed to:",
                                        val,
                                        "for day:",
                                        day
                                      );
                                      setDayStatus(day, val || null);
                                    }}
                                  >
                                    <DropdownMenuRadioItem
                                      value=""
                                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-400"
                                    >
                                        Empty
                                      </DropdownMenuRadioItem>
                                    {statusOptions.map((opt) => (
                                        <DropdownMenuRadioItem 
                                          key={opt.value} 
                                          value={opt.value} 
                                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          console.log(
                                            "Calendar dropdown item clicked:",
                                            opt.value,
                                            "for day:",
                                            day
                                          );
                                            setDayStatus(day, opt.value);
                                          }}
                                        >
                                        <span
                                          className="inline-block w-3 h-3 rounded-full"
                                          style={{ backgroundColor: opt.color }}
                                        ></span>
                                          {opt.label}
                                        </DropdownMenuRadioItem>
                                      ))}
                                    </DropdownMenuRadioGroup>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          );
                          dateIdx++;
                        }
                      }
                      return cells;
                    })()}
                  </div>
      </div>

                {/* Compact Footer */}
                {selectedEmployeeForMonth && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600">
                    <span className="font-medium">
                      {
                        Object.values(monthAttendanceData).filter(
                          (status) => status !== null && status !== ""
                        ).length
                      }
                    </span>{" "}
                    days marked
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={closeAllModals}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-base font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveMonthAttendance}
                        disabled={manualAttendanceLoading}
                        className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-base font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {manualAttendanceLoading ? (
                          <>
                          <svg
                            className="animate-spin -ml-1 mr-1 h-4 w-4 text-white inline"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
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
        ) : activeTab === "Attendance Tracker" ? (
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
            onCellClick={(employee, date, status, event) =>
              handleCellClick(employee, date, status, event)
            }
            setSelectedStatuses={setSelectedStatuses}
            popoverOpenCell={popoverOpenCell}
            // Calendar props
            isCalendarOpen={isCalendarOpen}
            toggleCalendar={toggleCalendar}
            calendarRef={calendarRef}
            handleMonthSelection={handleMonthSelection}
            isSingleEmployeeModalOpen={isSingleEmployeeModalOpen}
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

        {/* All Employees Date Playcard - moved here! */}
        {isAllEmployeesDateModalOpen && (
          <div className="absolute inset-0 z-40 flex flex-col w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              {/* Title */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white text-xs">
                  A
                </div>
                <span className="font-semibold text-gray-800 text-base">
                  All Employees Date
                </span>
              </div>

              {/* Close Button */}
              <button
                onClick={closeAllModals}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Controls Section */}
            <div className="flex items-center gap-3 p-4 border-b border-gray-100">
              {/* Date Selector */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Date
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors h-[28px]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {selectedDateForAll
                          ? new Date(selectedDateForAll).toLocaleDateString()
                          : "Select Date"}
                      </span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-64 p-3 rounded-lg shadow-lg border border-gray-200"
                  >
                    {/* Year Selector */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-700">
                        {selectedDateForAll
                          ? new Date(selectedDateForAll).getFullYear()
                          : new Date().getFullYear()}
                      </div>
                      <select
                        value={
                          selectedDateForAll
                            ? new Date(selectedDateForAll).getFullYear()
                            : new Date().getFullYear()
                        }
                        onChange={(e) => {
                          const newYear = parseInt(e.target.value);
                          const currentDate = selectedDateForAll
                            ? new Date(selectedDateForAll)
                            : new Date();
                          const newDate = new Date(
                            newYear,
                            currentDate.getMonth(),
                            currentDate.getDate()
                          );
                          // Format date without timezone issues
                          const formattedDate = `${newYear}-${String(
                            newDate.getMonth() + 1
                          ).padStart(2, "0")}-${String(
                            newDate.getDate()
                          ).padStart(2, "0")}`;
                          handleDateSelectForAll(formattedDate);
                        }}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {[2024, 2025, 2026].map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Month Grid */}
                    <div className="grid grid-cols-3 gap-1">
                      {[
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
                      ].map((month, index) => {
                        const isSelected =
                          selectedDateForAll &&
                          new Date(selectedDateForAll).getMonth() === index;

                        return (
                <button
                            key={month}
                  onClick={() => {
                              const currentDate = selectedDateForAll
                                ? new Date(selectedDateForAll)
                                : new Date();
                              const newDate = new Date(
                                currentDate.getFullYear(),
                                index,
                                currentDate.getDate()
                              );
                              // Format date without timezone issues
                              const formattedDate = `${newDate.getFullYear()}-${String(
                                newDate.getMonth() + 1
                              ).padStart(2, "0")}-${String(
                                newDate.getDate()
                              ).padStart(2, "0")}`;
                              handleDateSelectForAll(formattedDate);
                            }}
                            className={`p-2 text-sm rounded-md transition-colors ${
                              isSelected
                                ? "bg-blue-100 text-blue-600 font-medium"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            {month}
                </button>
                        );
                      })}
                    </div>

                    {/* Day Selector */}
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Day
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {(() => {
                          const currentDate = selectedDateForAll
                            ? new Date(selectedDateForAll)
                            : new Date();
                          const year = currentDate.getFullYear();
                          const month = currentDate.getMonth();
                          const daysInMonth = new Date(
                            year,
                            month + 1,
                            0
                          ).getDate();
                          const days = [];

                          for (let day = 1; day <= daysInMonth; day++) {
                            const isSelected =
                              selectedDateForAll &&
                              new Date(selectedDateForAll).getDate() === day;

                            days.push(
                              <button
                                key={day}
                                onClick={() => {
                                  const newDate = new Date(year, month, day);
                                  // Format date without timezone issues
                                  const formattedDate = `${year}-${String(
                                    month + 1
                                  ).padStart(2, "0")}-${String(day).padStart(
                                    2,
                                    "0"
                                  )}`;
                                  handleDateSelectForAll(formattedDate);
                                }}
                                className={`p-1 text-xs rounded transition-colors ${
                                  isSelected
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "hover:bg-gray-100 text-gray-700"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          }
                          return days;
                        })()}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {/* Mark As Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  Mark As
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-xs bg-white shadow-sm flex items-center justify-between min-w-[120px] hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors h-[28px]">
                      <span className="flex items-center gap-2 text-gray-700 truncate">
                        {allEmployeesMarkAsStatus ? (
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: statusOptions.find(
                                (opt) => opt.value === allEmployeesMarkAsStatus
                              )?.color,
                            }}
                          ></span>
                        ) : null}
                        {allEmployeesMarkAsStatus
                          ? statusOptions.find(
                              (opt) => opt.value === allEmployeesMarkAsStatus
                            )?.label
                          : "Select"}
                      </span>
                      <svg
                        className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-[240px] rounded-md shadow-lg border border-gray-200 bg-white"
                  >
                    <DropdownMenuRadioGroup
                      value={allEmployeesMarkAsStatus}
                      onValueChange={(value) => {
                      setAllEmployeesMarkAsStatus(value);
                        console.log(
                          "All Employees Mark As Status changed to:",
                          value
                        );
                      }}
                    >
                      {statusOptions.map((opt) => (
                        <DropdownMenuRadioItem 
                          key={opt.value} 
                          value={opt.value} 
                          className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log(
                              "All Employees Mark As dropdown item clicked:",
                              opt.value
                            );
                            setAllEmployeesMarkAsStatus(opt.value);
                          }}
                        >
                          <span
                            className="inline-block w-3 h-3 rounded-full"
                            style={{ backgroundColor: opt.color }}
                          ></span>
                          {opt.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Apply Button */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-600">
                  &nbsp;
                </label>
                <button
                  className="px-4 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-medium transition-colors shadow-sm h-[28px]"
                  onClick={() => {
                    const status = allEmployeesMarkAsStatus;
                    console.log("Apply button clicked - Status:", status);
                    console.log(
                      "Current markAsStatus state:",
                      allEmployeesMarkAsStatus
                    );
                    
                    if (!status) {
                      toast.error("Please select a status.");
                      return;
                    }
                    
                    // Apply the selected status to all employees
                    const newData = { ...allEmployeesAttendanceData };
                    filteredEmployeesForModal.forEach((employee) => {
                      newData[employee.id] = status;
                    });
                    
                    setAllEmployeesAttendanceData(newData);
                    toast.success(
                      `Applied ${
                        statusOptions.find((opt) => opt.value === status)?.label
                      } to all employees`
                    );
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Employee List and Attendance Grid */}
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Search Bar */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={allEmployeesSearch}
                  onChange={(e) => setAllEmployeesSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {/* Employee Attendance Grid */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-white border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white z-10 shadow-sm">
                    <tr className="border-b border-gray-200">
                      <th className="py-2 px-2 text-left font-semibold text-gray-700 bg-white">
                        Employee
                      </th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-700 bg-white">
                        Department
                      </th>
                      <th className="py-2 px-2 text-left font-semibold text-gray-700 bg-white">
                        Attendance
                      </th>
                    </tr>
                  </thead>
                  <tbody className="p-3">
                    {filteredEmployeesForModal.map((employee) => (
                      <tr
                        key={employee.id}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2 px-2 flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center font-semibold text-white text-xs">
                            {employee.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800 truncate text-sm">
                              {employee.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {employee.id}
                            </div>
                          </div>
                        </td>
                        <td className="py-2 px-2 text-xs text-gray-600">
                          {employee.department}
                        </td>
                        <td className="py-2 px-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              {(() => {
                                const value =
                                  allEmployeesAttendanceData[employee.id] || null;
                                const selected = statusOptions.find(
                                  (opt) => opt.value === value
                                );
                                const bgColor = selected
                                  ? selected.color
                                  : "#fff";
                                const textColor = selected
                                  ? isColorLight(selected.color)
                                    ? "text-gray-800"
                                    : "text-white"
                                  : "text-gray-400";
                                return (
                                  <button
                                    className={`w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${textColor}`}
                                    style={{ backgroundColor: bgColor }}
                                  >
                                    <span className="flex items-center gap-2">
                                      {selected ? (
                                        <span
                                          className="inline-block w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor: selected.color,
                                          }}
                                        ></span>
                                      ) : (
                                        <span className="text-gray-400 text-xs">□</span>
                                      )}
                                      <span>
                                        {selected ? selected.label : "Empty"}
                                      </span>
                                    </span>
                                    <svg
                                      className={`w-4 h-4 ml-2 flex-shrink-0 ${
                                        isColorLight(bgColor)
                                          ? "text-gray-600"
                                          : "text-white"
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </button>
                                );
                              })()}
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="top"
                              className="w-[280px] rounded-md shadow-lg border border-gray-200 bg-white max-h-64 overflow-y-auto"
                            >
                              <DropdownMenuRadioGroup
                                value={
                                  allEmployeesAttendanceData[employee.id] || ""
                                }
                                onValueChange={(val) => {
                                  console.log(
                                    "Employee status changed to:",
                                    val,
                                    "for employee:",
                                    employee.id
                                  );
                                setEmployeeStatus(employee.id, val || null);
                                }}
                              >
                                <DropdownMenuRadioItem
                                  value=""
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer text-gray-400"
                                >
                                  Empty
                                </DropdownMenuRadioItem>
                                {statusOptions.map((opt) => (
                                  <DropdownMenuRadioItem 
                                    key={opt.value} 
                                    value={opt.value} 
                                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Employee dropdown item clicked:",
                                        opt.value,
                                        "for employee:",
                                        employee.id
                                      );
                                      setEmployeeStatus(employee.id, opt.value);
                                    }}
                                  >
                                    <span
                                      className="inline-block w-3 h-3 rounded-full"
                                      style={{ backgroundColor: opt.color }}
                                    ></span>
                                    {opt.label}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl p-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">
                  {
                    Object.values(allEmployeesAttendanceData).filter(
                      (status) => status !== null && status !== ""
                    ).length
                  }
                </span>{" "}
                employees marked
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeAllModals}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-base font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAllEmployeesAttendance}
                  disabled={manualAttendanceLoading}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-base font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {manualAttendanceLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1 h-4 w-4 text-white inline"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
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
        )}
        {/* Attendance Cell Popover */}
        {cellPopoverOpen && cellPopoverEmployee && cellPopoverDate && (
          <div
            data-cell-popover
            style={{
              position: "absolute",
              top: cellPopoverPosition.top,
              left: cellPopoverPosition.left,
              zIndex: 9999,
              width: 320,
              minWidth: 280,
              maxWidth: 360,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 flex flex-col items-center"
          >
            <div className="text-sm font-bold text-gray-800 mb-1">
              {cellPopoverEmployee.name} ({cellPopoverEmployee.id})
            </div>
            <div className="text-sm font-bold text-gray-700 mb-2">
              {cellPopoverDate}
            </div>
            
            {/* Current Status */}
            <div className="flex items-center gap-2 mb-4">
              {cellPopoverStatus ? (
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: statusOptions.find(
                      (opt) => opt.value === cellPopoverStatus
                    )?.color,
                  }}
                ></span>
              ) : null}
              <span className="text-sm font-medium text-gray-800">
                {cellPopoverStatus
                  ? statusOptions.find((opt) => opt.value === cellPopoverStatus)
                      ?.label
                  : "No attendance marked"}
              </span>
            </div>
            
            {/* Change to Dropdown */}
            <div className="w-full mb-4">
              <label className="block text-xs text-gray-500 mb-1">
                Change to:
              </label>
              <select
                value={cellPopoverStatus}
                onChange={(e) => setCellPopoverStatus(e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-300 rounded text-xs bg-white shadow-sm hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Select status...</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-2 w-full">
              <button
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                onClick={closePopover}
              >
                Cancel
              </button>
              <button
                className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm"
                onClick={() => {
                  handleCellPopoverSave();
                  closePopover();
                }}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceTracker; 