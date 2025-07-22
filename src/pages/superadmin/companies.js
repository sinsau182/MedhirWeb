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
import { UserPlus, Edit, ChevronDown, User, Trash, Info, Check } from "lucide-react";
import { FaBuilding } from "react-icons/fa";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";

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
  const [companyHeadValidationErrors, setCompanyHeadValidationErrors] = useState({
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

  const validateGST = (gst) => {
    const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
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
        if (!value.trim()) {
          error = "GST number is required";
        } else if (!validateGST(value)) {
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
    
    switch (name) {
      case "firstName":
        if (!value.trim()) {
          error = "First name is required";
        } else if (value.trim().length < 2) {
          error = "First name must be at least 2 characters";
        }
        break;
      case "lastName":
        if (!value.trim()) {
          error = "Last name is required";
        } else if (value.trim().length < 2) {
          error = "Last name must be at least 2 characters";
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
    if (!input || input.includes('@')) return null;
    
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
        colorCode: "", // Initialize colorCode for new companies
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
    
    // Handle phone number input - only allow digits
    let processedValue = value;
    if (name === "phone") {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setCompanyData((prevData) => {
      const updatedData = { ...prevData, [name]: processedValue };

      // Auto-generate prefix if the company name is being updated
      if (name === "name" && processedValue.length >= 3) {
        updatedData.prefixForEmpID = processedValue.substring(0, 3).toUpperCase();
      }
      // Ensure prefix is always uppercase
      if (name === "prefixForEmpID") {
        const cleanedPrefix = processedValue
          .toUpperCase()
          .replace(/[^A-Z]/g, "")
          .slice(0, 3);
        updatedData.prefixForEmpID = cleanedPrefix;
      }

      if (name === "gst") {
        updatedData.gst = processedValue.toUpperCase();
      }

      return updatedData;
    });

    // Real-time validation
    const error = validateField(name, processedValue);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleFieldBlur = (name, value) => {
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleCompanyHeadInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle phone number input - only allow digits
    let processedValue = value;
    if (name === "phone") {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setCompanyHeadData((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));

    // Real-time validation for company head fields
    const error = validateCompanyHeadField(name, processedValue);
    setCompanyHeadValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleCompanyHeadFieldBlur = (name, value) => {
    setCompanyHeadFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateCompanyHeadField(name, value);
    setCompanyHeadValidationErrors(prev => ({
      ...prev,
      [name]: error
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
    Object.keys(companyData).forEach(key => {
      if (['name', 'email', 'phone', 'gst', 'regAdd'].includes(key)) {
        errors[key] = validateField(key, companyData[key]);
    }
    });

    setValidationErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error);
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
          prefixForEmpID: companyData.prefixForEmpID,
          colorCode: companyData.colorCode,
          companyHeadIds:
            companyData.companyHeads && companyData.companyHeads.length > 0
              ? companyData.companyHeads
                  .map((head) => head.employeeId)
                  .filter(Boolean)
              : [],
        };

        // Dispatch update action with Redux
        await dispatch(
          updateCompany({
            id: selectedCompany.companyId, // Handle both id formats
            updatedData: updateRequestBody,
          })
        );
        toast.success("Company updated successfully!");
      } else {
        const result = await dispatch(createCompany(requestBody));

        if (createCompany.fulfilled.match(result)) {
          toast.success("Company created successfully!");
        } else {
          toast.error(result.payload || "Failed to create company.");
        }
      }

      // Refetch updated list
      dispatch(fetchCompanies());

      // Close modal and reset selection
      setIsCompanyModalOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      toast.error("Failed to save company data.");
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
    const requiredFields = ['name', 'email', 'phone', 'gst', 'regAdd'];
    
    // Check if all required fields have values
    const hasAllValues = requiredFields.every(field => 
      companyData[field] && companyData[field].trim() !== ''
    );
    
    // Check if all required fields are valid (no validation errors)
    const hasNoErrors = requiredFields.every(field => 
      !validationErrors[field] || validationErrors[field] === ''
    );
    
    // Color is always selected (has default)
    const hasColorSelected = true;
    
    return hasAllValues && hasNoErrors && hasColorSelected;
  };

  // Function to check if the company head form is valid
  const isCompanyHeadFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    
    // Check if all required fields have values
    const hasAllValues = requiredFields.every(field => 
      companyHeadData[field] && companyHeadData[field].trim() !== ''
    );
    
    // Check if all required fields are valid (no validation errors)
    const hasNoErrors = requiredFields.every(field => 
      !companyHeadValidationErrors[field] || companyHeadValidationErrors[field] === ''
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

  const handleCompanyHeadSave = () => {
    // Mark all company head fields as touched
    setCompanyHeadFieldTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
    });

    // Validate all company head fields
    const errors = {};
    Object.keys(companyHeadData).forEach(key => {
      if (['firstName', 'lastName', 'email', 'phone'].includes(key)) {
        errors[key] = validateCompanyHeadField(key, companyHeadData[key]);
      }
    });

    setCompanyHeadValidationErrors(errors);

    // Check if there are any validation errors
    const hasErrors = Object.values(errors).some(error => error);
    if (hasErrors) {
      toast.error("Please fix the validation errors before saving Company Head");
      return;
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
            // Include employeeId if it exists (for editing)
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
      (company.companyHeads && company.companyHeads.some(head => 
        [head.firstName, head.middleName, head.lastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchLower)
      ))
    );
  });

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
                    {filteredCompanies.map((company) => (
                      <tr
                        key={company._id}
                        className={`cursor-pointer transition-colors duration-200 ${
                          selectedCompany?.companyId === company.companyId
                            ? "bg-blue-100"
                            : "bg-gray-50 hover:bg-blue-50"
                        }`}
                        onClick={() => {
                          console.log("Clicking company:", company.name, "Company ID:", company.companyId, "Current selected:", selectedCompany?.companyId);
                          const isCurrentlySelected = selectedCompany?.companyId === company.companyId;
                          const newSelection = isCurrentlySelected ? null : company;
                          console.log("Setting selection to:", newSelection?.companyId);
                          setSelectedCompany(newSelection);
                        }}
                        onDoubleClick={() => handleOpenCompanyModal(company)}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            {selectedCompany?.companyId === company.companyId && (
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
                              company.companyHeads && company.companyHeads.length > 0
                                ? company.companyHeads.map((head, index) => 
                                    [head.firstName, head.middleName, head.lastName].filter(Boolean).join(" ")
                                  ).join(", ")
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
                    ))}
                    {filteredCompanies.length === 0 && (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-12 text-center"
                        >
                          <div className="flex flex-col items-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <FaBuilding className="w-8 h-8 text-gray-400" />
                            </div>
                            <div className="text-center">
                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No companies found
                              </h3>
                              <p className="text-sm text-gray-500 mb-6">
                                Get started by adding your first company to the system.
                              </p>
                              <button
                                onClick={() => handleOpenCompanyModal()}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm mx-auto"
                              >
                                <UserPlus className="h-5 w-5" />
                                Add Your First Company
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
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
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("name", companyData.name, fieldTouched.name, validationErrors.name)}`}
            />
            {validationErrors.name && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.name}</p>
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
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("prefixForEmpID", companyData.prefixForEmpID)}
              placeholder="Enter company prefix"
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("prefixForEmpID", companyData.prefixForEmpID, fieldTouched.prefixForEmpID, validationErrors.prefixForEmpID)}`}
            />
            {validationErrors.prefixForEmpID && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.prefixForEmpID}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Head
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
                        onClick={() => {
                          setCompanyData((prevData) => ({
                            ...prevData,
                            companyHeads: [],
                          }));
                          setIsDropdownOpen(false);
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
              Choose Company Color
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
                className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("email", companyData.email, fieldTouched.email, validationErrors.email)}`}
              />
              {getEmailSuggestion(companyData.email) && !companyData.email.includes('@') && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm text-gray-600">
                  <span className="text-gray-400">Suggestion: </span>
                  <span 
                    className="text-blue-600 cursor-pointer hover:text-blue-800"
                    onClick={() => {
                      setCompanyData(prev => ({
                        ...prev,
                        email: getEmailSuggestion(companyData.email)
                      }));
                      handleFieldBlur("email", getEmailSuggestion(companyData.email));
                    }}
                  >
                    {getEmailSuggestion(companyData.email)}
                  </span>
                  <span className="text-xs text-gray-500 ml-2">(Click to use)</span>
                </div>
              )}
            </div>
            {validationErrors.email && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.email}</p>
            )}
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
              onChange={handleInputChange}
                onBlur={() => handleFieldBlur("phone", companyData.phone)}
              placeholder="Enter phone number"
                maxLength="10"
                className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("phone", companyData.phone, fieldTouched.phone, validationErrors.phone)}`}
              />
              {validationErrors.phone && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.phone}</p>
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
              GST Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="gst"
              name="gst"
              value={companyData.gst}
              onChange={handleInputChange}
              onBlur={() => handleFieldBlur("gst", companyData.gst)}
              placeholder="Enter GST Number"
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("gst", companyData.gst, fieldTouched.gst, validationErrors.gst)}`}
            />
            {validationErrors.gst && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.gst}</p>
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
              className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("regAdd", companyData.regAdd, fieldTouched.regAdd, validationErrors.regAdd)}`}
            />
            {validationErrors.regAdd && (
              <p className="text-red-600 text-xs mt-1">{validationErrors.regAdd}</p>
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
            disabled={!isFormValid()}
            className={`mt-1 ${
              isFormValid() 
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
        }}
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
                    onBlur={() => handleCompanyHeadFieldBlur("firstName", companyHeadData.firstName)}
                    placeholder="Enter first name"
                    maxLength="50"
                    className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("firstName", companyHeadData.firstName, companyHeadFieldTouched.firstName, companyHeadValidationErrors.firstName)}`}
                  />
                  {companyHeadValidationErrors.firstName && (
                    <p className="text-red-600 text-xs mt-1">{companyHeadValidationErrors.firstName}</p>
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
                    onBlur={() => handleCompanyHeadFieldBlur("middleName", companyHeadData.middleName)}
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
                    onBlur={() => handleCompanyHeadFieldBlur("lastName", companyHeadData.lastName)}
                    placeholder="Enter last name"
                    maxLength="50"
                    className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("lastName", companyHeadData.lastName, companyHeadFieldTouched.lastName, companyHeadValidationErrors.lastName)}`}
                  />
                  {companyHeadValidationErrors.lastName && (
                    <p className="text-red-600 text-xs mt-1">{companyHeadValidationErrors.lastName}</p>
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
                  onBlur={() => handleCompanyHeadFieldBlur("email", companyHeadData.email)}
                placeholder="Enter email address"
                  className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("email", companyHeadData.email, companyHeadFieldTouched.email, companyHeadValidationErrors.email)}`}
                />
                {getEmailSuggestion(companyHeadData.email) && !companyHeadData.email.includes('@') && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50 border border-gray-200 rounded-md p-2 text-sm text-gray-600">
                    <span className="text-gray-400">Suggestion: </span>
                    <span 
                      className="text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => {
                        setCompanyHeadData(prev => ({
                          ...prev,
                          email: getEmailSuggestion(companyHeadData.email)
                        }));
                        handleCompanyHeadFieldBlur("email", getEmailSuggestion(companyHeadData.email));
                      }}
                    >
                      {getEmailSuggestion(companyHeadData.email)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">(Click to use)</span>
                  </div>
                )}
              </div>
              {companyHeadValidationErrors.email && (
                <p className="text-red-600 text-xs mt-1">{companyHeadValidationErrors.email}</p>
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
                onChange={handleCompanyHeadInputChange}
                  onBlur={() => handleCompanyHeadFieldBlur("phone", companyHeadData.phone)}
                placeholder="Enter phone number"
                  maxLength="10"
                  className={`bg-gray-100 text-[#4a4a4a] ${getBorderColorClass("phone", companyHeadData.phone, companyHeadFieldTouched.phone, companyHeadValidationErrors.phone)}`}
              />
              {companyHeadValidationErrors.phone && (
                <p className="text-red-600 text-xs mt-1">{companyHeadValidationErrors.phone}</p>
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
            disabled={!isCompanyHeadFormValid()}
            className={`mt-6 ${
              isCompanyHeadFormValid() 
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
    </div>
  );
}

export default withAuth(SuperadminCompanies);
