import React, { useCallback, useState, useEffect } from "react";
import { Search, Calendar, Check, X, Pencil } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { Badge } from "@/components/ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
import { fetchAllEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import { generatePayroll, getPayroll } from "@/redux/slices/payrollSlice";

function PayrollManagement() {
  const selectedCompanyId = sessionStorage.getItem("employeeCompanyId");
  const dispatch = useDispatch();

  const { attendance } = useSelector((state) => state.attendances);
  const { payroll } = useSelector((state) => state.payroll);
  const [selectedSection, setSelectedSection] = useState("Salary Statement");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isCalculatePayrollClicked, setIsCalculatePayrollClicked] = useState(false);
  const [payrollErrorDetails, setPayrollErrorDetails] = useState(null);
  const [isCalculatingPayroll, setIsCalculatingPayroll] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    const latestAvailableMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    return latestAvailableMonth.toLocaleString("default", { month: "long" });
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentDate = new Date();
    const latestAvailableMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    return latestAvailableMonth.getFullYear().toString();
  });



  const { employees, loading, err } = useSelector((state) => state.employees);

  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);
  const { publicRuntimeConfig } = getConfig();

  // Check if selected month is the latest available month (current month - 1)
  const isLatestAvailableMonth = () => {
    const currentDate = new Date();
    const latestAvailableMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const latestMonth = latestAvailableMonth.toLocaleString("default", { month: "long" });
    const latestYear = latestAvailableMonth.getFullYear().toString();
    return selectedMonth === latestMonth && selectedYear === latestYear;
  };

  const handleMonthSelection = (month, year) => {
    // Convert short month name to full month name
    const monthMap = {
      "Jan": "January",
      "Feb": "February", 
      "Mar": "March",
      "Apr": "April",
      "May": "May",
      "Jun": "June",
      "Jul": "July",
      "Aug": "August",
      "Sep": "September",
      "Oct": "October",
      "Nov": "November",
      "Dec": "December"
    };
    
    const fullMonthName = monthMap[month] || month;
    setSelectedMonth(fullMonthName);
    setSelectedYear(year);
    setIsCalendarOpen(false);
    // Reset Calculate Payroll state when month changes
    setIsCalculatePayrollClicked(false);
    setShowCheckboxes(false);
    setSelectedEmployees([]);
    setPayrollErrorDetails(null); // Clear previous month error details on month change
  };



  useEffect(() => {
    dispatch(
      fetchAllEmployeeAttendanceOneMonth({
        month: selectedMonth,
        year: selectedYear,
        role: "HRADMIN",
      })
    );
  }, [dispatch, selectedMonth, selectedYear]);

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  useEffect(() => {
    // Convert month name to month number
    const monthMap = {
      "January": 1, "February": 2, "March": 3, "April": 4,
      "May": 5, "June": 6, "July": 7, "August": 8,
      "September": 9, "October": 10, "November": 11, "December": 12
    };
    
    const params = {
      companyId: selectedCompanyId,
      year: parseInt(selectedYear),
      month: monthMap[selectedMonth]
    };
    
    dispatch(getPayroll(params));
  }, [dispatch, selectedCompanyId, selectedMonth, selectedYear]);

  console.log(payroll);


  

  const renderPayrollTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="max-h-[calc(100vh-280px)] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {showCheckboxes && (
                <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === employees.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(employees.map(emp => emp.employeeId));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
                            <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-100">
                EMPLOYEE <br /> ID
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-100">
                NAME
              </th>
              
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-gray-100">
                MONTHLY <br /> CTC
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                PAID DAYS
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                THIS MONTH <br /> SALARY
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                BASIC
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                HRA
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                OTHER <br /> ALLOWANCES
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
               Fuel <br /> REIMB.
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                Phone <br /> REIMB.
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-green-50">
                ARREARS
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-red-50">
               EMPLOYEE <br /> PF
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-red-50">
                EMPLOYER <br /> PF
              </th>
               <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-red-50">
                 DEDUCTIONS
               </th>
               
               <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200 bg-blue-50">
                 NET PAY
               </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees
              .filter((employee) =>
                employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((employee, index) => {
                // Find corresponding payroll data for this employee
                const payrollItem = payroll && Array.isArray(payroll) 
                  ? payroll.find(item => item.employeeId === employee.employeeId)
                  : null;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    {showCheckboxes && (
                      <td className="py-2 px-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.employeeId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.employeeId]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.employeeId));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="py-2 px-2 text-xs text-gray-600 bg-gray-50">
                      {employee.employeeId}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-gray-50">
                      {employee.name}
                    </td>
                   
                    <td className="py-2 px-2 text-xs text-gray-600 bg-gray-50">
                      {payrollItem ? `₹ ${(payrollItem.monthlyCTC || 0)}` : `₹ ${(employee.salaryDetails?.monthlyCtc || 0)}`}
                    </td>
                                         <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                       {payrollItem ? (payrollItem.paidDays || 0) : '0'}
                     </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.thisMonthSalary || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.basicThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.hraThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.otherAllowancesThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.fuelReimbursement || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.phoneReimbursement || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-green-50">
                      {payrollItem ? `₹ ${(payrollItem.arrears || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-red-50">
                      {payrollItem ? `₹ ${(payrollItem.employeePFThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-red-50">
                      {payrollItem ? `₹ ${(payrollItem.employerPFThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-red-50">
                      {payrollItem ? `₹ ${((payrollItem.professionalTax || 0) + (payrollItem.employeePFThisMonth || 0) + (payrollItem.employerPFThisMonth || 0) + (payrollItem.otherDeductions || 0))}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600 bg-blue-50 font-semibold">
                      {payrollItem ? `₹ ${(payrollItem.netPay || 0)}` : '₹ 0'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDeductionsTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="max-h-[calc(100vh-280px)] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {showCheckboxes && (
                <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === employees.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(employees.map(emp => emp.employeeId));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Employee ID
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Name
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Department
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Employee PF
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Employer PF
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Professional Tax
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Advance Adjusted
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Other Deduction
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Net Deductions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees
              .filter((employee) =>
                employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((employee, index) => {
                // Find corresponding payroll data for this employee
                const payrollItem = payroll && Array.isArray(payroll) 
                  ? payroll.find(item => item.employeeId === employee.employeeId)
                  : null;
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    {showCheckboxes && (
                      <td className="py-2 px-2 text-xs text-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.employeeId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedEmployees([...selectedEmployees, employee.employeeId]);
                            } else {
                              setSelectedEmployees(selectedEmployees.filter(id => id !== employee.employeeId));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {employee.employeeId}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {employee.name}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {employee.departmentName}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {payrollItem ? `₹ ${(payrollItem.employeePFThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {payrollItem ? `₹ ${(payrollItem.employerPFThisMonth || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {payrollItem ? `₹ ${(payrollItem.professionalTax || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {payrollItem ? `₹ ${(payrollItem.advanceAdjusted || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {payrollItem ? `₹ ${(payrollItem.otherDeductions || 0)}` : '₹ 0'}
                    </td>
                    <td className="py-2 px-2 text-xs text-gray-600">
                      {payrollItem ? `₹ ${((payrollItem.employeePFThisMonth || 0) + (payrollItem.employerPFThisMonth || 0) + (payrollItem.professionalTax || 0) + (payrollItem.otherDeductions || 0))}` : '₹ 0'}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAdvanceTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="max-h-[calc(100vh-280px)] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              {showCheckboxes && (
                <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === employees.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEmployees(employees.map(emp => emp.employeeId));
                      } else {
                        setSelectedEmployees([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Employee ID
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Name
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Department
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Old Advance
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                This Month Advance
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Deduct in This Month
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Balance for Next Month
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees
              .filter((employee) =>
                employee.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {showCheckboxes && (
                    <td className="py-2 px-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.employeeId)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedEmployees([...selectedEmployees, employee.employeeId]);
                          } else {
                            setSelectedEmployees(selectedEmployees.filter(id => id !== employee.employeeId));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.employeeId}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.name}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.departmentName}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    ₹{employee.oldAdvance}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    ₹{employee.thisMonthAdvance}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    ₹{employee.deductInThisMonth}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    ₹{employee.balanceForNextMonth}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReimbursementTable = () => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      <div className="max-h-[calc(100vh-280px)] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Employee ID
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Name
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Department
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Type
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Category
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Description
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Amount
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Status
              </th>

            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees
              .filter((employee) =>
                employee.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.employeeId}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.name}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.departmentName}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.type}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.category}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.description}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    ₹{employee.reimbursementAmount}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.status}
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
      <div className="max-h-[calc(100vh-280px)] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Employee ID
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Name
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Department
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Payment Date
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Amount
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Payment Mode
              </th>
              <th className="py-3 px-2 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider whitespace-nowrap border-b border-gray-200">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {employees
              .filter((employee) =>
                employee.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((employee, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.employeeId}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.name}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.departmentName}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.paymentDate}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    ₹{employee.amount}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.paymentMode}
                  </td>
                  <td className="py-2 px-2 text-xs text-gray-600">
                    {employee.status}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 relative ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300 overflow-hidden`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16 h-[calc(100vh-64px)] overflow-y-auto">
          {/* Header with Search and Title */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-gray-800">
                Payroll Management
              </h1>
              <button
                disabled={!isLatestAvailableMonth() || isCalculatingPayroll}
                onClick={async () => {
                  if (isLatestAvailableMonth() && !isCalculatingPayroll) {
                    setIsCalculatingPayroll(true);
                    setPayrollErrorDetails(null); // Clear any previous errors
                    
                    try {
                      console.log("Starting payroll calculation...");
                      
                      // Convert month name to month number
                      const monthMap = {
                        "January": 1, "February": 2, "March": 3, "April": 4,
                        "May": 5, "June": 6, "July": 7, "August": 8,
                        "September": 9, "October": 10, "November": 11, "December": 12
                      };
                      
                      const requestBody = {
                        companyId: selectedCompanyId,
                        year: parseInt(selectedYear),
                        month: monthMap[selectedMonth]
                      };
                      
                      console.log("Calling generatePayroll API with:", requestBody);
                      
                      // First, generate payroll (POST request)
                      const generateResult = await dispatch(generatePayroll(requestBody)).unwrap();
                      console.log("Generate payroll result:", generateResult);
                      toast.success("Payroll calculation completed!");
                      
                      // Then, fetch the generated payroll data (GET request)
                      const params = {
                        companyId: selectedCompanyId,
                        year: parseInt(selectedYear),
                        month: monthMap[selectedMonth]
                      };
                      
                      console.log("Calling getPayroll API with:", params);
                      
                      const getResult = await dispatch(getPayroll(params)).unwrap();
                      console.log("Get payroll result:", getResult);
                      
                      setIsCalculatePayrollClicked(true);
                      toast.success("Payroll data loaded successfully!");
                      
                    } catch (error) {
                      console.log("Payroll error:", error);
                      
                      // Check for different error structures
                      const isPayrollError = 
                        error?.status === 409 || 
                        error?.error === "Payroll Generation Incomplete" ||
                        error?.message?.includes("Payroll generation failed") ||
                        error?.message?.includes("Failed to generate payroll") ||
                        error?.validationErrors?.failedEmployeeIds;
                      
                      if (isPayrollError) {
                        console.log("Showing payroll error message");
                        console.log("Error details:", error);
                        setPayrollErrorDetails(error);
                      } else {
                        console.log("Showing generic error toast");
                        toast.error(error?.message || "Failed to process payroll");
                      }
                    } finally {
                      setIsCalculatingPayroll(false);
                    }
                  }
                }}
                className={`px-6 py-2 rounded-md font-medium text-sm transition-all duration-200 ${
                  isLatestAvailableMonth() && !isCalculatingPayroll
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                }`}
              >
                {isCalculatingPayroll ? "Calculating..." : "Calculate Payroll"}
              </button>
              {isCalculatePayrollClicked && isLatestAvailableMonth() && (
                <button
                  onClick={() => {
                    if (showCheckboxes) {
                      setShowConfirmationModal(true);
                    } else {
                      setShowCheckboxes(true);
                      setSelectedEmployees(employees.map(emp => emp.employeeId));
                    }
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-md font-medium text-sm transition-all duration-200 hover:bg-green-700"
                >
                  Send Payslip
                </button>
              )}
              {showCheckboxes && (
                <button
                  onClick={() => {
                    setShowCheckboxes(false);
                    setSelectedEmployees([]);
                  }}
                  className="px-6 py-2 bg-red-500 text-white rounded-md font-medium text-sm transition-all duration-200 hover:bg-red-600"
                >
                  Cancel
                </button>
              )}
            </div>
            <div className="flex gap-4">
              {(!isLatestAvailableMonth() || isCalculatePayrollClicked) && (
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
              )}
              <div className="relative">
                <Badge
                  variant="outline"
                  className="px-6 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                  onClick={toggleCalendar}
                >
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium text-base">
                    {selectedYear}-
                    {selectedMonth.toLocaleString("default", { month: "long" })}
                  </span>
                </Badge>
                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-3 border-b">
                      <div className="text-sm font-medium text-gray-700">
                        {selectedYear}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-3">
                      {[
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "May",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ]
                        .slice(0, new Date().getMonth())
                        .map((month) => (
                          <button
                            key={month}
                            className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                              month ===
                              selectedMonth
                                .toLocaleString("default", { month: "long" })
                                .slice(0, 3)
                                ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                            onClick={() =>
                              handleMonthSelection(month, selectedYear)
                            }
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

          {/* Payroll Error Message - Below Calculate Payroll Button */}
          {payrollErrorDetails && (
            <div className="mt-4">
              <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-red-600 mb-3">
                  Payroll Generation Failed
                </h3>
                
                <div className="mb-3">
                  <p className="text-gray-700 mb-1">
                    <strong>Reason:</strong> Attendance records incomplete for {payrollErrorDetails?.validationErrors?.failedEmployeeIds?.split(',').length || 0} employees.
                  </p>
                  <p className="text-sm text-gray-600">
                    Complete attendance data for {selectedMonth} {selectedYear} to generate payroll.
                  </p>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>Affected Employees:</strong>
                  </p>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 max-h-24 overflow-y-auto">
                    <div className="flex flex-wrap gap-1">
                      {payrollErrorDetails?.validationErrors?.failedEmployeeIds?.split(',').map((id, index) => (
                        <span key={index} className="text-xs bg-white px-2 py-1 border rounded">
                          {id.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPayrollErrorDetails(null);
                      window.location.href = '/hradmin/attendance';
                    }}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Go to Attendance
                  </button>
                  <button
                    onClick={() => setPayrollErrorDetails(null)}
                    className="px-3 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tabs - Only show when there's data or payroll has been calculated */}
          {(!isLatestAvailableMonth() || isCalculatePayrollClicked) && (
            <div className="bg-gray-50 overflow-x-auto scrollbar-thin">
              <div className="flex min-w-max">
                {[
                  "Salary Statement",
                  "Deductions",
                  "Advance",
                  "Reimbursement",
                  "Payment History",
                ].map((section) => {
                  const isDisabled = section === "Reimbursement" || section === "Payment History";
                  return (
                    <button
                      key={section}
                      className={`px-8 py-4 text-sm font-medium transition-colors relative ${
                        isDisabled
                          ? "text-gray-400 cursor-not-allowed opacity-50"
                          : selectedSection === section
                          ? "text-blue-600 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.1)] rounded-t-lg"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                      onClick={() => !isDisabled && setSelectedSection(section)}
                      disabled={isDisabled}
                    >
                      {section}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {(!isLatestAvailableMonth() || isCalculatePayrollClicked) && (
            <>
              {selectedSection === "Salary Statement" && renderPayrollTable()}
              {selectedSection === "Deductions" && renderDeductionsTable()}
              {selectedSection === "Advance" && renderAdvanceTable()}
              {selectedSection === "Reimbursement" && renderReimbursementTable()}
              {selectedSection === "Payment History" && renderPaymentHistoryTable()}
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Confirm Send Payslip
              </h2>
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to send payslips to the selected employees?
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Here you would typically make an API call to send payslips
                  toast.success(`Payslips sent to ${selectedEmployees.length} employees successfully!`);
                  setShowConfirmationModal(false);
                  setShowCheckboxes(false);
                  setSelectedEmployees([]);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Send Payslips
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default withAuth(PayrollManagement); 