import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { fetchEmployees } from "@/utils/api";

const Employees = () => {
  const [activePage, setActivePage] = useState("Employees");
  const [activeTab, setActiveTab] = useState("Basic");
  const [employees, setEmployees] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/hradmin/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };
    fetchEmployees();

    if (router.query.tab) {
        setActiveTab(router.query.tab);
      }
    }, [router.query.tab]);

  useEffect(() => {
    if (router.query.page) {
      setActivePage(router.query.page);
    }
  }, [router.query.page]);

  const handleRowClick = (employee) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { employee: JSON.stringify(employee) },
    });
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
        <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-24 text-xl font-medium">
          <button
            onClick={() => router.push("/hradmin/employees")}
            className={`hover:text-blue-600 ${
              activePage === "Employees" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => router.push("/hradmin/attendance")}
            className={`hover:text-blue-600 ${
              activePage === "Attendance" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => router.push("/hradmin/payroll")}
            className={`hover:text-blue-600 ${
              activePage === "Payroll" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => router.push("/hradmin/settings")}
            className={`hover:text-blue-600 ${
              activePage === "Settings" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Settings
          </button>
        </nav>
        <Button className="bg-green-600 hover:bg-green-500 text-white">
          Logout
        </Button>
      </header>

      {/* Search Box */}
      <div className="h-5" />
      <div className="p-10">
        <div className="mt-2 p-4 rounded-lg bg-gray-200 flex justify-between items-center">
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center"
            onClick={() => router.push("/hradmin/addNewEmployee")}
          >
            <UserPlus className="mr-2" size={20} /> Add New Employee
          </Button>
          <div className="flex w-screen justify-center">
            <div className="relative w-[60%]">
              <Input
                placeholder="Search"
                className="w-full bg-gray-100 text-black border border-gray-300 pr-10 text-lg"
              />
              <Search
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Sub Navbar */}
        <div className="bg-gray-300 p-3 rounded-md mt-4 flex justify-between text-lg shadow-md mx-auto ">
          {[
            "Basic",
            "ID Proofs",
            "Salary",
            "Bank Details",
            "Leaves Policy",
          ].map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`ml-10 mr-10 hover:text-blue-600 ${
                activeTab === tab ? "text-blue-600 font-bold" : "text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Section */}
        <div className="mt-6 bg-gradient-to-b from-gray-200 to-gray-300 p-4 shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                {activeTab === "Basic" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-left">Email</TableHead>
                    <TableHead className="text-left">Phone no.</TableHead>
                    <TableHead className="text-left">Department</TableHead>
                    <TableHead className="text-left">Gender</TableHead>
                    <TableHead className="text-left">Title</TableHead>
                    <TableHead className="text-left">
                      Reporting Manager
                    </TableHead>
                  </>
                )}
                {activeTab === "ID Proofs" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-left">Aadhar no.</TableHead>
                    <TableHead className="text-left">Pan no.</TableHead>
                    <TableHead className="text-left">Voter ID</TableHead>
                    <TableHead className="text-left">Passport no.</TableHead>
                  </>
                )}
                {activeTab === "Salary" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-left">Total Ctc</TableHead>
                    <TableHead className="text-left">Basic</TableHead>
                    <TableHead className="text-left">HRA</TableHead>
                    <TableHead className="text-left">Allowance</TableHead>
                    <TableHead className="text-left">PF</TableHead>
                  </>
                )}
                {activeTab === "Bank Details" && (
                  <>
                    <TableHead className="text-left">Name</TableHead>
                    <TableHead className="text-left">Account no.</TableHead>
                    <TableHead className="text-left">Bank Name</TableHead>
                    <TableHead className="text-left">IFSC</TableHead>
                    <TableHead className="text-left">Branch Name</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
            {employees.map((employee) => (
                <TableRow key={employee.id} onClick={() => handleRowClick(employee)}>
                  {activeTab === "Basic" && (
                    <>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.phone}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>{employee.gender}</TableCell>
                      <TableCell>{employee.title}</TableCell>
                      <TableCell>{employee.reportingManager}</TableCell>
                    </>
                  )}
                  {activeTab === "ID Proofs" && (
                    <>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.idProofs?.aadharNo}</TableCell>
                      <TableCell>{employee.idProofs?.panNo}</TableCell>
                      <TableCell>{employee.idProofs?.voterId}</TableCell>
                      <TableCell>{employee.idProofs?.passport}</TableCell>
                    </>
                  )}
                  {activeTab === "Salary" && (
                    <>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.salaryDetails?.totalCtc}</TableCell>
                      <TableCell>{employee.salaryDetails?.basic}</TableCell>
                      <TableCell>{employee.salaryDetails?.hra}</TableCell>
                      <TableCell>
                        {employee.salaryDetails?.allowances}
                      </TableCell>
                      <TableCell>{employee.salaryDetails?.pf}</TableCell>
                    </>
                  )}
                  {activeTab === "Bank Details" && (
                    <>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>
                        {employee.bankDetails?.accountNumber}
                      </TableCell>
                      <TableCell>{employee.bankDetails?.bankName}</TableCell>
                      <TableCell>{employee.bankDetails?.ifscCode}</TableCell>
                      <TableCell>{employee.bankDetails?.branchName}</TableCell>
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
};

export default Employees;
