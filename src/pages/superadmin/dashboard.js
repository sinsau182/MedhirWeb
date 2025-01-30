import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Users, Settings, Building } from "lucide-react";
import { useRouter } from "next/router";

export default function SuperadminDashboard() {
  const [selectedNav, setSelectedNav] = useState("Dashboard");
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Employees", path: "/superadmin/employee" },
    { name: "Departments", path: "/superadmin/departments" },
    { name: "Settings", path: "/settings" },
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
          {/* Dashboard Overview */}
          {selectedNav === "Dashboard" && (
            <section className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Total Employees */}
              <div className="bg-[#112240] p-6 rounded-lg border border-gray-500 flex flex-col items-center">
                <p className="text-gray-300">Total Employees</p>
                <h3 className="text-3xl font-bold">9</h3>
              </div>

              {/* Total Departments */}
              <div className="bg-[#112240] p-6 rounded-lg border border-gray-500 flex flex-col items-center">
                <p className="text-gray-300">Total Departments</p>
                <h3 className="text-3xl font-bold">3</h3>
              </div>

              {/* Budget */}
              <div className="bg-[#112240] p-6 rounded-lg border border-gray-500 flex flex-col items-center">
                <p className="text-gray-300">Budget</p>
                <h3 className="text-3xl font-bold">$</h3>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
