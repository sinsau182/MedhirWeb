import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import LeaveCalendar from "@/components/Calendar";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChevronDownIcon } from "@heroicons/react/outline";
import Link from "next/link"; // Import Link for routing

export default function SuperadminDashboard() {
  const [leaves, setLeaves] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedNav, setSelectedNav] = useState("Employees");

  useEffect(() => {
    fetch("/api/leave")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLeaves(data);
        } else {
          setLeaves([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching leaves:", error);
        setLeaves([]);
      });
  }, []);

  const events = leaves.map((leave) => ({
    title: leave?.employeeId?.name || "Unknown",
    start: leave?.startDate ? new Date(leave.startDate) : new Date(),
    end: leave?.endDate ? new Date(leave.endDate) : new Date(),
  }));

  const handleDropdownToggle = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <div className="p-8 bg-[#0A192F] text-white min-h-screen">
      <header className="flex justify-between items-center pb-6">
        <h1 className="text-3xl font-bold">Welcome, SuperAdmin</h1>
        <Button className="bg-[#DC3545] hover:bg-red-500">Logout</Button>
      </header>

      <nav className="flex justify-center bg-[#1F1F1F] p-3 rounded-full border border-gray-600 mb-6 w-fit mx-auto">
  {["Dashboard", "Employees", "Departments", "Settings"].map((item) => (
    <Link key={item} href={`/superadmin/${item.toLowerCase()}`}> {/* Add dynamic routing */}
      <Button
        variant="ghost"
        className={`text-white ${selectedNav === item ? "text-lg font-bold" : ""}`}
        onClick={() => setSelectedNav(item)}
      >
        {item}
      </Button>
    </Link>
  ))}
</nav>




      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by Employee ID"
          className="p-2 bg-gray-700 text-white rounded-md w-1/8"
        />
        <h2 className="text-2xl font-semibold text-left flex-grow ml-12">Manage Employees</h2>
        <Button className="bg-[#4169E1] hover:bg-blue-500">Add New Employee</Button>
      </div>

      <div className="bg-[#112D4E] p-6 rounded-lg">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-[#162447]">
              <th className="p-3 border border-gray-600">S No</th>
              <th className="p-3 border border-gray-600">Image</th>
              <th className="p-3 border border-gray-600">Name</th>
              <th className="p-3 border border-gray-600">DOB</th>
              <th className="p-3 border border-gray-600">Department</th>
              <th className="p-3 border border-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((id, index) => (
              <tr key={id} className={`text-center border border-gray-700 ${index % 2 === 0 ? "bg-[#1B1B2F]" : "bg-[#162447]"}`}>
                <td className="p-3 border border-gray-600">{id}</td>
                <td className="p-3 border border-gray-600">
                  <div className="w-10 h-10 bg-gray-500 rounded-full mx-auto"></div>
                </td>
                <td className="p-3 border border-gray-600">Employee {id}</td>
                <td className="p-3 border border-gray-600">MM/DD/YYYY</td>
                <td className="p-3 border border-gray-600">IT</td>
                <td className="p-3 border border-gray-600 flex justify-center gap-2 relative">
                  <Button className="bg-[#007BFF] hover:bg-blue-500">View</Button>
                  <Button className="bg-[#FFA500] hover:bg-yellow-500">Edit</Button>
                  
                  <div className="relative">
                    <Button
                      className="bg-[#28A745] hover:bg-green-500 flex items-center gap-2"
                      onClick={() => handleDropdownToggle(id)}
                    >
                      Assign Designation
                      <ChevronDownIcon className="w-4 h-4" />
                    </Button>
                    {openDropdown === id && (
                      <div className="absolute left-0 mt-2 w-48 bg-gray-800 text-white rounded-lg shadow-lg z-10">
                        <Button className="w-full text-left px-4 py-2 hover:bg-gray-700">HR</Button>
                        <Button className="w-full text-left px-4 py-2 hover:bg-gray-700">Admin</Button>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
