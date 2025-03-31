import React, { useState } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const Expenses = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
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
          <div className="mb-6 pt-16">
            <h1 className="text-2xl font-bold text-gray-800">Expense Management</h1>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Submit New Expense */}
            <div className="bg-white shadow-md rounded-lg p-6 md:border-r md:border-gray-300">
              <h2 className="text-lg font-semibold mb-4">Submit New Expense</h2>
              <form>
                {/* Amount and Category */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-black">Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm text-gray-700 h-14 px-3"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">Category</label>
                    <select
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm text-gray-700 h-14 bg-white px-3"
                    >
                      <option>Travel, Meals, Equipment</option>
                      <option>Travel</option>
                      <option>Meals</option>
                      <option>Equipment</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    placeholder="Provide details about the expense"
                    className="w-full border border-gray-300 rounded-lg shadow-sm focus:ring-0 focus:border-gray-400 text-sm text-gray-700 px-3 py-2"
                    rows="4"
                  ></textarea>
                </div>

                {/* Upload Receipt */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Upload Receipt</label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 relative cursor-pointer hover:border-gray-400"
                    onClick={() => document.getElementById("file-upload").click()}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".jpg,.png,.pdf"
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 mx-auto text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <p className="text-sm mt-2">Click to upload receipt</p>
                    <p className="text-xs">JPG, PNG, or PDF</p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm"
                >
                  Submit Expense
                </button>
              </form>
            </div>

            {/* Recent Expenses */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
              <div className="space-y-4">
                {/* Expense Item */}
                <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Travel</p>
                    <p className="text-xs text-gray-500">15 Jun 2023 • ₹1,250</p>
                  </div>
                  <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                    Approved
                  </span>
                </div>

                {/* Expense Item */}
                <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Meals</p>
                    <p className="text-xs text-gray-500">22 Jun 2023 • ₹850</p>
                  </div>
                  <span className="bg-yellow-100 text-yellow-600 text-xs font-semibold px-2 py-1 rounded-full">
                    Pending
                  </span>
                </div>

                {/* Expense Item */}
                <div className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Equipment</p>
                    <p className="text-xs text-gray-500">30 Jun 2023 • ₹5,000</p>
                  </div>
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                    Rejected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
