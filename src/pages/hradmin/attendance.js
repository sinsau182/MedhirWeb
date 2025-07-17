import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import AttendanceTracker from "@/components/Attendance/AttendanceTracker";
import { useDispatch, useSelector } from "react-redux";
import { fetchEmployees } from "@/redux/slices/employeeSlice";

function Attendance() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { employees = [], loading: employeesLoading } = useSelector(
    (state) => state.employees || {}
  );

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    dispatch(fetchEmployees()).catch((err) => {
      setError("Failed to fetch employees");
      console.error("Error fetching employees:", err);
    });
  }, [dispatch]);

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />
        <AttendanceTracker 
          employees={employees} 
          employeesLoading={employeesLoading} 
          role="HRADMIN"
        />
      </div>
    </div>
  );
}

export default withAuth(Attendance);
