import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice"; // Corrected import
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import withAuth from "@/components/withAuth";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
} from "react-icons/fa";
import Link from "next/link";

function Employees() {
  const [activePage, setActivePage] = useState("Employees");
  const [activeTab, setActiveTab] = useState("Basic");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const router = useRouter();

  const dispatch = useDispatch();
  const { employees, loading } = useSelector((state) => state.employees); // Corrected selector

  useEffect(() => {
    dispatch(fetchEmployees()); // Fetch employees from Redux store
  }, [dispatch]);

  useEffect(() => {
    if (router.query.page) {
      setActivePage(router.query.page);
    }
  }, [router.query.page]);

  const handleRowClick = (employee) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { employee: JSON.stringify(employee), activeMainTab: activeTab },
    });
  };

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };

  const filteredEmployees = (employees || []).filter((employee) =>
    employee?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );
  

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-10 py-4 flex justify-between items-start z-50 border-b border-gray-300">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">
          MEDHIR
        </h1>
        <nav className="flex flex-grow justify-center space-x-20 text-lg font-medium">
          {["Employees", "Attendance", "Payroll", "Settings"].map(
            (item, index) => (
              <Link
                key={index}
                href={`/hradmin/${item.toLowerCase()}`}
                passHref
              >
                <button
                  onClick={() => setActivePage(item)}
                  className={`hover:text-[#4876D6] ${
                    activePage === item
                      ? "text-black bg-[#E3ECFB] rounded-md px-2 py-1"
                      : "text-[#6c757d]"
                  }`}
                  style={{
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {item === "Employees" && (
                    <FaUsers
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item === "Attendance" && (
                    <FaCalendarCheck
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item === "Payroll" && (
                    <FaMoneyCheckAlt
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item === "Settings" && (
                    <FaCog
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item}
                </button>
              </Link>
            )
          )}
        </nav>
        <div className="relative">
          <button
            className="flex items-center gap-2 text-black font-medium"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaUserCircle className="text-2xl" />
            HR Admin
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button
                className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Search Box */}
      <div className="h-5" />
      <div className="p-10">
        <div className="mt-2 p-4 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="px-4 py-2 border border-blue-300 text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center"
              onClick={() =>
                router.push({
                  pathname: "/hradmin/addNewEmployee",
                  query: { activeMainTab: activeTab },
                })
              }
            >
              <UserPlus className="mr-2" size={22} /> Add New Employee
            </button>
            <div className="relative w-96 ml-4">
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
        </div>

        {/* Sub Navbar */}
        <div className="p-3 rounded-lg mt-4 flex justify-between text-lg mx-auto bg-gray-50 border border-gray-200">
          {[
            "Basic",
            "ID Proofs",
            "Salary Details",
            "Bank Details",
            "Leaves Policy",
          ].map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`ml-10 mr-10 ${
                activeTab === tab
                  ? "text-gray-800 font-bold"
                  : "text-gray-600 font-medium"
              } hover:text-black`}
              style={{
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Section */}
        <div className="mt-6 even: bg-gray-100 border border-gray-300 rounded-lg shadow-md">
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
  );
}

export default withAuth(Employees);
