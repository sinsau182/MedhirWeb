import { jwtDecode } from "jwt-decode";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";

export const updateSessionActivity = () => {
  const now = new Date().getTime();
  sessionStorage.setItem("lastActivity", now.toString());
};

export const isSessionExpiredDueToInactivity = () => {
  const lastActivity = sessionStorage.getItem("lastActivity");
  if (!lastActivity) return true;

  const now = new Date().getTime();
  const oneMinute = 60 * 60 * 1000; // 1 minute in ms
  return now - parseInt(lastActivity) > oneMinute;
};

export const clearSession = () => {
  sessionStorage.removeItem("lastActivity");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("currentRole");
  sessionStorage.removeItem("employeeId");
  sessionStorage.removeItem("passwordChanged");
  sessionStorage.removeItem("departmentName");
  sessionStorage.removeItem("employeeCompanyId");
  sessionStorage.removeItem("currentCompany");
  sessionStorage.removeItem("isSuperadmin");
  sessionStorage.removeItem("employeeName");
};

export const isTokenExpired = () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return true;

    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    return decodedToken.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true;
  }
};

// Custom hook for session management with AuthContext access
export const useSessionManager = () => {
  const { handleLogout } = useContext(AuthContext);

  useEffect(() => {
    const activityEvents = ["mousemove", "keydown", "click", "scroll"];
    const handleActivity = () => updateSessionActivity();

    activityEvents.forEach((event) =>
      window.addEventListener(event, handleActivity)
    );

    const interval = setInterval(() => {
      if (isSessionExpiredDueToInactivity()) {
        clearSession();
        handleLogout();
      }
    }, 60 * 1000);

    return () => {
      activityEvents.forEach((event) =>
        window.removeEventListener(event, handleActivity)
      );
      clearInterval(interval);
    };
  }, [handleLogout]);

  return null;
};