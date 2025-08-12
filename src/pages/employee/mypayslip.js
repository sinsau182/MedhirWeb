import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { Download, CalendarIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { fetchPayslipDetails, fetchEmployeeDetails, resetPayslipState } from "@/redux/slices/payslipSlice";
import { fetchOneEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";

const downloadPDF = () => {
  const content = document.getElementById("pdf-content");

  if (!content) return;

  html2canvas(content, { scale: 2 }).then((canvas) => {
    const pdf = new jsPDF("p", "mm", [210, 210]); // A5 size (width: 148mm, height: 210mm)

    const pageWidth = 210; // A5 width in mm
    const pageHeight = 210; // A5 height in mm
    const margin = 10; // Margin from all sides

    const imgWidth = pageWidth - 2 * margin; // Adjust width to fit within margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio

    let yPosition = margin;

    // Ensure image fits within A5 height, otherwise split into multiple pages
    if (imgHeight > pageHeight - 2 * margin) {
      let position = margin;
      while (position < imgHeight) {
        pdf.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          margin,
          position,
          imgWidth,
          imgHeight
        );
        position += pageHeight - 2 * margin; // Move to next page
        if (position < imgHeight) pdf.addPage();
      }
    } else {
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        margin,
        yPosition,
        imgWidth,
        imgHeight
      );
    }

    pdf.save("Payslip_Medhir.pdf");
  });
};

const currentYear = new Date().getFullYear();
const currentMonthIndex = new Date().getMonth(); // 0-based index (0 = Jan, 11 = Dec)
const currentDate = new Date().getDate();
const latestMonthIndex = currentDate > 10 
  ? Math.max(0, currentMonthIndex - 1) 
  : Math.max(0, currentMonthIndex - 2); // Adjust based on current date
const monthsList = Array.from({ length: latestMonthIndex + 1 }, (_, i) =>
  new Date(currentYear, i).toLocaleString("default", { month: "long" })
);

const groupedPayrolls = { [currentYear]: monthsList };

const PayrollPage = () => {
  const dispatch = useDispatch();
  const { payslipData, employeeData, loading, error } = useSelector((state) => state.payslip);
  const { attendance } = useSelector((state) => state.attendances);

  console.log(attendance);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(monthsList[latestMonthIndex]);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateOfJoining, setDateOfJoining] = useState(null);

  const employeeId = sessionStorage.getItem("employeeId"); // Retrieve the employee ID from sessionStorage

  useEffect(() => {
    // Fetch employee details to get date of joining
    dispatch(fetchEmployeeDetails(employeeId));

    dispatch(fetchOneEmployeeAttendanceOneMonth({ month: selectedMonth.slice(0, 3), year: selectedYear, employeeId }));
    // Fetch payslip details for the latest month
    dispatch(fetchPayslipDetails({ 
      employeeId, 
      month: selectedMonth, 
      year: selectedYear 
    }));
    
    // Cleanup function to reset state when component unmounts
    return () => {
      dispatch(resetPayslipState());
    };
  }, [dispatch, employeeId, selectedMonth, selectedYear]);

  // Update date of joining when employee data is fetched
  useEffect(() => {
    if (employeeData) {
      setDateOfJoining(employeeData.joiningDate);
    }
  }, [employeeData]);

  // Update payslip data when month or year changes
  useEffect(() => {
    dispatch(fetchPayslipDetails({ 
      employeeId, 
      month: selectedMonth, 
      year: selectedYear 
    }));
  }, [dispatch, employeeId, selectedMonth, selectedYear]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
  };

  const formattedDateOfJoining = (date) => {
    if (!date) return "N/A";
    
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Ensures two-digit day
    const month = d.toLocaleString("en-GB", { month: "short" }); // Short month name
    const year = d.getFullYear().toString().slice(-2); // Last two digits of year

    return `${day}-${month}-${year}`;
  };

  // Update groupedPayrolls based on date of joining
  if (dateOfJoining) {
    const joiningDate = new Date(dateOfJoining);
    const joiningYear = joiningDate.getFullYear();
    const joiningMonthIndex = joiningDate.getMonth(); // 0-based index (0 = Jan, 11 = Dec)

    // Update groupedPayrolls to start from the joining month
    if (joiningYear === currentYear) {
      groupedPayrolls[currentYear] = monthsList.slice(joiningMonthIndex);
    } else if (joiningYear < currentYear) {
      groupedPayrolls[joiningYear] = Array.from(
        { length: 12 - joiningMonthIndex },
        (_, i) =>
          new Date(joiningYear, joiningMonthIndex + i).toLocaleString(
            "default",
            {
              month: "long",
            }
          )
      );
    }
  }

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />
        <div className="container mt-14 mx-auto">
          <div className="space-y-4 mx-auto px-9 py-6">
            <div className="flex items-center justify-between relative">
              <h1 className="text-3xl font-bold">My Payslips</h1>
              <div className="relative">
                <Badge
                  variant="outline"
                  className="w-[160px] h-[40px] px-4 py-3 cursor-pointer bg-white border border-gray-600 rounded-md flex items-center justify-center bg-gray-100"
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
                        <div key={year} className="border-b-2">
                          <div className="px-4 py-2 bg-gray-400 font-medium">
                            {year}
                          </div>
                          <ul className="py-2">
                            {months.map((month) => (
                              <li
                                key={month}
                                className={`px-4 py-2 cursor-pointer ${
                                  month === selectedMonth &&
                                  parseInt(year) === selectedYear
                                    ? "bg-gray-300 font-semibold"
                                    : "hover:bg-gray-200"
                                }`}
                                onClick={() => {
                                  handleMonthSelection(month, parseInt(year));
                                }}
                              >
                                {month}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              <Button
                variant="default"
                className="flex items-center"
                onClick={downloadPDF}
                disabled={!payslipData}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-blue-800 mb-2">No Payslip Available</h3>
                  <p className="text-sm text-blue-600 mb-4">
                    No payslip data is available for {selectedMonth} {selectedYear}.
                  </p>
                  <p className="text-sm text-blue-600 mb-4 font-medium">
                    Please ask your HR admin to click the "Calculate Payroll" button to generate your payslip.
                  </p>
                  <div className="bg-blue-100 border border-blue-300 rounded-md p-3">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Note:</strong> Payroll generation requires complete attendance data and HR admin approval.
                    </p>
                  </div>
                </div>
              </div>
            ) : payslipData ? (
              <div className="max-w-7xl mx-auto bg-white shadow-lg overflow-y-auto h-[calc(86vh-62px)] custom-scrollbar">
                <div id="pdf-content">
                  {/* Header */}
                  <div className="bg-gray-600 text-white text-center py-2">
                    <h1 className="text-xl font-bold mb-1">
                      PAYSLIP for the Month of {payslipData?.monthYearDisplay}
                    </h1>
                  </div>

                  {/* Employee Details */}
                  <div className="border border-gray-400">
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Name</div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.employeeName || "--"}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">EMP ID</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.employeeId || "--"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Date of Joining
                        </div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {formattedDateOfJoining(payslipData?.dateOfJoining) || "--"}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Designation</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {employeeData?.designationName || "--"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">PAN</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.panNumber || "--"}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">UAN Number</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.uanNumber || "--"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div className="px-2 p-1 border-l-2 border-b-2 border-r-2 border-gray-400 grid grid-cols-2">
                      <div className="font-semibold">&nbsp;</div>
                    </div>
                  </div>

                  {/* Attendance Details */}
                  <div className="border-x border-b-2 border-gray-400 mt-0">
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Days in Month</div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.daysInMonth}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Salary Paid for Days
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.paidDays}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Leaves Taken</div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.leavesTakenInThisMonth}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold  py-1">
                          Loss of Pay Days
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.lossOfPayDays}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Annual Leaves Earned
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.leavesEarnedInThisMonth}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Comp-off Leaves Earned
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.compOffEarnedInThisMonth}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Old Leaves Balance
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.oldLeaveBalanceFromPreviousMonth}
                        </div>
                      </div>
                      <div className="px-2 grid border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          New Leaves Balance
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.newLeaveBalance}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1">
                    <div className="px-2 p-1 border-l-2 border-b-2 border-r-2 border-gray-400 grid grid-cols-2">
                      <div className="font-semibold">&nbsp;</div>
                    </div>
                  </div>

                  {/* Earnings and Deductions */}
                  <div className="border-x border-b-2 border-gray-400 mt-0">
                    <div className="grid grid-cols-2">
                      <div className="border-r-2 border-gray-400">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <th className="px-2 p-1 text-center">Earnings</th>
                              <th className="px-2 p-1 text-center border-l-2 border-gray-400">
                                Per Month
                              </th>
                              <th className="px-2 p-1 text-center border-l-2 border-gray-400">
                                This Month
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Basic</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.basicPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.basicThisMonth || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">HRA</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.hraPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.hraThisMonth || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">
                                PF Employer Contribution
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.employerPFPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.employerPFDeduction || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">PF Employee</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.employeePFPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.employeePFDeduction || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Fuel Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.fuelAllowancesPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.fuelReimbursement || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Other Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.otherAllowancesPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.otherAllowancesThisMonth || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Arrears Paid</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.arrearsPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.arrears || "--"}
                              </td>
                            </tr>
                            <tr className="border-l-2 border-gray-400 bg-gray-100">
                              <td className="px-2 p-1 font-semibold border-b-2 border-gray-400">
                                Total Earnings
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold border-b-2">
                                {payslipData?.totalEarningsPerMonth || "--"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold border-b-2">
                                {payslipData?.totalEarningsThisMonth || "--"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <th className="px-2 p-1 text-center">
                                Deductions
                              </th>
                              <th className="px-2 p-1 text-center border-l-2 border-gray-400">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">
                                PF Employer contribution
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.employerPFDeduction || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">PF Employee</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.employeePFDeduction || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Professional Tax</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.professionalTax || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">TDS</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.tds || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Advance Adjusted</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.advanceAdjusted || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Arrears Deducted</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.arrearsDeducted || "--"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400 bg-gray-50">
                              <td className="px-2 p-1 font-semibold">&nbsp;</td>
                              <td className="px-2 p-1 text-center border-l-2 border-gray-400 font-semibold">
                                &nbsp;
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400 bg-gray-100">
                              <td className="px-2 p-1 font-semibold">
                                Total Deductions
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold">
                                {payslipData?.totalDeductions || "--"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-2 p-1">
                                Salary Advance Balance
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-r-2 border-gray-400">
                                {payslipData?.salaryAdvanceBalance || "--"}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="border-x-2 border-b-2 border-gray-400 p-3 bg-gray-50">
                    <div className="grid grid-cols-2">
                      <div className="font-bold text-xl">Net Pay</div>
                      <div className="text-right font-bold text-xl">
                        ₹ {payslipData?.netPay || "--"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-blue-800 mb-2">No Payslip Available</h3>
                  <p className="text-sm text-blue-600 mb-4">
                    No payslip data is available for {selectedMonth} {selectedYear}.
                  </p>
                  <p className="text-sm text-blue-600 mb-4 font-medium">
                    Please ask your HR admin to click the "Calculate Payroll" button to generate your payslip.
                  </p>
                  <div className="bg-blue-100 border border-blue-300 rounded-md p-3">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Note:</strong> Payroll generation requires complete attendance data and HR admin approval.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(PayrollPage);