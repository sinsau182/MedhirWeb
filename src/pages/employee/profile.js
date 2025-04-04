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
      pfEnrolled: false,
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
    const annual = parseFloat(annualCTC) || 0;
    return (annual / 12).toFixed(2);
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

      // Add Aadhar image if exists
      if (formData.documents.aadharNo instanceof File) {
        formDataObj.append('aadharImage', formData.documents.aadharNo);
      }

      if (employeeId) {
        const result = await dispatch(
          updateEmployee({ id: employeeId, updatedData: formDataObj })
        ).unwrap();
        toast.success("Employee updated successfully");
      } else {
        const result = await dispatch(createEmployee(formDataObj)).unwrap();
        toast.success("Employee created successfully");
      }
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
              <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
                <div className="absolute -bottom-12 left-8">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white p-1">
                      <div className="w-full h-full rounded-full bg-gray-100 border-2 border-white overflow-hidden">
                        {formData.employee.profileImage ? (
                          <img
                            src={URL.createObjectURL(formData.employee.profileImage)}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50">
                            <FiUser className="w-8 h-8 text-blue-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="pt-16 px-8 pb-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {formData.employee.name}
                    </h1>
                    <p className="text-gray-600">{formData.employee.email.official}</p>
                    <div className="mt-2 flex items-center space-x-4">
                      <span className="text-sm text-gray-500">
                        {formData.employee.employeeId}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {formData.employee.designation}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        {formData.employee.department}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <FiSettings className="w-5 h-5 text-gray-600" />
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                        <button
                          onClick={() => router.push("/settings")}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <FiSettings className="w-4 h-4 mr-2" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center"
                        >
                          <FiLogOut className="w-4 h-4 mr-2" />
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Content */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Personal Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Father's Name</label>
                        <p className="text-gray-900">{formData.employee.fatherName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Gender</label>
                        <p className="text-gray-900">{formData.employee.gender || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Phone</label>
                        <p className="text-gray-900">{formData.employee.phone1 || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Personal Email</label>
                        <p className="text-gray-900">{formData.employee.email.personal || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Work Information Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Work Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Department</label>
                        <p className="text-gray-900">{formData.employee.department || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Designation</label>
                        <p className="text-gray-900">{formData.employee.designation || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Joining Date</label>
                        <p className="text-gray-900">{formData.employee.joiningDate || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Reporting Manager</label>
                        <p className="text-gray-900">{formData.employee.reportingManager || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Address Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">Current Address</label>
                        <p className="text-gray-900">{formData.employee.currentAddress || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Permanent Address</label>
                        <p className="text-gray-900">{formData.employee.permanentAddress || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Statutory Information Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Statutory Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-500">PF Status</label>
                        <p className="text-gray-900">
                          {formData.statutory.pfEnrolled ? "Enrolled" : "Not Enrolled"}
                        </p>
                      </div>
                      {formData.statutory.pfEnrolled && (
                        <div>
                          <label className="text-sm text-gray-500">UAN Number</label>
                          <p className="text-gray-900">{formData.statutory.uanNumber || "-"}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-gray-500">ESIC Status</label>
                        <p className="text-gray-900">
                          {formData.statutory.esicEnrolled ? "Enrolled" : "Not Enrolled"}
                        </p>
                      </div>
                      {formData.statutory.esicEnrolled && (
                        <div>
                          <label className="text-sm text-gray-500">ESIC Number</label>
                          <p className="text-gray-900">{formData.statutory.esicNumber || "-"}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bank Information Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Bank Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500">Account Number</label>
                        <p className="text-gray-900">{formData.bank.accountNumber || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Account Holder Name</label>
                        <p className="text-gray-900">{formData.bank.accountHolderName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">IFSC Code</label>
                        <p className="text-gray-900">{formData.bank.ifscCode || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Bank Name</label>
                        <p className="text-gray-900">{formData.bank.bankName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Branch Name</label>
                        <p className="text-gray-900">{formData.bank.branchName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">UPI ID</label>
                        <p className="text-gray-900">{formData.bank.upiId || "-"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Salary Information Card */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Salary Information
                    </h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-gray-500">Annual CTC</label>
                        <p className="text-gray-900">₹ {formData.salary.annualCTC || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Monthly CTC</label>
                        <p className="text-gray-900">₹ {formData.salary.monthlyCTC || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Basic Salary</label>
                        <p className="text-gray-900">₹ {formData.salary.basic || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">HRA</label>
                        <p className="text-gray-900">₹ {formData.salary.hra || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-500">Allowances</label>
                        <p className="text-gray-900">₹ {formData.salary.allowances || "-"}</p>
                      </div>
                      {formData.statutory.pfEnrolled && (
                        <>
                          <div>
                            <label className="text-sm text-gray-500">Employer PF</label>
                            <p className="text-gray-900">₹ {formData.salary.employerPF || "-"}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-500">Employee PF</label>
                            <p className="text-gray-900">₹ {formData.salary.employeePF || "-"}</p>
                          </div>
                        </>
                      )}
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