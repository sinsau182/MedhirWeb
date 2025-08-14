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
import { fetchPayslipDetails, fetchEmployeeDetails, resetPayslipState, fetchSentPayslips } from "@/redux/slices/payslipSlice";
import { fetchOneEmployeeAttendanceOneMonth } from "@/redux/slices/attendancesSlice";
import { getEmployeePayslip } from "@/redux/slices/payrollSlice";

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
  const { employeePayslip, employeePayslipLoading, employeePayslipError } = useSelector((state) => state.payroll);
  const { sentPayslips, sentPayslipsLoading, sentPayslipsError } = useSelector((state) => state.payslip);

  console.log(attendance);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [dateOfJoining, setDateOfJoining] = useState(null);
  const [isManualSelection, setIsManualSelection] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const employeeId = sessionStorage.getItem("employeeId"); // Retrieve the employee ID from sessionStorage

  // Update date of joining when employee data is fetched
  useEffect(() => {
    if (employeeData) {
      setDateOfJoining(employeeData.joiningDate);
    }
  }, [employeeData]);

  // Determine which payslip data to use
  const currentPayslipData = isManualSelection ? employeePayslip : payslipData;
  const currentLoading = isManualSelection ? employeePayslipLoading : loading;
  const currentError = isManualSelection ? employeePayslipError : error;

  // Main useEffect for initial data fetching
  useEffect(() => {
    // Fetch employee details to get date of joining
    dispatch(fetchEmployeeDetails(employeeId));

    // Fetch sent payslips to get months with generated payslips
    dispatch(fetchSentPayslips(employeeId));
    
    // Only fetch attendance and payslip details if we have a selected month
    if (selectedMonth) {
      dispatch(fetchOneEmployeeAttendanceOneMonth({ month: selectedMonth.slice(0, 3), year: selectedYear, employeeId }));
      
      // Only fetch payslip details automatically if it's not a manual selection
      // This will be handled by the separate useEffect for sentPayslips
    }
    
    // Cleanup function to reset state when component unmounts
    return () => {
      dispatch(resetPayslipState());
    };
  }, [dispatch, employeeId, selectedMonth, selectedYear, isManualSelection]);

  // Update initial month selection when sent payslips are loaded
  useEffect(() => {
    if (sentPayslips && Array.isArray(sentPayslips) && sentPayslips.length > 0 && !isManualSelection && !hasInitialized) {
      // Find the latest month with payslip
      const latestPayslip = sentPayslips.reduce((latest, current) => {
        if (current.year > latest.year || 
            (current.year === latest.year && current.month > latest.month)) {
          return current;
        }
        return latest;
      });
      
      // Only update if we don't have any payslip data yet
      if (!currentPayslipData && latestPayslip.monthName && latestPayslip.year) {
        // Convert month name to proper case
        const monthName = latestPayslip.monthName.charAt(0).toUpperCase() + latestPayslip.monthName.slice(1).toLowerCase();
        setSelectedMonth(monthName);
        setSelectedYear(latestPayslip.year);
        setHasInitialized(true);
        
        // Fetch payslip for the latest available month using the month number from API response
        dispatch(fetchPayslipDetails({ 
          employeeId, 
          month: latestPayslip.month, // Use month number from API response instead of converting month name
          year: latestPayslip.year 
        }));
      }
    }
  }, [sentPayslips, dispatch, employeeId, isManualSelection, currentPayslipData, hasInitialized]);

  // Auto-update calendar display to match actual payslip month
  useEffect(() => {
    if (currentPayslipData && !isManualSelection && currentPayslipData.month && currentPayslipData.year) {
      // Convert month number to month name
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[currentPayslipData.month - 1]; // month is 1-based
      const payslipYear = currentPayslipData.year;
      
      // Only update if different from current selection and we have valid data
      if (monthName && payslipYear && (monthName !== selectedMonth || payslipYear !== selectedYear)) {
        setSelectedMonth(monthName);
        setSelectedYear(payslipYear);
      }
    }
  }, [currentPayslipData, isManualSelection]);

  // Debug logging
  console.log("Current payslip data:", currentPayslipData);
  console.log("Date of joining from API:", currentPayslipData?.dateOfJoining);
  console.log("Is manual selection:", isManualSelection);

  // Show error toast if there's an error
  // useEffect(() => {
  //   if (error) {
  //     toast.error(error);
  //   }
  // }, [error]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const toggleCalendar = () => setIsCalendarOpen(!isCalendarOpen);

  const handleMonthSelection = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setIsCalendarOpen(false);
    setIsManualSelection(true);
    
    // Fetch payslip for manually selected month using the month name
    dispatch(getEmployeePayslip({ 
      employeeId, 
      month: month, // month name like "May", "June" etc.
      year: year 
    }));
    
    // Also fetch attendance for the selected month
    dispatch(fetchOneEmployeeAttendanceOneMonth({ month: month.slice(0, 3), year: year, employeeId }));
  };

  const formattedDateOfJoining = (date) => {
    if (!date) return "N/A";
    
    try {
    const d = new Date(date);
      
      // Check if date is valid
      if (isNaN(d.getTime())) {
        console.log("Invalid date:", date);
        return "Invalid Date";
      }
      
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-GB", { month: "short" });
      const year = d.getFullYear().toString().slice(-2);

      const formatted = `${day}-${month}-${year}`;
      console.log("Original date:", date, "Parsed date:", d, "Formatted:", formatted);
      
      return formatted;
    } catch (error) {
      console.error("Error formatting date:", error, "Date value:", date);
      return "Error";
    }
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

  // Function to get available months based on sent payslips
  const getAvailableMonths = () => {
    if (!sentPayslips || !Array.isArray(sentPayslips)) {
      return groupedPayrolls;
    }

    const availableMonths = {};
    
    // Process sent payslips to get available months
    sentPayslips.forEach(payslip => {
      const year = payslip.year.toString();
      if (!availableMonths[year]) {
        availableMonths[year] = [];
      }
      
      // Convert month name to proper case (e.g., "MAY" -> "May")
      const monthName = payslip.monthName.charAt(0).toUpperCase() + payslip.monthName.slice(1).toLowerCase();
      
      // Only add if not already in the array
      if (!availableMonths[year].includes(monthName)) {
        availableMonths[year].push(monthName);
      }
    });
    
    // Sort months within each year
    Object.keys(availableMonths).forEach(year => {
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      availableMonths[year].sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
    });
    
    return availableMonths;
  };

  // Get filtered available months
  const availableMonths = getAvailableMonths();

  // Debug logging
  console.log("Available months:", availableMonths);
  console.log("Sent payslips:", sentPayslips);
  console.log("Grouped payrolls:", groupedPayrolls);

  // Helper function to check if value should show -- or the actual value
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "--";
    }
    return value;
  };

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
                  {selectedMonth ? `${selectedYear}-${selectedMonth}` : 'Loading...'}
                </Badge>

                {isCalendarOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    {Object.entries(availableMonths)
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
                disabled={!currentPayslipData}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>

            {!selectedMonth && sentPayslipsLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : !selectedMonth && (!sentPayslips || sentPayslips.length === 0) ? (
              <div className="flex items-center justify-center h-64">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    No payslips available
                  </h3>
                  <p className="text-gray-600">
                    No payslips have been generated for your account yet.
                  </p>
                </div>
              </div>
            ) : currentLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : currentError ? (
              <div className="flex items-center justify-center h-64">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Payslip for this month is not generated
                  </h3>
                </div>
              </div>
            ) : currentPayslipData ? (
              <div className="max-w-7xl mx-auto bg-white shadow-lg overflow-y-auto h-[calc(86vh-62px)] custom-scrollbar">
                <div id="pdf-content">
                  {/* Header */}
                  <div className="bg-gray-600 text-white text-center py-2">
                    <h1 className="text-xl font-bold mb-1">
                      PAYSLIP for the Month of {selectedMonth} {selectedYear}
                    </h1>
                  </div>

                  {/* Employee Details */}
                  <div className="border border-gray-400">
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Name</div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="flex-1 text-center">
                          {displayValue(currentPayslipData?.employeeName)}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">EMP ID</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {displayValue(currentPayslipData?.employeeId)}
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
                          {displayValue(currentPayslipData?.dateOfJoining)}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Designation</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {displayValue(currentPayslipData?.designationName)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">PAN</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {displayValue(currentPayslipData?.panNumber)}
                        </div>
                      </div>
                      <div className="px-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">UAN Number</div>
                        <div className="border-l-2 border-gray-400 h-full mx-2"></div>
                        <div className="flex-1 text-center">
                          {displayValue(currentPayslipData?.uanNumber)}
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
                        <div className="text-center">
                          {displayValue(currentPayslipData?.daysInMonth)}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Salary Paid for Days
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.paidDays)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">Leaves Taken</div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.leavesTakenInThisMonth)}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold  py-1">
                          Loss of Pay Days
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.lossOfPayDays)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Annual Leaves Earned
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.leavesEarnedInThisMonth)}
                        </div>
                      </div>
                      <div className="px-2 grid border-b-2 border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Comp-off Leaves Earned
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.compOffEarnedInThisMonth)}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="px-2 border-l-2 border-r-2 border-b-2 border-gray-400 grid grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          Old Leaves Balance
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.oldLeaveBalanceFromPreviousMonth)}
                        </div>
                      </div>
                      <div className="px-2 grid border-r-2 border-gray-400 grid-cols-[1fr_auto_1fr] items-center">
                        <div className="font-semibold py-1">
                          New Leaves Balance
                        </div>
                        <div className="border-l-2 border-gray-400 h-full"></div>
                        <div className="text-center">
                          {displayValue(currentPayslipData?.newLeaveBalance)}
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
                                {displayValue(currentPayslipData?.basicPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.basicThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">HRA</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.hraPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.hraThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">PF Employer Contribution</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.employerPFPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.employerPFThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">PF Employee</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.employeePFPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.employeePFThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Fuel Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.fuelReimbursementPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.fuelReimbursementThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Phone Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.phoneReimbursementPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.phoneReimbursementThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Other Allowances</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.otherAllowancesPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.otherAllowancesThisMonth)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400">
                              <td className="px-2 p-1">Arrears Paid</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.arrearsPerMonth)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.arrears)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400 bg-gray-50">
                              <td className="px-2 p-1 font-semibold">&nbsp;</td>
                              <td className="px-2 p-1 text-center border-l-2 border-gray-400 font-semibold">
                                &nbsp;
                              </td>
                            </tr>
                            <tr className="border-b-2 border-l-2 border-gray-400 bg-gray-100">
                              <td className="px-2 p-1 font-semibold">
                                Total Earnings
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold">
                                {displayValue(currentPayslipData?.monthlyCTC)}
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400 font-semibold">
                                {displayValue(currentPayslipData?.thisMonthSalary)}
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
                                {displayValue(currentPayslipData?.employerPFDeduction)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">PF Employee</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.employeePFDeduction)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Professional Tax</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.professionalTax)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">TDS</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.tds)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Advance Adjusted</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.advanceAdjusted)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">Arrears Deducted</td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.arrearsDeducted)}
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
                                {displayValue(currentPayslipData?.totalDeductions)}
                              </td>
                            </tr>
                            <tr className="border-b-2 border-r-2 border-gray-400">
                              <td className="px-2 p-1">
                                Salary Advance Balance
                              </td>
                              <td className="px-2 p-1 text-right border-l-2 border-gray-400">
                                {displayValue(currentPayslipData?.salaryAdvanceBalance)}
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
                        ₹ {displayValue(currentPayslipData?.netPay)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Payslip for this month is not generated
                  </h3>
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

