import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { TableRow, TableHead, TableCell } from "@/components/ui/table";
import cn from "classnames";

const Attendance = () => {
  const [activePage, setActivePage] = useState("attendance");
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [employees, setEmployees] = useState([]);
  const [dates, setDates] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const generateDates = () => {
      return Array.from({ length: 31 }, (_, i) => {
        const date = new Date(2023, 0, i + 1); // January 2023
        return {
          month: date.toLocaleString("default", { month: "short" }),
          day: String(date.getDate()).padStart(2, "0"),
          weekday: date.toLocaleString("default", { weekday: "short" }),
        };
      });
    };

    setDates(generateDates());
  }, []);

  const handleRowClick = (attendance) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { attendance: JSON.stringify(attendance) },
    });
  };

  useEffect(() => {
    fetch("http://localhost:5000/attendance")
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) => console.error("Error fetching attendance data:", error));
  }, []);

  return (
    <div className="bg-white text-black min-h-screen p-6">
      <header className="fixed top-0 left-0 right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
        <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-24 text-xl font-medium">
          <button
            onClick={() => router.push("/hradmin/employees")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/employees" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Employees
          </button>
          <button
            onClick={() => router.push("/hradmin/attendance")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/attendance" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Attendance
          </button>
          <button
            onClick={() => router.push("/hradmin/payroll")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/payroll" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Payroll
          </button>
          <button
            onClick={() => router.push("/hradmin/settings")}
            className={`hover:text-blue-600 ${
              router.pathname === "/hradmin/settings" ? "text-blue-600 font-bold" : "text-black"
            }`}
          >
            Settings
          </button>
        </nav>
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
            "Attendance Tracker",
            "Leave Tracker",
            "Basic",
            "ID Proofs",
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




      </div>
      <div className="mt-2 max-h-[calc(100vh-300px)] overflow-auto">
          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="border-r border-gray-300 table-head-start text-xs">Employee ID</TableHead>
                  <TableHead className="border-r border-gray-300 table-head-start text-xs">Name</TableHead>
                  <TableHead className="border-r border-gray-300 table-head-start text-xs">Department</TableHead>
                  <TableHead className="border-r border-gray-300 table-head-start text-xs">P / T.W.D.</TableHead>
                  {dates.map((date, index) => (
                    <TableHead key={index} className="text-center border-r border-gray-300 text-xs table-head-center">
                      <div className="date-column">
                        <span>{date.month}</span>
                        <span>{date.day}</span>
                        <span>{date.weekday}</span>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </thead>
              <tbody>
                {employees.map((employee) => (
                  <TableRow key={employee.id} onClick={() => handleRowClick(employee)}>
                    <TableCell className="border-r border-gray-300 table-cell-center text-xs">{employee.id}</TableCell>
                    <TableCell className="border-r border-gray-300 text-xs">{employee.name}</TableCell>
                    <TableCell className="border-r border-gray-300 text-xs">{employee.department}</TableCell>
                    <TableCell className="text-center border-r border-gray-300">{employee.p_twd}</TableCell>
                    {employee.attendance.map((status, index) => (
                      <TableCell key={index} className="text-center border-r border-gray-300 p-0">
                        <span
                          className={cn(
                            "w-7 h-7 rounded text-sm flex items-center justify-center glassmorphism",
                            status === "P" && "present-status",
                            status === "A" && "absent-status",
                            status === "WK" && "weekoff-status",
                            status === "CL" && "casual-leave-status",
                            !status && "border border-gray-300"
                          )}
                        >
                          {status}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default Attendance;
