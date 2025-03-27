import { useEffect, useState } from "react";
import Link from "next/link";
import { FaBuilding, FaCog, FaUserCircle } from "react-icons/fa"; // Import the icons
import { Search, UserPlus, Trash, Edit, Grid2x2 } from "lucide-react";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";

export default function SuperadminHeaders() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Update activeTab based on the current route
    useEffect(() => {
        const path = router.pathname.split("/").pop(); // Get the last part of the route
        setActiveTab(path.charAt(0).toUpperCase() + path.slice(1)); // Capitalize first letter
      }, [router.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-10 py-4 flex justify-between items-start z-50 border-b border-gray-300">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">
          MEDHIR
        </h1>
        <nav className="flex flex-grow justify-center space-x-20 text-lg font-medium">
          {["Companies", "Modules", "Settings"].map((item, index) => (
            <Link
              key={index}
              href={`/superadmin/${item.toLowerCase()}`}
              passHref
            >
              <button
                onClick={() => setActiveTab(item)}
                className={`hover:text-[#4876D6] ${
                  activeTab === item
                    ? "text-black bg-[#E3ECFB] rounded-md px-2 py-1"
                    : "text-[#333333]"
                }`}
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {item === "Companies" && (
                  <FaBuilding
                    className="inline-block text-black opacity-80"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                  />
                )}
                {item === "Modules" && (
                  <Grid2x2
                    className="inline-block w-5 h-5 text-gray-800"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                  />
                )}
                {item === "Settings" && (
                  <FaCog
                    className="inline-block text-black opacity-80"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                  />
                )}
                {item === "Users" && (
                  <FaUserCircle
                    className="inline-block text-black opacity-80"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                )}
                {item}
                </button>
            </Link>
            ))}
        </nav>

        <div className="relative">
            <button
                className="flex items-center gap-2 text-black font-medium"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
                <FaUserCircle className="text-2xl" />
                Super Admin
            </button>
            {isDropdownOpen && (
                <div className="absolute top-14 right-0 w-40 bg-white shadow-md rounded-md py-2">
                <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                >
                    Logout
                </button>
                </div>
            )}
        </div>
        </header>
    );
}
