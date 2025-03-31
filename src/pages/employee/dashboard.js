import React, { useState } from "react";
import { FaCalendarAlt, FaUserCheck, FaClock } from "react-icons/fa"; // Importing icons
import Link from "next/link"; // Importing Link from next/link
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
            {/* Card 1 */}
            <Link href="/employee/leaves"> {/* Use href for navigation */}
              <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-transform duration-300 cursor-pointer">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Leave Balance</h2>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <FaCalendarAlt className="text-blue-500 text-2xl" />
                  </div>
                </div>
                <p className="text-4xl font-bold mt-2">21</p>
                <p className="text-gray-500">Days remaining</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;