import React, { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";
import { FaUser, FaCalendar, FaClock, FaCreditCard, FaUserCircle, FaChartPie, FaTasks, FaUsers, FaCalendarCheck, FaMoneyCheckAlt, FaCog } from "react-icons/fa";
import Link from "next/link";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28BFE", "#82CA9D"];

const Overview = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState("Overview");
  const [activeIndex, setActiveIndex] = useState(null);

  const data = [
    { name: "Mon", present: 80, absent: 10, leave: 5 },
    { name: "Tue", present: 85, absent: 8, leave: 4 },
    { name: "Wed", present: 82, absent: 12, leave: 3 },
    { name: "Thu", present: 84, absent: 9, leave: 5 },
    { name: "Fri", present: 78, absent: 15, leave: 6 },
  ];

  const departmentData = [
    { name: "Engineering", value: 25 },
    { name: "Sales", value: 18 },
    { name: "Marketing", value: 12 },
    { name: "HR", value: 8 },
    { name: "Finance", value: 10 },
    { name: "Product", value: 15 },
  ];

  const overviewData = [
    { icon: <FaUser className="h-6 w-6 text-blue-500" />, label: "Total Employees", count: 88 },
    { icon: <FaCalendar className="h-6 w-6 text-green-500" />, label: "Present Today", count: 72 },
    { icon: <FaClock className="h-6 w-6 text-yellow-500" />, label: "Pending Tasks", count: 12 },
    { icon: <FaCreditCard className="h-6 w-6 text-purple-500" />, label: "Payroll Status", count: "Processed" },
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md px-10 py-4 flex justify-between items-start z-50 border-b border-gray-300">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-20 text-lg font-medium">
          {["Overview", "My Task", "Employees", "Attendance", "Payroll", "Settings"].map((item, index) => (
            <Link key={index} href={`/hradmin/${item.toLowerCase().replace(" ", "")}`} passHref>
              <button
                onClick={() => setActivePage(item)}
                className={`hover:text-[#4876D6] ${
                  activePage === item ? "text-black bg-[#E3ECFB] rounded-md px-2 py-1" : "text-[#6c757d]"
                }`}
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {item === "Overview" && <FaChartPie className="inline-block text-black opacity-80" />}
                {item === "My Task" && <FaTasks className="inline-block text-black opacity-80" />}
                {item === "Employees" && <FaUsers className="inline-block text-black opacity-80" />}
                {item === "Attendance" && <FaCalendarCheck className="inline-block text-black opacity-80" />}
                {item === "Payroll" && <FaMoneyCheckAlt className="inline-block text-black opacity-80" />}
                {item === "Settings" && <FaCog className="inline-block text-black opacity-80" />}
                {item}
              </button>
            </Link>
          ))}
        </nav>
        <div className="relative">
          <button className="flex items-center gap-2 text-black font-medium" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <FaUserCircle className="text-2xl" />
            HR Admin
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-24 px-6">
        {/* Heading */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-left">Company Overview Dashboard</h1>


      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
  {overviewData.map((item, index) => (
    item.label === "Pending Tasks" ? (
      <Link key={index} href="/hradmin/mytask">
        <div
          className="p-3 bg-white shadow-md rounded-lg flex justify-between items-center cursor-pointer hover:shadow-lg transition-shadow"
          style={{ height: "100px" }}
        >
          <div className="flex flex-col justify-center">
            <p className="text-gray-600 text-sm">{item.label}</p>
            <p className="text-xl font-bold text-gray-800">{item.count}</p>
          </div>
          <div
            className="p-2 rounded-full shadow-lg"
            style={{
              backgroundColor: item.icon.props.className.includes("text-yellow-500")
                ? "#FFBB2833"
                : "#A28BFE33",
            }}
          >
            <div className="text-2xl">{item.icon}</div>
          </div>
        </div>
      </Link>
    ) : (
      <div
        key={index}
        className="p-3 bg-white shadow-md rounded-lg flex justify-between items-center"
        style={{ height: "100px" }}
      >
        <div className="flex flex-col justify-center">
          <p className="text-gray-600 text-sm">{item.label}</p>
          <p className="text-xl font-bold text-gray-800">{item.count}</p>
        </div>
        <div
          className="p-2 rounded-full shadow-lg"
          style={{
            backgroundColor: item.icon.props.className.includes("text-blue-500")
              ? "#0088FE33"
              : item.icon.props.className.includes("text-green-500")
              ? "#00C49F33"
              : item.icon.props.className.includes("text-yellow-500")
              ? "#FFBB2833"
              : "#A28BFE33",
          }}
        >
          <div className="text-2xl">{item.icon}</div>
        </div>
      </div>
    )
  ))}
</div>


        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Attendance Chart */}
          <div className="bg-white p-6 shadow-md rounded-lg hover:shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-shadow duration-300">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Weekly Attendance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 14, fill: "#374151", fontWeight: "bold" }} tickLine={false} axisLine={false} />
                <YAxis stroke="#d1d5db" tick={{ fontSize: 14, fill: "#374151", fontWeight: "bold" }} tickFormatter={(value) => `${value}%`} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    width: "200px",
                    padding: "10px",
                  }}
                  labelStyle={{
                    color: "#000000",
                    fontSize: "14px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                  itemStyle={{
                    color: "#374151",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  formatter={(value, name) => {
                    if (value !== undefined) {
                      return [
                        <span className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                name === "present"
                                  ? "rgb(74, 222, 128)"
                                  : name === "absent"
                                  ? "rgb(248, 113, 113)"
                                  : "#FFBB28",
                            }}
                          ></span>
                          <span className="text-gray-600">{name.charAt(0).toUpperCase() + name.slice(1)}</span>
                        </span>,
                        <span className="font-bold">{value}%</span>,
                      ];
                    }
                    return null;
                  }}
                />
                <Bar dataKey="present" fill="rgb(74, 222, 128)" barSize={40} radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="rgb(248, 113, 113)" barSize={40} radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" fill="#FFBB28" barSize={40} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Department Distribution</h2>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="35%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={(data, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
          
  <Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  wrapperStyle={{ paddingLeft: "20px" }}
  content={() => (
    <div>
      {departmentData.map((entry, index) => (
        <div
          key={index}
          className="flex items-center mb-3" // Added spacing between lines
        >
          <span
            className="w-3 h-3 rounded-full mr-2"
            style={{
              backgroundColor: COLORS[index % COLORS.length], // Use COLORS array for the color
            }}
          ></span>
          <span
            style={{
              fontWeight: activeIndex === index ? "bold" : "normal",
              color: "#4B5563", // Lighter black for text
            }}
          >
            {`${entry.name}: ${entry.value} employees`}
          </span>
        </div>
      ))}
    </div>
  )}
/>         <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;