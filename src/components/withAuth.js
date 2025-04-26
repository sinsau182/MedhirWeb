/* eslint-disable react/display-name */
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null

    useEffect(() => {
      if (typeof window !== "undefined") {
        const token = sessionStorage.getItem("token");
        if (!token) {
          router.replace("/login"); // Redirect immediately
        } else {
          setIsAuthenticated(true);
        }
      }
    }, [router]);

    if (isAuthenticated === null) {
      return null; // Prevent flickering before redirection
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;