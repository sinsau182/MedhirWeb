import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function EmployeeForm() {
  const [selectedTab, setSelectedTab] = useState("ID Proofs");
  const [employeeName, setEmployeeName] = useState("");
  const tabs = ["ID Proofs", "Bank Details", "Salary Details", "Leaves & Policies"];

  return (
    <div className="p-6">
      <Card className="p-6 bg-gray-100 shadow-lg rounded-xl">
        {/* Employee Name & Details */}
        <div className="pb-4 mb-4">
          <input
            className="text-3xl font-bold text-gray-500 border-b-2 border-gray-500 focus:border-black w-[60%] bg-transparent focus:outline-none"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="Employee Name"
            onFocus={(e) => (e.target.style.color = 'black')}
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
            <input placeholder="Email" className="w-full bg-transparent border-b focus:outline-none" />
          </div>
          <div>
            <input placeholder="Department" className="w-full bg-transparent border-b focus:outline-none" />
          </div>
          <div>
            <input placeholder="Phone No" className="w-full bg-transparent border-b focus:outline-none" />
          </div>
          <div>
            <input placeholder="Gender" className="w-full bg-transparent border-b focus:outline-none" />
          </div>
          <div>
            <input placeholder="Reporting Manager" className="w-full bg-transparent border-b focus:outline-none" />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`p-2 px-4 font-bold text-black border border-black rounded-md bg-transparent ${selectedTab === tab ? "border-b-0" : ""}`}
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
                <input placeholder="Aadhar No." className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="Driving License" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="PAN No." className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="Voter ID" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="Passport" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
            </>
          )}
          {selectedTab === "Bank Details" && (
            <>
              <div>
                <input placeholder="Account No." className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="Bank Name" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="Account Holder Name" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="IFSC Code" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
              <div>
                <input placeholder="Branch Name" className="w-full bg-transparent border-b focus:outline-none" />
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
