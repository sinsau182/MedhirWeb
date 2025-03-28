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
    dispatch(fetchEmployees());
  }, [dispatch]);

  const handleRowClick = (employee) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { employee: JSON.stringify(employee), activeMainTab: activeTab },
    });
  };

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
            <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
            <button
              className="px-4 py-2 border border-[#1d4ed8] text-white bg-[#1d4ed8] hover:bg-[#2563eb] rounded-md flex items-center"
              onClick={() => router.push({ pathname: "/hradmin/addNewEmployee", query: { activeMainTab: activeTab } })}
            >
              <UserPlus className="mr-2" size={22} /> Add New Employee
            </button>
          </div>

          {/* Search Box */}
          <div className="mt-4">
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

          {/* Tabs */}
          <div className="p-3 rounded-lg mt-4 flex space-x-4 text-lg mx-auto bg-gray-50 border border-gray-200">
            {["Basic", "ID Proofs", "Salary Details", "Bank Details", "Leaves Policy"].map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md ${
                  activeTab === tab ? "bg-white shadow-md text-black font-bold" : "text-gray-600 font-medium"
                } hover:text-black`}
              >
                {tab}
              </button>
            ))}
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
                {activeTab === "ID Proofs" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-center">Aadhar no.</TableHead>
                    <TableHead className="text-center">Pan no.</TableHead>
                    <TableHead className="text-center">Voter ID</TableHead>
                    <TableHead className="text-center">Passport no.</TableHead>
                  </>
                )}
                {activeTab === "Salary Details" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-center">Total Ctc</TableHead>
                    <TableHead className="text-center">Basic</TableHead>
                    <TableHead className="text-center">HRA</TableHead>
                    <TableHead className="text-center">Allowance</TableHead>
                    <TableHead className="text-center">PF</TableHead>
                  </>
                )}
                {activeTab === "Bank Details" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-center">Account no.</TableHead>
                    <TableHead className="text-center">Bank Name</TableHead>
                    <TableHead className="text-center">IFSC</TableHead>
                    <TableHead className="text-center">Branch Name</TableHead>
                  </>
                )}
                </TableRow>
              </TableHeader>
              <TableBody>
              {filteredEmployees.map((employee, index) => (
                <TableRow
                  key={employee.id}
                  onClick={() => handleRowClick(employee)}
                  className={`cursor-pointer hover:bg-gray-100 transition ${
                    index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                  }`}
                >
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
                  {activeTab === "ID Proofs" && (
                    <>
                      <TableCell className="text-left">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.idProofs?.aadharNo}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.idProofs?.panNo}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.idProofs?.voterId}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.idProofs?.passport}
                      </TableCell>
                    </>
                  )}
                  {activeTab === "Salary Details" && (
                    <>
                      <TableCell className="text-left">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.salaryDetails?.totalCtc}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.salaryDetails?.basic}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.salaryDetails?.hra}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.salaryDetails?.allowances}
                      </TableCell>
                      <TableCell>{employee.salaryDetails?.pf}</TableCell>
                    </>
                  )}
                  {activeTab === "Bank Details" && (
                    <>
                      <TableCell className="text-left">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.bankDetails?.accountNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.bankDetails?.bankName}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.bankDetails?.ifscCode}
                      </TableCell>
                      <TableCell className="text-center">
                        {employee.bankDetails?.branchName}
                      </TableCell>
                      {/* <TableCell>{employee.upiId}</TableCell> */}
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
