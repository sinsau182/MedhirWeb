import React, { useState } from "react";
import { Search, Calendar, Edit } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayrolls } from "@/redux/slices/payrollSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const payrollData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    paidDays: 20,
    ctc: 5000,
    salary: 4500,
    basic: 3000,
    deductions: 500,
    taxes: 200,
    taxPro: 100,
    reimbursement: 300,
    advance: 400,
    netPay: 3500,
  },
  {
    employeeId: "EMP002",
    name: "Jane Smith",
    paidDays: 22,
    ctc: 6000,
    salary: 5500,
    basic: 3500,
    deductions: 600,
    taxes: 300,
    taxPro: 200,
    reimbursement: 400,
    advance: 500,
    netPay: 4500,
  },
  {
    employeeId: "EMP003",
    name: "Alice Johnson",
    paidDays: 18,
    ctc: 4000,
    salary: 3500,
    basic: 2500,
    deductions: 400,
    taxes: 200,
    taxPro: 100,
    reimbursement: 300,
    advance: 200,
    netPay: 3300,
  },
];

const advanceData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "HR",
    oldAdvance: 1000,
    thisMonthAdvance: 500,
    deductInThisMonth: 200,
    balanceForNextMonth: 300,
  },
  {
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Finance",
    oldAdvance: 1500,
    thisMonthAdvance: 700,
    deductInThisMonth: 300,
    balanceForNextMonth: 400,
  },
  {
    employeeId: "EMP003",
    name: "Alice Johnson",
    department: "IT",
    oldAdvance: 800,
    thisMonthAdvance: 300,
    deductInThisMonth: 100,
    balanceForNextMonth: 200,
  },
];

const reimbursementData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Sales",
    reimbursementAmount: 1000,
    status: "Approved",
    type: "Project",
    category: "Local Transport",
    description: "Client meeting travel expenses",
    receipt: null
  },
  {
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    reimbursementAmount: 1500,
    status: "Pending",
    type: "Non Project",
    category: "Stationery",
    description: "Monthly office supplies",
    receipt: null
  },
  {
    employeeId: "EMP003",
    name: "Alice Johnson",
    department: "IT",
    reimbursementAmount: 800,
    status: "Rejected",
    type: "Project",
    category: "Hardware",
    description: "New keyboard purchase",
    receipt: null
  },
];

const paymentHistoryData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Sales",
    paymentDate: "2023-01-31",
    amount: 4500,
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  {
    employeeId: "EMP002",
    name: "Jane Smith",
    department: "Marketing",
    paymentDate: "2023-01-31",
    amount: 5500,
    paymentMode: "Cheque",
    status: "Pending",
  },
  {
    employeeId: "EMP003",
    name: "Alice Johnson",
    department: "IT",
    paymentDate: "2023-01-31",
    amount: 3500,
    paymentMode: "Cash",
    status: "Paid",
  },
];

function PayrollManagement() {
  const [selectedSection, setSelectedSection] = useState("Salary Statement");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
    // Here you can add logic to fetch payroll data for the selected month and year
  };

  const getTableHeaders = () => {
    switch (selectedSection) {
      case "Salary Statement":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "paidDays", label: "Paid Days" },
          { key: "ctc", label: "CTC" },
          { key: "salary", label: "Salary" },
          { key: "basic", label: "Basic" },
          { key: "deductions", label: "Deductions" },
          { key: "taxes", label: "Taxes" },
          { key: "taxPro", label: "Tax Pro" },
          { key: "reimbursement", label: "Reimbursement" },
          { key: "advance", label: "Advance" },
          { key: "netPay", label: "Net Pay" },
        ];
      case "Advance":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "department", label: "Department" },
          { key: "oldAdvance", label: "Old Advance" },
          { key: "thisMonthAdvance", label: "This Month" },
          { key: "deductInThisMonth", label: "Deduction" },
          { key: "balanceForNextMonth", label: "Balance" },
        ];
      case "Reimbursement":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "department", label: "Department" },
          { key: "type", label: "Reimb. Type" },
          { key: "category", label: "Category" },
          { key: "description", label: "Description" },
          { key: "reimbursementAmount", label: "Amount" },
          { key: "status", label: "Status" },
          { key: "receipt", label: "Receipt" }
        ];
      case "Payment History":
        return [
          { key: "employeeId", label: "Employee ID" },
          { key: "name", label: "Name" },
          { key: "department", label: "Department" },
          { key: "paymentDate", label: "Date" },
          { key: "amount", label: "Amount" },
          { key: "paymentMode", label: "Mode" },
          { key: "status", label: "Status" },
        ];
      default:
        return [];
    }
  };

  const getTableData = () => {
    switch (selectedSection) {
      case "Salary Statement":
        return payrollData;
      case "Advance":
        return advanceData;
      case "Reimbursement":
        return reimbursementData;
      case "Payment History":
        return paymentHistoryData;
      default:
        return [];
    }
  };

  const headers = getTableHeaders();
  const data = getTableData().filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.department &&
        item.department.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Header with Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              <div className="relative">
                <Badge
                  variant="outline"
                  className="px-6 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                  onClick={toggleCalendar}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium text-base">{selectedYear}-{selectedMonth}</span>
                </Badge>
                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b">
                      <div className="text-sm font-medium text-gray-700">{selectedYear}</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-3">
                      {[
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                      ].map((month) => (
                        <button
                          key={month}
                          className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                            month === selectedMonth.slice(0, 3) 
                              ? 'bg-blue-50 text-blue-600 font-medium hover:bg-blue-100' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={() => handleMonthSelection(month, selectedYear)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {[
              "Salary Statement",
              "Advance",
              "Reimbursement",
              "Payment History",
            ].map((section) => (
              <button
                key={section}
                className={`px-4 py-2 text-sm font-medium ${
                  selectedSection === section
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setSelectedSection(section)}
              >
                {section}
              </button>
            ))}
          </div>

     
     {/* Table */}
     <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="w-full overflow-auto">
              {selectedSection === "Salary Statement" ? (
                <table className="w-full table-fixed">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[8%]">
                        EMP ID
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[10%]">
                        NAME
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[8%]">
                        PAID DAYS
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[10%]">
                        MONTHLY CTC
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[10%]">
                        THIS MONTH
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[10%]">
                        BASIC
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[10%]">
                        DEDUCTIONS
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[8%]">
                        TAXES
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[8%]">
                        PRO TAX
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[10%]">
                        REIMBURSEMENT
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[8%]">
                        ADVANCE
                      </th>
                      <th className="py-2 px-2 text-left text-xs font-semibold text-gray-600 w-[8%]">
                        NET PAY
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollData
                      .filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-2 text-xs text-gray-600">
                            {item.employeeId}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            {item.name}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            {item.paidDays}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.ctc}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.salary}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.basic}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.deductions}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.taxes}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.taxPro}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.reimbursement}
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-600">
                            ₹{item.advance}
                          </td>
                          <td className="py-2 px-2 text-xs font-semibold text-gray-600">
                            ₹{item.netPay}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              ) : selectedSection === "Reimbursement" ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header.key}
                          className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                        >
                          {header.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={headers.length}
                          className="text-center py-2 px-2 text-xs text-gray-500"
                        >
                          No data found
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {headers.map((header) => (
                            <td
                              key={header.key}
                              className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap"
                            >
                              {header.key === "receipt" ? (
                                <button
                                  onClick={() => alert("No uploaded receipt")}
                                  className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors duration-200"
                                >
                                  View Receipt
                                </button>
                              ) : header.key === "reimbursementAmount" ? (
                                `₹${item[header.key]}`
                              ) : (
                                item[header.key]
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header.key}
                          className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap"
                        >
                          {header.label.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={headers.length}
                          className="text-center py-2 px-2 text-xs text-gray-500"
                        >
                          No data found
                        </td>
                      </tr>
                    ) : (
                      data.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          {headers.map((header) => (
                            <td
                              key={header.key}
                              className="py-2 px-2 text-xs text-gray-600 whitespace-nowrap"
                            >
                              {header.key.includes("amount") ||
                              header.key === "oldAdvance" ||
                              header.key === "thisMonthAdvance" ||
                              header.key === "deductInThisMonth" ||
                              header.key === "balanceForNextMonth"
                                ? "₹"
                                : ""}
                              {item[header.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PayrollManagement;