import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import MedhirFreshLogo from "./MedhirFreshLogo";
import {
  Search,
  User,
  ChevronDown,
  LogOut,
  Grid3X3,
  Table as LucideTable,
  Plus,
} from "lucide-react";

// Route to title mapping
const titleMap = {
  "/superadmin/companies": "Companies",
  "/superadmin/dashboard": "Dashboard",
  "/superadmin/company/[id]": "Company Details",
};

export default function SuperadminHeaders({ 
  viewLayout, 
  setViewLayout, 
  onAddCompany,
  searchQuery,
  setSearchQuery 
}) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const getPageTitle = () => {
    if (router.pathname.includes('/company/')) {
      return "Company Details";
    }
    return titleMap[router.pathname] || "Dashboard";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#F9FAFB] border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6 min-w-[1000px]">
        
        {/* Left Side: Fresh MEDHIR Logo */}
        <div className="flex items-center">
          <MedhirFreshLogo size="default" />
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
            <input
              type="text"
              placeholder="Search companies, users, modules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#6B7280] bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
            />
          </div>
        </div>

        {/* Right Side: Controls & User Menu */}
        <div className="flex items-center gap-4">
          
          {/* Companies Page Controls */}
          {(router.pathname === '/superadmin/companies' || router.pathname.includes('/superadmin/company/')) && (
            <>
              {/* Layout Toggle */}
              <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewLayout && setViewLayout("cards")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewLayout === "cards" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                  title="Card View"
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewLayout && setViewLayout("table")}
                  className={`p-2 rounded-md transition-all duration-200 ${
                    viewLayout === "table" 
                      ? "bg-blue-600 text-white shadow-sm" 
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                  title="Table View"
                >
                  <LucideTable size={18} />
                </button>
              </div>

              {/* Add Company Button */}
              <button
                onClick={onAddCompany}
                className="relative px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2.5 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 group overflow-hidden"
              >
                {/* Animated background shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                
                <div className="relative flex items-center gap-2.5">
                  <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="hidden sm:inline font-medium">Add Company</span>
                </div>
              </button>
            </>
          )}
          
          {/* User Dropdown */}
          <div className="relative user-dropdown">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {/* User Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-full flex items-center justify-center shadow-sm">
                <span className="text-sm font-semibold text-white">SA</span>
              </div>
              
              {/* User Info */}
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium text-[#111827] leading-none">
                  Super Admin
                </span>
                <span className="text-xs text-[#6B7280] leading-none mt-0.5">
                  Administrator
                </span>
              </div>
              
              {/* Dropdown Arrow */}
              <ChevronDown
                className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in slide-in-from-top-2 duration-200">
                
                {/* User Info Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">SA</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        Super Admin
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        superadmin@medhir.com
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <Link
                    href="/superadmin/profile"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#111827] hover:bg-[#F9FAFB] transition-colors duration-150"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <User className="w-4 h-4 text-[#6B7280]" />
                    <span>Profile Settings</span>
                  </Link>
                  

                </div>

                {/* Logout */}
                <div className="border-t border-gray-100 pt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
