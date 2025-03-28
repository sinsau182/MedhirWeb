import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const roleLabels = {
  hr: "HR",
  manager: "Manager",
  employee: "Employee",
};

const roleColors = {
  hr: "bg-blue-500 text-white",
  manager: "bg-green-500 text-white",
  employee: "bg-purple-500 text-white",
};

const RoleToggle = () => {
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
    }
  };

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