import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

function Employees() {
  const [activeTab, setActiveTab] = useState("Basic");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees);

  useEffect(() => {
    router.prefetch("/manager/team");
    dispatch(fetchEmployees());
  }, [dispatch]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const filteredEmployees = (employees || []).filter((employee) =>
    employee?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
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
                    {activeTab === "Basic" && (
                      <>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Father's Name
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Phone No.
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Email(Off.)
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          DOJ
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Designation
                        </th>
                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Current Address
                        </th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-3 text-sm text-gray-500">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mr-2"></div>
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-3 text-sm text-gray-500">
                        No team members found
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <tr 
                        key={employee.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        {activeTab === "Basic" && (
                          <>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.employeeId}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.name}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.fathersName}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.phone}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.emailOfficial}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.joiningDate}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.designation}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 truncate">
                              {employee?.currentAddress}
                            </td>
                          </>
                        )}
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
}

export default withAuth(Employees);
