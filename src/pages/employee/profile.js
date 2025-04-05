import { useState, useEffect, useRef } from "react";
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
import { motion } from "framer-motion";
import {
  FiUser,
  FiBook,
  FiDollarSign,
  FiCreditCard,
  FiShield,
  FiUpload,
  FiSettings,
  FiLogOut,
  FiEdit2,
  FiEye,
  FiLoader,
  FiCheck,
  FiMapPin,
} from "react-icons/fi";
import Select from "react-select";

// Add this CSS class to your global styles or component
const inputGroupClass =
  "relative border border-gray-200 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 bg-gray-50 transition-all duration-200";
const inputClass =
  "w-full px-3 py-2 bg-transparent outline-none text-gray-700 text-sm";
const floatingLabelClass =
  "absolute -top-2.5 left-2 bg-white px-1 text-sm font-medium text-gray-700 transition-all duration-200";

const MultiSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (optionValue) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={floatingLabelClass}>
        {label} <span className="text-red-400">*</span>
      </label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value.length > 0 ? (
              value.map((day) => (
                <span
                  key={day}
                  className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded"
                >
                  {day}
                </span>
              ))
            ) : (
              <span className="text-gray-500">Select days</span>
            )}
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
            {options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value.includes(option) ? "bg-blue-50" : ""
                }`}
                onClick={() => toggleOption(option)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={value.includes(option)}
                    onChange={() => {}}
                    className="w-4 h-4 mr-2 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add this function to generate the next employee ID
const generateEmployeeId = (lastEmployeeId) => {
  if (!lastEmployeeId) return "EMP001";
  const currentNumber = parseInt(lastEmployeeId.slice(3));
  return `EMP${(currentNumber + 1).toString().padStart(3, "0")}`;
};

// Add this helper function before the EmployeeForm component
const removeEmptyValues = (obj) => {
  const cleanObj = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !(value instanceof File)) {
        const nestedClean = removeEmptyValues(value);
        if (Object.keys(nestedClean).length > 0) {
          cleanObj[key] = nestedClean;
        }
      } else {
        cleanObj[key] = value;
      }
    }
  });
  return cleanObj;
};

function EmployeeForm() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, err } = useSelector((state) => state.employees);
  console.log(err);

  const { activeMainTab, employee, activeSection: activeSectionParam } = router.query;
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
  const [activeSection, setActiveSection] = useState("personal");
  const [lastEmployeeId, setLastEmployeeId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    address: false,
    bank: false,
    work: false,
    statutory: false,
    salary: false
  });

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const weekDayOptions = [
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const [formData, setFormData] = useState({
    employee: {
      employeeId: "",
      name: "",
      fatherName: "",
      gender: "",
      phone1: "",
      phone2: "",
      email: {
        personal: "",
        official: "",
      },
      currentAddress: "",
      permanentAddress: "",
      department: "",
      designation: "",
      joiningDate: "",
      reportingManager: "",
      overtimeEligible: false,
      weeklyOff: [],
      profileImage: null,
    },
    statutory: {
      pfEnrolled: true,
      uanNumber: "",
      esicEnrolled: false,
      esicNumber: "",
    },
    documents: {
      aadharNo: "",
      panNo: "",
      passport: "",
      drivingLicense: "",
      voterId: "",
    },
    bank: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
      upiPhone: "",
      passbookDoc: null,
    },
    salary: {
      basic: "",
      hra: "",
      allowances: "",
      pf: "",
      totalCtc: "",
      annualCTC: "",
      monthlyCTC: "",
      employerPF: "",
      employeePF: "",
    },
  });

  useEffect(() => {
    if (employee) {
      try {
        const parsedEmployee = JSON.parse(employee);
        setFormData((prev) => ({
          ...prev,
          employee: {
            employeeId: parsedEmployee.employeeId || "",
            name: parsedEmployee.name || "",
            fatherName: parsedEmployee.fatherName || "",
            gender: parsedEmployee.gender || "",
            phone1: parsedEmployee.phone1 || "",
            phone2: parsedEmployee.phone2 || "",
            email: {
              personal: parsedEmployee.email?.personal || "",
              official: parsedEmployee.email?.official || "",
            },
            currentAddress: parsedEmployee.currentAddress || "",
            permanentAddress: parsedEmployee.permanentAddress || "",
            department: parsedEmployee.department || "",
            designation: parsedEmployee.designation || "",
            joiningDate: parsedEmployee.joiningDate || "",
            reportingManager: parsedEmployee.reportingManager || "",
            overtimeEligible: parsedEmployee.overtimeEligible || false,
            weeklyOff: parsedEmployee.weeklyOff || [],
            profileImage: null,
          },
          statutory: {
            pfEnrolled: parsedEmployee.statutory?.pfEnrolled || false,
            uanNumber: parsedEmployee.statutory?.uanNumber || "",
            esicEnrolled: parsedEmployee.statutory?.esicEnrolled || false,
            esicNumber: parsedEmployee.statutory?.esicNumber || "",
          },
          documents: {
            aadharNo: parsedEmployee.idProofs?.aadharNo || "",
            panNo: parsedEmployee.idProofs?.panNo || "",
            passport: parsedEmployee.idProofs?.passport || "",
            drivingLicense: parsedEmployee.idProofs?.drivingLicense || "",
            voterId: parsedEmployee.idProofs?.voterId || "",
          },
          bank: {
            accountNumber: parsedEmployee.bankDetails?.accountNumber || "",
            accountHolderName: parsedEmployee.bankDetails?.accountHolderName || "",
            ifscCode: parsedEmployee.bankDetails?.ifscCode || "",
            bankName: parsedEmployee.bankDetails?.bankName || "",
            branchName: parsedEmployee.bankDetails?.branchName || "",
            upiId: parsedEmployee.bankDetails?.upiId || "",
            upiPhone: parsedEmployee.bankDetails?.upiPhone || "",
            passbookDoc: parsedEmployee.bankDetails?.passbookDoc || null,
          },
          salary: {
            basic: parsedEmployee.salaryDetails?.basic || "",
            hra: parsedEmployee.salaryDetails?.hra || "",
            allowances: parsedEmployee.salaryDetails?.allowances || "",
            pf: parsedEmployee.salaryDetails?.pf || "",
            totalCtc: parsedEmployee.salaryDetails?.totalCtc || "",
            annualCTC: parsedEmployee.salaryDetails?.annualCTC || "",
            monthlyCTC: parsedEmployee.salaryDetails?.monthlyCTC || "",
            employerPF: parsedEmployee.salaryDetails?.employerPF || "",
            employeePF: parsedEmployee.salaryDetails?.employeePF || "",
          },
        }));
        setEmployeeId(parsedEmployee.id);
      } catch (error) {
        console.error("Error parsing employee data", error);
        toast.error("Error loading employee data");
      }
    }
  }, [employee]);

  // Update your EmployeeForm component
  useEffect(() => {
    if (!formData.employee.employeeId) {
      // Simply set it to EMP001 for new employees
      handleInputChange("employee", "employeeId", "EMP001");
    }
  }, []);

  const calculateTotalCTC = (salaryData) => {
    const values = {
      basic: parseFloat(salaryData.basic) || 0,
      hra: parseFloat(salaryData.hra) || 0,
      allowances: parseFloat(salaryData.allowances) || 0,
      pf: parseFloat(salaryData.pf) || 0,
    };
    return values.basic + values.hra + values.allowances + values.pf;
  };

  const calculateMonthlyCTC = (annualCTC) => {
    return (parseFloat(annualCTC) / 12).toFixed(2);
  };

  const calculatePFContributions = (basicSalary) => {
    const basic = parseFloat(basicSalary) || 0;
    return {
      employer: (basic * 0.12).toFixed(2), // 12% of basic salary
      employee: (basic * 0.12).toFixed(2), // 12% of basic salary
    };
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };

      // Calculate Monthly CTC when Annual CTC changes
      if (section === "salary" && field === "annualCTC") {
        const annual = parseFloat(value) || 0;
        updatedData.salary.monthlyCTC = (annual / 12).toFixed(2);
      }

      // Calculate PF contributions when Basic Salary changes and PF is enrolled
      if (
        section === "salary" &&
        field === "basic" &&
        prev.statutory.pfEnrolled
      ) {
        const pfContributions = calculatePFContributions(value);
        updatedData.salary.employerPF = pfContributions.employer;
        updatedData.salary.employeePF = pfContributions.employee;

        // Calculate HRA as 40% of basic salary
        const basic = parseFloat(value) || 0;
        updatedData.salary.hra = (basic * 0.4).toFixed(2);
      }

      // Calculate Allowances when Monthly CTC, HRA, Basic, or PF changes
      if (
        section === "salary" &&
        (field === "monthlyCTC" ||
          field === "hra" ||
          field === "basic" ||
          field === "employerPF" ||
          field === "employeePF")
      ) {
        const monthlyCTC = parseFloat(updatedData.salary.monthlyCTC) || 0;
        const hra = parseFloat(updatedData.salary.hra) || 0;
        const basic = parseFloat(updatedData.salary.basic) || 0;
        const employerPF = parseFloat(updatedData.salary.employerPF) || 0;
        const employeePF = parseFloat(updatedData.salary.employeePF) || 0;

        const allowances = monthlyCTC - (hra + employeePF + employerPF + basic);
        updatedData.salary.allowances = allowances.toFixed(2);
      }

      return updatedData;
    });
  };

  const handleNestedInputChange = (section, parentField, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parentField]: {
          ...prev[section][parentField],
          [field]: value,
        },
      },
    }));
  };

  const validateForm = () => {
    const { employee } = formData;
    if (!employee.employeeId) {
      toast.error("Employee ID is required");
      return false;
    }

    if (!employee.employeeId.match(/^EMP\d{3}$/)) {
      toast.error("Employee ID must be in the format EMP followed by 3 digits");
      return false;
    }
    if (!employee.name || !employee.phone1) {
      toast.error("Name and Phone are required fields");
      return false;
    }
    if (!/^[0-9]{10}$/.test(employee.phone1)) {
      toast.error("Invalid phone number");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // If we're not on the last section, navigate to the next section
    if (activeSection !== "salary") {
      const currentIndex = sections.findIndex(section => section.id === activeSection);
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
        return;
      }
    }
    
    // Only proceed with form submission if we're on the last section
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Create FormData object
      const formDataObj = new FormData();

      // Clean the form data to remove empty values
      const cleanEmployeeDetails = removeEmptyValues({
        employeeId: formData.employee.employeeId,
        name: formData.employee.name,
        fatherName: formData.employee.fatherName,
        gender: formData.employee.gender,
        phone1: formData.employee.phone1,
        phone2: formData.employee.phone2,
        email: formData.employee.email,
        currentAddress: formData.employee.currentAddress,
        permanentAddress: formData.employee.permanentAddress,
        department: formData.employee.department,
        designation: formData.employee.designation,
        joiningDate: formData.employee.joiningDate,
        reportingManager: formData.employee.reportingManager,
        overtimeEligible: formData.employee.overtimeEligible,
        weeklyOff: formData.employee.weeklyOff,
        statutory: formData.statutory,
        idProofs: formData.documents,
        bankDetails: formData.bank,
        salaryDetails: formData.salary,
      });

      // Only append if we have non-empty data
      if (Object.keys(cleanEmployeeDetails).length > 0) {
        formDataObj.append('employee', JSON.stringify(cleanEmployeeDetails));
      }

      // Add profile image if exists
      if (formData.employee.profileImage instanceof File) {
        formDataObj.append('profileImage', formData.employee.profileImage);
      }

      const result = await dispatch(updateEmployee({ id: employeeId, data: formDataObj })).unwrap();
      toast.success("Employee updated successfully");
      router.push("/hradmin/employees");
    } catch (err) {
      const errorMessage = err?.message || err?.error || err?.toString() || "An error occurred";
      toast.error(typeof errorMessage === 'string' ? errorMessage : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle direct employee creation from personal details
  const handleAddEmployeeFromPersonal = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // Create FormData object with only personal details
      const formDataObj = new FormData();
      
      // Clean the form data to remove empty values
      const cleanEmployeeDetails = removeEmptyValues({
        employeeId: formData.employee.employeeId,
        name: formData.employee.name,
        fatherName: formData.employee.fatherName,
        gender: formData.employee.gender,
        phone1: formData.employee.phone1,
        phone2: formData.employee.phone2,
        email: formData.employee.email,
        currentAddress: formData.employee.currentAddress,
        permanentAddress: formData.employee.permanentAddress,
        department: formData.employee.department,
        designation: formData.employee.designation,
        joiningDate: formData.employee.joiningDate,
        reportingManager: formData.employee.reportingManager,
        overtimeEligible: formData.employee.overtimeEligible,
        weeklyOff: formData.employee.weeklyOff,
      });
      
      // Only append if we have non-empty data
      if (Object.keys(cleanEmployeeDetails).length > 0) {
        formDataObj.append('employee', JSON.stringify(cleanEmployeeDetails));
      }
      
      // Add profile image if exists
      if (formData.employee.profileImage instanceof File) {
        formDataObj.append('profileImage', formData.employee.profileImage);
      }
      
      const result = await dispatch(createEmployee(formDataObj)).unwrap();
      toast.success("Employee created successfully");
      router.push("/hradmin/employees");
    } catch (err) {
      const errorMessage = err?.message || err?.error || err?.toString() || "An error occurred";
      toast.error(typeof errorMessage === 'string' ? errorMessage : "An error occurred");
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
    if (activeSectionParam) setActiveSection(activeSectionParam);
  }, [activeMainTab, activeSectionParam]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle the file upload logic here
      console.log("Uploaded file:", file);
    }
  };

  const handleFileUpload = (documentType, file) => {
    if (file) {
      setFormData((prev) => ({
        ...prev,
        bank: {
          ...prev.bank,
          [documentType]: file,
        },
      }));
    }
  };

  const sections = [
    { id: "personal", label: "Personal Details", icon: FiUser },
    { id: "documents", label: "ID Proofs", icon: FiBook },
    { id: "bank", label: "Bank Details", icon: FiCreditCard },
    { id: "jobInfo", label: "Job Info", icon: "💼" },
  ];

  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const handleEdit = (section) => {
    try {
      setIsEditing(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast.error("Failed to toggle edit mode");
    }
  };

  const handleSave = async (section) => {
    try {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }

      setLoading(true);
      const formDataObj = new FormData();
      
      // Clean the form data to remove empty values
      const cleanEmployeeDetails = removeEmptyValues({
        employeeId: formData.employee.employeeId,
        name: formData.employee.name,
        fatherName: formData.employee.fatherName,
        gender: formData.employee.gender,
        phone1: formData.employee.phone1,
        phone2: formData.employee.phone2,
        email: formData.employee.email,
        currentAddress: formData.employee.currentAddress,
        permanentAddress: formData.employee.permanentAddress,
        department: formData.employee.department,
        designation: formData.employee.designation,
        joiningDate: formData.employee.joiningDate,
        reportingManager: formData.employee.reportingManager,
        overtimeEligible: formData.employee.overtimeEligible,
        weeklyOff: formData.employee.weeklyOff,
      });

      if (Object.keys(cleanEmployeeDetails).length > 0) {
        formDataObj.append('employee', JSON.stringify(cleanEmployeeDetails));
      }

      if (formData.employee.profileImage instanceof File) {
        formDataObj.append('profileImage', formData.employee.profileImage);
      }

      await dispatch(updateEmployee({ id: employeeId, data: formDataObj })).unwrap();
      setIsEditing(prev => ({
        ...prev,
        [section]: false
      }));
      toast.success("Information updated successfully");
    } catch (error) {
      console.error("Error in handleSave:", error);
      toast.error("Failed to update information");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div className={`flex-1 ${isSidebarCollapsed ? "ml-20" : "ml-64"}`}>
        <HradminNavbar />

        <main className="p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-700">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat"></div>
                
                {/* Main Content Container */}
                <div className="relative h-full px-8 py-6 flex flex-col justify-between">
                  
                  {/* Top Row - Quick Stats */}
                  <div className="flex justify-between items-start">
                    {/* Employee Status */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                        <span>Active Employee</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                        <FaCalendarCheck className="w-4 h-4" />
                        <span>Joined {formData.employee.joiningDate ? new Date(formData.employee.joiningDate).toLocaleDateString() : "Not Set"}</span>
                      </div>
                    </div>

                    {/* Settings Menu */}
                    <div className="relative">
                      <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                      >
                        <FiSettings className="w-5 h-5" />
                      </button>
                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                          <button
                            onClick={() => router.push("/settings")}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
                            <FiSettings className="w-4 h-4 mr-2" />
                            Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                          >
                            <FiLogOut className="w-4 h-4 mr-2" />
                            Log out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Row - Profile Info */}
                  <div className="flex items-end space-x-6">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-xl bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-lg bg-gray-50 border border-white overflow-hidden">
                          {formData.employee.profileImage ? (
                            <img
                              src={URL.createObjectURL(formData.employee.profileImage)}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-50">
                              <FiUser className="w-12 h-12 text-blue-200" />
                            </div>
                          )}
                        </div>
                      </div>
                      <label 
                        htmlFor="profile-upload"
                        className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-lg cursor-pointer hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        <FiUpload className="w-4 h-4" />
                      </label>
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleInputChange('employee', 'profileImage', file);
                          }
                        }}
                      />
                    </div>

                    {/* Employee Info */}
                    <div className="flex-1 mb-2">
                      <h1 className="text-3xl font-bold text-white mb-1">
                        {formData.employee.name || "Employee Name"}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm">
                          <span className="font-medium">{formData.employee.employeeId || "EMP001"}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                          <span>{formData.employee.designation || "Designation"}</span>
                          <span className="text-white/40">•</span>
                          <span>{formData.employee.department || "Department"}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-white/80 text-sm">
                        <span>{formData.employee.email.official || "No official email set"}</span>
                      </div>
                    </div>

                    {/* Quick Info */}
                    <div className="flex space-x-3">
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">Reports to</span>
                        <span className="font-medium">{formData.employee.reportingManager || "Not Set"}</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">PF Status</span>
                        <span className="font-medium">{formData.statutory.pfEnrolled ? "Enrolled" : "Not Enrolled"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-10 px-14 pb-10 bg-gray-50">
                <div className="grid grid-cols-12 gap-8">
                  {/* Left Column - 5 columns */}
                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiUser className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                        </div>
                        <button
                          onClick={() => handleEdit('personal')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                          disabled={loading}
                        >
                          {isEditing.personal ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <FiEdit2 className="w-4 h-4 mr-1" />
                              Edit
                            </>
                          )}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-5">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">Father's Name</label>
                          {isEditing.personal ? (
                            <input
                              type="text"
                              value={formData.employee.fatherName || ""}
                              onChange={(e) => handleInputChange('employee', 'fatherName', e.target.value)}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                              />
                            ) : (
                              <p className="text-base text-gray-900">{formData.employee.fatherName || "-"}</p>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">Gender</label>
                            {isEditing.personal ? (
                              <select
                                value={formData.employee.gender || ""}
                                onChange={(e) => handleInputChange('employee', 'gender', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                              >
                                <option value="">Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            ) : (
                              <p className="text-base text-gray-900">{formData.employee.gender || "-"}</p>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">Phone</label>
                            {isEditing.personal ? (
                              <input
                                type="tel"
                                value={formData.employee.phone1 || ""}
                                onChange={(e) => handleInputChange('employee', 'phone1', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                required
                                pattern="[0-9]{10}"
                              />
                            ) : (
                              <p className="text-base text-gray-900">{formData.employee.phone1 || "-"}</p>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">Alternate Phone</label>
                            {isEditing.personal ? (
                              <input
                                type="tel"
                                value={formData.employee.phone2 || ""}
                                onChange={(e) => handleInputChange('employee', 'phone2', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                pattern="[0-9]{10}"
                              />
                            ) : (
                              <p className="text-base text-gray-900">{formData.employee.phone2 || "-"}</p>
                            )}
                          </div>
                          <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">Personal Email</label>
                            {isEditing.personal ? (
                              <input
                                type="email"
                                value={formData.employee.email.personal || ""}
                                onChange={(e) => handleNestedInputChange('employee', 'email', 'personal', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                              />
                            ) : (
                              <p className="text-base text-gray-900">{formData.employee.email.personal || "-"}</p>
                            )}
                          </div>
                          {isEditing.personal && (
                            <div className="col-span-2 flex justify-end mt-4">
                              <button
                                onClick={() => handleSave('personal')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center"
                                disabled={loading}
                              >
                                {loading ? (
                                  <>
                                    <FiLoader className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <FiCheck className="w-4 h-4 mr-2" />
                                    Save Changes
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
  
                      {/* Address Information Card */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <FiMapPin className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">Address Information</h3>
                          </div>
                          <button
                            onClick={() => handleEdit('address')}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                          >
                            {isEditing.address ? (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Cancel
                              </>
                            ) : (
                              <>
                                <FiEdit2 className="w-4 h-4 mr-1" />
                                Edit
                              </>
                            )}
                          </button>
                        </div>
                        <div className="space-y-5">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">Current Address</label>
                            {isEditing.address ? (
                              <textarea
                                value={formData.employee.currentAddress || ""}
                                onChange={(e) => handleInputChange('employee', 'currentAddress', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                rows={3}
                              />
                            ) : (
                              <p className="text-base text-gray-900 mt-1">{formData.employee.currentAddress || "-"}</p>
                            )}
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">Permanent Address</label>
                            {isEditing.address ? (
                              <textarea
                                value={formData.employee.permanentAddress || ""}
                                onChange={(e) => handleInputChange('employee', 'permanentAddress', e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                rows={3}
                              />
                            ) : (
                              <p className="text-base text-gray-900 mt-1">{formData.employee.permanentAddress || "-"}</p>
                            )}
                          </div>
                          {isEditing.address && (
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleSave('address')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                              >
                                <FiCheck className="w-4 h-4 mr-2" />
                                Save Changes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
  
                    {/* Right Column - 7 columns */}
                    <div className="col-span-12 lg:col-span-7 space-y-6">
                      {/* Bank and Statutory Info Row */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Bank Information Card */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                            <div className="flex items-center">
                              <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-800">Bank Information</h3>
                            </div>
                            <button
                              onClick={() => handleEdit('bank')}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                            >
                              {isEditing.bank ? (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <FiEdit2 className="w-4 h-4 mr-1" />
                                  Edit
                                </>
                              )}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">Account Number</label>
                              {isEditing.bank ? (
                                <input
                                  type="text"
                                  value={formData.bank.accountNumber || ""}
                                  onChange={(e) => handleInputChange('bank', 'accountNumber', e.target.value)}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                />
                              ) : (
                                <p className="text-base text-gray-900">{formData.bank.accountNumber || "-"}</p>
                              )}
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">IFSC Code</label>
                              {isEditing.bank ? (
                                <input
                                  type="text"
                                  value={formData.bank.ifscCode || ""}
                                  onChange={(e) => handleInputChange('bank', 'ifscCode', e.target.value)}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                />
                              ) : (
                                <p className="text-base text-gray-900">{formData.bank.ifscCode || "-"}</p>
                              )}
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">Bank Name</label>
                              {isEditing.bank ? (
                                <input
                                  type="text"
                                  value={formData.bank.bankName || ""}
                                  onChange={(e) => handleInputChange('bank', 'bankName', e.target.value)}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                />
                              ) : (
                                <p className="text-base text-gray-900">{formData.bank.bankName || "-"}</p>
                              )}
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">UPI Phone Number</label>
                              {isEditing.bank ? (
                                <input
                                  type="tel"
                                  value={formData.bank.upiPhone || ""}
                                  onChange={(e) => handleInputChange('bank', 'upiPhone', e.target.value)}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                  pattern="[0-9]{10}"
                                  placeholder="10-digit phone number"
                                />
                              ) : (
                                <p className="text-base text-gray-900">{formData.bank.upiPhone || "-"}</p>
                              )}
                            </div>
                            {/* Passbook Upload Section */}
                            <div className="border-t pt-4 mt-2">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">Bank Passbook</label>
                              {isEditing.bank ? (
                                <div className="mt-2">
                                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors bg-white">
                                  <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="relative group cursor-pointer">
                                      <label htmlFor="passbook-upload" className="cursor-pointer flex flex-col items-center">
                                        <FiUpload className="w-8 h-8 text-gray-400 group-hover:text-blue-500" />
                                        <span className="mt-2 text-sm text-gray-500 group-hover:text-blue-500">
                                          {formData.bank.passbookDoc ? 'Update Passbook' : 'Upload Passbook'}
                                        </span>
                                        <span className="text-xs text-gray-400">PDF, JPG, or PNG</span>
                                      </label>
                                      <input
                                        type="file"
                                        id="passbook-upload"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            handleInputChange('bank', 'passbookDoc', file);
                                          }
                                        }}
                                      />
                                    </div>
                                    {formData.bank.passbookDoc && (
                                      <div className="flex items-center mt-2">
                                        <span className="text-sm text-gray-600 mr-2">
                                          {typeof formData.bank.passbookDoc === 'string' 
                                            ? formData.bank.passbookDoc.split('/').pop() 
                                            : formData.bank.passbookDoc.name}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleInputChange('bank', 'passbookDoc', null)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mt-2 bg-gray-50 p-3 rounded-lg">
                                <p className="text-base text-gray-900">
                                  {formData.bank.passbookDoc ? 
                                    (typeof formData.bank.passbookDoc === 'string' ? 
                                      formData.bank.passbookDoc.split('/').pop() : 
                                      formData.bank.passbookDoc.name) : 
                                    "Not uploaded"}
                                </p>
                                {formData.bank.passbookDoc && (
                                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                                    <FiEye className="w-4 h-4 mr-1" />
                                    View
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                          {isEditing.bank && (
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => handleSave('bank')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                              >
                                <FiCheck className="w-4 h-4 mr-2" />
                                Save Changes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Statutory Information Card */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <FiShield className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">Statutory Information</h3>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">PF Status</label>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${formData.statutory.pfEnrolled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <p className="text-base text-gray-900">{formData.statutory.pfEnrolled ? "Enrolled" : "Not Enrolled"}</p>
                            </div>
                          </div>
                          {formData.statutory.pfEnrolled && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">UAN Number</label>
                              <p className="text-base text-gray-900">{formData.statutory.uanNumber || "-"}</p>
                            </div>
                          )}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">ESIC Status</label>
                            <div className="flex items-center">
                              <div className={`w-2 h-2 rounded-full mr-2 ${formData.statutory.esicEnrolled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <p className="text-base text-gray-900">{formData.statutory.esicEnrolled ? "Enrolled" : "Not Enrolled"}</p>
                            </div>
                          </div>
                          {formData.statutory.esicEnrolled && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">ESIC Number</label>
                              <p className="text-base text-gray-900">{formData.statutory.esicNumber || "-"}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ID Proofs Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiBook className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">Identity Documents</h3>
                        </div>
                        <button
                          onClick={() => handleEdit('documents')}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          {isEditing.documents ? (
                            <>
                              <X className="w-4 h-4 mr-1" />
                              Cancel
                            </>
                          ) : (
                            <>
                              <FiEdit2 className="w-4 h-4 mr-1" />
                              Edit
                            </>
                          )}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-6">
                        {[
                          { label: "Aadhar No.", key: "aadharNo", docType: "Aadhar Card" },
                          { label: "PAN No.", key: "panNo", docType: "PAN Card" },
                          { label: "Passport", key: "passport", docType: "Passport" },
                          { label: "Driving License", key: "drivingLicense", docType: "Driving License" },
                          { label: "Voter ID", key: "voterId", docType: "Voter ID" }
                        ].map(({ label, key, docType }) => (
                          <div key={key} className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">{label}</label>
                            {isEditing.documents ? (
                              <div className="relative flex items-center mt-1">
                                <input
                                  type="text"
                                  value={formData.documents[key] || ""}
                                  onChange={(e) => handleInputChange('documents', key, e.target.value)}
                                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white pr-10"
                                />
                                <div className="absolute right-3 group">
                                  <label htmlFor={`upload-${key}`} className="cursor-pointer">
                                    <FiUpload className="w-4 h-4 text-gray-500 hover:text-blue-600" />
                                    <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                      Upload {docType}
                                    </span>
                                  </label>
                                  <input
                                    type="file"
                                    id={`upload-${key}`}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => handleFileUpload(key, e.target.files[0])}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-base text-gray-900">{formData.documents[key] || "-"}</p>
                                {formData.documents[key] && (
                                  <button className="text-sm text-blue-600 hover:text-blue-700 ml-2 flex items-center">
                                    <FiEye className="w-4 h-4 mr-1" />
                                    View
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {isEditing.documents && (
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handleSave('documents')}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center"
                          >
                            <FiCheck className="w-4 h-4 mr-2" />
                            Save Changes
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Salary Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiDollarSign className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">Salary Information</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">Annual CTC</label>
                          <p className="text-base text-gray-900">₹ {formData.salary.annualCTC || "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">Monthly CTC</label>
                          <p className="text-base text-gray-900">₹ {formData.salary.monthlyCTC || "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">Basic Salary</label>
                          <p className="text-base text-gray-900">₹ {formData.salary.basic || "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">HRA</label>
                          <p className="text-base text-gray-900">₹ {formData.salary.hra || "-"}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">Allowances</label>
                          <p className="text-base text-gray-900">₹ {formData.salary.allowances || "-"}</p>
                        </div>
                        {formData.statutory.pfEnrolled && (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">Employer PF</label>
                              <p className="text-base text-gray-900">₹ {formData.salary.employerPF || "-"}</p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">Employee PF</label>
                              <p className="text-base text-gray-900">₹ {formData.salary.employeePF || "-"}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAuth(EmployeeForm);  