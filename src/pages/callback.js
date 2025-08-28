import { useContext, useEffect } from "react";
import { AuthContext } from "@/components/providers/AuthProvider";
import authConfig from "@/components/config/authConfig";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { setItem } from "@/redux/slices/sessionStorageSlice";
import { updateSessionActivity } from "@/utils/sessionManager";
export default function CallbackPage() {
  const { auth, setAuth, userManager, userInfo, setUserInfo, handleLogout } =
    useContext(AuthContext);
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hasOIDCParams = params.has("code") && params.has("state");

    if ((auth === null || auth === false) && userManager && hasOIDCParams) {
      userManager
        .signinRedirectCallback()
        .then((user) => {
          console.log("Callback user:", user);
          if (user) {
            setAuth(true);
            const access_token = user.access_token;
            fetch(authConfig.userinfo_endpoint, {
              headers: { Authorization: `Bearer ${access_token}` },
            })
              .then((res) => res.json())
              .then((userInfoData) => {
                console.log("User Info fetched:", userInfoData);

                if (access_token) {
                  const decodedToken = JSON.parse(
                    atob(access_token.split(".")[1])
                  ); // Decode the JWT token
                  sessionStorage.setItem(
                    "employeeCompanyId",
                    decodedToken.companyId
                  );
                }

                // const metadataClaimKey = "urn:zitadel:iam:org:project:metadata";
                // if (userInfoData[metadataClaimKey] && typeof window !== "undefined") {
                //   sessionStorage.setItem("employeeCompanyId", userInfoData[metadataClaimKey].companyId);
                //   updateSessionActivity();
                // }

                if (typeof window !== "undefined") {
                  dispatch(
                    setItem({
                      key: "token",
                      value: access_token,
                      encrypt: true,
                    })
                  );
                  updateSessionActivity();
                }

                //////
                const rolesClaimKey = "urn:zitadel:iam:org:project:roles"; // or full namespaced key if needed

                const rolesObject = userInfoData[rolesClaimKey] || {};

                // Extract role names as array
                const roles = Object.keys(rolesObject);

                // sessionStorage.setItem("roles", JSON.stringify(roles));

                // Find companyId metadata
                // Find metadata
                // ----- Metadata -----
                // ----- Metadata -----
                const metadataKey = "urn:zitadel:iam:user:metadata";
                const metadata = userInfoData[metadataKey] || {};

                // Decode helper
                const decodeBase64 = (value) =>
                  value ? Buffer.from(value, "base64").toString("utf-8") : null;

                // Decode values
                const decodedCompanyId = decodeBase64(metadata.companyId);
                const decodedDepartmentName = decodeBase64(
                  metadata.departmentName
                );
                const decodedEmployeeId = decodeBase64(metadata.employeeId);
                const decodedRoles = decodeBase64(metadata.roles);
                const decodedIsSuperadmin = decodeBase64(metadata.isSuperadmin);
                const passwordChanged = decodeBase64(metadata.passwordChanged);
                const decodedModules = decodeBase64(metadata.modules);
                const decodedCompanyName = decodeBase64(metadata.companyName);
                const decodedEmployeeName = decodeBase64(metadata.employeeName);

                // EmployeeId: from metadata if provided, otherwise fallback to sub claim
                // const decodedEmployeeId = metadata.employeeId
                //   ? decodeBase64(metadata.employeeId)
                //   : userInfoData.sub || null;

                // Save in session
                if (decodedCompanyId) {
                  sessionStorage.setItem("employeeCompanyId", decodedCompanyId);
                }
                if (decodedDepartmentName) {
                  sessionStorage.setItem(
                    "departmentName",
                    decodedDepartmentName
                  );
                }
                if (decodedEmployeeId) {
                  sessionStorage.setItem("employeeId", decodedEmployeeId);
                }
                if (decodedIsSuperadmin) {
                  sessionStorage.setItem("isSuperadmin", decodedIsSuperadmin);
                }
                if (passwordChanged) {
                  sessionStorage.setItem("passwordChanged", passwordChanged);
                }

                if (decodedCompanyName) {
                  sessionStorage.setItem("companyName", decodedCompanyName);
                }
                if (decodedEmployeeName) {
                  sessionStorage.setItem("employeeName", decodedEmployeeName);
                }
                console.log("User roles:", roles); // ['COMPANY_HEAD', 'EMPLOYEE', 'MANAGER', 'SUPERADMIN']
                if (roles.includes("SUPERADMIN")) {
                  router.push("/superadmin/companies");
                } else if (roles.includes("EMPLOYEE")) {
                  router.push("/employee/dashboard");
                  sessionStorage.setItem("currentRole", "EMPLOYEE");
                } else {
                  router.push("/dashboard");
                }
                console.log("Id Token:", user.id_token);
                console.log("Access Token:", user.access_token);
                setUserInfo(userInfoData);
              })
              .catch((error) =>
                console.error("Failed to fetch user info:", error)
              );
          } else {
            setAuth(false);
          }
        })
        .catch((error) => {
          console.error("signinRedirectCallback failed:", error);
          setAuth(false);
        });
    }
  }, [auth, userManager, setAuth, setUserInfo]);

  if (!userManager) {
    return <div>Initializing authentication library...</div>;
  }

  if (auth && userInfo) {
    return (
      <div>
        <h1>Welcome, {userInfo.name}!</h1>
        <h2>Your ZITADEL Profile Information</h2>
        <h3>Name: {userInfo.name}</h3>
        <h3>Email: {userInfo.email}</h3>
        <h3>Email Verified: {userInfo.email_verified ? "Yes" : "No"}</h3>
        <h3>Locale: {userInfo.locale}</h3>
        <button onClick={handleLogout}>Log out</button>
      </div>
    );
  }
  // else{
  //   handleLogout();
  // }

  // return <div>Loading...</div>;
}
