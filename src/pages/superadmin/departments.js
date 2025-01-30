import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Users, Settings, Building } from "lucide-react";
import { useRouter } from "next/router";

export default function SuperadminDashboard() {
  const [selectedNav, setSelectedNav] = useState("Departments");
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", path: "/superadmin/dashboard" },
    { name: "Employees", path: "/superadmin/employee" },
    { name: "Departments", path: "/superadmin/departments" },
    { name: "Settings", path: "/settings" },
  ];

  const departments = [
    { id: 1, name: "IT" },
    { id: 2, name: "Database" },
    { id: 3, name: "Logistic" },
  ];

  return (
    <div className="p-8 bg-[#0A192F] text-white min-h-screen">
      {/* Header */}
      <header className="flex justify-between items-center pb-6">
        <h1 className="text-3xl font-bold">Welcome, SuperAdmin</h1>
        <Button className="bg-[#DC3545] hover:bg-red-500 px-6 py-2 rounded-lg">Logout</Button>
      </header>

      {/* Styled Navbar */}
      <nav className="flex justify-center bg-[#1F1F1F] p-3 rounded-full border border-gray-600 mb-6 w-fit mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.name}
            variant="ghost"
            className={`text-white ${selectedNav === item.name ? "text-lg font-bold" : ""}`}
            onClick={() => {
              setSelectedNav(item.name);
              router.push(item.path);
            }}
          >
            {item.name}
          </Button>
        ))}
      </nav>

      <div className="flex min-h-screen">
        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Departments Section */}
          {selectedNav === "Departments" && (
            <section className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  placeholder="Search By Department"
                  className="bg-[#112240] p-2 rounded-lg border border-gray-500"
                />
                <Button className="bg-[#28A745] hover:bg-green-600 px-6 py-2 rounded-lg">
                  Add New Department
                </Button>
              </div>

              <table className="w-full bg-[#112240] rounded-lg border border-gray-500">
                <thead>
                  <tr className="border-b border-gray-500">
                    <th className="p-4 text-left">S No</th>
                    <th className="p-4 text-left">Department</th>
                    <th className="p-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, index) => (
                    <tr key={dept.id} className="border-b border-gray-500">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4">{dept.name}</td>
                      <td className="p-4">
                        <Button className="bg-[#FFC107] hover:bg-yellow-500 px-4 py-2 rounded-lg mr-2">
                          Edit
                        </Button>
                        <Button className="bg-[#DC3545] hover:bg-red-500 px-4 py-2 rounded-lg">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </section>
          )}
        </main>
      </div>
    </div>
  );
}