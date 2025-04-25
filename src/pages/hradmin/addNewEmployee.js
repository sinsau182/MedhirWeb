import { useState, useEffect, useRef } from "react";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
// import Link from "next/link";
import { toast } from "sonner";
import { createEmployee, updateEmployee } from "@/redux/slices/employeeSlice";
import withAuth from "@/components/withAuth";
// import {
//   FaUserCircle,
//   FaUsers,
//   FaCalendarCheck,
//   FaMoneyCheckAlt,
//   FaCog,
//   FaArrowAltCircleUp,
// } from "react-icons/fa";
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
} from "react-icons/fi";
// import Select from "react-select";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import axios from "axios";

// Add this CSS class to your global styles or component
const inputGroupClass =
  "relative border border-gray-200 rounded-lg focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 bg-gray-50 transition-all duration-200";
const inputClass =
  "w-full px-3 py-2 bg-transparent outline-none text-gray-700 text-sm";
const floatingLabelClass =
  "absolute -top-2.5 left-2 bg-white px-1 text-sm font-medium text-gray-700 transition-all duration-200";

const MultiSelect = ({ label, options, value }) => {
  return (
    <div className={inputGroupClass}>
      <label className={floatingLabelClass}>{label}</label>
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

const DepartmentSelect = ({ label, options, value, onChange }) => {
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
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <span className="text-gray-700">{value.name || value}</span>
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
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
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
                <span className="text-gray-700">{department.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add DesignationSelect component after DepartmentSelect
const DesignationSelect = ({ label, options, value, onChange }) => {
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
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <span className="text-gray-700">{value.name || value}</span>
            ) : (
              <span className="text-gray-500">Select designation</span>
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
                <span className="text-gray-700">{designation.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Add this function to generate the next employee ID
// const generateEmployeeId = (lastEmployeeId) => {
//   if (!lastEmployeeId) return "emp001";
//   const currentNumber = parseInt(lastEmployeeId.slice(3));
//   return `emp${(currentNumber + 1).toString().padStart(3, "0")}`;
// };

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
      <label className={floatingLabelClass}>{label}</label>
      <div className="relative">
        <div
          className={`${inputClass} flex items-center justify-between cursor-pointer min-h-[42px]`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1 py-1">
            {value ? (
              <span className="text-gray-700">{value.name || value}</span>
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
          <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1">
            {options.map((manager) => (
              <div
                key={manager.employeeId}
                className={`px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                  value?.employeeId === manager.employeeId ? "bg-blue-50" : ""
                }`}
                onClick={() => {
                  onChange(manager);
                  setIsOpen(false);
                }}
              >
                <span className="text-gray-700">{manager.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function EmployeeForm() {
  const company = localStorage.getItem("selectedCompanyId");

  const router = useRouter();
  const dispatch = useDispatch();
  const { employees, err } = useSelector((state) => state.employees);

  const {
    activeMainTab,
    employee,
    activeSection: activeSectionParam,
  } = router.query;
  // const [activePage, setActivePage] = useState("Employees");
  const [activeMain, setActiveMain] = useState(activeMainTab || "Basic");
  const [employeeId, setEmployeeId] = useState(null);
  // const [selectedTab, setSelectedTab] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [previewModal, setPreviewModal] = useState({ show: false });
  const [activeSection, setActiveSection] = useState("personal");
  // const [lastEmployeeId, setLastEmployeeId] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  // const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [designations, setDesignations] = useState([]);
  const [managers, setManagers] = useState([]);

  // Add department fetch on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const companyId = localStorage.getItem("selectedCompanyId");

        if (!companyId) {
          console.error("No company ID found");
          toast.error("Company ID not found");
          return;
        }

        console.log("Fetching departments for company:", companyId);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/company/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Departments API response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setDepartments(response.data);
          if (response.data.length === 0) {
            toast.warning("No departments found for this company");
          }
        } else {
          console.error("Invalid departments data format:", response.data);
          toast.error("Invalid departments data received");
        }
      } catch (error) {
        console.error("Error fetching departments:", error.response || error);
        toast.error(
          error.response?.data?.message || "Failed to fetch departments"
        );
      }
    };

    fetchDepartments();
  }, []);

  // const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

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
            employeeId: parsedEmployee.employeeId || "",
            name: parsedEmployee.name || "",
            fathersName: parsedEmployee.fathersName || "",
            gender: parsedEmployee.gender || "",
            phone: parsedEmployee.phone || "",
            alternatePhone: parsedEmployee.alternatePhone || "",
            emailPersonal: parsedEmployee.emailPersonal || "",
            emailOfficial: parsedEmployee.emailOfficial || "",
            currentAddress: parsedEmployee.currentAddress || "",
            permanentAddress: parsedEmployee.permanentAddress || "",
            department: parsedEmployee.departmentName || "",
            designation: parsedEmployee.designationName || "",
            joiningDate: parsedEmployee.joiningDate || "",
            reportingManager: parsedEmployee.reportingManager || "",
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
          companyId: parsedEmployee.companyId || company, // Ensure companyId is set
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
  }, [employee]);

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

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
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
  };

  // const handleNestedInputChange = (section, parentField, field, value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [section]: {
  //       ...prev,
  //       [parentField]: {
  //         ...prev[section][parentField],
  //         [field]: value,
  //       },
  //     },
  //   }));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (activeSection !== "salary") {
      const currentIndex = sections.findIndex(
        (section) => section.id === activeSection
      );
      if (currentIndex < sections.length - 1) {
        setActiveSection(sections[currentIndex + 1].id);
        return;
      }
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const submitFormData = new FormData();

      // Helper function to remove empty fields
      const removeEmptyFields = (obj) => {
        const cleanObj = {};
        Object.entries(obj).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            if (
              typeof value === "object" &&
              !Array.isArray(value) &&
              !(value instanceof File)
            ) {
              const nestedClean = removeEmptyFields(value);
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

      const baseEmployeeData = {
        name: formData.employee.name?.trim(),
        fathersName: formData.employee.fathersName?.trim(),
        gender: formData.employee.gender?.trim(),
        phone: formData.employee.phone?.trim(),
        alternatePhone: formData.employee.alternatePhone?.trim(),
        emailPersonal: formData.employee.emailPersonal?.trim(),
        emailOfficial: formData.employee.emailOfficial?.trim(),
        currentAddress: formData.employee.currentAddress?.trim(),
        permanentAddress: formData.employee.permanentAddress?.trim(),
        department: formData.employee.department?.departmentId || "",
        designation: formData.employee.designation?.designationId || "",
        joiningDate: formData.employee.joiningDate,
        reportingManager:
          formData.employee.reportingManager?.employeeId?.trim() || "",
        overtimeEligibile: Boolean(formData.employee.overtimeEligibile),
        weeklyOffs: formData.employee.weeklyOffs?.length
          ? formData.employee.weeklyOffs
          : undefined,
        pfEnrolled: Boolean(formData.employee.pfEnrolled),
        uanNumber: formData.employee.uanNumber?.trim(),
        esicEnrolled: Boolean(formData.employee.esicEnrolled),
        esicNumber: formData.employee.esicNumber?.trim(),
        companyId: formData.companyId,
        idProofs: {
          aadharNo: formData.idProofs.aadharNo?.trim(),
          panNo: formData.idProofs.panNo?.trim(),
          passport: formData.idProofs.passport?.trim(),
          drivingLicense: formData.idProofs.drivingLicense?.trim(),
          voterId: formData.idProofs.voterId?.trim(),
        },
        bankDetails: {
          accountNumber: formData.bankDetails.accountNumber?.trim(),
          accountHolderName: formData.bankDetails.accountHolderName?.trim(),
          ifscCode: formData.bankDetails.ifscCode?.trim(),
          bankName: formData.bankDetails.bankName?.trim(),
          branchName: formData.bankDetails.branchName?.trim(),
          upiId: formData.bankDetails.upiId?.trim(),
          upiPhoneNumber: formData.bankDetails.upiPhoneNumber?.trim(),
        },
        salaryDetails: {
          annualCtc: formData.salaryDetails.annualCtc || undefined,
          monthlyCtc: formData.salaryDetails.monthlyCtc || undefined,
          basicSalary: formData.salaryDetails.basicSalary || undefined,
          hra: formData.salaryDetails.hra || undefined,
          allowances: formData.salaryDetails.allowances || undefined,
          employerPfContribution:
            formData.salaryDetails.employerPfContribution || undefined,
          employeePfContribution:
            formData.salaryDetails.employeePfContribution || undefined,
        },
      };

      const employeeData = removeEmptyFields(baseEmployeeData);
      submitFormData.append("employee", JSON.stringify(employeeData));

      // Update ID proof mappings with correct field name for Voter ID
      const idProofMappings = {
        aadharImgUrl: "aadharImage",
        pancardImgUrl: "panImage",
        passportImgUrl: "passportImage",
        drivingLicenseImgUrl: "drivingLicenseImage",
        voterIdImgUrl: "voterIdImage",
      };

      // Add ID proof files to FormData with logging
      Object.entries(idProofMappings).forEach(([formField, apiField]) => {
        const fileOrUrl = formData.idProofs[formField];
        if (fileOrUrl instanceof File) {
          // New file upload
          console.log(
            `Appending new ${formField} to FormData as ${apiField}:`,
            fileOrUrl
          );
          submitFormData.append(apiField, fileOrUrl);
        } else if (
          typeof fileOrUrl === "string" &&
          fileOrUrl.startsWith("http")
        ) {
          // Existing file URL - include in employee data
          if (!employeeData.idProofs) {
            employeeData.idProofs = {};
          }
          employeeData.idProofs[formField] = fileOrUrl;
        }
        // If fileOrUrl is null, the field will be omitted, effectively removing the image
      });

      // Add other files
      if (formData.employee.employeeImgUrl instanceof File) {
        submitFormData.append("profileImage", formData.employee.employeeImgUrl);
      }
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
        }
      } else {
        const result = await dispatch(createEmployee(submitFormData)).unwrap();
        if (result) {
          toast.success("Employee created successfully");
          router.push("/hradmin/employees");
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

  const validateForm = () => {
    const { employee } = formData;
    const errors = {};

    // Validate required fields
    // if (!employee.employeeId?.trim()) {
    //   errors.employeeId = "Employee ID is required";
    // }

    if (!employee.name?.trim()) {
      errors.name = "Employee name is required";
    }
    if (!employee.phone?.trim()) {
      errors.phone = "Phone number is required";
    }
    if (!employee.joiningDate) {
      errors.joiningDate = "Date of joining is required";
    }

    // // Only validate format for new employees
    // if (
    //   !employeeId &&
    //   employee.employeeId &&
    //   !employee.employeeId.match(/^emp\d{3}$/)
    // ) {
    //   errors.employeeId =
    //     "Employee ID must be in the format emp followed by 3 digits";
    // }

    // Validate phone number format if provided
    if (employee.phone && !/^[0-9]{10}$/.test(employee.phone)) {
      errors.phone = "Invalid phone number format";
    }

    // Validate other fields only if they are not empty
    const { idProofs, bankDetails } = formData;

    // Validate Aadhar number if provided
    if (idProofs.aadharNo && !/^\d{12}$/.test(idProofs.aadharNo)) {
      errors["idProofs.aadharNo"] = "Aadhar number must be exactly 12 digits";
    }

    // Validate PAN number if provided
    if (idProofs.panNo && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idProofs.panNo)) {
      errors["idProofs.panNo"] = "Invalid PAN number format";
    }

    // Validate Passport number if provided
    if (idProofs.passport && !/^[A-Z]{1}[0-9]{7}$/.test(idProofs.passport)) {
      errors["idProofs.passport"] = "Invalid Passport number format";
    }

    // Validate Driving License if provided
    if (
      idProofs.drivingLicense &&
      !/^[A-Z]{2}[0-9]{2}[0-9]{11}$/.test(idProofs.drivingLicense)
    ) {
      errors["idProofs.drivingLicense"] =
        "Invalid Driving License format. Format should be: State Code (2 letters) + Year (2 digits) + 11 digits";
    }

    // Validate Voter ID if provided
    if (idProofs.voterId && !/^[A-Z]{3}[0-9]{7}$/.test(idProofs.voterId)) {
      errors["idProofs.voterId"] = "Invalid Voter ID format";
    }

    // Validate Bank Account number if provided
    if (
      bankDetails.accountNumber &&
      !/^\d{9,18}$/.test(bankDetails.accountNumber)
    ) {
      errors["bankDetails.accountNumber"] =
        "Account number must be between 9 to 18 digits";
    }

    // Validate IFSC code if provided
    if (
      bankDetails.ifscCode &&
      !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)
    ) {
      errors["bankDetails.ifscCode"] = "Invalid IFSC Code format";
    }

    // If there are errors, show them and return false
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([field, message]) => {
        toast.error(message);
      });
      return false;
    }

    return true;
  };

  // Function to handle direct employee creation from personal details
  // const handleAddEmployeeFromPersonal = async () => {
  //   if (!validateForm()) return;

  //   setLoading(true);
  //   try {
  //     const personalFormData = new FormData();

  //     // Clean the form data to remove empty values
  //     const cleanEmployeeDetails = removeEmptyValues({
  //       employeeId: formData.employee.employeeId,
  //       name: formData.employee.name,
  //       fathersName: formData.employee.fathersName,
  //       gender: formData.employee.gender,
  //       phone: formData.employee.phone,
  //       alternatePhone: formData.employee.alternatePhone,
  //       emailPersonal: formData.employee.emailPersonal,
  //       emailOfficial: formData.employee.emailOfficial,
  //       currentAddress: formData.employee.currentAddress,
  //       permanentAddress: formData.employee.permanentAddress,
  //       department: formData.employee.department,
  //       designation: formData.employee.designation,
  //       joiningDate: formData.employee.joiningDate,
  //       reportingManager: formData.employee.reportingManager,
  //       overtimeEligibile: formData.employee.overtimeEligibile,
  //       weeklyOffs: formData.employee.weeklyOffs,
  //     });

  //     // Only append if we have non-empty data
  //     if (Object.keys(cleanEmployeeDetails).length > 0) {
  //       personalFormData.append(
  //         "employee",
  //         JSON.stringify(cleanEmployeeDetails)
  //       );
  //     }

  //     // Add profile image if exists
  //     if (formData.employee.employeeImgUrl instanceof File) {
  //       personalFormData.append(
  //         "employeeImgUrl",
  //         formData.employee.employeeImgUrl
  //       );
  //     }

  //     const result = await dispatch(createEmployee(personalFormData)).unwrap();
  //     toast.success("Employee created successfully");
  //     router.push("/hradmin/employees");
  //   } catch (err) {
  //     let errorMessage = "An error occurred";

  //     if (err?.validationErrors) {
  //       // Handle validation errors
  //       const validationMessages = Object.entries(err.validationErrors)
  //         .map(([field, message]) => `${field}: ${message}`)
  //         .join("\n");
  //       errorMessage = validationMessages;
  //     } else if (typeof err === "string") {
  //       errorMessage = err;
  //     } else if (err?.message) {
  //       errorMessage = err.message;
  //     } else if (err?.error) {
  //       errorMessage = err.error;
  //     }

  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleTabClick = (tab) => {
  //   router.push({
  //     pathname: "/hradmin/employees",
  //     query: { tab },
  //   });
  // };

  useEffect(() => {
    if (activeMainTab) setActiveMain(activeMainTab);
    if (activeSectionParam) setActiveSection(activeSectionParam);
  }, [activeMainTab, activeSectionParam]);

  // const handlePhotoUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     // Handle the file upload logic here
  //     console.log("Uploaded file:", file);
  //   }
  // };

  const handleFileUpload = (documentType, file) => {
    if (file) {
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

      console.log(`Uploading ${documentType} file:`, file.name);

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          [documentType === "passbookImgUrl" ? "bankDetails" : "idProofs"]: {
            ...(documentType === "passbookImgUrl" ? prev.bankDetails : prev.idProofs),
            [fields.imgField]: file, // Store the File object for upload
          },
        };

        console.log(`Updated form data for ${documentType}:`, updatedData);

        return updatedData;
      });
    }
  };

  // Move these functions before the sections array definition
  const checkPersonalDetailsCompletion = () => {
    const requiredFields = [
      "name",
      "phone",
      "joiningDate",
      "department",
      "designation",
      "reportingManager",
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
      formData.idProofs.aadharNo?.trim() && formData.idProofs.panNo?.trim() && formData.idProofs.passport?.trim() && formData.idProofs.drivingLicense?.trim() && formData.idProofs.voterId?.trim()
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
        // Only fetch if a department is selected and has a departmentId
        if (!formData.employee.department?.departmentId) {
          setDesignations([]);
          return;
        }

        const token = getItemFromSessionStorage("token", null);
        const departmentId = formData.employee.department.departmentId;

        console.log("Fetching designations for department:", departmentId);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/designations/department/${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Designations API response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setDesignations(response.data);
          if (response.data.length === 0) {
            toast.warning("No designations found for this department");
          }
        } else {
          console.error("Invalid designations data format:", response.data);
          toast.error("Invalid designations data received");
        }
      } catch (error) {
        console.error("Error fetching designations:", error.response || error);
        toast.error(
          error.response?.data?.message || "Failed to fetch designations"
        );
      }
    };

    fetchDesignations();
  }, [formData.employee.department?.departmentId]);

  // Fetch managers when department changes
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const departmentId = formData.employee.department?.departmentId;
        if (!departmentId) {
          setManagers([]);
          return;
        }

        const token = getItemFromSessionStorage("token", null);
        console.log("Fetching managers for department:", departmentId);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/departments/${departmentId}/managers`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Managers API response:", response.data);

        if (response.data && Array.isArray(response.data)) {
          setManagers(response.data);
          if (response.data.length === 0) {
            toast.warning("No managers found for this department");
          }
        } else {
          console.error("Invalid managers data format:", response.data);
          toast.error("Invalid managers data received");
        }
      } catch (error) {
        console.error("Error fetching managers:", error.response || error);
        toast.error(
          error.response?.data?.message || "Failed to fetch managers"
        );
      }
    };

    fetchManagers();
  }, [formData.employee.department?.departmentId]);

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
            <div className="flex items-center justify-between mb-0">
              <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                {employee ? "✏️ Edit Employee" : "New Employee"}
              </h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col ">
              <div className="bg-white rounded-2xl shadow-sm p-4 relative overflow-hidden flex-1">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50 rounded-full -mr-20 -mt-20 z-0" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-50 rounded-full -ml-16 -mb-16 z-0" />

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
                  className="relative z-10 pb-20"
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
                            checked={
                              formData.employee.permanentAddress ===
                              formData.employee.currentAddress
                            } // Sync checkbox state
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
                                ); // Clear permanent address
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
                          <DepartmentSelect
                            label="Department"
                            options={departments}
                            value={formData.employee.department}
                            onChange={(selectedDepartment) => {
                              handleInputChange("employee", "department", {
                                departmentId: selectedDepartment.departmentId,
                                name: selectedDepartment.name,
                              });

                              // Set weekly holidays as read-only weekly offs
                              const weeklyHolidays =
                                selectedDepartment.weeklyHolidays
                                  ? selectedDepartment.weeklyHolidays.split(",")
                                  : [];
                              handleInputChange(
                                "employee",
                                "weeklyOffs",
                                weeklyHolidays
                              );

                              // Clear designation and manager when department changes
                              handleInputChange(
                                "employee",
                                "designation",
                                null
                              );
                              handleInputChange(
                                "employee",
                                "reportingManager",
                                null
                              );
                            }}
                          />
                          <DesignationSelect
                            label="Designation"
                            options={designations}
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
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {[
                            {
                              label: "Date of Joining",
                              field: "joiningDate",
                              required: true,
                              type: "date",
                            },
                            // {
                            //   label: "Reporting Manager",
                            //   field: "reportingManager",
                            // },
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

                          <div className="grid grid-cols-1 gap-4">
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
                                <div className={`${inputGroupClass} mt-2`}>
                                  <label className={floatingLabelClass}>
                                    UAN Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.employee.uanNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "employee",
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
                                <div className={`${inputGroupClass} mt-2`}>
                                  <label className={floatingLabelClass}>
                                    ESIC Number
                                  </label>
                                  <input
                                    type="text"
                                    className={inputClass}
                                    value={formData.employee.esicNumber || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        "employee",
                                        "esicNumber",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Enter ESIC Number"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ID Proofs Section */}
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
                            imgField: "aadharImgUrl",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            docType: "PAN Card",
                            imgField: "pancardImgUrl",
                          },
                          {
                            label: "Passport",
                            key: "passport",
                            docType: "Passport",
                            imgField: "passportImgUrl",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            docType: "Driving License",
                            imgField: "drivingLicenseImgUrl",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            docType: "Voter ID",
                            imgField: "voterIdImgUrl",
                          },
                        ].map(({ label, key, docType, imgField }) => (
                          <div key={key} className={inputGroupClass}>
                            <label className={floatingLabelClass}>
                              {label}
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
                                {formData.idProofs[imgField] ? (
                                  <div className="flex items-center gap-2">
                                    {/* Show preview for both new uploads and existing files */}
                                    {formData.idProofs[imgField] instanceof
                                    File ? (
                                      // For new uploads (File objects)
                                      <img
                                        src={URL.createObjectURL(
                                          formData.idProofs[imgField]
                                        )}
                                        alt={`${docType} preview`}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    ) : (
                                      // For existing files (URLs)
                                      <img
                                        src={formData.idProofs[imgField]}
                                        alt={`${docType} preview`}
                                        className="w-8 h-8 object-cover rounded"
                                      />
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setFormData((prev) => ({
                                          ...prev,
                                          idProofs: {
                                            ...prev.idProofs,
                                            [imgField]: null,
                                          },
                                        }));
                                      }}
                                      className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <label
                                    htmlFor={`upload-${key}`}
                                    className="cursor-pointer"
                                  >
                                    <FiUpload className="w-5 h-5 text-gray-500 hover:text-blue-600" />
                                    <span className="invisible group-hover:visible absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap">
                                      Upload {docType}
                                    </span>
                                  </label>
                                )}
                                <input
                                  type="file"
                                  id={`upload-${key}`}
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      // Add file size validation (e.g., 5MB limit)
                                      const maxSize = 5 * 1024 * 1024; // 5MB
                                      if (file.size > maxSize) {
                                        toast.error(
                                          "File size should not exceed 5MB"
                                        );
                                        return;
                                      }
                                      // Add file type validation
                                      const allowedTypes = [
                                        "application/pdf",
                                        "image/jpeg",
                                        "image/jpg",
                                        "image/png",
                                      ];
                                      if (!allowedTypes.includes(file.type)) {
                                        toast.error(
                                          "Please upload a valid PDF or image file"
                                        );
                                        return;
                                      }
                                      handleFileUpload(key, file);
                                    }
                                  }}
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
                      <div className="mt-2 space-y-1">
                        <h4 className="text-sm font-medium text-gray-700">
                          Account Verification Document
                        </h4>
                        <div className="flex items-start space-x-6">
                          {/* Passbook Photo Upload */}
                          <div className="flex-1">
                            <div className={`border-2 border-dashed rounded-lg p-2 transition-all duration-200 ${
                              formData.bankDetails.passbookImgUrl 
                                ? 'border-green-200 bg-green-50' 
                                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                            }`}>
                              <div className="flex flex-col items-center justify-center">
                                <input
                                  type="file"
                                  id="passbook-upload"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      // Add file size validation (e.g., 5MB limit)
                                      const maxSize = 5 * 1024 * 1024; // 5MB
                                      if (file.size > maxSize) {
                                        toast.error("File size should not exceed 5MB");
                                        return;
                                      }
                                      // Add file type validation
                                      const allowedTypes = [
                                        "application/pdf",
                                        "image/jpeg",
                                        "image/jpg",
                                        "image/png",
                                      ];
                                      if (!allowedTypes.includes(file.type)) {
                                        toast.error("Please upload a valid PDF or image file");
                                        return;
                                      }
                                      handleFileUpload("passbookImgUrl", file);
                                    }
                                  }}
                                />
                                <label
                                  htmlFor="passbook-upload"
                                  className="cursor-pointer text-center group"
                                >
                                  <div className="flex flex-col items-center space-y-1">
                                    <div className={`p-1 rounded-full ${
                                      formData.bankDetails.passbookImgUrl 
                                        ? 'bg-green-100 text-green-600' 
                                        : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200'
                                    }`}>
                                      <FiUpload className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                      <p className="text-xs font-medium text-gray-700">
                                        {formData.bankDetails.passbookImgUrl 
                                          ? 'Upload a different file' 
                                          : 'Upload Passbook/Cancelled Cheque'}
                                      </p>
                                      <p className="text-[10px] text-gray-500">
                                        PDF or Image file (max 5MB)
                                      </p>
                                    </div>
                                  </div>
                                </label>
                              </div>
                              {formData.bankDetails.passbookImgUrl && (
                                <div className="mt-1.5 flex items-center justify-between bg-white rounded-lg p-1.5 shadow-sm">
                                  <div className="flex items-center space-x-2">
                                    {formData.bankDetails.passbookImgUrl instanceof File ? (
                                      <img
                                        src={URL.createObjectURL(formData.bankDetails.passbookImgUrl)}
                                        alt="Passbook preview"
                                        className="w-8 h-8 object-cover rounded border border-gray-200"
                                      />
                                    ) : (
                                      <img
                                        src={formData.bankDetails.passbookImgUrl}
                                        alt="Passbook preview"
                                        className="w-8 h-8 object-cover rounded border border-gray-200"
                                      />
                                    )}
                                    <div className="flex flex-col">
                                      <span className="text-xs font-medium text-gray-700 truncate max-w-[180px]">
                                        {formData.bankDetails.passbookImgUrl instanceof File
                                          ? formData.bankDetails.passbookImgUrl.name
                                          : "Passbook Document"}
                                      </span>
                                      <span className="text-[10px] text-gray-500">
                                        {formData.bankDetails.passbookImgUrl instanceof File
                                          ? `${(formData.bankDetails.passbookImgUrl.size / 1024 / 1024).toFixed(2)} MB`
                                          : "Uploaded Document"}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({
                                        ...prev,
                                        bankDetails: {
                                          ...prev.bankDetails,
                                          passbookImgUrl: null,
                                        },
                                      }));
                                    }}
                                    className="p-0.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors"
                                    title="Remove file"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
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
                        {formData.employee.pfEnrolled && (
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

                {/* Fixed Action Buttons */}
                <div className="fixed bottom-8 right-8 z-50 flex gap-4">
                  <motion.button
                    type="button"
                    className="px-6 py-3 rounded-xl bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200 shadow-lg"
                    onClick={() => router.push("/hradmin/employees")}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>

                  <motion.button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 shadow-lg"
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
                        <span>
                          {activeSection === "salary"
                            ? employee
                              ? "Update Employee"
                              : "Save and Exit"
                            : "Save and Continue"}
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
