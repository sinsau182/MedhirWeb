import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import cn from "classnames";

// Generate date array dynamically
const getDatesForMonth = () => {
  const today = new Date();
  const dates = eachDayOfInterval({
    start: startOfMonth(today),
    end: endOfMonth(today),
  }).map((date) => ({
    month: format(date, "MMM"),
    day: format(date, "dd"),
    weekday: format(date, "EEE"),
  }));
  return dates;
};

export default function Attendance() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [activePage, setActivePage] = useState("attendance");
  const [employees, setEmployees] = useState([]);
  const router = useRouter();
  const dates = getDatesForMonth();

  const handleRowClick = (attendance) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { attendance: JSON.stringify(attendance) },
    });
  };

  useEffect(() => {
    fetch("http://localhost:5000/attendance")
      .then((response) => response.json())
      .then((data) => setAttendanceData(data))
      .catch((error) =>
        console.error("Error fetching attendance data:", error)
      );
  }, []);

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
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

        <div className="h-5" />

        {/* Attendance Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border-r border-gray-300">Employee ID</TableHead>
              <TableHead className="border-r border-gray-300">Name</TableHead>
              <TableHead className="border-r border-gray-300">Department</TableHead>
              <TableHead className="border-r border-gray-300">P / T.W.D.</TableHead>
              {dates.map((date, index) => (
                <TableHead key={index} className="text-center border-r border-gray-300 text-xs">
                  <div className="flex flex-col items-center">
                    <span>{date.month}</span>
                    <span>{date.day}</span>
                    <span>{date.weekday}</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {attendanceData.map((employee) => (
              <TableRow key={employee.id} className="border-b border-gray-300">
                <TableCell className="border-r border-gray-300">{employee.id}</TableCell>
                <TableCell className="border-r border-gray-300">{employee.name}</TableCell>
                <TableCell className="border-r border-gray-300">{employee.department}</TableCell>
                <TableCell className="border-r border-gray-300 text-center">{employee.p_twd}</TableCell>
                {dates.map((_, index) => (
                  <TableCell key={index} className="border-r border-gray-300 p-1 text-center">
                    {employee.attendance[index] ? (
                      <span
                        className={cn(
                          "w-7 h-7 rounded text-sm flex items-center justify-center",
                          employee.attendance[index] === "P" && "present-status",
                          employee.attendance[index] === "A" && "absent-status",
                          employee.attendance[index] === "WK" && "weekoff-status",
                          employee.attendance[index] === "CL" && "casual-leave-status",
                          employee.attendance[index] === "SL" && "half-day-status"
                        )}
                      >
                        {employee.attendance[index]}
                      </span>
                    ) : (
                      <span className="border border-gray-300 w-7 h-7 flex items-center justify-center"></span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

