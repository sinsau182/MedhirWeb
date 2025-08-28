import React, { createContext, useState, useEffect, useRef } from "react";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import authConfig from "@/components/config/authConfig";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null); // null = unknown, true = logged in, false = logged out
  const [userInfo, setUserInfo] = useState(null);

  const userManagerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // SSR safe

    userManagerRef.current = new UserManager({
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      ...authConfig,
    });

    userManagerRef.current.getUser().then(async (user) => {
      if (user) {
        setAuth(true);
        // Fetch user info if we have a user
        try {
          const response = await fetch(authConfig.userinfo_endpoint, {
            headers: { Authorization: `Bearer ${user.access_token}` },
          });
          if (response.ok) {
            const userInfoData = await response.json();
            setUserInfo(userInfoData);
          }
        } catch (error) {
          console.error("Failed to fetch user info on page reload:", error);
        }
      } else {
        setAuth(false); // User not logged in, set auth false for login page to show.
      }
    }).catch(() => {
      setAuth(false);
    });
  }, []);

  function handleLogin() {
    userManagerRef.current?.signinRedirect();
  }

  function handleLogout() {
    // Call signoutRedirect, but do NOT update React state here because the browser will redirect.
    userManagerRef.current?.signoutRedirect().catch(err => {
      console.error("Logout error:", err);
    });
  }

  return (
    <AuthContext.Provider value={{
      auth,
      setAuth,
      userInfo,
      setUserInfo,
      handleLogin,
      handleLogout,
      userManager: userManagerRef.current,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;