import React, { useState } from "react";
import Link from "next/link";
import { FaUserCircle, FaChartPie, FaTasks, FaUsers, FaCalendarCheck, FaMoneyCheckAlt, FaCog } from "react-icons/fa";
import PendingRequestsCard from "@/components/PendingRequestsCard";
import RequestDetails from "@/components/RequestDetails";

const MyTask = () => {
  const [activeTab, setActiveTab] = useState("leaveRequests");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("My Task"); // Define activePage state

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    console.log("Logged out");
    // Add logout logic here
  };

  return (
    <div className="bg-[#F7FBFE] min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md px-10 py-4 flex justify-between items-start z-50 border-b border-gray-300">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-20 text-lg font-medium">
          {["Overview", "My Task", "Employees", "Attendance", "Payroll", "Settings"].map((item, index) => (
            <Link key={index} href={`/hradmin/${item.toLowerCase().replace(" ", "")}`} passHref>
              <button
                onClick={() => setActivePage(item)} // Update activePage state
                className={`hover:text-[#4876D6] ${
                  activePage === item ? "text-black bg-[#E3ECFB] rounded-md px-2 py-1" : "text-[#6c757d]"
                }`}
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {item === "Overview" && <FaChartPie className="inline-block text-black opacity-80" />}
                {item === "My Task" && <FaTasks className="inline-block text-black opacity-80" />}
                {item === "Employees" && <FaUsers className="inline-block text-black opacity-80" />}
                {item === "Attendance" && <FaCalendarCheck className="inline-block text-black opacity-80" />}
                {item === "Payroll" && <FaMoneyCheckAlt className="inline-block text-black opacity-80" />}
                {item === "Settings" && <FaCog className="inline-block text-black opacity-80" />}
                {item}
              </button>
            </Link>
          ))}
        </nav>
        <div className="relative">
          <button className="flex items-center gap-2 text-black font-medium" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <FaUserCircle className="text-2xl" />
            HR Admin
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 flex-1">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome to HR Dashboard</h1>
          <p className="text-gray-600 mb-8">Manage and process employee requests efficiently from a single interface.</p>

          <PendingRequestsCard />
          <RequestDetails activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </main>

    </div>
  );
};

export default MyTask;
