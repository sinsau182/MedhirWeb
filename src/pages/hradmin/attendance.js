import React, { useState, useEffect } from "react";
import { Search, Calendar } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import withAuth from "@/components/withAuth";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";

function Attendance() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees = [], loading: employeesLoading } = useSelector((state) => state.employees || {});
  const [searchInput, setSearchInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Fetch employees on component mount
  useEffect(() => {
    dispatch(fetchEmployees()).catch((err) => {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    });
  }, [dispatch]);

  // Check authentication and role
  useEffect(() => {
    try {
      const role = sessionStorage.getItem("currentRole");
      if (!role || role !== "hr") {
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
        const daysInMonth = new Date(selectedYear, selectedMonth.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
          const date = new Date(selectedYear, selectedMonth.getMonth(), i);
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

  // Generate random attendance data for employees
  const generateAttendanceData = (employee) => {
    return {
      id: employee.employeeId,
      name: employee.name,
      department: employee.departmentName,
      p_twd: "18/20",
      attendance: Array(dates.length)
        .fill(null)
        .map((_, i) => {
          // Weekends (Saturdays and Sundays)
          if (i % 7 === 5 || i % 7 === 6) return "weekend";
          // Firm holiday (15th)
          if (i === 14) return "holiday";
          // Regular attendance
          if (i < 3) return null;
          // Random attendance status
          const random = Math.random();
          if (random > 0.8) return false; // Absent
          if (random > 0.6) return "half"; // Half day
          if (random > 0.4) return "approved_leave"; // Approved leave
          return true; // Present
        }),
    };
  };

  // Generate random leave data for employees
  const generateLeaveData = (employee) => {
    return {
      id: employee.employeeId,
      name: employee.name,
      department: employee.departmentName,
      noOfPayableDays: "25",
      leavesTaken: Math.floor(Math.random() * 7).toString(),
      leavesEarned: "10",
      leavesFromPreviousYear: "2",
      compOffEarned: Math.floor(Math.random() * 4).toString(),
      compOffCarriedForward: "1",
      netLeaves: "7",
    };
  };

  // const toggleSidebar = () => {
  //   setIsSidebarCollapsed(!isSidebarCollapsed);
  // };

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(new Date(year, month));
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
    [searchInput, employees, dates.length]
  );

  const filteredLeaveData = React.useMemo(
    () =>
      employees
        .filter(
          (employee) =>
            employee.name.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.employeeId.toLowerCase().includes(searchInput.toLowerCase()) ||
            employee.departmentName.toLowerCase().includes(searchInput.toLowerCase())
        )
        .map(generateLeaveData),
    [searchInput, employees]
  );

  const getAttendanceColor = React.useCallback((status) => {
    if (status === null) return "bg-gray-100"; // Empty
    if (status === true) return "bg-green-600"; // Present (dark green)
    if (status === false) return "bg-red-200"; // Absent (light red)
    if (status === "half") return "bg-yellow-500"; // Half day
    if (status === "weekend") return "bg-gray-300"; // Weekend
    if (status === "holiday") return "bg-gray-400"; // Holiday
    if (status === "approved_leave") return "bg-green-200"; // Light green for approved leave
    return "";
  }, []);

  const getAttendanceText = React.useCallback((status) => {
    if (status === true) return "P";
    if (status === false) return "Un. App. Leave";
    if (status === "half") return "Approved LOP";
    if (status === "approved_leave") return "P(App. Leave)";
    return "";
  }, []);

  const renderAttendanceTable = () => (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Legend */}
      <div className="p-4 border-b flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-xs text-gray-600">Present</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-200 rounded"></div>
          <span className="text-xs text-gray-600">
            Present (Approved Leave)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-xs text-gray-600">Approved LOP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-200 rounded"></div>
          <span className="text-xs text-gray-600">Unapproved Leave</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-300 rounded"></div>
          <span className="text-xs text-gray-600">Weekend</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded"></div>
          <span className="text-xs text-gray-600">Holiday</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-xs text-gray-600">No Data</span>
        </div>
      </div>

      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r">
              Emp ID
            </th>
            <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[10%] border-r">
              Name
            </th>
            <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r">
              Dept
            </th>
            {dates.map((date) => (
              <th
                key={date.day}
                className="py-1 px-0 text-center text-xs font-semibold text-gray-700 w-[2%] border-r"
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
        <tbody className="divide-y divide-gray-100">
          {filteredEmployees.map((employee, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="py-1 px-1 text-sm text-gray-800 border-r">
                {employee.id}
              </td>
              <td className="py-1 px-1 text-sm text-gray-800 border-r">
                {employee.name}
              </td>
              <td className="py-1 px-1 text-sm text-gray-800 border-r whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px]">
                {employee.department}
              </td>
              {employee.attendance.map((status, index) => (
                <td
                  key={index}
                  className={`py-1 px-0 text-center border-r ${getAttendanceColor(
                    status
                  )}`}
                ></td>
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
          <tr className="border-b">
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Emp ID
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Name
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Dept
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Pay Days
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Leaves Taken
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Leaves Earned
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Leaves CF Prev Year
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Comp Off
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              CF Comp Off
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Balance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
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
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.id}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.name}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.department}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.noOfPayableDays}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.leavesTaken}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.leavesEarned}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.leavesFromPreviousYear}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.compOffEarned}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leave.compOffCarriedForward}
                </td>
                <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                  {leaveBalance}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (isLoading || employeesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!dates.length) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading dates...
      </div>
    );
  }

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
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full md:w-72 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="relative">
                <Badge
                  variant="outline"
                  className="px-6 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                  onClick={toggleCalendar}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium text-base">
                    {selectedYear}-
                    {selectedMonth.toLocaleString("default", { month: "long" })}
                  </span>
                </Badge>
                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b">
                      <div className="text-sm font-medium text-gray-700">
                        {selectedYear}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-3">
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
                      ].slice(0, new Date().getMonth() + 1).map((month) => (
                        <button
                          key={month}
                          className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                            month ===
                            selectedMonth
                              .toLocaleString("default", { month: "long" })
                              .slice(0, 3)
                              ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() =>
                            handleMonthSelection(month, selectedYear)
                          }
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
