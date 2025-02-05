// components/SuperadminNavbar.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/router"; // Import useRouter
import { NavButton } from "@/components/ui/navButton";

export default function HradminNavbar() {
  const router = useRouter(); // Initialize useRouter hook
  const navItems = ["Employee", "Attendance","Payroll", "Settings"];

  // Use the router path to determine the selected nav item
  const selectedNav = router.pathname.split('/')[2] || 'employee'; // Defaults to 'companies' if no path is selected

  return (
    <nav className="flex justify-between bg-[#1F1F1F] p-4 rounded-full border border-gray-600 mb-6 w-[60%] mx-auto">
      {navItems.map((item) => (
        <Link key={item} href={`/hradmin/${item.toLowerCase()}`} className="flex-1 text-center">
          <NavButton
            variant="ghost"
            className="relative text-white text-lg font-bold w-full focus:outline-none active:bg-transparent hover:bg-transparent"
          >
            {item}
            {selectedNav === item.toLowerCase() && (
              <motion.span
                layoutId="underline"
                className="absolute bottom-[-6px] left-[20%] w-[60%] h-[4px] bg-blue-500 rounded-full"
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            )}
          </NavButton>
        </Link>
      ))}
    </nav>
  );
}
