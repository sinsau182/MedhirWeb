// Status options for attendance tracking
export const statusOptions = [
  { value: "P", label: "Present", color: "#CCFFCC" },
  { value: "PL", label: "Present with Leave", color: "#E5E5CC" },
  { value: "PH", label: "Present on Holiday", color: "#5cbf85" },
  { value: "P/A", label: "Half Day", color: "#FFFFCC" },
  { value: "PH/A", label: "Half Day on Holiday", color: "#ffcc80" },
  { value: "A", label: "Absent", color: "#FFCCCC" },
  { value: "LOP", label: "Loss of Pay", color: "#e57373" },
  { value: "H", label: "Holiday", color: "#E0E0E0" },
  {
    value: "P/LOP",
    label: "Present Half Day on Loss of Pay",
    color: "#A89EF6",
  },
];

// Helper function to get attendance color based on status
export const getAttendanceColor = (status) => {
  if (status === null) return "bg-gray-100"; // No Data
  const upperStatus = status.toUpperCase();
  if (upperStatus === "P") return "bg-[#CCFFCC]"; // Present (Light green)
  if (upperStatus === "PL") return "bg-[#E5E5CC]"; // Present with Leave (Light red)
  if (upperStatus === "P/A") return "bg-[#FFFFCC]"; // Half day (Light yellow)
  if (upperStatus === "A") return "bg-[#FFCCCC]"; // Absent (Light red)
  if (upperStatus === "H") return "bg-[#E0E0E0]"; // Holiday (Gray)
  if (upperStatus === "PH") return "bg-[#5cbf85]"; // Present on Holiday (Light blue)
  if (upperStatus === "PH/A") return "bg-[#ffcc80]"; // Half Day on Holiday (Lighter blue)
  if (upperStatus === "LOP") return "bg-[#e57373]"; // Loss of Pay (Pink)
  if (upperStatus === "P/LOP") return "bg-[#A89EF6]"; // Present on Loss of Pay (Light gray)
  if (upperStatus === "WEEKEND") return "bg-gray-300"; // Weekend
  return "";
}; 