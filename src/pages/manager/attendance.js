import React, { useState, useEffect } from "react";
import { Search, Calendar, Check, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useRouter } from "next/router";

function Attendance() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [dates, setDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and role
  useEffect(() => {
    try {
      const role = localStorage.getItem("currentRole");
      if (!role || role !== "manager") {
        router.push("/login");
        return;
      }
      setIsLoading(false);
    } catch (err) {
      setError("Authentication error");
      setIsLoading(false);
    }
  }, [router]);

  // Generate dates for January 2024
  useEffect(() => {
    try {
      const generateDates = () => {
        const dates = [];
        for (let i = 1; i <= 31; i++) {
          const date = new Date(2024, 0, i);
          dates.push({
            day: i,
            weekday: date.toLocaleString('default', { weekday: 'short' })
          });
        }
        return dates;
      };
      setDates(generateDates());
    } catch (err) {
      setError("Error generating dates");
    }
  }, []);

  // Sample team member data with attendance records
  const employees = [
    {
      id: "MED001",
      name: "Arun",
      department: "SALES",
      p_twd: "18/20",
      attendance: Array(31).fill(null).map((_, i) => 
        i < 3 ? null : i % 7 === 0 ? null : Math.random() > 0.2
      )
    },
    {
      id: "MED002",
      name: "Naman",
      department: "Design",
      p_twd: "18/20",
      attendance: Array(31).fill(null).map((_, i) => 
        i < 3 ? null : i % 7 === 0 ? null : Math.random() > 0.2
      )
    },
    {
      id: "MED003",
      name: "Amit",
      department: "Marketing",
      p_twd: "18/20",
      attendance: Array(31).fill(null).map((_, i) => 
        i < 3 ? null : i % 7 === 0 ? null : Math.random() > 0.2
      )
    }
  ];

  // Leave data for team members
  const leaveData = [
    {
      id: "MED001",
      name: "Arun",
      department: "SALES",
      noOfPayableDays: "25",
      leavesTaken: "5",
      leavesEarned: "10",
      carriedForwardLeaves: "2",
      netLeaves: "7",
    },
    {
      id: "MED002",
      name: "Naman",
      department: "Design",
      noOfPayableDays: "25",
      leavesTaken: "3",
      leavesEarned: "10",
      carriedForwardLeaves: "2",
      netLeaves: "9",
    },
    {
      id: "MED003",
      name: "Amit",
      department: "Marketing",
      noOfPayableDays: "25",
      leavesTaken: "2",
      leavesEarned: "10",
      carriedForwardLeaves: "2",
      netLeaves: "10",
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredEmployees = React.useMemo(() => 
    employees.filter(employee =>
      employee.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      employee.id.toLowerCase().includes(searchInput.toLowerCase()) ||
      employee.department.toLowerCase().includes(searchInput.toLowerCase())
    ),
    [searchInput]
  );

  const filteredLeaveData = React.useMemo(() => 
    leaveData.filter(leave =>
      leave.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      leave.id.toLowerCase().includes(searchInput.toLowerCase()) ||
      leave.department.toLowerCase().includes(searchInput.toLowerCase())
    ),
    [searchInput]
  );

  const getAttendanceIcon = React.useCallback((status) => {
    if (status === null) return "□";
    if (status === true) return "✓";
    if (status === false) return "✕";
    if (status === "half") return "●";
    return "";
  }, []);

  const getAttendanceColor = React.useCallback((status) => {
    if (status === null) return "text-gray-400";
    if (status === true) return "text-green-500";
    if (status === false) return "text-red-500";
    if (status === "half") return "text-purple-500";
    return "";
  }, []);

  const renderAttendanceTable = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-1 text-left text-[11px] font-semibold text-gray-600 w-[8%]">
              Emp ID
            </th>
            <th className="py-2 px-1 text-left text-[11px] font-semibold text-gray-600 w-[10%]">
              Name
            </th>
            <th className="py-2 px-1 text-left text-[11px] font-semibold text-gray-600 w-[8%]">
              Dept
            </th>
            <th className="py-2 px-1 text-left text-[11px] font-semibold text-gray-600 w-[6%]">
              P/TWD
            </th>
            {dates.map((date) => (
              <th 
                key={date.day}
                className="py-1 px-0 text-center text-[10px] font-semibold text-gray-600 w-[2%]"
              >
                <div className="leading-none">{String(date.day).padStart(2, '0')}</div>
                <div className="text-gray-400 text-[8px] leading-tight">{date.weekday}</div>
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
              <td className="py-3 px-1 text-[11px] text-gray-600">
                {employee.id}
              </td>
              <td className="py-3 px-1 text-[11px] text-gray-600">
                {employee.name}
              </td>
              <td className="py-3 px-1 text-[11px] text-gray-600">
                {employee.department}
              </td>
              <td className="py-3 px-1 text-[11px] text-gray-600">
                {employee.p_twd}
              </td>
              {employee.attendance.map((status, dayIndex) => (
                <td
                  key={dayIndex}
                  className={`py-3 px-0 text-center text-[11px] ${getAttendanceColor(
                    status
                  )}`}
                >
                  {getAttendanceIcon(status)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderLeaveTable = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Emp ID
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Name
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Department
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              No. of Payable Days
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Leaves Taken
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Leaves Earned
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Carried Forward Leaves
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600">
              Net Leaves
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredLeaveData.map((leave, index) => (
            <tr
              key={index}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <td className="py-3 px-4 text-sm text-gray-600">{leave.id}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{leave.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {leave.department}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {leave.noOfPayableDays}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {leave.leavesTaken}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {leave.leavesEarned}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {leave.carriedForwardLeaves}
              </td>
              <td className="py-3 px-4 text-sm text-gray-600">
                {leave.netLeaves}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        <HradminNavbar />
        <div className="p-8 pt-24">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Team Attendance</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-600 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                <Calendar size={20} />
                <span>January 2024</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "Attendance Tracker"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("Attendance Tracker")}
              >
                Attendance Tracker
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === "Leave Tracker"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("Leave Tracker")}
              >
                Leave Tracker
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "Attendance Tracker"
              ? renderAttendanceTable()
              : renderLeaveTable()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
