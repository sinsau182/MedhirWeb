import { useState } from "react";
import { Button } from "@/components/ui/button";
import SuperadminNavbar from "@/components/SuperadminNavbar";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Edit, Search, Trash, UserPlus } from "lucide-react";
import { fetchUsers, createUser,  } from "@/utils/api";
import Link from "next/link";

export default function SuperadminModules() {
  const [activeTab, setActiveTab] = useState("Modules");
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [newUser, setNewUser] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  const users = ["Ajay Kumar", "Jayesh Singh", "Amit Kumar"];
  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  const handleOpenAddModule = () => {
    setSelectedUser("");
    setIsAddModuleOpen(true);
  };

  const handleAddUser = () => {
    // Assuming validation is done, save the new user
    users.push(newUser);  // Add new user to the list
    setSelectedUser(newUser); // Set as the selected user
    setIsAddUserOpen(false);  // Close the Add User form
  
    // Clear the input fields
    setNewUser("");
    setUserEmail("");
    setUserPhone("");
  };

  return (
    <div className="bg-white text-black min-h-screen">
      <header className="fixed top-0 left-0 right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
                <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
                <nav className="flex flex-grow justify-center space-x-40 text-xl font-medium">
                    {["Companies", "Modules", "Settings"].map((item, index) => (
                        <Link key={index} href={`/superadmin/${item.toLowerCase()}`} passHref>
                            <button
                                onClick={() => setActiveTab(item)}
                                className={`hover:text-blue-600 ${activeTab === item ? "text-blue-600 font-bold" : "text-black"}`}
                            >
                                {item}
                            </button>
                        </Link>
                    ))}
                </nav>
                <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
            </header>
      <div className="h-4" />
      <div className="p-10">
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
              <div className="flex flex-col items-center cursor-pointer opacity-20 pointer-events-none">
                <Edit size={32} className="text-black p-1 rounded-md" />
                <span className="text-xs text-black">Edit</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer opacity-20 pointer-events-none">
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
      <Modal isOpen={isAddModuleOpen} onClose={() => {
        setIsAddModuleOpen(false);
        setIsAddUserOpen(false);
      }}>
        <div className="p-4 bg-gray-200 text-black rounded-lg">
          <h2 className="text-2xl font-bold">Add Module</h2>
          <Input placeholder="Module Name" className="mt-4 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Description" className="mt-4 bg-gray-100 text-black border border-gray-300" />

          {/* Admin Select */}
          <Select 
  onValueChange={(value) => {
    if (value === "addUser") {
      setNewUser("");      // Clear input fields
      setUserEmail("");    
      setUserPhone("");    
      setIsAddUserOpen(true);
    } else {
      setSelectedUser(value);
      setIsAddUserOpen(false);
    }
  }}
>


            <SelectTrigger className="mt-4 bg-gray-100 text-black border border-gray-300">{selectedUser || "Select Admin"}</SelectTrigger>
            <SelectContent>
              {users.map((user, index) => (
                <SelectItem key={index} value={user}>{user}</SelectItem>
              ))}
              <SelectItem value="addUser" className="text-blue-600 font-bold">+ Add User</SelectItem>
            </SelectContent>
          </Select>

          {/* Add User Form */}
          {isAddUserOpen && (
            <div className="mt-4 mx-4">
                <h3 className="text- font-bold">Add User</h3>
              <Input 
                placeholder="Name" 
                className="mt-2 bg-gray-100 text-black border border-gray-300" 
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              />
              <Input 
                placeholder="Email" 
                className="mt-2 bg-gray-100 text-black border border-gray-300" 
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <Input 
                placeholder="Phone" 
                className="mt-2 bg-gray-100 text-black border border-gray-300" 
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
              <div className="mt-4 flex space-x-2">
                <Button onClick={handleAddUser}>Save User</Button>
                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Save and Cancel buttons */}
          {!isAddUserOpen && (
            <div className="mt-4 flex space-x-2">
              <Button onClick={() => setIsAddModuleOpen(false)}>Save</Button>
              <Button variant="outline" onClick={() => setIsAddModuleOpen(false)}>Cancel</Button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
