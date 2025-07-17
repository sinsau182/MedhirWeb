import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FaUsers,
  FaMoneyCheckAlt,
  FaCog,
  FaBuilding,
  FaCalendarAlt,
  FaAngleLeft,
  FaAngleRight,
  FaTasks,
  FaUserTie,
  FaChartLine,
  FaFileInvoiceDollar,
  FaHandshake,
  FaBoxes,
  FaClipboardList,
  FaUserCog,
  FaShieldAlt,
  FaChartBar,
  FaCrown,
} from "react-icons/fa";
import {
  Briefcase,
  Calendar,
  ChartColumnIncreasing,
  Clock,
  CreditCard,
  ReceiptIcon,
  Users,
  Wallet,
  Settings,
  BarChart3,
  FileText,
  Building2,
  UserCheck,
  Shield,
  TrendingUp,
  Database,
  Layers,
} from "lucide-react";
import Link from "next/link";

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
  const [currentRole, setCurrentRole] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [department, setDepartment] = useState("");
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("currentRole");
    const dept = sessionStorage.getItem("departmentName");
    setCurrentRole(role);
    setDepartment(dept);

    // Initialize Settings menu as expanded
    setExpandedMenus((prev) => ({
      ...prev,
      settings: true,
    }));
  }, []);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Role display labels
  // const roleDisplayLabels = {
  //   EMPLOYEE: "Employee",
  //   MANAGER: "Manager",
  //   MODULEADMIN: "Module Admin",
  //   SALES: "Sales Employee",
  //   HOC: "Head of Company",
  //   SUPERADMIN: "Super Admin",
  // };

  // Define modular menu structure
  const modularMenus = {
    // HR Module
    HR: {
      label: "Human Resources",
      icon: <Users className="w-5 h-5" />,
      items: [
        {
          label: "Dashboard",
          icon: <ChartColumnIncreasing className="w-4 h-4" />,
          link: "/hradmin/dashboard",
        },
        {
          label: "Employees",
          icon: <Users className="w-4 h-4" />,
          link: "/hradmin/employees",
        },
        {
          label: "Attendance",
          icon: <Clock className="w-4 h-4" />,
          link: "/hradmin/attendance",
        },
        {
          label: "Payroll",
          icon: <ReceiptIcon className="w-4 h-4" />,
          link: "/hradmin/payroll",
        },
        {
          label: "Settings",
          icon: <Settings className="w-4 h-4" />,
          hasSubmenu: true,
          menuKey: "hr-settings",
          subItems: [
            {
              label: "Organization",
              icon: <FaBuilding className="w-4 h-4" />,
              link: "/hradmin/settings/organization",
            },
            {
              label: "Payroll Settings",
              icon: <FaMoneyCheckAlt className="w-4 h-4" />,
              link: "/hradmin/settings/payrollsettings",
            },
            {
              label: "Leave Management",
              icon: <FaCalendarAlt className="w-4 h-4" />,
              link: "/hradmin/settings/leave",
            },
            {
              label: "Admin Access",
              icon: <FaUsers className="w-4 h-4" />,
              link: "/hradmin/settings/admin-access",
            },
          ],
        },
      ],
    },

    // Sales Module
    SALES: {
      label: "Sales & Marketing",
      icon: <FaHandshake className="w-5 h-5" />,
      items: [
        {
          label: "Lead Management",
          icon: <FaTasks className="w-4 h-4" />,
          link: "/Sales/LeadManagement",
        },
        // {
        //   label: "Sales Dashboard",
        //   icon: <ChartColumnIncreasing className="w-4 h-4" />,
        //   link: "/SalesManager/dashboard",
        // },
        {
          label: "Team Management",
          icon: <FaUsers className="w-4 h-4" />,
          link: "/SalesManager/Manager",
        },
        {
          label: "Sales Settings",
          icon: <Settings className="w-4 h-4" />,
          link: "/SalesManager/setting",
        },
      ],
    },

    // Accounting Module
    ACCOUNTING: {
      label: "Accounting & Finance",
      icon: <FaFileInvoiceDollar className="w-5 h-5" />,
      items: [
        {
          label: "Customers",
          icon: <FaUsers className="w-4 h-4" />,
          link: "/account/customers",
        },
        {
          label: "Vendors",
          icon: <FaBuilding className="w-4 h-4" />,
          link: "/account/vendor",
        },
        {
          label: "Employees",
          icon: <FaUserTie className="w-4 h-4" />,
          link: "/account/employee",
        },
        // {
        //   label: "Financial Reports",
        //   icon: <BarChart3 className="w-4 h-4" />,
        //   link: "/account/reports",
        // },
        {
          label: "Account Settings",
          icon: <Settings className="w-4 h-4" />,
          link: "/account/settings",
        },
      ],
    },

    // Project Management Module
    // PROJECT: {
    //   label: "Project Management",
    //   icon: <FaClipboardList className="w-5 h-5" />,
    //   items: [
    //     {
    //       label: "Expenses",
    //       icon: <ReceiptIcon className="w-4 h-4" />,
    //       link: "/project_Manager/expense",
    //     },
    //     {
    //       label: "Income",
    //       icon: <Wallet className="w-4 h-4" />,
    //       link: "/project_Manager/income",
    //     },
        // {
        //   label: "Project Dashboard",
        //   icon: <ChartColumnIncreasing className="w-4 h-4" />,
        //   link: "/project_Manager/dashboard",
        // },
        // {
        //   label: "Team Management",
        //   icon: <Users className="w-4 h-4" />,
        //   link: "/project_Manager/team",
        // },
    //   ],
    // },

    // Asset Management Module
    // ASSET: {
    //   label: "Asset Management",
    //   icon: <FaBoxes className="w-5 h-5" />,
    //   items: [
    //     {
    //       label: "Asset Dashboard",
    //       icon: <ChartColumnIncreasing className="w-4 h-4" />,
    //       link: "/asset-management",
    //     },
    //     {
    //       label: "Asset Inventory",
    //       icon: <Database className="w-4 h-4" />,
    //       link: "/asset-management/inventory",
    //     },
    //     {
    //       label: "Asset Tracking",
    //       icon: <Layers className="w-4 h-4" />,
    //       link: "/asset-management/tracking",
    //     },
    //     {
    //       label: "Asset Settings",
    //       icon: <Settings className="w-4 h-4" />,
    //       link: "/asset-management/settings",
    //     },
    //   ],
    // },

    // Employee Module
    EMPLOYEE: {
      label: "My Portal",
      icon: <FaUserCog className="w-5 h-5" />,
      items: [
        {
          label: "Dashboard",
          icon: <ChartColumnIncreasing className="w-4 h-4" />,
          link: "/employee/dashboard",
        },
        {
          label: "Leave Management",
          icon: <Calendar className="w-4 h-4" />,
          link: "/employee/leaves",
        },
        {
          label: "Attendance",
          icon: <Clock className="w-4 h-4" />,
          link: "/employee/attendances",
        },
        {
          label: "My Payslips",
          icon: <ReceiptIcon className="w-4 h-4" />,
          link: "/employee/mypayslip",
        },
        {
          label: "Profile",
          icon: <FaUserTie className="w-4 h-4" />,
          link: "/employee/profile",
        },
      ],
    },

    // Manager Module
    MANAGER: {
      label: "My Team",
      icon: <Briefcase className="w-5 h-5" />,
      items: [
        {
          label: "Manager Dashboard",
          icon: <ChartColumnIncreasing className="w-4 h-4" />,
          link: "/manager/dashboard",
        },
        {
          label: "Team Overview",
          icon: <Users className="w-4 h-4" />,
          link: "/manager/team",
        },
        {
          label: "Team Attendance",
          icon: <Clock className="w-4 h-4" />,
          link: "/manager/attendance",
        },
        // {
        //   label: "Performance Reports",
        //   icon: <BarChart3 className="w-4 h-4" />,
        //   link: "/manager/reports",
        // },
      ],
    },
  };

  // Get available modules - show all modules regardless of role
  const getAvailableModules = () => {
    const modules = [];
    const addedModules = new Set(); // To prevent duplicates
    
    // Show all modules regardless of role or current page
    Object.entries(modularMenus).forEach(([key, module]) => {
      if (!addedModules.has(key)) {
        modules.push({ key, ...module });
        addedModules.add(key);
      }
    });

    return modules;
  };

  const availableModules = getAvailableModules();
  
  // Debug logging to see what modules are available
  useEffect(() => {
    console.log('Current Role:', currentRole);
    console.log('Current Path:', router.pathname);
    console.log('Available Modules:', availableModules.map(m => m.key));
  }, [currentRole, availableModules, router.pathname]);

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

  const isModuleActive = (module) => {
    return module.items.some((item) => {
      if (item.hasSubmenu) {
        return item.subItems.some((subItem) =>
          router.pathname.startsWith(subItem.link)
        );
      }
      return isActiveLink(item.link);
    });
  };

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Collapse/Expand Button */}
      <div className="absolute -right-4 top-3 z-50">
        <button
          onClick={toggleSidebar}
          className={`
            flex items-center justify-center w-8 h-8 
            rounded-full bg-white text-gray-600
            hover:text-blue-600 shadow-md 
            transition-all duration-300
            border border-gray-200 sticky top-16
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

      <nav className="flex-1 pt-4 pb-4">
        <div className="px-4 mb-4">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              All Modules
            </div>
          )}
        </div>

        <ul className="space-y-1">
          {availableModules.map((module, moduleIndex) => {
            const isModuleExpanded = expandedMenus[module.key] || false;
            const isActive = isModuleActive(module);

            return (
              <li key={moduleIndex} className="relative">
                {/* Module Header */}
                <div
                  onClick={() => toggleMenu(module.key)}
                  className={`group flex items-center px-4 py-3 cursor-pointer transition-all duration-200 ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive
                      ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-lg ${
                      isActive
                        ? "text-blue-600"
                        : "group-hover:text-blue-600"
                    }`}
                  >
                    {module.icon}
                  </span>
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">
                        {module.label}
                      </span>
                      <span className="transform transition-transform duration-200">
                        {isModuleExpanded ? (
                          <FaAngleLeft className="w-3 h-3" />
                        ) : (
                          <FaAngleRight className="w-3 h-3" />
                        )}
                      </span>
                    </>
                  )}
                </div>

                {/* Module Items */}
                {isModuleExpanded && (
                  <div
                    className={`
                      ${isCollapsed ? "pl-0" : "pl-4"} 
                      mt-1 
                      transition-all duration-200 
                      overflow-hidden
                    `}
                  >
                    {module.items.map((item, itemIndex) => {
                      const isActive = isActiveLink(item.link);
                      const isParentActive = isActiveParent(item);
                      const isExpanded = item.menuKey
                        ? expandedMenus[item.menuKey]
                        : false;

                      return (
                        <div key={itemIndex}>
                          {item.hasSubmenu ? (
                            <div>
                              <div
                                onClick={() => toggleMenu(item.menuKey)}
                                className={`group flex items-center px-4 py-2 cursor-pointer transition-all duration-200 ${
                                  isCollapsed ? "justify-center" : "gap-3"
                                } ${
                                  isParentActive
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                }`}
                              >
                                <span
                                  className={`text-base ${
                                    isParentActive
                                      ? "text-blue-600"
                                      : "group-hover:text-blue-600"
                                  }`}
                                >
                                  {item.icon}
                                </span>
                                {!isCollapsed && (
                                  <>
                                    <span className="text-sm flex-1">
                                      {item.label}
                                    </span>
                                    <span className="transform transition-transform duration-200">
                                      {isExpanded ? (
                                        <FaAngleLeft className="w-3 h-3" />
                                      ) : (
                                        <FaAngleRight className="w-3 h-3" />
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
                                          className={`text-sm ${
                                            isSubActive ? "text-blue-600" : ""
                                          }`}
                                        >
                                          {subItem.icon}
                                        </span>
                                        {!isCollapsed && (
                                          <span className="text-xs">
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
                                group flex items-center px-4 py-2 
                                transition-all duration-200 
                                ${isCollapsed ? "justify-center" : "gap-3"}
                                ${
                                  isActive
                                    ? "text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                                }
                              `}
                              aria-label={item.label}
                            >
                              <span
                                className={`text-base ${
                                  isActive
                                    ? "text-blue-600"
                                    : "group-hover:text-blue-600"
                                }`}
                              >
                                {item.icon}
                              </span>
                              {!isCollapsed && (
                                <span className="text-sm">{item.label}</span>
                              )}
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;