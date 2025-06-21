import React from "react";
import { statusOptions } from "./constants";

const Legend = ({ selectedStatuses, toggleStatus, setSelectedStatuses }) => {
  return (
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
  );
};

export default Legend; 