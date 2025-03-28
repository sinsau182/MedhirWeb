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

      leaveType: "Sick Leave",

      startDate: "2023-03-01",

      endDate: "2023-03-03",

      status: "Approved",
    },

    {
      id: "MED002",

      name: "Naman",

      department: "Design",

      leaveType: "Casual Leave",

      startDate: "2023-03-05",

      endDate: "2023-03-06",

      status: "Pending",
    },

    {
      id: "MED003",

      name: "Amit",

      department: "Marketing",

      leaveType: "Earned Leave",

      startDate: "2023-03-10",

      endDate: "2023-03-12",

      status: "Rejected",
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

                  <th className="px-4 py-2 border border-gray-300 text-center text-sm font-medium text-gray-700">
                    P / T.W.D
                  </th>

                  {dates.map((date, index) => (
                    <th
                      key={index}
                      className="px-2 py-2 border border-gray-300 text-center text-xs font-medium text-gray-700"
                    >
                      <div>
                        <div>{date.day}</div>

                        <div>{date.weekday}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="even:bg-gray-50 hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {employee.id}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {employee.name}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {employee.department}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-center text-sm text-gray-700">
                      {employee.p_twd}
                    </td>

                    {dates.map((_, index) => (
                      <td
                        key={index}
                        className="px-2 py-2 border border-gray-300 text-center"
                      >
                        {employee.attendance[index] === "P" ? (
                          <CheckCircle className="text-green-500" size={16} />
                        ) : employee.attendance[index] === "A" ? (
                          <XCircle className="text-red-500" size={16} />
                        ) : employee.attendance[index] === "WK" ? (
                          <CalendarCheck className="text-gray-500" size={16} />
                        ) : (
                          <div className="w-4 h-4 border border-gray-300 rounded"></div>
                        )}
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
                    Leave Type
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Start Date
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    End Date
                  </th>

                  <th className="px-4 py-2 border border-gray-300 text-left text-sm font-medium text-gray-700">
                    Status
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
                      {leave.leaveType}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.startDate}
                    </td>

                    <td className="px-4 py-2 border border-gray-300 text-sm text-gray-700">
                      {leave.endDate}
                    </td>

                    <td
                      className={`px-4 py-2 border border-gray-300 text-sm font-medium ${
                        leave.status === "Approved"
                          ? "text-green-500"
                          : leave.status === "Pending"
                          ? "text-yellow-500"
                          : "text-red-500"
                      }`}
                    >
                      {leave.status}
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
