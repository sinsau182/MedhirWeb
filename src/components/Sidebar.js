import { FaBars, FaTimes, FaChartPie, FaTasks, FaUsers, FaCalendarCheck, FaMoneyCheckAlt, FaCog } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";


const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const menuItems = [
    { label: "Dashboard", icon: <FaChartPie />, link: "/hradmin/dashboard" },

    { label: "Employees", icon: <FaUsers />, link: "/hradmin/employees" },

    {
      label: "Attendance",
      icon: <FaCalendarCheck />,
      link: "/hradmin/attendance",
    },

    { label: "Payroll", icon: <FaMoneyCheckAlt />, link: "/hradmin/payroll" },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
<div className="p-4 flex items-center mb-4 mt-2">
  <div className={`flex w-full ${isCollapsed ? "justify-center" : "justify-end"}`}>
    <button className="text-gray-600 hover:text-gray-800" onClick={toggleSidebar}>
      {isCollapsed ? <FaBars /> : <FaTimes />}
    </button>
  </div>
</div>




      <nav className="flex-1">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.link}
                className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <span className="text-xl">{item.icon}</span>

                {!isCollapsed && (
                  <span className="ml-4 text-lg">{item.label}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
