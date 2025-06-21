import React from "react";
import { statusOptions } from "./constants";

const SummaryCards = ({ summary, selectedDate, selectedEmployeeId }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 border-b border-gray-200">
      {statusOptions.map((status) => {
        // Map the status value to the correct summary key
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
  );
};

export default SummaryCards; 