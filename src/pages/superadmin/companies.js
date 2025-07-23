import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
} from "@/redux/slices/companiesSlice";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import {
  UserPlus,
  Edit,
  ChevronDown,
  User,
  Trash,
  Info,
  Check,
} from "lucide-react";
import { FaBuilding } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import axios from "axios";
import { updateEmployee } from "@/redux/slices/employeeSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// Helper function to truncate text and show tooltip
const TruncatedText = ({ text, maxWidth, className = "", trimAfter = 20 }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`truncate ${maxWidth} ${className} relative group`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span title={text}>{text}</span>
      {showTooltip && text && text.length > trimAfter && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-2 left-0 transform -translate-y-full max-w-xs break-words">
          {text}
          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

function SuperadminCompanies() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Companies");
  const deleteButtonRef = useRef(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);

  // Add this line to define gstInputRef
  const gstInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    regAdd: "",
    companyHeads: [], // Changed from companyHead to companyHeads array
    colorCode: "#B0E0E6", // Default color selected
  });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    regAdd: "",
  });
  const [fieldTouched, setFieldTouched] = useState({
    name: false,
    email: false,
    phone: false,
    gst: false,
    regAdd: false,
  });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Company Head related states
  const [isCompanyHeadModalOpen, setIsCompanyHeadModalOpen] = useState(false);
  const [companyHeadData, setCompanyHeadData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    phone: "",
    employeeId: "", // Add employeeId to track when editing
  });
  const [companyHeadError, setCompanyHeadError] = useState("");
  const [companyHeadValidationErrors, setCompanyHeadValidationErrors] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });
  const [companyHeadFieldTouched, setCompanyHeadFieldTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
  });
  const [isCompanyHeadValid, setIsCompanyHeadValid] = useState(true);

  const dispatch = useDispatch();
  const { companies, loading, err } = useSelector((state) => state.companies);
  const [error, setError] = useState("");

  console.log("Companies:", companies);

  useEffect(() => {
    const token = getItemFromSessionStorage("token");
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    dispatch(fetchCompanies())
      .unwrap()
      .then((response) => {
        console.log("Companies fetched:", response);
      })
      .catch((error) => {
        toast.error("Error fetching companies:", error);
        if (error.includes("Authentication")) {
          toast.error("Session expired. Please login again");
          router.push("/login");
        } else {
          toast.error(error || "Failed to fetch companies");
        }
      });
  }, [dispatch, router]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  // Validation functions
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  // Update validateGST to only validate if not empty (GST optional)
  const validateGST = (gst) => {
    if (!gst) return true; // Optional
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return regex.test(gst);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Company name is required";
        } else if (value.trim().length < 2) {
          error = "Company name must be at least 2 characters";
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!validatePhone(value)) {
          error = "Please enter a valid 10-digit phone number";
        }
        break;
      case "gst":
        if (value.trim() && !validateGST(value)) {
          error = "Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)";
        }
        break;
      case "regAdd":
        if (!value.trim()) {
          error = "Registered address is required";
        } else if (value.trim().length < 10) {
          error = "Address must be at least 10 characters";
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateCompanyHeadField = (name, value) => {
    let error = "";
    // Only allow single word (no spaces) for name fields
    const singleWordRegex = /^[A-Za-z]+$/;
    switch (name) {
      case "firstName":
      case "middleName":
      case "lastName":
        if (!value.trim()) {
          error = `${
            name === "firstName"
              ? "First"
              : name === "middleName"
              ? "Middle"
              : "Last"
          } name is required`;
        } else if (!singleWordRegex.test(value)) {
          error = `${
            name === "firstName"
              ? "First"
              : name === "middleName"
              ? "Middle"
              : "Last"
          } name must be a single word with only letters (no spaces)`;
        } else if (value.trim().length < 2 && name !== "middleName") {
          error = `${
            name === "firstName" ? "First" : "Last"
          } name must be at least 2 characters`;
        }
        break;
      case "email":
        if (!value.trim()) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email address";
        }
        break;
      case "phone":
        if (!value.trim()) {
          error = "Phone number is required";
        } else if (!validatePhone(value)) {
          error = "Please enter a valid 10-digit phone number";
        }
        break;
      default:
        break;
    }
    return error;
  };

  // Smart email suggestion function
  const getEmailSuggestion = (input) => {
    if (!input || input.includes("@")) return null;

    const cleanInput = input.trim().toLowerCase();
    if (cleanInput.length >= 2) {
      return `${cleanInput}@gmail.com`;
    }
    return null;
  };

  const handleOpenCompanyModal = (company = null) => {
    setSelectedCompany(company);
    if (company) {
      setIsEditing(true); // Set the state to editing if a company is selected for update
      setCompanyData({
        ...company,
        colorCode: company.colorCode || "", // Ensure colorCode is included
        companyHeads: company.companyHeads || [], // Include company heads data as array
      });
      // Set original email for comparison during editing
      setOriginalEmail(company.email || "");
      // Set original phone for comparison during editing
      setOriginalPhone(company.phone || "");
      // Pre-fill companyHeadData for editing (take first company head if exists)
      if (company.companyHeads && company.companyHeads.length > 0) {
        const firstHead = company.companyHeads[0];
        setCompanyHeadData({
          firstName: firstHead.firstName || "",
          middleName: firstHead.middleName || "",
          lastName: firstHead.lastName || "",
          email: firstHead.email || "",
          phone: firstHead.phone || "",
          employeeId: firstHead.employeeId || "",
        });
      } else {
        setCompanyHeadData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          phone: "",
          employeeId: "",
        });
      }
    } else {
      setIsEditing(false); // Reset to adding mode
      setCompanyData({
        name: "",
        email: "",
        phone: "",
        gst: "",
        regAdd: "",
        colorCode: "#D1D5DB", // Default to grey color
        companyHeads: [], // Initialize company heads as empty array
      });
      setCompanyHeadData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        employeeId: "",
      });
      // Reset original email when adding new company
      setOriginalEmail("");
      // Reset original phone when adding new company
      setOriginalPhone("");
    }

    // Reset validation states
    setValidationErrors({
      name: "",
      email: "",
      phone: "",
      gst: "",
      regAdd: "",
    });
    setFieldTouched({
      name: false,
      email: false,
      phone: false,
      gst: false,
      regAdd: false,
    });

    setIsCompanyModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    if (name === "phone") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    // GST logic
    if (name === "gst") {
      // Save cursor position
      const input = gstInputRef.current;
      const start = input ? input.selectionStart : null;
      // Transform value
      let newValue = value
        .toUpperCase()
        .replace(/[^0-9A-Z]/g, "")
        .slice(0, 15);
      processedValue = newValue;
      setCompanyData((prevData) => ({ ...prevData, gst: processedValue }));
      // Restore cursor position
      setTimeout(() => {
        if (input && start !== null) {
          input.setSelectionRange(start, start);
        }
      }, 0);
      // Real-time validation
      const error = validateField(name, processedValue);
      setValidationErrors((prev) => ({ ...prev, [name]: error }));
      return;
    }
    // Company Prefix logic: eliminate spaces
    if (name === "prefixForEmpID") {
      processedValue = value.replace(/\s+/g, "");
    }
    // Company Name logic: eliminate all spaces except allow at most one trailing space
    if (name === "name") {
      processedValue = value
        .replace(/^ +/, "") // Remove leading spaces
        .replace(/ +$/, " "); // Allow at most one trailing space
    }
    // Email logic: eliminate all spaces
    if (name === "email") {
      processedValue = value.replace(/\s+/g, "");
    }
    // Registered Address logic: no leading space, only one space between words, allow at most one trailing space
    if (name === "regAdd") {
      processedValue = value
        .replace(/^ +/, "") // No leading spaces
        .replace(/ {2,}/g, " ") // Only one space between words
        .replace(/ +$/, (match) => (match.length > 1 ? " " : match)); // At most one trailing space
    }
    setCompanyData((prevData) => {
      const updatedData = { ...prevData, [name]: processedValue };
      if (name === "name" && !isEditing) {
        // Remove all spaces for prefix logic
        const nameNoSpaces = processedValue.replace(/\s+/g, "");
        if (nameNoSpaces.length > 0) {
          updatedData.prefixForEmpID = nameNoSpaces
            .substring(0, 3)
            .toUpperCase();
        } else {
          updatedData.prefixForEmpID = "";
        }
      }
      if (name === "prefixForEmpID" && !isEditing) {
        const cleanedPrefix = processedValue
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .slice(0, 3);
        updatedData.prefixForEmpID = cleanedPrefix;
      }
      return updatedData;
    });
    // Real-time validation
    const error = validateField(name, processedValue);
    setValidationErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFieldBlur = (name, value) => {
    setFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleCompanyHeadInputChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    // For name fields, allow only letters, no spaces at all
    if (["firstName", "middleName", "lastName"].includes(name)) {
      processedValue = value.replace(/[^A-Za-z]/g, ""); // Only letters, no spaces
    }
    if (name === "phone") {
      processedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    if (name === "email") {
      processedValue = value.replace(/\s+/g, "");
    }
    setCompanyHeadData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
    // Real-time validation for company head fields
    const error = validateCompanyHeadField(name, processedValue);
    setCompanyHeadValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const checkEmployeeExistence = async (email, phone) => {
    try {
      const token = getItemFromSessionStorage("token"); // or your token getter
      const response = await axios.get(
        `${API_BASE_URL}/employees/existence-check`,
        {
          params: { email, phone },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      // Optionally handle 401 here (e.g., redirect to login)
      return {};
    }
  };

  const debouncedCompanyEmail = useDebounce(companyData.email, 500);
  const debouncedPrefix = useDebounce(companyData.prefixForEmpID, 500);

  // Add state to track original email for comparison during editing
  const [originalEmail, setOriginalEmail] = useState("");
  // Add state to track original phone for comparison during editing
  const [originalPhone, setOriginalPhone] = useState("");

  // Helper for company uniqueness check
  const checkCompanyUnique = async (email, phone, prefixForEmpID) => {
    try {
      const token = getItemFromSessionStorage("token");
      const response = await axios.get(
        `${API_BASE_URL}/superadmin/companies/check-unique`,
        {
          params: { email, phone, prefixForEmpID },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return {};
    }
  };

  // Debounced check for company email (persistent error logic)
  useEffect(() => {
    const check = async () => {
      if (!debouncedCompanyEmail) {
        setValidationErrors((prev) => ({ ...prev, email: "" }));
        return;
      }
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(debouncedCompanyEmail)) {
        setValidationErrors((prev) => ({
          ...prev,
          email: "Please enter a valid email address",
        }));
        return;
      }

      // If editing, only check if email has changed
      if (isEditing && debouncedCompanyEmail === originalEmail) {
        // Email hasn't changed, clear any uniqueness error
        setValidationErrors((prev) => {
          if (prev.email === "This email already exists.") {
            return { ...prev, email: "" };
          } else {
            // Run format/required validation
            const error = validateField("email", debouncedCompanyEmail);
            return { ...prev, email: error };
          }
        });
        return;
      }

      const result = await checkCompanyUnique(
        debouncedCompanyEmail,
        undefined,
        undefined
      );
      if (result.email) {
        setValidationErrors((prev) => ({
          ...prev,
          email: "This email already exists.",
        }));
      } else {
        // Only clear error if uniqueness passes and value changed
        setValidationErrors((prev) => {
          if (prev.email === "This email already exists.") {
            return { ...prev, email: "" };
          } else {
            // Run format/required validation if not uniqueness error
            const error = validateField("email", debouncedCompanyEmail);
            return { ...prev, email: error };
          }
        });
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCompanyEmail, isEditing, originalEmail]);

  // Debounced check for company prefix (persistent error logic)
  useEffect(() => {
    if (isEditing) return; // Skip uniqueness check when editing
    const check = async () => {
      if (!debouncedPrefix || debouncedPrefix.length < 3) {
        setValidationErrors((prev) => ({ ...prev, prefixForEmpID: "" }));
        return;
      }
      const result = await checkCompanyUnique(
        undefined,
        undefined,
        debouncedPrefix
      );
      console.log("Prefix uniqueness API result:", result); // Debug log
      if (result.prefixForEmpID) {
        setValidationErrors((prev) => ({
          ...prev,
          prefixForEmpID: "This prefix already exists.",
        }));
      } else {
        setValidationErrors((prev) => {
          if (prev.prefixForEmpID === "This prefix already exists.") {
            return { ...prev, prefixForEmpID: "" };
          } else {
            const error = validateField("prefixForEmpID", debouncedPrefix);
            return { ...prev, prefixForEmpID: error };
          }
        });
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedPrefix, isEditing]);

  // Phone check when 10 digits entered (persistent error logic)
  const handleCompanyPhoneChange = (e) => {
    handleInputChange(e);
    const phoneValue = e.target.value;
    
    // If editing, check if phone has changed
    if (isEditing && phoneValue === originalPhone) {
      // Phone hasn't changed, only run format/required validation
      const error = validateField("phone", phoneValue);
      setValidationErrors((prev) => ({ ...prev, phone: error }));
      return;
    }
    
    if (phoneValue.length === 10) {
      checkCompanyUnique(undefined, phoneValue, undefined).then(
        (result) => {
          if (result.phone) {
            setValidationErrors((prev) => ({
              ...prev,
              phone: "This phone number already exists.",
            }));
          } else {
            setValidationErrors((prev) => {
              if (prev.phone === "This phone number already exists.") {
                return { ...prev, phone: "" };
              } else {
                const error = validateField("phone", phoneValue);
                return { ...prev, phone: error };
              }
            });
          }
        }
      );
    } else {
      const error = validateField("phone", phoneValue);
      setValidationErrors((prev) => ({ ...prev, phone: error }));
    }
  };

  const handleCompanyHeadFieldBlur = async (name, value) => {
    setCompanyHeadFieldTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Only check for phone
    if (name === "phone") {
      const email = companyHeadData.email;
      const phone = value;
      const existence = await checkEmployeeExistence(email, phone);
      let hasError = false;
      if (existence.phone || existence.phonePersonal) {
        setCompanyHeadValidationErrors((prev) => ({
          ...prev,
          phone: "This phone number already exists.",
        }));
        hasError = true;
      } else {
        setCompanyHeadValidationErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
      setIsCompanyHeadValid(!hasError);
      if (hasError) return;
    }

    const error = validateCompanyHeadField(name, value);
    setCompanyHeadValidationErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSaveCompany = async () => {
    // Mark all fields as touched to show all validation errors
    setFieldTouched({
      name: true,
      email: true,
      phone: true,
      gst: true,
      regAdd: true,
    });

    // Validate all fields
    const errors = {};
    Object.keys(companyData).forEach((key) => {
      if (["name", "email", "phone", "gst", "regAdd"].includes(key)) {
        errors[key] = validateField(key, companyData[key]);
      }
    });

    setValidationErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      toast.error("Please fix the validation errors before saving");
      return;
    }

    try {
      // Prepare company data in the required format
      const requestBody = {
        company: {
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          gst: companyData.gst,
          regAdd: companyData.regAdd,
          prefixForEmpID: companyData.prefixForEmpID,
          colorCode: companyData.colorCode,
        },
        companyHeads:
          companyData.companyHeads && companyData.companyHeads.length > 0
            ? companyData.companyHeads
            : [],
      };

      if (isEditing) {
        // For update, use different payload structure with companyHeadIds
        const updateRequestBody = {
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          gst: companyData.gst,
          regAdd: companyData.regAdd,
          // Do NOT include prefixForEmpID if editing, or just send the existing value
          prefixForEmpID: companyData.prefixForEmpID, // This should be the original, uneditable value
          colorCode: companyData.colorCode,
          companyHeadIds:
            companyData.companyHeads && companyData.companyHeads.length > 0
              ? companyData.companyHeads
                  .map((head) => head.employeeId)
                  .filter(Boolean)
              : [],
        };

        // Dispatch update action with Redux and handle the result properly
        const result = await dispatch(
          updateCompany({
            id: selectedCompany.companyId, // Handle both id formats
            updatedData: updateRequestBody,
          })
        );

        // Check if the action was fulfilled or rejected
        if (updateCompany.fulfilled.match(result)) {
          toast.success("Company updated successfully!");
          // Refetch updated list
          dispatch(fetchCompanies());
          // Close modal and reset selection
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        } else if (updateCompany.rejected.match(result)) {
          // Handle specific backend validation errors
          const errorMessage = result.payload || result.error?.message || "Failed to update company";
          
          // Check for specific field errors
          if (errorMessage.includes("phone number already exists")) {
            setValidationErrors(prev => ({
              ...prev,
              phone: "This phone number already exists"
            }));
            toast.error("Please fix the phone number error");
            return; // Don't close modal
          } else if (errorMessage.includes("email already exists")) {
            setValidationErrors(prev => ({
              ...prev,
              email: "This email already exists"
            }));
            toast.error("Please fix the email error");
            return; // Don't close modal
          } else {
            toast.error(errorMessage);
            return; // Don't close modal for other errors
          }
        }
      } else {
        const result = await dispatch(createCompany(requestBody));

        if (createCompany.fulfilled.match(result)) {
          toast.success("Company created successfully!");
          // Refetch updated list
          dispatch(fetchCompanies());
          // Close modal and reset selection
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        } else if (createCompany.rejected.match(result)) {
          // Handle specific backend validation errors for create
          const errorMessage = result.payload || result.error?.message || "Failed to create company";
          
          // Check for specific field errors
          if (errorMessage.includes("phone number already exists")) {
            setValidationErrors(prev => ({
              ...prev,
              phone: "This phone number already exists"
            }));
            toast.error("Please fix the phone number error");
            return; // Don't close modal
          } else if (errorMessage.includes("email already exists")) {
            setValidationErrors(prev => ({
              ...prev,
              email: "This email already exists"
            }));
            toast.error("Please fix the email error");
            return; // Don't close modal
          } else {
            toast.error(errorMessage);
            return; // Don't close modal for other errors
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const predefinedColors = [
    "#B0E0E6",
    "#FFE4E1",
    "#F0E68C",
    "#E6E6FA",
    "#D1D5DB",
  ];

  // Helper function to get field status
  const getFieldStatus = (fieldName, value, touched, error) => {
    if (!touched) return "default";
    if (error) return "error";
    if (value && value.trim()) return "success";
    return "default";
  };

  // Helper function to get border color class
  const getBorderColorClass = (fieldName, value, touched, error) => {
    const status = getFieldStatus(fieldName, value, touched, error);
    switch (status) {
      case "error":
        return "border-red-500 focus:border-red-500 focus:ring-red-500";
      case "success":
        return "border-green-500 focus:border-green-500 focus:ring-green-500";
      default:
        return "border-gray-300 focus:border-blue-500 focus:ring-blue-500";
    }
  };

  // Function to check if the form is valid
  const isFormValid = () => {
    const requiredFields = ["name", "email", "phone", "regAdd"];

    // Check if all required fields have values
    const hasAllValues = requiredFields.every(
      (field) => companyData[field] && companyData[field].trim() !== ""
    );

    // Check if all required fields are valid (no validation errors)
    const hasNoErrors = requiredFields.every(
      (field) => !validationErrors[field] || validationErrors[field] === ""
    );

    // Color is always selected (has default)
    const hasColorSelected = true;

    // Company Head must be present and valid
    const hasCompanyHead =
      companyData.companyHeads &&
      companyData.companyHeads.length > 0 &&
      companyData.companyHeads[0].firstName &&
      companyData.companyHeads[0].lastName &&
      companyData.companyHeads[0].email &&
      companyData.companyHeads[0].phone &&
      companyData.companyHeads[0].firstName.trim() !== "" &&
      companyData.companyHeads[0].lastName.trim() !== "" &&
      companyData.companyHeads[0].email.trim() !== "" &&
      companyData.companyHeads[0].phone.trim() !== "";

    return hasAllValues && hasNoErrors && hasColorSelected && hasCompanyHead;
  };

  // Function to check if the company head form is valid
  const isCompanyHeadFormValid = () => {
    const requiredFields = ["firstName", "lastName", "email", "phone"];

    // Check if all required fields have values
    const hasAllValues = requiredFields.every(
      (field) => companyHeadData[field] && companyHeadData[field].trim() !== ""
    );

    // Check if all required fields are valid (no validation errors)
    const hasNoErrors = requiredFields.every(
      (field) =>
        !companyHeadValidationErrors[field] ||
        companyHeadValidationErrors[field] === ""
    );

    return hasAllValues && hasNoErrors;
  };

  const handleColorChange = (color) => {
    setCompanyData((prevData) => ({ ...prevData, colorCode: color }));
  };

  // Company Head related functions
  const handleOpenCompanyHeadModal = () => {
    if (companyData.companyHeads && companyData.companyHeads.length > 0) {
      const firstHead = companyData.companyHeads[0];
      setCompanyHeadData({
        firstName: firstHead.firstName || "",
        middleName: firstHead.middleName || "",
        lastName: firstHead.lastName || "",
        email: firstHead.email || "",
        phone: firstHead.phone || "",
        employeeId: firstHead.employeeId || "", // Preserve employeeId when editing
      });
    } else {
      setCompanyHeadData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
        employeeId: "", // Reset employeeId for new company head
      });
    }
    setCompanyHeadError("");
    setIsCompanyHeadModalOpen(true);
  };

  const handleCompanyHeadSave = async () => {
    // Mark all company head fields as touched
    setCompanyHeadFieldTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    });

    // Validate all company head fields
    const errors = {};
    Object.keys(companyHeadData).forEach((key) => {
      if (["firstName", "lastName", "email", "phone"].includes(key)) {
        errors[key] = validateCompanyHeadField(key, companyHeadData[key]);
      }
    });

    setCompanyHeadValidationErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some((error) => error);
    if (hasErrors) {
      toast.error(
        "Please fix the validation errors before saving Company Head"
      );
      return;
    }

    // If editing an existing company head, update employee
    if (companyHeadData.employeeId) {
      // Prepare the updated employee data
      const updatedEmployee = {
        companyId: companyData.companyId,
        firstName: companyHeadData.firstName,
        middleName: companyHeadData.middleName,
        lastName: companyHeadData.lastName,
        phone: companyHeadData.phone,
        emailPersonal: companyHeadData.email, // or companyHeadData.emailPersonal if that's the field
      };

      // Create FormData and append employee as JSON string
      const formData = new FormData();
      formData.append("employee", JSON.stringify(updatedEmployee));

      try {
        await dispatch(
          updateEmployee({
            id: companyHeadData.employeeId,
            updatedData: formData,
          })
        );
        toast.success("Company Head updated successfully!");
        // Reload the company list in the background
        dispatch(fetchCompanies());
        // Do NOT close the modal or reset the form
      } catch (err) {
        toast.error("Failed to update Company Head");
        return;
      }
    }

    setCompanyData((prevData) => ({
      ...prevData,
      companyHeads: [
        {
          firstName: companyHeadData.firstName.trim(),
          middleName: companyHeadData.middleName.trim(),
          lastName: companyHeadData.lastName.trim(),
          email: companyHeadData.email,
          phone: companyHeadData.phone,
          ...(companyHeadData.employeeId && {
            employeeId: companyHeadData.employeeId,
          }),
        },
      ],
    }));
    setIsCompanyHeadModalOpen(false);
    setIsDropdownOpen(false);
    toast.success("Company Head added successfully!");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Filter companies based on search query
  const filteredCompanies = companies.filter((company) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      company.name?.toLowerCase().includes(searchLower) ||
      company.email?.toLowerCase().includes(searchLower) ||
      company.phone?.includes(searchQuery) ||
      company.gst?.toLowerCase().includes(searchLower) ||
      company.companyId?.toLowerCase().includes(searchLower) ||
      company.prefixForEmpID?.toLowerCase().includes(searchLower) ||
      (company.companyHeads &&
        company.companyHeads.some((head) =>
          [head.firstName, head.middleName, head.lastName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(searchLower)
        ))
    );
  });

  const debouncedCompanyHeadEmail = useDebounce(companyHeadData.email, 500);

  // Real-time email uniqueness check for Company Head
  useEffect(() => {
    const check = async () => {
      if (!debouncedCompanyHeadEmail) {
        setCompanyHeadValidationErrors((prev) => ({ ...prev, email: "" }));
        setIsCompanyHeadValid(true);
        return;
      }
      // Only check if email is valid format
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(debouncedCompanyHeadEmail)) {
        setCompanyHeadValidationErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
        setIsCompanyHeadValid(false);
        return;
      }
      // Call API to check existence
      const existence = await checkEmployeeExistence(debouncedCompanyHeadEmail, undefined);
      if (existence.email || existence.emailPersonal) {
        setCompanyHeadValidationErrors((prev) => ({ ...prev, email: "This email already exists." }));
        setIsCompanyHeadValid(false);
      } else {
        setCompanyHeadValidationErrors((prev) => {
          if (prev.email === "This email already exists.") {
            return { ...prev, email: "" };
          } else {
            // Run format/required validation if not uniqueness error
            const error = validateCompanyHeadField("email", debouncedCompanyHeadEmail);
            return { ...prev, email: error };
          }
        });
        setIsCompanyHeadValid(true);
      }
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCompanyHeadEmail]);

  const [showSelectHeadModal, setShowSelectHeadModal] = useState(false);
  const [companyEmployees, setCompanyEmployees] = useState([]);
  const [selectedNewHead, setSelectedNewHead] = useState(null);
  const [isFetchingEmployees, setIsFetchingEmployees] = useState(false);

  // Fetch employees for the company
  const fetchCompanyEmployees = async (companyId) => {
    setIsFetchingEmployees(true);
    try {
      const token = getItemFromSessionStorage("token");
      const response = await axios.get(
        `${API_BASE_URL}/hradmin/companies/${companyId}/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCompanyEmployees(response.data || []);
    } catch (err) {
      toast.error("Failed to fetch employees for this company");
      setCompanyEmployees([]);
    } finally {
      setIsFetchingEmployees(false);
    }
  };

  return (
    <div className="bg-white text-[#4a4a4a] min-h-screen">
      <SuperadminHeaders />
      <div className="p-5 pt-24">
        <div className="mt-6 p-4 rounded-lg bg-white">
          {/* Action Buttons and Search Bar */}
          <div className="mb-1">
            <div className="flex justify-between items-center">
              {/* Search Bar */}
              <div className="relative w-80">
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-6">
                <button
                  onClick={() => handleOpenCompanyModal()}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm"
                >
                  <UserPlus className="h-5 w-5" />
                  Add Company
                </button>
                <button
                  onClick={() => handleOpenCompanyModal(selectedCompany)}
                  disabled={!selectedCompany}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-semibold shadow-sm ${
                    selectedCompany
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Edit className="h-5 w-5" />
                  Edit Company
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            {loading ? (
              <div className="text-center py-8 text-gray-600">Loading...</div>
            ) : err ? (
              <div className="text-center text-red-500 py-8">{err}</div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Company ID
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Company Head
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Phone
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          GST
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Register Add.
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider border-b-2 border-gray-300 bg-gray-100"
                        >
                          Company Prefix
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredCompanies.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                <FaBuilding className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="text-center">
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                  {searchQuery
                                    ? `No companies found for "${searchQuery}"`
                                    : "No companies found"}
                                </h3>
                                <p className="text-sm text-gray-500 mb-6">
                                  {searchQuery
                                    ? "Try a different search or clear your search input."
                                    : "Get started by adding your first company to the system."}
                                </p>
                                {!searchQuery && (
                                  <button
                                    onClick={() => handleOpenCompanyModal()}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm mx-auto"
                                  >
                                    <UserPlus className="h-5 w-5" />
                                    Add Your First Company
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCompanies.map((company) => (
                          <tr
                            key={company._id}
                            className={`cursor-pointer transition-colors duration-200 ${
                              selectedCompany?.companyId === company.companyId
                                ? "bg-blue-100"
                                : "bg-gray-50 hover:bg-blue-50"
                            }`}
                            onClick={() => {
                              console.log(
                                "Clicking company:",
                                company.name,
                                "Company ID:",
                                company.companyId,
                                "Current selected:",
                                selectedCompany?.companyId
                              );
                              const isCurrentlySelected =
                                selectedCompany?.companyId ===
                                company.companyId;
                              const newSelection = isCurrentlySelected
                                ? null
                                : company;
                              console.log(
                                "Setting selection to:",
                                newSelection?.companyId
                              );
                              setSelectedCompany(newSelection);
                            }}
                            onDoubleClick={() =>
                              handleOpenCompanyModal(company)
                            }
                          >
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <div className="flex items-center space-x-2">
                                {selectedCompany?.companyId ===
                                  company.companyId && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                )}
                                <TruncatedText
                                  text={company.companyId || company._id || "—"}
                                  maxWidth="max-w-[200px]"
                                  className="font-mono"
                                  trimAfter={22}
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={company.name}
                                maxWidth="max-w-[150px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={
                                  company.companyHeads &&
                                  company.companyHeads.length > 0
                                    ? company.companyHeads
                                        .map((head, index) =>
                                          [
                                            head.firstName,
                                            head.middleName,
                                            head.lastName,
                                          ]
                                            .filter(Boolean)
                                            .join(" ")
                                        )
                                        .join(", ")
                                    : "No Company Head"
                                }
                                maxWidth="max-w-[120px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={company.email}
                                maxWidth="max-w-[180px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={company.phone}
                                maxWidth="max-w-[100px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={company.gst}
                                maxWidth="max-w-[140px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={company.regAdd}
                                maxWidth="max-w-[200px]"
                              />
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              <TruncatedText
                                text={company.prefixForEmpID}
                                maxWidth="max-w-[80px]"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => {
          setIsCompanyModalOpen(false);
          setSelectedCompany(null);
        }}
        disableBackdropClick={true}
      >
        <div className="relative w-full flex justify-center -mt-4">
          <h2 className="text-2xl font-thin tracking-wide">
            {isEditing ? "Update" : "Add"} Company
          </h2>
          <button
            onClick={() => {
              setIsCompanyModalOpen(false);
              setSelectedCompany(null);
            }}
            className="absolute right-0 text-gray-500 hover:text-gray-800 mt-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={companyData.name}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("name", companyData.name)}
              placeholder="Enter company name"
              maxLength="100"
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                "name",
                companyData.name,
                fieldTouched.name,
                validationErrors.name
              )}`}
            />
            {validationErrors.name && (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.name}
              </p>
            )}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Maximum 100 characters</span>
              <span>{companyData.name?.length || 0}/100</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="prefixForEmpID"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Company Prefix <span className="text-red-500">*</span>
            </label>
            <Input
              id="prefixForEmpID"
              name="prefixForEmpID"
              value={companyData.prefixForEmpID || ""}
              {...(isEditing
                ? {
                    readOnly: true,
                    tabIndex: -1,
                    style: {
                      backgroundColor: "#f3f4f6",
                      color: "#6b7280",
                      cursor: "not-allowed",
                    },
                  }
                : { onChange: handleInputChange })}
              placeholder="Enter company prefix"
              className={`bg-gray-100 text-[#4a4a4a] ${
                validationErrors.prefixForEmpID
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {isEditing && (
              <p className="text-yellow-600 text-xs mt-1 font-medium">
                Company prefix can&apos;t be edited.
              </p>
            )}
            {!isEditing && (
              <p className="text-yellow-600 text-xs mt-1 font-medium">
                Company prefix can&apos;t be edited after creation.
              </p>
            )}
            {validationErrors.prefixForEmpID && (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.prefixForEmpID}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Head <span className="text-red-500">*</span>
            </label>
            <div className="relative dropdown-container">
              <div
                className="flex items-center justify-between w-full p-3 bg-gray-100 text-[#4a4a4a] border border-gray-300 rounded-md cursor-pointer hover:bg-gray-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-gray-500" />
                  <span>
                    {companyData.companyHeads &&
                    companyData.companyHeads.length > 0
                      ? [
                          companyData.companyHeads[0].firstName,
                          companyData.companyHeads[0].middleName,
                          companyData.companyHeads[0].lastName,
                        ]
                          .filter(Boolean)
                          .join(" ")
                      : "Select Company Head"}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <div
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
                    onClick={handleOpenCompanyHeadModal}
                  >
                    <div className="flex items-center space-x-2">
                      <UserPlus size={16} className="text-blue-600" />
                      <span className="text-blue-600 font-medium">
                        {companyData.companyHeads &&
                        companyData.companyHeads.length > 0
                          ? "Edit Company Head"
                          : "Add Company Head"}
                      </span>
                    </div>
                  </div>
                  {companyData.companyHeads &&
                    companyData.companyHeads.length > 0 && (
                      <div
                        className="p-3 hover:bg-gray-100 cursor-pointer"
                        onClick={async () => {
                          if (!selectedCompany?.companyId) return;
                          await fetchCompanyEmployees(selectedCompany.companyId);
                          setShowSelectHeadModal(true);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <Trash size={16} className="text-red-600" />
                          <span className="text-red-600">
                            Remove Company Head
                          </span>
                        </div>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose Company Color <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {predefinedColors.map((color) => (
                <div
                  key={color}
                  className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                    companyData.colorCode === color
                      ? "border-black"
                      : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                ></div>
              ))}
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                value={companyData.email}
                onChange={handleInputChange}
                onBlur={() => handleFieldBlur("email", companyData.email)}
                placeholder="Enter email address"
                className={`bg-gray-100 text-[#4a4a4a] ${
                  validationErrors.email
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                }`}
              />
              {validationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {validationErrors.email}
                </p>
              )}
              {getEmailSuggestion(companyData.email) &&
                !companyData.email.includes("@") && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm text-gray-600">
                    <span className="text-gray-400">Suggestion: </span>
                    <span
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => {
                        setCompanyData((prev) => ({
                          ...prev,
                          email: getEmailSuggestion(companyData.email),
                        }));
                        handleFieldBlur(
                          "email",
                          getEmailSuggestion(companyData.email)
                        );
                      }}
                    >
                      {getEmailSuggestion(companyData.email)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      (Click to use)
                    </span>
                  </div>
                )}
            </div>
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              value={companyData.phone}
              onChange={handleCompanyPhoneChange}
              placeholder="Enter phone number"
              maxLength="10"
              className={`bg-gray-100 text-[#4a4a4a] ${
                validationErrors.phone
                  ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              }`}
            />
            {validationErrors.phone && (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.phone}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Enter 10-digit mobile number without country code
            </p>
          </div>

          <div>
            <label
              htmlFor="gst"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              GST Number
            </label>
            <Input
              id="gst"
              name="gst"
              ref={gstInputRef}
              value={companyData.gst}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("gst", companyData.gst)}
              placeholder="Enter GST Number"
              maxLength={15}
              // style={{ textTransform: "uppercase" }}
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                "gst",
                companyData.gst,
                fieldTouched.gst,
                validationErrors.gst
              )}`}
            />
            {validationErrors.gst && (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.gst}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="regAdd"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Registered Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="regAdd"
              name="regAdd"
              value={companyData.regAdd}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("regAdd", companyData.regAdd)}
              placeholder="Enter registered address"
              maxLength="200"
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                "regAdd",
                companyData.regAdd,
                fieldTouched.regAdd,
                validationErrors.regAdd
              )}`}
            />
            {validationErrors.regAdd && (
              <p className="text-red-600 text-xs mt-1">
                {validationErrors.regAdd}
              </p>
            )}
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Maximum 200 characters</span>
              <span>{companyData.regAdd?.length || 0}/200</span>
            </div>
          </div>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              handleSaveCompany();
              setSelectedCompany(null);
            }}
            disabled={
              !isFormValid() ||
              validationErrors.email ||
              validationErrors.phone ||
              validationErrors.prefixForEmpID
            }
            className={`mt-1 ${
              isFormValid() &&
              !validationErrors.email &&
              !validationErrors.phone &&
              !validationErrors.prefixForEmpID
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isEditing ? "Update" : "Add"} Company
          </Button>
        </div>
      </Modal>

      {/* Company Head Modal */}
      <Modal
        isOpen={isCompanyHeadModalOpen}
        onClose={() => {
          setIsCompanyHeadModalOpen(false);
          setCompanyHeadError("");
          setCompanyHeadData({
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phone: "",
            employeeId: "",
          });
          // Reset validation states for company head fields
          setCompanyHeadFieldTouched({
            firstName: false,
            middleName: false,
            lastName: false,
            email: false,
            phone: false,
          });
          setCompanyHeadValidationErrors({
            firstName: "",
            middleName: "",
            lastName: "",
            email: "",
            phone: "",
          });
          setIsCompanyHeadValid(true); // Reset validity state
        }}
        disableBackdropClick={true}
      >
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
          <div className="relative w-full flex justify-center -mt-4">
            <h2 className="text-2xl font-thin tracking-wide">
              {companyData.companyHeads && companyData.companyHeads.length > 0
                ? "Edit Company Head"
                : "Add Company Head"}
            </h2>
            <button
              onClick={() => {
                setIsCompanyHeadModalOpen(false);
                setCompanyHeadError("");
                setCompanyHeadData({
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                  employeeId: "",
                });
                // Reset validation states for company head fields
                setCompanyHeadFieldTouched({
                  firstName: false,
                  middleName: false,
                  lastName: false,
                  email: false,
                  phone: false,
                });
                setCompanyHeadValidationErrors({
                  firstName: "",
                  middleName: "",
                  lastName: "",
                  email: "",
                  phone: "",
                });
                setIsCompanyHeadValid(true); // Reset validity state
              }}
              className="absolute right-0 text-gray-500 hover:text-gray-800 mt-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="w-full space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="firstName"
                    value={companyHeadData.firstName}
                    onChange={handleCompanyHeadInputChange}
                    onBlur={() =>
                      handleCompanyHeadFieldBlur(
                        "firstName",
                        companyHeadData.firstName
                      )
                    }
                    placeholder="Enter first name"
                    maxLength="50"
                    className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                      "firstName",
                      companyHeadData.firstName,
                      companyHeadFieldTouched.firstName,
                      companyHeadValidationErrors.firstName
                    )}`}
                  />
                  {companyHeadValidationErrors.firstName && (
                    <p className="text-red-600 text-xs mt-1">
                      {companyHeadValidationErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Middle Name
                  </label>
                  <Input
                    name="middleName"
                    value={companyHeadData.middleName}
                    onChange={handleCompanyHeadInputChange}
                    onBlur={() =>
                      handleCompanyHeadFieldBlur(
                        "middleName",
                        companyHeadData.middleName
                      )
                    }
                    placeholder="Enter middle name (optional)"
                    className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="lastName"
                    value={companyHeadData.lastName}
                    onChange={handleCompanyHeadInputChange}
                    onBlur={() =>
                      handleCompanyHeadFieldBlur(
                        "lastName",
                        companyHeadData.lastName
                      )
                    }
                    placeholder="Enter last name"
                    maxLength="50"
                    className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                      "lastName",
                      companyHeadData.lastName,
                      companyHeadFieldTouched.lastName,
                      companyHeadValidationErrors.lastName
                    )}`}
                  />
                  {companyHeadValidationErrors.lastName && (
                    <p className="text-red-600 text-xs mt-1">
                      {companyHeadValidationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="headEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="headEmail"
                  name="email"
                  type="email"
                  value={companyHeadData.email}
                  onChange={handleCompanyHeadInputChange}
                  onBlur={() =>
                    handleCompanyHeadFieldBlur("email", companyHeadData.email)
                  }
                  placeholder="Enter email address"
                  onKeyDown={(e) => {
                    if (e.key === " ") e.preventDefault();
                  }}
                  className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                    "email",
                    companyHeadData.email,
                    companyHeadFieldTouched.email,
                    companyHeadValidationErrors.email
                  )}`}
                />
                {getEmailSuggestion(companyHeadData.email) &&
                  !companyHeadData.email.includes("@") && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm text-gray-600">
                      <span className="text-gray-400">Suggestion: </span>
                      <span
                        className="text-blue-600 cursor-pointer hover:text-blue-800"
                        onClick={() => {
                          setCompanyHeadData((prev) => ({
                            ...prev,
                            email: getEmailSuggestion(companyHeadData.email),
                          }));
                          handleCompanyHeadFieldBlur(
                            "email",
                            getEmailSuggestion(companyHeadData.email)
                          );
                        }}
                      >
                        {getEmailSuggestion(companyHeadData.email)}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">
                        (Click to use)
                      </span>
                    </div>
                  )}
              </div>
              {/* {companyHeadValidationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {companyHeadValidationErrors.email}
                </p>
              )} */}
              {companyHeadValidationErrors.email && (
                <p className="text-red-600 text-xs mt-1">
                  {companyHeadValidationErrors.email}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Email will be used as login ID
              </p>
            </div>

            <div>
              <label
                htmlFor="headPhone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone <span className="text-red-500">*</span>
              </label>
              <Input
                id="headPhone"
                name="phone"
                value={companyHeadData.phone}
                onChange={(e) => {
                  handleCompanyHeadInputChange(e);
                  if (e.target.value.length === 10) {
                    handleCompanyHeadFieldBlur("phone", e.target.value);
                  }
                }}
                onBlur={() => {
                  // Only check if not already checked at 10 digits
                  if (companyHeadData.phone.length !== 10) {
                    handleCompanyHeadFieldBlur("phone", companyHeadData.phone);
                  }
                }}
                placeholder="Enter phone number"
                maxLength="10"
                className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass(
                  "phone",
                  companyHeadData.phone,
                  companyHeadFieldTouched.phone,
                  companyHeadValidationErrors.phone
                )}`}
              />
              {companyHeadValidationErrors.phone && (
                <p className="text-red-600 text-xs mt-1">
                  {companyHeadValidationErrors.phone}
                </p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Phone number will be used as password
              </p>
            </div>
          </div>

          {companyHeadError && (
            <p className="text-red-600 mt-2">{companyHeadError}</p>
          )}

          <Button
            onClick={handleCompanyHeadSave}
            disabled={!isCompanyHeadFormValid() || !isCompanyHeadValid}
            className={`mt-6 ${
              isCompanyHeadFormValid() && isCompanyHeadValid
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {companyData.companyHeads && companyData.companyHeads.length > 0
              ? "Update Company Head"
              : "Add Company Head"}
          </Button>
        </div>
      </Modal>

      {/* Modal for selecting new company head */}
      <Modal
        isOpen={showSelectHeadModal}
        onClose={() => {
          setShowSelectHeadModal(false);
          setSelectedNewHead(null);
        }}
        disableBackdropClick={true}
      >
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
          <h2 className="text-xl font-semibold mb-4">Company must have a Company Head</h2>
          <p className="mb-4">Please select a new Company Head from the list of employees below.</p>
          {isFetchingEmployees ? (
            <div className="text-gray-600">Loading employees...</div>
          ) : companyEmployees.length === 0 ? (
            <div className="text-red-600">No employees found for this company.</div>
          ) : (
            <select
              className="w-full p-2 border rounded mb-4"
              value={selectedNewHead || ""}
              onChange={e => setSelectedNewHead(e.target.value)}
            >
              <option value="" disabled>Select an employee</option>
              {companyEmployees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>
                  {emp.firstName} {emp.middleName} {emp.lastName} ({emp.emailPersonal || emp.emailOfficial || emp.phone})
                </option>
              ))}
            </select>
          )}
          <Button
            onClick={() => {
              if (!selectedNewHead) return;
              // Set the selected employee as company head
              const emp = companyEmployees.find(e => e.employeeId === selectedNewHead);
              if (emp) {
                setCompanyData(prev => ({
                  ...prev,
                  companyHeads: [
                    {
                      firstName: emp.firstName,
                      middleName: emp.middleName,
                      lastName: emp.lastName,
                      email: emp.emailPersonal || emp.emailOfficial || "",
                      phone: emp.phone,
                      employeeId: emp.employeeId,
                    },
                  ],
                }));
                setShowSelectHeadModal(false);
                setSelectedNewHead(null);
                toast.success("New Company Head selected.");
              }
            }}
            disabled={!selectedNewHead}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
          >
            Set as Company Head
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminCompanies);

