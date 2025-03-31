import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const PayrollPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2023);
  const currentRole = "employee";

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);
  const changeYear = (direction) => setSelectedYear((prevYear) => prevYear + direction);
  const handleDownloadPayslip = () => console.log("Downloading payslip...");

  const currentPayslip = { month: "March", date: "2023-03-31" };

  const salaryBreakdown = {
    basic: 50000,
    hra: 15000,
    conveyance: 5000,
    medical: 2000,
    special: 3000,
    gross: 75000,
    pf: 5000,
    incomeTax: 10000,
    net: 60000,
  };

  const renderEmployeePayroll = () => (
    <div className="space-y-6 mx-auto px-4 py-6">
      <div className="flex items-center justify-between relative">
        <h1 className="text-3xl font-bold">My Payslips</h1>
        <div className="relative">
        <Badge
          variant="outline"
          className="px-4 py-1 cursor-pointer"
          onClick={toggleCalendar}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          {selectedYear}-{selectedYear + 1}
        </Badge>
        {isCalendarOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => changeYear(-1)} // Decrement year
            >
            &larr; Previous
            </button>
            <span className="font-medium">
            {selectedYear}-{selectedYear + 1}
            </span>
            <button
            className="text-gray-600 hover:text-gray-800"
            onClick={() => changeYear(1)} // Increment year
            >
            Next &rarr;
            </button>
          </div>
          <ul className="py-2">
            {Array.from({ length: 12 }, (_, i) => (
            <li
              key={i}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
              setSelectedYear(selectedYear);
              setIsCalendarOpen(false); // Close dropdown
              }}
            >
              {new Date(selectedYear, i).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
              })}
            </li>
            ))}
          </ul>
          </div>
        )}
        </div>
      </div>

      <div className="p-5 ">
        {[...Array(1)].map((_, index) => {
        const month = new Date();
        month.setMonth(month.getMonth() - index);

        return (
          <DashboardCard className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium">Payslip: {currentPayslip.month}</h2>
        <Button 
          variant="default"
          onClick={handleDownloadPayslip}
          className="flex items-center"
        >
          <Download className="w-4 h-4 mr-1" />
          Download
        </Button>
      </div>
      
      <div className="p-3 bg-secondary/50 rounded-lg mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Net Salary</p>
            <p className="text-2xl font-semibold">₹{salaryBreakdown.net.toLocaleString()}</p>
          </div>
          <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium">
            Credited
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Credited on {currentPayslip.date}
        </p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Earnings</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Basic Salary</span>
              <span>₹{salaryBreakdown.basic.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>HRA</span>
              <span>₹{salaryBreakdown.hra.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Conveyance Allowance</span>
              <span>₹{salaryBreakdown.conveyance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Medical Allowance</span>
              <span>₹{salaryBreakdown.medical.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Special Allowance</span>
              <span>₹{salaryBreakdown.special.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-border">
              <span>Gross Salary</span>
              <span>₹{salaryBreakdown.gross.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Deductions</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Provident Fund</span>
              <span>₹{salaryBreakdown.pf.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Income Tax</span>
              <span>₹{salaryBreakdown.incomeTax.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium pt-1 border-t border-border">
              <span>Total Deductions</span>
              <span>₹{(salaryBreakdown.pf + salaryBreakdown.incomeTax).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between font-medium text-primary">
            <span>Net Salary</span>
            <span>₹{salaryBreakdown.net.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </DashboardCard>
          // <Card key={index} className="overflow-hidden">
          // <CardHeader className="pb-3">
          //   <div className="flex items-center justify-between">
          //   <CardTitle>
          //     {month.toLocaleDateString("en-US", {
          //     month: "long",
          //     year: "numeric",
          //     })}
          //   </CardTitle>
          //   <Badge
          //     variant={index === 0 ? "default" : "outline"}
          //     className="px-2 py-0.5 text-xs"
          //   >
          //     {index === 0 ? "Latest" : "Archived"}
          //   </Badge>
          //   </div>
          //   <CardDescription>
          //   Salary period: 1-
          //   {new Date(
          //     month.getFullYear(),
          //     month.getMonth() + 1,
          //     0
          //   ).getDate()}{" "}
          //   {month.toLocaleDateString("en-US", { month: "long" })}
          //   </CardDescription>
          // </CardHeader>
          // <CardContent>
          //   <div className="flex flex-col gap-2">
          //   <div className="flex justify-between text-sm">
          //     <span className="text-muted-foreground">Basic Salary</span>
          //     <span className="font-medium">$4,200.00</span>
          //   </div>
          //   <div className="flex justify-between text-sm">
          //     <span className="text-muted-foreground">Allowances</span>
          //     <span className="font-medium">$850.00</span>
          //   </div>
          //   <div className="flex justify-between text-sm">
          //     <span className="text-muted-foreground">Deductions</span>
          //     <span className="font-medium text-destructive">
          //     -$650.00
          //     </span>
          //   </div>
          //   <div className="mt-2 flex justify-between border-t pt-2">
          //     <span className="font-semibold">Net Salary</span>
          //     <span className="font-bold">$4,400.00</span>
          //   </div>

          //   <Button variant="secondary" size="sm">
          //     <Download className="mr-2 h-4 w-4" />
          //     Download PDF
          //   </Button>
          //   </div>
          // </CardContent>
          // </Card>
        );
        })}
    </div>
      </div>
  );

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />
        <div className="container py-6 mt-10 mx-auto">
          {currentRole === "employee" ? renderEmployeePayroll() : null}
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;