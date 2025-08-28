import { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '@/components/providers/AuthProvider';
import authConfig from '@/components/config/authConfig';

export const useUserRolesAndModules = () => {
  const [userRoles, setUserRoles] = useState([]);
  const [userModules, setUserModules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { auth, userManager, userInfo } = useContext(AuthContext);

  // Decode helper function from callback.js
  const decodeBase64 = (value) =>
    value ? Buffer.from(value, "base64").toString("utf-8") : null;

  // Parse roles and modules from userInfo
  const parseUserRolesAndModules = (userInfoData) => {
    try {
      // Extract roles from roles claim (same logic as callback.js)
      const rolesClaimKey = "urn:zitadel:iam:org:project:roles";
      const rolesObject = userInfoData[rolesClaimKey] || {};
      const roles = Object.keys(rolesObject);

      // Extract metadata (same logic as callback.js)
      const metadataKey = "urn:zitadel:iam:user:metadata";
      const metadata = userInfoData[metadataKey] || {};

      // Decode metadata values
      const decodedRoles = decodeBase64(metadata.roles);
      const decodedModules = decodeBase64(metadata.modules);

      // Parse roles - use decoded roles if available, otherwise use roles from claim
      let parsedRoles = [];
      if (decodedRoles) {
        try {
          parsedRoles = JSON.parse(decodedRoles);
          if (typeof parsedRoles === "string") {
            parsedRoles = [parsedRoles];
          }
          if (!Array.isArray(parsedRoles)) {
            parsedRoles = [];
          }
        } catch (e) {
          console.warn("Failed to parse decoded roles, using claim roles:", e);
          parsedRoles = roles;
        }
      } else {
        parsedRoles = roles;
      }

      // Parse modules
      let parsedModules = [];
      if (decodedModules) {
        try {
          parsedModules = JSON.parse(decodedModules);
          if (typeof parsedModules === "string") {
            parsedModules = [parsedModules];
          }
          if (!Array.isArray(parsedModules)) {
            parsedModules = [];
          }
        } catch (e) {
          console.warn("Failed to parse decoded modules:", e);
          parsedModules = [];
        }
      }

      return { roles: parsedRoles, modules: parsedModules };
    } catch (error) {
      console.error("Error parsing user roles and modules:", error);
      return { roles: [], modules: [] };
    }
  };

  // Fetch user info and parse roles/modules
  const fetchUserInfo = async (accessToken) => {
    try {
      const response = await fetch(authConfig.userinfo_endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }
      
      const userInfoData = await response.json();
      return parseUserRolesAndModules(userInfoData);
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      throw error;
    }
  };

  useEffect(() => {
    const getRolesAndModules = async () => {
      console.log("useUserRolesAndModules: auth, userManager, userInfo", { auth, userManager: !!userManager, userInfo: !!userInfo });
      
      // Don't proceed if we don't have auth or userManager
      if (!auth || !userManager) {
        console.log("useUserRolesAndModules: Missing auth or userManager, setting loading to false");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // If we already have userInfo, parse it directly
        if (userInfo) {
          console.log("useUserRolesAndModules: Using existing userInfo", userInfo);
          const { roles, modules } = parseUserRolesAndModules(userInfo);
          setUserRoles(roles);
          setUserModules(modules);
        } else {
          console.log("useUserRolesAndModules: No userInfo, fetching from userManager");
          // If no userInfo, try to get current user from userManager
          const user = await userManager.getUser();
          if (user && user.access_token) {
            console.log("useUserRolesAndModules: Got user from userManager, fetching userInfo");
            const { roles, modules } = await fetchUserInfo(user.access_token);
            setUserRoles(roles);
            setUserModules(modules);
          } else {
            console.log("useUserRolesAndModules: No user found from userManager");
            // If no user found, set empty arrays
            setUserRoles([]);
            setUserModules([]);
          }
        }
      } catch (err) {
        console.error("Error getting user roles and modules:", err);
        setError(err);
        setUserRoles([]);
        setUserModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    getRolesAndModules();
  }, [auth, userManager, userInfo]);

  // Add a separate effect to handle cases where userInfo becomes available after initial load
  useEffect(() => {
    if (userInfo && !isLoading) {
      console.log("useUserRolesAndModules: userInfo became available, parsing roles and modules", userInfo);
      const { roles, modules } = parseUserRolesAndModules(userInfo);
      setUserRoles(roles);
      setUserModules(modules);
    }
  }, [userInfo]);

  return {
    userRoles,
    userModules,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true);
      // This will trigger the useEffect again
    }
  };
};
