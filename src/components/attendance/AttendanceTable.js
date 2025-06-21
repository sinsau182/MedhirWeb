import React from "react";
import { getAttendanceColor } from "./constants";

const AttendanceTable = ({
  dates,
  dataToRender,
  selectedEmployeeId,
  selectedDate,
  handleEmployeeRowClick,
  handleDateClick,
  getAttendanceStatusForDate,
  attendance,
  selectedMonth,
  selectedYear,
  originalFilteredEmployees,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse min-w-max">
          <thead>
            <tr className="border-b border-black">
              {/* Fixed Columns */}
              <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black sticky left-0 bg-white z-20 shadow-sm">
                Emp ID
              </th>
              <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[10%] border-r border-black sticky left-[8%] bg-white z-20 shadow-sm">
                Name
              </th>
              <th className="py-2 px-1 text-left text-xs font-semibold text-gray-700 w-[8%] border-r border-black sticky left-[18%] bg-white z-20 shadow-sm">
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
                  className={`py-1 px-1 text-sm border-r border-black sticky left-0 z-10 ${
                    selectedEmployeeId === employee.id
                      ? "bg-blue-100 font-semibold text-gray-800"
                      : "bg-white text-gray-800"
                  }`}
                >
                  {employee.id}
                </td>
                <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sticky left-[8%] bg-white z-10">
                  {employee.name}
                </td>
                <td className="py-1 px-1 text-sm text-gray-800 border-r border-black whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sticky left-[18%] bg-white z-10">
                  {employee.department}
                </td>

                {/* Scrollable Attendance Cells */}
                {dates.map((date, index) => {
                  const day = date.day;
                  const employeeAttendanceForMonth =
                    originalFilteredEmployees.find(
                      (emp) => emp.id === employee.id
                    )?.attendance; // Get full month attendance from original data

                  let attendanceForDay = { value: null, label: "" }; // Default to no data

                  // Determine the attendance data to display based on selectedDate and fetched attendance
                  if (selectedDate !== null) {
                    // If a specific date is selected, find the matching attendance record for that day in the fetched attendance
                    const fetchedAttendanceForEmployee = attendance?.find(
                      (attRec) => attRec.employeeId === employee.id
                    );
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
                    // If no specific date is selected, use the full month attendance from originalFilteredEmployees
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