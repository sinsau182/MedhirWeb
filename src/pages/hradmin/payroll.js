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
import {
  Edit,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import withAuth from "@/components/withAuth";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
} from "react-icons/fa";
import Link from "next/link";

function HradminPayroll() {
  const [activePage, setActivePage] = useState("Payroll");
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("Salary Statement");
  const [selectedMonth, setSelectedMonth] = useState("January");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-10 py-4 flex justify-between items-start z-50">
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
          <div className="flex items-center space-x-8">
            <button
              className="flex items-left text-gray-400 cursor-not-allowed"
              disabled
            >
              <Edit className="mr-2" size={20} />
              Edit
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMonthPicker(!showMonthPicker)}
                className="flex items-center space-x-2 bg-gray-100 border border-gray-300 text-black p-2 rounded-md"
              >
                <Calendar
                  size={24}
                  className="text-gray-500 absolute left-2 top-1/2 transform -translate-y-1/2"
                />
                <span className="pl-8">
                  {selectedMonth} {selectedYear}
                </span>
              </button>
              {showMonthPicker && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-300 shadow-md rounded-lg p-2 z-10">
                  <div className="flex justify-between items-center p-2 border-b">
                    <button onClick={() => setSelectedYear(selectedYear - 1)}>
                      <ChevronLeft size={20} />
                    </button>
                    <span className="font-bold">{selectedYear}</span>
                    <button onClick={() => setSelectedYear(selectedYear + 1)}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-2">
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
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sub Navbar */}
        <div className="p-3 rounded-lg mt-4 flex justify-between text-lg mx-auto bg-gray-50 border border-gray-200">
          {[
            "Salary Statement",
            "Advance",
            "Reimbursement",
            "Payment History",
          ].map((tab, index) => (
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
          ))}
        </div>

        <div className="mt-6 overflow-y-auto max-h-[calc(100vh-200px)]">
          {activeTab === "Salary Statement" && (
            <div className="border border-gray-300 rounded-lg shadow-md">
              {/* Scrollable Container */}
              <div className="max-h-[440px] overflow-y-auto">
                <table className="w-full border-collapse">
                  {/* Sticky Header */}
                  <thead className="bg-gray-300 text-gray-800 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-2 font-bold text-sm">Name</th>
                      <th className="text-center p-2 font-bold text-sm">
                        Paid Days
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Monthly CTC
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        This Month Salary
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Basic
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Deductions
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Taxes
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Professional Tax
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Reimbursement
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Advance Taken
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Net Pay
                      </th>
                    </tr>
                  </thead>

                  {/* Scrollable Body */}
                  <tbody>
                    <tr>
                      <td className="text-left p-2">John Doe</td>
                      <td className="text-center p-2">20</td>
                      <td className="text-center p-2">₹5000</td>
                      <td className="text-center p-2">₹4500</td>
                      <td className="text-center p-2">₹3000</td>
                      <td className="text-center p-2">₹500</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹3500</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Jane Smith</td>
                      <td className="text-center p-2">22</td>
                      <td className="text-center p-2">₹6000</td>
                      <td className="text-center p-2">₹5500</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹600</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹500</td>
                      <td className="text-center p-2">₹4500</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">18</td>
                      <td className="text-center p-2">₹4000</td>
                      <td className="text-center p-2">₹3500</td>
                      <td className="text-center p-2">₹2500</td>
                      <td className="text-center p-2">₹400</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹100</td>
                      <td className="text-center p-2">₹300</td>
                      <td className="text-center p-2">₹200</td>
                      <td className="text-center p-2">₹3300</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "Advance" && (
            <div className="border border-gray-300 rounded-lg shadow-md">
              {/* Scrollable Container */}
              <div className="max-h-[440px] overflow-y-auto">
                <table className="w-full border-collapse">
                  {/* Sticky Header */}
                  <thead className="bg-gray-300 text-gray-800 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-2 font-bold text-sm">Name</th>
                      <th className="text-center p-2 font-bold text-sm">
                        Department
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Old Advance
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        This Month Advance
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Deduct in this month
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Balance for next month
                      </th>
                    </tr>
                  </thead>

                  {/* Scrollable Body */}
                  <tbody>
                    <tr>
                      <td className="text-left p-2">John Doe</td>
                      <td className="text-center p-2">Sales</td>
                      <td className="text-center p-2">₹10000</td>
                      <td className="text-center p-2">₹2000</td>
                      <td className="text-center p-2">₹1500</td>
                      <td className="text-center p-2">₹500</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Jane Smith</td>
                      <td className="text-center p-2">Marketing</td>
                      <td className="text-center p-2">₹8000</td>
                      <td className="text-center p-2">₹1000</td>
                      <td className="text-center p-2">₹500</td>
                      <td className="text-center p-2">₹500</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">HR</td>
                      <td className="text-center p-2">₹5000</td>
                      <td className="text-center p-2">₹1500</td>
                      <td className="text-center p-2">₹1000</td>
                      <td className="text-center p-2">₹500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Reimbursement" && (
            <div className="border border-gray-300 rounded-lg shadow-md">
              {/* Scrollable Container */}
              <div className="max-h-[440px] overflow-y-auto">
                <table className="w-full border-collapse">
                  {/* Sticky Header */}
                  <thead className="bg-gray-300 text-gray-800 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-2 font-bold text-sm">Name</th>
                      <th className="text-center p-2 font-bold text-sm">
                        Department
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Reimbursement Amount
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>

                  {/* Scrollable Body */}
                  <tbody>
                    <tr>
                      <td className="text-left p-2">John Doe</td>
                      <td className="text-center p-2">Sales</td>
                      <td className="text-center p-2">₹5000</td>
                      <td className="text-center p-2">Approved</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Jane Smith</td>
                      <td className="text-center p-2">Marketing</td>
                      <td className="text-center p-2">₹3000</td>
                      <td className="text-center p-2">Pending</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">HR</td>
                      <td className="text-center p-2">₹2000</td>
                      <td className="text-center p-2">Approved</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "Payment History" && (
            <div className="border border-gray-300 rounded-lg shadow-md">
              {/* Scrollable Container */}
              <div className="max-h-[440px] overflow-y-auto">
                <table className="w-full border-collapse">
                  {/* Sticky Header */}
                  <thead className="bg-gray-300 text-gray-800 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="text-left p-2 font-bold text-sm">Name</th>
                      <th className="text-center p-2 font-bold text-sm">
                        Department
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Payment Date
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Amount
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Payment Mode
                      </th>
                      <th className="text-center p-2 font-bold text-sm">
                        Status
                      </th>
                    </tr>
                  </thead>

                  {/* Scrollable Body */}
                  <tbody>
                    <tr>
                      <td className="text-left p-2">John Doe</td>
                      <td className="text-center p-2">Sales</td>
                      <td className="text-center p-2">12/09/2021</td>
                      <td className="text-center p-2">₹5000</td>
                      <td className="text-center p-2">Bank Transfer</td>
                      <td className="text-center p-2">Paid</td>
                    </tr>
                    <tr className="even:bg-gray-100">
                      <td className="text-left p-2">Jane Smith</td>
                      <td className="text-center p-2">Marketing</td>
                      <td className="text-center p-2">15/09/2021</td>
                      <td className="text-center p-2">₹3000</td>
                      <td className="text-center p-2">Cash</td>
                      <td className="text-center p-2">Paid</td>
                    </tr>
                    <tr>
                      <td className="text-left p-2">Alice Johnson</td>
                      <td className="text-center p-2">HR</td>
                      <td className="text-center p-2">18/09/2021</td>
                      <td className="text-center p-2">₹2000</td>
                      <td className="text-center p-2">Bank Transfer</td>
                      <td className="text-center p-2">Paid</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(HradminPayroll);
