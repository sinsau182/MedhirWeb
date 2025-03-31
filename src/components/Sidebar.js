import { useState, useEffect } from "react";
import { FaBars, FaAngleDoubleLeft, FaChartPie, FaUsers, FaCalendarCheck, FaMoneyCheckAlt } from "react-icons/fa";
import Link from "next/link";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("currentRole"); // Fetch role from localStorage
    setCurrentRole(role);
  }, []);

  // Define menu items based on the role
  const menuItems = [
    { label: "Dashboard", icon: <FaChartPie />, link: "/hradmin/dashboard", roles: ["hr"] },
    { label: "Employees", icon: <FaUsers />, link: "/hradmin/employees", roles: ["hr"] },
    { label: "Attendance", icon: <FaCalendarCheck />, link: "/hradmin/attendance", roles: ["hr"] },
    { label: "Payroll", icon: <FaMoneyCheckAlt />, link: "/hradmin/payroll", roles: ["hr"] },

    { label: "Dashboard", icon: <FaCalendarCheck />, link: "/manager/dashboard", roles: ["manager"] },
    { label: "Team", icon: <FaChartPie />, link: "/manager/team", roles: ["manager"] },
    { label: "Attendance", icon: <FaCalendarCheck />, link: "/manager/attendance", roles: ["manager"] },

    { label: "Dashboard", icon: <FaChartPie />, link: "/employee/dashboard", roles: ["employee"] },
    { label: "Leave", icon: <FaUsers />, link: "/employee/leaves", roles: ["employee"] },
    { label: "Expenses", icon: <FaCalendarCheck />, link: "/employee/expenses", roles: ["employee"] },
    { label: "Attendance", icon: <FaCalendarCheck />, link: "/employee/attendances", roles: ["employee"] },
    { label: "My Payslips", icon: <FaMoneyCheckAlt />, link: "/employee/mypayslip", roles: ["employee"] },
  ];

  // Filter menu items based on currentRole
  const filteredMenu = menuItems.filter(item => item.roles.includes(currentRole));

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 flex items-center mb-4 mt-2">
        <div className={`flex w-full ${isCollapsed ? "justify-center" : "justify-end"}`}>
          <button className="text-gray-600 hover:text-gray-800" onClick={toggleSidebar}>
            {isCollapsed ? <FaBars /> : <FaAngleDoubleLeft />}
          </button>
        </div>
      </div>

      <nav className="flex-1">
        <ul className="space-y-2">
          {filteredMenu.map((item, index) => (
            <li key={index}>
              <Link
                href={item.link}
                className={`flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && <span className="ml-4 text-lg">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
