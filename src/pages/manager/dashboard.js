/* eslint-disable react/jsx-key */
import React, { useCallback, useState, useEffect } from "react";

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

import { FaUser, FaCalendar, FaUsers } from "react-icons/fa";

import RequestDetails from "@/components/RequestDetails";

import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

import { useSelector, useDispatch } from "react-redux";
import { fetchManagerDashboardData } from "@/redux/slices/managerDashboardSlice";

import withAuth from "@/components/withAuth";
import { toast } from "sonner";


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
  
  // Get data from Redux store
  const { 
    employeeCount, 
    pendingLeaves, 
    pendingCompOffs, 
    profileUpdates,
    loading: dashboardLoading,
    error: dashboardError
  } = useSelector((state) => state.managerDashboard);
  


  useEffect(() => {
    // Fetch all dashboard data on component mount
    dispatch(fetchManagerDashboardData());
  }, [dispatch]);

  // Handle dashboard errors
  useEffect(() => {
    if (dashboardError) {
      toast.error(dashboardError);
    }
  }, [dashboardError]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleOpenRequestsClick = () => {
    setShowRequestDetails((prevShowRequestDetails) => !prevShowRequestDetails); // Toggle Request Details
    setShowCharts(false); // Ensure Charts are hidden
  };

  // Function to refresh dashboard data
  const refreshDashboardData = useCallback(() => {
    dispatch(fetchManagerDashboardData());
  }, [dispatch]);

  // Sample data - should be replaced with actual API data
  const data = [];

  const departmentData = [];

  const overviewData = [
    {
      icon: <FaUser className="h-6 w-6 text-blue-500" />,
      label: "Team Members",
      count: employeeCount,
    },

    {
      icon: <FaCalendar className="h-6 w-6 text-green-500" />,
      label: "Open Requests",
      count:
        pendingLeaves.length + pendingCompOffs.length + profileUpdates.length,
    },
  ];

  const refreshRequests = useCallback(async () => {
    dispatch(fetchManagerDashboardData());
  }, [dispatch]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}

      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"manager"}
      />

      {/* Main Content */}

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        {/* Navbar */}

        <HradminNavbar />

        {/* Page Content */}

        <div className="pt-24 px-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 text-left">
              Manager Dashboard
            </h1>
          </div>

          {/* Overview Cards */}

          {dashboardLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading dashboard data...</span>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-6">
              {overviewData

                .filter((item) => item.label !== "Payroll Status")

                .map((item, index) =>
                  item.label === "Team Members" ? (
                    <div
                      key={index}
                      className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                      style={{ height: "250px", width: "100%" }}
                      onClick={() => (window.location.href = "/manager/team")}
                    >
                      <div className="flex justify-between items-center w-full mb-8">
                        <p className="text-xl font-semibold text-gray-800">
                          {item.label}
                        </p>
                        <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
                          <FaUsers className="text-blue-600 text-2xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-5xl font-bold text-gray-900">
                          {item.count}
                        </p>
                        <div className="flex items-center text-gray-600">
                          <p className="text-sm">People in your department</p>
                          <div className="ml-2 px-2 py-1 bg-blue-50 rounded-full">
                            <span className="text-xs text-blue-600 font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : item.label === "Open Requests" ? (
                    <div
                      key={index}
                      className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                      style={{ height: "250px", width: "100%" }}
                      onClick={handleOpenRequestsClick}
                    >
                      <div className="flex justify-between items-center w-full mb-8">
                        <p className="text-xl font-semibold text-gray-800">
                          {item.label}
                        </p>
                        <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-full">
                          <FaCalendar className="text-green-600 text-2xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-5xl font-bold text-gray-900">
                          {item.count}
                        </p>
                        <div className="flex items-center text-gray-600">
                          <p className="text-sm">Pending requests</p>
                          <div className="ml-2 px-2 py-1 bg-green-50 rounded-full">
                            <span className="text-xs text-green-600 font-medium">
                              Last 7 days
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={index}
                      className="p-6 bg-white shadow-md rounded-lg flex flex-col justify-between items-center hover:shadow-xl hover:scale-105 transition-transform duration-300"
                      style={{ height: "250px", width: "100%" }}
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
          )}

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
                      tickFormatter={(value) => `${value}`}
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

                        width: "auto",

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

                            <span className="font-bold">{value}</span>,
                          ];
                        }

                        return null;
                      }}
                    />

                    {/* Chart bars will be rendered when data is available */}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-6 shadow-md rounded-lg">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Department Distribution
                </h2>

                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    {/* Pie chart will be rendered when department data is available */}

                    {/* Legend will be rendered when department data is available */}

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {showRequestDetails && (
            <RequestDetails
              activeTab={activeTab}
              onTabChange={handleTabChange}
              onActionComplete={refreshRequests}
              role="MANAGER"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Overview);
