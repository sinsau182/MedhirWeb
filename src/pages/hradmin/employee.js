import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";

export default function HradminCompanies() {
    const [activeTab, setActiveTab] = useState("Basic");

    const employees = [
        { name: "John Doe", email: "john@example.com", phone: "1234567890", department: "HR", gender: "Male", title: "Manager", manager: "Jane Smith" },
        { name: "Alice Brown", email: "alice@example.com", phone: "9876543210", department: "Finance", gender: "Female", title: "Analyst", manager: "Bob Johnson" }
    ];

    return (
        <div className="bg-white text-black min-h-screen p-6">
            {/* Top Navbar (Restored Previous Style) */}
            <header className="fixed top-0 left-[30px] right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
                <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
                <nav className="flex flex-grow justify-center space-x-16 text-xl font-medium">
                    {["Employees", "Attendance", "Payroll", "Settings"].map((item, index) => (
                        <button 
                            key={index} 
                            onClick={() => setActiveTab(item)} 
                            className={`hover:text-blue-600 ${activeTab === item ? "text-blue-600 font-bold" : "text-black"}`}
                        >
                            {item}
                        </button>
                    ))}
                </nav>
                <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
            </header>

            {/* Search Box (Restored Previous Layout) */}
            <div className="h-10" />
            <div className="p-10">
                <div className="mt-2 p-4 rounded-lg bg-gray-200 flex justify-between items-center">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white flex items-center">
                        <UserPlus className="mr-2" size={20} /> Add New Employee
                    </Button>
                    <div className="flex w-screen justify-center relative left-[-20px]">
                        <div className="relative w-1/3">
                            <Input placeholder="Search" className="w-full bg-gray-100 text-black border border-gray-300 pr-10 text-lg" />
                            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={24} />
                        </div>
                    </div>
                </div>

                {/* Sub Navbar (Tabs) */}
                <div className="bg-gray-300 p-4 w-full rounded-md mt-4 flex justify-start space-x-10 text-lg shadow-md">
                    {["Basic", "ID Proofs", "Salary", "Bank Details", "Leaves Policy"].map((tab, index) => (
                        <button 
                            key={index} 
                            onClick={() => setActiveTab(tab)} 
                            className={`hover:text-blue-600 ${activeTab === tab ? "text-blue-600 font-bold" : "text-black"}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Table Section */}
                <div className="mt-6 bg-gradient-to-b from-gray-200 to-gray-300 p-4 shadow-md rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {["Name", "Email", "Phone no.", "Department", "Gender", "Title", "Reporting Manager"].map((heading, index) => (
                                    <TableHead key={index} className="text-left">{heading}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((emp, index) => (
                                <TableRow key={index}>
                                    <TableCell>{emp.name}</TableCell>
                                    <TableCell>{emp.email}</TableCell>
                                    <TableCell>{emp.phone}</TableCell>
                                    <TableCell>{emp.department}</TableCell>
                                    <TableCell>{emp.gender}</TableCell>
                                    <TableCell>{emp.title}</TableCell>
                                    <TableCell>{emp.manager}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
