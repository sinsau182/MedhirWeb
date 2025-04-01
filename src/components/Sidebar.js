import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaBars,
  FaAngleDoubleLeft,
  FaChartPie,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
} from "react-icons/fa";
import { Briefcase, Calendar, ChartColumnIncreasing, Clock, CreditCard, DollarSign, DollarSignIcon, ReceiptIcon, User, Users } from "lucide-react";
import Link from "next/link";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [currentRole, setCurrentRole] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("currentRole"); // Fetch role from localStorage
    setCurrentRole(role);

    // Listen to route change events
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    // Cleanup event listeners on unmount
    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, [router.events]);

  // Define menu items based on the role
  const menuItems = [
    { label: "Dashboard", icon: <ChartColumnIncreasing />, link: "/hradmin/dashboard", roles: ["hr"] },
    { label: "Employees", icon: <Users />, link: "/hradmin/employees", roles: ["hr"] },
    { label: "Attendance", icon: <Clock />, link: "/hradmin/attendance", roles: ["hr"] },
    { label: "Payroll", icon: <ReceiptIcon />, link: "/hradmin/payroll", roles: ["hr"] },
    { label: "Settings", icon: <FaCog />, link: "/hradmin/settings", roles: ["hr"] },

    { label: "Dashboard", icon: <ChartColumnIncreasing />, link: "/manager/dashboard", roles: ["manager"] },
    { label: "Team", icon: <Briefcase />, link: "/manager/team", roles: ["manager"] },
    { label: "Attendance", icon: <Clock />, link: "/manager/attendance", roles: ["manager"] },

    { label: "Dashboard", icon: <ChartColumnIncreasing />, link: "/employee/dashboard", roles: ["employee"] },
    { label: "Leave", icon: <Calendar />, link: "/employee/leaves", roles: ["employee"] },
    { label: "Reimbursement", icon: <CreditCard />, link: "/employee/reimbursement", roles: ["employee"] },
    { label: "Attendance", icon: <Clock />, link: "/employee/attendances", roles: ["employee"] },
    { label: "My Payslips", icon: <ReceiptIcon />, link: "/employee/mypayslip", roles: ["employee"] },
  ];

  // Filter menu items based on currentRole
  const filteredMenu = menuItems.filter((item) => item.roles.includes(currentRole));

  const isActiveLink = (link) => {
    return router.pathname === link;
  };

  return (
    <>
      {/* Spinner and Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Disable interaction with the page when loading */}
      <div className={`${isLoading ? "pointer-events-none" : ""}`}>
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
              {filteredMenu.map((item, index) => {
                const isActive = isActiveLink(item.link);
                return (
                  <li key={index}>
                    <Link
                      href={item.link}
                      prefetch={true}
                      className={`group flex items-center px-4 py-3 transition-all duration-200 ${
                        isCollapsed ? "justify-center" : "gap-4"
                      } ${
                        isActive 
                          ? "text-blue-600" 
                          : "text-gray-600 hover:text-blue-600"
                      }`}
                      aria-label={item.label}
                    >
                      <span className={`text-xl ${isActive ? "text-blue-600" : "group-hover:text-blue-600"}`}>
                        {item.icon}
                      </span>
                      {!isCollapsed && (
                        <span className="text-lg">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
