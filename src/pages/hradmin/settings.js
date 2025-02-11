import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";

export default function HradminCompanies() {
  const [activePage, setActivePage] = useState("attendance");
  const [employees, setEmployees] = useState([]);
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

  const mainTabs = [];

  const handleTabClick = (tab) => {
    setActiveTab(tab.value);
  };

  const navigateToEmployees = () => {
    router.push("/hradmin/employees");
  };

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
      {/* Rest of your component code */}
    </div>
  );
};

