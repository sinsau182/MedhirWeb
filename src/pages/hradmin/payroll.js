import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Edit, Search, Calendar } from "lucide-react";

export default function HradminCompanies() {
  const [activePage, setActivePage] = useState("attendance");
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("Basic");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const router = useRouter();

  const handleRowClick = (employee) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { employee: JSON.stringify(employee) },
    });
  };

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  const mainTabs = [{ value: "salaryStatement", label: "Salary Statement" }];

  const handleTabClick = (tab) => {
    setActiveTab(tab.value);
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
        <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-24 text-xl font-medium">
          <button
            onClick={() => router.push("/hradmin/employees")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/employees"
                ? "text-blue-600 font-bold"
                : "text-black"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => router.push("/hradmin/attendance")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/attendance"
                ? "text-blue-600 font-bold"
                : "text-black"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => router.push("/hradmin/payroll")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/payroll"
                ? "text-blue-600 font-bold"
                : "text-black"
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => router.push("/hradmin/settings")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/settings"
                ? "text-blue-600 font-bold"
                : "text-black"
            }`}
          >
            Settings
          </button>
        </nav>
      </header>

      <div className="h-5" />
      <div className="p-10">
        <div className="mt-2 p-4 rounded-lg bg-gray-200 flex items-center justify-between">
          {/* Left Spacer */}
          <div className="w-[20%]"></div>

          {/* Centered Search Box */}
          <div className="relative w-[50%] mx-auto">
            <Input
              placeholder="Search"
              className="w-full bg-gray-100 text-black border border-gray-300 pr-10 text-lg"
            />
            <Search
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={24}
            />
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-4">
            {/* Month Picker Button */}
            <div className="relative">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center space-x-2 bg-gray-100 border border-gray-300 text-black p-2 rounded-md"
              >
                <Calendar
                  size={24}
                  className="text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2"
                />
                <span className="pl-8">{selectedMonth}</span>
              </button>
              {showMonthPicker && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-md rounded-lg p-2 grid grid-cols-3 gap-2 z-10">
                  {months.map((month) => (
                    <button
                      key={month}
                      onClick={() => {
                        setSelectedMonth(month);
                        setShowMonthPicker(false);
                      }}
                      className="p-2 text-center hover:bg-gray-300 rounded-md"
                    >
                      {month.slice(0, 3)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Button */}
            <button
              onClick={() => router.push("/hradmin/edit")}
              className="flex items-center hover:text-blue-600 text-black"
            >
              <Edit className="mr-2" size={20} />
              Edit
            </button>
          </div>
        </div>

        {/* Sub Navbar */}
        <div className="bg-gray-300 p-3 rounded-md mt-4 flex justify-between text-lg shadow-md mx-auto ">
          {mainTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab)}
              className={`ml-10 mr-10 hover:text-blue-600 ${
                activeTab === tab.value
                  ? "text-blue-600 font-bold"
                  : "text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-6 bg-gradient-to-b from-gray-200 to-gray-300 p-4 shadow-md rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <>
                  <TableHead className="text-left">Name</TableHead>
                  <TableHead className="text-left">Paid Days</TableHead>
                  <TableHead className="text-left">Monthly CTC</TableHead>
                  <TableHead className="text-left">This Month Salary</TableHead>
                  <TableHead className="text-left">Basic</TableHead>
                  <TableHead className="text-left">Deductions</TableHead>
                  <TableHead className="text-left">Taxes</TableHead>
                  <TableHead className="text-left">Professional Tax</TableHead>
                  <TableHead className="text-left">Reimbursement</TableHead>
                  <TableHead className="text-left">Advance Taken</TableHead>
                  <TableHead className="text-left">Net Pay</TableHead>
                </>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-left">John Doe</TableCell>
                <TableCell className="text-left">20</TableCell>
                <TableCell className="text-left">₹5000</TableCell>
                <TableCell className="text-left">₹4500</TableCell>
                <TableCell className="text-left">₹3000</TableCell>
                <TableCell className="text-left">₹500</TableCell>
                <TableCell className="text-left">₹200</TableCell>
                <TableCell className="text-left">₹100</TableCell>
                <TableCell className="text-left">₹300</TableCell>
                <TableCell className="text-left">₹400</TableCell>
                <TableCell className="text-left">₹3500</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
