import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { CheckCircle2, X, Clock, CalendarIcon } from "lucide-react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";

const EmployeeAttendance = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [date, setDate] = useState(null); // State to manage selected date
  const [attendanceData, setAttendanceData] = useState([]); // <-- Add state for attendance data

  // Simulate fetching attendance data
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    // Sample data - replace with actual API call
    const sampleData = [
      { date: new Date(year, month, 5), status: 'Present', isLate: true, checkIn: '09:15 AM', checkOut: '06:05 PM' },
      { date: new Date(year, month, 12), status: 'Present', isLate: true, checkIn: '09:30 AM', checkOut: '06:15 PM' },
      { date: new Date(year, month, 18), status: 'Present', isLate: false, checkIn: '08:55 AM', checkOut: '06:00 PM' },
      { date: new Date(year, month, 25), status: 'Absent', isLate: false, checkIn: null, checkOut: null },
      // Add more sample data as needed
    ];
    setAttendanceData(sampleData);
  }, []);

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Present Days */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                  <div className="flex items-center mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    <h3 className="text-sm font-medium">Present Days</h3>
                  </div>
                  <p className="text-2xl font-bold">18</p>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between items-center">
                    {/* Full Day -> Present with Leave */}
                    <div className="flex-1 text-center">
                      <span className="text-sm font-medium">Present with Leave</span>
                      <p className="text-xl font-bold mt-1">16</p> {/* Example number */}
                    </div>
                    {/* Vertical Line */}
                    <div className="h-10 w-px bg-gray-300 mx-4"></div>
                    {/* Half Day -> Present with late check in */}
                    <div className="flex-1 text-center">
                      <span className="text-sm font-medium">Present with late check in</span>
                      <p className="text-xl font-bold mt-1">2</p> {/* Example number */}
                    </div>
                  </div>
                </div>

                {/* Absent Days */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <div className="flex items-center mb-2">
                    <X className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="text-sm font-medium">Total Absent</h3>
                  </div>
                  <p className="text-2xl font-bold">2</p>
                  <hr className="my-2 border-gray-300" />
                  <div className="flex justify-between items-center">


                    {/* Absent with Leave -> Absent with late check in */}
                    <div className="flex-1 text-center">
                      <span className="text-sm font-medium">Absent with late check in</span>
                      <p className="text-xl font-bold mt-1">1</p> {/* Random number */}
                    </div>
                    {/* Vertical Line */}
                    <div className="h-10 w-px bg-gray-300 mx-4"></div>
                    {/* Absent with LOP */}
                    <div className="flex-1 text-center">
                      <span className="text-sm font-medium">Absent with LOP</span>
                      <p className="text-xl font-bold mt-1">1</p> {/* Random number */}
                    </div>
                    
                  </div>
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
      {calendarDays.map((day, index) => {
        // Find attendance status for the current day
        const dayData = attendanceData.find(
          d => d.date.toDateString() === day.toDateString()
        );
        const isLate = dayData?.isLate;

        return (
          <div
            key={index}
            onClick={() => setDate(day)}
            className={`w-[6.5%] text-center p-2 cursor-pointer rounded-md transition ${
              date && date.toDateString() === day.toDateString()
                ? "bg-blue-500 text-white"
                : isLate
                ? "bg-yellow-100 hover:bg-yellow-200" // Yellow for late
                : "hover:bg-gray-200" // Default hover
            }`}
          >
            {day.getDate()}
          </div>
        );
      })}
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
                  (() => {
                    // Find attendance details for the selected date
                    const selectedDayData = attendanceData.find(
                      d => d.date.toDateString() === date.toDateString()
                    );

                    if (!selectedDayData) {
                      return (
                        <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                           <p>No attendance data for this date.</p>
                        </div>
                      );
                    }

                    const isLate = selectedDayData.isLate;
                    const status = selectedDayData.status;
                    const checkIn = selectedDayData.checkIn;
                    const checkOut = selectedDayData.checkOut;

                    return (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <span className={`${status === 'Present' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} text-xs font-semibold px-2 py-1 rounded-full`}>
                            {status}
                          </span>
                        </div>
                        {status === 'Present' && (
                          <>
                            <div className="flex justify-between items-center">
                              <span className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" /> Check In
                              </span>
                              <span>{checkIn || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4 text-blue-500" /> Check Out
                              </span>
                              <span>{checkOut || 'N/A'}</span>
                            </div>
                            {isLate && (
                              <button
                                onClick={() => alert('Reason sending functionality to be implemented.')} // Placeholder action
                                className="mt-4 w-full bg-teal-400 text-white py-2 px-4 rounded-md transition text-sm"
                              >
                                Send Reason for Late Check-in
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })()
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