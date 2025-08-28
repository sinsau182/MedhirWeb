import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/router";
import { useUserRolesAndModules } from "@/hooks/useUserRolesAndModules";

const roleLabels = {
  EMPLOYEE: "Employee",
  MANAGER: "Manager",
  MODULEADMIN: "Module Admin",
  HOC: "Head of Company",
  SUPERADMIN: "Super Admin",
};

const roleColors = {
  HRADMIN: "bg-blue-500 text-white",
  MANAGER: "bg-green-500 text-white",
  EMPLOYEE: "bg-purple-500 text-white",
  SALES: "bg-yellow-500 text-white",
  ACCOUNTADMIN: "bg-indigo-500 text-white",
  PROJECTADMIN: "bg-orange-500 text-white",
  ACCOUNTANT: "bg-indigo-500 text-white",
  PROJECTMANAGER: "bg-orange-500 text-white",
};

// Define the desired order of roles
const roleOrder = [
  "EMPLOYEE",
  "MANAGER",
  "HRADMIN",
  "ACCOUNTANT",
  "PROJECTMANAGER",
  "SALES",
];

const RoleToggle = () => {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [roleDisplayLabels, setRoleDisplayLabels] = useState(roleLabels);
  const { userRoles, isLoading } = useUserRolesAndModules();

  useEffect(() => {
    if (!isLoading && userRoles.length > 0) {
      // Sort roles according to the defined order
      const sortedRoles = roleOrder.filter((role) => userRoles.includes(role));
      setAvailableRoles(sortedRoles);

      const storedRole = sessionStorage.getItem("currentRole");
      if (storedRole && userRoles.includes(storedRole)) {
        setCurrentRole(storedRole);
      } else {
        setCurrentRole(sortedRoles[0]);
      }
    }
  }, [userRoles, isLoading]);

  const switchRole = (role) => {
    if (role !== currentRole) {
      setCurrentRole(role);
      sessionStorage.setItem("currentRole", role);
      if (role === "HRADMIN") {
        router.push("/hradmin/dashboard");
      } else if (role === "MANAGER") {
        router.push("/manager/dashboard");
      } else if (role === "EMPLOYEE") {
        router.push("/employee/dashboard");
      } else if (role === "ACCOUNTANT") {
        router.push("/account/customers");
      } else if (role === "PROJECTMANAGER") {
        router.push("/project_Manager/expense");
      } else if (role === "SALES") {
        router.push("/Sales/LeadManagement");
      }
    }
  };

  // Show loading state while fetching roles
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-500">Loading roles...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {availableRoles.map((role) => (
        <Button
          key={role}
          variant={role === currentRole ? "default" : "outline"}
          size="sm"
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-colors",
            role === currentRole
              ? roleColors[role]
              : "bg-gray-200 text-gray-700"
          )}
          onClick={() => switchRole(role)}
        >
          {roleDisplayLabels[role]}
        </Button>
      ))}
    </div>
  );
};

export default RoleToggle;