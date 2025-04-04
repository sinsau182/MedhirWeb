import React, { useState } from "react";
import { Search, Calendar } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { Badge } from "@/components/ui/badge";

// Sample data
const payrollData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    paidDays: "22/22",
    ctc: "50,000",
    salary: "45,000",
    basic: "25,000",
    hra: "10,000",
    allowance: "5,000",
    overtimePay: "2,000",
    deductions: "3,000",
    reimbursement: "1,000",
    netPay: "45,000",
  },
  // ... other payroll data
];

const advanceData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Sales",
    oldAdvance: "10,000",
    thisMonthAdvance: "5,000",
    deductInThisMonth: "2,000",
    balanceForNextMonth: "13,000",
  },
  // ... other advance data
];

const reimbursementData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Sales",
    reimbursementAmount: "2,000",
    status: "Approved",
    type: "Travel",
    category: "Local Transport",
    description: "Client meeting travel",
    receipt: "receipt.pdf",
  },
  // ... other reimbursement data
];

const paymentHistoryData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Sales",
    paymentDate: "2024-03-01",
    amount: "45,000",
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  // ... other payment history data
];

const deductionsData = [
  {
    employeeId: "EMP001",
    name: "John Doe",
    department: "Sales",
    employeePF: "2,750",
    employerPF: "2,750",
    tds: "2,000",
    profTax: "200",
    advanceAdjusted: "2,000",
    netDeductions: "5,000",
  },
  // ... other deductions data
];

function PayrollManagement() {
  const [selectedSection, setSelectedSection] = useState("Salary Statement");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("March");
  const [selectedYear, setSelectedYear] = useState("2024");

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
  };

  const renderPayrollTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="w-full overflow-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[8%]">EMP ID</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">NAME</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[8%]">PAID DAYS</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">MONTHLY CTC</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">THIS MONTH</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">BASIC</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">HRA</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">ALLOWANCE</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">OVERTIME PAY</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">DEDUCTIONS</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[10%]">REIMBURSEMENT</th>
              <th className="py-2 px-2 text-left text-xs font-semibold text-gray-700 w-[8%]">NET PAY</th>
            </tr>
          </thead>
          <tbody>
            {payrollData
              .filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-sm text-gray-800">{item.employeeId}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">{item.name}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">{item.paidDays}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.ctc}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.salary}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.basic}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.hra}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.allowance}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.overtimePay}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.deductions}</td>
                  <td className="py-2 px-2 text-sm text-gray-800">₹{item.reimbursement}</td>
                  <td className="py-2 px-2 text-sm font-semibold text-gray-900">₹{item.netPay}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDeductionsTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="w-full overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee PF</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employer PF</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">TDS</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Professional Tax</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Advance Adjusted</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Deductions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {deductionsData
              .filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs text-gray-600">{item.employeeId}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.name}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.department}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.employeePF}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.employerPF}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.tds}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.profTax}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.advanceAdjusted}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.netDeductions}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdvanceTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="w-full overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Old Advance</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">This Month Advance</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Deduct in This Month</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance for Next Month</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {advanceData
              .filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs text-gray-600">{item.employeeId}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.name}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.department}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.oldAdvance}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.thisMonthAdvance}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.deductInThisMonth}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.balanceForNextMonth}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReimbursementTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="w-full overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reimbursementData
              .filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs text-gray-600">{item.employeeId}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.name}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.department}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.type}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.category}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.description}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.reimbursementAmount}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.status}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    <button
                      onClick={() => alert("No uploaded receipt")}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors duration-200"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPaymentHistoryTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="w-full overflow-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee ID</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Date</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment Mode</th>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paymentHistoryData
              .filter((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs text-gray-600">{item.employeeId}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.name}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.department}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.paymentDate}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">₹{item.amount}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.paymentMode}</td>
                  <td className="py-2 px-2 text-xs text-gray-600">{item.status}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />

      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Header with Search and Title */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Payroll Management
            </h1>
            <div className="flex gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full md:w-72 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="relative">
                <Badge
                  variant="outline"
                  className="px-6 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                  onClick={toggleCalendar}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium text-base">{selectedYear}-{selectedMonth.toLocaleString('default', { month: 'long' })}</span>
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
                            month === selectedMonth.toLocaleString('default', { month: 'long' }).slice(0, 3) 
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
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {[
              "Salary Statement",
              "Deductions",
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

          {selectedSection === "Salary Statement" && renderPayrollTable()}
          {selectedSection === "Deductions" && renderDeductionsTable()}
          {selectedSection === "Advance" && renderAdvanceTable()}
          {selectedSection === "Reimbursement" && renderReimbursementTable()}
          {selectedSection === "Payment History" && renderPaymentHistoryTable()}
        </div>
      </div>
    </div>
  );
}

export default PayrollManagement;