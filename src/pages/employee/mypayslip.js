import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardCard from "@/components/DashboardCard";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchPayrolls } from "@/redux/slices/payrollSlice"; // Redux action to fetch payrolls
import { Download, CalendarIcon } from "lucide-react";

const PayrollPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedPayslipId, setSelectedPayslipId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);
  const [payslipData, setPayslipData] = useState(null);

  const dispatch = useDispatch();
  const { payrolls, loading, error } = useSelector((state) => state.payroll); // Payrolls from Redux store

  useEffect(() => {
    dispatch(fetchPayrolls());
  }, [dispatch]);

  useEffect(() => {
    if (payrolls.length > 0) {
      const latestPayroll = payrolls.reduce((latest, current) =>
        new Date(current.timestamp) > new Date(latest.timestamp) ? current : latest
      );

      setSelectedPayslipId(latestPayroll.payslipId);
      setSelectedMonth(latestPayroll.month);
      setSelectedYear(latestPayroll.year);
      fetchPayslipDetails(latestPayroll.payslipId);
    }
  }, [payrolls]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const fetchPayslipDetails = async (payslipId) => {
    try {
      const response = await fetch(`http://192.168.0.200:8084/payroll/payslips/id/${payslipId}`);
      const data = await response.json();
      setPayslipData(data);
    } catch (error) {
      console.error("Error fetching payslip:", error);
    }
  };

  const handleMonthSelection = (month, year, payslipId) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setSelectedPayslipId(payslipId);
    setIsCalendarOpen(false);
    fetchPayslipDetails(payslipId);
  };

  const groupedPayrolls = payrolls.reduce((acc, payroll) => {
    const key = `${payroll.year}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(payroll);
    return acc;
  }, {});

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />
        <div className="container py-6 mt-10 mx-auto">
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
                  {selectedYear}-{selectedMonth}
                </Badge>
                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {Object.entries(groupedPayrolls)
                      .sort(([b], [a]) => b - a)
                      .map(([year, months]) => (
                        <div key={year} className="border-b">
                          <div className="px-4 py-2 bg-gray-100 font-medium">{year}</div>
                          <ul className="py-2">
                            {months.map((payroll) => (
                              <li
                                key={payroll.payslipId}
                                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                  payroll.payslipId === selectedPayslipId ? "font-bold" : ""
                                }`}
                                onClick={() =>
                                  handleMonthSelection(payroll.month, payroll.year, payroll.payslipId)
                                }
                              >
                                {payroll.month}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {payslipData && (
               <div className="max-w-2xl mx-auto bg-gray-100 p-6 shadow-md rounded-md">
               <h2 className="text-center font-bold text-lg bg-gray-700 text-white py-2">
                 PAYSLIP for the month of Feb-25
               </h2>
               <div className="border border-gray-400">
                 <div className="grid grid-cols-2 border-b">
                   <div className="p-2 border-r">Name: <strong>Saurav Kumar</strong></div>
                   <div className="p-2">EMP ID: <strong>TLD185</strong></div>
                 </div>
                 <div className="grid grid-cols-2 border-b">
                   <div className="p-2 border-r">Date of Joining: <strong>02-Jan-25</strong></div>
                   <div className="p-2">Designation: <strong>Software Engineer</strong></div>
                 </div>
                 <div className="grid grid-cols-2 border-b">
                   <div className="p-2 border-r">PAN: <strong>NA</strong></div>
                   <div className="p-2">UAN Number: <strong>0</strong></div>
                 </div>
               </div>
         
               <div className="mt-4 border border-gray-400">
                 <div className="grid grid-cols-2 border-b">
                   <div className="p-2 border-r">Days in Month: <strong>28</strong></div>
                   <div className="p-2">Salary Paid for Days: <strong>28</strong></div>
                 </div>
                 <div className="grid grid-cols-2 border-b">
                   <div className="p-2 border-r">Leaves Taken: <strong>0</strong></div>
                   <div className="p-2">Loss of Pay Days: <strong>0</strong></div>
                 </div>
                 <div className="grid grid-cols-2 border-b">
                   <div className="p-2 border-r">Annual Leaves Earned: <strong>1.5</strong></div>
                   <div className="p-2">Comp-off Leaves Earned: <strong>0</strong></div>
                 </div>
                 <div className="grid grid-cols-2">
                   <div className="p-2 border-r">Old Leaves Balance: <strong>1.5</strong></div>
                   <div className="p-2">New Leaves Balance: <strong>3</strong></div>
                 </div>
               </div>
         
               <div className="mt-4 border border-gray-400">
                 <div className="grid grid-cols-2 font-bold border-b">
                   <div className="p-2">Earnings</div>
                   <div className="p-2">Deductions</div>
                 </div>
                 <div className="grid grid-cols-2">
                   <div className="p-2 border-r">Basic: <strong>10,000</strong></div>
                   <div className="p-2">PF Employer Contribution: <strong>0</strong></div>
                 </div>
                 <div className="grid grid-cols-2">
                   <div className="p-2 border-r">HRA: <strong>4,000</strong></div>
                   <div className="p-2">PF Employee: <strong>0</strong></div>
                 </div>
                 <div className="grid grid-cols-2">
                   <div className="p-2 border-r">Other Allowances: <strong>10,999</strong></div>
                   <div className="p-2">Advance Adjusted: <strong>4,000</strong></div>
                 </div>
                 <div className="grid grid-cols-2 font-bold border-t">
                   <div className="p-2 border-r">Total Earnings: <strong>24,999</strong></div>
                   <div className="p-2">Total Deductions: <strong>4,000</strong></div>
                 </div>
               </div>
         
               <div className="mt-4 text-center font-bold text-lg">
                 Net Pay: <span className="text-green-600">20,999</span>
               </div>
             </div>
              // <DashboardCard className="mb-4">
              //   <div className="flex items-center justify-between mb-4">
              //     <h2 className="text-lg font-medium">
              //       Payslip: {selectedMonth} {selectedYear}
              //     </h2>
              //     <Button variant="default" className="flex items-center">
              //       <Download className="w-4 h-4 mr-1" />
              //       Download
              //     </Button>
              //   </div>

              //   <div className="p-3 bg-secondary/50 rounded-lg mb-4">
              //     <div className="flex items-center justify-between">
              //       <div>
              //         <p className="text-sm text-muted-foreground">Net Salary</p>
              //         <p className="text-2xl font-semibold">
              //           ₹{payslipData.netSalary.toLocaleString()}
              //         </p>
              //       </div>
              //       <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-xs font-medium">
              //         Credited
              //       </div>
              //     </div>
              //     <p className="text-xs text-muted-foreground mt-1">
              //       Credited on {payslipData.creditedDate}
              //     </p>
              //   </div>

              //   <div className="space-y-4">
              //     <div>
              //       <h3 className="text-sm font-medium text-muted-foreground mb-2">Earnings</h3>
              //       <div className="space-y-2">
              //         <div className="flex justify-between text-sm">
              //           <span>Basic Salary</span>
              //           <span>₹{payslipData.basicSalary.toLocaleString()}</span>
              //         </div>
              //         <div className="flex justify-between text-sm">
              //           <span>HRA</span>
              //           <span>₹{payslipData.hra.toLocaleString()}</span>
              //         </div>

              //         <div className="flex justify-between text-sm">
              //           <span>Reimbursement</span>
              //           <span>₹{payslipData.reimbursement.toLocaleString()}</span>
              //         </div>
              //         <div className="flex justify-between text-sm">
              //           <span>Medical Allowance</span>
              //           <span>₹{payslipData.medicalAllowance.toLocaleString()}</span>
              //         </div>
              //         <div className="flex justify-between text-sm">
              //           <span>Advance Taken</span>
              //           <span>₹{payslipData.advanceTaken.toLocaleString()}</span>
              //         </div>
              //         <div className="flex justify-between text-sm font-semibold">
              //           <span>Gross Salary</span>
              //           <span>₹{payslipData.grossSalary.toLocaleString()}</span>
              //         </div>

              //       </div>
              //     </div>

              //     <div>
              //       <h3 className="text-sm font-medium text-muted-foreground mb-2">Deductions</h3>
              //       <div className="space-y-2">
              //         <div className="flex justify-between text-sm">
              //           <span>Provident Fund</span>
              //           <span>₹{payslipData.providentFund.toLocaleString()}</span>
              //         </div>
              //         <div className="flex justify-between text-sm">
              //           <span>Income Tax</span>
              //           <span>₹{payslipData.incomeTax.toLocaleString()}</span>
              //         </div>
              //         <div className="flex justify-between text-sm">
              //           <span>Professional Tax</span>
              //           <span>₹{payslipData.professionalTax.toLocaleString()}</span>
              //           </div>

              //           <div className="flex justify-between text-sm font-semibold">
              //           <span>Total Deductions</span>
              //           <span>₹{payslipData.totalDeductions.toLocaleString()}</span>
              //         </div>
              //       </div>
                    
              //     </div>

              //     <div className="flex justify-between text-md font-bold">
              //       <span>Net Salary</span>
              //       <span>₹{payslipData.netSalary.toLocaleString()}</span>
              //       </div>
              //   </div>
              // </DashboardCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollPage;
