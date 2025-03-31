import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, X, Clock, CalendarIcon } from "lucide-react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const EmployeeAttendance = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [date, setDate] = useState(null); // State to manage selected date

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let daysArray = [];

    for (let day = 1; day <= daysInMonth; day++) {
      daysArray.push(new Date(year, month, day));
    }

    return daysArray;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Content */}
        <div className="p-6 space-y-6 mt-16"> {/* Increased mt-16 for more spacing */}
          {/* Monthly Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Monthly Summary</CardTitle>
              <CardDescription>Your attendance statistics for this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-sm font-medium">Present Days</h3>
                  </div>
                  <p className="text-2xl font-bold">18</p>
                  <p className="text-xs text-muted-foreground">of 22 working days</p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center mb-2">
                    <X className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="text-sm font-medium">Absent Days</h3>
                  </div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-muted-foreground">of 22 working days</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-amber-500 mr-2" />
                    <h3 className="text-sm font-medium">Late Check-ins</h3>
                  </div>
                  <p className="text-2xl font-bold">2</p>
                  <p className="text-xs text-muted-foreground">of 22 working days</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex items-center mb-2">
                    <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="text-sm font-medium">Attendance Rate</h3>
                  </div>
                  <p className="text-2xl font-bold">91%</p>
                  <p className="text-xs text-muted-foreground">this month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attendance Calendar */}
            <Card className="md:col-span-2">
  <CardHeader>
    <CardTitle className="text-xl">Attendance Calendar</CardTitle>
    <CardDescription>View and track your attendance history</CardDescription>
  </CardHeader>
  <CardContent>

    {/* Calendar Days */}
    <div className="flex flex-wrap gap-1 border rounded-md p-2">
      {calendarDays.map((day, index) => (
        <div
          key={index}
          onClick={() => setDate(day)}
          className={`w-[6.5%] text-center p-2 cursor-pointer rounded-md transition ${
            date && date.toDateString() === day.toDateString()
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-200"
          }`}
        >
          {day.getDate()}
        </div>
      ))}
    </div>
  </CardContent>
</Card>


            {/* Attendance Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {date
                    ? date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Select a date"}
                </CardTitle>
                <CardDescription>Attendance details</CardDescription>
              </CardHeader>
              <CardContent>
                {date ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                        Present
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" /> Check In
                      </span>
                      <span>09:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" /> Check Out
                      </span>
                      <span>06:00 PM</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mb-2 text-muted-foreground/60" />
                    <p>Select a date to view attendance details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance;