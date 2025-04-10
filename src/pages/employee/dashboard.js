import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaUserCheck, FaClock } from "react-icons/fa"; // Removed FaUser since we won't need it
import Link from "next/link";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import axios from 'axios';
import { useSelector } from "react-redux";
import { toast } from "sonner";
import withAuth from "@/components/withAuth";

const Overview = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const { leaveHistory } = useSelector((state) => state.leaveReducer);

  const fetchLeaveBalance = async () => {
    setIsLoadingBalance(true);
    setBalanceError(null);
    try {
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/leave-balance/current/EMP001`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        setLeaveBalance(response.data);
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
      setBalanceError(error.response?.data?.message || error.message || 'Failed to fetch leave balance');
      toast.error("Failed to fetch leave balance");
    } finally {
      setIsLoadingBalance(false);
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to view dashboard");
      window.location.href = "/login";
      return;
    }
    fetchLeaveBalance();
  }, [token]);

  // Refetch balance when leave history changes
  useEffect(() => {
    if (token) {
      fetchLeaveBalance();
    }
  }, [leaveHistory, token]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} currentRole={"employee"} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Main Content Area */}
        <div className="p-5 bg-gray-100 h-full">
          {/* Page Heading */}
          <div className="mb-10 pt-16">
            <h1 className="text-2xl font-bold text-gray-800 text-left">
              Employee Dashboard
            </h1>
          </div>

          {/* Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Leave Balance Card */}
            <Link href="/employee/leaves">
              <div className="p-8 bg-white shadow-lg rounded-xl flex flex-col justify-between items-start hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer border border-gray-100"
                   style={{ height: "250px", width: "350px" }}>
                <div className="flex justify-between items-center w-full mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Leave Balance</h2>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
                    <FaCalendarAlt className="text-blue-600 text-2xl" />
                  </div>
                </div>
                {isLoadingBalance ? (
                  <div className="text-gray-500">Loading leave balance...</div>
                ) : balanceError ? (
                  <div className="text-red-500">{balanceError}</div>
                ) : leaveBalance ? (
                  <div className="space-y-2">
                    <p className="text-5xl font-bold text-gray-900">{leaveBalance.newLeaveBalance}</p>
                    <div className="flex items-center text-gray-600">
                      <p className="text-sm">Days remaining</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500">No leave balance data available</div>
                )}
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Overview);
