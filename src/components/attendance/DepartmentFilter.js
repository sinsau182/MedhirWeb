import React from "react";

const DepartmentFilter = ({
  selectedDepartments,
  isDepartmentFilterOpen,
  toggleDepartment,
  setSelectedDepartments,
  departmentFilterRef,
  departmentOptions,
}) => {
  return (
    <div className="relative z-10" ref={departmentFilterRef}>
      <button
        onClick={() => setIsDepartmentFilterOpen(!isDepartmentFilterOpen)}
        className="flex items-center gap-2 px-4 py-2 border rounded-md bg-white hover:bg-gray-50"
      >
        <span className="text-sm text-gray-700">
          Filter by Department
        </span>
        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          {selectedDepartments.length}
        </span>
        {/* Show selected department labels outside */}
        {selectedDepartments.length > 0 && (
          <span className="flex flex-wrap gap-1 ml-2">
            {selectedDepartments.map((dept) => (
              <span
                key={dept}
                className="flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 border border-blue-100"
              >
                {dept}
                <button
                  type="button"
                  className="ml-1 text-gray-500 hover:text-red-600 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedDepartments((prev) =>
                      prev.filter((d) => d !== dept)
                    );
                  }}
                  aria-label={`Remove ${dept}`}
                >
                  &times;
                </button>
              </span>
            ))}
          </span>
        )}
      </button>

      {isDepartmentFilterOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border rounded-md shadow-lg z-20">
          <div className="p-2 max-h-48 overflow-y-auto">
            {departmentOptions.map((dept) => (
              <label
                key={dept.value}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(dept.value)}
                  onChange={() => toggleDepartment(dept.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{dept.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentFilter; 