import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/router";

const roleLabels = {
  employee: "Employee",
  manager: "Manager",
  hr: "HR Admin",
};

const roleColors = {
  hr: "bg-blue-500 text-white",
  manager: "bg-green-500 text-white",
  employee: "bg-purple-500 text-white",
};

const RoleToggle = () => {
  const router = useRouter();
  const roles = Object.keys(roleLabels);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("currentRole");
    if (storedRole && roles.includes(storedRole)) {
      setCurrentRole(storedRole);
    } else {
      setCurrentRole(roles[0]);
    }
  }, []);

  const switchRole = (role) => {
    
  
    if (role !== currentRole) {
      setCurrentRole(role);
      localStorage.setItem("currentRole", role);
      if (role === "hr") {
        router.push("/hradmin/dashboard"); // Redirect to HR dashboard
      } else if (role === "manager") {
        router.push("/manager/dashboard"); // Redirect to Manager dashboard
      } else if (role === "employee") {
        router.push("/employee/dashboard"); // Redirect to Employee dashboard
      }
    }
  };

  console.log("Current Role:", currentRole); // For debugging purposes
  return (
    <div className="flex items-center gap-2">
      {roles.map((role) => (
        <Button
          key={role}
          variant={role === currentRole ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            role === currentRole ? roleColors[role] : "bg-gray-200 text-gray-700"
          )}
          onClick={() => switchRole(role)}
        >
          {roleLabels[role]}
        </Button>
      ))}
    </div>
  );
};

export default RoleToggle;