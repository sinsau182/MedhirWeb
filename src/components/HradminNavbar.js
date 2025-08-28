import { User, Settings } from "lucide-react";
import { useState, useEffect, useContext } from "react";
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
import { LogOut } from "lucide-react";
import { useRouter } from "next/router";
import RoleToggle from "./ui/roletoggle";
import { useDispatch, useSelector } from "react-redux";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { toast } from "sonner";
import getConfig from "next/config";
import { clearSession } from "@/utils/sessionManager";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./providers/AuthProvider";

const Navbar = () => {
  const router = useRouter();
  const { handleLogout } = useContext(AuthContext);
  const dispatch = useDispatch();
  const [employeeData, setEmployeeData] = useState(null);
  const { items } = useSelector((state) => state.sessionStorage);

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(""); // Default selected company
  const [navbarColor, setNavbarColor] = useState("bg-[#A8D5BA]"); // Default color
  const [currentRole, setCurrentRole] = useState("");
  const { publicRuntimeConfig } = getConfig();

  useEffect(() => {
    const storedCompany = sessionStorage.getItem("currentCompany");
    const storedColor = sessionStorage.getItem("currentCompanyColor");
    const lastSelectedCompany = localStorage.getItem("lastSelectedCompany");
    const lastSelectedCompanyId = localStorage.getItem("lastSelectedCompanyId");

    if (storedCompany) {
      setSelectedCompany(storedCompany);
    } else if (lastSelectedCompany) {
      // If no current company in session, use last selected from localStorage
      setSelectedCompany(lastSelectedCompany);
      sessionStorage.setItem("currentCompany", lastSelectedCompany);
      // sessionStorage.setItem("employeeCompanyId", lastSelectedCompanyId);
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

  // const handleLogout = () => {
  //   clearSession();
  //   router.push("/login");
  //   toast.success("Logged out successfully");
  // };

  const handleProfileClick = () => {
    router.push("/employee/profile");
  };

  const handleLogoClick = () => {
    const currentRole = sessionStorage.getItem("currentRole");
    
    // Navigate to appropriate dashboard based on role
    switch (currentRole) {
      case "HRADMIN":
        router.push("/hradmin/dashboard");
        break;
      case "MANAGER":
        router.push("/manager/dashboard");
        break;
      case "EMPLOYEE":
        router.push("/employee/dashboard");
        break;
      case "ACCOUNTANT":
        router.push("/account/customers");
        break;
      case "PROJECTMANAGER":
        router.push("/project_Manager/expense");
        break;
      case "SALES":
        router.push("/Sales/LeadManagement");
        break;
      case "SALESMANAGER":
        router.push("/SalesManager/dashboard");
        break;
      default:
        router.push("/employee/dashboard");
        break;
    }
  };

  useEffect(() => {
    const fetchEmployeeDataFromToken = () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        if (token) {
          const decodedToken = jwtDecode(token); // Decode the JWT token
          setEmployeeData(decodedToken);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };

    fetchEmployeeDataFromToken();
  }, [currentRole]);

  useEffect(() => {
    const currentRole = sessionStorage.getItem("currentRole");

    const handleStorageChange = (event) => {
      if (
        currentRole === "HRADMIN" &&
        event.key === "selectedCompany" &&
        event.newValue
      ) {
        setSelectedCompany(event.newValue);

        // Retrieve the color code from localStorage
        const colorCode = localStorage.getItem("selectedCompanyColor");
        if (colorCode) {
          setNavbarColor(colorCode); // Update navbar color
        }
      }
    };

    if (currentRole === "HRADMIN") {
      window.addEventListener("storage", handleStorageChange);
    }

    return () => {
      if (currentRole === "HRADMIN") {
        window.removeEventListener("storage", handleStorageChange);
      }
    };
  }, [companies]);

  const handleCompanyChange = (companyName) => {
    const currentRole = sessionStorage.getItem("currentRole");

    if (currentRole !== "HRADMIN") {
      return;
    }

    const currentSelectedCompany = sessionStorage.getItem("currentCompany");

    if (companyName !== currentSelectedCompany) {
      setSelectedCompany(companyName);

      // Find the selected company object
      const selectedCompanyData = companies.find(
        (company) => company.companyName === companyName
      );

      if (selectedCompanyData) {
        // Store current company in sessionStorage
        sessionStorage.setItem("currentCompany", companyName);
        sessionStorage.setItem("currentCompanyColor", selectedCompanyData.colorCode);
        // sessionStorage.setItem("employeeCompanyId", selectedCompanyData.companyId);

        // Store last selected company in localStorage
        localStorage.setItem("lastSelectedCompany", companyName);
        localStorage.setItem("lastSelectedCompanyColor", selectedCompanyData.colorCode);
        localStorage.setItem("lastSelectedCompanyId", selectedCompanyData.companyId);

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
          <div 
            className="cursor-pointer"
            onClick={handleLogoClick}
            title="Go to Dashboard"
          >
            <div className="flex flex-col">
              <span className="text-4xl font-black text-gray-900 tracking-[0.2em] uppercase">
                MEDHIR
              </span>
            </div>
          </div>
          {/* <RoleToggle /> */}
        </div>

        {/* Right Section: Profile */}
        <div className="flex items-center gap-2 relative">
          {employeeData && (
            <div className="h-10 px-5 flex items-center justify-between rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-gray-100 backdrop-blur-sm hover:bg-gray-100 mr-4">
              <span className="text-base font-semibold text-blue-900">
                {sessionStorage.getItem("companyName")}
              </span>
            </div>
          )}

          {/* Employee Name - For all roles */}
          {employeeData && (
            <div
              onClick={() => router.push("/employee/profile")}
              className="h-10 px-5 flex items-center justify-between rounded-xl shadow-md hover:shadow-lg transition-all duration-200 bg-gray-100 backdrop-blur-sm hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-sm font-medium text-gray-600">
                Hi, {sessionStorage.getItem("employeeName")}
              </span>
            </div>
          )}

          {/* Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-lg bg-gradient-to-b from-gray-50 to-gray-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] hover:translate-y-[-1px] transition-all duration-200"
              >
                <div className="flex items-center justify-center h-full w-full">
                  <User className="h-9 w-9 text-gray-900 drop-shadow-sm" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {sessionStorage.getItem("employeeName") || "User Name"}
                  </p>
                  {/* <p className="text-xs leading-none text-muted-foreground">
                    {sessionStorage.getItem("employeeEmail") || "user@email.com"}
                  </p> */}
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
                <LogOut className="mr-2 h-4 w-4" />
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