import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Calendar, Edit } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // Import Sidebar component
import HradminNavbar from "@/components/HradminNavbar"; // Import HrAdminNavbar component

const payrollData = [
  { name: "John Doe", paidDays: 20, ctc: 5000, salary: 4500, basic: 3000, deductions: 500, taxes: 200, taxPro: 100, reimbursement: 300, advance: 400, netPay: 3500 },
  { name: "Jane Smith", paidDays: 22, ctc: 6000, salary: 5500, basic: 3500, deductions: 600, taxes: 300, taxPro: 200, reimbursement: 400, advance: 500, netPay: 4500 },
  { name: "Alice Johnson", paidDays: 18, ctc: 4000, salary: 3500, basic: 2500, deductions: 400, taxes: 200, taxPro: 100, reimbursement: 300, advance: 200, netPay: 3300 },
];

export default function PayrollManagement() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main content container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        

      {/* Main Content */}
      <div className="flex-1">
        {/* Navbar */}
        <HradminNavbar />

        {/* Content */}
        <div className="mt-20 p-6">
          <h1 className="text-2xl font-bold">Payroll Management</h1>
          <p className="text-gray-500">Manage and process employee payrolls</p>

          {/* Search Bar */}
          <div className="mt-4 flex gap-4">
            <Input placeholder="Search..." className="w-1/3" />
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            <Button variant="outline">Salary Statement</Button>
            <Button variant="ghost">Advance</Button>
            <Button variant="ghost">Reimbursement</Button>
            <Button variant="ghost">Payment History</Button>
          </div>

          {/* Payroll Table */}
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
                  {payrollData.map((item, index) => (
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
                      <TableCell className="font-bold">₹{item.netPay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Footer Buttons */}
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex items-center gap-1">
              <Edit size={16} /> Edit
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Calendar size={16} /> January 2025
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
