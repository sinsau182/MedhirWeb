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
  FaArrowAltCircleUp,
} from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

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

  const handleFileUpload = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      console.log(`Uploaded file for ${key}:`, file);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <HradminNavbar />

        <div className="p-4 pt-24">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800 ml-2">New Employee</h1>
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
            {/* <div className="absolute top-6 right-6">
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
            </div> */}
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
          <div className="relative mt-6 flex items-center border-b-2 border-gray-400">
  {subTabs.map((tab, index) => (
    <button
      key={tab}
      type="button"
      className={`relative px-6 py-2 font-semibold transition-all duration-300 border rounded-t-md ${
        selectedTab === tab ||
        (selectedTab === "Basic" && tab === "ID Proofs")
          ? "bg-gray-300 border-b-2 border-gray-400 text-black"
          : "text-black hover:bg-gray-200"
      }`}
      onClick={(e) => {
        e.preventDefault();
        setSelectedTab(tab);
      }}
    >
      {tab}
    </button>
  ))}
</div>


          {/* Tab Content */}
          <div className="mt-4 grid grid-cols-2 gap-6">
            {/* ID Proofs Section */}
                  {(selectedTab === "ID Proofs" || selectedTab === "Basic") &&
                   [
                    { label: "Aadhar No.", key: "aadharNo" },
                    { label: "PAN No.", key: "panNo" },
                    { label: "Passport", key: "passport" },
                    { label: "Driving License", key: "drivingLicense" },
                    { label: "Voter ID", key: "voterId" },
                  ].map(({ label, key }, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <label className="text-gray-600 text-sm min-w-[150px] capitalize">
                        {label}
                      </label>
                      <input
                      className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                      value={employeeData.idProofs[key] || ""}
                      onChange={(e) =>
                        handleNestedInputChange(e, "idProofs", key)
                      }
                      />
                      <div>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        id={`upload-${key}`}
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, key)}
                      />
                      <label
                        htmlFor={`upload-${key}`}
                        className="cursor-pointer text-gray-500 hover:text-blue-600 transition"
                      >
                        <FaArrowAltCircleUp size={20} />
                      </label>
                      </div>
                    </div>
                    ))}
                  {selectedTab === "Salary Details" &&
                    [
                      { label: "Total CTC", key: "totalCtc" },
                      { label: "Basic", key: "basic" },
                      { label: "Allowances", key: "allowances" },
                      { label: "HRA", key: "hra" },
                      { label: "PF", key: "pf" },
                    ].map(({ label, key }, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <label className="text-gray-600 text-sm min-w-[150px] capitalize">
                          {label}
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
                    [
                      { label: "Account Number", key: "accountNumber" },
                      { label: "Account Holder Name", key: "accountHolderName" },
                      { label: "IFSC", key: "ifscCode" },
                      { label: "Bank Name", key: "bankName" },
                      { label: "Branch Name", key: "branchName" },
                    ].map(({ label, key }, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <label className="text-gray-600 text-sm min-w-[150px] capitalize">
                          {label}
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
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
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
      </div>
    </div>
  );
}

export default withAuth(EmployeeForm);
