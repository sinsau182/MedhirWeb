import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
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
  const [selectedTab, setSelectedTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewModal, setPreviewModal] = useState({ show: false });

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const [employeeData, setEmployeeData] = useState({
    employeeId: "",
    name: "",
    fatherName: "",
    email: {
      official: "",
      personal: ""
    },
    phone: "",
    department: "",
    gender: "",
    designation: "",
    dateOfJoining: "",
    reportingManager: "",
    permanentAddress: "",
    currentAddress: "",
    pfDetails: {
      isEnrolled: true,
      uanNumber: ""
    },
    esicDetails: {
      isEnrolled: false,
      esicNumber: ""
    },
    overtimeEligible: false,
    weeklyOff: [],
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
            {/* Tabs */}
            <div className="flex items-center gap-3">
              {subTabs.map((tab, index) => (
                <button
                  key={tab}
                  type="button"
                  className={`px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm
                    ${selectedTab === tab
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTab(selectedTab === tab ? null : tab);
                  }}
                >
                  {tab === "ID Proofs" && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7h3a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2h3m3-3h3a2 2 0 012 2v3M9 7h3m6 3v2m0 4v2m0-8h.01M9 17h.01" />
                    </svg>
                  )}
                  {tab === "Salary Details" && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {tab === "Bank Details" && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                  {tab === "Leaves & Policies" && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  )}
                  <span className="font-medium">{tab}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-4">
            <input
              name="designation"
              className="w-[30%] bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-black focus:outline-none text-gray-400"
              placeholder="Designation"
              onChange={handleInputChange}
              value={employeeData.designation}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="overtimeEligible"
                checked={employeeData.overtimeEligible}
                onChange={(e) => setEmployeeData(prev => ({
                  ...prev,
                  overtimeEligible: e.target.checked
                }))}
                className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="overtimeEligible" className="ml-2 text-sm text-gray-600">
                Overtime Eligible
              </label>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {/* ID Proofs Section */}
            {selectedTab === "ID Proofs" && (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Identity Documents</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: "Aadhar No.", key: "aadharNo" },
                    { label: "PAN No.", key: "panNo" },
                    { label: "Passport", key: "passport" },
                    { label: "Driving License", key: "drivingLicense" },
                    { label: "Voter ID", key: "voterId" },
                  ].map(({ label, key }, index) => (
                    <div key={index} className="flex items-center">
                      <label className="text-gray-600 text-sm font-medium min-w-[180px]">
                        {label}
                      </label>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1"
                          value={employeeData.idProofs[key] || ""}
                          onChange={(e) => handleNestedInputChange(e, "idProofs", key)}
                        />
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          id={`upload-${key}`}
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, key)}
                        />
                        <label
                          htmlFor={`upload-${key}`}
                          className="cursor-pointer text-gray-400 hover:text-blue-500 transition-colors relative group"
                        >
                          <FaArrowAltCircleUp size={18} />
                          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                            Upload {label}
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Salary Details Section */}
            {selectedTab === "Salary Details" && (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Compensation Details</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: "Basic", key: "totalCtc" },
                    { label: "HRA", key: "basic" },
                    { label: "PF", key: "hra" },
                    { label: "Allowances", key: "allowances" },
                  ].map(({ label, key }, index) => (
                    <div key={index} className="flex items-center">
                      <label className="text-gray-600 text-sm font-medium min-w-[180px]">
                        {label}
                      </label>
                      <input
                        type="number"
                        className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1"
                        value={employeeData.salaryDetails[key] || ""}
                        onChange={(e) => {
                          handleNestedInputChange(e, "salaryDetails", key);
                          // Calculate Total CTC
                          const values = {
                            ...employeeData.salaryDetails,
                            [key]: e.target.value
                          };
                          const total = (
                            parseFloat(values.totalCtc || 0) +
                            parseFloat(values.basic || 0) +
                            parseFloat(values.hra || 0) +
                            parseFloat(values.allowances || 0)
                          );
                          setEmployeeData(prev => ({
                            ...prev,
                            salaryDetails: {
                              ...prev.salaryDetails,
                              pf: total.toFixed(2)
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end">
                  <div>
                    <label className="text-gray-800 text-sm font-semibold block mb-2">
                      Total CTC
                    </label>
                    <input
                      className="w-48 bg-gray-50 border-b-2 border-blue-500 focus:border-blue-600 focus:outline-none text-gray-700 font-bold text-lg py-1"
                      value={employeeData.salaryDetails.pf || "0"}
                      readOnly
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details Section */}
            {selectedTab === "Bank Details" && (
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Banking Information</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    { label: "Account Number", key: "accountNumber" },
                    { label: "Account Holder Name", key: "accountHolderName" },
                    { label: "IFSC", key: "ifscCode" },
                    { label: "Bank Name", key: "bankName" },
                    { label: "Branch Name", key: "branchName" },
                  ].map(({ label, key }, index) => (
                    <div key={index} className="flex items-center">
                      <label className="text-gray-600 text-sm font-medium min-w-[180px]">
                        {label}
                      </label>
                      <input
                        className="flex-1 bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1"
                        value={employeeData.bankDetails[key] || ""}
                        onChange={(e) => handleNestedInputChange(e, "bankDetails", key)}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <div className="flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="passbook-upload"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'passbook')}
                    />
                    <label
                      htmlFor="passbook-upload"
                      className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
                    >
                      <FaArrowAltCircleUp size={16} />
                      Upload Passbook Photo
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Basic Details Section - Only show when no tab is selected */}
          {!selectedTab && (
            <>
              {/* Three Column Layout */}
              <div className="grid grid-cols-3 gap-6 mt-6">
                {/* First Column */}
                <div className="space-y-4">
                  {[
                    { label: "Father's Name", key: "fatherName" },
                    { label: "Gender", key: "gender" },
                  ].map(({ label, key, type }, index) => (
                    <div key={index} className="flex items-center space-x-0">
                      <label className="text-gray-600 text-sm min-w-[120px]">
                        {label}
                      </label>
                      <input
                        type={type || "text"}
                        name={key}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                        value={key.includes('.')
                          ? employeeData[key.split('.')[0]][key.split('.')[1]]
                          : employeeData[key]}
                        onChange={(e) => {
                          if (key.includes('.')) {
                            const [section, field] = key.split('.');
                            handleNestedInputChange(e, section, field);
                          } else {
                            handleInputChange(e);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Second Column */}
                <div className="space-y-4">
                  {[
                    { label: "Department", key: "department" },
                    { label: "Date of Joining", key: "dateOfJoining", type: "date" },
                    { label: "Reporting Manager", key: "reportingManager" },
                  ].map(({ label, key, type }, index) => (
                    <div key={index} className="flex items-center space-x-0">
                      <label className="text-gray-600 text-sm min-w-[120px]">
                        {label}
                      </label>
                      <input
                        type={type || "text"}
                        name={key}
                        className="w-full bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                        value={key.includes('.')
                          ? employeeData[key.split('.')[0]][key.split('.')[1]]
                          : employeeData[key]}
                        onChange={(e) => {
                          if (key.includes('.')) {
                            const [section, field] = key.split('.');
                            handleNestedInputChange(e, section, field);
                          } else {
                            handleInputChange(e);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Third Column - Additional Details */}
                <div className="space-y-4">
                  {/* PF Details */}
                  <div className="flex items-center">
                    <div className="w-[150px] flex items-center">
                      <input
                        type="checkbox"
                        id="pfEnrolled"
                        checked={employeeData.pfDetails.isEnrolled}
                        onChange={(e) =>
                          handleNestedInputChange(
                            { target: { value: e.target.checked } },
                            "pfDetails",
                            "isEnrolled"
                          )
                        }
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="pfEnrolled" className="ml-2 text-sm text-gray-600">
                        PF Enrolled
                      </label>
                    </div>
                    <input
                      className={`flex-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 ${
                        !employeeData.pfDetails.isEnrolled ? 'opacity-50' : ''
                      }`}
                      value={employeeData.pfDetails.uanNumber || ""}
                      onChange={(e) => handleNestedInputChange(e, "pfDetails", "uanNumber")}
                      disabled={!employeeData.pfDetails.isEnrolled}
                      placeholder="UAN"
                    />
                  </div>

                  {/* ESIC Details */}
                  <div className="flex items-center">
                    <div className="w-[150px] flex items-center">
                      <input
                        type="checkbox"
                        id="esicEnrolled"
                        checked={employeeData.esicDetails.isEnrolled}
                        onChange={(e) =>
                          handleNestedInputChange(
                            { target: { value: e.target.checked } },
                            "esicDetails",
                            "isEnrolled"
                          )
                        }
                        className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="esicEnrolled" className="ml-2 text-sm text-gray-600">
                        ESIC Enrolled
                      </label>
                    </div>
                    <input
                      className={`flex-1 bg-transparent border-b border-gray-200 focus:border-blue-500 focus:outline-none text-gray-700 ${
                        !employeeData.esicDetails.isEnrolled ? 'opacity-50' : ''
                      }`}
                      value={employeeData.esicDetails.esicNumber || ""}
                      onChange={(e) => handleNestedInputChange(e, "esicDetails", "esicNumber")}
                      disabled={!employeeData.esicDetails.isEnrolled}
                      placeholder="ESIC No."
                    />
                  </div>

                  {/* Weekly Off */}
                  <div className="flex items-center">
                    <div className="w-[150px]">
                      <label className="text-sm text-gray-600">Weekly Off:</label>
                    </div>
                    <div className="flex-1 relative">
                      <div
                        className="relative cursor-pointer"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      >
                        <input
                          type="text"
                          readOnly
                          value={employeeData.weeklyOff.join(", ")}
                          className="w-full bg-transparent border-b border-gray-300 focus:border-blue-500 focus:outline-none text-gray-700 py-1 pr-8 cursor-pointer"
                          placeholder="Select days"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div
                              key={day}
                              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                                employeeData.weeklyOff.includes(day) ? 'bg-blue-50 text-blue-600' : ''
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                const newWeeklyOff = employeeData.weeklyOff.includes(day)
                                  ? employeeData.weeklyOff.filter(d => d !== day)
                                  : [...employeeData.weeklyOff, day];
                                setEmployeeData(prev => ({
                                  ...prev,
                                  weeklyOff: newWeeklyOff
                                }));
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span>{day}</span>
                                {employeeData.weeklyOff.includes(day) && (
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Line */}
              <div className="border-t border-gray-300 my-4 -mx-6"></div>

              {/* Vertical Layout for Additional Fields */}
              <div className="space-y-4 mt-6">
                {/* Phone Numbers in horizontal layout */}
                <div className="flex items-center gap-6">
                  <div className="flex-1 flex items-center">
                    <label className="text-gray-600 text-sm min-w-[150px]">Phone 1</label>
                    <input
                      type="tel"
                      name="phone"
                      className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                      value={employeeData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="flex-1 flex items-center">
                    <label className="text-gray-600 text-sm min-w-[150px]">Phone 2</label>
                    <input
                      type="tel"
                      name="phone2"
                      className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                      value={employeeData.phone2}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                {/* Email addresses in horizontal layout */}
                <div className="flex items-center gap-6">
                  <div className="flex-1 flex items-center">
                    <label className="text-gray-600 text-sm min-w-[150px]">Email Personal</label>
                    <input
                      type="email"
                      name="email.personal"
                      className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                      value={employeeData.email.personal}
                      onChange={(e) => handleNestedInputChange(e, "email", "personal")}
                    />
                  </div>
                  <div className="flex-1 flex items-center">
                    <label className="text-gray-600 text-sm min-w-[150px]">Email Official</label>
                    <input
                      type="email"
                      name="email.official"
                      className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                      value={employeeData.email.official}
                      onChange={(e) => handleNestedInputChange(e, "email", "official")}
                    />
                  </div>
                </div>

                {/* Addresses */}
                <div className="flex items-center">
                  <label className="text-gray-600 text-sm min-w-[150px]">Current Address</label>
                  <input
                    type="text"
                    name="currentAddress"
                    className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    value={employeeData.currentAddress}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="flex items-center">
                  <label className="text-gray-600 text-sm min-w-[150px]">Permanent Address</label>
                  <input
                    type="text"
                    name="permanentAddress"
                    className="flex-1 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-gray-700"
                    value={employeeData.permanentAddress}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </>
          )}
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

      {/* Preview Modal */}
      {previewModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Preview Employee Details</h2>
              <button onClick={() => setPreviewModal({ show: false })} className="text-gray-500 hover:text-gray-700">
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Preview content */}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(EmployeeForm);