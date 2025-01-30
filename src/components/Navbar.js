import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full p-4 z-50 transition-all duration-300 ${
        isScrolled ? "bg-primary shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-accent text-xl font-bold">EMS</h1>
        <div className="space-x-4">
          <Button variant="outline" className="bg-secondary">
            Home
          </Button>
          <Button variant="outline" className="bg-secondary">
            Dashboard
          </Button>
        </div>
      </div>
    </nav>
  );
}