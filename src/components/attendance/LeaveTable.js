import React from "react";

const LeaveTable = ({ filteredAndSearchedLeaveData, selectedEmployeeId, setSelectedEmployeeId }) => {
  return (
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
  );
};

export default LeaveTable; 