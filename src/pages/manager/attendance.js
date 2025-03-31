import React, { useState, useEffect } from "react";

import {
  CheckCircle,
  XCircle,
  CalendarCheck,
  Syringe,
  Sofa,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { ne } from "drizzle-orm";

function Attendance() {
  const [searchInput, setSearchInput] = useState("");

  const [selectedMonth, setSelectedMonth] = useState(new Date()); // Default to the current month

  const [dates, setDates] = useState([]);

  const [activeTab, setActiveTab] = useState("Attendance Tracker"); // Default tab
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Hardcoded employee attendance data

  const employees = [
    {
      id: "MED001",

      name: "Arun",

      department: "Sales",

      p_twd: "18/20",

      attendance: [
        "P",
        "P",
        "A",
        "P",
        "P",
        "WK",
        "P",
        "P",
        "P",
        "A",
        "P",
        "P",
        "P",
        "P",
      ],
    },

    {
      id: "MED002",

      name: "Naman",

      department: "Design",

      p_twd: "18/20",

      attendance: [
        "P",
        "A",
        "P",
        "P",
        "P",
        "WK",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
      ],
    },

    {
      id: "MED003",

      name: "Amit",

      department: "Marketing",

      p_twd: "18/20",

      attendance: [
        "P",
        "P",
        "P",
        "P",
        "P",
        "WK",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
        "P",
      ],
    },
  ];

  // Hardcoded leave data

  const leaveData = [
    {
      id: "MED001",

      name: "Arun",

      department: "Sales",

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

      name: "Ravi",

      department: "HR",

      noOfPayableDays: "25",

      leavesTaken: "4",

      leavesEarned: "10",

      carriedForwardLeaves: "2",

      netLeaves: "8",
    },

    {
      id: "MED005",

      name: "Priya",

      department: "Finance",

      noOfPayableDays: "25",

      leavesTaken: "6",

      leavesEarned: "10",

      carriedForwardLeaves: "2",

      netLeaves: "6",
    },
  ];

  // Generate dates for the selected month

  useEffect(() => {
    const generateDates = () => {
      const year = selectedMonth.getFullYear();

      const month = selectedMonth.getMonth();

      const daysInMonth = new Date(year, month + 1, 0).getDate();

      return Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(year, month, i + 1);

        return {
          month: date.toLocaleString("default", { month: "short" }),

          day: String(date.getDate()).padStart(2, "0"),

          weekday: date.toLocaleString("default", { weekday: "short" }),
        };
      });
    };

    setDates(generateDates());
  }, [selectedMonth]);

  // Filter employees based on search input

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  // Handle month change

  const handleMonthChange = (e) => {
    const newDate = new Date(e.target.value);

    setSelectedMonth(newDate);
  };

  return (
    <div className="bg-gray-50 text-black min-h-screen p-6">
      {/* Header */}

{/* Sidebar */}
<Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

{/* Main content container */}
<div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
  

{/* Main Content */}
<div className="flex-1">
  {/* Navbar */}
  <HradminNavbar />

      {/* Sub-navbar */}

      <div className="mt-20 p-6">
        <div className="flex space-x-4 mb-6">
          {["Attendance Tracker", "Leave Tracker"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search and Month Selector */}

        {activeTab === "Attendance Tracker" && (
          <div className="flex justify-between items-center mb-6">
            {/* Search Bar */}

            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search employee..."
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Month Selector */}

            <div className="flex items-center">
              <input
                type="month"
                className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={`${selectedMonth.getFullYear()}-${String(
                  selectedMonth.getMonth() + 1
                ).padStart(2, "0")}`}
                onChange={handleMonthChange}
              />
            </div>
          </div>
        )}

        {/* Attendance Table */}

        {activeTab === "Attendance Tracker" && (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full table-fixed border-collapse border border-gray-300">
            <thead className="bg-gray-100 text-xs">
  <tr>
    <th className="px-2 py-3 border border-gray-300 text-left">Emp ID</th>
    <th className="px-2 py-3 border border-gray-300 text-left">Name</th>
    <th className="px-2 py-3 border border-gray-300 text-left">Dept</th>
    <th className="px-2 py-3 border border-gray-300 text-center">P/TWD</th>

    {dates.map((date, index) => (
      <th key={index} className="px-1 py-3 border border-gray-300 text-center text-[12px] w-[30px]">
        {date.day} {/* Only date numbers */}
      </th>
    ))}
  </tr>
</thead>


  <tbody className="text-xs">
    {filteredEmployees.map((employee) => (
      <tr key={employee.id} className="even:bg-gray-50">
        <td className="px-2 py-2 border border-gray-300">{employee.id}</td>
        <td className="px-2 py-2 border border-gray-300">{employee.name}</td>
        <td className="px-2 py-2 border border-gray-300">{employee.department}</td>
        <td className="px-2 py-2 border border-gray-300 text-center">{employee.p_twd}</td>

        {dates.map((_, index) => (
          <td key={index} className="px-1 py-2 border border-gray-300 w-[30px]">
            <div className="flex justify-center items-center h-full">
            {employee.attendance[index] === "P" ? (
              <CheckCircle className="text-green-500" size={16} />
            ) : employee.attendance[index] === "A" ? (
              <XCircle className="text-red-500" size={16} />
            ) : (
              <CalendarCheck className="text-gray-500" size={16} />
            )}
            </div>
          </td>
        ))}
      </tr>
    ))}
  </tbody>
</table>

          </div>
        )}

        {/* Leave Tracker Table */}

        {activeTab === "Leave Tracker" && (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Employee ID
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Department
                  </th>
                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    No. of Payable Days
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Leave Taken
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Leave Earned
                  </th>
                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Carried Forward Leaves
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Net Leaves
                  </th>
                </tr>
              </thead>

              <tbody>
                {leaveData.map((leave) => (
                  <tr
                    key={leave.id}
                    className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.id}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.name}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.department}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.noOfPayableDays}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.leavesTaken}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.leavesEarned}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.carriedForwardLeaves}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700"> 
                      {leave.netLeaves}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  </div>
  </div>
  );
}

export default Attendance;
