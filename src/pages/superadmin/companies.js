import { useState } from "react";
import { Button } from "@/components/ui/button";
import SuperadminNavbar from "@/components/SuperadminNavbar";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Edit, Search, Trash, UserPlus } from "lucide-react";

export default function SuperadminCompanies() {
    const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);

    const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

    const handleOpenAddCompany = () => {
        setIsAddCompanyOpen(true);
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
                      <UserPlus size={32} className="text-black p-1 rounded-md" onClick={handleOpenAddCompany} />
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
                          <TableHeader>Email</TableHeader>
                      </TableHead>
                      <TableHead>
                          <TableHeader>Phone</TableHeader>
                      </TableHead>
                      <TableHead>
                          <TableHeader>GST</TableHeader>
                      </TableHead>
                      <TableHead>
                          <TableHeader>Register Add.</TableHeader>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Medhir</TableCell>
                          <TableCell>Medhir@gmail.com</TableCell>
                          <TableCell>9891718292</TableCell>
                          <TableCell>GST012</TableCell>
                          <TableCell>Bangalore</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </ClientOnlyTable>
                </div>
              </div>
            </div>


              {/* Add User Modal */}
      <Modal isOpen={isAddCompanyOpen} onClose={() => setIsAddCompanyOpen(false)}>
        <div className="p-4 bg-gray-200 text-black rounded-lg">
          <h2 className="text-lg font-bold">Add Company</h2>
          <Input placeholder="Name" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Email" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Phone" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="GST No." className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <Input placeholder="Register address" className="mt-2 bg-gray-100 text-black border border-gray-300" />
          <div className="mt-4 flex space-x-2">
            <Button onClick={() => setIsAddCompanyOpen(false)}>Save</Button>
            <Button variant="outline" onClick={() => setIsAddCompanyOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
