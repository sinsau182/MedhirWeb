import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // Change '/dashboard' to any page you want
  }, [router]);

  return null; // Or a loading screen if needed
}
