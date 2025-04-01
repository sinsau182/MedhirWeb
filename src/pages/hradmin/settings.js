import React, { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

const Settings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showTitleModal, setShowTitleModal] = useState(false);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    head: "",
    description: "",
  });
  const [titleForm, setTitleForm] = useState({
    name: "",
    department: "",
    isManager: false,
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ show: false, type: "", message: "" });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!departmentForm.name) {
      newErrors.name = "Department name is required";
    }
    if (!departmentForm.head) {
      newErrors.head = "Department head is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save department
      setNotification({
        show: true,
        type: "success",
        message: "Department added successfully!",
      });
      setShowDepartmentModal(false);
      setDepartmentForm({ name: "", head: "", description: "" });
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add department. Please try again.",
      });
    }
  };

  const handleTitleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!titleForm.name) {
      newErrors.name = "Title name is required";
    }
    if (!titleForm.department) {
      newErrors.department = "Department is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save title
      setNotification({
        show: true,
        type: "success",
        message: "Title added successfully!",
      });
      setShowTitleModal(false);
      setTitleForm({ name: "", department: "", isManager: false, description: "" });
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add title. Please try again.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />

        <div className="p-6 mt-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Department Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Departments</h2>
                <button
                  onClick={() => setShowDepartmentModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Department
                </button>
              </div>

              {/* Department List */}
              <div className="space-y-4">
                {/* TODO: Add department list */}
              </div>
            </div>

            {/* Title Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Titles</h2>
                <button
                  onClick={() => setShowTitleModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Title
                </button>
              </div>

              {/* Title List */}
              <div className="space-y-4">
                {/* TODO: Add title list */}
              </div>
            </div>
          </div>

          {/* Department Modal */}
          {showDepartmentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Department</h2>
                  <button
                    onClick={() => setShowDepartmentModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleDepartmentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Name
                    </label>
                    <input
                      type="text"
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter department name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department Head
                    </label>
                    <select
                      value={departmentForm.head}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, head: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select department head</option>
                      {/* TODO: Add employee list */}
                    </select>
                    {errors.head && (
                      <p className="text-red-500 text-sm mt-1">{errors.head}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={departmentForm.description}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter department description"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowDepartmentModal(false)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Title Modal */}
          {showTitleModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">Add New Title</h2>
                  <button
                    onClick={() => setShowTitleModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleTitleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title Name
                    </label>
                    <input
                      type="text"
                      value={titleForm.name}
                      onChange={(e) => setTitleForm({ ...titleForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter title name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <select
                      value={titleForm.department}
                      onChange={(e) => setTitleForm({ ...titleForm, department: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select department</option>
                      {/* TODO: Add department list */}
                    </select>
                    {errors.department && (
                      <p className="text-red-500 text-sm mt-1">{errors.department}</p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={titleForm.isManager}
                      onChange={(e) => setTitleForm({ ...titleForm, isManager: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Is Manager
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={titleForm.description}
                      onChange={(e) => setTitleForm({ ...titleForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter title description"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowTitleModal(false)}
                      className="px-4 py-2 border rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification.show && (
            <div className="fixed bottom-4 right-4 z-50">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
