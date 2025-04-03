import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { useDispatch, useSelector } from "react-redux";
// import { fetchPayrolls } from "@/redux/slices/payrollSlice"; // Redux action to fetch payrolls
import { Download, CalendarIcon } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { setDate } from "date-fns";

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
const latestMonthIndex = Math.max(0, currentMonthIndex - 2); // Ensure it doesn't go below 0
const monthsList = Array.from({ length: latestMonthIndex + 1 }, (_, i) =>
  new Date(currentYear, i).toLocaleString("default", { month: "long" })
);

const groupedPayrolls = { [currentYear]: monthsList };

const PayrollPage = () => {
  const employeeId = "EMP123";
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [dateOfJoining, setDateOfJoining] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    monthsList[latestMonthIndex]
  );
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [selectedPayslipId, setSelectedPayslipId] = useState(null);
  const [payslipData, setPayslipData] = useState(null);

  const dispatch = useDispatch();
  const { payrolls, loading, error } = useSelector((state) => state.payroll); // Payrolls from Redux store

  // useEffect(() => {
  //   dispatch(fetchPayrolls());
  // }, [dispatch]);

  useEffect(() => {
    // Automatically select the latest month and year when component mounts
    fetchEmployeeById(employeeId); // Fetch employee data to get date of joining
    handleMonthSelection(selectedMonth, selectedYear);
  }, []);

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

  console.log("employee Date of Joining:", dateOfJoining); // Debugging line to check date of joining

  useEffect(() => {
    const latestMonth = monthsList[latestMonthIndex];
    setSelectedMonth(latestMonth);
    setSelectedYear(currentYear);
    fetchPayslipDetails(latestMonth, currentYear); // Fetch payslip details for the latest month
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const fetchPayslipDetails = async (month, year) => {
    try {
      const response = await fetch(
        `http://192.168.0.200:8083/payslip/generate/${employeeId}/${month}/${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Use token from local storage
          },
        }
      );
      const data = await response.json();
      setPayslipData(data);
    } catch (error) {
      console.error("Error fetching payslip:", error);
    }
  };

  const fetchEmployeeById = async (employeeId) => {
    try {
      const response = await fetch(
        `http://192.168.0.200:8083/employee/id/${employeeId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Use token from local storage
          },
        }
      );
      const data = await response.json();
      setDateOfJoining(data.joiningDate); // Set the date of joining from employee data
    } catch (error) {
      console.error("Error fetching employee data:", error);
    }
  };

  console.log("Payslip Data:", payslipData); // Debugging line to check payslip data

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
    fetchPayslipDetails(month, year);
  };

  const formattedDateOfJoining = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Ensures two-digit day
    const month = d.toLocaleString("en-GB", { month: "short" }); // Short month name
    const year = d.getFullYear().toString().slice(-2); // Last two digits of year

    return `${day}-${month}-${year}`;
  };

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
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
                                  setSelectedMonth(month);
                                  setSelectedYear(parseInt(year));
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
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>

            {payslipData && (
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
                          {payslipData?.employeeName || "Saurav Singh"}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">EMP ID</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.employeeId || "TLD187"}
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
                          {formattedDateOfJoining(payslipData?.dateOfJoining)}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Designation</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.designation || "Software Intern"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">PAN</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.pan || "NA"}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">UAN Number</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.uanNumber || "0"}
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
                          {payslipData?.daysInMonth || "28"}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Salary Paid for Days
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.salaryPaidForDays || "28"}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Leaves Taken</div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.leavesTaken || "0"}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold  py-1">
                          Loss of Pay Days
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.lossOfPayDays || "0"}
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
                          {payslipData?.annualLeavesEarned || "1.5"}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Comp-off Leaves Earned
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.compOffLeavesEarned || "0"}
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
                          {payslipData?.oldLeavesBalance || "1"}
                        </div>
                      </div>
                      <div className="px-2 grid border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          New Leaves Balance
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {payslipData?.newLeavesBalance || "2.5"}
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
                                {payslipData?.basicSalaryPerMonth || "10,000"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.basicSalaryThisMonth || "10,000"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">HRA</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.hraPerMonth || "5,000"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.hraThisMonth || "5,000"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">
                                PF Employer Contribution
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.pfEmployerContributionPerMonth ||
                                  "0"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.pfEmployerContributionThisMonth ||
                                  "0"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">PF Employee</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.pfEmployeePerMonth || "0"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.pfEmployeeThisMonth || "0"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Fuel Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.fuelAllowancesPerMonth || "2,000"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.fuelAllowancesThisMonth ||
                                  "2,000"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Other Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.otherAllowancesPerMonth ||
                                  "2,000"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.otherAllowancesThisMonth ||
                                  "2,000"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Arrears Paid</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.arrearsPaidPerMonth || "0"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.arrearsPaidThisMonth || "0"}
                              </td>
                            </tr>
                            <tr className="border-l-2 border-gray-400 bg-gray-100">
                              <td className="px-2 p-1 font-semibold border-b-2 border-gray-400">
                                Total Earnings
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold border-b-2">
                                {payslipData?.totalEarningsPerMonth || "19,000"}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold border-b-2">
                                {payslipData?.totalEarningsThisMonth ||
                                  "19,000"}
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
                                {payslipData?.pfEmployerContribution || "0"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">PF Employee</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                0
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Professional Tax</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.professionalTax || "0"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">TDS</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.tds || "0"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Advance Adjusted</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.advanceAdjusted || "0"}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Arrears Deducted</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {payslipData?.arrearsDeducted || "0"}
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
                                {payslipData?.totalDeductions || "0"}
                              </td>
                            </tr>
                            <tr>
                              <td className="px-2 p-1">
                                Salary Advance Balance
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-r-2 border-gray-400">
                                {payslipData?.salaryAdvanceBalance || "0"}
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
                        ₹ {payslipData?.netPay || "19,000"}
                      </div>
                    </div>
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

export default PayrollPage;
