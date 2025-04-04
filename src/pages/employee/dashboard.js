import React, { useState } from "react";
import { FaCalendarAlt, FaUserCheck, FaClock } from "react-icons/fa"; // Removed FaUser since we won't need it
import Link from "next/link";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const Overview = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
                <div className="flex justify-between items-center w-full mb-8">
                  <h2 className="text-xl font-semibold text-gray-800">Leave Balance</h2>
                  <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full">
                    <FaCalendarAlt className="text-blue-600 text-2xl" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-5xl font-bold text-gray-900">21</p>
                  <div className="flex items-center text-gray-600">
                    <p className="text-sm">Days remaining</p>
                    <div className="ml-2 px-2 py-1 bg-blue-50 rounded-full">
                      <span className="text-xs text-blue-600 font-medium">This Year</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;