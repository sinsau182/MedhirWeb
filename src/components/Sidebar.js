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
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { jwtDecode } from "jwt-decode";

const Sidebar = ({ isCollapsed, toggleSidebar, autoExpand = true }) => {
  const [currentRole, setCurrentRole] = useState("");
  const [expandedMenus, setExpandedMenus] = useState({});
  const [department, setDepartment] = useState("");
  const [userRoles, setUserRoles] = useState([]);
  const [userModules, setUserModules] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const role = sessionStorage.getItem("currentRole");
    const dept = sessionStorage.getItem("departmentName");
    const token = getItemFromSessionStorage("token");
    
    setCurrentRole(role);
    setDepartment(dept);

    // Decode JWT token to get roles and moduleIds
    if (token) {
      const decodedToken = jwtDecode(token);
      if (decodedToken) {
        setUserRoles(decodedToken.roles || []);
        setUserModules(decodedToken.module_ids || []);
        console.log('Decoded token roles:', decodedToken.roles);
        console.log('Decoded token moduleIds:', decodedToken.module_ids);
      }
    }

    // Initialize Settings menu as expanded
    setExpandedMenus((prev) => ({
      ...prev,
      settings: true,
    }));
  }, []);

  // Auto-expand sidebar and select correct module based on current route
  useEffect(() => {
    if (userRoles.length > 0 && userModules.length >= 0 && router.pathname) {
      // Calculate available modules here
      const availableModules = getAvailableModules();
      
      const currentPath = router.pathname;
      
      // Find which module contains the current route
      const activeModule = availableModules.find(module => 
        module.items.some(item => {
          if (item.hasSubmenu) {
            return item.subItems.some(subItem => 
              currentPath.startsWith(subItem.link)
            );
          }
          return currentPath.startsWith(item.link);
        })
      );

      if (activeModule) {
        // Expand the active module
        setExpandedMenus(prev => ({
          ...prev,
          [activeModule.key]: true
        }));

        // Also expand any submenus that contain the current route
        activeModule.items.forEach(item => {
          if (item.hasSubmenu) {
            const hasActiveSubItem = item.subItems.some(subItem => 
              currentPath.startsWith(subItem.link)
            );
            if (hasActiveSubItem) {
              setExpandedMenus(prev => ({
                ...prev,
                [item.menuKey]: true
              }));
            }
          }
        });
      }
    }
  }, [userRoles, userModules, router.pathname]);

  // Define modular menu structure
  const modularMenus = {
    // HR Module
    MOD_HR: {
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
            // {
            //   label: "Admin Access",
            //   icon: <FaUsers className="w-4 h-4" />,
            //   link: "/hradmin/settings/admin-access",
            // },
          ],
        },
      ],
    },

    // Sales Module
    MOD_SALES: {
      label: "Sales & Marketing",
      icon: <FaHandshake className="w-5 h-5" />,
      items: [
        {
          label: "Lead Management",
          icon: <FaTasks className="w-4 h-4" />,
          link: "/Sales/LeadManagement",
        },
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
    MOD_ACCOUNTANT: {
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
        {
          label: "Account Settings",
          icon: <Settings className="w-4 h-4" />,
          link: "/account/settings",
        },
      ],
    },

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
      ],
    },
  };

  // Get available modules based on roles and moduleIds
  const hasAdminRole = () => {
    return userRoles.some(role => 
      role === "ADMIN" || 
      role === "COMPANY_HEAD" || 
      role === "HR_ADMIN" ||
      role.includes("ADMIN")
    );
  };

  const getAvailableModules = () => {
    const modules = [];
    const addedModules = new Set(); // To prevent duplicates
    
    // Check if user has COMPANY_HEAD role with empty moduleIds
    const isCompanyHead = userRoles.includes("COMPANY_HEAD") && userModules.length === 0;
    
    if (isCompanyHead) {
      // Show all modules for COMPANY_HEAD with empty moduleIds
      Object.entries(modularMenus).forEach(([key, module]) => {
        if (!addedModules.has(key)) {
          // Filter out Settings menu if user doesn't have admin role
          if (key === "MOD_HR") {
            const filteredModule = {
              ...module,
              items: module.items.filter(item => 
                item.label !== "Settings" || hasAdminRole()
              )
            };
            modules.push({ key, ...filteredModule });
          } else {
            modules.push({ key, ...module });
          }
          addedModules.add(key);
        }
      });
    } else {
      // Show modules based on moduleIds array
      userModules.forEach((moduleId) => {
        if (modularMenus[moduleId] && !addedModules.has(moduleId)) {
          // Filter out Settings menu if user doesn't have admin role
          if (moduleId === "MOD_HR") {
            const filteredModule = {
              ...modularMenus[moduleId],
              items: modularMenus[moduleId].items.filter(item => 
                item.label !== "Settings" || hasAdminRole()
              )
            };
            modules.push({ key: moduleId, ...filteredModule });
          } else {
            modules.push({ key: moduleId, ...modularMenus[moduleId] });
          }
          addedModules.add(moduleId);
        }
      });
      
      // Also show role-specific modules (EMPLOYEE, MANAGER) if user has those roles
      userRoles.forEach((role) => {
        if (modularMenus[role] && !addedModules.has(role)) {
          modules.push({ key: role, ...modularMenus[role] });
          addedModules.add(role);
        }
      });
    }

    return modules;
  };

  // Auto-expand modules when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed && userRoles.length > 0) {
      const availableModules = getAvailableModules();
      const expandedModules = {};
      availableModules.forEach((module) => {
        expandedModules[module.key] = true;
        // Only expand submenus if they contain the active route
        module.items.forEach((item) => {
          if (item.menuKey && isActiveParent(item)) {
            expandedModules[item.menuKey] = true;
          }
        });
      });
      setExpandedMenus(expandedModules);
    }
  }, [isCollapsed, userRoles, userModules]);

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey], // Toggle between true and false
    }));
  };

  // Debug logging to see what modules are available
  useEffect(() => {
    if (userRoles.length > 0) {
      const availableModules = getAvailableModules();
      console.log('Current Role:', currentRole);
      console.log('User Roles:', userRoles);
      console.log('User Modules:', userModules);
      console.log('Current Path:', router.pathname);
      console.log('Available Modules:', availableModules.map(m => m.key));
    }
  }, [currentRole, userRoles, userModules, router.pathname]);

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
      className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white shadow-md transition-all duration-300 ease-in-out flex flex-col ${
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
            hover:text-blue-600 hover:bg-blue-50 shadow-md 
            transition-all duration-300 ease-in-out
            border border-gray-200 sticky top-16
            transform hover:scale-105 active:scale-95
          `}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className={`transform transition-transform duration-300 ease-in-out ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
            <FaAngleRight className="w-5 h-5" />
          </div>
        </button>
      </div>

      <nav className="flex-1 pt-4 pb-8 sidebar-nav overflow-y-auto">
        <div className="px-4 mb-4">
          {!isCollapsed && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {userRoles.includes("COMPANY_HEAD") && userModules.length === 0 
                ? "All Modules" 
                : "Available Modules"}
            </div>
          )}
        </div>

        <ul className="space-y-1">
          {getAvailableModules().map((module, moduleIndex) => {
            const isModuleExpanded = expandedMenus[module.key] || false;
            const isActive = isModuleActive(module);

            return (
              <li key={moduleIndex} className="relative">
                {/* Module Header */}
                <div
                  onClick={() => toggleMenu(module.key)}
                  className={`group flex items-center px-4 py-3 cursor-pointer transition-all duration-300 ease-in-out ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } ${
                    isActive
                      ? "text-blue-600 bg-blue-50 border-r-2 border-blue-600"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
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
                <div
                  className={`
                    ${isCollapsed ? "pl-0" : "pl-4"} 
                    mt-1 
                    transition-all duration-300 ease-in-out
                    overflow-hidden
                    ${isModuleExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
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
                              className={`group flex items-center px-4 py-2 cursor-pointer transition-all duration-300 ease-in-out ${
                                isCollapsed ? "justify-center" : "gap-3"
                              } ${
                                isParentActive
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
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
                            <div
                              className={`
                                ${isCollapsed ? "pl-0" : "pl-4"} 
                                mt-1 
                                transition-all duration-300 ease-in-out
                                overflow-hidden
                                ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
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
                          </div>
                        ) : (
                          <Link
                            href={item.link}
                            prefetch={true}
                            className={`
                              group flex items-center px-4 py-2 
                              transition-all duration-300 ease-in-out
                              ${isCollapsed ? "justify-center" : "gap-3"}
                              ${
                                isActive
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
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
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;