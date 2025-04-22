import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Edit, Search, Trash, UserPlus, Grid2x2 } from "lucide-react";
import Link from "next/link";
import { FaBuilding, FaCog, FaUserCircle } from "react-icons/fa"; // Import the icons
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