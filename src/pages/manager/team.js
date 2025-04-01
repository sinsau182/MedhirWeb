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
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main content container */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        
        {/* Navbar - Stays at the top */}
        <HradminNavbar />

        {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 pt-24">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Team Members</h1>
                {/* Search Box */}
                <div className="relative w-96">
                  <div className="flex items-center bg-white border border-gray-400 rounded-md px-3 py-1.5">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-3 text-gray-700 bg-transparent focus:outline-none"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                  </div>
                </div>
              </div>
              {/* Table Section */}
          <div className="mt-6 bg-gray-100 border border-gray-300 rounded-lg shadow-md">
            <Table>
              <TableHeader className="bg-gray-300 text-gray-800 font-bold">
                <TableRow>
                {activeTab === "Basic" && (
                  <>
                    <TableHead className="text-left bg-gray-300 text-gray-800 font-bold">
                      Name
                    </TableHead>
                    <TableHead className="text-center bg-gray-300 text-gray-800 font-bold">
                      Email
                    </TableHead>
                    <TableHead className="text-center bg-gray-300 text-gray-800 font-bold">
                      Phone no.
                    </TableHead>
                    <TableHead className="text-center bg-gray-300 text-gray-800 font-bold">
                      Department
                    </TableHead>
                    <TableHead className="text-center bg-gray-300 text-gray-800 font-bold">
                      Gender
                    </TableHead>
                    <TableHead className="text-center bg-gray-300 text-gray-800 font-bold">
                      Title
                    </TableHead>
                    <TableHead className="text-center bg-gray-300 text-gray-800 font-bold">
                      Reporting Manager
                    </TableHead>
                  </>
                )}
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredEmployees.map((employee, index) => (
                <TableRow>
                  {activeTab === "Basic" && (
                    <>
                      <TableCell className="text-left">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.email}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.phone}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.department}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.gender}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.title}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.reportingManager}
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Employees);
