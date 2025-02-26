import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";

export default function EmployeeForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);

  const { activeMainTab, employee } = router.query;
  const [activePage, setActivePage] = useState("Employees");
  const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(activeMainTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

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
      voterId: "",
    },
    bankDetails: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
    },
    salaryDetails: { totalCtc: "", basic: "", allowances: "", hra: "", pf: "" },
  });

  useEffect(() => {
    if (employee) {
      try {
        const parsedEmployee = JSON.parse(employee);
        setEmployeeData((prev) => ({
          ...prev,
          ...parsedEmployee,
          idProofs: { ...prev.idProofs, ...parsedEmployee.idProofs },
          bankDetails: { ...prev.bankDetails, ...parsedEmployee.bankDetails },
          salaryDetails: {
            ...prev.salaryDetails,
            ...parsedEmployee.salaryDetails,
          },
        }));
        setEmployeeId(parsedEmployee.id);
      } catch (error) {
        console.error("Error parsing employee data", error);
      }
    }
  }, [employee]);

  const handleInputChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
  };

  const handleNestedInputChange = (e, section, key) => {
    setEmployeeData({
      ...employeeData,
      [section]: { ...employeeData[section], [key]: e.target.value || "" },
    });
  };

  const handleEmployeeSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const filteredData = JSON.parse(
        JSON.stringify(employeeData, (key, value) =>
          value === "" ? undefined : value
        )
      );

      if (employeeId) {
        await dispatch(
          updateEmployee({ id: employeeId, updatedData: filteredData })
        ).unwrap();
        setSuccess("Employee updated successfully");
      } else {
        await dispatch(createEmployee(filteredData)).unwrap();
        setSuccess("Employee created successfully");
      }
      router.push("/hradmin/employees");
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  const handleTabClick = (tab) => {
    router.push({
      pathname: "/hradmin/employees",
      query: { tab },
    });
  };

  const mainTabs = [
    "Basic",
    "ID Proofs",
    "Salary Details",
    "Bank Details",
    "Leaves Policy",
  ];
  const subTabs = [
    "ID Proofs",
    "Salary Details",
    "Bank Details",
    "Leaves & Policies",
  ];

  useEffect(() => {
    if (activeMainTab) setActiveMain(activeMainTab);
  }, [activeMainTab]);

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
                  onClick={() => setActivePage(item)}
                  className={`hover:text-blue-600 ${
                    activePage === item
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

        {/* Sub Navbar (Aligned with Employee Name) */}
        <div className="bg-gray-300 p-3 rounded-md mt-4 flex justify-between text-lg shadow-md w-full items-center">
          {mainTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => {
                handleTabClick(tab);
                setActiveMain(tab);
              }}
              className={`px-4 py-2 rounded ${
                activeMain === tab ? "text-blue-600 font-bold" : "text-black"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleEmployeeSubmit}>
        {/* Employee Card */}
        <Card className="p-6 bg-gray-100 shadow-lg rounded-xl mt-0 flex flex-col justify-start">
          <div className="flex items-center justify-between">
            <input
              name="name"
              className="text-3xl font-bold text-gray-500 border-b-2 border-gray-300 focus:border-black w-[60%] bg-transparent focus:outline-none"
              value={employeeData.name}
              onChange={handleInputChange}
              placeholder="Employee Name"
              onFocus={(e) => (e.target.style.color = "black")}
            />
          </div>

          <div className="mt-2">
            <input
              name="title"
              className="w-[30%] bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none text-gray-400"
              placeholder="Job Title"
              onChange={handleInputChange}
              value={employeeData.title}
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
                <label className="text-gray-600 text-sm min-w-[150px]">
                  {label}
                </label>
                <input
                  name={key}
                  className="w-[60%] bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                  value={employeeData[key]}
                  onChange={handleInputChange}
                />
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="relative mt-6 flex space-x-0 before:absolute before:bottom-0 before:left-0 before:w-10 before:border-b-2 before:border-gray-400 after:bottom-0 after:left-50 after:w-[56%] after:border-b-2 after:border-gray-400">
            {subTabs.map((tab) => (
              <button
                key={tab}
                type="button" // Prevent form submission
                className={`p-2 ml-10 px-4 font-bold border border-black transition-all duration-300 ${
                  selectedTab === tab ||
                  (selectedTab === "Basic" && tab === "ID Proofs")
                    ? "border-b-0 bg-gray-300 text-black"
                    : "text-black hover:bg-gray-200"
                }`}
                onClick={(e) => {
                  e.preventDefault(); // Prevent unintended form submission
                  setSelectedTab(tab);
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mt-4 grid grid-cols-2 gap-6">
            {(selectedTab === "ID Proofs" || selectedTab === "Basic") &&
              Object.keys(employeeData.idProofs).map((key) => (
                <div key={key} className="flex items-center space-x-4">
                  <label className="text-gray-600 text-sm min-w-[150px] capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    value={employeeData.idProofs[key] || ""}
                    onChange={(e) =>
                      handleNestedInputChange(e, "idProofs", key)
                    }
                  />
                </div>
              ))}
            {selectedTab === "Salary Details" &&
              Object.keys(employeeData.salaryDetails).map((key) => (
                <div key={key} className="flex items-center space-x-4">
                  <label className="text-gray-600 text-sm min-w-[150px] capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    value={employeeData.salaryDetails[key] || ""}
                    onChange={(e) =>
                      handleNestedInputChange(e, "salaryDetails", key)
                    }
                  />
                </div>
              ))}
            {selectedTab === "Bank Details" &&
              Object.keys(employeeData.bankDetails).map((key) => (
                <div key={key} className="flex items-center space-x-4">
                  <label className="text-gray-600 text-sm min-w-[150px] capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </label>
                  <input
                    className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    value={employeeData.bankDetails[key] || ""}
                    onChange={(e) =>
                      handleNestedInputChange(e, "bankDetails", key)
                    }
                  />
                </div>
              ))}
          </div>
        </Card>

        {/* Submit Button */}
        <div className="mt-6 flex justify-end">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : employeeId
              ? "Update Employee"
              : "Add Employee"}
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-500 text-white ml-4"
            onClick={() => router.push("/hradmin/employees")}
          >
            Cancel
          </Button>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
        </div>
      </form>
    </div>
  );
}
