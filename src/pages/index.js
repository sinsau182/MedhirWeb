import { useEffect } from "react";
// import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "../components/providers/AuthProvider"; 

export default function Home() {
    const { handleLogin } = useContext(AuthContext);

  useEffect(() => {
    // Immediately redirect to ZITADEL login
    handleLogin();
  }, [handleLogin]);

  return null; // Nothing to render, just redirect
}