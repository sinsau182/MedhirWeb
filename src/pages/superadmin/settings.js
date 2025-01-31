import { useState } from "react";
import { Button } from "@/components/ui/button";
import SuperadminNavbar from "@/components/SuperadminNavbar";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Edit, Search, Trash, UserPlus } from "lucide-react";


export default function SuperadminSettings() {
  return (
    <div className="bg-white text-black min-h-screen">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full bg-gray-100 shadow-md px-8 py-4 flex justify-between items-center z-50">
        <div className="flex flex-row items-baseline space-x-20">
          <h1 className="text-2xl font-bold text-gray-900">MEDHIR</h1>
          <h2 className="text-lg font-normal text-gray-700">Welcome, SuperAdmin</h2>
        </div>
        <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
      </header>
      
      {/* Spacer to prevent content from being hidden behind the fixed header */}
      <div className="h-16" />

      {/* Main Content */}
      <div className="p-8">

        {/* Use the navbar here */}
        <SuperadminNavbar /> {/* Navbar imported and used here */}

        <div className="mt-6 p-4 rounded-lg">
                <div className="mt-4 bg-gray-200 p-4 rounded-lg flex justify-between items-center">
                  <div className="relative w-1/3">
                  <Input placeholder="Search" className="w-full bg-gray-100 text-black border border-gray-300 pr-10" />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  </div>
                  <div className="flex space-x-10 mr-16">
                    <div className="flex flex-col items-center cursor-pointer">
                      <UserPlus size={32} className="text-black p-1 rounded-md"/>
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
              </div>

      </div>
    </div>
  );
}
