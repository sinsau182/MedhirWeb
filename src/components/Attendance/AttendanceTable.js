import React from "react";
import { Search, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  onCellClick,
  setSelectedStatuses,
  popoverOpenCell,
  // Calendar props
  isCalendarOpen,
  toggleCalendar,
  calendarRef,
  handleMonthSelection,
  isSingleEmployeeModalOpen,
}) => {
  // Helper function to get attendance status for a specific date from the new API format
  const getAttendanceStatusForDate = (attendanceRecord, dayNumber) => {
    if (!attendanceRecord?.days) return null; // Return null if no data (empty box)

    // Check if the day exists in the days object
    if (attendanceRecord.days[dayNumber]) {
      return attendanceRecord.days[dayNumber].statusCode;
    }

    // Return null if no status code is available (empty box)
    return null;
  };

  // Determine which data to use for rendering
  let dataToRender = filteredEmployees;

  // If we have attendance data from the API and status filters are applied
  if (
    attendance &&
    attendance.monthlyAttendance &&
    attendance.monthlyAttendance.length > 0 &&
    selectedStatuses.length > 0
  ) {
    // Filter filteredEmployees based on the attendance status on the summaryDate
    dataToRender = filteredEmployees
      .filter((employee) => {
        // Find the employee's attendance record from the fetched data
        const empAttendanceRecord = attendance.monthlyAttendance.find(
          (attRec) => attRec.employeeId === employee.id
        );
        if (!empAttendanceRecord) return false; // Employee not in fetched attendance data

        // Get the attendance status for the summaryDate (current date or selected date)
        let statusForSummaryDate = null;
        if (summaryDate) {
          statusForSummaryDate = getAttendanceStatusForDate(
            empAttendanceRecord,
            summaryDate.toString()
          );
        }

        // Check if the status for the summaryDate is included in the selected statuses
        return selectedStatuses
          .map((s) => s.toUpperCase())
          .includes(statusForSummaryDate?.toUpperCase());
      })
      .map((employee) => {
        // Map the employee data, ensuring attendance array uses fetched data
        const empAttendanceRecord = attendance.monthlyAttendance.find(
          (attRec) => attRec.employeeId === employee.id
        );

        // Create attendance array for the employee using fetched data
        const attendanceArray = Array(dates.length)
          .fill({ value: null, label: null })
          .map((_, index) => {
            const day = index + 1;
            const status = getAttendanceStatusForDate(
              empAttendanceRecord,
              day.toString()
            );

            // If status is null, return empty object
            if (status === null) {
              return { value: null, label: null };
            }

            let value;
            switch (status.toUpperCase()) {
              case "P":
                value = true;
                break;
              case "L":
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
    attendance.monthlyAttendance &&
    attendance.monthlyAttendance.length > 0
  ) {
    // If no status filters are applied, but we have fetched attendance data (e.g., due to date selection)
    // We still need to use the data from the 'attendance' state, but without filtering by status
    dataToRender = filteredEmployees
      .filter((employee) =>
        attendance.monthlyAttendance.some(
          (attRec) => attRec.employeeId === employee.id
        )
      )
      .map((employee) => {
        const empAttendanceRecord = attendance.monthlyAttendance.find(
          (attRec) => attRec.employeeId === employee.id
        );

        const attendanceArray = Array(dates.length)
          .fill({ value: null, label: null })
          .map((_, index) => {
            const day = index + 1;
            const status = getAttendanceStatusForDate(
              empAttendanceRecord,
              day.toString()
            );

            // If status is null, return empty object
            if (status === null) {
              return { value: null, label: null };
            }

            let value;
            switch (status.toUpperCase()) {
              case "P":
                value = true;
                break;
              case "L":
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
    (!attendance ||
      !attendance.monthlyAttendance ||
      attendance.monthlyAttendance.length === 0)
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
        <div className="flex items-center gap-4 mb-2">
          <div className="text-gray-700 font-medium text-base">
            Showing attendance of the employees on{" "}
            <span className="font-semibold">
              {selectedDate} {selectedMonth} {selectedYear}
            </span>
          </div>
          {/* Calendar - Hide when Single Employee Month is open */}
          {!isSingleEmployeeModalOpen && (
            <div className="relative" ref={calendarRef}>
              <Badge
                variant="outline"
                className="px-4 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 text-white"
                onClick={toggleCalendar}
              >
                <Calendar className="h-4 w-4" />
                <span className="font-medium text-sm">
                  {selectedYear}-{selectedMonth}
                </span>
              </Badge>
              {isCalendarOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-30">
                  <div className="p-3 border-b flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-700">
                      {selectedYear}
                    </div>
                    <select
                      value={selectedYear}
                      onChange={(e) => {
                        const newYear = e.target.value;
                        if (newYear === "2024") {
                          handleMonthSelection("Aug", newYear);
                        } else {
                          handleMonthSelection("Jan", newYear);
                        }
                      }}
                      className="ml-2 border rounded px-2 py-1 text-sm"
                    >
                      {[2024, 2025].map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 p-3">
                    {(() => {
                      const currentYear = new Date().getFullYear();
                      const currentMonthIdx = new Date().getMonth();
                      let months = [
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
                      ];
                      let startIdx = 0;
                      let endIdx = 11;
                      if (parseInt(selectedYear) === 2024) {
                        startIdx = 7;
                        endIdx = 11;
                      } else if (parseInt(selectedYear) === 2025) {
                        startIdx = 0;
                        endIdx = currentYear === 2025 ? currentMonthIdx : 11;
                      }
                      return months.slice(startIdx, endIdx + 1).map((month) => (
                        <button
                          key={month}
                          className={`p-3 text-sm rounded-md transition-colors duration-200 ${
                            month === selectedMonth.slice(0, 3)
                              ? "bg-blue-50 text-blue-600 font-medium hover:bg-blue-100"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                          onClick={() =>
                            handleMonthSelection(month, selectedYear)
                          }
                        >
                          {month}
                        </button>
                      ));
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}
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
            case "L":
              summaryKey = "totalApprovedLeave";
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
                  background: isActive ? status.color : "#f3f4f6",
                  borderColor: isActive ? status.color : "#e5e7eb",
                  fontWeight: 400,
                  boxShadow: isActive ? "0 2px 8px 0 rgba(0,0,0,0.04)" : "none",
                  transition: "all 0.15s cubic-bezier(.4,0,.2,1)",
                }}
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{
                    background: status.color,
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
                {dates.map((date, dateIdx) => {
                  const day = date.day;
                  const employeeAttendanceForMonth = filteredEmployees.find(
                    (emp) => emp.id === employee.id
                  )?.attendance; // Get full month attendance from original data

                  let attendanceForDay = { value: null, label: "" }; // Default to no data

                  // Check if this date is in the future
                  const currentDate = new Date();
                  const cellDate = new Date(
                    selectedYear,
                    new Date(`${selectedMonth} 1, ${selectedYear}`).getMonth(),
                    day
                  );
                  const isFutureDate = cellDate > currentDate;

                  // Determine the attendance data to display based on selectedDate and fetched attendance
                  if (selectedDate !== null) {
                    // If a specific date is selected, find the matching attendance record for that day in the fetched attendance
                    const fetchedAttendanceForEmployee =
                      attendance?.monthlyAttendance?.find(
                        (attRec) => attRec.employeeId === employee.id
                      );
                    if (fetchedAttendanceForEmployee) {
                      // Use the helper function to get status for this date
                      const status = getAttendanceStatusForDate(
                        fetchedAttendanceForEmployee,
                        day.toString()
                      );

                      if (status) {
                        let value;
                        switch (status.toUpperCase()) {
                          case "P":
                            value = true;
                            break;
                          case "L":
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
                    employeeAttendanceForMonth.length > dateIdx
                  ) {
                    // If no specific date is selected, use the full month attendance from filteredEmployees
                    attendanceForDay = employeeAttendanceForMonth[dateIdx];
                  }

                  // Build date string for this cell
                  const monthIndex = new Date(
                    `${selectedMonth} 1, ${selectedYear}`
                  ).getMonth();
                  const dateString = `${selectedYear}-${String(
                    monthIndex + 1
                  ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

                  const cellKey = `${employee.id}-${dateString}`;

                  // Check if this is a future date with "A" status that should be hidden
                  const isFutureDateWithAbsent =
                    isFutureDate && attendanceForDay.label === "A";

                  return (
                    <td
                      key={dateIdx}
                      data-date-cell
                      className={`py-0.5 px-0 text-center text-[10px] border-r border-black ${
                        isFutureDateWithAbsent
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : getAttendanceColor(attendanceForDay.label)
                      }`}
                    >
                      {attendanceForDay.label ? (
                        <button
                          type="button"
                          className={`w-full h-full flex items-center justify-center focus:outline-none rounded transition ${
                            isFutureDate
                              ? "cursor-not-allowed opacity-50"
                              : "focus:ring-2 focus:ring-blue-400 hover:shadow-sm cursor-pointer"
                          }`}
                          style={{ background: "transparent" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Only allow editing if it's not a future date
                            if (
                              !isFutureDate &&
                              onCellClick &&
                              (!popoverOpenCell || popoverOpenCell !== cellKey)
                            ) {
                              onCellClick(
                                employee,
                                dateString,
                                attendanceForDay.label,
                                e
                              );
                            }
                          }}
                          tabIndex={isFutureDate ? -1 : 0}
                          title={
                            isFutureDate
                              ? `Cannot edit future date: ${dateString}`
                              : `Edit attendance for ${employee.name} on ${dateString}`
                          }
                          disabled={isFutureDate || popoverOpenCell === cellKey}
                        >
                          {/* Hide "A" text for future dates, show all other statuses */}
                          {isFutureDateWithAbsent
                            ? ""
                            : attendanceForDay.label?.toUpperCase()}
                        </button>
                      ) : (
                        // Show empty clickable box for unmarked attendance
                        <button
                          type="button"
                          className={`w-full h-full flex items-center justify-center focus:outline-none rounded transition border border-gray-50 hover:border-gray-400 hover:bg-gray-50 ${
                            isFutureDate
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer focus:ring-2 focus:ring-blue-400"
                          }`}
                          style={{ background: "transparent" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Only allow editing if it's not a future date
                            if (
                              !isFutureDate &&
                              onCellClick &&
                              (!popoverOpenCell || popoverOpenCell !== cellKey)
                            ) {
                              onCellClick(employee, dateString, null, e);
                            }
                          }}
                          tabIndex={isFutureDate ? -1 : 0}
                          title={
                            isFutureDate
                              ? `Cannot edit future date: ${dateString}`
                              : `Mark attendance for ${employee.name} on ${dateString}`
                          }
                          disabled={isFutureDate || popoverOpenCell === cellKey}
                        >
                          {/* Show empty box for unmarked attendance */}
                          <span className="text-gray-400 text-xs">-</span>
                        </button>
                      )}
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