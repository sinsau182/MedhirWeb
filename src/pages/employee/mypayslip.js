import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import PayrollTable from "@/components/PayrollTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const PayrollPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // State to control calendar dropdown
  const [selectedYear, setSelectedYear] = useState(2023); // Default year
  const currentRole = "employee"; // This should be replaced with actual role fetching logic

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  const changeYear = (direction) => {
    setSelectedYear((prevYear) => prevYear + direction); // Increment or decrement the year
  };

  // Employee view of payroll/payslip
  const renderEmployeePayroll = () => {
    return (
      <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
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
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setIsCalendarOpen(false)} // Close dropdown
                  >
                    Selected Year: {selectedYear}-{selectedYear + 1}
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[...Array(3)].map((_, index) => {
            const month = new Date();
            month.setMonth(month.getMonth() - index);

            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {month.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </CardTitle>
                    <Badge
                      variant={index === 0 ? "default" : "outline"}
                      className="px-2 py-0.5 text-xs"
                    >
                      {index === 0 ? "Latest" : "Archived"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Salary period: 1-
                    {new Date(
                      month.getFullYear(),
                      month.getMonth() + 1,
                      0
                    ).getDate()}{" "}
                    {month.toLocaleDateString("en-US", { month: "long" })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Basic Salary</span>
                      <span className="font-medium">$4,200.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Allowances</span>
                      <span className="font-medium">$850.00</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deductions</span>
                      <span className="font-medium text-destructive">
                        -$650.00
                      </span>
                    </div>
                    <div className="mt-2 flex justify-between border-t pt-2">
                      <span className="font-semibold">Net Salary</span>
                      <span className="font-bold">$4,400.00</span>
                    </div>
                    <Button variant="outline" size="sm" className="mt-2">
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    <Button variant="secondary" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payslip History</CardTitle>
            <CardDescription>View and download your past payslips</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() - (i + 3));
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 hover:bg-accent rounded-md"
                  >
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">
                          {date.toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Net: $4,380.00
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
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

        {/* Content */}
        <div className="container py-6 mt-6">
          {currentRole === "employee" ? renderEmployeePayroll() : null}
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
