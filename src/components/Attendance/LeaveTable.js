import React from "react";
import { Search } from "lucide-react";

function LeaveTable({
  searchInput,
  setSearchInput,
  departmentOptions,
  selectedDepartments,
  isDepartmentFilterOpen,
  toggleDepartment,
  filteredAndSearchedLeaveData,
  calculateLeaveSummary,
  selectedEmployeeId,
  setSelectedEmployeeId,
  departmentFilterRef,
  setIsDepartmentFilterOpen,
  setSelectedDepartments,
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      {/* Filters and Search Section */}
      <div className="flex items-center gap-4 mb-4">
        {/* Department Filter */}
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

        {/* Search Bar */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search employees..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* Leave Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Emp ID
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Name
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Dept
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Pay Days
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Leaves Taken
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Leaves Earned
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Leaves CF Prev Year
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                Comp Off
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200">
                CF Comp Off
              </th>
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSearchedLeaveData.map((leave) => {
              const leaveBalance =
                parseFloat(leave.leavesEarned) +
                parseFloat(leave.leavesFromPreviousYear) +
                parseFloat(leave.compOffEarned) +
                parseFloat(leave.compOffCarriedForward) -
                parseFloat(leave.leavesTaken);

              return (
                <tr
                  key={leave.id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => setSelectedEmployeeId(leave.id)}
                >
                  <td
                    className={`py-3 px-4 whitespace-nowrap text-sm border-r border-gray-200 ${
                      selectedEmployeeId === leave.id
                        ? "bg-blue-100 font-semibold text-gray-800"
                        : "text-gray-800"
                    }`}
                  >
                    {leave.id}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.name}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.department}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.noOfPayableDays}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.leavesTaken}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.leavesEarned}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.leavesFromPreviousYear}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.compOffEarned}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-r border-gray-200">
                    {leave.compOffCarriedForward}
                  </td>
                  <td
                    className={`py-3 px-4 whitespace-nowrap text-sm ${
                      leaveBalance < 0
                        ? "text-red-600 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LeaveTable;