import React from "react";
import { motion } from "framer-motion";

// Utility function to merge class names safely
const cn = (...classes) => classes.filter(Boolean).join(" ");

const DashboardCard = ({
  className = "",  // Default to empty string if undefined
  children,
  onClick,
  delay = 0,
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.15,
        ease: [0.23, 1, 0.32, 1] // Custom cubic bezier for a natural feel
      }}
      whileHover={onClick ? { 
        y: -5, 
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
        transition: { duration: 0.2 } 
      } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "glass-card p-4 shadow-sm hover:shadow-md transition-all duration-300", 
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default DashboardCard;
