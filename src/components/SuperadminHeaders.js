import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Search,
  User,
  ChevronDown,
  LogOut,
  Grid3X3,
  Table as LucideTable,
  Plus,
  Upload,
  Settings as SettingsIcon,
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
  const [isLogoUploadOpen, setIsLogoUploadOpen] = useState(false);
  const [currentLogo, setCurrentLogo] = useState("/medd.png"); // Default logo
  const [logoPreview, setLogoPreview] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
      if (isLogoUploadOpen && !event.target.closest('.logo-upload-modal')) {
        setIsLogoUploadOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, isLogoUploadOpen]);

  // Load saved logo from localStorage on component mount
  useEffect(() => {
    const savedLogo = localStorage.getItem('medhir-logo');
    if (savedLogo) {
      setCurrentLogo(savedLogo);
    }
  }, []);

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

  // Handle add company button click
  const handleAddCompanyClick = () => {
    if (router.pathname.includes('/company/')) {
      router.push('/superadmin/companies').then(() => {
        setTimeout(() => {
          if (onAddCompany) {
            onAddCompany();
          }
        }, 100);
      });
    } else {
      if (onAddCompany) {
        onAddCompany();
      }
    }
  };

  // Handle logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a valid image file (JPG, PNG, or SVG)');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size should not exceed 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save new logo
  const handleSaveLogo = () => {
    if (logoPreview) {
      setCurrentLogo(logoPreview);
      localStorage.setItem('medhir-logo', logoPreview);
      setIsLogoUploadOpen(false);
      setLogoPreview(null);
      alert('Logo updated successfully!');
    }
  };

  // Reset to default logo
  const handleResetLogo = () => {
    setCurrentLogo("/medd.png");
    localStorage.removeItem('medhir-logo');
    setIsLogoUploadOpen(false);
    setLogoPreview(null);
    alert('Logo reset to default!');
  };

  return (
    <>
      {/* CSS Styles for Logo */}
      <style jsx>{`
        .logo-container {
          position: relative;
          display: inline-block;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .logo-container:hover {
          transform: translateY(-1px);
        }
        
        .medhir-logo-text {
          font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: #334155;
          letter-spacing: 0.5px;
          user-select: none;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          height: 48px;
        }
        
        .medhir-logo-text:hover {
          color: #3b82f6;
          transform: scale(1.02);
        }

        .logo-settings-btn {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #6b7280;
          color: white;
          border: none;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 10;
        }
        
        .logo-container:hover .logo-settings-btn {
          opacity: 1;
          background: #3b82f6;
        }

        .logo-upload-modal {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          width: 400px;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 999;
        }

        /* Custom header styling - Very soft and neutral */
        .admin-header {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        /* Search input styling for neutral header */
        .search-input {
          background: white !important;
          border: 1px solid #d1d5db !important;
          color: #374151 !important;
        }

        .search-input::placeholder {
          color: #9ca3af !important;
        }

        .search-input:focus {
          background: white !important;
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .search-icon {
          color: #9ca3af !important;
        }
      `}</style>

      <header className="fixed top-0 left-0 right-0 z-50 admin-header">
        <div className="flex items-center justify-between h-16 px-6 min-w-[1000px]">
          
          {/* Left Side: Simple MEDHIR Text Logo */}
          <div className="flex items-center">
            <div className="logo-container">
              <div 
                className="medhir-logo-text"
                onClick={() => router.push('/superadmin/dashboard')}
                title="Go to Dashboard"
              >
                MEDHIR
              </div>
              
              <button
                className="logo-settings-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLogoUploadOpen(true);
                }}
                title="Change Logo"
              >
                <SettingsIcon size={12} />
              </button>
            </div>
          </div>

          {/* Rest of your existing header content */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 search-icon w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies, users, modules..."
                value={searchQuery || ""}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm search-input rounded-lg focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Right Side: Controls & User Menu */}
          <div className="flex items-center gap-4">
            
            {/* Companies Page Controls */}
            {(router.pathname === '/superadmin/companies' || router.pathname.includes('/superadmin/company/')) && (
              <>
                {/* Layout Toggle - Only show on companies list page */}
                {router.pathname === '/superadmin/companies' && (
                  <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setViewLayout && setViewLayout("cards")}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewLayout === "cards" 
                          ? "bg-gray-100 text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      title="Card View"
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewLayout && setViewLayout("table")}
                      className={`p-2 rounded-md transition-all duration-200 ${
                        viewLayout === "table" 
                          ? "bg-gray-100 text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                      title="Table View"
                    >
                      <LucideTable size={18} />
                    </button>
                  </div>
                )}

                {/* Add Company Button */}
                <button
                  onClick={handleAddCompanyClick}
                  className="relative px-5 py-2.5 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 transition-all duration-300 flex items-center gap-2.5 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:-translate-y-0.5 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                  <div className="relative flex items-center gap-2.5">
                    <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors duration-200">
                      <Plus className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Company</span>
                  </div>
                </button>
              </>
            )}
            
            {/* User Dropdown - Your existing code */}
            <div className="relative user-dropdown">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 p-2 hover:bg-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-semibold text-white">SA</span>
                </div>
                
                {/* User Info */}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-700 leading-none">
                    Super Admin
                  </span>
                  <span className="text-xs text-gray-500 leading-none mt-0.5">
                    Administrator
                  </span>
                </div>
                
                {/* Dropdown Arrow */}
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
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

      {/* Logo Upload Modal */}
      {isLogoUploadOpen && (
        <>
          <div className="modal-backdrop" onClick={() => setIsLogoUploadOpen(false)}></div>
          <div className="logo-upload-modal">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Company Logo</h3>
            
            {/* Current Logo Preview */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Current Logo:</p>
              <div className="w-full h-20 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <img src={currentLogo} alt="Current Logo" className="h-16 object-contain" />
              </div>
            </div>

            {/* New Logo Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Logo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, SVG (Max 2MB)</p>
            </div>

            {/* New Logo Preview */}
            {logoPreview && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div className="w-full h-20 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain" />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleResetLogo}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
              >
                Reset to Default
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsLogoUploadOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveLogo}
                  disabled={!logoPreview}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  Save Logo
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
