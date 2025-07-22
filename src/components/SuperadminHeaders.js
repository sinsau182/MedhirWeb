import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { FaBuilding, FaCog, FaUserCircle } from "react-icons/fa";
import { Grid2x2, ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/router";
import { toast } from "sonner";

export default function SuperadminHeaders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Update activeTab based on the current route
  useEffect(() => {
    const path = router.pathname.split("/").pop();
    setActiveTab(path.charAt(0).toUpperCase() + path.slice(1));
  }, [router.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all session storage
    sessionStorage.clear();
    // Clear localStorage
    localStorage.clear();
    // Show success message
    toast.success("Logged out successfully");
    // Redirect to login
    router.push("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center z-50">
      <div className="flex items-center gap-4">
        <div className="cursor-pointer">
          <div className="flex flex-col">
            <span className="text-4xl font-black text-gray-900 tracking-[0.2em] uppercase">
              MEDHIR
            </span>
          </div>
        </div>
      </div>
      
      <nav className="flex flex-grow justify-center space-x-20 text-lg font-medium">
        {[].map((item, index) => (
          <Link key={index} href={`/superadmin/${item.toLowerCase()}`} passHref>
            <button
              onClick={() => setActiveTab(item)}
              className={`hover:text-blue-600 transition-colors duration-200 ${
                activeTab === item
                  ? "text-blue-600 bg-blue-50 rounded-lg px-3 py-2"
                  : "text-gray-600"
              }`}
              style={{
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {item === "Companies" && (
                <FaBuilding
                  className="inline-block text-current"
                  style={{ fontSize: "16px", verticalAlign: "middle" }}
                />
              )}
              {item === "Modules" && (
                <Grid2x2
                  className="inline-block w-5 h-5 text-current"
                  style={{ fontSize: "16px", verticalAlign: "middle" }}
                />
              )}
              {item}
            </button>
          </Link>
        ))}
      </nav>

      <div className="relative" ref={dropdownRef}>
        <button
          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all duration-200 font-medium"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <FaUserCircle className="w-4 h-4 text-blue-600" />
          </div>
          <span>Super Admin</span>
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`} 
          />
        </button>
        
        {isDropdownOpen && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Super Admin</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            

            
            <div className="border-t border-gray-100 pt-1">
              <button
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-150"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
