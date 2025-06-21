// Helper function to get attendance status for a specific date from the API format
export const getAttendanceStatusForDate = (attendanceRecord, dateString) => {
  const attendanceData = attendanceRecord?.attendance;
  if (!attendanceData) return null;

  // Check present dates
  if (attendanceData.presentDates?.includes(dateString)) {
    return "P";
  }

  // Check full leave dates
  if (attendanceData.fullLeaveDates?.includes(dateString)) {
    return "PL";
  }

  // Check half day leave dates
  if (attendanceData.halfDayLeaveDates?.includes(dateString)) {
    return "P/A";
  }

  // Check full comp-off dates
  if (attendanceData.fullCompoffDates?.includes(dateString)) {
    return "P";
  }

  // Check half comp-off dates
  if (attendanceData.halfCompoffDates?.includes(dateString)) {
    return "P/A";
  }

  // Check weekly off dates
  if (attendanceData.weeklyOffDates?.includes(dateString)) {
    return "H";
  }

  // Check absent dates
  if (attendanceData.absentDates?.includes(dateString)) {
    return "A";
  }

  return null;
};

// Helper function to generate attendance data for an employee
export const generateAttendanceData = (employee, attendance, dates, selectedMonth, selectedYear) => {
  const attendanceRecord = Array.isArray(attendance)
    ? attendance.find((record) => record.employeeId === employee.employeeId)
    : null;

  if (!attendanceRecord) {
    return {
      id: employee.employeeId,
      name: employee.name,
      department: employee.departmentName,
      p_twd: "0/0",
      attendance: Array(dates.length).fill({ value: null, label: "" }),
    };
  }

  const attendanceArray = Array(dates.length)
    .fill(null)
    .map((_, index) => {
      const day = index + 1;
      const monthIndex = new Date(
        `${selectedMonth} 1, ${selectedYear}`
      ).getMonth();
      const dateString = `${selectedYear}-${String(monthIndex + 1).padStart(
        2,
        "0"
      )}-${String(day).padStart(2, "0")}`;

      const status = getAttendanceStatusForDate(attendanceRecord, dateString);

      if (!status) {
        return { value: null, label: "" };
      }

      let value;
      switch (status.toUpperCase()) {
        case "P":
          value = true;
          break;
        case "PL":
          value = true;
          break;
        case "A":
          value = false;
          break;
        case "P/A":
          value = "half";
          break;
        case "H":
          value = "holiday";
          break;
        case "PH":
          value = "holiday";
          break;
        case "PH/A":
          value = "half";
          break;
        case "LOP":
          value = "absent";
          break;
        case "P/LOP":
          value = "present";
          break;
        default:
          value = null;
      }
      return { value, label: status };
    });

  return {
    id: employee.employeeId,
    name: employee.name,
    department: employee.departmentName,
    p_twd: `${attendanceRecord.payableDays || 0}/${
      attendanceRecord.workingDays || 0
    }`,
    attendance: attendanceArray,
  };
};

// Helper function to generate leave data for an employee
export const generateLeaveData = (employee, attendance) => {
  const attendanceRecord = Array.isArray(attendance)
    ? attendance.find((record) => record.employeeId === employee.employeeId)
    : null;

  if (!attendanceRecord) {
    return {
      id: employee.employeeId,
      name: employee.name,
      department: employee.departmentName || "",
      noOfPayableDays: "0",
      leavesTaken: "0",
      leavesEarned: "0",
      leavesFromPreviousYear: "0",
      compOffEarned: "0",
      compOffCarriedForward: "0",
      netLeaves: "0",
    };
  }

  return {
    id: employee.employeeId,
    name: employee.name,
    department:
      attendanceRecord.departmentName || employee.departmentName || "",
  };
};

// Helper function to calculate attendance summary
export const calculateAttendanceSummary = (employeesData, dateToSummarize = null) => {
  let totalPresent = 0;
  let totalAbsent = 0;
  let totalHalfDay = 0;
  let totalHoliday = 0;
  let totalPresentOnHoliday = 0;
  let totalHalfDayOnHoliday = 0;
  let totalLOP = 0;
  let totalPresentOnLOP = 0;
  let totalPresentWithLeave = 0;

  const dataForSummary =
    dateToSummarize !== null
      ? employeesData.filter((employee) => {
          const dayIndex = dateToSummarize - 1;
          return (
            employee.attendance &&
            employee.attendance.length > dayIndex &&
            employee.attendance[dayIndex].label !== null
          );
        })
      : employeesData;

  dataForSummary.forEach((employee) => {
    if (dateToSummarize !== null) {
      const dayIndex = dateToSummarize - 1;
      if (employee.attendance && employee.attendance.length > dayIndex) {
        const att = employee.attendance[dayIndex];
        switch (att.label.toUpperCase()) {
          case "P":
            totalPresent++;
            break;
          case "PL":
            totalPresentWithLeave++;
            break;
          case "A":
            totalAbsent++;
            break;
          case "P/A":
            totalHalfDay++;
            break;
          case "H":
            totalHoliday++;
            break;
          case "PH":
            totalPresentOnHoliday++;
            break;
          case "PH/A":
            totalHalfDayOnHoliday++;
            break;
          case "LOP":
            totalLOP++;
            break;
          case "P/LOP":
            totalPresentOnLOP++;
            break;
        }
      }
    } else {
      employee.attendance.forEach((att) => {
        if (att.label !== null && att.label !== "") {
          switch (att.label.toUpperCase()) {
            case "P":
              totalPresent++;
              break;
            case "PL":
              totalPresentWithLeave++;
              break;
            case "A":
              totalAbsent++;
              break;
            case "P/A":
              totalHalfDay++;
              break;
            case "H":
              totalHoliday++;
              break;
            case "PH":
              totalPresentOnHoliday++;
              break;
            case "PH/A":
              totalHalfDayOnHoliday++;
              break;
            case "LOP":
              totalLOP++;
              break;
            case "P/LOP":
              totalPresentOnLOP++;
              break;
          }
        }
      });
    }
  });

  return {
    totalPresent,
    totalAbsent,
    totalHalfDay,
    totalHoliday,
    totalPresentOnHoliday,
    totalHalfDayOnHoliday,
    totalLOP,
    totalPresentOnLOP,
    totalPresentWithLeave,
  };
};

// Helper function to calculate leave summary
export const calculateLeaveSummary = (filteredAndSearchedLeaveData) => {
  let totalLeavesTaken = 0;
  let totalLeavesEarned = 0;
  let totalNetLeaveBalance = 0;

  filteredAndSearchedLeaveData.forEach((leave) => {
    totalLeavesTaken += parseFloat(leave.leavesTaken);
    totalLeavesEarned += parseFloat(leave.leavesEarned);
    totalNetLeaveBalance += parseFloat(leave.netLeaves);
  });

  return {
    totalLeavesTaken: totalLeavesTaken.toFixed(1),
    totalLeavesEarned: totalLeavesEarned.toFixed(1),
    totalNetLeaveBalance: totalNetLeaveBalance.toFixed(1),
  };
}; 