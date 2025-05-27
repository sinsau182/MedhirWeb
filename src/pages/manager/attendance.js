import React, { useState, useEffect, useCallback } from "react";
import { Search, Calendar, Check, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import withAuth from "@/components/withAuth";
import { useDispatch, useSelector } from "react-redux";
import { fetchManagerEmployees } from "@/redux/slices/managerEmployeeSlice";
import { fetchAllEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";

function Attendance() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees = [], loading: employeesLoading } = useSelector(
    (state) => state.managerEmployee || {}
  );
  const [searchInput, setSearchInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString("default", { month: "long" }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);
  // Fetch employees on component mount
  useEffect(() => {
    dispatch(fetchManagerEmployees()).catch((err) => {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    });
  }, [dispatch]);

    // Fetch attendance data when month or year changes
    useEffect(() => {
      const month = selectedMonth.slice(0, 3); // Get first 3 letters of month (e.g., "Apr")
      const year = selectedYear;
     dispatch(fetchAllEmployeeAttendanceOneMonth({ month: month, year }));
    }, [dispatch, selectedMonth, selectedYear]);

    const { attendance, loading, err } = useSelector((state) => state.attendances);

  // Check authentication and role
  useEffect(() => {
    try {
      const role = sessionStorage.getItem("currentRole");
      if (!role || role !== "MANAGER") {
        router.push("/login");
        return;
      }
      setIsLoading(false);
    } catch (err) {
      setError("Authentication error");
      setIsLoading(false);
    }
  }, [router]);

  // Generate dates for the selected month
  useEffect(() => {
    try {
      const generateDates = () => {
        const dates = [];
        const monthIndex = new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth();
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

  // Generate attendance data for employees
  const generateAttendanceData = useCallback((employee) => {
    // Find matching attendance record for this employee
    const attendanceRecord = attendance?.find(record => record.employeeId === employee.employeeId);
    
    if (!attendanceRecord) {
      return {
        id: employee.employeeId,
        name: employee.name,
        department: employee.departmentName,
        p_twd: "0/0",
        attendance: Array(dates.length).fill({ value: null, label: "" })
      };
    }

        // Convert daily attendance to array format
        const attendanceArray = Array(dates.length).fill(null).map((_, index) => {
          const day = (index + 1).toString();
          const status = attendanceRecord.dailyAttendance[day];
          if (!status) return { value: null, label: "" };
          let value;
          switch (status) {
            case 'P':
              value = true; break;
            case 'A':
              value = false; break;
            case 'P/A':
              value = 'half'; break;
            case 'H':
              value = 'holiday'; break;
            case 'PH':
              value = 'present_holiday'; break;
            case 'PH/A':
              value = 'half_holiday'; break;
            case 'LOP':
              value = 'lop'; break;
            default:
              value = null;
          }
          return { value, label: status };
        });

        return {
          id: employee.employeeId,
          name: employee.name,
          department: employee.departmentName,
          p_twd: `${attendanceRecord.payableDays}/${attendanceRecord.workingDays}`,
          attendance: attendanceArray
        };
      }, [dates.length, attendance]);

  // Generate leave data for employees
  const generateLeaveData = (employee) => {
    // Find matching attendance record for this employee
    const attendanceRecord = attendance?.find(record => record.employeeId === employee.employeeId);
    
    if (!attendanceRecord) {
      return {
        id: employee.employeeId,
        name: employee.name,
        department: employee.departmentName,
        noOfPayableDays: "0",
        leavesTaken: "0",
        leavesEarned: "0",
        leavesFromPreviousYear: "0",
        compOffEarned: "0",
        compOffCarriedForward: "0",
        netLeaves: "0"
      };
    }

  return {
    id: employee.employeeId,
    name: employee.name,
    department: employee.departmentName,
    noOfPayableDays: attendanceRecord.payableDays.toString(),
    leavesTaken: attendanceRecord.leavesTaken.toString(),
    leavesEarned: attendanceRecord.leavesEarned.toString(),
    leavesFromPreviousYear: attendanceRecord.lastMonthBalance.toString(),
    compOffEarned: attendanceRecord.compOffEarned.toString(),
    compOffCarriedForward: "0", // Not provided in API response
    netLeaves: attendanceRecord.netLeaveBalance.toString()
  };
};

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
  };
  // Generate attendance and leave data for filtered employees
  const filteredEmployees = React.useMemo(
    () =>
      employees
        .filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.employeeId.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.departmentName.toLowerCase().includes(searchInput.toLowerCase())
        )
        .map(generateAttendanceData),
    [searchInput, employees, generateAttendanceData]
  );

  const filteredLeaveData = React.useMemo(
    () =>
      employees
        .filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.employeeId
              .toLowerCase()
              .includes(searchInput.toLowerCase()) ||
            employee.departmentName
              .toLowerCase()
              .includes(searchInput.toLowerCase())
        )
        .map(generateLeaveData),
    [searchInput, employees, attendance]
  );

  const getAttendanceColor = React.useCallback((status) => {
    if (status === null) return "bg-white"; // White background for future days
    if (status === true) return "bg-green-600"; // Present (dark green)
    if (status === false) return "bg-[#FF0000]"; // Absent (light red)
    if (status === "half") return "bg-yellow-500"; // Half day
    if (status === "weekend") return "bg-gray-300"; // Weekend
    if (status === "holiday") return "bg-gray-400"; // Holiday
    if (status === "present_holiday") return "bg-green-200"; // Present on Holiday
    if (status === "half_holiday") return "bg-yellow-200"; // Half Day on Holiday
    if (status === "lop") return "bg-red-200"; // Loss of Pay
    if (status === "approved_leave") return "bg-green-200"; // Light green for approved leave
    return "";
  }, []);

  const getStatusLabel = React.useCallback((status) => {
    if (status === null) return ""; // Empty string for future days
    if (status === true) return "P";
    if (status === false) return "A";
    if (status === "half") return "P/A";
    if (status === "weekend") return "W";
    if (status === "holiday") return "H";
    if (status === "present_holiday") return "PH";
    if (status === "half_holiday") return "PH/A";
    if (status === "lop") return "LOP";
    if (status === "approved_leave") return "AL";
    return "";
  }, []);

  // const getAttendanceText = React.useCallback((status) => {
  //   if (status === true) return "P";
  //   if (status === false) return "Un. App. Leave";
  //   if (status === "half") return "Approved LOP";
  //   if (status === "approved_leave") return "P(App. Leave)";
  //   return "";
  // }, []);

  const renderAttendanceTable = () => (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Status Summary Section removed as per request */}

      {/* Detailed Legend */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Present (P)</span>
              <p className="text-[10px] text-gray-500">Full day attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Half Day (P/A)</span>
              <p className="text-[10px] text-gray-500">Partial attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#FF0000] rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Absent (A)</span>
              <p className="text-[10px] text-gray-500">No attendance</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Holiday (H)</span>
              <p className="text-[10px] text-gray-500">Public/Company holiday</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-200 rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Present on Holiday (PH)</span>
              <p className="text-[10px] text-gray-500">Working on holiday</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Half Day on Holiday (PH/A)</span>
              <p className="text-[10px] text-gray-500">Partial work on holiday</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded"></div>
            <div>
              <span className="text-xs font-medium text-gray-700">Loss of Pay (LOP)</span>
              <p className="text-[10px] text-gray-500">Unpaid leave</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters, Search, and Calendar Row above table */}
      <div className="p-4 border-b flex flex-wrap items-center gap-4">
        <div className="bg-white shadow-sm rounded-lg px-4 py-2 relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            <span>Filter Status</span>
            <svg
              className={`w-4 h-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isFilterOpen && (
            <div className="absolute left-0 mt-2 w-64 bg-white border rounded-md shadow-lg z-10">
              <div className="p-2">
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('P')}
                      onChange={() => handleFilterChange('P')}
                    />
                    <span className="text-sm text-gray-700">Present (P)</span>
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('P/A')}
                      onChange={() => handleFilterChange('P/A')}
                    />
                    <span className="text-sm text-gray-700">Half Day (P/A)</span>
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('A')}
                      onChange={() => handleFilterChange('A')}
                    />
                    <span className="text-sm text-gray-700">Absent (A)</span>
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('H')}
                      onChange={() => handleFilterChange('H')}
                    />
                    <span className="text-sm text-gray-700">Holiday (H)</span>
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('PH')}
                      onChange={() => handleFilterChange('PH')}
                    />
                    <span className="text-sm text-gray-700">Present on Holiday (PH)</span>
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('PH/A')}
                      onChange={() => handleFilterChange('PH/A')}
                    />
                    <span className="text-sm text-gray-700">Half Day on Holiday (PH/A)</span>
                  </label>
                </div>
                <div className="mb-2">
                  <label className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={selectedFilters.includes('LOP')}
                      onChange={() => handleFilterChange('LOP')}
                    />
                    <span className="text-sm text-gray-700">Loss of Pay (LOP)</span>
                  </label>
                </div>
                <div className="border-t pt-2 mt-2">
                  <button
                    onClick={() => setSelectedFilters([])}
                    className="w-full text-sm text-gray-600 hover:text-gray-800 py-1"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}
          {selectedFilters.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <span
                  key={filter}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full"
                >
                  {filter}
                  <button
                    onClick={() => handleFilterChange(filter)}
                    className="hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, ID or department..."
            className="w-full md:w-72 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <svg className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35"/></svg>
        </div>
      </div>

      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-black">
            <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black">
              Emp ID
            </th>
            <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[10%] border-r border-black">
              Name
            </th>
            <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black">
              Dept
            </th>
            {dates.map((date) => (
              <th
                key={date.day}
                className="py-1 px-0 text-center text-xs font-semibold text-gray-700 w-[2%] border-r border-black"
              >
                <div className="leading-none">
                  {String(date.day).padStart(2, "0")}
                </div>
                <div className="text-gray-500 text-[10px] leading-tight">
                  {date.weekday}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {filteredEmployees.map((employee, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="py-1 px-1 text-sm text-gray-800 border-r border-black">
                {employee.id}
              </td>
              <td className="py-1 px-1 text-sm text-gray-800 border-r border-black">
                {employee.name}
              </td>
              <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                {employee.department}
              </td>
              {employee.attendance.map((att, index) => (
                <td
                  key={index}
                  className={`py-1 px-0 text-center border-r border-black ${getAttendanceColor(att.value)}`}
                >
                  <span className="text-xs font-medium text-black">
                    {getStatusLabel(att.value)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLeaveTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-black">
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Emp ID
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Name
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Dept
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Pay Days
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Leaves Taken
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Leaves Earned
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Leaves CF Prev Year
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              Comp Off
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-r border-black">
              CF Comp Off
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap border-black">
              Balance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black">
          {filteredLeaveData.map((leave) => {
            // Calculate leave balance
            const leaveBalance =
              parseInt(leave.leavesEarned) +
              parseInt(leave.leavesFromPreviousYear) +
              parseInt(leave.compOffEarned) +
              parseInt(leave.compOffCarriedForward) -
              parseInt(leave.leavesTaken);

            return (
              <tr key={leave.id} className="hover:bg-gray-50">
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.id}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.name}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.department}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.noOfPayableDays}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.leavesTaken}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.leavesEarned}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.leavesFromPreviousYear}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.compOffEarned}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-r border-black">
                  {leave.compOffCarriedForward}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap border-black">
                  {leaveBalance}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // if (isLoading || employeesLoading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // if (!dates.length) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       Loading dates...
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Header with Search and Title */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Attendance Management
            </h1>
            <div className="relative">
              <Badge
                variant="outline"
                className="px-6 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                onClick={toggleCalendar}
              >
                <Calendar className="h-5 w-5" />
                <span className="font-medium text-base">
                  {selectedYear}-
                  {selectedMonth}
                </span>
              </Badge>
              {isCalendarOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-3 border-b flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedYear}
                    </div>
                    <select
                      value={selectedYear}
                      onChange={e => {
                        setSelectedYear(e.target.value);
                        if (e.target.value === '2024') {
                          setSelectedMonth('Aug');
                        } else {
                          setSelectedMonth('Jan');
                        }
                      }}
                      className="ml-2 border rounded px-2 py-1 text-sm"
                    >
                      {[2024, 2025].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-3">
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const currentMonthIdx = new Date().getMonth(); // 0-based
                      let months = [
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                      ];
                      let startIdx = 0;
                      let endIdx = 11;
                      if (parseInt(selectedYear) === 2024) {
                        startIdx = 7; // August (0-based)
                        endIdx = 11;
                      } else if (parseInt(selectedYear) === 2025) {
                        startIdx = 0;
                        // If 2025 is the current year, restrict to current month
                        endIdx = (currentYear === 2025) ? currentMonthIdx : 11;
                      }
                      return months.slice(startIdx, endIdx + 1).map((month) => (
                        <button
                          key={month}
                          className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                            month === selectedMonth.slice(0, 3)
                              ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() => handleMonthSelection(month, selectedYear)}
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

          {activeTab === "Attendance Tracker"
            ? renderAttendanceTable()
            : renderLeaveTable()}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Attendance);
