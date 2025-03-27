import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import withAuth from "@/components/withAuth";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
} from "react-icons/fa";
import Link from "next/link";

function HradminSettings() {
  const [activePage, setActivePage] = useState("Settings");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
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
    </div>
  );
}

export default withAuth(HradminSettings);
