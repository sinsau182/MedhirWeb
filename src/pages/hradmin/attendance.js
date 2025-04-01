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

  // Sample employee data with attendance records
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
    },
    {
      id: "MED004",
      name: "Mahesh",
      department: "SALES",
      p_twd: "18/20",
      attendance: Array(31).fill(null).map((_, i) => 
        i < 3 ? null : i % 7 === 0 ? null : Math.random() > 0.2
      )
    },
    {
      id: "MED005",
      name: "Rohit",
      department: "HR",
      p_twd: "18/20",
      attendance: Array(31).fill(null).map((_, i) => 
        i < 3 ? null : i % 7 === 0 ? null : Math.random() > 0.2
      )
    },
    {
      id: "MED006",
      name: "Suresh",
      department: "IT",
      p_twd: "18/20",
      attendance: Array(31).fill(null).map((_, i) => 
        i < 3 ? null : i % 7 === 0 ? null : Math.random() > 0.2
      )
    }
  ];

  // Leave data
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
    },
    {
      id: "MED004",
      name: "Mahesh",
      department: "SALES",
      noOfPayableDays: "25",
      leavesTaken: "4",
      leavesEarned: "10",
      carriedForwardLeaves: "2",
      netLeaves: "8",
    },
    {
      id: "MED005",
      name: "Rohit",
      department: "HR",
      noOfPayableDays: "25",
      leavesTaken: "6",
      leavesEarned: "10",
      carriedForwardLeaves: "2",
      netLeaves: "6",
    },
    {
      id: "MED006",
      name: "Suresh",
      department: "IT",
      noOfPayableDays: "25",
      leavesTaken: "3",
      leavesEarned: "10",
      carriedForwardLeaves: "2",
      netLeaves: "9",
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
              <td className="py-3 px-1 text-[12px] text-gray-800">
                {employee.id}
              </td>
              <td className="py-3 px-1 text-[12px] text-gray-800">
                {employee.name}
              </td>
              <td className="py-3 px-1 text-[12px] text-gray-800">
                {employee.department}
              </td>
              <td className="py-3 px-1 text-[12px] text-gray-800">
                {employee.p_twd}
              </td>
              {employee.attendance.map((status, index) => (
                <td 
                  key={index}
                  className={`py-3 px-0 text-center text-[11px] ${getAttendanceColor(status)}`}
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
              Payable Days
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Leaves Taken
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Leaves Earned
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              CF Leaves
            </th>
            <th className="py-2 px-2 text-left text-[13px] font-semibold text-gray-600 whitespace-nowrap">
              Net Leaves
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filteredLeaveData.map((leave) => (
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
                {leave.carriedForwardLeaves}
              </td>
              <td className="py-2 px-2 text-[13px] text-gray-600 whitespace-nowrap">
                {leave.netLeaves}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (isLoading) {
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

      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Search Bar */}
          <div className="mb-6">
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

          {activeTab === "Attendance Tracker" ? renderAttendanceTable() : renderLeaveTable()}
        </div>
      </div>
    </div>
  );
}

export default Attendance;
