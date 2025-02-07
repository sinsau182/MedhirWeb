import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import Link from "next/link";
import { createEmployee } from "@/utils/api";

export default function EmployeeForm() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Employee");
  const [selectedTab, setSelectedTab] = useState("ID Proofs");

  const [employeeData, setEmployeeData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    gender: "",
    title: "",
    reportingManager: "",
    permanentAddress: "",
    currentAddress: "",
    idProofs: {
      aadharNo: "",
      panNo: "",
      passport: "",
      drivingLicense: "",
      voterId: ""
    },
    bankDetails: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: ""
    },
    salaryDetails: {
      totalCtc: "",
      basic: "",
      allowances: "",
      hra: "",
      pf: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleEmployeeSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Remove empty fields before submitting
      const filteredData = JSON.parse(JSON.stringify(employeeData, (key, value) => {
        return value === "" ? undefined : value;
      }));

      const response = await createEmployee(filteredData);
      setSuccess(response.message);
      setEmployeeData({
        name: "",
        email: "",
        phone: "",
        department: "",
        gender: "",
        title: "",
        reportingManager: "",
        permanentAddress: "",
        currentAddress: "",
        idProofs: {
          aadharNo: "",
          panNo: "",
          passport: "",
          drivingLicense: "",
          voterId: ""
        },
        bankDetails: {
          accountNumber: "",
          accountHolderName: "",
          ifscCode: "",
          bankName: "",
          branchName: ""
        },
        salaryDetails: {
          totalCtc: "",
          basic: "",
          allowances: "",
          hra: "",
          pf: ""
        }
      });
    } catch (error) {
      setError(error.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const mainTabs = ["Basic", "ID Proofs", "Salary", "Bank Details", "Leaves Policy"];
  const subTabs = ["ID Proofs", "Bank Details", "Salary Details", "Leaves & Policies"];

  return (
    <div className="p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-gray-100 shadow-md px-10 py-4 flex justify-between items-start z-50">
        <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
        <nav className="flex flex-grow justify-center space-x-24 text-xl font-medium">
          {["Employees", "Attendance", "Payroll", "Settings"].map((item, index) => (
            <Link key={index} href={`/hradmin/${item.toLowerCase()}`} passHref>
              <button
                onClick={() => setActiveTab(item)}
                className={`hover:text-blue-600 ${
                  activeTab === item ? "text-blue-600 font-bold" : "text-black"
                }`}
              >
                {item}
              </button>
            </Link>
          ))}
        </nav>
        <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
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

        {/* Sub Navbar (Aligned with Employee Name) */}
        <div className="bg-gray-300 p-3 rounded-md mt-4 flex justify-between text-lg shadow-md w-full items-center">
          {mainTabs.map((tab, index) => (
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

      {/* Employee Card */}
      <Card className="p-6 bg-gray-100 shadow-lg rounded-xl mt-0 flex flex-col justify-start">
        <div className="flex items-center justify-between">
          <input
            className="text-3xl font-bold text-gray-500 border-b-2 border-gray-300 focus:border-black w-[60%] bg-transparent focus:outline-none"
            onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
            placeholder="Employee Name"
            onFocus={(e) => (e.target.style.color = "black")}
          />
        </div>

        <div className="mt-2">
          <input
            className="w-[30%] bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none text-gray-400"
            placeholder="Job Title"
          />
        </div>

{/* Employee Fields */}
<div className="grid grid-cols-2 gap-6 mt-6">
  {[
    { label: "Email", key: "email" },
    { label: "Reporting Manager", key: "reportingManager" },
    { label: "Phone", key: "phone" },
    { label: "Permanent Address", key: "permanentAddress" },
    { label: "Gender", key: "gender" },
    { label: "Current Address", key: "currentAddress" },
    { label: "Department", key: "department" },
  ].map(({ label, key }, index) => (
    <div key={index} className="flex items-center space-x-0">
      <label className="text-gray-600 text-sm min-w-[150px]">{label}</label>
      <input
        className="w-[60%] bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
        onChange={(e) => setEmployeeData({ ...employeeData, [key]: e.target.value })}
      />
    </div>
  ))}
</div>


        {/* Tabs */}
        <div className="relative mt-6 flex space-x-0 before:absolute before:bottom-0 before:left-0 before:w-10 before:border-b-2 before:border-gray-400 after:bottom-0 after:left-50 after:w-[56%] after:border-b-2 after:border-gray-400">
          {subTabs.map((tab) => (
            <button
              key={tab}
              className={`p-2 ml-10 px-4 font-bold border border-black transition-all duration-300 ${
                selectedTab === tab
                  ? "border-b-0 bg-gray-300 text-black"
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
              {["Aadhar No.", "PAN No.", "Driving License", "Voter ID", "Passport"].map((label, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <label className="text-gray-600 text-sm min-w-[150px]">{label}</label>
                  <input className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    onChange={(e) => setEmployeeData({ ...employeeData, idProofs: { ...employeeData.idProofs, [label.toLowerCase()]: e.target.value } })}
                  />
                </div>
              ))}
            </>
          )}
          {selectedTab === "Bank Details" && (
            <>
              {["Account Holder Name", "Bank Name", "Account No.", "IFSC Code", "Branch Name"].map(
                (label, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <label className="text-gray-600 text-sm min-w-[150px]">{label}</label>
                    <input className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                      onChange={(e) => setEmployeeData({ ...employeeData, bankDetails: { ...employeeData.bankDetails, [label.toLowerCase().replace(/\s/g, "")]: e.target.value } })}
                    />
                  </div>
                )
              )}
            </>
          )}
          {selectedTab === "Salary Details" && (
            <>
              {["Total CTC", "Basic", "Allowances", "HRA", "PF"].map((label, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <label className="text-gray-600 text-sm min-w-[150px]">{label}</label>
                  <input className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    onChange={(e) => setEmployeeData({ ...employeeData, salaryDetails: { ...employeeData.salaryDetails, [label.toLowerCase()]: e.target.value } })}
                  />
                </div>
              )
              )}
            </>

          )}
        </div>
      </Card>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-500 text-white"
          onClick={handleEmployeeSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit"}
        </Button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <Button
          className="bg-red-600 hover:bg-red-500 text-white ml-4"
          onClick={() => router.push("/hradmin/employees")}
        > Cancel </Button>

      </div>
    </div>
  );
}