import { User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios"; // Import axios for API requests
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from "next/router";
import RoleToggle from "./ui/roletoggle";
import { useDispatch, useSelector } from "react-redux";
import { removeItem } from "@/redux/slices/sessionStorageSlice";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userInfo, setUserInfo] = useState({ name: '', email: '' });
  const { items } = useSelector((state) => state.sessionStorage);
  const [companies, setCompanies] = useState(["Company A", "Company B", "Company C"]); // Example companies
  const [selectedCompany, setSelectedCompany] = useState(companies[0]);
  const [navbarColor, setNavbarColor] = useState("bg-[#A8D5BA]"); // Default navbar color

  useEffect(() => {
    const getUserInfo = () => {
      try {
        const token = items?.token;
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserInfo({
            name: decodedToken.name || 'User',
            email: decodedToken.email || '',
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };

    getUserInfo();
  }, [items]);

  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(storedCompany);

      // Set navbar color based on the stored company
      let backgroundColor;
      switch (storedCompany) {
        case "Company A":
          backgroundColor = "bg-[#A8D5BA]";
          break;
        case "Company B":
          backgroundColor = "bg-[#FFF3B0]";
          break;
        case "Company C":
          backgroundColor = "bg-[#B3D8F7]";
          break;
        default:
          backgroundColor = "bg-[#A8D5BA]";
      }

      setNavbarColor(backgroundColor);
    }
  }, []);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzdXBlcmFkbWluQGdtYWlsLmNvbSIsInJvbGVzIjpbIlNVUEVSQURNSU4iXSwiaWF0IjoxNzQ0NjEwNjE2LCJleHAiOjE3NDQ2OTcwMTZ9.vbtIC5ktA2GjWDVjG7AN37KD0kD-Pehny8DTl0lLYFE';
        const response = await axios.get("http://localhost:8083/superadmin/modules/users/UID1/companies", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && Array.isArray(response.data)) {
          setCompanies(response.data); // Store the full company objects
          if (!response.data.some((company) => company.companyName === selectedCompany)) {
            setSelectedCompany(response.data[0].companyName); // Set default company if current selection is not in the list
          }
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === "selectedCompany" && event.newValue) {
        setSelectedCompany(event.newValue);

        // Update navbar color based on the new selected company
        const selectedCompanyData = companies.find((company) => company.companyName === event.newValue);
        if (selectedCompanyData) {
          let backgroundColor;
          switch (selectedCompanyData.companyId) {
            case "CID1":
              backgroundColor = "bg-[#A8D5BA]";
              break;
            case "CID2":
              backgroundColor = "bg-[#FFF3B0]";
              break;
            default:
              backgroundColor = "bg-[#B3D8F7]";
          }
          setNavbarColor(backgroundColor);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [companies]);

  const handleLogout = () => {
    dispatch(removeItem({ key: 'token' }));
    // dispatch(removeItem({ key: 'user' }));
    dispatch(removeItem({ key: 'currentRole' }));
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/employee/profile");
  };

  const handleCompanyChange = (companyName) => {
    const currentSelectedCompany = localStorage.getItem("selectedCompany"); // Get the current selected company from localStorage

    if (companyName !== currentSelectedCompany) { // Change color only if a different company is selected
      setSelectedCompany(companyName);
      localStorage.setItem("selectedCompany", companyName); // Store selected company in localStorage

      // Find the selected company object
      const selectedCompanyData = companies.find((company) => company.companyName === companyName);
      if (selectedCompanyData) {
        console.log("Selected Company ID:", selectedCompanyData.companyId);

        // Set navbar color based on the selected company ID or name
        let backgroundColor;
        switch (selectedCompanyData.companyId) {
          case "CID1":
            backgroundColor = "bg-[#A8D5BA]";
            break;
          case "CID2":
            backgroundColor = "bg-[#FFF3B0]";
            break;
          default:
            backgroundColor = "bg-[#B3D8F7]";
        }

        setNavbarColor(backgroundColor); // Update the navbar color
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
            <span className="text-2xl font-bold text-black tracking-wide">MEDHIR</span>
          </div>
          <RoleToggle />
        </div>

        {/* Right Section: Profile */}
        <div className="flex items-center gap-6 relative">
          {/* Company Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 px-4 flex items-center justify-between">
                {selectedCompany}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start" forceMount>
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.companyId}
                  onClick={() => handleCompanyChange(company.companyName)}
                  className={`cursor-pointer ${
                    company.companyName === selectedCompany ? "font-semibold text-violet-600" : ""
                  }`}
                >
                  {company.companyName}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/avatar.jpg" alt={userInfo.name} />
                  <AvatarFallback>
                    {userInfo.name ? userInfo.name.substring(0, 2).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">John Doe</p>
              <p className="text-xs leading-none text-muted-foreground">doejohn@gmail.com</p>
            </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer text-violet-600 hover:text-violet-700">
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
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
