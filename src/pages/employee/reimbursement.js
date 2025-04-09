import React, { useEffect, useState, useRef } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchExpenses, createExpense } from "@/redux/slices/expenseSlice";
import { toast } from "sonner";
import withAuth from "@/components/withAuth";

const Expenses = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showAllExpenses, setShowAllExpenses] = useState(false); // State to toggle "View More"
  const dispatch = useDispatch();
  const { expenses, loading, error } = useSelector((state) => state.expenses);

  const fileInputRef = useRef(null);

  const [expenseData, setExpenseData] = useState({
    employeeId: "emp123",
    amount: "",
    category: "",
    description: "",
    receipt: null,
    expenseType: "project", // Default to project expenses
  });

  const projectCategories = ["Travel", "Meals", "Fuel"];
  const nonProjectCategories = ["Equipment", "Cleaning Liquid", "Advance Salary"];

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpenseData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
    
  
    const handleFileChange = (e) => {
      const file = e.target.files[0];
      console.log("Selected file:", file); // Debugging
      if (file) {
        setExpenseData((prevData) => ({
          ...prevData,
          receipt: file,
        }));
      }
    };
  
    const handleClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
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
            <h1 className="text-2xl font-bold text-gray-800">
            Reimbursements
            </h1>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Submit New Expense */}
            <div className="bg-white shadow-md rounded-lg p-6 md:border-r md:border-gray-300">
              <h2 className="text-lg font-semibold mb-4">Submit New Reimbursement</h2>
              <form>
                {/* Expense Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Reimbursement Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="expenseType"
                        value="project"
                        checked={expenseData.expenseType === "project"}
                        onChange={(e) => {
                          setExpenseData(prev => ({
                            ...prev,
                            expenseType: e.target.value,
                            category: "" // Reset category when type changes
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Project</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="expenseType"
                        value="non-project"
                        checked={expenseData.expenseType === "non-project"}
                        onChange={(e) => {
                          setExpenseData(prev => ({
                            ...prev,
                            expenseType: e.target.value,
                            category: "" // Reset category when type changes
                          }));
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">Non-Project</span>
                    </label>
                  </div>
                </div>

                {/* Amount and Category */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Amount (₹)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseData.amount}
                      onChange={handleChange}
                      placeholder="Enter amount"
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm text-gray-700 h-14 bg-white px-3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black">
                      Category
                    </label>
                    <select
                      name="category"
                      value={expenseData.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm text-gray-700 h-14 bg-white px-3"
                      required
                    >
                      <option value="">Select a category</option>
                      {expenseData.expenseType === "project" 
                        ? projectCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))
                        : nonProjectCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))
                      }
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={expenseData.description}
                    onChange={handleChange}
                    placeholder="Enter a brief description of the expense"
                    className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm text-gray-700 h-24 bg-white px-3"
                  ></textarea>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Upload Receipt
                  </label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 relative cursor-pointer hover:border-gray-400"
                    onClick={handleClick}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".jpg,.png,.pdf"
                      onChange={handleFileChange}
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
                  {expenseData.receipt && (
                    <p className="mt-2 text-sm text-green-600">
                      File uploaded: {expenseData.receipt.name}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(createExpense(expenseData));
                    setExpenseData({
                      employeeId: "emp123",
                      amount: "",
                      category: "",
                      description: "",
                      receipt: null,
                      expenseType: "project",
                    });
                    toast.success("Expense submitted successfully!");
                  }}
                >
                  Send For Approval
                </button>
              </form>
            </div>

            {/* Recent Expenses */}
            <div
              className={`bg-white shadow-md rounded-lg p-6 flex flex-col transition-all duration-300 ${
                showAllExpenses ? "h-[600px]" : "h-[550px]"
              }`}
            >
              <h2 className="text-lg font-semibold mb-4">Recent Reimbursements </h2>
              <div
                className={`space-y-4 ${
                  showAllExpenses ? "overflow-y-auto" : "overflow-hidden"
                } flex-grow`}
              >
                {/* Expense Item */}
                {loading ? (
                  <p className="text-gray-500">Loading...</p>
                ) : error ? (
                  <p className="text-red-500">Error: {error}</p>
                ) : expenses.length === 0 ? (
                  <p className="text-gray-500">No recent expenses found.</p>
                ) : (
                  expenses
                    .slice(0, showAllExpenses ? expenses.length : 5)
                    .map((expense) => {
                      const formattedDate = new Date(
                        expense.timestamp
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      });

                      return (
                        <div
                          key={expense.id}
                          className="bg-gray-50 shadow-sm rounded-lg p-4 flex justify-between items-center"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {expense.category}
                            </p>
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
              {/* View More Button */}
              {expenses.length > 5 && (
                <button
                  onClick={() => setShowAllExpenses(!showAllExpenses)}
                  className="mt-4 text-blue-500 hover:underline text-sm self-center"
                >
                  {showAllExpenses ? "View Less" : "View More"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Expenses);