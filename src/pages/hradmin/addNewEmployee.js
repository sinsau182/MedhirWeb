import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { motion } from "framer-motion";
import {
  FiUser,
  FiBook,
  FiCreditCard,
  FiUpload,
  FiCheck,
  FiX,
  FiLoader,
} from "react-icons/fi";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
import axios from "axios";
import DepartmentFormModal from "@/components/Forms/DepartmentFormModal";
import DesignationFormModal from "@/components/Forms/DesignationFormModal";
import { Listbox } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/20/solid";

// Add this CSS class to your global styles or component
const inputGroupClass = "flex flex-col gap-1 mb-2";
const inputLabelClass = "block text-sm font-medium text-gray-700 mb-1";
const inputClass =
  "w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-gray-50 outline-none text-gray-700 text-sm truncate overflow-hidden transition-all duration-200";

// Add a new class for modern select styling
const modernSelectClass =
  "bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 appearance-none transition-all duration-200 w-full h-[42px]";

const MultiSelect = ({ label, options, value }) => {
  return (
    <div className={inputGroupClass}>
      <label className={inputLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-not-allowed min-h-[42px] bg-gray-100`}
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
              <span className="text-gray-500">No weekly offs</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DepartmentSelect = ({
  label,
  options,
  value,
  onChange,
  onAddDepartment,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={inputLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px] overflow-hidden`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1 overflow-hidden">
            {value ? (
              <TruncatedText
                text={typeof value === "object" ? value.name : value}
                maxWidth="max-w-[200px]"
                className="text-gray-700"
                maxLength={20}
              />
            ) : (
              <span className="text-gray-500">Select department</span>
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
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto min-w-[250px]">
            <div
              className="px-4 py-2.5 cursor-pointer hover:bg-blue-100 text-blue-600 border-b border-gray-100 font-semibold"
              onClick={() => {
                setIsOpen(false);
                if (onAddDepartment) onAddDepartment();
              }}
            >
              + Add Department
            </div>
            {options.map((department) => (
              <div
                key={department.departmentId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.departmentId === department.departmentId
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => {
                  onChange(department);
                  setIsOpen(false);
                }}
              >
                <TruncatedText
                  text={department.name}
                  maxWidth="max-w-full"
                  className="text-gray-700"
                  maxLength={35}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DesignationSelect = ({
  label,
  options,
  value,
  onChange,
  onAddDesignation,
  disabled,
  placeholder,
  loading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if loading starts
  useEffect(() => {
    if (loading && isOpen) setIsOpen(false);
  }, [loading, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={
        inputGroupClass +
        (disabled || loading ? " opacity-60 pointer-events-none" : "")
      }
      ref={dropdownRef}
    >
      <label className={inputLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => {
            if (!disabled && !loading) setIsOpen(!isOpen);
          }}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {loading ? (
              <span className="flex items-center text-blue-500">
                <FiLoader className="animate-spin w-5 h-5 mr-2" />
                Loading...
              </span>
            ) : value ? (
              <TruncatedText
                text={typeof value === "object" ? value.name : value}
                maxWidth="max-w-[200px]"
                className="text-gray-700"
                maxLength={20}
              />
            ) : (
              <span className="text-gray-500">
                {placeholder || "Select designation"}
              </span>
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
        {isOpen && !disabled && !loading && (
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto min-w-[250px]">
            <div
              className="px-4 py-2.5 cursor-pointer hover:bg-blue-100 text-blue-600 border-b border-gray-100 font-semibold"
              onClick={() => {
                setIsOpen(false);
                if (onAddDesignation) onAddDesignation();
              }}
            >
              + Add Designation
            </div>
            {options.map((designation) => (
              <div
                key={designation.designationId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.designationId === designation.designationId
                    ? "bg-blue-50"
                    : ""
                }`}
                onClick={() => {
                  onChange({
                    designationId: designation.designationId,
                    name: designation.name,
                    manager: designation.manager,
                    overtimeEligible: designation.overtimeEligible,
                  });
                  setIsOpen(false);
                }}
              >
                <TruncatedText
                  text={designation.name}
                  maxWidth="max-w-full"
                  className="text-gray-700"
                  maxLength={35}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

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

// Helper function to truncate text and show tooltip
const TruncatedText = ({ text, maxWidth, className = "", maxLength = 25 }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!text) return null;

  // Clean debug text first
  const cleanText = text
    .replace(/[bedjw]{5,}/g, "") // Remove 5+ consecutive debug chars
    .replace(/\|.*$/, "") // Remove everything after pipe
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
  const isLongText = cleanText.length > maxLength;

  return (
    <div
      className={`${maxWidth} ${className} relative group`}
      onMouseEnter={() => isLongText && setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={isLongText ? "truncate block" : ""}
        title={isLongText ? cleanText : ""}
      >
        {isLongText ? `${cleanText.substring(0, maxLength)}...` : cleanText}
      </span>
      {showTooltip && isLongText && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-0 transform -translate-y-full max-w-xs break-words">
          {cleanText}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const ReportingManagerSelect = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={inputGroupClass} ref={dropdownRef}>
      <label className={inputLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <TruncatedText
                text={typeof value === "object" ? value.name : value}
                maxWidth="max-w-[200px]"
                className="text-gray-700"
                maxLength={20}
              />
            ) : (
              <span className="text-gray-500">Select manager</span>
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
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 min-w-[250px]">
            {options.map((manager) => (
              <div
                key={manager.employeeId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.employeeId === manager.employeeId ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  onChange({
                    employeeId: manager.employeeId,
                    name: manager.name,
                  });
                  setIsOpen(false);
                }}
              >
                <TruncatedText
                  text={manager.name}
                  maxWidth="max-w-full"
                  className="text-gray-700"
                  maxLength={35}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add a reusable confirmation modal component
function ConfirmationModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "bg-blue-600",
  icon,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>
        {icon && <div className="flex justify-center mb-2">{icon}</div>}
        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          {title}
        </h2>
        <p className="text-gray-600 mb-6 text-center">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`px-5 py-2 rounded-lg text-white ${confirmColor} hover:brightness-90`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeForm() {
  const company = sessionStorage.getItem("employeeCompanyId");

  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, err } = useSelector((state) => state.employees);

  const {
    activeMainTab,
    employee,
    activeSection: activeSectionParam,
  } = router.query;

  const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
  const [employeeId, setEmployeeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Keep sidebar expanded for HR pages
  const [previewModal, setPreviewModal] = useState({ show: false });
  const [activeSection, setActiveSection] = useState("personal");
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);
  const { publicRuntimeConfig } = getConfig();
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [isDesignationLoading, setIsDesignationLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    type: "",
    onConfirm: null,
  });
  // Add state for preview modal for Aadhar
  const [aadharPreview, setAadharPreview] = useState({
    open: false,
    imgUrl: "",
    number: "",
  });
  // Add state for preview modal for ID Proofs (generalized)
  const [docPreview, setDocPreview] = useState({
    open: false,
    imgUrl: "",
    number: "",
    label: "",
  });
  // Add state to track touched/blurred fields for instant validation
  const [idProofsTouched, setIdProofsTouched] = useState({});
  // Add state for PDF preview controls
  const [pdfControls, setPdfControls] = useState({ rotate: 0, zoom: 1 });
  // Add state for bank preview modal
  const [bankPreview, setBankPreview] = useState({
    open: false,
    imgUrl: "",
    file: null,
  });

  // Add department fetch on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const companyId = sessionStorage.getItem("employeeCompanyId");

        if (!companyId) {
          toast.error("Company ID not found");
          return;
        }

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/departments/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          // Clean debug text from department names
          const cleanedDepartments = response.data.map((dept) => ({
            ...dept,
            name: dept.name
              ? dept.name
                  .replace(/[bedjw]{5,}/g, "") // Remove 5+ consecutive debug chars
                  .replace(/\|.*$/, "") // Remove everything after pipe
                  .replace(/\s+/g, " ") // Normalize spaces
                  .trim()
              : dept.name,
          }));
          setDepartments(cleanedDepartments);
          if (response.data.length === 0) {
            toast.warning("No departments found for this company");
          }
        } else {
          toast.error("Invalid departments data received");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch departments"
        );
      }
    };

    fetchDepartments();
  }, [publicRuntimeConfig.apiURL]);

  // Clean any existing debug text in form data on component mount
  useEffect(() => {
    setFormData((prev) => {
      const cleaned = { ...prev };

      // Clean employee data
      if (cleaned.employee) {
        Object.keys(cleaned.employee).forEach((key) => {
          if (typeof cleaned.employee[key] === "string") {
            cleaned.employee[key] = cleanDebugText(cleaned.employee[key]);
          } else if (
            cleaned.employee[key] &&
            typeof cleaned.employee[key] === "object" &&
            cleaned.employee[key].name
          ) {
            cleaned.employee[key] = {
              ...cleaned.employee[key],
              name: cleanDebugText(cleaned.employee[key].name),
            };
          }
        });
      }

      return cleaned;
    });
  }, []);

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
      firstName: "",
      middleName: "",
      lastName: "",
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
      pfEnrolled: true,
      uanNumber: "",
      esicEnrolled: false,
      esicNumber: "",
    },
    companyId: company,
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
        setFormData((prevFormData) => ({
          ...prevFormData,
          employee: {
            ...prevFormData.employee,
            firstName: parsedEmployee.firstName || "",
            middleName: parsedEmployee.middleName || "",
            lastName: parsedEmployee.lastName || "",
            fathersName: parsedEmployee.fathersName || "",
            gender: parsedEmployee.gender || "",
            phone: parsedEmployee.phone || "",
            alternatePhone: parsedEmployee.alternatePhone || "",
            emailPersonal: parsedEmployee.emailPersonal || "",
            emailOfficial: parsedEmployee.emailOfficial || "",
            currentAddress: parsedEmployee.currentAddress || "",
            permanentAddress: parsedEmployee.permanentAddress || "",
            department: {
              departmentId: parsedEmployee.department,
              name: parsedEmployee.departmentName,
            },
            designation: {
              designationId: parsedEmployee.designation,
              name: parsedEmployee.designationName,
            },
            joiningDate: parsedEmployee.joiningDate || "",
            reportingManager: parsedEmployee.reportingManager
              ? {
                  employeeId: parsedEmployee.reportingManager,
                  name: parsedEmployee.reportingManagerName,
                }
              : "",
            overtimeEligibile: Boolean(parsedEmployee.overtimeEligibile),
            weeklyOffs: Array.isArray(parsedEmployee.weeklyOffs)
              ? parsedEmployee.weeklyOffs
              : [],
            employeeImgUrl: parsedEmployee.employeeImgUrl || "",
            pfEnrolled: Boolean(parsedEmployee.pfEnrolled),
            uanNumber: parsedEmployee.uanNumber || "",
            esicEnrolled: Boolean(parsedEmployee.esicEnrolled),
            esicNumber: parsedEmployee.esicNumber || "",
          },
          companyId: parsedEmployee.companyId || company,
          idProofs: {
            aadharNo: parsedEmployee.idProofs?.aadharNo || "",
            aadharImgUrl: parsedEmployee.idProofs?.aadharImgUrl || null,
            panNo: parsedEmployee.idProofs?.panNo || "",
            pancardImgUrl: parsedEmployee.idProofs?.pancardImgUrl || null,
            passport: parsedEmployee.idProofs?.passport || "",
            passportImgUrl: parsedEmployee.idProofs?.passportImgUrl || null,
            drivingLicense: parsedEmployee.idProofs?.drivingLicense || "",
            drivingLicenseImgUrl:
              parsedEmployee.idProofs?.drivingLicenseImgUrl || null,
            voterId: parsedEmployee.idProofs?.voterId || "",
            voterIdImgUrl: parsedEmployee.idProofs?.voterIdImgUrl || null,
          },
          bankDetails: {
            accountNumber: parsedEmployee.bankDetails?.accountNumber || "",
            accountHolderName:
              parsedEmployee.bankDetails?.accountHolderName || "",
            ifscCode: parsedEmployee.bankDetails?.ifscCode || "",
            bankName: parsedEmployee.bankDetails?.bankName || "",
            branchName: parsedEmployee.bankDetails?.branchName || "",
            upiId: parsedEmployee.bankDetails?.upiId || "",
            upiPhoneNumber: parsedEmployee.bankDetails?.upiPhoneNumber || "",
            passbookImgUrl: parsedEmployee.bankDetails?.passbookImgUrl || "",
          },
          salaryDetails: {
            annualCtc: parsedEmployee.salaryDetails?.annualCtc || "",
            monthlyCtc: parsedEmployee.salaryDetails?.monthlyCtc || "",
            basicSalary: parsedEmployee.salaryDetails?.basicSalary || "",
            hra: parsedEmployee.salaryDetails?.hra || "",
            allowances: parsedEmployee.salaryDetails?.allowances || "",
            employerPfContribution:
              parsedEmployee.salaryDetails?.employerPfContribution || "",
            employeePfContribution:
              parsedEmployee.salaryDetails?.employeePfContribution || "",
          },
        }));

        setEmployeeId(parsedEmployee.employeeId);
      } catch (error) {
        toast.error("Error loading employee data");
      }
    }
  }, [employee, company]);

  const calculatePFContributions = (basicSalary) => {
    const basic = parseFloat(basicSalary) || 0;
    return {
      employer: (basic * 0.12).toFixed(2), // 12% of basic salary
      employee: (basic * 0.12).toFixed(2), // 12% of basic salary
    };
  };

  const calculateSalaryDetails = (annualCtc, basicSalary) => {
    const annual = parseFloat(annualCtc) || 0;
    const basic = parseFloat(basicSalary) || 0;

    // Calculate monthly CTC
    const monthlyCtc = (annual / 12).toFixed(2);

    // Calculate HRA (40% of basic)
    const hra = (basic * 0.4).toFixed(2);

    // Calculate PF contributions if enrolled
    const pfContributions = formData.employee.pfEnrolled
      ? calculatePFContributions(basic)
      : { employer: 0, employee: 0 };

    // Calculate allowances
    const allowances = (
      parseFloat(monthlyCtc) -
      parseFloat(basic) -
      parseFloat(hra) -
      parseFloat(pfContributions.employee)
    ).toFixed(2);

    return {
      monthlyCtc,
      hra,
      allowances,
      employerPfContribution: pfContributions.employer,
      employeePfContribution: pfContributions.employee,
    };
  };

  // Function to clean debug text from any string value
  const cleanDebugText = (text) => {
    if (typeof text !== "string") return text;
    // More aggressive cleaning - remove any repetitive patterns
    return text
      .replace(/[bedjw]{5,}/g, "") // Remove 5+ consecutive debug chars
      .replace(/\|.*$/, "") // Remove everything after pipe
      .replace(/\s+/g, " ") // Normalize spaces
      .trim();
  };

  const handleInputChange = (section, field, value) => {
    // For address fields and Father Name, do not trim or clean spaces on input
    const isFreeSpaceField =
      (section === "employee" &&
        (field === "currentAddress" ||
          field === "permanentAddress" ||
          field === "fathersName")) ||
      (section === "bankDetails" &&
        (field === "accountHolderName" ||
          field === "bankName" ||
          field === "branchName" ||
          field === "upiPhoneNumber"));

    const cleanedValue =
      !isFreeSpaceField && typeof value === "string"
        ? cleanDebugText(value)
        : value;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: cleanedValue,
        },
      };

      // Calculate salary details when annual CTC or basic salary changes
      if (section === "salaryDetails") {
        if (field === "annualCtc" || field === "basicSalary") {
          const salaryDetails = calculateSalaryDetails(
            field === "annualCtc" ? value : updatedData.salaryDetails.annualCtc,
            field === "basicSalary"
              ? value
              : updatedData.salaryDetails.basicSalary
          );

          updatedData.salaryDetails = {
            ...updatedData.salaryDetails,
            ...salaryDetails,
          };
        }
      }

      return updatedData;
    });

    // Clear validation error immediately when user makes changes
    if (section === "employee" && fieldTouched[field]) {
      const errors = validatePersonalDetails({
        ...formData.employee,
        [field]: cleanedValue,
      });
      setValidationErrors((prev) => ({
        ...prev,
        [field]: errors[field],
      }));
    }

    // Debounced uniqueness check for emailPersonal and phone
    if (
      section === "employee" &&
      (field === "emailPersonal" || field === "phone")
    ) {
      // If editing an employee, only check if the field value has actually changed
      if (employee) {
        try {
          const parsedEmployee = JSON.parse(employee);
          const currentEmail = parsedEmployee.emailPersonal;
          const currentPhone = parsedEmployee.phone;

          // Only check the field that was actually changed
          if (field === "emailPersonal" && value !== currentEmail) {
            // Only check email existence
            debouncedCheckUniqueness(value, "");
          } else if (field === "phone" && value !== currentPhone) {
            // Only check phone existence
            debouncedCheckUniqueness("", value);
          }
          // If value hasn't changed, don't run any check - keep existing errors
        } catch (error) {
          // If parsing fails, run the check anyway
          debouncedCheckUniqueness(
            field === "emailPersonal" ? value : formData.employee.emailPersonal,
            field === "phone" ? value : formData.employee.phone
          );
        }
      } else {
        // For new employees, check the field being edited
        if (field === "emailPersonal") {
          debouncedCheckUniqueness(value, "");
        } else if (field === "phone") {
          debouncedCheckUniqueness("", value);
        }
      }
    }
  };

  const prepareFormData = (obj) => {
    const cleanObj = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof File)
        ) {
          // Handle nested objects (like idProofs, bankDetails, etc.)
          const nestedClean = prepareFormData(value);
          if (Object.keys(nestedClean).length > 0) {
            cleanObj[key] = nestedClean;
          }
        } else if (value instanceof File) {
          // Skip File objects as they'll be handled separately in FormData
          return;
        } else if (Array.isArray(value)) {
          // Handle arrays
          cleanObj[key] = value;
        } else {
          // Handle primitive values
          cleanObj[key] = value;
        }
      }
    });
    return cleanObj;
  };

  // Add validation patterns for ID proofs
  const idProofPatterns = {
    aadharNo: /^[0-9]{12}$/,
    panNo: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    passport: /^[A-Z]{1}[0-9]{7}$/,
    drivingLicense: /^[A-Z]{2}[0-9]{2}[0-9]{11}$/,
    voterId: /^[A-Z]{3}[0-9]{7}$/,
  };

  // Add validation function for ID proofs
  const validateIdProofs = (idProofs) => {
    const errors = {};
    Object.entries(idProofs).forEach(([key, value]) => {
      // Skip validation for image fields
      if (key.toLowerCase().includes("imgurl")) {
        return;
      }

      // Convert value to string and trim if it's not null/undefined
      const stringValue = value ? String(value).trim() : "";

      if (stringValue !== "") {
        const pattern = idProofPatterns[key];
        if (pattern && !pattern.test(stringValue)) {
          errors[key] = `Invalid ${key
            .replace(/([A-Z])/g, " $1")
            .toLowerCase()} format`;
        }
      }
    });
    return errors;
  };

  const handleSaveAndExit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Validate all required fields
    const errors = {};
    if (!formData.employee.firstName?.trim())
      errors.firstName = "First Name is required";
    if (!formData.employee.lastName?.trim())
      errors.lastName = "Last Name is required";
    if (!formData.employee.phone?.trim())
      errors.phone = "Phone Number is required";
    if (!formData.employee.joiningDate)
      errors.joiningDate = "Date of Joining is required";
    if (!formData.employee.emailPersonal?.trim())
      errors.emailPersonal = "Personal Email is required";
    // Add more required fields as needed

    const missingFields = Object.keys(errors);
    if (missingFields.length > 0) {
      // Mark all missing fields as touched to show red border
      setFieldTouched((prev) => ({
        ...prev,
        ...missingFields.reduce((acc, field) => {
          acc[field] = true;
          return acc;
        }, {}),
      }));
      // Set validation errors for all missing fields
      setValidationErrors((prev) => ({
        ...prev,
        ...missingFields.reduce((acc, field) => {
          acc[field] = errors[field];
          return acc;
        }, {}),
      }));
      // If not on personal tab, navigate to it
      if (activeSection !== "personal") setActiveSection("personal");
      // Show a separate toast for each missing field
      missingFields.forEach((field) => {
        toast.error(errors[field]);
      });
      return;
    }

    // After personal details validation, add ID Proofs validation
    const idProofFields = [
      { key: "aadharNo", img: "aadharImgUrl", label: "Aadhar" },
      { key: "panNo", img: "pancardImgUrl", label: "PAN" },
      { key: "passport", img: "passportImgUrl", label: "Passport" },
      {
        key: "drivingLicense",
        img: "drivingLicenseImgUrl",
        label: "Driving License",
      },
      { key: "voterId", img: "voterIdImgUrl", label: "Voter ID" },
    ];
    let idProofError = false;
    let idProofTouched = {};
    let idProofValidationErrors = {};

    idProofFields.forEach(({ key, img, label }) => {
      const number = formData.idProofs[key];
      const file = formData.idProofs[img];
      if ((number && !file) || (!number && file)) {
        idProofError = true;
        idProofTouched[key] = true;
        idProofTouched[img] = true;
        if (!number && file) {
          idProofValidationErrors[
            key
          ] = `${label} Number is required if you upload a document.`;
          toast.error(`${label} Number is required if you upload a document.`);
        }
        if (number && !file) {
          idProofValidationErrors[
            img
          ] = `${label} document is required if you enter a number.`;
          toast.error(`${label} document is required if you enter a number.`);
        }
      }
    });

    if (idProofError) {
      // Mark all touched for id proofs
      setIdProofsTouched((prev) => ({ ...prev, ...idProofTouched }));
      setValidationErrors((prev) => ({ ...prev, ...idProofValidationErrors }));
      // If not on ID Proofs tab, navigate to it
      if (activeSection !== "idProofs") setActiveSection("idProofs");
      return;
    }

    // After ID Proofs validation, add Bank Details validation
    const accountFields = [
      { key: "accountNumber", label: "Account Number" },
      { key: "accountHolderName", label: "Account Holder Name" },
      { key: "ifscCode", label: "IFSC Code" },
      { key: "bankName", label: "Bank Name" },
      { key: "branchName", label: "Branch Name" },
      { key: "passbookImgUrl", label: "Passbook/Cancelled Cheque" },
    ];
    const upiFields = [
      { key: "upiId", label: "UPI ID" },
      { key: "upiPhoneNumber", label: "UPI Contact Name" },
    ];
    const bankVals = formData.bankDetails;
    const anyAccountFilled = accountFields.some(
      (f) => bankVals[f.key] && bankVals[f.key].toString().trim() !== ""
    );
    const anyUPIFilled = upiFields.some(
      (f) => bankVals[f.key] && bankVals[f.key].toString().trim() !== ""
    );
    let bankError = false;
    let bankTouched = {};
    let bankValidationErrors = {};

    if (anyAccountFilled && anyUPIFilled) {
      // All account and UPI fields required
      accountFields.forEach((f) => {
        if (!bankVals[f.key] || bankVals[f.key].toString().trim() === "") {
          bankError = true;
          bankTouched[f.key] = true;
          bankValidationErrors[f.key] = `${f.label} is required.`;
          toast.error(`${f.label} is required.`);
        }
      });
      upiFields.forEach((f) => {
        if (!bankVals[f.key] || bankVals[f.key].toString().trim() === "") {
          bankError = true;
          bankTouched[f.key] = true;
          bankValidationErrors[f.key] = `${f.label} is required.`;
          toast.error(`${f.label} is required.`);
        }
      });
    } else if (anyAccountFilled) {
      // All account fields required
      accountFields.forEach((f) => {
        if (!bankVals[f.key] || bankVals[f.key].toString().trim() === "") {
          bankError = true;
          bankTouched[f.key] = true;
          bankValidationErrors[f.key] = `${f.label} is required.`;
          toast.error(`${f.label} is required.`);
        }
      });
    } else if (anyUPIFilled) {
      // Both UPI fields required
      upiFields.forEach((f) => {
        if (!bankVals[f.key] || bankVals[f.key].toString().trim() === "") {
          bankError = true;
          bankTouched[f.key] = true;
          bankValidationErrors[f.key] = `${f.label} is required.`;
          toast.error(`${f.label} is required.`);
        }
      });
    }

    if (bankError) {
      setBankTouched((prev) => ({ ...prev, ...bankTouched }));
      setValidationErrors((prev) => ({ ...prev, ...bankValidationErrors }));
      if (activeSection !== "bank") setActiveSection("bank");
      return;
    }
    // Clear touched and errors for bank fields if nothing is filled
    if (!anyAccountFilled && !anyUPIFilled) {
      setBankTouched((prev) => ({
        ...prev,
        accountNumber: false,
        accountHolderName: false,
        ifscCode: false,
        bankName: false,
        branchName: false,
        passbookImgUrl: false,
        upiId: false,
        upiPhoneNumber: false,
      }));
      setValidationErrors((prev) => ({
        ...prev,
        accountNumber: "",
        accountHolderName: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        passbookImgUrl: "",
        upiId: "",
        upiPhoneNumber: "",
      }));
    }

    // After all tab validations and before setLoading(true):
    const hasAnyValidationError = Object.values(validationErrors).some(
      (v) => v && v.toString().trim() !== ""
    );
    if (hasAnyValidationError) {
      console.log("Validation Errors:", validationErrors);
      toast.error("Please fix all validation errors before submitting.");
      // Try to navigate to the first tab with a validation error
      const tabFieldMap = [
        {
          tab: "personal",
          fields: [
            "firstName",
            "middleName",
            "lastName",
            "fathersName",
            "gender",
            "phone",
            "alternatePhone",
            "emailPersonal",
            "emailOfficial",
            "currentAddress",
            "permanentAddress",
            "joiningDate",
            "department",
            "designation",
            "reportingManager",
            "weeklyOffs",
            "pfEnrolled",
            "uanNumber",
            "esicEnrolled",
            "esicNumber",
          ],
        },
        {
          tab: "idProofs",
          fields: [
            "aadharNo",
            "aadharImgUrl",
            "panNo",
            "pancardImgUrl",
            "passport",
            "passportImgUrl",
            "drivingLicense",
            "drivingLicenseImgUrl",
            "voterId",
            "voterIdImgUrl",
          ],
        },
        {
          tab: "bank",
          fields: [
            "accountNumber",
            "accountHolderName",
            "ifscCode",
            "bankName",
            "branchName",
            "passbookImgUrl",
            "upiId",
            "upiPhoneNumber",
          ],
        },
        { tab: "salary", fields: ["annualCtc", "basicSalary"] },
      ];
      for (const { tab, fields } of tabFieldMap) {
        if (
          fields.some(
            (f) =>
              validationErrors[f] &&
              validationErrors[f].toString().trim() !== ""
          )
        ) {
          setActiveSection(tab);
          break;
        }
      }
      return;
    }

    // Check for uniqueness errors
    if (uniquenessErrors.emailPersonal || uniquenessErrors.phone) {
      toast.error("Please fix uniqueness errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const submitFormData = new FormData();

      // Prepare form data with only filled fields
      const baseEmployeeData = {
        ...(formData.employee.employeeId && {
          employeeId: formData.employee.employeeId,
        }),
        firstName: formData.employee.firstName?.trim(),
        middleName: formData.employee.middleName?.trim(),
        lastName: formData.employee.lastName?.trim(),
        phone: formData.employee.phone?.trim(),
        joiningDate: formData.employee.joiningDate,
        department: formData.employee.department?.departmentId,
        designation: formData.employee.designation?.designationId,
        // Include other fields only if they have values
        ...(formData.employee.fathersName && {
          fathersName: formData.employee.fathersName.trim(),
        }),
        ...(formData.employee.gender && {
          gender: formData.employee.gender,
        }),
        ...(formData.employee.alternatePhone && {
          alternatePhone: formData.employee.alternatePhone.trim(),
        }),
        ...(formData.employee.emailPersonal && {
          emailPersonal: formData.employee.emailPersonal.trim(),
        }),
        ...(formData.employee.emailOfficial && {
          emailOfficial: formData.employee.emailOfficial.trim(),
        }),
        ...(formData.employee.currentAddress && {
          currentAddress: formData.employee.currentAddress.trim(),
        }),
        ...(formData.employee.permanentAddress && {
          permanentAddress: formData.employee.permanentAddress.trim(),
        }),
        ...(formData.employee.reportingManager?.employeeId && {
          reportingManager: formData.employee.reportingManager.employeeId,
          reportingManagerName: formData.employee.reportingManager.name,
        }),
        overtimeEligibile: Boolean(formData.employee.overtimeEligibile),
        weeklyOffs: formData.employee.weeklyOffs?.length
          ? formData.employee.weeklyOffs
          : [],
        pfEnrolled: Boolean(formData.employee.pfEnrolled),
        ...(formData.employee.uanNumber && {
          uanNumber: formData.employee.uanNumber.trim(),
        }),
        esicEnrolled: Boolean(formData.employee.esicEnrolled),
        ...(formData.employee.esicNumber && {
          esicNumber: formData.employee.esicNumber.trim(),
        }),
        companyId: formData.companyId,
      };

      // Handle ID proofs separately to ensure proper format
      const idProofsData = {};
      Object.entries(formData.idProofs).forEach(([key, value]) => {
        if (value instanceof File) {
          // Skip File objects as they'll be handled separately
          return;
        }
        if (value && typeof value === "string") {
          idProofsData[key] = value.trim();
        }
      });
      if (Object.keys(idProofsData).length > 0) {
        baseEmployeeData.idProofs = idProofsData;
      }

      // Handle bank details
      if (
        Object.keys(formData.bankDetails).some(
          (key) => formData.bankDetails[key]
        )
      ) {
        const bankDetailsData = {};
        Object.entries(formData.bankDetails).forEach(([key, value]) => {
          if (value instanceof File) {
            // Skip File objects as they'll be handled separately
            return;
          }
          // Always include string URLs for passbookImgUrl if present
          if (key === "passbookImgUrl" && typeof value === "string" && value) {
            bankDetailsData[key] = value;
            return;
          }
          if (
            value &&
            typeof value === "string" &&
            !key.toLowerCase().includes("imgurl")
          ) {
            bankDetailsData[key] = value.trim();
          }
        });
        if (Object.keys(bankDetailsData).length > 0) {
          baseEmployeeData.bankDetails = bankDetailsData;
        }
      }

      // Handle salary details
      if (
        Object.keys(formData.salaryDetails).some(
          (key) => formData.salaryDetails[key]
        )
      ) {
        baseEmployeeData.salaryDetails = prepareFormData(
          formData.salaryDetails
        );
      }

      const employeeData = prepareFormData(baseEmployeeData);
      submitFormData.append("employee", JSON.stringify(employeeData));

      // Handle file uploads only if they exist
      if (formData.employee.employeeImgUrl instanceof File) {
        submitFormData.append("profileImage", formData.employee.employeeImgUrl);
      }

      // Handle ID proof files
      const idProofMappings = {
        aadharImgUrl: "aadharImage",
        pancardImgUrl: "panImage",
        passportImgUrl: "passportImage",
        drivingLicenseImgUrl: "drivingLicenseImage",
        voterIdImgUrl: "voterIdImage",
      };

      Object.entries(idProofMappings).forEach(([formField, apiField]) => {
        const fileOrUrl = formData.idProofs[formField];
        if (fileOrUrl instanceof File) {
          submitFormData.append(apiField, fileOrUrl);
        }
      });

      if (formData.bankDetails.passbookImgUrl instanceof File) {
        submitFormData.append(
          "passbookImage",
          formData.bankDetails.passbookImgUrl
        );
      }

      if (employeeId) {
        const result = await dispatch(
          updateEmployee({
            id: employeeId,
            updatedData: submitFormData,
          })
        ).unwrap();
        if (result) {
          toast.success("Employee updated successfully");
          router.push("/hradmin/employees");
          return;
        }
      } else {
        const result = await dispatch(createEmployee(submitFormData)).unwrap();
        if (result) {
          toast.success("Employee created successfully");
          router.push("/hradmin/employees");
          return;
        }
      }
    } catch (err) {
      let errorMessage = "An error occurred";
      if (err?.validationErrors) {
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

  const formRefs = {
    firstName: useRef(),
    middleName: useRef(),
    lastName: useRef(),
    fathersName: useRef(),
    gender: useRef(),
    phone: useRef(),
    alternatePhone: useRef(),
    emailPersonal: useRef(),
    emailOfficial: useRef(),
    currentAddress: useRef(),
    permanentAddress: useRef(),
    joiningDate: useRef(),
  };

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});

  // Validation functions
  const validateName = (value, required = true, maxLength = 30) => {
    if (!value || value.trim() === "")
      return required ? "This field is required." : "";
    if (!/^[A-Za-z ]+$/.test(value))
      return "Only alphabets and spaces allowed.";
    if (value.trim().length < 2) return "Must be at least 2 characters.";
    if (value.trim().length > maxLength)
      return `Maximum ${maxLength} characters allowed.`;
    return "";
  };

  const validatePhone = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "Phone number is required." : "";
    if (!/^[0-9]+$/.test(value)) return "Only numbers allowed.";
    if (value.length !== 10) return "Phone number must be exactly 10 digits.";
    return "";
  };

  const validateEmail = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "Email is required." : "";
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(value)) return "Enter a valid email address.";
    if (value.length > 50) return "Email must be less than 50 characters.";
    return "";
  };

  const validateAddress = (value, required = false, maxLength = 200) => {
    if (!value || value.trim() === "")
      return required ? "Address is required." : "";
    if (value.trim().length < 10)
      return "Address must be at least 10 characters.";
    if (value.trim().length > maxLength)
      return `Maximum ${maxLength} characters allowed.`;
    return "";
  };

  const validateDate = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "Date is required." : "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "Please enter a valid date.";
    return "";
  };

  const validateUAN = (value, required = false) => {
    if (!value || value.trim() === "")
      return required ? "UAN number is required." : "";
    if (!/^[0-9]+$/.test(value)) return "Only numbers allowed.";
    if (value.length !== 12) return "UAN number must be exactly 12 digits.";
    return "";
  };

  // Smart email suggestion function
  const getEmailSuggestion = (value) => {
    if (!value || value.includes("@")) return null;
    const cleanValue = value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    if (cleanValue.length < 2) return null;
    return `${cleanValue}@gmail.com`;
  };

  // Input filtering functions
  const filterNameInput = (value) => {
    return value.replace(/[^A-Za-z ]/g, "").slice(0, 30);
  };

  const filterPhoneInput = (value) => {
    return value.replace(/[^0-9]/g, "").slice(0, 10);
  };

  const filterEmailInput = (value) => {
    return value.replace(/[^a-zA-Z0-9@._%+-]/g, "").slice(0, 50);
  };

  const filterUANInput = (value) => {
    return value.replace(/[^0-9]/g, "").slice(0, 12);
  };

  // Validate all personal fields
  const validatePersonalDetails = (data) => {
    return {
      firstName: validateName(data.firstName, true),
      middleName: validateName(data.middleName, false),
      lastName: validateName(data.lastName, true),
      fathersName: validateName(data.fathersName, false),
      gender: !data.gender ? "Please select a gender." : "",
      phone: validatePhone(data.phone, true),
      alternatePhone: validatePhone(data.alternatePhone, false),
      emailPersonal: validateEmail(data.emailPersonal, true),
      emailOfficial: validateEmail(data.emailOfficial, false),
      currentAddress: validateAddress(data.currentAddress, false),
      permanentAddress: validateAddress(data.permanentAddress, false),
      joiningDate: validateDate(data.joiningDate, true),
      uanNumber: data.pfEnrolled ? validateUAN(data.uanNumber, true) : "",
      esicNumber: data.esicEnrolled ? validateUAN(data.esicNumber, true) : "",
    };
  };

  // Helper function to get border color class based on field state
  const getFieldBorderClass = (fieldName, value, touched, error) => {
    if (!touched)
      return "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
    if (error) return "border-red-500 focus:border-red-500 focus:ring-red-500";
    if (value && value.toString().trim() !== "")
      return "border-green-500 focus:border-green-500 focus:ring-green-500";
    return "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
  };

  // On blur/change handlers
  const handlePersonalFieldBlur = (field) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validatePersonalDetails(formData.employee);
    setValidationErrors((prev) => ({
      ...prev,
      [field]: errors[field],
    }));
  };

  // On submit, validate and scroll to first error
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const errors = validatePersonalDetails(formData.employee);
    setValidationErrors(errors);
    setFieldTouched((prev) => ({
      ...prev,
      ...Object.keys(errors).reduce((acc, k) => {
        acc[k] = true;
        return acc;
      }, {}),
    }));
    const firstErrorField = Object.keys(errors).find((key) => errors[key]);
    if (firstErrorField) {
      formRefs[firstErrorField]?.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      formRefs[firstErrorField]?.current?.focus?.();
      return;
    }
    // ...existing handleSubmit logic...
  };

  useEffect(() => {
    if (activeMainTab) setActiveMain(activeMainTab);
    if (activeSectionParam) setActiveSection(activeSectionParam);
  }, [activeMainTab, activeSectionParam]);

  const handleFileUpload = (documentType, file) => {
    if (file) {
      // Restrict file size to 5MB
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB.");
        return;
      }
      // Create a preview URL for the file
      const previewUrl = URL.createObjectURL(file);

      // Map document type to the correct field names
      const fieldMappings = {
        aadharNo: { imgField: "aadharImgUrl" },
        panNo: { imgField: "pancardImgUrl" },
        passport: { imgField: "passportImgUrl" },
        drivingLicense: { imgField: "drivingLicenseImgUrl" },
        voterId: { imgField: "voterIdImgUrl" },
        passbookImgUrl: { imgField: "passbookImgUrl" },
      };

      const fields = fieldMappings[documentType];
      if (!fields) return;

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [documentType === "passbookImgUrl" ? "bankDetails" : "idProofs"]: {
            ...(documentType === "passbookImgUrl"
              ? prev.bankDetails
              : prev.idProofs),
            [fields.imgField]: file, // Store the File object for upload
          },
        };

        return updatedData;
      });
    }
  };

  // Move these functions before the sections array definition
  const checkPersonalDetailsCompletion = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "phone",
      "joiningDate",
      "department",
      "designation",
      "currentAddress",
      "gender",
      "fathersName",
      "alternatePhone",
      "emailPersonal",
      "emailOfficial",
      "permanentAddress",
    ];
    return requiredFields.every((field) => {
      const value = formData.employee[field];
      return value && value.toString().trim() !== "";
    });
  };

  const checkIdProofsCompletion = () => {
    return Boolean(
      formData.idProofs.aadharNo?.trim() &&
        formData.idProofs.panNo?.trim() &&
        formData.idProofs.passport?.trim() &&
        formData.idProofs.drivingLicense?.trim() &&
        formData.idProofs.voterId?.trim()
    );
  };

  const checkBankDetailsCompletion = () => {
    const requiredFields = [
      "accountNumber",
      "accountHolderName",
      "ifscCode",
      "bankName",
      "branchName",
      "passbookImgUrl",
      "upiId",
      "upiPhoneNumber",
    ];
    return requiredFields.every((field) => {
      const value = formData.bankDetails[field];
      return value && value.toString().trim() !== "";
    });
  };

  const checkSalaryDetailsCompletion = () => {
    const requiredFields = ["annualCtc", "basicSalary"];
    return requiredFields.every((field) => {
      const value = formData.salaryDetails[field];
      return value && value.toString().trim() !== "";
    });
  };

  // Then define the sections array using these functions
  const sections = [
    {
      id: "personal",
      label: "Personal Details",
      icon: FiUser,
      checkCompletion: checkPersonalDetailsCompletion,
    },
    {
      id: "idProofs",
      label: "ID Proofs",
      icon: FiBook,
      checkCompletion: checkIdProofsCompletion,
    },
    {
      id: "bank",
      label: "Bank Details",
      icon: FiCreditCard,
      checkCompletion: checkBankDetailsCompletion,
    },
    {
      id: "salary",
      label: "Salary",
      icon: "₹",
      checkCompletion: checkSalaryDetailsCompletion,
    },
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

  // Add useEffect for fetching designations when department changes
  useEffect(() => {
    const fetchDesignations = async () => {
      try {
        setIsDesignationLoading(true);
        // Get department ID from either object or string format
        const deptId =
          typeof formData.employee.department === "object"
            ? formData.employee.department.departmentId
            : formData.employee.department;

        if (!deptId) {
          setDesignations([]);
          setIsDesignationLoading(false);
          return;
        }

        const token = getItemFromSessionStorage("token", null);

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/api/designations/department/${deptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setDesignations(response.data);
          if (response.data.length === 0) {
            toast.warning("No designations found for this department");
          }
        } else {
          toast.error("Invalid designations data received");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch designations"
        );
      } finally {
        setIsDesignationLoading(false);
      }
    };

    fetchDesignations();
  }, [formData.employee.department, publicRuntimeConfig.apiURL]);

  // Fetch managers when department changes
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);

        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/employees/managers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data && Array.isArray(response.data)) {
          setManagers(response.data);
          if (response.data.length === 0) {
            toast.warning("No managers found for this department");
          }
        } else {
          toast.error("Invalid managers data received");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch managers"
        );
      }
    };

    fetchManagers();
  }, [publicRuntimeConfig.apiURL]);

  const handleDepartmentAdded = (newDepartment) => {
    // Refetch departments and select the new one
    const fetchDepartments = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const companyId = sessionStorage.getItem("employeeCompanyId");
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/departments/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
          // Auto-select the new department
          const created = response.data.find(
            (d) => d.name === newDepartment.name
          );
          if (created) {
            handleInputChange("employee", "department", {
              departmentId: created.departmentId,
              name: created.name,
            });
            // Set weekly holidays as read-only weekly offs
            const weeklyHolidays = created.weeklyHolidays
              ? created.weeklyHolidays.split(",")
              : [];
            handleInputChange("employee", "weeklyOffs", weeklyHolidays);
            // Clear designation and manager when department changes
            handleInputChange("employee", "designation", null);
            // handleInputChange("employee", "reportingManager", null); // Removed to make reporting manager independent
          }
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch departments"
        );
      }
    };
    fetchDepartments();
  };

  const handleDesignationAdded = (newDesignation) => {
    // Refetch designations for the selected department and select the new one
    const fetchDesignationsForDepartment = async () => {
      try {
        setIsDesignationLoading(true);
        // Get department ID from either object or string format
        const deptId =
          typeof formData.employee.department === "object"
            ? formData.employee.department.departmentId
            : formData.employee.department;
        if (!deptId) {
          setDesignations([]);
          setIsDesignationLoading(false);
          return;
        }
        const token = getItemFromSessionStorage("token", null);
        const response = await axios.get(
          `${publicRuntimeConfig.apiURL}/api/designations/department/${deptId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setDesignations(response.data);
          // Auto-select the new designation (by id or name)
          let created = null;
          if (newDesignation.designationId) {
            created = response.data.find(
              (d) => d.designationId === newDesignation.designationId
            );
          }
          if (!created) {
            created = response.data.find((d) => d.name === newDesignation.name);
          }
          if (created) {
            handleInputChange("employee", "designation", {
              designationId: created.designationId,
              name: created.name,
              manager: created.manager,
              overtimeEligible: created.overtimeEligible,
            });
          }
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to fetch designations"
        );
      } finally {
        setIsDesignationLoading(false);
      }
    };
    fetchDesignationsForDepartment();
  };

  // In EmployeeForm, add gender options and state for Listbox
  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  // Modal open handlers
  const handleOpenModal = (type, onConfirm) => {
    setModal({ open: true, type, onConfirm });
  };
  const handleCloseModal = () =>
    setModal({ open: false, type: "", onConfirm: null });

  // Modal content map
  const modalContent = {
    cancel: {
      title: "Cancel Changes?",
      message: "Are you sure you want to cancel? Unsaved changes will be lost.",
      confirmText: "Yes, Cancel",
      confirmColor: "bg-red-600",
      icon: <FiX className="w-8 h-8 text-red-500 mx-auto" />,
    },
    saveContinue: {
      title: "Save and Continue?",
      message: "Do you want to save and continue to the next section?",
      confirmText: "Save and Continue",
      confirmColor: "bg-blue-600",
      icon: <FiCheck className="w-8 h-8 text-blue-500 mx-auto" />,
    },
    saveExit: {
      title: "Save and Exit?",
      message: "Do you want to save and exit? Your progress will be saved.",
      confirmText: "Save and Exit",
      confirmColor: "bg-green-600",
      icon: <FiCheck className="w-8 h-8 text-green-500 mx-auto" />,
    },
  };

  // Add validation patterns and help text for each document type
  const docFieldMeta = {
    aadharNo: {
      label: "Aadhar",
      maxLength: 12,
      pattern: /^[0-9]{0,12}$/,
      help: "12 digits required",
      inputMode: "numeric",
      toUpper: false,
      allowed: (v) => v.replace(/[^0-9]/g, ""),
      validate: (v) => v.length === 12,
      error: "Aadhar number must be 12 digits.",
    },
    panNo: {
      label: "PAN",
      maxLength: 10,
      pattern: /^[A-Z0-9]{0,10}$/,
      help: "Format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)",
      inputMode: "text",
      toUpper: true,
      allowed: (v) => v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      validate: (v) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v),
      error: "PAN must be in format: 5 letters, 4 digits, 1 letter.",
    },
    passport: {
      label: "Passport",
      maxLength: 8,
      pattern: /^[A-Z0-9]{0,8}$/,
      help: "Format: 1 letter, 7 digits (e.g., A1234567)",
      inputMode: "text",
      toUpper: true,
      allowed: (v) => v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      validate: (v) => /^[A-Z]{1}[0-9]{7}$/.test(v),
      error: "Passport must be 1 letter followed by 7 digits.",
    },
    drivingLicense: {
      label: "Driving License",
      maxLength: 15,
      pattern: /^[A-Z0-9]{0,15}$/,
      help: "Format: 2 letters, 2 digits, 11 digits (e.g., AB1212345678901)",
      inputMode: "text",
      toUpper: true,
      allowed: (v) => v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      validate: (v) => /^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(v),
      error: "Driving License must be 2 letters, 2 digits, 11 digits.",
    },
    voterId: {
      label: "Voter ID",
      maxLength: 10,
      pattern: /^[A-Z0-9]{0,10}$/,
      help: "Format: 3 letters, 7 digits (e.g., ABC1234567)",
      inputMode: "text",
      toUpper: true,
      allowed: (v) => v.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(),
      validate: (v) => /^[A-Z]{3}[0-9]{7}$/.test(v),
      error: "Voter ID must be 3 letters followed by 7 digits.",
    },
  };

  // Helper to detect if the previewed file is a PDF
  function isPDF(docPreview) {
    if (docPreview.file && docPreview.file.type === "application/pdf")
      return true;
    if (
      typeof docPreview.imgUrl === "string" &&
      docPreview.imgUrl.toLowerCase().endsWith(".pdf")
    )
      return true;
    return false;
  }

  // Add validation helpers for bank/UPI
  const [bankTouched, setBankTouched] = useState({});
  function bankAccountError(key) {
    const vals = formData.bankDetails;
    const anyAccount =
      vals.accountNumber ||
      vals.accountHolderName ||
      vals.ifscCode ||
      vals.bankName ||
      vals.branchName ||
      vals.passbookImgUrl;
    const anyUPI = vals.upiId || vals.upiPhoneNumber;
    // If both anyAccount and anyUPI are filled, require all account fields and all UPI fields
    if (anyAccount && anyUPI) {
      if (!vals.accountNumber && key === "accountNumber") return "Required";
      if (!vals.accountHolderName && key === "accountHolderName")
        return "Required";
      if (!vals.ifscCode && key === "ifscCode") return "Required";
      if (!vals.bankName && key === "bankName") return "Required";
      if (!vals.branchName && key === "branchName") return "Required";
      if (!vals.passbookImgUrl && key === "passbookImgUrl") return "Required";
      return "";
    }
    // If only account section started
    if (anyAccount) {
      if (!vals.accountNumber && key === "accountNumber") return "Required";
      if (!vals.accountHolderName && key === "accountHolderName")
        return "Required";
      if (!vals.ifscCode && key === "ifscCode") return "Required";
      if (!vals.bankName && key === "bankName") return "Required";
      if (!vals.branchName && key === "branchName") return "Required";
      if (!vals.passbookImgUrl && key === "passbookImgUrl") return "Required";
      return "";
    }
    return "";
  }
  function upiError(key) {
    const vals = formData.bankDetails;
    const anyAccount =
      vals.accountNumber ||
      vals.accountHolderName ||
      vals.ifscCode ||
      vals.bankName ||
      vals.branchName ||
      vals.passbookImgUrl;
    const anyUPI = vals.upiId || vals.upiPhoneNumber;
    // If both anyAccount and anyUPI are filled, require all account fields and all UPI fields
    if (anyAccount && anyUPI) {
      if (!vals.upiId && key === "upiId") return "Required";
      if (!vals.upiPhoneNumber && key === "upiPhoneNumber") return "Required";
      return "";
    }
    // If only UPI section started
    if (anyUPI) {
      if (!vals.upiId && key === "upiId") return "Required";
      if (!vals.upiPhoneNumber && key === "upiPhoneNumber") return "Required";
      return "";
    }
    return "";
  }

  // Add validation functions for bank details
  const validateAccountNumber = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "Account number is required." : "";
    if (!/^[0-9]{9,18}$/.test(value))
      return "Account number must be 9-18 digits.";
    return "";
  };
  const validateAccountHolderName = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "Account holder name is required." : "";
    if (!/^[A-Za-z ]+$/.test(value))
      return "Only alphabets and spaces allowed.";
    if (value.trim().length < 2) return "Must be at least 2 characters.";
    return "";
  };
  const validateIFSC = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "IFSC code is required." : "";
    if (!/^[A-Z]{4}0[0-9A-Z]{6}$/.test(value.trim().toUpperCase()))
      return "Invalid IFSC code format (e.g., SBIN0001234).";
    return "";
  };
  const validateBankName = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "Bank name is required." : "";
    if (!/^[A-Za-z ]+$/.test(value))
      return "Only alphabets and spaces allowed.";
    if (value.trim().length < 2) return "Must be at least 2 characters.";
    return "";
  };
  const validateUPI = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "UPI ID is required." : "";
    if (!/^([a-zA-Z0-9.]+)@([a-zA-Z]+)$/.test(value))
      return "Invalid UPI ID format (e.g., name@bank).";
    return "";
  };
  const validateUPIName = (value, required = true) => {
    if (!value || value.trim() === "")
      return required ? "UPI contact name is required." : "";
    if (!/^[A-Za-z ]+$/.test(value))
      return "Only alphabets and spaces allowed.";
    if (value.trim().length < 2) return "Must be at least 2 characters.";
    return "";
  };

  // Helper to check if any bank or UPI field is filled
  const anyBankFieldFilled =
    formData.bankDetails.accountNumber ||
    formData.bankDetails.accountHolderName ||
    formData.bankDetails.ifscCode ||
    formData.bankDetails.bankName ||
    formData.bankDetails.branchName ||
    formData.bankDetails.passbookImgUrl;
  const anyUPIFieldFilled =
    formData.bankDetails.upiId || formData.bankDetails.upiPhoneNumber;

  // Helper to check if any personal field is filled
  const anyPersonalFieldFilled = Object.values(formData.employee).some(
    (v) => v && v.toString().trim() !== ""
  );

  // Add input filtering for salary fields
  const filterNumberInput = (value) => {
    return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"); // allow only one dot
  };

  // Add validation for salary fields
  const validateNumber = (value, required = true) => {
    if (!value || value.toString().trim() === "")
      return required ? "This field is required." : "";
    if (isNaN(Number(value))) return "Only numbers allowed.";
    return "";
  };

  // Debounce utility
  function debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  const [uniquenessErrors, setUniquenessErrors] = useState({
    emailPersonal: "",
    phone: "",
  });

  const debouncedCheckUniqueness = useRef(
    debounce(async (email, phone) => {
      const params = {};
      if (email) params.email = email;
      if (phone) params.phone = phone;
      if (!email && !phone) return;

      // If editing an employee, exclude their current email and phone from uniqueness check
      if (employee) {
        try {
          const parsedEmployee = JSON.parse(employee);
          if (parsedEmployee.emailPersonal)
            params.excludeEmail = parsedEmployee.emailPersonal;
          if (parsedEmployee.phone) params.excludePhone = parsedEmployee.phone;
        } catch (error) {
          // If parsing fails, continue without exclusion
        }
      }

      try {
        const token = getItemFromSessionStorage("token");
        const res = await axios.get(
          `${publicRuntimeConfig.apiURL}/employees/existence-check`,
          {
            params,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUniquenessErrors((prev) => ({
          ...prev,
          emailPersonal: email
            ? res.data.emailPersonal === true
              ? "This email is already existing."
              : ""
            : prev.emailPersonal,
          phone: phone
            ? res.data.phone === true
              ? "This phone is already existing."
              : ""
            : prev.phone,
        }));
      } catch (err) {
        // Optionally handle error
      }
    }, 500)
  ).current;

  // Add input filtering for account number and account holder name
  const filterAccountNumberInput = (value) => value.replace(/[^0-9]/g, "");
  const filterAccountHolderNameInput = (value) =>
    value.replace(/[^A-Za-z ]/g, "");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        }`}
      >
        <HradminNavbar />

        <div className="p-8 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-0">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                {employee ? "Edit Employee" : "New Employee"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col mt-4">
              <div className="bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden flex-1">
                {/* Section Tabs */}
                <div className="relative z-10 flex gap-4 mb-8 border-b border-gray-100 pb-2">
                  {sections.map((section) => (
                    <motion.button
                      key={section.id}
                      type="button"
                      className={`flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200 relative ${
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
                      <div className="absolute -top-1.5 -right-1.5">
                        {section.checkCompletion() ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200">
                            <FiCheck className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400 shadow-lg shadow-red-200" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Form Content */}
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10 flex flex-col min-h-[600px]"
                >
                  {/* Personal Details Section */}
                  {activeSection === "personal" && (
                    <div className="grid grid-cols-2 gap-3 flex-1 items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Personal Information
                        </h3>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              First Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              className={`${inputClass} ${getFieldBorderClass(
                                "firstName",
                                formData.employee.firstName,
                                fieldTouched.firstName,
                                validationErrors.firstName
                              )}`}
                              placeholder="Enter first name"
                              value={formData.employee.firstName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "firstName",
                                  filterNameInput(e.target.value)
                                )
                              }
                              ref={formRefs.firstName}
                              onBlur={() =>
                                handlePersonalFieldBlur("firstName")
                              }
                              maxLength={30}
                            />
                            {validationErrors.firstName &&
                              fieldTouched.firstName && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.firstName}
                                </p>
                              )}
                          </div>
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Middle Name
                            </label>
                            <input
                              type="text"
                              className={`${inputClass} ${getFieldBorderClass(
                                "middleName",
                                formData.employee.middleName,
                                fieldTouched.middleName,
                                validationErrors.middleName
                              )}`}
                              placeholder="Enter middle name (optional)"
                              value={formData.employee.middleName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "middleName",
                                  filterNameInput(e.target.value)
                                )
                              }
                              ref={formRefs.middleName}
                              onBlur={() =>
                                handlePersonalFieldBlur("middleName")
                              }
                              maxLength={30}
                            />
                            {validationErrors.middleName &&
                              fieldTouched.middleName && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.middleName}
                                </p>
                              )}
                          </div>
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Last Name <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="text"
                              className={`${inputClass} ${getFieldBorderClass(
                                "lastName",
                                formData.employee.lastName,
                                fieldTouched.lastName,
                                validationErrors.lastName
                              )}`}
                              placeholder="Enter last name"
                              value={formData.employee.lastName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "lastName",
                                  filterNameInput(e.target.value)
                                )
                              }
                              ref={formRefs.lastName}
                              onBlur={() => handlePersonalFieldBlur("lastName")}
                              maxLength={30}
                            />
                            {validationErrors.lastName &&
                              fieldTouched.lastName && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.lastName}
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Father Name
                            </label>
                            <input
                              type="text"
                              className={`${inputClass} ${getFieldBorderClass(
                                "fathersName",
                                formData.employee.fathersName,
                                fieldTouched.fathersName,
                                validationErrors.fathersName
                              )}`}
                              placeholder="Enter father name"
                              value={formData.employee.fathersName || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "fathersName",
                                  filterNameInput(e.target.value)
                                )
                              }
                              ref={formRefs.fathersName}
                              onBlur={() =>
                                handlePersonalFieldBlur("fathersName")
                              }
                              maxLength={30}
                            />
                            {validationErrors.fathersName &&
                              fieldTouched.fathersName && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.fathersName}
                                </p>
                              )}
                          </div>
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>Gender</label>
                            <Listbox
                              value={formData.employee.gender}
                              onChange={(val) => {
                                handleInputChange("employee", "gender", val);
                                // Mark gender as touched immediately when selected
                                setFieldTouched((prev) => ({
                                  ...prev,
                                  gender: true,
                                }));
                              }}
                            >
                              <div className="relative">
                                <Listbox.Button
                                  className={`w-full bg-gray-50 border rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 flex justify-between items-center ${getFieldBorderClass(
                                    "gender",
                                    formData.employee.gender,
                                    fieldTouched.gender,
                                    validationErrors.gender
                                  )}`}
                                >
                                  <span>
                                    {genderOptions.find(
                                      (opt) =>
                                        opt.value === formData.employee.gender
                                    )?.label || "Select gender"}
                                  </span>
                                  <svg
                                    className="w-4 h-4 ml-2 text-gray-400"
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
                                </Listbox.Button>
                                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                                  {genderOptions.map((option) => (
                                    <Listbox.Option
                                      key={option.value}
                                      value={option.value}
                                      className={({ active, selected }) =>
                                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                                          active ? "bg-gray-100" : ""
                                        } ${
                                          selected
                                            ? "font-semibold text-blue-600"
                                            : "text-gray-900"
                                        }`
                                      }
                                    >
                                      {({ selected }) => (
                                        <>
                                          <span
                                            className={`block truncate ${
                                              selected ? "font-semibold" : ""
                                            }`}
                                          >
                                            {option.label}
                                          </span>
                                          {selected ? (
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                              <CheckIcon className="w-5 h-5 text-blue-600" />
                                            </span>
                                          ) : null}
                                        </>
                                      )}
                                    </Listbox.Option>
                                  ))}
                                </Listbox.Options>
                              </div>
                            </Listbox>
                            {validationErrors.gender && fieldTouched.gender && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors.gender}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Phone <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="tel"
                              className={`${inputClass} ${
                                validationErrors.phone &&
                                (fieldTouched.phone || anyPersonalFieldFilled)
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="Enter phone number"
                              value={formData.employee.phone || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "phone",
                                  filterPhoneInput(e.target.value)
                                )
                              }
                              ref={formRefs.phone}
                              onBlur={() => handlePersonalFieldBlur("phone")}
                              maxLength={10}
                              inputMode="numeric"
                            />
                            {validationErrors.phone &&
                              (fieldTouched.phone ||
                                anyPersonalFieldFilled) && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.phone}
                                </p>
                              )}
                            {uniquenessErrors.phone && (
                              <p className="text-red-600 text-xs mt-1">
                                {uniquenessErrors.phone}
                              </p>
                            )}
                          </div>
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Alternate Phone
                            </label>
                            <input
                              type="tel"
                              className={`${inputClass} ${
                                validationErrors.alternatePhone &&
                                (fieldTouched.alternatePhone ||
                                  anyPersonalFieldFilled)
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="Enter alternate phone"
                              value={formData.employee.alternatePhone || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "alternatePhone",
                                  filterPhoneInput(e.target.value)
                                )
                              }
                              ref={formRefs.alternatePhone}
                              onBlur={() =>
                                handlePersonalFieldBlur("alternatePhone")
                              }
                              maxLength={10}
                              inputMode="numeric"
                            />
                            {validationErrors.alternatePhone &&
                              (fieldTouched.alternatePhone ||
                                anyPersonalFieldFilled) && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.alternatePhone}
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 mb-2">
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Personal Email{" "}
                              <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="email"
                                className={`${inputClass} ${
                                  validationErrors.emailPersonal &&
                                  (fieldTouched.emailPersonal ||
                                    anyPersonalFieldFilled)
                                    ? "border-red-500"
                                    : ""
                                }`}
                                placeholder="Enter personal email"
                                value={formData.employee.emailPersonal || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    "emailPersonal",
                                    filterEmailInput(e.target.value)
                                  )
                                }
                                ref={formRefs.emailPersonal}
                                onBlur={() =>
                                  handlePersonalFieldBlur("emailPersonal")
                                }
                                maxLength={50}
                              />
                              {getEmailSuggestion(
                                formData.employee.emailPersonal
                              ) &&
                                !formData.employee.emailPersonal.includes(
                                  "@"
                                ) && (
                                  <div className="absolute top-full left-0 right-0 bg-blue-50 border border-blue-200 rounded-b-lg px-3 py-2 text-sm text-blue-700 z-10">
                                    <span className="font-medium">
                                      Suggestion:
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleInputChange(
                                          "employee",
                                          "emailPersonal",
                                          getEmailSuggestion(
                                            formData.employee.emailPersonal
                                          )
                                        )
                                      }
                                      className="ml-1 underline hover:text-blue-900 cursor-pointer"
                                    >
                                      {getEmailSuggestion(
                                        formData.employee.emailPersonal
                                      )}
                                    </button>
                                  </div>
                                )}
                            </div>
                            {validationErrors.emailPersonal &&
                              (fieldTouched.emailPersonal ||
                                anyPersonalFieldFilled) && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.emailPersonal}
                                </p>
                              )}
                            {uniquenessErrors.emailPersonal && (
                              <p className="text-red-600 text-xs mt-1">
                                {uniquenessErrors.emailPersonal}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className={inputGroupClass}>
                          <label className={inputLabelClass}>
                            Current Address
                          </label>
                          <textarea
                            className={`${inputClass} ${
                              validationErrors.currentAddress &&
                              (fieldTouched.currentAddress ||
                                anyPersonalFieldFilled)
                                ? "border-red-500"
                                : ""
                            }`}
                            rows="2"
                            placeholder="Enter current address"
                            value={formData.employee.currentAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "currentAddress",
                                e.target.value
                              )
                            }
                            ref={formRefs.currentAddress}
                            onBlur={() =>
                              handlePersonalFieldBlur("currentAddress")
                            }
                            maxLength={200}
                          />
                          {validationErrors.currentAddress &&
                            (fieldTouched.currentAddress ||
                              anyPersonalFieldFilled) && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors.currentAddress}
                              </p>
                            )}
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum 200 characters
                          </p>
                        </div>
                        <div className="flex items-center mb-1">
                          <input
                            type="checkbox"
                            id="sameAsCurrent"
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            checked={
                              formData.employee.permanentAddress ===
                              formData.employee.currentAddress
                            }
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleInputChange(
                                  "employee",
                                  "permanentAddress",
                                  formData.employee.currentAddress
                                );
                              } else {
                                handleInputChange(
                                  "employee",
                                  "permanentAddress",
                                  ""
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
                          <label className={inputLabelClass}>
                            Permanent Address
                          </label>
                          <textarea
                            className={`${inputClass} ${
                              validationErrors.permanentAddress &&
                              (fieldTouched.permanentAddress ||
                                anyPersonalFieldFilled)
                                ? "border-red-500"
                                : ""
                            }`}
                            rows="2"
                            placeholder="Enter permanent address"
                            value={formData.employee.permanentAddress || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "employee",
                                "permanentAddress",
                                e.target.value
                              )
                            }
                            ref={formRefs.permanentAddress}
                            onBlur={() =>
                              handlePersonalFieldBlur("permanentAddress")
                            }
                            maxLength={200}
                          />
                          {validationErrors.permanentAddress &&
                            (fieldTouched.permanentAddress ||
                              anyPersonalFieldFilled) && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors.permanentAddress}
                              </p>
                            )}
                          <p className="text-xs text-gray-500 mt-1">
                            Maximum 200 characters
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          Professional Information
                        </h3>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <DepartmentSelect
                            label="Department"
                            options={departments}
                            value={formData.employee.department}
                            onChange={(selectedDepartment) => {
                              const cleanName = selectedDepartment.name
                                .replace(/[bedjw]{5,}/g, "")
                                .replace(/\|.*$/, "")
                                .replace(/\s+/g, " ")
                                .trim();
                              handleInputChange("employee", "department", {
                                departmentId: selectedDepartment.departmentId,
                                name: cleanName,
                              });
                              const weeklyHolidays =
                                selectedDepartment.weeklyHolidays
                                  ? selectedDepartment.weeklyHolidays.split(",")
                                  : [];
                              handleInputChange(
                                "employee",
                                "weeklyOffs",
                                weeklyHolidays
                              );
                              handleInputChange(
                                "employee",
                                "designation",
                                null
                              );
                              // handleInputChange("employee", "reportingManager", null); // Removed to make reporting manager independent
                            }}
                            onAddDepartment={() => setShowDepartmentModal(true)}
                          />
                          <DesignationSelect
                            label="Designation"
                            options={
                              formData.employee.department ? designations : []
                            }
                            value={formData.employee.designation}
                            onChange={(selectedDesignation) =>
                              handleInputChange("employee", "designation", {
                                designationId:
                                  selectedDesignation.designationId,
                                name: selectedDesignation.name,
                                manager: selectedDesignation.manager,
                                overtimeEligible:
                                  selectedDesignation.overtimeEligible,
                              })
                            }
                            onAddDesignation={() =>
                              setShowDesignationModal(true)
                            }
                            disabled={
                              isDesignationLoading ||
                              !formData.employee.department
                            }
                            placeholder={
                              !formData.employee.department
                                ? "First Select Department"
                                : "Select designation"
                            }
                            loading={isDesignationLoading}
                          />
                        </div>
                        <div className={inputGroupClass}>
                          <label className={inputLabelClass}>
                            Official Email
                          </label>
                          <div className="relative">
                            <input
                              type="email"
                              className={`${inputClass} ${
                                validationErrors.emailOfficial &&
                                (fieldTouched.emailOfficial ||
                                  anyPersonalFieldFilled)
                                  ? "border-red-500"
                                  : ""
                              }`}
                              placeholder="Enter official email"
                              value={formData.employee.emailOfficial || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "emailOfficial",
                                  filterEmailInput(e.target.value)
                                )
                              }
                              ref={formRefs.emailOfficial}
                              onBlur={() =>
                                handlePersonalFieldBlur("emailOfficial")
                              }
                              maxLength={50}
                            />
                            {getEmailSuggestion(
                              formData.employee.emailOfficial
                            ) &&
                              !formData.employee.emailOfficial.includes(
                                "@"
                              ) && (
                                <div className="absolute top-full left-0 right-0 bg-blue-50 border border-blue-200 rounded-b-lg px-3 py-2 text-sm text-blue-700 z-10">
                                  <span className="font-medium">
                                    Suggestion:
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleInputChange(
                                        "employee",
                                        "emailOfficial",
                                        getEmailSuggestion(
                                          formData.employee.emailOfficial
                                        )
                                      )
                                    }
                                    className="ml-1 underline hover:text-blue-900 cursor-pointer"
                                  >
                                    {getEmailSuggestion(
                                      formData.employee.emailOfficial
                                    )}
                                  </button>
                                </div>
                              )}
                          </div>
                          {validationErrors.emailOfficial &&
                            (fieldTouched.emailOfficial ||
                              anyPersonalFieldFilled) && (
                              <p className="text-red-600 text-xs mt-1">
                                {validationErrors.emailOfficial}
                              </p>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div className={inputGroupClass}>
                            <label className={inputLabelClass}>
                              Date of Joining{" "}
                              <span className="text-red-400">*</span>
                            </label>
                            <input
                              type="date"
                              className={`${inputClass} ${
                                validationErrors.joiningDate &&
                                (fieldTouched.joiningDate ||
                                  anyPersonalFieldFilled)
                                  ? "border-red-500"
                                  : ""
                              }`}
                              value={formData.employee.joiningDate || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "joiningDate",
                                  e.target.value
                                )
                              }
                              ref={formRefs.joiningDate}
                              onBlur={() =>
                                handlePersonalFieldBlur("joiningDate")
                              }
                            />
                            {validationErrors.joiningDate &&
                              (fieldTouched.joiningDate ||
                                anyPersonalFieldFilled) && (
                                <p className="text-red-600 text-xs mt-1">
                                  {validationErrors.joiningDate}
                                </p>
                              )}
                          </div>
                          <div className="grid grid-1 gap-2">
                            <ReportingManagerSelect
                              label="Reporting Manager"
                              options={managers}
                              value={formData.employee.reportingManager}
                              onChange={(selectedManager) =>
                                handleInputChange(
                                  "employee",
                                  "reportingManager",
                                  {
                                    employeeId: selectedManager.employeeId,
                                    name: selectedManager.name,
                                  }
                                )
                              }
                            />
                          </div>
                        </div>
                        <h4 className="text-md font-medium text-gray-700 mt-4 mb-2">
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
                        <div className="flex flex-col space-y-1 mt-2">
                          <div className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              id="pfEnrolled"
                              checked={formData.employee.pfEnrolled}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
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
                          {formData.employee.pfEnrolled && (
                            <div className={inputGroupClass + " mt-1"}>
                              <label className={inputLabelClass}>
                                UAN Number
                              </label>
                              <input
                                type="text"
                                className={`${inputClass} ${
                                  validationErrors.uanNumber &&
                                  (fieldTouched.uanNumber ||
                                    anyPersonalFieldFilled)
                                    ? "border-red-500"
                                    : ""
                                }`}
                                value={formData.employee.uanNumber || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    "uanNumber",
                                    filterUANInput(e.target.value)
                                  )
                                }
                                placeholder="Enter UAN Number"
                                maxLength={12}
                                inputMode="numeric"
                                onBlur={() =>
                                  handlePersonalFieldBlur("uanNumber")
                                }
                              />
                              {validationErrors.uanNumber &&
                                (fieldTouched.uanNumber ||
                                  anyPersonalFieldFilled) && (
                                  <p className="text-red-600 text-xs mt-1">
                                    {validationErrors.uanNumber}
                                  </p>
                                )}
                            </div>
                          )}
                          <div className="flex items-center mb-1">
                            <input
                              type="checkbox"
                              id="esicEnrolled"
                              checked={formData.employee.esicEnrolled}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
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
                          {formData.employee.esicEnrolled && (
                            <div className={inputGroupClass + " mt-1"}>
                              <label className={inputLabelClass}>
                                ESIC Number{" "}
                                <span className="text-red-400">*</span>
                              </label>
                              <input
                                type="text"
                                className={`${inputClass} ${
                                  validationErrors.esicNumber &&
                                  (fieldTouched.esicNumber ||
                                    anyPersonalFieldFilled)
                                    ? "border-red-500"
                                    : ""
                                }`}
                                value={formData.employee.esicNumber || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "employee",
                                    "esicNumber",
                                    filterUANInput(e.target.value)
                                  )
                                }
                                placeholder="Enter ESIC Number"
                                maxLength={12}
                                inputMode="numeric"
                                onBlur={() =>
                                  handlePersonalFieldBlur("esicNumber")
                                }
                              />
                              {validationErrors.esicNumber &&
                                (fieldTouched.esicNumber ||
                                  anyPersonalFieldFilled) && (
                                  <p className="text-red-600 text-xs mt-1">
                                    {validationErrors.esicNumber}
                                  </p>
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Proofs Section */}
                  {activeSection === "idProofs" && (
                    <div className="flex-1 p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Identity Documents
                      </h3>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {Object.entries(docFieldMeta).map(([key, meta]) => {
                          const imgField =
                            key === "aadharNo"
                              ? "aadharImgUrl"
                              : key === "panNo"
                              ? "pancardImgUrl"
                              : key === "passport"
                              ? "passportImgUrl"
                              : key === "drivingLicense"
                              ? "drivingLicenseImgUrl"
                              : key === "voterId"
                              ? "voterIdImgUrl"
                              : "";
                          const value = formData.idProofs[key] || "";
                          const hasFile = !!formData.idProofs[imgField];
                          const isTouched = idProofsTouched[key];
                          const isValid = meta.validate(value);
                          // Passport: after first char, only allow digits
                          const handlePassportInput = (v) => {
                            if (v.length === 0) return "";
                            let first = v[0]
                              .replace(/[^a-zA-Z]/g, "")
                              .toUpperCase();
                            let rest = v.slice(1).replace(/[^0-9]/g, "");
                            return (first + rest).slice(0, 8);
                          };
                          // General allowed function
                          const allowedValue = (v) => {
                            if (key === "passport")
                              return handlePassportInput(v);
                            return meta.allowed(v);
                          };
                          // Show error if: (1) field is touched or blurred, and (2) value is invalid, or (3) file is uploaded and value is invalid, or (4) value is entered but no file
                          const showError =
                            (isTouched && value && !isValid) ||
                            (hasFile && !isValid) ||
                            (value && !hasFile);
                          let errorMsg = "";
                          if (isTouched && value && !isValid)
                            errorMsg = meta.error;
                          else if (hasFile && !isValid) errorMsg = meta.error;
                          else if (value && !hasFile)
                            errorMsg = `Please upload ${meta.label} document.`;
                          else if (hasFile && !value)
                            errorMsg = `${meta.label} number is required when document is uploaded.`;
                          return (
                            <div
                              key={key}
                              className={`flex flex-col md:flex-row items-start gap-4 bg-white rounded-xl p-4 border border-gray-200 shadow-md transition-all duration-200 ${
                                showError
                                  ? "ring-2 ring-red-200 border-red-400"
                                  : hasFile
                                  ? "ring-2 ring-blue-100"
                                  : ""
                              }`}
                            >
                              <div className="flex-1">
                                <label className="block text-sm font-semibold text-gray-800 mb-1">
                                  {meta.label} Number{" "}
                                  <span className="text-red-400">*</span>
                                </label>
                                <input
                                  className={
                                    inputClass +
                                    (showError ? " border-red-500" : "") +
                                    " font-mono tracking-wider"
                                  }
                                  value={value}
                                  onChange={(e) => {
                                    let v = e.target.value;
                                    v = allowedValue(v);
                                    handleInputChange("idProofs", key, v);
                                  }}
                                  onInput={(e) => {
                                    let v = e.target.value;
                                    v = allowedValue(v);
                                    e.target.value = v;
                                  }}
                                  onBlur={() =>
                                    setIdProofsTouched((t) => ({
                                      ...t,
                                      [key]: true,
                                    }))
                                  }
                                  placeholder={meta.placeholder}
                                  maxLength={meta.maxLength}
                                  inputMode={meta.inputMode}
                                  autoComplete="off"
                                  style={{
                                    textTransform: meta.toUpper
                                      ? "uppercase"
                                      : "none",
                                  }}
                                  required={hasFile}
                                />
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {meta.help}
                                  </span>
                                  {showError && (
                                    <span className="text-xs text-red-500">
                                      {errorMsg}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  {meta.label} Photo/PDF{" "}
                                  <span className="text-red-400">*</span>
                                </label>
                                <div className="flex items-center gap-2">
                                  {formData.idProofs[imgField] ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDocPreview({
                                            open: true,
                                            imgUrl:
                                              formData.idProofs[
                                                imgField
                                              ] instanceof File
                                                ? URL.createObjectURL(
                                                    formData.idProofs[imgField]
                                                  )
                                                : formData.idProofs[imgField],
                                            number: value,
                                            label: meta.label,
                                            file:
                                              formData.idProofs[
                                                imgField
                                              ] instanceof File
                                                ? formData.idProofs[imgField]
                                                : null,
                                          })
                                        }
                                        className="focus:outline-none"
                                      >
                                        {formData.idProofs[imgField].type ===
                                          "application/pdf" ||
                                        (typeof formData.idProofs[imgField] ===
                                          "string" &&
                                          formData.idProofs[imgField].endsWith(
                                            ".pdf"
                                          )) ? (
                                          <span className="inline-block w-16 h-16 bg-gray-200 flex items-center justify-center rounded border border-gray-300 text-gray-500">
                                            PDF
                                          </span>
                                        ) : (
                                          <img
                                            src={
                                              formData.idProofs[
                                                imgField
                                              ] instanceof File
                                                ? URL.createObjectURL(
                                                    formData.idProofs[imgField]
                                                  )
                                                : formData.idProofs[imgField]
                                            }
                                            alt={`${meta.label} preview`}
                                            className="w-16 h-16 object-cover rounded border border-gray-300 cursor-pointer hover:shadow-lg"
                                          />
                                        )}
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setFormData((prev) => ({
                                            ...prev,
                                            idProofs: {
                                              ...prev.idProofs,
                                              [imgField]: null,
                                            },
                                          }))
                                        }
                                        className="text-red-500 hover:text-red-700 ml-2"
                                      >
                                        Remove
                                      </button>
                                    </>
                                  ) : (
                                    <label
                                      htmlFor={`upload-${key}`}
                                      className="cursor-pointer inline-flex items-center px-3 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 text-sm text-gray-700"
                                    >
                                      Upload
                                      <input
                                        type="file"
                                        id={`upload-${key}`}
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => {
                                          const file = e.target.files[0];
                                          if (file) {
                                            const allowedTypes = [
                                              "application/pdf",
                                              "image/jpeg",
                                              "image/jpg",
                                              "image/png",
                                            ];
                                            if (
                                              !allowedTypes.includes(file.type)
                                            ) {
                                              toast.error(
                                                "Only PDF or image files are allowed."
                                              );
                                              return;
                                            }
                                            handleFileUpload(key, file);
                                            setIdProofsTouched((t) => ({
                                              ...t,
                                              [key]: true,
                                            }));
                                          }
                                        }}
                                      />
                                    </label>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500 mt-1">
                                  Only PDF or image files allowed. Max 5MB.
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Document Preview Modal */}
                      {docPreview.open && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative flex flex-col items-center">
                            <button
                              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                              onClick={() => {
                                setDocPreview({
                                  open: false,
                                  imgUrl: "",
                                  number: "",
                                  label: "",
                                  file: null,
                                });
                                setPdfControls({ rotate: 0, zoom: 1 });
                              }}
                            >
                              <X className="w-5 h-5" />
                            </button>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                              {docPreview.label} Document Preview
                            </h2>
                            {isPDF(docPreview) ? (
                              <>
                                {/* Custom PDF Toolbar */}
                                <div className="flex items-center gap-4 mb-2 bg-gray-50 rounded px-4 py-2 shadow-sm">
                                  {/* Rotate Left */}
                                  <button
                                    onClick={() =>
                                      setPdfControls((c) => ({
                                        ...c,
                                        rotate: c.rotate - 90,
                                      }))
                                    }
                                    className="text-gray-600 hover:text-blue-600"
                                    title="Rotate Left"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 11V7a5 5 0 015-5 5 5 0 015 5v4"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M7 11l-4 4m0 0l4 4m-4-4h18"
                                      />
                                    </svg>
                                  </button>
                                  {/* Rotate Right */}
                                  <button
                                    onClick={() =>
                                      setPdfControls((c) => ({
                                        ...c,
                                        rotate: c.rotate + 90,
                                      }))
                                    }
                                    className="text-gray-600 hover:text-blue-600"
                                    title="Rotate Right"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 13v4a5 5 0 01-5 5 5 5 0 01-5-5v-4"
                                      />
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 13l4-4m0 0l-4-4m4 4H3"
                                      />
                                    </svg>
                                  </button>
                                  {/* Zoom Out */}
                                  <button
                                    onClick={() =>
                                      setPdfControls((c) => ({
                                        ...c,
                                        zoom: Math.max(0.5, c.zoom - 0.1),
                                      }))
                                    }
                                    className="text-gray-600 hover:text-blue-600"
                                    title="Zoom Out"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M20 12H4"
                                      />
                                    </svg>
                                  </button>
                                  {/* Zoom In */}
                                  <button
                                    onClick={() =>
                                      setPdfControls((c) => ({
                                        ...c,
                                        zoom: Math.min(2, c.zoom + 0.1),
                                      }))
                                    }
                                    className="text-gray-600 hover:text-blue-600"
                                    title="Zoom In"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 4v16m8-8H4"
                                      />
                                    </svg>
                                  </button>
                                  {/* Download */}
                                  <a
                                    href={docPreview.imgUrl}
                                    download={docPreview.label + ".pdf"}
                                    className="text-gray-600 hover:text-blue-600"
                                    title="Download PDF"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <svg
                                      className="w-5 h-5"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                      />
                                    </svg>
                                  </a>
                                </div>
                                {/* PDF Preview Area with dynamic width/height for rotation */}
                                {(() => {
                                  const rotation =
                                    ((pdfControls.rotate % 360) + 360) % 360;
                                  const isSideways =
                                    rotation === 90 || rotation === 270;
                                  const previewWidth = isSideways
                                    ? "24rem"
                                    : "100%";
                                  const previewHeight = isSideways
                                    ? "100%"
                                    : "24rem";
                                  return (
                                    <div
                                      className="flex justify-center items-center w-full bg-gray-100 rounded border overflow-auto"
                                      style={{
                                        width: "100%",
                                        height: "24rem",
                                        minHeight: "24rem",
                                        minWidth: "24rem",
                                        maxHeight: "32rem",
                                        maxWidth: "100%",
                                      }}
                                    >
                                      <div
                                        style={{
                                          width: previewWidth,
                                          height: previewHeight,
                                          transform: `rotate(${pdfControls.rotate}deg) scale(${pdfControls.zoom})`,
                                          transition: "transform 0.2s",
                                          display: "flex",
                                          justifyContent: "center",
                                          alignItems: "center",
                                        }}
                                      >
                                        <iframe
                                          src={docPreview.imgUrl + "#toolbar=0"}
                                          title={`${docPreview.label} PDF`}
                                          className="w-full h-full border-none"
                                          style={{ background: "white" }}
                                        />
                                      </div>
                                    </div>
                                  );
                                })()}
                              </>
                            ) : (
                              <img
                                src={docPreview.imgUrl}
                                alt={`${docPreview.label} preview`}
                                className="w-64 h-64 object-contain rounded border mb-4"
                              />
                            )}
                            <div className="text-center mt-4">
                              <span className="block text-gray-700 font-medium">
                                {docPreview.label} Number:
                              </span>
                              <span className="text-lg font-mono text-gray-900 tracking-widest">
                                {docPreview.number || "—"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Details Section */}
                  {activeSection === "bank" && (
                    <div className="flex-1 p-4 pt-2">
                      {" "}
                      {/* pt-2 to shift up */}
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Bank Details
                      </h3>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {" "}
                        {/* gap-y-4 for more vertical space */}
                        {/* Account fields */}
                        <div className="flex flex-col mb-3">
                          {" "}
                          {/* mb-3 for more space below */}
                          <label className="text-sm font-medium text-gray-700 mb-0.5">
                            Account Number
                          </label>
                          <input
                            className={
                              inputClass +
                              (bankAccountError("accountNumber") ||
                              ((bankTouched.accountNumber ||
                                anyBankFieldFilled) &&
                                validateAccountNumber(
                                  formData.bankDetails.accountNumber
                                ))
                                ? " border-red-500"
                                : "")
                            }
                            value={formData.bankDetails.accountNumber || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "bankDetails",
                                "accountNumber",
                                filterAccountNumberInput(e.target.value)
                              )
                            }
                            placeholder="Enter account number"
                            type="text"
                            inputMode="numeric"
                            maxLength={18}
                            autoComplete="off"
                            onBlur={() =>
                              setBankTouched((t) => ({
                                ...t,
                                accountNumber: true,
                              }))
                            }
                          />
                          {(bankTouched.accountNumber || anyBankFieldFilled) &&
                            validateAccountNumber(
                              formData.bankDetails.accountNumber
                            ) && (
                              <span className="text-xs text-red-500">
                                {validateAccountNumber(
                                  formData.bankDetails.accountNumber
                                )}
                              </span>
                            )}
                        </div>
                        <div className="flex flex-col mb-3">
                          <label className="text-sm font-medium text-gray-700 mb-0.5">
                            Account Holder Name
                          </label>
                          <input
                            className={
                              inputClass +
                              (bankAccountError("accountHolderName") ||
                              ((bankTouched.accountHolderName ||
                                anyBankFieldFilled) &&
                                validateAccountHolderName(
                                  formData.bankDetails.accountHolderName
                                ))
                                ? " border-red-500"
                                : "")
                            }
                            value={formData.bankDetails.accountHolderName || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "bankDetails",
                                "accountHolderName",
                                filterAccountHolderNameInput(e.target.value)
                              )
                            }
                            placeholder="Enter account holder name"
                            type="text"
                            inputMode="text"
                            maxLength={50}
                            autoComplete="off"
                            onBlur={() =>
                              setBankTouched((t) => ({
                                ...t,
                                accountHolderName: true,
                              }))
                            }
                          />
                          {(bankTouched.accountHolderName ||
                            anyBankFieldFilled) &&
                            validateAccountHolderName(
                              formData.bankDetails.accountHolderName
                            ) && (
                              <span className="text-xs text-red-500">
                                {validateAccountHolderName(
                                  formData.bankDetails.accountHolderName
                                )}
                              </span>
                            )}
                        </div>
                        <div className="flex flex-col mb-3">
                          <label className="text-sm font-medium text-gray-700 mb-0.5">
                            IFSC Code
                          </label>
                          <input
                            className={
                              inputClass +
                              (bankAccountError("ifscCode") ||
                              ((bankTouched.ifscCode || anyBankFieldFilled) &&
                                validateIFSC(formData.bankDetails.ifscCode))
                                ? " border-red-500"
                                : "")
                            }
                            value={formData.bankDetails.ifscCode || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "bankDetails",
                                "ifscCode",
                                e.target.value.toUpperCase()
                              )
                            }
                            placeholder="Enter IFSC code"
                            type="text"
                            inputMode="text"
                            maxLength={11}
                            autoComplete="off"
                            style={{ textTransform: "uppercase" }}
                            onBlur={() =>
                              setBankTouched((t) => ({ ...t, ifscCode: true }))
                            }
                          />
                          {(bankTouched.ifscCode || anyBankFieldFilled) &&
                            validateIFSC(formData.bankDetails.ifscCode) && (
                              <span className="text-xs text-red-500">
                                {validateIFSC(formData.bankDetails.ifscCode)}
                              </span>
                            )}
                        </div>
                        <div className="flex flex-col mb-3">
                          <label className="text-sm font-medium text-gray-700 mb-0.5">
                            Bank Name
                          </label>
                          <input
                            className={
                              inputClass +
                              (bankAccountError("bankName") ||
                              ((bankTouched.bankName || anyBankFieldFilled) &&
                                validateBankName(formData.bankDetails.bankName))
                                ? " border-red-500"
                                : "")
                            }
                            value={formData.bankDetails.bankName || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "bankDetails",
                                "bankName",
                                e.target.value
                              )
                            }
                            placeholder="Enter bank name"
                            type="text"
                            inputMode="text"
                            maxLength={50}
                            autoComplete="off"
                            onBlur={() =>
                              setBankTouched((t) => ({ ...t, bankName: true }))
                            }
                          />
                          {(bankTouched.bankName || anyBankFieldFilled) &&
                            validateBankName(formData.bankDetails.bankName) && (
                              <span className="text-xs text-red-500">
                                {validateBankName(
                                  formData.bankDetails.bankName
                                )}
                              </span>
                            )}
                        </div>
                        <div className="flex flex-col mb-3">
                          <label className="text-sm font-medium text-gray-700 mb-0.5">
                            Branch Name
                          </label>
                          <input
                            className={
                              inputClass +
                              (bankAccountError("branchName")
                                ? " border-red-500"
                                : "")
                            }
                            value={formData.bankDetails.branchName || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "bankDetails",
                                "branchName",
                                e.target.value
                              )
                            }
                            placeholder="Enter branch name"
                            type="text"
                            inputMode="text"
                            maxLength={50}
                            autoComplete="off"
                            onBlur={() =>
                              setBankTouched((t) => ({
                                ...t,
                                branchName: true,
                              }))
                            }
                            style={{ maxWidth: "260px" }}
                          />
                          {bankAccountError("branchName") && (
                            <span className="text-xs text-red-500 mt-0.5">
                              {bankAccountError("branchName")}
                            </span>
                          )}
                        </div>
                        {/* Upload Passbook/Cheque */}
                        <div className="flex flex-col mb-3 col-span-2">
                          <label className="text-sm font-medium text-gray-700 mb-0.5">
                            Upload Passbook/Cancelled Cheque{" "}
                            <span className="text-red-400">*</span>
                          </label>
                          <div className="relative flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl px-3 py-8 transition-all duration-150 hover:border-blue-400 focus-within:border-blue-400 min-h-[120px]">
                            {/* Upload Button - centered icon */}
                            {!formData.bankDetails.passbookImgUrl && (
                              <label
                                htmlFor="passbook-upload"
                                className="cursor-pointer flex flex-col items-center justify-center w-full h-full"
                              >
                                <span className="flex items-center justify-center w-14 h-14 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-100 text-gray-600 hover:text-blue-600 transition-all duration-150 mb-2">
                                  <svg
                                    className="w-8 h-8"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                    />
                                  </svg>
                                </span>
                                <span className="text-sm text-gray-500">
                                  Click or drag file to upload
                                </span>
                                <input
                                  type="file"
                                  id="passbook-upload"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const allowedTypes = [
                                        "application/pdf",
                                        "image/jpeg",
                                        "image/jpg",
                                        "image/png",
                                      ];
                                      if (!allowedTypes.includes(file.type)) {
                                        toast.error(
                                          "Only PDF or image files are allowed."
                                        );
                                        return;
                                      }
                                      handleFileUpload("passbookImgUrl", file);
                                      setBankTouched((t) => ({
                                        ...t,
                                        passbookImgUrl: true,
                                      }));
                                    }
                                  }}
                                />
                              </label>
                            )}
                            {/* Preview/Info */}
                            {formData.bankDetails.passbookImgUrl && (
                              <div className="flex items-center gap-3 w-full justify-center">
                                {formData.bankDetails.passbookImgUrl.type ===
                                  "application/pdf" ||
                                (typeof formData.bankDetails.passbookImgUrl ===
                                  "string" &&
                                  formData.bankDetails.passbookImgUrl.endsWith(
                                    ".pdf"
                                  )) ? (
                                  <span className="inline-block w-12 h-12 bg-gray-200 flex items-center justify-center rounded border border-gray-300 text-gray-500 text-xs">
                                    PDF
                                  </span>
                                ) : (
                                  <img
                                    src={
                                      formData.bankDetails
                                        .passbookImgUrl instanceof File
                                        ? URL.createObjectURL(
                                            formData.bankDetails.passbookImgUrl
                                          )
                                        : formData.bankDetails.passbookImgUrl
                                    }
                                    alt="Passbook preview"
                                    className="w-12 h-12 object-cover rounded border border-gray-300"
                                  />
                                )}
                                <span className="ml-2 text-xs text-gray-700 truncate max-w-[120px]">
                                  {formData.bankDetails
                                    .passbookImgUrl instanceof File
                                    ? formData.bankDetails.passbookImgUrl.name
                                    : typeof formData.bankDetails
                                        .passbookImgUrl === "string"
                                    ? formData.bankDetails.passbookImgUrl
                                        .split("/")
                                        .pop()
                                    : ""}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setBankPreview({
                                      open: true,
                                      imgUrl:
                                        formData.bankDetails
                                          .passbookImgUrl instanceof File
                                          ? URL.createObjectURL(
                                              formData.bankDetails
                                                .passbookImgUrl
                                            )
                                          : formData.bankDetails.passbookImgUrl,
                                      file:
                                        formData.bankDetails
                                          .passbookImgUrl instanceof File
                                          ? formData.bankDetails.passbookImgUrl
                                          : null,
                                    })
                                  }
                                  className="ml-2 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 border border-blue-200"
                                  title="View"
                                >
                                  View
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      bankDetails: {
                                        ...prev.bankDetails,
                                        passbookImgUrl: null,
                                      },
                                    }))
                                  }
                                  className="ml-2 px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 border border-red-200"
                                  title="Remove"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          {bankAccountError("passbookImgUrl") && (
                            <span className="text-xs text-red-500 mt-0.5">
                              {bankAccountError("passbookImgUrl")}
                            </span>
                          )}
                        </div>
                        {/* UPI Fields Grid - now below upload */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-4 mt-2 col-span-2">
                          {" "}
                          {/* gap-y-4 for more vertical space */}
                          <div className="flex flex-col mb-3">
                            <label className="text-sm font-medium text-gray-700 mb-0.5">
                              UPI ID
                            </label>
                            <input
                              className={
                                inputClass +
                                (upiError("upiId") ||
                                ((bankTouched.upiId || anyUPIFieldFilled) &&
                                  validateUPI(formData.bankDetails.upiId))
                                  ? " border-red-500"
                                  : "")
                              }
                              value={formData.bankDetails.upiId || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "bankDetails",
                                  "upiId",
                                  e.target.value
                                )
                              }
                              placeholder="Enter UPI ID"
                              type="text"
                              inputMode="text"
                              maxLength={50}
                              autoComplete="off"
                              onBlur={() =>
                                setBankTouched((t) => ({ ...t, upiId: true }))
                              }
                            />
                            {(bankTouched.upiId || anyUPIFieldFilled) &&
                              validateUPI(formData.bankDetails.upiId) && (
                                <span className="text-xs text-red-500">
                                  {validateUPI(formData.bankDetails.upiId)}
                                </span>
                              )}
                          </div>
                          <div className="flex flex-col mb-3">
                            <label className="text-sm font-medium text-gray-700 mb-0.5">
                              UPI Contact Name
                            </label>
                            <input
                              className={
                                inputClass +
                                (upiError("upiPhoneNumber") ||
                                ((bankTouched.upiPhoneNumber ||
                                  anyUPIFieldFilled) &&
                                  validateUPIName(
                                    formData.bankDetails.upiPhoneNumber
                                  ))
                                  ? " border-red-500"
                                  : "")
                              }
                              value={formData.bankDetails.upiPhoneNumber || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "bankDetails",
                                  "upiPhoneNumber",
                                  e.target.value
                                )
                              }
                              placeholder="Enter UPI Name"
                              type="text"
                              inputMode="text"
                              maxLength={50}
                              autoComplete="off"
                              onBlur={() =>
                                setBankTouched((t) => ({
                                  ...t,
                                  upiPhoneNumber: true,
                                }))
                              }
                            />
                            {(bankTouched.upiPhoneNumber ||
                              anyUPIFieldFilled) &&
                              validateUPIName(
                                formData.bankDetails.upiPhoneNumber
                              ) && (
                                <span className="text-xs text-red-500">
                                  {validateUPIName(
                                    formData.bankDetails.upiPhoneNumber
                                  )}
                                </span>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Salary Section */}
                  {activeSection === "salary" && (
                    <div className="flex-1 space-y-4">
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
                            <label className={inputLabelClass}>{label}</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                ₹
                              </span>
                              <input
                                type="number"
                                min="0"
                                className={`${inputClass} pl-8 ${
                                  field === "monthlyCtc" ||
                                  field === "allowances" ||
                                  field === "hra"
                                    ? "bg-gray-50"
                                    : ""
                                }`}
                                value={formData.salaryDetails[field] || ""}
                                onChange={(e) => {
                                  let val = e.target.value.replace(
                                    /[^\d.]/g,
                                    ""
                                  ); // Remove all except digits and dot
                                  if (val.startsWith(".")) val = ""; // Prevent leading dot
                                  if (val && parseFloat(val) < 0) val = ""; // Prevent negative
                                  // Prevent negative or plus sign in pasted value
                                  if (val.includes("-") || val.includes("+"))
                                    val = val.replace(/[-+]/g, "");
                                  handleInputChange(
                                    "salaryDetails",
                                    field,
                                    val
                                  );
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "-" || e.key === "+")
                                    e.preventDefault();
                                }}
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
                        {formData.employee.pfEnrolled && (
                          <>
                            <div className={inputGroupClass}>
                              <label className={inputLabelClass}>
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
                              <label className={inputLabelClass}>
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

                  {/* Action Buttons - visible on all sections */}
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-gray-100 gap-2">
                    {/* Left: Back Button */}
                    <div>
                      {(() => {
                        const sectionsArr = [
                          "personal",
                          "idProofs",
                          "bank",
                          "salary",
                        ];
                        const currentIndex = sectionsArr.indexOf(activeSection);
                        if (currentIndex > 0) {
                          return (
                            <motion.button
                              type="button"
                              className="px-6 py-3 rounded-xl bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-lg flex items-center gap-2"
                              onClick={() =>
                                setActiveSection(sectionsArr[currentIndex - 1])
                              }
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
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
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                              Back
                            </motion.button>
                          );
                        }
                        return null;
                      })()}
                    </div>
                    {/* Right: Cancel, Next, Save and Exit */}
                    <div className="flex gap-2 items-center">
                      <motion.button
                        type="button"
                        className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 border border-red-600 transition-all duration-200 shadow-lg flex items-center gap-2"
                        onClick={() =>
                          handleOpenModal("cancel", () => {
                            handleCloseModal();
                            router.push("/hradmin/employees");
                          })
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        type="button"
                        className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                        onClick={() => {
                          // Move to next section/tab
                          const sectionsArr = [
                            "personal",
                            "idProofs",
                            "bank",
                            "salary",
                          ];
                          const currentIndex =
                            sectionsArr.indexOf(activeSection);
                          if (currentIndex < sectionsArr.length - 1) {
                            setActiveSection(sectionsArr[currentIndex + 1]);
                          }
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span>Next</span>
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
                      </motion.button>
                      <motion.button
                        type="button"
                        className="px-8 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
                        onClick={() =>
                          handleOpenModal("saveExit", () => {
                            handleCloseModal();
                            handleSaveAndExit();
                          })
                        }
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
                            <span>Save and Exit</span>
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
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
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
          </div>
        </div>
      )}

      {/* Department Modal */}
      <DepartmentFormModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSuccess={handleDepartmentAdded}
        companyId={company}
      />

      {/* Designation Modal */}
      <DesignationFormModal
        isOpen={showDesignationModal}
        onClose={() => setShowDesignationModal(false)}
        onSuccess={handleDesignationAdded}
        companyId={company}
        defaultDepartment={formData.employee.department}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        open={modal.open}
        onClose={handleCloseModal}
        onConfirm={modal.onConfirm}
        {...modalContent[modal.type]}
      />

      {/* Passbook/Bank Document Preview Modal */}
      {bankPreview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full relative flex flex-col items-center">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              onClick={() => {
                setBankPreview({ open: false, imgUrl: "", file: null });
                setPdfControls({ rotate: 0, zoom: 1 });
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Passbook Document Preview
            </h2>
            {isPDF(bankPreview) ? (
              <>
                {/* PDF Toolbar (reuse docPreview toolbar) */}
                <div className="flex items-center gap-4 mb-2 bg-gray-50 rounded px-4 py-2 shadow-sm">
                  {/* Rotate Left */}
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate - 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600"
                    title="Rotate Left"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 11V7a5 5 0 015-5 5 5 0 015 5v4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 11l-4 4m0 0l4 4m-4-4h18"
                      />
                    </svg>
                  </button>
                  {/* Rotate Right */}
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate + 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600"
                    title="Rotate Right"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 13v4a5 5 0 01-5 5 5 5 0 01-5-5v-4"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 13l4-4m0 0l-4-4m4 4H3"
                      />
                    </svg>
                  </button>
                  {/* Zoom Out */}
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.max(0.5, c.zoom - 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600"
                    title="Zoom Out"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  {/* Zoom In */}
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.min(2, c.zoom + 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600"
                    title="Zoom In"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </button>
                  {/* Download */}
                  <a
                    href={bankPreview.imgUrl}
                    download={"passbook.pdf"}
                    className="text-gray-600 hover:text-blue-600"
                    title="Download PDF"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                      />
                    </svg>
                  </a>
                </div>
                {/* PDF Preview Area with dynamic width/height for rotation */}
                {(() => {
                  const rotation = ((pdfControls.rotate % 360) + 360) % 360;
                  const isSideways = rotation === 90 || rotation === 270;
                  const previewWidth = isSideways ? "24rem" : "100%";
                  const previewHeight = isSideways ? "100%" : "24rem";
                  return (
                    <div
                      className="flex justify-center items-center w-full bg-gray-100 rounded border overflow-auto"
                      style={{
                        width: "100%",
                        height: "24rem",
                        minHeight: "24rem",
                        minWidth: "24rem",
                        maxHeight: "32rem",
                        maxWidth: "100%",
                      }}
                    >
                      <div
                        style={{
                          width: previewWidth,
                          height: previewHeight,
                          transform: `rotate(${pdfControls.rotate}deg) scale(${pdfControls.zoom})`,
                          transition: "transform 0.2s",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <iframe
                          src={bankPreview.imgUrl + "#toolbar=0"}
                          title="Passbook PDF"
                          className="w-full h-full border-none"
                          style={{ background: "white" }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <img
                src={bankPreview.imgUrl}
                alt="Passbook preview"
                className="w-64 h-64 object-contain rounded border mb-4"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(EmployeeForm);
