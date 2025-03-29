import React, { useState } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const Leaves = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Main Content Area */}
        <div className="p-5 bg-gray-100 h-full">
          {/* Page Heading */}
          <div className="mb-6 pt-16 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={openModal} // Open modal on click
            >
              Apply for Leave
            </button>
          </div>

          {/* Leave Balance and History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
            {/* Leave Balance */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Leave Balance</h2>
              <div className="mb-4">
                <p className="text-gray-600">Casual Leave</p>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "66%" }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">8 / 12 days</p>
              </div>
              <div className="mb-4">
                <p className="text-gray-600">Sick Leave</p>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "71%" }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">5 / 7 days</p>
              </div>
              <div>
                <p className="text-gray-600">Privilege Leave</p>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">12 / 15 days</p>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Leave History</h2>
              <div className="divide-y divide-gray-200">
                {/* Casual Leave */}
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 font-medium">Casual Leave</p>
                    <p className="text-sm text-gray-500">May 12 - May 14, 2023</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                      Approved
                    </span>
                    <p className="text-sm text-gray-500 mt-1">3 days</p>
                  </div>
                </div>

                {/* Sick Leave */}
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 font-medium">Sick Leave</p>
                    <p className="text-sm text-gray-500">Apr 3, 2023</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                      Approved
                    </span>
                    <p className="text-sm text-gray-500 mt-1">1 day</p>
                  </div>
                </div>

                {/* Privilege Leave */}
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 font-medium">Privilege Leave</p>
                    <p className="text-sm text-gray-500">Mar 15 - Mar 17, 2023</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                      Rejected
                    </span>
                    <p className="text-sm text-gray-500 mt-1">3 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Policies */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Leave Policies</h2>
            <div className="mb-4 bg-gray-50 shadow-md rounded-lg p-3">
              <h3 className="text-md font-semibold text-gray-800">Annual Leave Policy</h3>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                <li>All employees are entitled to 15 days of annual leave per year</li>
                <li>Leave must be applied at least 7 days in advance</li>
                <li>Maximum 5 consecutive days can be taken at once</li>
                <li>Unused leave can be carried forward to the next year (max 5 days)</li>
              </ul>
            </div>
            <div className="bg-gray-50 shadow-md rounded-lg p-3">
              <h3 className="text-md font-semibold text-gray-800">Sick Leave Policy</h3>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                <li>All employees are entitled to 7 days of sick leave per year</li>
                <li>Doctor's certificate required for sick leave of more than 2 consecutive days</li>
                <li>Unused sick leave cannot be carried forward</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

         {/* Modal */}
         {isModalOpen && (
            <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50">
              <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md border border-gray-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">New Leave Application</h2>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={closeModal}
                  >
                    ✕
                  </button>
                </div>
                <form>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Leave Type</label>
                    <select
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                    >
                      <option value="">Select leave type</option>
                      <option>Casual Leave</option>
                      <option>Sick Leave</option>
                      <option>Privilege Leave</option>
                    </select>
                  </div>
                  <div className="mb-4 flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                      rows="3"
                      placeholder="Please provide a reason for your leave"
                    ></textarea>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
    </div>
  );
};

export default Leaves;