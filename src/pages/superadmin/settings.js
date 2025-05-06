import { useState } from "react";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";

function SuperadminSettings() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Settings");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Fixed Header */}
      <SuperadminHeaders />
      {/* Spacer to prevent content from being hidden behind the fixed header */}
      <div className="h-4" />
    </div>
  );
}

export default withAuth(SuperadminSettings);