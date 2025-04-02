import React, { useState, useEffect, use } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";

import {
  FaUser,
  FaCalendar,
  FaClock,
  FaCreditCard,
  FaUserCircle,
  FaChartPie,
  FaTasks,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
  FaBars,
  FaTimes,
} from "react-icons/fa";

import Link from "next/link";

import RequestDetails from "@/components/RequestDetails";

import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

import { useSelector, useDispatch } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A28BFE",
  "#82CA9D",
];

const Overview = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [showCharts, setShowCharts] = useState(false);

  const [activeIndex, setActiveIndex] = useState(null);

  // const [requestToggle, setRequestToggle] = useState(false);

  const [showRequestDetails, setShowRequestDetails] = useState(false); // New state

  const [activeTab, setActiveTab] = useState("leaveRequests");


  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees);
  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  console.log("Employees:", employees.length); // Log the employees data

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  const handleAttendanceClick = () => {
    setShowCharts((prevShowCharts) => !prevShowCharts); // Toggle Charts

    setShowRequestDetails(false); // Ensure Request Details are hidden
  };

  const handleOpenRequestsClick = () => {
    setShowRequestDetails((prevShowRequestDetails) => !prevShowRequestDetails); // Toggle Request Details

    setShowCharts(false); // Ensure Charts are hidden
  };



  const data = [
    { name: "Mon", present: 80, absent: 10, leave: 5 },

    { name: "Tue", present: 85, absent: 8, leave: 4 },

    { name: "Wed", present: 82, absent: 12, leave: 3 },

    { name: "Thu", present: 84, absent: 9, leave: 5 },

    { name: "Fri", present: 78, absent: 15, leave: 6 },
  ];

  const departmentData = [
    { name: "Engineering", value: 25 },

    { name: "Sales", value: 18 },

    { name: "Marketing", value: 12 },

    { name: "HR", value: 8 },

    { name: "Finance", value: 10 },

    { name: "Product", value: 15 },
  ];

  const overviewData = [
    {
      icon: <FaUser className="h-6 w-6 text-blue-500" />,
      label: "Total Employees",
      count: employees.length,
    },

    {
      icon: <FaClock className="h-6 w-6 text-yellow-500" />,
      label: "Pending Tasks",
      count: 12,
    },

    {
      icon: <FaCreditCard className="h-6 w-6 text-purple-500" />,
      label: "Payroll Status",
      count: "Processed",
    },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"hr"}
      />

      {/* Main Content */}

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Navbar */}

        <HradminNavbar />

        {/* Page Content */}

        <div className="pt-24 px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 text-left">
              Company Overview Dashboard
            </h1>
          </div>

          {/* Overview Cards */}

          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mb-6">
              {overviewData

                .filter((item) => item.label !== "Payroll Status")

                .map((item, index) =>
                  item.label === "Total Employees" ? (
                    <div
                      key={index}
                      className="p-6 bg-white shadow-md rounded-lg flex flex-col justify-between items-start hover:shadow-xl hover:scale-105 transition-transform duration-300"
                      style={{ height: "250px", width: "400px" }}
                    >
                      <div className="flex justify-between items-center w-full">
                        <p className="text-gray-600 text-lg font-semibold">
                          {item.label}
                        </p>

                        <div className="p-2 bg-[#E3ECFB] rounded-full">
                          <FaUsers className="text-[#4876D6] text-2xl" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-4xl font-bold text-gray-800">
                          {item.count}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Active employees in the organization
                        </p>
                      </div>

                      <div className="flex items-center mt-4 text-sm text-green-600">
                        <span className="text-lg">↑</span>

                        <span className="ml-1">+12 from last month</span>
                      </div>
                    </div>
                  ) : item.label === "Pending Tasks" ? (
                    <div
                      key={index}
                      className="p-6 bg-white shadow-md rounded-lg flex flex-col justify-between items-start hover:shadow-xl hover:scale-105 transition-transform duration-300 cursor-pointer"
                      style={{ height: "250px", width: "400px" }}
                      onClick={handleOpenRequestsClick} // Updated click handler
                    >
                      <div className="flex justify-between items-center w-full">
                        <p className="text-gray-600 text-lg font-semibold">
                          Open Requests
                        </p>

                        <div className="p-2 bg-[#E3ECFB] rounded-full">
                          <FaCalendar className="text-[#4876D6] text-2xl" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-4xl font-bold text-gray-800">17</p>

                        <p className="text-sm text-gray-500 mt-1">
                          Leave and expense requests pending
                        </p>
                      </div>

                      <div className="flex items-center mt-4 text-sm text-blue-600">
                        <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-semibold">
                          5 new
                        </span>

                        <span className="ml-2 text-gray-500">last 7 days</span>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="p-6 bg-white shadow-md rounded-lg flex flex-col justify-between items-center hover:shadow-xl hover:scale-105 transition-transform duration-300"
                      style={{ height: "250px", width: "400px" }}
                    >
                      <div className="flex flex-col justify-center items-center">
                        <p className="text-gray-600 text-lg">{item.label}</p>

                        <p className="text-3xl font-bold text-gray-800">
                          {item.count}
                        </p>
                      </div>

                      <div
                        className="p-4 rounded-full shadow-lg"
                        style={{
                          backgroundColor: item.icon.props.className.includes(
                            "text-blue-500"
                          )
                            ? "#0088FE33"
                            : item.icon.props.className.includes(
                                "text-green-500"
                              )
                            ? "#00C49F33"
                            : item.icon.props.className.includes(
                                "text-yellow-500"
                              )
                            ? "#FFBB2833"
                            : "#A28BFE33",
                        }}
                      >
                        <div className="text-4xl">{item.icon}</div>
                      </div>
                    </div>
                  )
                )}
            </div>
          </div>

          {showCharts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 shadow-md rounded-lg hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Weekly Attendance
                </h2>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data}>
                    <XAxis
                      dataKey="name"
                      stroke="#6b7280"
                      tick={{
                        fontSize: 14,
                        fill: "#374151",
                        fontWeight: "bold",
                      }}
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="#d1d5db"
                      tick={{
                        fontSize: 14,
                        fill: "#374151",
                        fontWeight: "bold",
                      }}
                      tickFormatter={(value) => `${value}%`}
                      tickLine={false}
                      axisLine={false}
                    />

                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                    />

                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#ffffff",

                        border: "1px solid #e5e7eb",

                        borderRadius: "8px",

                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",

                        width: "200px",

                        padding: "10px",
                      }}
                      labelStyle={{
                        color: "#000000",

                        fontSize: "14px",

                        fontWeight: "bold",

                        marginBottom: "8px",
                      }}
                      itemStyle={{
                        color: "#374151",

                        fontSize: "12px",

                        display: "flex",

                        alignItems: "center",

                        gap: "8px",
                      }}
                      formatter={(value, name) => {
                        if (value !== undefined) {
                          return [
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    name === "present"
                                      ? "rgb(74, 222, 128)"
                                      : name === "absent"
                                      ? "rgb(248, 113, 113)"
                                      : "#FFBB28",
                                }}
                              ></span>

                              <span className="text-gray-600">
                                {name.charAt(0).toUpperCase() + name.slice(1)}
                              </span>
                            </span>,

                            <span className="font-bold">{value}%</span>,
                          ];
                        }

                        return null;
                      }}
                    />

                    <Bar
                      dataKey="present"
                      fill="rgb(74, 222, 128)"
                      barSize={40}
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="absent"
                      fill="rgb(248, 113, 113)"
                      barSize={40}
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="leave"
                      fill="#FFBB28"
                      barSize={40}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Department Distribution
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="35%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      // onMouseEnter={(data, index) => setActiveIndex(index)}

                      onMouseLeave={() => setActiveIndex(null)}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="none"
                        />
                      ))}
                    </Pie>

                    <Legend
                      layout="vertical"
                      align="right"
                      verticalAlign="middle"
                      wrapperStyle={{ paddingLeft: "20px" }}
                      content={() => (
                        <div>
                          {departmentData.map((entry, index) => (
                            <div key={index} className="flex items-center mb-3">
                              <span
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              ></span>

                              {/* <span

style={{

fontWeight: activeIndex === index ? "bold" : "normal",

color: "#4B5563",

}}

>

{`${entry.name}: ${entry.value} employees`}

</span> */}
                            </div>
                          ))}
                        </div>
                      )}
                    />

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showRequestDetails && ( // Replace requestToggle with showRequestDetails
            <RequestDetails
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Overview;
