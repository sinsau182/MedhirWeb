import { User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API requests
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import RoleToggle from "./ui/roletoggle";
import { useDispatch, useSelector } from "react-redux";
import {
  getItemFromSessionStorage,
  removeItem,
} from "@/redux/slices/sessionStorageSlice";
import { toast } from "sonner";
import getConfig from "next/config";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const { items } = useSelector((state) => state.sessionStorage);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(""); // Default selected company
  const [navbarColor, setNavbarColor] = useState("bg-[#A8D5BA]"); // Default color
  const [currentRole, setCurrentRole] = useState("");
  const { publicRuntimeConfig } = getConfig();

  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    const storedColor = localStorage.getItem("selectedCompanyColor");

    if (storedCompany) {
      setSelectedCompany(storedCompany);
    }

    if (storedColor) {
      let backgroundColor;
      switch (storedColor) {
        case "#FFDAB9":
          backgroundColor = "bg-[#FFDAB9]";
          break;
        case "#B0E0E6":
          backgroundColor = "bg-[#B0E0E6]";
          break;
        case "#F0E68C":
          backgroundColor = "bg-[#F0E68C]";
          break;
        case "#E6E6FA":
          backgroundColor = "bg-[#E6E6FA]";
          break;
        case "#D1D5DB":
          backgroundColor = "bg-[#D1D5DB]";
          break;
        default:
          backgroundColor = "bg-[#D1D5DB]";
      }

      setNavbarColor(backgroundColor);
    }
  }, [navbarColor, companies]);

  useEffect(() => {
    const role = sessionStorage.getItem("currentRole");
    setCurrentRole(role);
  }, []);

  const handleLogout = () => {
    dispatch(removeItem({ key: "token" }));
    // dispatch(removeItem({ key: 'user' }));
    dispatch(removeItem({ key: "currentRole" }));
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/employee/profile");
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/hradmin/companies/MED102`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setCompanies(response.data); // Store the full company objects
          if (
            !response.data.some(
              (company) => company.companyName === selectedCompany
            )
          ) {
            setSelectedCompany(response.data[0].companyName); // Set default company if current selection is not in the list
          }
        }
      } catch (error) {
        toast.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, [selectedCompany]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "selectedCompany" && event.newValue) {
        setSelectedCompany(event.newValue);

        // Retrieve the color code from localStorage
        const colorCode = localStorage.getItem("selectedCompanyColor");
        if (colorCode) {
          setNavbarColor(colorCode); // Update navbar color
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [companies]);

  const handleCompanyChange = (companyName) => {
    const currentSelectedCompany = localStorage.getItem("selectedCompany");

    if (companyName !== currentSelectedCompany) {
      setSelectedCompany(companyName);

      // Find the selected company object
      const selectedCompanyData = companies.find(
        (company) => company.companyName === companyName
      );

      if (selectedCompanyData) {

        // Store selected company name and color code in localStorage
        localStorage.setItem("selectedCompany", companyName);
        localStorage.setItem("selectedCompanyColor", selectedCompanyData.colorCode);
        localStorage.setItem("selectedCompanyId", selectedCompanyData.companyId);

        window.location.reload();

        // Set navbar color directly from the selected company's colorCode
        setNavbarColor(selectedCompanyData.colorCode);
      }
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 ${navbarColor}`}>

      <nav className="flex justify-between items-center p-3 shadow-md w-full">
        {/* Logo and Role Badges */}
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <div className="relative w-8 h-8 mr-2">
              <div className="absolute w-2 h-6 bg-black transform -skew-x-12 left-0"></div>
              <div className="absolute w-2 h-6 bg-black transform skew-x-12 right-0"></div>
              <div className="absolute w-2 h-6 bg-black left-1/2 transform -translate-x-1/2"></div>
            </div>
            <span className="text-2xl font-bold text-black tracking-wide">
              MEDHIR
            </span>
          </div>
          <RoleToggle />
        </div>

        {/* Right Section: Profile */}
        <div className="flex items-center gap-6 relative">
          {/* Company Dropdown */}
          {currentRole === "hr" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 px-6 flex items-center justify-between rounded-full border border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 bg-white hover:bg-gray-100"
                >
                  <span className="text-sm font-semibold text-gray-700">
                    {selectedCompany}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start" forceMount>
                {companies.map((company) => (
                  <DropdownMenuItem
                    key={company.companyId}
                    onClick={() => handleCompanyChange(company.companyName)}
                    className={`cursor-pointer ${
                      company.companyName === selectedCompany
                        ? "font-semibold text-violet-600"
                        : ""
                    }`}
                  >
                    {company.companyName}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatar.jpg" alt={userInfo.name} />
                  <AvatarFallback>
                    {userInfo.name
                      ? userInfo.name.substring(0, 2).toUpperCase()
                      : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    doejohn@gmail.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleProfileClick}
                className="cursor-pointer text-violet-600 hover:text-violet-700"
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive cursor-pointer"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
