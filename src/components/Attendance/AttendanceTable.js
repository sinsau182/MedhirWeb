import React from "react";
import { Search } from "lucide-react";

const AttendanceTable = ({
  dates,
  statusOptions,
  selectedStatuses,
  isStatusFilterOpen,
  toggleStatus,
  searchInput,
  setSearchInput,
  selectedDate,
  handleDateClick,
  filteredEmployees,
  getAttendanceColor,
  attendance,
  summaryDate,
  summary,
  selectedEmployeeId,
  handleEmployeeRowClick,
  selectedMonth,
  selectedYear,
  statusFilterRef,
  setIsStatusFilterOpen,
}) => {
  // Helper function to get attendance status for a specific date from the new API format
  const getAttendanceStatusForDate = (attendanceRecord, dateString) => {
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

  // Determine which data to use for rendering
  let dataToRender = filteredEmployees;

  // If we have attendance data from the API and status filters are applied
  if (attendance && attendance.length > 0 && selectedStatuses.length > 0) {
    // Filter filteredEmployees based on the attendance status on the summaryDate
    dataToRender = filteredEmployees
      .filter((employee) => {
        // Find the employee's attendance record from the fetched data
        const empAttendanceRecord = attendance.find(
          (attRec) => attRec.employeeId === employee.id
        );
        if (!empAttendanceRecord) return false; // Employee not in fetched attendance data

        // Get the attendance status for the summaryDate (current date or selected date)
        let statusForSummaryDate = null;
        if (summaryDate) {
          const monthIndex = new Date(
            `${selectedMonth} 1, ${selectedYear}`
          ).getMonth();
          const dateString = `${selectedYear}-${String(
            monthIndex + 1
          ).padStart(2, "0")}-${String(summaryDate).padStart(2, "0")}`;
          statusForSummaryDate = getAttendanceStatusForDate(
            empAttendanceRecord,
            dateString
          );
        }

        // Check if the status for the summaryDate is included in the selected statuses
        return selectedStatuses
          .map((s) => s.toUpperCase())
          .includes(statusForSummaryDate?.toUpperCase());
      })
      .map((employee) => {
        // Map the employee data, ensuring attendance array uses fetched data
        const empAttendanceRecord = attendance.find(
          (attRec) => attRec.employeeId === employee.id
        );

        // Create attendance array for the employee using fetched data
        const attendanceArray = Array(dates.length)
          .fill({ value: null, label: "" })
          .map((_, index) => {
            const day = index + 1;
            const monthIndex = new Date(
              `${selectedMonth} 1, ${selectedYear}`
            ).getMonth();
            const dateString = `${selectedYear}-${String(
              monthIndex + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const status = getAttendanceStatusForDate(
              empAttendanceRecord,
              dateString
            );

            if (!status) {
              return { value: null, label: "" };
            }

            // Map the status to the correct format
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
          ...employee,
          attendance: attendanceArray,
        };
      });
  } else if (
    selectedStatuses.length === 0 &&
    attendance &&
    attendance.length > 0
  ) {
    // If no status filters are applied, but we have fetched attendance data (e.g., due to date selection)
    // We still need to use the data from the 'attendance' state, but without filtering by status
    dataToRender = filteredEmployees
      .filter((employee) =>
        attendance.some((attRec) => attRec.employeeId === employee.id)
      )
      .map((employee) => {
        const empAttendanceRecord = attendance.find(
          (attRec) => attRec.employeeId === employee.id
        );

        const attendanceArray = Array(dates.length)
          .fill({ value: null, label: "" })
          .map((_, index) => {
            const day = index + 1;
            const monthIndex = new Date(
              `${selectedMonth} 1, ${selectedYear}`
            ).getMonth();
            const dateString = `${selectedYear}-${String(
              monthIndex + 1
            ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const status = getAttendanceStatusForDate(
              empAttendanceRecord,
              dateString
            );

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
          ...employee,
          attendance: attendanceArray,
        };
      });
  } else if (
    selectedStatuses.length > 0 &&
    (!attendance || attendance.length === 0)
  ) {
    // If status filters are applied, but no attendance data was returned from the API for the selected date
    // This means no employee had the selected status on that date, so show empty table
    dataToRender = [];
  } else {
    // Default case: no date selected, no status filters, use the original data mapped with full month attendance
    // filteredEmployees already contains this via generateAttendanceData
    dataToRender = filteredEmployees;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 space-y-6">
      {/* Dynamic selection message */}
      {selectedEmployeeId && !selectedDate && (
        <div className="mb-2 text-gray-700 font-medium text-base">
          Showing attendance of an employee with EMP ID{" "}
          <span className="font-semibold">{selectedEmployeeId}</span> on{" "}
          {selectedMonth} {selectedYear}
        </div>
      )}
      {!selectedEmployeeId && selectedDate && (
        <div className="mb-2 text-gray-700 font-medium text-base">
          Showing attendance of the employees on{" "}
          <span className="font-semibold">
            {selectedDate} {selectedMonth} {selectedYear}
          </span>
        </div>
      )}
      {/* Summary Cards in Single Row */}
      <div className="flex gap-4 overflow-x-auto pb-4 border-b border-gray-200">
        {statusOptions.map((status) => {
          let summaryKey;
          switch (status.value) {
            case "P":
              summaryKey = "totalPresent";
              break;
            case "PL":
              summaryKey = "totalPresentWithLeave";
              break;
            case "A":
              summaryKey = "totalAbsent";
              break;
            case "P/A":
              summaryKey = "totalHalfDay";
              break;
            case "H":
              summaryKey = "totalHoliday";
              break;
            case "PH":
              summaryKey = "totalPresentOnHoliday";
              break;
            case "PH/A":
              summaryKey = "totalHalfDayOnHoliday";
              break;
            case "LOP":
              summaryKey = "totalLOP";
              break;
            case "P/LOP":
              summaryKey = "totalPresentOnLOP";
              break;
            default:
              summaryKey = "";
          }
          const showNoData = selectedDate === null && !selectedEmployeeId;
          const count = showNoData ? "--" : summary[summaryKey] || 0;
          return (
            <div
              key={status.value}
              className={`rounded-lg p-4 min-w-[120px] flex flex-col justify-between items-center group ${
                showNoData
                  ? "bg-gray-100"
                  : status.value === "P/A"
                  ? "bg-yellow-100 text-yellow-800"
                  : ""
              }`}
              style={{
                background: showNoData
                  ? undefined
                  : status.value === "P/A"
                  ? undefined
                  : status.color,
                cursor: showNoData ? "not-allowed" : "default",
              }}
              title={
                showNoData
                  ? "Please select a date or employee to show data"
                  : ""
              }
            >
              <p className="text-sm text-gray-700 mb-1 font-medium min-h-[20px]">
                {status.label}
              </p>
              <h3
                className={`text-xl font-bold mt-auto ${
                  showNoData
                    ? "text-gray-400"
                    : status.value === "P/A"
                    ? "text-yellow-800"
                    : "text-gray-800"
                }`}
              >
                {count}
              </h3>
              {showNoData && (
                <span
                  className="absolute opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs rounded px-2 py-1 mt-2 z-50 transition-opacity duration-200"
                  style={{ top: "100%" }}
                >
                  Please select a date or employee to show data
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Filters, Search, and Calendar Section */}
      <div className="flex items-center gap-4">
        {/* Status Filter */}
        <div className="relative" ref={statusFilterRef}>
          <button
            onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
          >
            <span className="text-sm text-gray-700">Filter by Status</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
              {selectedStatuses.length}
            </span>
            {/* Show selected status labels outside */}
            {selectedStatuses.length > 0 && (
              <span className="flex flex-wrap gap-1 ml-2">
                {selectedStatuses.map((status) => {
                  const found = statusOptions.find(
                    (opt) => opt.value === status
                  );
                  const isActive = selectedStatuses.includes(status);
                  return (
                    <span
                      key={status}
                      className={`flex items-center px-2 py-0.5 rounded text-xs cursor-pointer`}
                      style={{
                        backgroundColor: found ? found.color : "#eee",
                        color: "#333",
                        border: "1px solid #ddd",
                      }}
                      onClick={() => toggleStatus(status)}
                    >
                      {found ? found.label : status}
                      {isActive && (
                        <button
                          type="button"
                          className="ml-1 text-gray-500 hover:text-red-600 focus:outline-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStatuses((prev) =>
                              prev.filter((s) => s !== status)
                            );
                          }}
                          aria-label={`Remove ${found ? found.label : status}`}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  );
                })}
              </span>
            )}
          </button>

          {isStatusFilterOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg">
              <div className="p-2 max-h-48 overflow-y-auto">
                {statusOptions.map((status) => (
                  <label
                    key={status.value}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status.value)}
                      onChange={() => toggleStatus(status.value)}
                      className="rounded border-gray-300"
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    ></div>
                    <span className="text-sm">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Legend */}
        <div className="p-4 border-b flex flex-wrap gap-4 text-xs items-center">
          {statusOptions.map((status) => {
            const isActive = selectedStatuses.includes(status.value);
            return (
              <button
                key={status.value}
                type="button"
                onClick={() => toggleStatus(status.value)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition focus:outline-none select-none border text-xs
                  ${
                    isActive
                      ? "shadow-sm -translate-y-0.5 border-2"
                      : "border border-gray-200"
                  }
                  ${isActive ? "" : "hover:bg-gray-200"}
                `}
                style={{
                  background: isActive
                    ? status.value === "P/A"
                      ? "linear-gradient(90deg, #CCFFCC 50%, #FFCCCC 50%)"
                      : status.color
                    : "#f3f4f6",
                  borderColor: isActive
                    ? status.value === "P/A"
                      ? "transparent"
                      : status.color
                    : "#e5e7eb",
                  fontWeight: 400,
                  boxShadow: isActive
                    ? "0 2px 8px 0 rgba(0,0,0,0.04)"
                    : "none",
                  transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
                }}
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    background:
                      status.value === "P/A"
                        ? "linear-gradient(90deg, #CCFFCC 50%, #FFCCCC 50%)"
                        : status.color,
                  }}
                ></div>
                <span>
                  {status.label} ({status.value})
                </span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSelectedStatuses([])}
            className="ml-2 px-2 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-xs border border-gray-300"
          >
            Clear
          </button>
        </div>

        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="border-b border-black">
              {/* Fixed Columns */}
              <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black left-0 bg-white shadow-sm">
                Emp ID
              </th>
              <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[10%] border-r border-black left-[8%] bg-white shadow-sm">
                Name
              </th>
              <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black left-[18%] bg-white shadow-sm">
                Dept
              </th>

              {/* Scrollable Date Columns */}
              {dates.map((date) => {
                const isToday =
                  date.day === new Date().getDate() &&
                  selectedMonth ===
                    new Date().toLocaleString("default", { month: "long" }) &&
                  selectedYear === new Date().getFullYear().toString();
                const isSelected = selectedDate === date.day;

                return (
                  <th
                    key={date.day}
                    className={`py-1 px-0 text-center text-xs font-semibold text-gray-700 border-r border-black cursor-pointer hover:bg-gray-100
                      ${isToday ? "bg-blue-100" : ""}
                      ${isSelected ? "bg-blue-300 text-blue-900" : ""}
                    `}
                    onClick={() => handleDateClick(date.day)}
                  >
                    <div className="leading-none">
                      {String(date.day).padStart(2, "0")}
                    </div>
                    <div className="text-gray-500 text-[10px] leading-tight">
                      {date.weekday}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {/* Use dataToRender which contains either full month data or backend-filtered data */}
            {dataToRender.map((employee, index) => (
              <tr
                key={index}
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={(e) => {
                  // Only trigger row click if not clicking a date cell
                  if (!e.target.closest("td[data-date-cell]")) {
                    handleEmployeeRowClick(employee.id);
                  }
                }}
              >
                {/* Fixed Cells */}
                <td
                  className={`py-1 px-1 text-sm border-r border-black left-0 ${
                    selectedEmployeeId === employee.id
                      ? "bg-blue-100 font-semibold text-gray-800"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {employee.id}
                </td>
                <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] left-[8%] bg-white ">
                  {employee.name}
                </td>
                <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] left-[18%] bg-white ">
                  {employee.department}
                </td>

                {/* Scrollable Attendance Cells */}
                {dates.map((date, index) => {
                  const day = date.day;
                  const employeeAttendanceForMonth = filteredEmployees.find(
                    (emp) => emp.id === employee.id
                  )?.attendance; // Get full month attendance from original data

                  let attendanceForDay = { value: null, label: "" }; // Default to no data

                  // Determine the attendance data to display based on selectedDate and fetched attendance
                  if (selectedDate !== null) {
                    // If a specific date is selected, find the matching attendance record for that day in the fetched attendance
                    const fetchedAttendanceForEmployee = Array.isArray(attendance)
                      ? attendance?.find(
                          (attRec) => attRec.employeeId === employee.id
                        )
                      : attendance;
                    if (fetchedAttendanceForEmployee?.attendance) {
                      // Create date string in YYYY-MM-DD format for the current day
                      const monthIndex = new Date(
                        `${selectedMonth} 1, ${selectedYear}`
                      ).getMonth();
                      const currentDateString = `${selectedYear}-${String(
                        monthIndex + 1
                      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                      // Use the helper function to get status for this date
                      const status = getAttendanceStatusForDate(
                        fetchedAttendanceForEmployee,
                        currentDateString
                      );

                      if (status) {
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
                        attendanceForDay = { value, label: status };
                      }
                    }
                  } else if (
                    employeeAttendanceForMonth &&
                    employeeAttendanceForMonth.length > index
                  ) {
                    // If no specific date is selected, use the full month attendance from filteredEmployees
                    attendanceForDay = employeeAttendanceForMonth[index];
                  }

                  return (
                    <td
                      key={index}
                      data-date-cell
                      className={`py-0.5 px-0 text-center text-[10px] border-r border-black ${getAttendanceColor(
                        attendanceForDay.label
                      )}`}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        handleDateClick(day);
                      }}
                    >
                      {attendanceForDay.label?.toUpperCase()}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceTable; 