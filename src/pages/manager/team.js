import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchManagerEmployees } from "@/redux/slices/managerEmployeeSlice";
import { Search } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import withAuth from "@/components/withAuth";

const ManagerEmployees = () => {
  const dispatch = useDispatch();
  const { employees, loading, error } = useSelector(
    (state) => state.managerEmployee
  );
  const [searchInput, setSearchInput] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hoveredEmployeeId, setHoveredEmployeeId] = useState(null);

  useEffect(() => {
    dispatch(fetchManagerEmployees());
  }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  if (loading) {
    return <div>Loading employees...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          {/* Header with Search and Title */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-800 mb-4">
                Team Members
              </h1>
            </div>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Search..."
                className="w-full md:w-72 pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="w-full">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Father&apos;s Name
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Phone No.
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Email(Off.)
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      DOJ
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Current Address
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-3 text-sm text-gray-500"
                      >
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr
                        key={employee.employeeId}
                        className="hover:bg-gray-50 cursor-pointer"
                        onMouseEnter={() =>
                          setHoveredEmployeeId(employee.employeeId)
                        }
                        onMouseLeave={() => setHoveredEmployeeId(null)}
                      >
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.employeeId}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.name}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.departmentName}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.fathersName}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.phone}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.emailOfficial}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.joiningDate}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 truncate">
                          {employee?.designationName}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-800 relative max-w-xs">
                          {hoveredEmployeeId === employee.employeeId ? (
                            // Show full address on hover
                            <span className="block whitespace-normal break-words">
                              {employee?.currentAddress}
                            </span>
                          ) : (
                            // Show truncated with tooltip
                            <div className="truncate relative group">
                              <span className="block truncate">
                                {employee?.currentAddress}
                              </span>
                              <div className="absolute left-0 top-full mt-1 w-72 p-2 bg-white text-black text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible z-50 break-words border border-gray-300">
                                {employee?.currentAddress}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default withAuth(ManagerEmployees);
