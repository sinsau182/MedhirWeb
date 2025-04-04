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
      <label className={floatingLabelClass}>{label}</label>
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
    if (value !== null && value !== undefined && value !== "") {
      if (typeof value === "object" && !(value instanceof File)) {
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

  const {
    activeMainTab,
    employee,
    activeSection: activeSectionParam,
  } = router.query;
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

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  const weekDayOptions = [
    { value: "SUNDAY", label: "Sunday" },
    { value: "MONDAY", label: "Monday" },
    { value: "TUESDAY", label: "Tuesday" },
    { value: "WEDNESDAY", label: "Wednesday" },
    { value: "THURSDAY", label: "Thursday" },
    { value: "FRIDAY", label: "Friday" },
    { value: "SATURDAY", label: "Saturday" },
  ];

  const [formData, setFormData] = useState({
    employee: {
      employeeId: "",
      name: "",
      fathersName: "",
      gender: "",
      phone: "",
      alternatePhone: "",
      emailPersonal: "",
      emailOfficial: "",
      currentAddress: "",
      permanentAddress: "",
      department: "",
      designation: "",
      joiningDate: "",
      reportingManager: "",
      overtimeEligibile: false,
      weeklyOffs: [],
      employeeImgUrl: null,
    },
    statutory: {
      pfEnrolled: false,
      uanNumber: "",
      esicEnrolled: false,
      esicNumber: "",
    },
    idProofs: {
      aadharNo: "",
      aadharImgUrl: null,
      panNo: "",
      pancardImgUrl: null,
      passport: "",
      passportImgUrl: null,
      drivingLicense: "",
      drivingLicenseImgUrl: null,
      voterId: "",
      voterIdImgUrl: null,
    },
    bankDetails: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
      upiPhoneNumber: "",
      passbookImgUrl: null,
    },
    salaryDetails: {
      annualCtc: "",
      monthlyCtc: "",
      basicSalary: "",
      hra: "",
      allowances: "",
      employerPfContribution: "",
      employeePfContribution: "",
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
            fathersName: parsedEmployee.fatherName || "",
            gender: parsedEmployee.gender || "",
            phone: parsedEmployee.phone1 || "",
            alternatePhone: parsedEmployee.phone2 || "",
            emailPersonal: parsedEmployee.emailPersonal || "",
            emailOfficial: parsedEmployee.emailOfficial || "",
            currentAddress: parsedEmployee.currentAddress || "",
            permanentAddress: parsedEmployee.permanentAddress || "",
            department: parsedEmployee.department || "",
            designation: parsedEmployee.designation || "",
            joiningDate: parsedEmployee.joiningDate || "",
            reportingManager: parsedEmployee.reportingManager || "",
            overtimeEligibile: parsedEmployee.overtimeEligible || false,
            weeklyOffs: parsedEmployee.weeklyOff || [],
            employeeImgUrl: null,
          },
          statutory: {
            pfEnrolled: parsedEmployee.statutory?.pfEnrolled || false,
            uanNumber: parsedEmployee.statutory?.uanNumber || "",
            esicEnrolled: parsedEmployee.statutory?.esicEnrolled || false,
            esicNumber: parsedEmployee.statutory?.esicNumber || "",
          },
          idProofs: {
            aadharNo: parsedEmployee.idProofs?.aadharNo || "",
            aadharImgUrl: null,
            panNo: parsedEmployee.idProofs?.panNo || "",
            pancardImgUrl: null,
            passport: parsedEmployee.idProofs?.passport || "",
            passportImgUrl: null,
            drivingLicense: parsedEmployee.idProofs?.drivingLicense || "",
            drivingLicenseImgUrl: null,
            voterId: parsedEmployee.idProofs?.voterId || "",
            voterIdImgUrl: null,
          },
          bankDetails: {
            accountNumber: parsedEmployee.bankDetails?.accountNumber || "",
            accountHolderName:
              parsedEmployee.bankDetails?.accountHolderName || "",
            ifscCode: parsedEmployee.bankDetails?.ifscCode || "",
            bankName: parsedEmployee.bankDetails?.bankName || "",
            branchName: parsedEmployee.bankDetails?.branchName || "",
            upiId: parsedEmployee.bankDetails?.upiId || "",
            upiPhoneNumber: parsedEmployee.bankDetails?.upiPhone || "",
            passbookImgUrl: null,
          },
          salaryDetails: {
            annualCtc: parsedEmployee.salaryDetails?.annualCTC || "",
            monthlyCtc: parsedEmployee.salaryDetails?.monthlyCTC || "",
            basicSalary: parsedEmployee.salaryDetails?.basic || "",
            hra: parsedEmployee.salaryDetails?.hra || "",
            allowances: parsedEmployee.salaryDetails?.allowances || "",
            employerPfContribution:
              parsedEmployee.salaryDetails?.employerPF || "",
            employeePfContribution:
              parsedEmployee.salaryDetails?.employeePF || "",
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
      if (section === "salaryDetails" && field === "annualCtc") {
        const annual = parseFloat(value) || 0;
        updatedData.salaryDetails.monthlyCtc = (annual / 12).toFixed(2);
      }

      // Calculate PF contributions when Basic Salary changes and PF is enrolled
      if (
        section === "salaryDetails" &&
        field === "basicSalary" &&
        prev.statutory.pfEnrolled
      ) {
        const pfContributions = calculatePFContributions(value);
        updatedData.salaryDetails.employerPfContribution =
          pfContributions.employer;
        updatedData.salaryDetails.employeePfContribution =
          pfContributions.employee;

        // Calculate HRA as 40% of basic salary
        const basic = parseFloat(value) || 0;
        updatedData.salaryDetails.hra = (basic * 0.4).toFixed(2);
      }

      // Calculate Allowances when Monthly CTC, HRA, Basic, or PF changes
      if (
        section === "salaryDetails" &&
        (field === "monthlyCtc" ||
          field === "hra" ||
          field === "basicSalary" ||
          field === "employerPfContribution" ||
          field === "employeePfContribution")
      ) {
        const monthlyCTC =
          parseFloat(updatedData.salaryDetails.monthlyCtc) || 0;
        const hra = parseFloat(updatedData.salaryDetails.hra) || 0;
        const basic = parseFloat(updatedData.salaryDetails.basicSalary) || 0;
        const employerPF =
          parseFloat(updatedData.salaryDetails.employerPfContribution) || 0;
        const employeePF =
          parseFloat(updatedData.salaryDetails.employeePfContribution) || 0;

        const allowances = monthlyCTC - (hra + employeePF + employerPF + basic);
        updatedData.salaryDetails.allowances = allowances.toFixed(2);
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
    if (!employee.name || !employee.phone) {
      toast.error("Name and Phone are required fields");
      return false;
    }
    if (!/^[0-9]{10}$/.test(employee.phone)) {
      toast.error("Invalid phone number");
      return false;
    }
    if (!employee.joiningDate) {
      toast.error("Date of joining is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If we're not on the last section, navigate to the next section
    if (activeSection !== "salary") {
      const currentIndex = sections.findIndex(
        (section) => section.id === activeSection
      );
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
        fathersName: formData.employee.fathersName,
        gender: formData.employee.gender,
        phone: formData.employee.phone,
        alternatePhone: formData.employee.alternatePhone,
        emailPersonal: formData.employee.emailPersonal,
        emailOfficial: formData.employee.emailOfficial,
        currentAddress: formData.employee.currentAddress,
        permanentAddress: formData.employee.permanentAddress,
        department: formData.employee.department,
        designation: formData.employee.designation,
        joiningDate: formData.employee.joiningDate,
        reportingManager: formData.employee.reportingManager,
        overtimeEligibile: formData.employee.overtimeEligibile,
        weeklyOffs: formData.employee.weeklyOffs,
        employeeImgUrl: formData.employee.employeeImgUrl,
        statutory: formData.statutory,
        idProofs: formData.idProofs,
        bankDetails: formData.bankDetails,
        salaryDetails: formData.salaryDetails,
      });

      // Only append if we have non-empty data
      if (Object.keys(cleanEmployeeDetails).length > 0) {
        formDataObj.append("employee", JSON.stringify(cleanEmployeeDetails));
      }

      // Add profile image if exists
      if (formData.employee.employeeImgUrl instanceof File) {
        formDataObj.append("employeeImgUrl", formData.employee.employeeImgUrl);
      }

      // Add Aadhar image if exists
      if (formData.idProofs.aadharImgUrl instanceof File) {
        formDataObj.append("aadharImgUrl", formData.idProofs.aadharImgUrl);
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
      let errorMessage = "An error occurred";

      if (err?.validationErrors) {
        // Handle validation errors
        const validationMessages = Object.entries(err.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        errorMessage = validationMessages;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }

      toast.error(errorMessage);
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
        fathersName: formData.employee.fathersName,
        gender: formData.employee.gender,
        phone: formData.employee.phone,
        alternatePhone: formData.employee.alternatePhone,
        emailPersonal: formData.employee.emailPersonal,
        emailOfficial: formData.employee.emailOfficial,
        currentAddress: formData.employee.currentAddress,
        permanentAddress: formData.employee.permanentAddress,
        department: formData.employee.department,
        designation: formData.employee.designation,
        joiningDate: formData.employee.joiningDate,
        reportingManager: formData.employee.reportingManager,
        overtimeEligibile: formData.employee.overtimeEligibile,
        weeklyOffs: formData.employee.weeklyOffs,
      });

      // Only append if we have non-empty data
      if (Object.keys(cleanEmployeeDetails).length > 0) {
        formDataObj.append("employee", JSON.stringify(cleanEmployeeDetails));
      }

      // Add profile image if exists
      if (formData.employee.employeeImgUrl instanceof File) {
        formDataObj.append("employeeImgUrl", formData.employee.employeeImgUrl);
      }

      const result = await dispatch(createEmployee(formDataObj)).unwrap();
      toast.success("Employee created successfully");
      router.push("/hradmin/employees");
    } catch (err) {
      let errorMessage = "An error occurred";

      if (err?.validationErrors) {
        // Handle validation errors
        const validationMessages = Object.entries(err.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join("\n");
        errorMessage = validationMessages;
      } else if (typeof err === "string") {
        errorMessage = err;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.error) {
        errorMessage = err.error;
      }

      toast.error(errorMessage);
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
    { id: "idProofs", label: "ID Proofs", icon: FiBook },
    { id: "bank", label: "Bank Details", icon: FiCreditCard },
    { id: "salary", label: "Salary", icon: "₹" },
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <HradminNavbar />

        <div className="p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                {employee ? "✏️ Edit Employee" : "New Employee"}
              </h1>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl shadow-sm p-6 relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 z-0" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-50 rounded-full -ml-16 -mb-16 z-0" />

                {/* Section Tabs */}
                <div className="relative z-10 flex gap-4 mb-8 border-b border-gray-100 pb-2">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      type="button"
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeSection === section.id
                          ? "bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      onClick={() => setActiveSection(section.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {typeof section.icon === "string" ? (
                        <span className="text-lg">{section.icon}</span>
                      ) : (
                        <section.icon
                          className={`w-4 h-4 ${
                            activeSection === section.id
                              ? "text-blue-500"
                              : "text-gray-400"
                          }`}
                        />
                      )}
                      {section.label}
                    </motion.button>
                  ))}
                </div>

                {/* Form Content */}
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  {/* Personal Details Section */}
                  {activeSection === "personal" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Personal Information
                        </h3>
                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Employee ID <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={formData.employee.employeeId || ""}
                            onChange={(e) => {
                              // Ensure the input follows the EMP### format
                              const value = e.target.value.toUpperCase();
                              if (value === "" || value.match(/^EMP\d{0,3}$/)) {
                                handleInputChange(
                                  "employee",
                                  "employeeId",
                                  value
                                );
                              }
                            }}
                            maxLength={6} // Limit to EMP### format
                          />
                        </div>

                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Employee Name{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={formData.employee.name || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Enter employee name"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              Father's Name
                            </label>
                            <input
                              type="text"
                              className={inputClass}
                              value={formData.employee.fathersName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "fathersName",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className={inputGroupClass}>
                            <label className={floatingLabelClass}>Gender</label>
                            <select
                              className={inputClass}
                              value={formData.employee.gender || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "gender",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Phone",
                              field: "phone",
                              required: true,
                              type: "tel",
                            },
                            {
                              label: "Alternate Phone",
                              field: "alternatePhone",
                              type: "tel",
                            },
                          ].map(({ label, field, required, type }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                                {required && (
                                  <span className="text-red-400">*</span>
                                )}
                              </label>
                              <input
                                type={type || "text"}
                                required={required}
                                className={inputClass}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Personal Email",
                              field: "emailPersonal",
                              type: "email",
                            },
                            {
                              label: "Official Email",
                              field: "emailOfficial",
                              type: "email",
                            },
                          ].map(({ label, field, type }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}
                              </label>
                              <input
                                type={type}
                                className={inputClass}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        {/* Addresses */}
                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Current Address
                          </label>
                          <textarea
                            className={inputClass}
                            rows="2"
                            value={formData.employee.currentAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "currentAddress",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="flex items-center mb-2">
                          <input
                            type="checkbox"
                            id="sameAsCurrent"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange(
                                  "employee",
                                  "permanentAddress",
                                  formData.employee.currentAddress
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor="sameAsCurrent"
                            className="ml-2 text-sm text-gray-700"
                          >
                            Same as current address
                          </label>
                        </div>

                        <div className={inputGroupClass}>
                          <label className={floatingLabelClass}>
                            Permanent Address
                          </label>
                          <textarea
                            className={inputClass}
                            rows="2"
                            value={formData.employee.permanentAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "permanentAddress",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Right Column - Professional Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Professional Information
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Department",
                              field: "department",
                            },
                            {
                              label: "Designation",
                              field: "designation",
                            },
                          ].map(({ label, field, required }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                              </label>
                              <input
                                type="text"
                                className={inputClass}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Date of Joining",
                              field: "joiningDate",
                              required: true,
                              type: "date",
                            },
                            {
                              label: "Reporting Manager",
                              field: "reportingManager",
                            },
                          ].map(({ label, field, type, required }) => (
                            <div key={field} className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                {label}{" "}
                                {required && (
                                  <span className="text-red-400">*</span>
                                )}
                              </label>
                              <input
                                type={type || "text"}
                                className={`${inputClass} ${
                                  type === "date" ? "py-[0.4rem] px-3" : ""
                                }`}
                                value={formData.employee[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    field,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>

                        {/* Statutory Details */}
                        <div className="space-y-4 border-t pt-4 mt-4">
                          <h4 className="text-md font-medium text-gray-700">
                            Statutory Details
                          </h4>

                          <MultiSelect
                            label="Weekly Off"
                            options={weekDays}
                            value={formData.employee.weeklyOffs || []}
                            onChange={(selected) =>
                              handleInputChange(
                                "employee",
                                "weeklyOffs",
                                selected
                              )
                            }
                          />

                          <div className="flex flex-col space-y-4">
                            {/* PF Section */}
                            <div className="space-y-2">
                              <div className="flex items-center mb-3">
                                <input
                                  type="checkbox"
                                  id="pfEnrolled"
                                  checked={formData.statutory.pfEnrolled}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "statutory",
                                      "pfEnrolled",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="pfEnrolled"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  PF Enrolled
                                </label>
                              </div>

                              {formData.statutory.pfEnrolled && (
                                <div className={`${inputGroupClass} mt-2`}>
                                  <label className={floatingLabelClass}>
                                    UAN Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.statutory.uanNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "statutory",
                                        "uanNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter UAN Number"
                                  />
                                </div>
                              )}
                            </div>

                            {/* ESIC Section */}
                            <div className="space-y-2">
                              <div className="flex items-center mb-3">
                                <input
                                  type="checkbox"
                                  id="esicEnrolled"
                                  checked={formData.statutory.esicEnrolled}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "statutory",
                                      "esicEnrolled",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="esicEnrolled"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  ESIC Enrolled
                                </label>
                              </div>

                              {formData.statutory.esicEnrolled && (
                                <div className={`${inputGroupClass} mt-2`}>
                                  <label className={floatingLabelClass}>
                                    ESIC Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.statutory.esicNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "statutory",
                                        "esicNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter ESIC Number"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Overtime Eligible Section */}
                            <div className="space-y-2">
                              <div className="flex items-center mb-3">
                                <input
                                  type="checkbox"
                                  id="overtimeEligible"
                                  checked={formData.employee.overtimeEligibile}
                                  onChange={(e) =>
                                    handleInputChange(
                                      "employee",
                                      "overtimeEligibile",
                                      e.target.checked
                                    )
                                  }
                                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label
                                  htmlFor="overtimeEligible"
                                  className="ml-2 text-sm text-gray-700"
                                >
                                  Overtime Eligible
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Proofs Section (renamed from documents) */}
                  {activeSection === "idProofs" && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Identity Documents
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          {
                            label: "Aadhar No.",
                            key: "aadharNo",
                            docType: "Aadhar Card",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            docType: "PAN Card",
                          },
                          {
                            label: "Passport",
                            key: "passport",
                            docType: "Passport",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            docType: "Driving License",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            docType: "Voter ID",
                          },
                        ].map(({ label, key, docType }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}{" "}
                            </label>
                            <div className="relative flex items-center">
                              <input
                                className={`${inputClass} pr-10`}
                                value={formData.idProofs[key] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "idProofs",
                                    key,
                                    e.target.value
                                  )
                                }
                              />
                              <div className="absolute right-3 group">
                                <label
                                  htmlFor={`upload-${key}`}
                                  className="cursor-pointer"
                                >
                                  <FiUpload className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                                  <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                    Upload {docType}
                                  </span>
                                </label>
                                <input
                                  type="file"
                                  id={`upload-${key}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) =>
                                    handleFileUpload(key, e.target.files[0])
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bank Details Section */}
                  {activeSection === "bank" && (
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Banking Information
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {[
                          { label: "Account Number", key: "accountNumber" },
                          {
                            label: "Account Holder Name",
                            key: "accountHolderName",
                          },
                          { label: "IFSC Code", key: "ifscCode" },
                          { label: "Bank Name", key: "bankName" },
                          { label: "Branch Name", key: "branchName" },
                          { label: "UPI ID", key: "upiId" },
                          { label: "UPI Phone Number", key: "upiPhoneNumber" },
                        ].map(({ label, key }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <input
                              className={inputClass}
                              value={formData.bankDetails[key] || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "bankDetails",
                                  key,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>

                      {/* Document Upload Section */}
                      <div className="mt-6 space-y-4">
                        <h4 className="text-md font-medium text-gray-700">
                          Account Verification Document
                        </h4>
                        <div className="flex items-start space-x-6">
                          {/* Passbook Photo Upload */}
                          <div className="flex-1">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <input
                                  type="file"
                                  id="passbook-upload"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) =>
                                    handleFileUpload(
                                      "passbookImgUrl",
                                      e.target.files[0]
                                    )
                                  }
                                />
                                <label
                                  htmlFor="passbook-upload"
                                  className="cursor-pointer text-center"
                                >
                                  <div className="flex flex-col items-center space-y-2">
                                    <FiUpload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">
                                      Upload Passbook/Cancelled Cheque
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      Click to upload or drag and drop
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      PDF or Image file
                                    </span>
                                  </div>
                                </label>
                              </div>
                              {formData.bankDetails.passbookImgUrl && (
                                <div className="mt-2 text-sm text-gray-600">
                                  File:{" "}
                                  {formData.bankDetails.passbookImgUrl.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary Section */}
                  {activeSection === "salary" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Salary Details
                      </h3>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        {[
                          { label: "Annual CTC", field: "annualCtc" },
                          { label: "Monthly CTC", field: "monthlyCtc" },
                          { label: "Basic Salary", field: "basicSalary" },
                          { label: "HRA", field: "hra" },
                          { label: "Allowances", field: "allowances" },
                        ].map(({ label, field }) => (
                          <div key={field} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ₹
                              </span>
                              <input
                                type="number"
                                className={`${inputClass} pl-8 ${
                                  field === "monthlyCtc" ||
                                  field === "allowances" ||
                                  field === "hra"
                                    ? "bg-gray-50"
                                    : ""
                                }`}
                                value={formData.salaryDetails[field] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "salaryDetails",
                                    field,
                                    e.target.value
                                  )
                                }
                                readOnly={
                                  field === "monthlyCtc" ||
                                  field === "allowances" ||
                                  field === "hra"
                                }
                              />
                            </div>
                          </div>
                        ))}

                        {/* PF Contributions - Only shown if PF is enrolled */}
                        {formData.statutory.pfEnrolled && (
                          <>
                            <div className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                Employer PF Contribution
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  className={`${inputClass} pl-8 bg-gray-50`}
                                  value={
                                    formData.salaryDetails
                                      .employerPfContribution ||
                                    calculatePFContributions(
                                      formData.salaryDetails.basicSalary
                                    ).employer
                                  }
                                  readOnly
                                />
                              </div>
                            </div>

                            <div className={inputGroupClass}>
                              <label className={floatingLabelClass}>
                                Employee PF Contribution
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                  ₹
                                </span>
                                <input
                                  type="text"
                                  className={`${inputClass} pl-8 bg-gray-50`}
                                  value={
                                    formData.salaryDetails
                                      .employeePfContribution ||
                                    calculatePFContributions(
                                      formData.salaryDetails.basicSalary
                                    ).employee
                                  }
                                  readOnly
                                />
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Form Actions */}
              <div className="mt-8 flex justify-end gap-4">
                <motion.button
                  type="button"
                  className="px-6 py-3 rounded-xl bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200"
                  onClick={() => router.push("/hradmin/employees")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>

                {activeSection === "personal" && (
                  <motion.button
                    type="button"
                    className="px-8 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-200 flex items-center gap-2"
                    onClick={handleAddEmployeeFromPersonal}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Add Employee</span>
                      </>
                    )}
                  </motion.button>
                )}

                <motion.button
                  type="submit"
                  className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeSection === "salary"
                          ? employee
                            ? "Update Employee"
                            : "Add Employee"
                          : "Next"}
                      </span>
                      {activeSection !== "salary" && (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      )}
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Preview Employee Details
              </h2>
              <button
                onClick={() => setPreviewModal({ show: false })}
                className="text-gray-500 hover:text-gray-700"
              >
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
