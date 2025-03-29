import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Calendar, Edit } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // Import Sidebar component
import HradminNavbar from "@/components/HradminNavbar"; // Import HrAdminNavbar component

const payrollData = [
  {
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
    name: "John Doe",
    department: "HR",
    oldAdvance: 1000,
    thisMonthAdvance: 500,
    deductInThisMonth: 200,
    balanceForNextMonth: 300,
  },
  {
    name: "Jane Smith",
    department: "Finance",
    oldAdvance: 1500,
    thisMonthAdvance: 700,
    deductInThisMonth: 300,
    balanceForNextMonth: 400,
  },
  {
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
    name: "John Doe",
    department: "Sales",
    reimbursementAmount: 1000,
    status: "Approved",
  },
  {
    name: "Jane Smith",
    department: "Marketing",
    reimbursementAmount: 1500,
    status: "Pending",
  },
  {
    name: "Alice Johnson",
    department: "IT",
    reimbursementAmount: 800,
    status: "Rejected",
  },
];
const paymentHistoryData = [
  {
    name: "John Doe",
    department: "Sales",
    paymentDate: "2023-01-31",
    amount: 4500,
    paymentMode: "Bank Transfer",
    status: "Paid",
  },
  {
    name: "Jane Smith",
    department: "Marketing",
    paymentDate: "2023-01-31",
    amount: 5500,
    paymentMode: "Cheque",
    status: "Pending",
  },
  {
    name: "Alice Johnson",
    department: "IT",
    paymentDate: "2023-01-31",
    amount: 3500,
    paymentMode: "Cash",
    status: "Paid",
  },
];

const sections = [
  "Salary Statement",
  "Advance",
  "Reimbursement",
  "Payment History",
];

export default function PayrollManagement() {
  const [selectedSection, setSelectedSection] = useState("Salary Statement");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main content container */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Main Content */}
        <div className="flex-1">
          {/* Navbar */}
          <HradminNavbar />

          {/* Content */}
          <div className="mt-20 p-6">
            <h1 className="text-2xl font-bold">Payroll Management</h1>
            <p className="text-gray-500">
              Manage and process employee payrolls
            </p>

            {/* Search Bar and Buttons in Single Row */}
            <div className="mt-4 flex justify-between items-center">
              <Input
                placeholder="Search employees..."
                className="w-full md:w-1/3 border-gray-300 focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-1">
                  <Edit size={16} /> Edit
                </Button>
                <Button variant="outline" className="flex items-center gap-1">
                  <Calendar size={16} /> January 2025
                </Button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 bg-white p-3 rounded-lg shadow-lg border border-gray-200 w-[50%] justify-between">
              {sections.map((section) => (
                <Button
                  key={section}
                  variant={selectedSection === section ? "default" : "ghost"}
                  className={`px-4 py-2 rounded-md transition-all duration-300 ${
                    selectedSection === section
                      ? "bg-gray-900 text-white shadow-md"
                      : "hover:bg-gray-200"
                  }`}
                  onClick={() => setSelectedSection(section)}
                >
                  {section}
                </Button>
              ))}
            </div>

            {/* Filtered Payroll Table */}
            {selectedSection === "Salary Statement" && (
              <>
              <Card className="mt-4">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Paid Days</TableHead>
                      <TableHead>Monthly CTC</TableHead>
                      <TableHead>This Month Salary</TableHead>
                      <TableHead>Basic</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Taxes</TableHead>
                      <TableHead>Professional Tax</TableHead>
                      <TableHead>Reimbursement</TableHead>
                      <TableHead>Advance Taken</TableHead>
                      <TableHead>Net Pay</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollData
                      .filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.paidDays}</TableCell>
                          <TableCell>₹{item.ctc}</TableCell>
                          <TableCell>₹{item.salary}</TableCell>
                          <TableCell>₹{item.basic}</TableCell>
                          <TableCell>₹{item.deductions}</TableCell>
                          <TableCell>₹{item.taxes}</TableCell>
                          <TableCell>₹{item.taxPro}</TableCell>
                          <TableCell>₹{item.reimbursement}</TableCell>
                          <TableCell>₹{item.advance}</TableCell>
                          <TableCell className="font-bold">
                            ₹{item.netPay}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            </>
            )}

            {selectedSection === "Advance" && (
              <>
              <Card className="mt-4">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Old Advance</TableHead>
                      <TableHead>This Month Advance</TableHead>
                      <TableHead>Deduct in this Month</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Balance for next month</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {advanceData
                      .filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>₹{item.oldAdvance}</TableCell>
                          <TableCell>₹{item.thisMonthAdvance}</TableCell>
                          <TableCell>₹{item.deductInThisMonth}</TableCell>
                          <TableCell>₹{item.balanceForNextMonth}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </>
            )}

            {selectedSection === "Reimbursement" && (
              <>
              <Card className="mt-4">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Reimbursement Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reimbursementData
                      .filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>₹{item.reimbursementAmount}</TableCell>
                          <TableCell>{item.status}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
              </>
            )}

            {selectedSection === "Payment History" && (
              <>
              <Card className="mt-4">
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Payment Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Payment Mode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistoryData
                      .filter((item) =>
                        item.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                      )
                      .map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>{item.paymentDate}</TableCell>
                          <TableCell>₹{item.amount}</TableCell>
                          <TableCell>{item.paymentMode}</TableCell>
                          <TableCell>{item.status}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
                      
              </>
            )}
            {/* Footer Buttons */}
          </div>
        </div>
      </div>
    </div>
  );
}
