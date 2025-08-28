/* eslint-disable react/display-name */
import { useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import PasswordChangeAlert from "./PasswordChangeAlert";
import { AuthContext } from '@/components/providers/AuthProvider';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const { auth, handleLogin, handleLogout } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null
    const [showPasswordAlert, setShowPasswordAlert] = useState(false);

    useEffect(() => {
      if (auth === null) {
        // Still loading auth state, do nothing
        return;
      }
      if (auth === false) {
        // User not authenticated, trigger Zitadel login or redirect
        handleLogin();
      } else {
        setLoading(false);
      }

      //exiting authentication check
      if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        const passwordChanged = sessionStorage.getItem("passwordChanged");
        
        if (!token) {
          // router.replace("/login"); // Redirect immediately
          handleLogout();
        } else {
          setIsAuthenticated(true);
          if (passwordChanged === "false") {
            setShowPasswordAlert(true);
          }
        }
      }
    }, [router, auth, handleLogin]);

    if (loading || auth === null) {
      return null;
    }

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