import React, { useEffect, useState } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchExpenses } from "@/redux/slices/expenseSlice";

const Expenses = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector((state) => state.expenses);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Fetch expenses when the component mounts
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

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
                {loading ? ( 
                  <p className="text-gray-500">Loading...</p>
                ) : error ? (
                  <p className="text-red-500">Error: {error}</p>
                ) : expenses.length === 0 ? (
                  <p className="text-gray-500">No recent expenses found.</p>
                ) : (
                  expenses.map((expense) => {
                    const formattedDate = new Date(expense.timestamp).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                  
                    return (
                      <div
                        key={expense.id}
                        className="bg-white shadow-md rounded-lg p-4 flex justify-between items-center"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{expense.category}</p>
                          <p className="text-xs text-gray-500">
                            {formattedDate} • ₹{expense.amount}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            expense.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {expense.status}
                        </span>
                      </div>
                    );
                  })        
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
