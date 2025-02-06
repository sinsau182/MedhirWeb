import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";

export default function EmployeeForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Employee");
  const [selectedTab, setSelectedTab] = useState("ID Proofs");
  const [employeeName, setEmployeeName] = useState("");
  const tabs = [
    "ID Proofs",
    "Bank Details",
    "Salary Details",
    "Leaves & Policies",
  ];

  return (
    <div className="p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
        <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-24 text-xl font-medium">
          {["Employees", "Attendance", "Payroll", "Settings"].map(
            (item, index) => (
              <Link
                key={index}
                href={`/hradmin/${item.toLowerCase()}`}
                passHref
              >
                <button
                  onClick={() => setActiveTab(item)}
                  className={`hover:text-blue-600 ${
                    activeTab === item
                      ? "text-blue-600 font-bold"
                      : "text-black"
                  }`}
                >
                  {item}
                </button>
              </Link>
            )
          )}
        </nav>
        <Button className="bg-green-600 hover:bg-green-500 text-white">
          Logout
        </Button>
      </header>

      <div className="h-5" />

      {/* Search Box */}
      <div className="p-10">
        <div className="mt-2 p-4 rounded-lg bg-gray-200 flex justify-between items-center">
          <Button
            className="bg-blue-600 hover:bg-blue-500 text-white flex items-center"
            onClick={() => router.push("/hradmin/addNewEmployee")}
          >
            <UserPlus className="mr-2" size={20} /> Add New Employee
          </Button>
          <div className="flex w-screen justify-center">
            <div className="relative w-[60%]">
              <Input
                placeholder="Search"
                className="w-full bg-gray-100 text-black border border-gray-300 pr-10 text-lg"
              />
              <Search
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Sub Navbar */}
        <div className="bg-gray-300 p-3 rounded-md mt-4 flex justify-between text-lg shadow-md mx-auto">
          {[
            "Basic",
            "ID Proofs",
            "Salary",
            "Bank Details",
            "Leaves Policy",
          ].map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(tab)}
              className={`ml-10 mr-10 hover:text-blue-600 ${
                activeTab === tab ? "text-blue-600 font-bold" : "text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-gray-100 shadow-lg rounded-xl">
        {/* Employee Name & Details */}
        <div className="pb-4 mb-4">
          <input
            className="text-3xl font-bold text-gray-500 border-b-2 border-gray-300 focus:border-black w-[60%] bg-transparent focus:outline-none"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee Name"
            onFocus={(e) => (e.target.style.color = "black")}
          />
          <div className="mt-2">
            <input
              className="w-[30%] bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none text-gray-400"
              placeholder="Job Title"
            />
          </div>
        </div>

        {/* Employee Fields */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <input
              placeholder="Email"
              className="w-full bg-transparent border-b focus:outline-none"
            />
          </div>
          <div>
            <input
              placeholder="Department"
              className="w-full bg-transparent border-b focus:outline-none"
            />
          </div>
          <div>
            <input
              placeholder="Phone No"
              className="w-full bg-transparent border-b focus:outline-none"
            />
          </div>
          <div>
            <input
              placeholder="Gender"
              className="w-full bg-transparent border-b focus:outline-none"
            />
          </div>
          <div>
            <input
              placeholder="Reporting Manager"
              className="w-full bg-transparent border-b focus:outline-none"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="relative mt-6 flex space-x-0 before:absolute before:bottom-0 before:left-0 before:w-[3%] before:border-b-2 before:border-gray-400 after:absolute after:bottom-0 after:left-[41.5%] after:w-[60%] after:border-b-2 after:border-gray-400">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`p-2 ml-10 px-4 font-bold border border-black transition-all duration-300 ${
                selectedTab === tab
                  ? "border-b-0 bg-gray-300 text-black "
                  : "text-black hover:bg-gray-200"
              }`}
              onClick={() => setSelectedTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4 grid grid-cols-2 gap-6">
          {selectedTab === "ID Proofs" && (
            <>
              <div>
                <input
                  placeholder="Aadhar No."
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Driving License"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="PAN No."
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Voter ID"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Passport"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
            </>
          )}
          {selectedTab === "Bank Details" && (
            <>
              <div>
                <input
                  placeholder="Account Holder Name"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Bank Name"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Account No."
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="IFSC Code"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Branch Name"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
            </>
          )}
          {selectedTab === "Salary Details" && (
            <>
              <div>
                <input
                  placeholder="Total Ctc"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Basic"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="Allowances"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="HRA"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
              <div>
                <input
                  placeholder="PF"
                  className="w-full bg-transparent border-b focus:outline-none"
                />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
