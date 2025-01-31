import { useState } from "react";
import { Button } from "@/components/ui/button";
import SuperadminNavbar from "@/components/SuperadminNavbar";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Edit, Search, Trash, UserPlus } from "lucide-react";

export default function SuperadminModules() {
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [newUser, setNewUser] = useState("")
  
  const users = ["Ajay Kumar", "Jayesh Singh", "Amit Kumar"];
  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  const handleOpenAddModule = () => {
    setSelectedUser("");
    setIsAddModuleOpen(true);
  };

  return (
    <div className="bg-white text-black min-h-screen">
      <header className="fixed top-0 left-0 w-full bg-gray-100 shadow-md px-8 py-4 flex justify-between items-center z-50">
        <div className="flex flex-row items-baseline space-x-20">
          <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
          <h2 className="text-lg font-normal text-gray-700">Welcome, SuperAdmin</h2>
        </div>
        <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
      </header>
      <div className="h-16" />
      <div className="p-8">
        <SuperadminNavbar />
        <div className="mt-6 p-4 rounded-lg">
          <div className="mt-4 bg-gray-200 p-4 rounded-lg flex justify-between items-center">
            <div className="relative w-1/3">
            <Input placeholder="Search" className="w-full bg-gray-100 text-black border border-gray-300 pr-10" />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            </div>
            <div className="flex space-x-10 mr-16">
              <div className="flex flex-col items-center cursor-pointer">
                <UserPlus size={32} className="text-black p-1 rounded-md" onClick={handleOpenAddModule} />
                <span className="text-xs text-black">Add</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer">
                <Edit size={32} className="text-black p-1 rounded-md" />
                <span className="text-xs text-black">Edit</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer">
                <Trash size={32} className="text-black p-1 rounded-md" />
                <span className="text-xs text-black">Delete</span>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-gray-300 p-2 rounded-lg">
            <ClientOnlyTable>
              <Table>
              <TableHead>
                    <TableHeader>Name</TableHeader>
                </TableHead>
                <TableHead>
                    <TableHeader>Description</TableHeader>
                </TableHead>
                <TableHead>
                    <TableHeader>Admin</TableHeader>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>HR</TableCell>
                    <TableCell>For Handling leaves, attendance</TableCell>
                    <TableCell>Ajay Kumar</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Accounting</TableCell>
                    <TableCell>For Handling Payments etc</TableCell>
                    <TableCell>Jayesh Singh</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Sales</TableCell>
                    <TableCell>For Handling total sales, orders</TableCell>
                    <TableCell>Amit Kumar</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </ClientOnlyTable>
          </div>
        </div>
      </div>
      
      {/* Add Module Modal */}
      <Modal isOpen={isAddModuleOpen} onClose={() => setIsAddModuleOpen(false)}>
        <div className="p-4 bg-gray-200 text-black rounded-lg">
          <h2 className="text-lg font-bold">Add Module</h2>
          <Input placeholder="Module Name" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Description" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Select onValueChange={(value) => value === "addUser" ? setIsAddUserOpen(true) : setSelectedUser(value)}>
            <SelectTrigger className="mt-2 bg-gray-100 text-black border border-gray-300">{selectedUser || "Select Admin"}</SelectTrigger>
            <SelectContent>
              {users.map((user, index) => (
                <SelectItem key={index} value={user}>{user}</SelectItem>
              ))}
              <SelectItem value="addUser" className="text-blue-600 font-bold">+ Add User</SelectItem>
            </SelectContent>
          </Select>
          <div className="mt-4 flex space-x-2">
            <Button onClick={() => setIsAddModuleOpen(false)}>Save</Button>
            <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
      
      {/* Add User Modal */}
      <Modal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)}>
        <div className="p-4 bg-gray-200 text-black rounded-lg">
          <h2 className="text-lg font-bold">Add User</h2>
          <Input placeholder="Name" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Email" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Phone" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <div className="mt-4 flex space-x-2">
            <Button onClick={() => setIsAddUserOpen(false)}>Save</Button>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
