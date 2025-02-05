import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { NavButton } from "@/components/ui/navButton";

export default function HradminNavbar({ setSearchBoxShift = () => {} }) {
  const router = useRouter();
  const [showSubNav, setShowSubNav] = useState(false);
  const [selectedNav, setSelectedNav] = useState(null);
  const subNavRef = useRef(null);

  const mainNavItems = ["Employee", "Attendance", "Payroll", "Settings"];
  const employeeSubNavItems = ["Basic", "ID Proofs", "Salary", "Bank Details", "Leaves Policy"];

  useEffect(() => {
    function handleClickOutside(event) {
      if (subNavRef.current && !subNavRef.current.contains(event.target)) {
        setShowSubNav(false);
        setSearchBoxShift(false); // Move search box back up
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (item) => {
    setSelectedNav(item);
    setShowSubNav(true);
    setSearchBoxShift(true); // Move search box down
  };

  return (
    <div className="relative w-full flex flex-col items-center transition-all duration-300">
      {/* Main Navbar */}
      <nav
        className={`flex justify-between bg-[#1F1F1F] p-4 rounded-full border border-gray-600 w-[60%] mx-auto transition-all duration-300 ${
          showSubNav ? "mb-6" : "mb-2"
        }`}
      >
        {mainNavItems.map((item) => (
          <button
            key={item}
            className="flex-1 text-center text-white text-lg font-bold"
            onClick={() => handleNavClick(item)}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* SubNavbar */}
      {showSubNav && (
        <motion.div
          ref={subNavRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", stiffness: 250, damping: 20 }}
          className="absolute top-[75px] w-[62%] bg-[#292929] p-2 rounded-md border border-gray-500 flex justify-around shadow-lg"
        >
          {selectedNav === "Employee" ? (
            employeeSubNavItems.map((item) => (
              <Link key={item} href={`/hradmin/${item.toLowerCase()}`} className="flex-1 text-center">
                <NavButton variant="ghost"
                className="relative text-white text-sm font-medium px-2 py-1">
                  {item}
                  {router.pathname.includes(item.toLowerCase()) && (
                    <motion.span
                      layoutId=""
                      className="absolute bottom-[-4px] left-[20%] w-[60%] h-[2px] bg-black-900 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </NavButton>
              </Link>
            ))
          ) : (
            <div className="text-white text-sm font-medium px-2 py-1 opacity-50">
              {/* Add future content here for Attendance, Payroll, and Settings */}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}