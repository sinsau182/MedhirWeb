import React from "react";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CalendarSelector = ({
  selectedYear,
  selectedMonth,
  isCalendarOpen,
  toggleCalendar,
  handleMonthSelection,
  calendarRef,
}) => {
  return (
    <div className="relative ml-auto" ref={calendarRef}>
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
                  handleMonthSelection(selectedMonth, "2024");
                } else {
                  handleMonthSelection(selectedMonth, "2025");
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
              const currentMonthIdx = new Date().getMonth(); // 0-based
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
                startIdx = 7; // August (0-based)
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
                  onClick={() => handleMonthSelection(month, selectedYear)}
                >
                  {month}
                </button>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarSelector; 