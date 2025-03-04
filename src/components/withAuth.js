import { useEffect, useState } from "react";
import { useRouter } from "next/router";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    useEffect(() => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (!token) {
          router.replace("/login"); // Redirects after first render
        }
        setIsAuthChecked(true);
      }
    }, [router]);

    if (!isAuthChecked) {
      return null; // Prevents flickering before redirect
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
