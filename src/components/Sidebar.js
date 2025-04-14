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
  FaBuilding,
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import {
  Briefcase,
  Calendar,
  ChartColumnIncreasing,
  Clock,
  CreditCard,
  ReceiptIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { FiLoader } from "react-icons/fi";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [currentRole, setCurrentRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("currentRole");
    setCurrentRole(role);

    // Initialize Settings menu as expanded
    setExpandedMenus((prev) => ({
      ...prev,
      settings: true,
    }));

    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    router.events.on("routeChangeStart", handleRouteChangeStart);
    router.events.on("routeChangeComplete", handleRouteChangeComplete);
    router.events.on("routeChangeError", handleRouteChangeComplete);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
      router.events.off("routeChangeComplete", handleRouteChangeComplete);
      router.events.off("routeChangeError", handleRouteChangeComplete);
    };
  }, [router.events]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Define menu items based on the role
  const menuItems = [
    {
      label: "Dashboard",
      icon: <ChartColumnIncreasing />,
      link: "/hradmin/dashboard",
      roles: ["hr"],
    },
    {
      label: "Employees",
      icon: <Users />,
      link: "/hradmin/employees",
      roles: ["hr"],
    },
    {
      label: "Attendance",
      icon: <Clock />,
      link: "/hradmin/attendance",
      roles: ["hr"],
    },
    {
      label: "Payroll",
      icon: <ReceiptIcon />,
      link: "/hradmin/payroll",
      roles: ["hr"],
    },
    {
      label: "Settings",
      icon: <FaCog />,
      roles: ["hr"],
      hasSubmenu: true,
      menuKey: "settings",
      subItems: [
        {
          label: "Organization",
          icon: <FaBuilding />,
          link: "/hradmin/settings/organization",
        },
        {
          label: "Payroll",
          icon: <FaMoneyCheckAlt />,
          link: "/hradmin/settings/payrollsettings",
        },
        {
          label: "Leaves",
          icon: <FaCalendarAlt />,
          link: "/hradmin/settings/leave",
        },
        {
          label: "Admin Access",
          icon: <FaUsers />,
          link: "/hradmin/settings/admin-access",
        }
      ],
    },

    {
      label: "Dashboard",
      icon: <ChartColumnIncreasing />,
      link: "/manager/dashboard",
      roles: ["manager"],
    },
    {
      label: "Team",
      icon: <Briefcase />,
      link: "/manager/team",
      roles: ["manager"],
    },
    {
      label: "Attendance",
      icon: <Clock />,
      link: "/manager/attendance",
      roles: ["manager"],
    },

    {
      label: "Dashboard",
      icon: <ChartColumnIncreasing />,
      link: "/employee/dashboard",
      roles: ["employee"],
    },
    {
      label: "Leave",
      icon: <Calendar />,
      link: "/employee/leaves",
      roles: ["employee"],
    },
    {
      label: "Reimbursement",
      icon: <CreditCard />,
      link: "/employee/reimbursement",
      roles: ["employee"],
    },
    {
      label: "Attendance",
      icon: <Clock />,
      link: "/employee/attendances",
      roles: ["employee"],
    },
    {
      label: "My Payslips",
      icon: <ReceiptIcon />,
      link: "/employee/mypayslip",
      roles: ["employee"],
    },
  ];

  // Filter menu items based on currentRole
  const filteredMenu = menuItems.filter((item) =>
    item.roles.includes(currentRole)
  );

  const isActiveLink = (link) => {
    if (!link) return false;
    return router.pathname === link || router.pathname.startsWith(link);
  };

  const isActiveParent = (item) => {
    if (!item.hasSubmenu) return false;
    return item.subItems.some((subItem) =>
      router.pathname.startsWith(subItem.link)
    );
  };

  return (
    <>
      {/* Spinner and Overlay */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

          <FiLoader className="w-10 h-10 animate-spin text-blue-600" />

        </div>
      )}

      {/* Disable interaction with the page when loading */}
      <div className={`${isLoading ? "pointer-events-none" : ""}`}>
        <aside
          className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          {/* Collapse/Expand Button - Moved to top left */}
          <div className="absolute -right-4 top-3 z-50">
            <button
              onClick={toggleSidebar}
              className={`
                flex items-center justify-center w-8 h-8 
                rounded-full bg-white text-gray-600
                hover:text-blue-600 shadow-md 
                transition-all duration-300
                border border-gray-200
              `}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <FaAngleRight className="w-5 h-5" />
              ) : (
                <FaAngleLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          <nav className="flex-1 pt-4">
            <ul className="space-y-2">
              {filteredMenu.map((item, index) => {
                const isActive = isActiveLink(item.link);
                const isParentActive = isActiveParent(item);
                const isExpanded = item.menuKey
                  ? expandedMenus[item.menuKey]
                  : false;

                return (
                  <li key={index} className="relative">
                    {item.hasSubmenu ? (
                      <div>
                        <div
                          onClick={() => toggleMenu(item.menuKey)}
                          className={`group flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${
                            isCollapsed ? "justify-center" : "gap-4"
                          } ${
                            isParentActive
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          <span
                            className={`text-xl ${
                              isParentActive
                                ? "text-blue-600"
                                : "group-hover:text-blue-600"
                            }`}
                          >
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <>
                              <span className="text-lg flex-1">
                                {item.label}
                              </span>
                              <span className="transform transition-transform duration-200">
                                {isExpanded ? (
                                  <FaAngleLeft className="w-4 h-4" />
                                ) : (
                                  <FaAngleRight className="w-4 h-4" />
                                )}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Submenu items */}
                        {isExpanded && (
                          <div
                            className={`
                              ${isCollapsed ? "pl-0" : "pl-4"} 
                              mt-1 
                              transition-all duration-200 
                              overflow-hidden
                            `}
                          >
                            {item.subItems.map((subItem, subIndex) => {
                              const isSubActive = isActiveLink(subItem.link);

                              return (
                                <Link
                                  key={subIndex}
                                  href={subItem.link}
                                  prefetch={true}
                                  className={`
                                    flex items-center px-4 py-2 
                                    transition-all duration-200 
                                    ${isCollapsed ? "justify-center" : "gap-3"}
                                    ${
                                      isSubActive
                                        ? "text-blue-600 bg-blue-50"
                                        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                    }
                                  `}
                                >
                                  <span
                                    className={`text-lg ${
                                      isSubActive ? "text-blue-600" : ""
                                    }`}
                                  >
                                    {subItem.icon}
                                  </span>
                                  {!isCollapsed && (
                                    <span className="text-sm">
                                      {subItem.label}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.link}
                        prefetch={true}
                        className={`
                          group flex items-center px-4 py-3 
                          transition-all duration-200 
                          ${isCollapsed ? "justify-center" : "gap-4"}
                          ${
                            isActive
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }
                        `}
                        aria-label={item.label}
                      >
                        <span
                          className={`text-xl ${
                            isActive
                              ? "text-blue-600"
                              : "group-hover:text-blue-600"
                          }`}
                        >
                          {item.icon}
                        </span>
                        {!isCollapsed && (
                          <span className="text-lg">{item.label}</span>
                        )}
                      </Link>
                    )}
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