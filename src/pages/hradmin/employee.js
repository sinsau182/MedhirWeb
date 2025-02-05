import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { motion } from "framer-motion";

export default function HradminCompanies() {
    const [isEmployeeNavOpen, setIsEmployeeNavOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("Basic");
    const [employees] = useState([  
        { name: "John Doe", email: "john@example.com", phone: "1234567890", department: "HR", gender: "Male", title: "Manager", manager: "Jane Smith" },
        { name: "Alice Brown", email: "alice@example.com", phone: "9876543210", department: "Finance", gender: "Female", title: "Analyst", manager: "Bob Johnson" }
    ]);

    return (
        <div className="bg-white text-black min-h-screen">
            <header className="fixed top-0 left-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-center z-50">
                <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
                <nav className="flex space-x-24 text-xl font-medium">
                    <button onClick={() => setIsEmployeeNavOpen(!isEmployeeNavOpen)} className="text-black hover:text-gray-600">Employees</button>
                    <a href="/hradmin/attendance" className="text-black hover:text-gray-600">Attendance</a>
                    <a href="/hradmin/payroll" className="text-black hover:text-gray-600">Payroll</a>
                    <a href="/hradmin/settings" className="text-black hover:text-gray-600">Settings</a>
                </nav>
                <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
            </header>
            <div className="h-10" />
            <div className="p-10">
                <div className="mt-2 p-4 rounded-lg bg-gray-200 flex justify-between items-center">
                    <Button className="bg-blue-600 hover:bg-blue-500 text-white flex items-center">
                        <UserPlus className="mr-2" size={20} /> Add New Employee
                    </Button>
                    <div className="relative w-1/3">
                        <Input placeholder="Search" className="w-full bg-gray-100 text-black border border-gray-300 pr-10 text-lg" />
                        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={24} />
                    </div>
                </div>
                {isEmployeeNavOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-gray-300 p-4 w-full rounded-md mt-4 flex space-x-6 text-lg shadow-md"
                    >
                        <button onClick={() => setActiveTab("Basic")} className={`${activeTab === "Basic" ? "font-bold" : ""}`}>Basic</button>
                        <button onClick={() => setActiveTab("ID Proofs")} className={`${activeTab === "ID Proofs" ? "font-bold" : ""}`}>ID Proofs</button>
                        <button onClick={() => setActiveTab("Salary")} className={`${activeTab === "Salary" ? "font-bold" : ""}`}>Salary</button>
                        <button onClick={() => setActiveTab("Bank Details")} className={`${activeTab === "Bank Details" ? "font-bold" : ""}`}>Bank Details</button>
                        <button onClick={() => setActiveTab("Leaves Policy")} className={`${activeTab === "Leaves Policy" ? "font-bold" : ""}`}>Leaves Policy</button>
                    </motion.div>
                )}
                {activeTab === "Basic" && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-6 bg-gradient-to-b from-gray-200 to-gray-300 p-4 shadow-md rounded-lg"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Gender</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Reporting Manager</TableHead>
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
                    </motion.div>
                )}
            </div>
        </div>
    );
}