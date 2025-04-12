import { User, Settings } from "lucide-react";
import { useState, useEffect } from "react";
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

  const handleLogout = () => {
    dispatch(removeItem({ key: 'token' }));
    // dispatch(removeItem({ key: 'user' }));
    dispatch(removeItem({ key: 'currentRole' }));
    router.push("/login");
  };

  const handleProfileClick = () => {
    router.push("/employee/profile");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="flex justify-between items-center p-3 shadow-md bg-white w-full">
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
