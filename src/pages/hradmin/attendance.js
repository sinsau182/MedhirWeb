import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Edit,
  Search,
  UserPlus,
  PersonStanding,
  CheckCircle,
  XCircle,
  CalendarCheck,
  HeartPulse,
  Plane,
  Stethoscope,
  Umbrella,
  Briefcase,
  Activity,
  Palmtree,
  UmbrellaOff,
  UmbrellaIcon,
  BedDouble,
  Sofa,
  Syringe,
} from "lucide-react";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import cn from "classnames";
import withAuth from "@/components/withAuth";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
} from "react-icons/fa";
import Link from "next/link";

function Attendance() {
  const [activePage, setActivePage] = useState("Attendance");
  const [activeTab, setActiveTab] = useState("Attendance Tracker");
  const [employees, setEmployees] = useState([]);
  const [dates, setDates] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });
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

  useEffect(() => {
    fetch("http://192.168.0.200:5001/attendance")
      .then((response) => response.json())
      .then((data) => setEmployees(data))
      .catch((error) =>
        console.error("Error fetching attendance data:", error)
      );
  }, []);

  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md px-10 py-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex justify-between items-start z-50">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">
          MEDHIR
        </h1>
        <nav className="flex flex-grow justify-center space-x-20 text-xl font-medium">
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
            <div className="relative w-96 ml-0">
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
          {["Attendance Tracker", "Leave Tracker", "Basic", "ID Proofs"].map(
            (tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(tab)}
                className={`ml-10 mr-10 hover:text-black ${
                  activeTab === tab
                    ? "text-gray-800 font-bold"
                    : "text-gray-600 font-medium"
                }`}
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>
      {activeTab === "Attendance Tracker" && (
        <div className="overflow-container max-h-[calc(100vh-300px)]">
          <div className="flex justify-between items-center">
            <table className="min-w-full table-auto border-collapse border border-gray-300">
              <thead className="sticky top-0 bg-white z-10 border-gray-400 before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-gray-400 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gray-400">
                <TableRow>
                  <TableHead className="border-r border-l border-l-gray-600 border-r-gray-600 table-head-start text-xs text-gray-800">
                    Employee ID
                  </TableHead>
                  <TableHead className="border-r border-gray-600 table-head-start text-xs text-gray-800">
                    Name
                  </TableHead>
                  <TableHead className="border-r border-gray-600 table-head-start text-xs text-gray-800">
                    Department
                  </TableHead>
                  <TableHead className="border-r border-gray-600 table-head-start text-xs text-gray-800">
                    P / T.W.D
                  </TableHead>
                  {dates.map((date, index) => (
                    <TableHead
                      key={index}
                      className={cn(
                        "text-center border-r border-gray-600 text-xs table-head-center text-gray-800",
                        date.day === "18" &&
                          date.month === "Jan" &&
                          "current-day-column"
                      )}
                    >
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
                {filteredEmployees.map((employee) => (
                  <TableRow
                    key={employee.id}
                    className="even:bg-gray-100 odd:bg-white"
                  >
                    <TableCell className="border-r border-gray-300 table-cell-center text-xs">
                      {employee.id}
                    </TableCell>
                    <TableCell className="border-r border-gray-300 text-xs">
                      {employee.name}
                    </TableCell>
                    <TableCell className="border-r border-gray-300 text-xs">
                      {employee.department}
                    </TableCell>
                    <TableCell className="text-center border-r border-gray-300 text-xs">
                      {employee.p_twd}
                    </TableCell>
                    {employee.attendance.map((status, index) => (
                      <TableCell
                        key={index}
                        className="text-center border-r border-gray-300 p-0 pl-1 justify-center items-center"
                      >
                        <span
                          className={cn(
                            "w-8 h-7 rounded text-sm flex justify-center items-center",
                            status === "P" && "present-status",
                            status === "A" && "absent-status",
                            status === "WK" && "weekoff-status",
                            status === "CL" && "casual-leave-status",
                            status !== "" && "glassmorphism",
                            status === " " && "border border-gray-300"
                          )}
                        >
                          {status === "P" ? (
                            <CheckCircle className="text-green-500" size={16} />
                          ) : status === "A" ? (
                            <XCircle className="text-red-500" size={16} />
                          ) : status === "WK" ? (
                            <CalendarCheck
                              className="text-gray-400"
                              size={16}
                            />
                          ) : status === "SL" ? (
                            <Syringe className="text-blue-800" size={16} />
                          ) : status === "CL" ? (
                            <Sofa className="text-purple-800" size={16} />
                          ) : (
                            status
                          )}
                        </span>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === "Leave Tracker" && (
        <div className="border border-gray-300 rounded-lg shadow-md">
          {/* Scrollable Container */}
          <div className="max-h-[430px] overflow-y-auto">
            <table className="w-full border-collapse">
              {/* Sticky Header */}
              <thead className="bg-gray-300 text-gray-800 font-bold sticky top-0 z-10">
                <tr>
                  {[
                    "Employee ID",
                    "Name",
                    "Department",
                    "No. of Payable Days",
                    "Leaves Taken",
                    "Leaves Earned",
                    "Carried Forward Leaves",
                    "Net Leaves",
                  ].map((heading, index) => (
                    <th
                      className="text-center p-2 font-bold text-sm"
                      key={index}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className={cn(
                      "text-sm",
                      index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    )}
                  >
                    <td className="text-left p-2">{employee.id}</td>
                    <td className="text-left p-2">{employee.name}</td>
                    <td className="text-left p-2">{employee.department}</td>
                    <td className="text-center p-2">25</td>
                    <td className="text-center p-2">2</td>
                    <td className="text-center p-2">1</td>
                    <td className="text-center p-2">3</td>
                    <td className="text-center p-2">4</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(Attendance);
