import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toast } from "sonner";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import {
  FaUserCircle,
  FaUsers,
  FaCalendarCheck,
  FaMoneyCheckAlt,
  FaCog,
} from "react-icons/fa";

function EmployeeForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, err } = useSelector((state) => state.employees);
  console.log(err);

  const { activeMainTab, employee } = router.query;
  const [activePage, setActivePage] = useState("Employees");
  const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
  const [employeeId, setEmployeeId] = useState(null);
  const [selectedTab, setSelectedTab] = useState(activeMainTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

    const validatePhone = (phone) => {
      const regex = /^[0-9]{10}$/;
      return regex.test(phone);
    };

    if (!employeeData.name || !employeeData.phone) {
      toast.error("Name and Phone are required fields.");
      setLoading(false);
      return;
    }

    if (!validatePhone(employeeData.phone)) {
      toast.error("Invalid phone number.");
      setLoading(false);
      return;
    }

    try {
      const filteredData = JSON.parse(
        JSON.stringify(employeeData, (key, value) =>
          value === "" ? null : value
        )
      );

      if (employeeId) {
        await dispatch(
          updateEmployee({ id: employeeId, updatedData: filteredData })
        ).unwrap();
        toast.success("Employee updated successfully");
      } else {
        await dispatch(createEmployee(filteredData)).unwrap();
        toast.success("Employee created successfully");
      }
      router.push("/hradmin/employees");
    } catch (err) {
      toast.error(err);
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

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle the file upload logic here
      console.log("Uploaded file:", file);
    }
  };

  return (
    <div className="bg-white text-black min-h-screen p-6">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-10 py-4 flex justify-between items-start z-50 border-b border-gray-300">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">
          MEDHIR
        </h1>
        <nav className="flex flex-grow justify-center space-x-20 text-xl font-medium">
          {["Employees", "Attendance", "Payroll", "Settings"].map(
            (item, index) => (
              <Link
                key={index}
                href={`/hradmin/${item.toLowerCase()}`}
                passHref
              >
                <button
                  onClick={() => setActivePage(item)}
                  className={`hover:text-[#4876D6] ${
                    activePage === item
                      ? "text-black bg-[#E3ECFB] rounded-md px-2 py-1"
                      : "text-[#6c757d]"
                  }`}
                  style={{
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  {item === "Employees" && (
                    <FaUsers
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item === "Attendance" && (
                    <FaCalendarCheck
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item === "Payroll" && (
                    <FaMoneyCheckAlt
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item === "Settings" && (
                    <FaCog
                      className="inline-block text-black opacity-80"
                      style={{ fontSize: "16px", verticalAlign: "middle" }}
                    />
                  )}
                  {item}
                </button>
              </Link>
            )
          )}
        </nav>
        <div className="relative">
          <button
            className="flex items-center gap-2 text-black font-medium"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaUserCircle className="text-2xl" />
            HR Admin
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button
                className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="h-5" />

      {/* Add New Employee Button */}
      <div className="p-10">
        <div className="mt-2 p-4 rounded-lg flex justify-between items-center">
          <div className="flex items-center">
            <button
              className="px-4 py-2 border border-blue-300 text-blue-800 bg-blue-100 hover:bg-blue-200 rounded-md flex items-center"
              onClick={() =>
                router.push({
                  pathname: "/hradmin/addNewEmployee",
                  query: { activeMainTab: activeMain },
                })
              }
            >
              <UserPlus className="mr-2" size={22} /> Add New Employee
            </button>
          </div>
        </div>

        {/* Sub Navbar (Aligned with Employee Name) */}
        <div className="p-3 rounded-lg mt-4 flex justify-between text-lg mx-auto bg-gray-50 border border-gray-200">
          {mainTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => {
                handleTabClick(tab);
                setActiveMain(tab);
              }}
              className={`ml-10 mr-10 ${
                activeMain === tab
                  ? "text-gray-800 font-bold"
                  : "text-gray-600 font-medium"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleEmployeeSubmit}>
        {/* Employee Card */}
        <Card className="p-6 bg-white relative">
          <div className="flex items-center justify-between">
            <input
              name="name"
              className="text-3xl font-bold text-gray-500 border-b-2 border-gray-300 focus:border-black w-[60%] bg-transparent focus:outline-none"
              value={employeeData.name}
              onChange={handleInputChange}
              placeholder="Employee Name"
              onFocus={(e) => (e.target.style.color = "black")}
              required
            />
            <div className="absolute top-6 right-6">
              <input
                type="file"
                accept="image/*"
                id="photo-upload"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <label
                htmlFor="photo-upload"
                className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Upload Photo
              </label>
            </div>
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
                  required={key === "name" || key === "phone"}
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
        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="submit"
            className="bg-gradient-to-r from-[#E3ECFB] to-[#B0D4FF] text-[#2458B4] hover:from-[#C7DBFA] hover:to-[#98C3F5] font-semibold px-4 py-2 rounded-md transition"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : employeeId
              ? "Update Employee"
              : "Add Employee"}
          </Button>
          <Button
            type="button"
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
            onClick={() => router.push("/hradmin/employees")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default withAuth(EmployeeForm);
