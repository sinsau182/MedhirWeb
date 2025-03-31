import { User, Settings } from "lucide-react";
import { useState } from "react";
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
import router from "next/router";
import RoleToggle from "./ui/roletoggle";


const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };


return (
    <header className="fixed top-0 left-0 right-0 z-50">
        <nav className="flex justify-between items-center p-3 shadow-md bg-white w-full">
            {/* Logo and Role Badges */}
            <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Medhir</h1>
                <RoleToggle currentRole="hr" setRole={(role) => console.log(role)} />

            </div>
            
            {/* Right Section: Notification & Profile */}
            <div className="flex items-center gap-6 relative">
                <div className="relative">
                <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-9 w-9">
                <AvatarImage src="/avatar.jpg" alt="John Doe" />
                <AvatarFallback>{'JD'}</AvatarFallback>
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
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
                </div>
            </div>
        </nav>
    </header>
);
};

export default Navbar;