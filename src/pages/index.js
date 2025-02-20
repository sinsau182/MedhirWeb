import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/hradmin/employees"); // Change '/dashboard' to any page you want
  }, []);

  return null; // Or a loading screen if needed
}
