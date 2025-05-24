/* eslint-disable react/display-name */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PasswordChangeAlert from "./PasswordChangeAlert";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null
    const [showPasswordAlert, setShowPasswordAlert] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        const passwordChanged = sessionStorage.getItem("passwordChanged");
        
        if (!token) {
          router.replace("/login"); // Redirect immediately
        } else {
          setIsAuthenticated(true);
          if (passwordChanged === "false") {
            setShowPasswordAlert(true);
          }
        }
      }
    }, [router]);

    if (isAuthenticated === null) {
      return null; // Prevent flickering before redirection
    }

    return (
      <>
        {showPasswordAlert && <PasswordChangeAlert />}
        <WrappedComponent {...props} />
      </>
    );
  };
};

export default withAuth;