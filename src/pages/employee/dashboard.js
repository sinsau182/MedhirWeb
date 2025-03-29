import React, { useState } from "react";
import { FaCalendarAlt, FaUserCheck, FaClock } from "react-icons/fa"; // Importing icons
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
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

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
                {/* <p className="text-gray-600 mt-2">
                  Welcome to your dashboard. Here is an overview of your activities.
                </p> */}
                </div>

                {/* Cards Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Leave Balance</h2>
                <div className="p-2 bg-blue-100 rounded-full">
                  <FaCalendarAlt className="text-blue-500 text-2xl" />
                </div>
              </div>
              <p className="text-4xl font-bold mt-2">21</p>
              <p className="text-gray-500">Days remaining</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Attendance</h2>
                <div className="p-2 bg-green-100 rounded-full">
                  <FaUserCheck className="text-green-500 text-2xl" />
                </div>
              </div>
              <p className="text-4xl font-bold mt-2">98%</p>
              <p className="text-green-500">↑ 2% from last month</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-2xl hover:scale-105 hover:-translate-y-1 transition-transform duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Today</h2>
                <div className="p-2 bg-orange-100 rounded-full">
                  <FaClock className="text-orange-500 text-2xl" />
                </div>
              </div>
              <p className="text-4xl font-bold mt-2">Mar 29</p>
              <p className="text-gray-500">Checked in at 6:09 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;