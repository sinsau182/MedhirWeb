import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";

export default function HradminCompanies() {
    const [activePage, setActivePage] = useState("attendance");
  const [employees, setEmployees] = useState([]);   
  const router = useRouter();


  const handleRowClick = (attendance) => {
    router.push({
      pathname: "/hradmin/addNewEmployee",
      query: { attendance: JSON.stringify(attendance) },
    });
  };

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  const mainTabs = [];

  const handleTabClick = (tab) => {
    setActiveTab(tab.value);
  };

  const navigateToEmployees = () => {
    router.push("/hradmin/employees");
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
          {mainTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab)}
              className={`ml-10 mr-10 hover:text-blue-600 ${
                activeTab === tab.value ? "text-blue-600 font-bold" : "text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
