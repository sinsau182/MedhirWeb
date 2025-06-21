import React from "react";
import { statusOptions } from "./constants";

const StatusFilter = ({
  selectedStatuses,
  isStatusFilterOpen,
  toggleStatus,
  setSelectedStatuses,
  statusFilterRef,
}) => {
  return (
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
                      aria-label={`Remove ${
                        found ? found.label : status
                      }`}
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
  );
};

export default StatusFilter; 