import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import withAuth from "@/components/withAuth";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
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
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
import { X } from "lucide-react";
import getConfig from "next/config";
import { clearSession } from "@/utils/sessionManager";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";

function EmployeeProfilePage() {
  const router = useRouter();
  const { id } = router.query; // Get ID from URL query parameter

  const { publicRuntimeConfig } = getConfig();

  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [employeeById, setEmployeeById] = useState(null); // Holds the fetched employee data
  const [managerName, setManagerName] = useState(""); // Add state for manager name
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPageInEditMode, setIsPageInEditMode] = useState(false);
  const [isEditable, setIsEditable] = useState(true); // Controls if editing is allowed based on updateStatus
  const [showPendingChangesModal, setShowPendingChangesModal] = useState(false);
  const [pendingChanges, setPendingChanges] = useState(null);
  const [passbookPreview, setPassbookPreview] = useState({
    open: false,
    url: null,
    file: null,
  });
  const [pdfControls, setPdfControls] = useState({ rotate: 0, zoom: 1 });
  const [idProofPreview, setIdProofPreview] = useState({
    open: false,
    url: null,
    file: null,
    title: "",
  });
  const [uploadedIdProofPreview, setUploadedIdProofPreview] = useState({
    open: false,
    url: null,
    file: null,
    title: "",
  });

  // Main state for form data, used during editing
  const [formData, setFormData] = useState({
    employee: {
      fatherName: "",
      gender: "",
      phone1: "",
      phone2: "",
      email: { personal: "" },
      currentAddress: "",
      permanentAddress: "",
      profileImage: null, // Stores File object or null/URL string
    },
    idProofs: {
      aadharNo: "",
      panNo: "",
      passport: "",
      drivingLicense: "",
      voterId: "",
      // Potential state for file objects if needed, e.g., aadharFile: null
    },
    bank: {
      accountNumber: "",
      accountHolderName: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      upiId: "",
      upiContactName: "",
      passbookDoc: null, // Stores File object or null/URL string
    },
    // Add statutory, salary etc. if they become editable
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [personalValidationErrors, setPersonalValidationErrors] = useState({});
  const [personalFieldTouched, setPersonalFieldTouched] = useState({});
  const [emailSuggestions, setEmailSuggestions] = useState([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [idProofValidationErrors, setIdProofValidationErrors] = useState({});
  const [idProofFieldTouched, setIdProofFieldTouched] = useState({});

  // Validation functions
  const validateAccountNumber = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[0-9]+$/.test(value)) return "Only numbers allowed";
    if (value.length < 9 || value.length > 18)
      return "Account number must be 9-18 digits";
    return "";
  };

  const validateAccountHolderName = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Za-z ]+$/.test(value)) return "Only alphabets and spaces allowed";
    if (value.trim().length < 2) return "Must be at least 2 characters";
    if (value.trim().length > 50) return "Maximum 50 characters allowed";
    return "";
  };

  const validateIFSC = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Z]{4}0[0-9]{6}$/.test(value.toUpperCase()))
      return "Invalid IFSC format (e.g., SBIN0001234)";
    return "";
  };

  const validateBankName = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Za-z ]+$/.test(value)) return "Only alphabets and spaces allowed";
    if (value.trim().length < 2) return "Must be at least 2 characters";
    if (value.trim().length > 50) return "Maximum 50 characters allowed";
    return "";
  };

  const validateBranchName = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Za-z0-9 ]+$/.test(value))
      return "Only alphabets, numbers and spaces allowed";
    if (value.trim().length < 2) return "Must be at least 2 characters";
    if (value.trim().length > 50) return "Maximum 50 characters allowed";
    return "";
  };

  const validateUPI = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(value))
      return "Invalid UPI ID format (e.g., user@upi)";
    if (value.length > 50) return "Maximum 50 characters allowed";
    return "";
  };

  const validateUPIContactName = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Za-z ]+$/.test(value)) return "Only alphabets and spaces allowed";
    if (value.trim().length < 2) return "Must be at least 2 characters";
    if (value.trim().length > 30) return "Maximum 30 characters allowed";
    return "";
  };

  // Input filtering functions
  const filterAccountNumber = (value) => {
    return value.replace(/[^0-9]/g, "").slice(0, 18);
  };

  const filterAccountHolderName = (value) => {
    return value.replace(/[^A-Za-z ]/g, "").slice(0, 50);
  };

  const filterIFSC = (value) => {
    return value
      .replace(/[^A-Za-z0-9]/g, "")
      .slice(0, 11)
      .toUpperCase();
  };

  const filterBankName = (value) => {
    return value.replace(/[^A-Za-z ]/g, "").slice(0, 50);
  };

  const filterBranchName = (value) => {
    return value.replace(/[^A-Za-z0-9 ]/g, "").slice(0, 50);
  };

  const filterUPI = (value) => {
    return value.replace(/[^a-zA-Z0-9._@-]/g, "").slice(0, 50);
  };

  const filterUPIContactName = (value) => {
    return value.replace(/[^A-Za-z ]/g, "").slice(0, 30);
  };

  // Validate all bank fields
  const validateBankDetails = (data) => {
    return {
      accountNumber: validateAccountNumber(data.accountNumber),
      accountHolderName: validateAccountHolderName(data.accountHolderName),
      ifscCode: validateIFSC(data.ifscCode),
      bankName: validateBankName(data.bankName),
      branchName: validateBranchName(data.branchName),
      upiId: validateUPI(data.upiId),
      upiContactName: validateUPIContactName(data.upiContactName),
    };
  };

  // On blur handler for bank fields
  const handleBankFieldBlur = (field) => {
    setFieldTouched((prev) => ({ ...prev, [field]: true }));
    const errors = validateBankDetails(formData.bank);

    // Add core bank field validation
    const coreBankFields = [
      "accountNumber",
      "accountHolderName",
      "ifscCode",
      "bankName",
      "branchName",
    ];
    const hasAnyCoreBankField = coreBankFields.some((fieldKey) => {
      const currentValue = formData.bank[fieldKey];
      const originalValue = employeeById?.bankDetails?.[fieldKey];
      return (
        currentValue &&
        currentValue.trim() !== "" &&
        currentValue !== originalValue
      );
    });

    if (hasAnyCoreBankField) {
      coreBankFields.forEach((fieldKey) => {
        const currentValue = formData.bank[fieldKey];
        if (!currentValue || currentValue.trim() === "") {
          const fieldLabels = {
            accountNumber: "Account Number",
            accountHolderName: "Account Holder Name",
            ifscCode: "IFSC Code",
            bankName: "Bank Name",
            branchName: "Branch Name",
          };
          errors[
            fieldKey
          ] = `${fieldLabels[fieldKey]} is required when filling bank details.`;
        }
      });

      // Mark core bank fields as touched so errors are displayed
      const touchedFields = {};
      coreBankFields.forEach((fieldKey) => {
        touchedFields[fieldKey] = true;
      });
      setFieldTouched((prev) => ({ ...prev, ...touchedFields }));
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
  };

  // On change handler for bank fields to provide real-time validation
  const handleBankFieldChange = (field, value) => {
    // Update the form data first
    handleInputChange("bank", field, value);

    // Then validate if this is a core bank field
    const coreBankFields = [
      "accountNumber",
      "accountHolderName",
      "ifscCode",
      "bankName",
      "branchName",
    ];
    if (coreBankFields.includes(field)) {
      const hasAnyCoreBankField = coreBankFields.some((fieldKey) => {
        const currentValue =
          fieldKey === field ? value : formData.bank[fieldKey];
        const originalValue = employeeById?.bankDetails?.[fieldKey];
        return (
          currentValue &&
          currentValue.trim() !== "" &&
          currentValue !== originalValue
        );
      });

      if (hasAnyCoreBankField) {
        const errors = validateBankDetails({
          ...formData.bank,
          [field]: value,
        });
        coreBankFields.forEach((fieldKey) => {
          const currentValue =
            fieldKey === field ? value : formData.bank[fieldKey];
          if (!currentValue || currentValue.trim() === "") {
            const fieldLabels = {
              accountNumber: "Account Number",
              accountHolderName: "Account Holder Name",
              ifscCode: "IFSC Code",
              bankName: "Bank Name",
              branchName: "Branch Name",
            };
            errors[
              fieldKey
            ] = `${fieldLabels[fieldKey]} is required when filling bank details.`;
          }
        });
        setValidationErrors((prev) => ({ ...prev, ...errors }));

        // Mark core bank fields as touched so errors are displayed
        const touchedFields = {};
        coreBankFields.forEach((fieldKey) => {
          touchedFields[fieldKey] = true;
        });
        setFieldTouched((prev) => ({ ...prev, ...touchedFields }));
      } else {
        // If no core fields are filled, clear the validation errors for core fields
        const errors = validateBankDetails({
          ...formData.bank,
          [field]: value,
        });
        coreBankFields.forEach((fieldKey) => {
          delete errors[fieldKey];
        });
        setValidationErrors((prev) => ({ ...prev, ...errors }));
      }
    }
  };

  // Helper functions for file handling
  const isPDF = (file) => {
    if (file instanceof File) {
      return file.type === "application/pdf";
    }
    if (typeof file === "string") {
      return (
        file.toLowerCase().endsWith(".pdf") || file.includes("application/pdf")
      );
    }
    return false;
  };

  const validateFileUpload = (file) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const maxSize = 1 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return "Only PDF, JPG, JPEG, and PNG files are allowed.";
    }

    if (file.size > maxSize) {
      return "File size must be less than 1MB.";
    }

    return null; // No error
  };

  const handlePassbookUpload = (file) => {
    const error = validateFileUpload(file);
    if (error) {
      toast.error(error);
      return false;
    }

    handleInputChange("bank", "passbookDoc", file);
    toast.success("Passbook document uploaded successfully!");
    return true;
  };

  const openPassbookPreview = () => {
    const currentPassbook =
      formData.bank.passbookDoc instanceof File
        ? formData.bank.passbookDoc
        : employeeById?.bankDetails?.passbookImgUrl;

    if (!currentPassbook) {
      toast.error("No passbook document available to preview.");
      return;
    }

    const previewUrl =
      currentPassbook instanceof File
        ? URL.createObjectURL(currentPassbook)
        : currentPassbook;

    // Get the account number
    const accountNumber =
      formData.bank.accountNumber || employeeById?.bankDetails?.accountNumber;
    const title = accountNumber
      ? `Passbook Document - ${accountNumber}`
      : "Passbook Document";

    setPassbookPreview({
      open: true,
      url: previewUrl,
      file: currentPassbook instanceof File ? currentPassbook : null,
    });
    setPdfControls({ rotate: 0, zoom: 1 });
  };

  const openIdProofPreview = (documentType, imgUrlKey) => {
    const currentDocument =
      formData.idProofs[`${documentType}Image`] instanceof File
        ? formData.idProofs[`${documentType}Image`]
        : employeeById?.idProofs?.[imgUrlKey];

    if (!currentDocument) {
      toast.error(`No ${documentType} document available to preview.`);
      return;
    }

    const previewUrl =
      currentDocument instanceof File
        ? URL.createObjectURL(currentDocument)
        : currentDocument;

    const documentTitles = {
      aadhar: "Aadhar Card",
      pan: "PAN Card",
      passport: "Passport",
      drivingLicense: "Driving License",
      voterId: "Voter ID",
    };

    // Get the document number
    const numberField =
      documentType === "aadhar"
        ? "aadharNo"
        : documentType === "pan"
        ? "panNo"
        : documentType === "passport"
        ? "passport"
        : documentType === "drivingLicense"
        ? "drivingLicense"
        : documentType === "voterId"
        ? "voterId"
        : "";

    const documentNumber =
      formData.idProofs[numberField] || employeeById?.idProofs?.[numberField];
    const title = documentTitles[documentType] || documentType;
    const fullTitle = documentNumber ? `${title} - ${documentNumber}` : title;

    setIdProofPreview({
      open: true,
      url: previewUrl,
      file: currentDocument instanceof File ? currentDocument : null,
      title: fullTitle,
    });
    setPdfControls({ rotate: 0, zoom: 1 });
  };

  const openUploadedIdProofPreview = (documentType, file) => {
    if (!file || !(file instanceof File)) {
      toast.error(`No ${documentType} document available to preview.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    const documentTitles = {
      aadhar: "Aadhar Card",
      pan: "PAN Card",
      passport: "Passport",
      drivingLicense: "Driving License",
      voterId: "Voter ID",
    };

    // Get the document number
    const numberField =
      documentType === "aadhar"
        ? "aadharNo"
        : documentType === "pan"
        ? "panNo"
        : documentType === "passport"
        ? "passport"
        : documentType === "drivingLicense"
        ? "drivingLicense"
        : documentType === "voterId"
        ? "voterId"
        : "";

    const documentNumber = formData.idProofs[numberField];
    const title = documentTitles[documentType] || documentType;
    const fullTitle = documentNumber ? `${title} - ${documentNumber}` : title;

    setUploadedIdProofPreview({
      open: true,
      url: previewUrl,
      file: file,
      title: fullTitle,
    });
    setPdfControls({ rotate: 0, zoom: 1 });
  };

  const openUploadedPassbookPreview = (file) => {
    if (!file || !(file instanceof File)) {
      toast.error("No passbook document available to preview.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    // Get the account number
    const accountNumber =
      formData.bank.accountNumber || employeeById?.bankDetails?.accountNumber;
    const title = accountNumber
      ? `Passbook Document - ${accountNumber}`
      : "Passbook Document";

    setPassbookPreview({
      open: true,
      url: previewUrl,
      file: file,
    });
    setPdfControls({ rotate: 0, zoom: 1 });
  };

  const handleIdProofUpload = (documentType, file) => {
    const error = validateFileUpload(file);
    if (error) {
      toast.error(error);
      return false;
    }

    handleInputChange("idProofs", `${documentType}Image`, file);

    // Trigger validation for the corresponding number field
    const numberField =
      documentType === "aadhar"
        ? "aadharNo"
        : documentType === "pan"
        ? "panNo"
        : documentType === "passport"
        ? "passport"
        : documentType === "drivingLicense"
        ? "drivingLicense"
        : documentType === "voterId"
        ? "voterId"
        : "";

    if (numberField) {
      const conditionalError = validateIdProofConditional(numberField);
      if (conditionalError) {
        setIdProofValidationErrors((prev) => ({
          ...prev,
          [numberField]: conditionalError,
        }));
        setIdProofFieldTouched((prev) => ({ ...prev, [numberField]: true }));
      }
    }

    toast.success(
      `${
        documentType.charAt(0).toUpperCase() + documentType.slice(1)
      } document uploaded successfully!`
    );
    return true;
  };

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // --- Data Fetching ---
  const fetchByEmployeeId = useCallback(async () => {
    const employeeIdToFetch = sessionStorage.getItem("employeeId");
    const token = getItemFromSessionStorage("token");
    setLoading(true);
    try {
      const response = await fetch(
        `${publicRuntimeConfig.apiURL}/employee/id/${employeeIdToFetch}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEmployeeById(data);

      // Fetch manager name if reporting manager exists
      if (data.reportingManager) {
        try {
          const token = getItemFromSessionStorage("token");
          const managerResponse = await fetch(
            `${publicRuntimeConfig.apiURL}/employee/id/${data.reportingManager}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (managerResponse.ok) {
            const managerData = await managerResponse.json();
            setManagerName(managerData.name);
          }
        } catch (error) {
          setManagerName("-");
        }
      } else {
        setManagerName("-");
      }

      // Check update status to enable/disable editing
      if (data.updateStatus === "Pending") {
        setIsEditable(false);
        toast.info("An update request is pending. Editing is disabled.");
      } else {
        setIsEditable(true);
      }
    } catch (error) {
      toast.error(`Failed to fetch employee data: ${error.message}`);
      setEmployeeById(null); // Clear data on error
      setIsEditable(false); // Disable editing on fetch error
    } finally {
      setLoading(false);
    }
  }, [publicRuntimeConfig.apiURL]); // Add dependencies that the function uses

  const fetchPendingChanges = () => {
    if (!employeeById?.pendingUpdateRequest) {
      toast.error("No pending changes found");
      return;
    }

    const changes = {
      personalInfo: [],
      bankDetails: [],
      identityDocuments: [],
      documents: [],
    };

    // Compare personal information
    if (
      employeeById.pendingUpdateRequest.emailPersonal &&
      employeeById.pendingUpdateRequest.emailPersonal !==
        employeeById.emailPersonal
    ) {
      changes.personalInfo.push({
        field: "Personal Email",
        oldValue: employeeById.emailPersonal,
        newValue: employeeById.pendingUpdateRequest.emailPersonal,
      });
    }
    if (
      employeeById.pendingUpdateRequest.phone &&
      employeeById.pendingUpdateRequest.phone !== employeeById.phone
    ) {
      changes.personalInfo.push({
        field: "Phone",
        oldValue: employeeById.phone,
        newValue: employeeById.pendingUpdateRequest.phone,
      });
    }
    if (
      employeeById.pendingUpdateRequest.alternatePhone &&
      employeeById.pendingUpdateRequest.alternatePhone !==
        employeeById.alternatePhone
    ) {
      changes.personalInfo.push({
        field: "Alternate Phone",
        oldValue: employeeById.alternatePhone,
        newValue: employeeById.pendingUpdateRequest.alternatePhone,
      });
    }
    if (
      employeeById.pendingUpdateRequest.currentAddress &&
      employeeById.pendingUpdateRequest.currentAddress !==
        employeeById.currentAddress
    ) {
      changes.personalInfo.push({
        field: "Current Address",
        oldValue: employeeById.currentAddress,
        newValue: employeeById.pendingUpdateRequest.currentAddress,
      });
    }
    if (
      employeeById.pendingUpdateRequest.permanentAddress &&
      employeeById.pendingUpdateRequest.permanentAddress !==
        employeeById.permanentAddress
    ) {
      changes.personalInfo.push({
        field: "Permanent Address",
        oldValue: employeeById.permanentAddress,
        newValue: employeeById.pendingUpdateRequest.permanentAddress,
      });
    }

    // Compare bank details
    if (
      employeeById.pendingUpdateRequest.accountNumber &&
      employeeById.pendingUpdateRequest.accountNumber !==
        employeeById.bankDetails?.accountNumber
    ) {
      changes.bankDetails.push({
        field: "Account Number",
        oldValue: employeeById.bankDetails?.accountNumber,
        newValue: employeeById.pendingUpdateRequest.accountNumber,
      });
    }
    if (
      employeeById.pendingUpdateRequest.bankName &&
      employeeById.pendingUpdateRequest.bankName !==
        employeeById.bankDetails?.bankName
    ) {
      changes.bankDetails.push({
        field: "Bank Name",
        oldValue: employeeById.bankDetails?.bankName,
        newValue: employeeById.pendingUpdateRequest.bankName,
      });
    }
    if (
      employeeById.pendingUpdateRequest.branchName &&
      employeeById.pendingUpdateRequest.branchName !==
        employeeById.bankDetails?.branchName
    ) {
      changes.bankDetails.push({
        field: "Branch Name",
        oldValue: employeeById.bankDetails?.branchName,
        newValue: employeeById.pendingUpdateRequest.branchName,
      });
    }
    if (
      employeeById.pendingUpdateRequest.ifscCode &&
      employeeById.pendingUpdateRequest.ifscCode !==
        employeeById.bankDetails?.ifscCode
    ) {
      changes.bankDetails.push({
        field: "IFSC Code",
        oldValue: employeeById.bankDetails?.ifscCode,
        newValue: employeeById.pendingUpdateRequest.ifscCode,
      });
    }
    if (
      employeeById.pendingUpdateRequest.upiPhoneNumber &&
      employeeById.pendingUpdateRequest.upiPhoneNumber !==
        employeeById.bankDetails?.upiPhoneNumber
    ) {
      changes.bankDetails.push({
        field: "UPI Phone",
        oldValue: employeeById.bankDetails?.upiPhoneNumber,
        newValue: employeeById.pendingUpdateRequest.upiPhoneNumber,
      });
    }

    // Compare identity document numbers
    if (
      employeeById.pendingUpdateRequest.aadharNo &&
      employeeById.pendingUpdateRequest.aadharNo !==
        employeeById.idProofs?.aadharNo
    ) {
      changes.identityDocuments.push({
        field: "Aadhar Number",
        oldValue: employeeById.idProofs?.aadharNo,
        newValue: employeeById.pendingUpdateRequest.aadharNo,
      });
    }
    if (
      employeeById.pendingUpdateRequest.panNo &&
      employeeById.pendingUpdateRequest.panNo !== employeeById.idProofs?.panNo
    ) {
      changes.identityDocuments.push({
        field: "PAN Number",
        oldValue: employeeById.idProofs?.panNo,
        newValue: employeeById.pendingUpdateRequest.panNo,
      });
    }
    if (
      employeeById.pendingUpdateRequest.passport &&
      employeeById.pendingUpdateRequest.passport !==
        employeeById.idProofs?.passport
    ) {
      changes.identityDocuments.push({
        field: "Passport Number",
        oldValue: employeeById.idProofs?.passport,
        newValue: employeeById.pendingUpdateRequest.passport,
      });
    }
    if (
      employeeById.pendingUpdateRequest.drivingLicense &&
      employeeById.pendingUpdateRequest.drivingLicense !==
        employeeById.idProofs?.drivingLicense
    ) {
      changes.identityDocuments.push({
        field: "Driving License Number",
        oldValue: employeeById.idProofs?.drivingLicense,
        newValue: employeeById.pendingUpdateRequest.drivingLicense,
      });
    }
    if (
      employeeById.pendingUpdateRequest.voterId &&
      employeeById.pendingUpdateRequest.voterId !==
        employeeById.idProofs?.voterId
    ) {
      changes.identityDocuments.push({
        field: "Voter ID Number",
        oldValue: employeeById.idProofs?.voterId,
        newValue: employeeById.pendingUpdateRequest.voterId,
      });
    }

    // Check document changes
    if (
      employeeById.pendingUpdateRequest.profileImgUrl &&
      employeeById.pendingUpdateRequest.profileImgUrl !==
        employeeById.employeeImgUrl
    ) {
      changes.documents.push({
        field: "Profile Image",
        oldValue: employeeById.employeeImgUrl,
        newValue: employeeById.pendingUpdateRequest.profileImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.passbookImgUrl &&
      employeeById.pendingUpdateRequest.passbookImgUrl !==
        employeeById.bankDetails?.passbookImgUrl
    ) {
      changes.documents.push({
        field: "Bank Passbook",
        oldValue: employeeById.bankDetails?.passbookImgUrl,
        newValue: employeeById.pendingUpdateRequest.passbookImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.aadharImgUrl &&
      employeeById.pendingUpdateRequest.aadharImgUrl !==
        employeeById.idProofs?.aadharImgUrl
    ) {
      changes.documents.push({
        field: "Aadhar Card",
        oldValue: employeeById.idProofs?.aadharImgUrl,
        newValue: employeeById.pendingUpdateRequest.aadharImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.pancardImgUrl &&
      employeeById.pendingUpdateRequest.pancardImgUrl !==
        employeeById.idProofs?.pancardImgUrl
    ) {
      changes.documents.push({
        field: "PAN Card",
        oldValue: employeeById.idProofs?.pancardImgUrl,
        newValue: employeeById.pendingUpdateRequest.pancardImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.passportImgUrl &&
      employeeById.pendingUpdateRequest.passportImgUrl !==
        employeeById.idProofs?.passportImgUrl
    ) {
      changes.documents.push({
        field: "Passport",
        oldValue: employeeById.idProofs?.passportImgUrl,
        newValue: employeeById.pendingUpdateRequest.passportImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.drivingLicenseImgUrl &&
      employeeById.pendingUpdateRequest.drivingLicenseImgUrl !==
        employeeById.idProofs?.drivingLicenseImgUrl
    ) {
      changes.documents.push({
        field: "Driving License",
        oldValue: employeeById.idProofs?.drivingLicenseImgUrl,
        newValue: employeeById.pendingUpdateRequest.drivingLicenseImgUrl,
        isImage: true,
      });
    }
    if (
      employeeById.pendingUpdateRequest.voterIdImgUrl &&
      employeeById.pendingUpdateRequest.voterIdImgUrl !==
        employeeById.idProofs?.voterIdImgUrl
    ) {
      changes.documents.push({
        field: "Voter ID",
        oldValue: employeeById.idProofs?.voterIdImgUrl,
        newValue: employeeById.pendingUpdateRequest.voterIdImgUrl,
        isImage: true,
      });
    }

    setPendingChanges(changes);
    setShowPendingChangesModal(true);
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchByEmployeeId();
  }, [fetchByEmployeeId]);

  // --- Input Handling ---
  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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

  // --- Edit/Save Logic ---
  const handleEditProfileClick = () => {
    if (!isEditable) {
      toast.error("Editing is disabled while an update request is pending.");
      return;
    }
    if (!employeeById) {
      toast.error("Employee data not loaded yet.");
      return;
    }

    try {
      // Pre-fill all form data when entering edit mode
      if (!isPageInEditMode) {
        const currentData = employeeById;

        // Pre-fill all sections at once
        setFormData({
          employee: {
            ...formData.employee,
            fatherName: currentData?.fathersName || "",
            gender: currentData?.gender || "",
            phone1: currentData?.phone || "",
            phone2: currentData?.alternatePhone || "",
            email: { personal: currentData?.emailPersonal || "" },
            currentAddress: currentData?.currentAddress || "",
            permanentAddress: currentData?.permanentAddress || "",
            // Keep profileImage if it's a File, otherwise reset
            profileImage:
              formData.employee.profileImage instanceof File
                ? formData.employee.profileImage
                : null,
          },
          bank: {
            ...formData.bank,
            accountNumber: currentData?.bankDetails?.accountNumber || "",
            accountHolderName:
              currentData?.bankDetails?.accountHolderName || "",
            ifscCode: currentData?.bankDetails?.ifscCode || "",
            bankName: currentData?.bankDetails?.bankName || "",
            branchName: currentData?.bankDetails?.branchName || "",
            upiId: currentData?.bankDetails?.upiId || "",
            upiContactName: currentData?.bankDetails?.upiContactName || "",
            // Keep passbookDoc if it's a File, otherwise reset
            passbookDoc:
              formData.bank.passbookDoc instanceof File
                ? formData.bank.passbookDoc
                : null,
          },
          idProofs: {
            ...formData.idProofs,
            aadharNo: currentData?.idProofs?.aadharNo || "",
            panNo: currentData?.idProofs?.panNo || "",
            passport: currentData?.idProofs?.passport || "",
            drivingLicense: currentData?.idProofs?.drivingLicense || "",
            voterId: currentData?.idProofs?.voterId || "",
          },
        });
      }

      setIsPageInEditMode(!isPageInEditMode);
    } catch (error) {
      toast.error("Failed to toggle edit mode");
    }
  };

  // Add a function to handle canceling edits
  const handleCancelClick = () => {
    setIsPageInEditMode(false);
    // Clear all validation states
    setValidationErrors({});
    setFieldTouched({});
    setIdProofValidationErrors({});
    setIdProofFieldTouched({});
    // Optionally re-fetch data to reset form
    fetchByEmployeeId();
  };

  // Add a function to check if any changes have been made
  const hasChangesBeenMade = () => {
    if (!employeeById) return false;

    // Check personal info changes
    if (formData.employee.email.personal !== employeeById.emailPersonal) {
      return true;
    }
    if (formData.employee.phone1 !== employeeById.phone) {
      return true;
    }
    if (formData.employee.phone2 !== employeeById.alternatePhone) {
      return true;
    }
    if (formData.employee.currentAddress !== employeeById.currentAddress) {
      return true;
    }
    if (formData.employee.permanentAddress !== employeeById.permanentAddress) {
      return true;
    }

    // Check bank info changes
    if (
      formData.bank.accountHolderName !==
      employeeById.bankDetails?.accountHolderName
    ) {
      return true;
    }
    if (
      formData.bank.accountNumber !== employeeById.bankDetails?.accountNumber
    ) {
      return true;
    }
    if (formData.bank.bankName !== employeeById.bankDetails?.bankName) {
      return true;
    }
    if (formData.bank.branchName !== employeeById.bankDetails?.branchName) {
      return true;
    }
    if (formData.bank.ifscCode !== employeeById.bankDetails?.ifscCode) {
      return true;
    }
    if (formData.bank.upiId !== employeeById.bankDetails?.upiId) {
      return true;
    }
    if (
      formData.bank.upiContactName !== employeeById.bankDetails?.upiPhoneNumber
    ) {
      return true;
    }

    // Check if any files have been uploaded
    if (formData.employee.profileImage instanceof File) {
      return true;
    }
    if (formData.bank.passbookDoc instanceof File) {
      return true;
    }
    if (formData.idProofs.aadharImage instanceof File) {
      return true;
    }
    if (formData.idProofs.panImage instanceof File) {
      return true;
    }
    if (formData.idProofs.passportImage instanceof File) {
      return true;
    }
    if (formData.idProofs.drivingLicenseImage instanceof File) {
      return true;
    }
    if (formData.idProofs.voterIdImage instanceof File) {
      return true;
    }

    // Add these checks:
    if (formData.idProofs.aadharNo !== employeeById.idProofs?.aadharNo)
      return true;
    if (formData.idProofs.panNo !== employeeById.idProofs?.panNo) return true;
    if (formData.idProofs.passport !== employeeById.idProofs?.passport)
      return true;
    if (
      formData.idProofs.drivingLicense !== employeeById.idProofs?.drivingLicense
    )
      return true;
    if (formData.idProofs.voterId !== employeeById.idProofs?.voterId)
      return true;

    // No changes detected
    return false;
  };

  // Update the handleSaveAllClick function to add validation for ID proofs
  const handleSaveAllClick = async () => {
    if (!isEditable) {
      toast.error("Cannot save while an update request is pending.");
      return;
    }
    if (!employeeById?.employeeId) {
      toast.error("Cannot save: Employee ID is missing.");
      return;
    }

    // Check if any changes have been made
    if (!hasChangesBeenMade()) {
      toast.info("No changes have been made. Nothing to save.");
      setIsPageInEditMode(false);
      return;
    }

    // --- ID Proofs: If number is filled, require file ---
    const idProofFields = [
      { key: "aadharNo", fileKey: "aadharImage", urlKey: "aadharImgUrl" },
      { key: "panNo", fileKey: "panImage", urlKey: "pancardImgUrl" },
      { key: "passport", fileKey: "passportImage", urlKey: "passportImgUrl" },
      {
        key: "drivingLicense",
        fileKey: "drivingLicenseImage",
        urlKey: "drivingLicenseImgUrl",
      },
      { key: "voterId", fileKey: "voterIdImage", urlKey: "voterIdImgUrl" },
    ];
    let idProofValidationErrors = {};
    let firstMissingFileField = null;
    idProofFields.forEach(({ key, fileKey, urlKey }) => {
      const number = formData.idProofs[key];
      const file = formData.idProofs[fileKey];
      const url = formData.idProofs[urlKey] || employeeById?.idProofs?.[urlKey];
      // Only require file if number is filled and neither a new file nor an existing URL is present
      if (
        number &&
        !(
          file instanceof File ||
          (typeof url === "string" && url.trim() !== "")
        )
      ) {
        idProofValidationErrors[key] =
          "Please upload the document for this number.";
        if (!firstMissingFileField) firstMissingFileField = key;
      } else {
        idProofValidationErrors[key] = "";
      }
    });
    setIdProofValidationErrors(idProofValidationErrors);

    // Mark fields as touched so errors are displayed
    const touchedFields = {};
    idProofFields.forEach(({ key }) => {
      touchedFields[key] = true;
    });
    setIdProofFieldTouched((prev) => ({ ...prev, ...touchedFields }));

    if (firstMissingFileField) {
      // Scroll to the field
      const el = document.querySelector(`[name='${firstMissingFileField}']`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // --- Bank Details: If any of the five core fields is filled, all five are required ---
    const coreBankFields = [
      { key: "accountNumber", label: "Account Number" },
      { key: "accountHolderName", label: "Account Holder Name" },
      { key: "ifscCode", label: "IFSC Code" },
      { key: "bankName", label: "Bank Name" },
      { key: "branchName", label: "Branch Name" },
    ];

    // Check if any of the four core bank fields has been filled
    const hasAnyCoreBankField = coreBankFields.some((field) => {
      const currentValue = formData.bank[field.key];
      const originalValue = employeeById?.bankDetails?.[field.key];
      return (
        currentValue &&
        currentValue.trim() !== "" &&
        currentValue !== originalValue
      );
    });

    // If any core field is filled, validate all four are required
    if (hasAnyCoreBankField) {
      let bankValidationErrors = {};
      let firstMissingBankField = null;

      coreBankFields.forEach(({ key, label }) => {
        const currentValue = formData.bank[key];
        if (!currentValue || currentValue.trim() === "") {
          bankValidationErrors[
            key
          ] = `${label} is required when filling bank details.`;
          if (!firstMissingBankField) firstMissingBankField = key;
        } else {
          bankValidationErrors[key] = "";
        }
      });

      setValidationErrors((prev) => ({ ...prev, ...bankValidationErrors }));

      // Mark all core bank fields as touched so errors are displayed
      const touchedFields = {};
      coreBankFields.forEach(({ key }) => {
        touchedFields[key] = true;
      });
      setFieldTouched((prev) => ({ ...prev, ...touchedFields }));

      if (firstMissingBankField) {
        // Scroll to the first missing field
        const el = document.querySelector(`[name='${firstMissingBankField}']`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }

    // --- Comprehensive Validation Check: Prevent API call if any validation errors exist ---
    // Run validation on all fields to ensure we have the latest validation state
    const bankValidationErrors = validateBankDetails(formData.bank);
    const personalValidationErrors = {
      emailPersonal: validateEmail(formData.employee.email.personal),
      phone: validatePhone(formData.employee.phone1),
      alternatePhone: validatePhone(formData.employee.phone2),
    };

    // Check ID proof validation for numbers
    const idProofNumberValidationErrors = {};
    idProofFields.forEach(({ key }) => {
      const value = formData.idProofs[key];
      if (value) {
        switch (key) {
          case "aadharNo":
            idProofNumberValidationErrors[key] = validateAadharNumber(value);
            break;
          case "panNo":
            idProofNumberValidationErrors[key] = validatePANNumber(value);
            break;
          case "passport":
            idProofNumberValidationErrors[key] = validatePassportNumber(value);
            break;
          case "drivingLicense":
            idProofNumberValidationErrors[key] =
              validateDrivingLicenseNumber(value);
            break;
          case "voterId":
            idProofNumberValidationErrors[key] = validateVoterIdNumber(value);
            break;
        }
      }
    });

    // Combine all validation errors
    const allValidationErrors = {
      ...validationErrors,
      ...bankValidationErrors,
      ...personalValidationErrors,
      ...idProofNumberValidationErrors,
      ...idProofValidationErrors,
    };

    // Update validation errors state with all validation results
    setValidationErrors(allValidationErrors);
    setIdProofValidationErrors((prev) => ({
      ...prev,
      ...idProofNumberValidationErrors,
    }));

    // Check if there are any validation errors
    const hasValidationErrors = Object.values(allValidationErrors).some(
      (error) => error && error.trim() !== ""
    );

    if (hasValidationErrors) {
      // Find the first field with an error to scroll to
      const firstErrorField = Object.keys(allValidationErrors).find(
        (key) =>
          allValidationErrors[key] && allValidationErrors[key].trim() !== ""
      );

      if (firstErrorField) {
        // Mark all fields as touched so errors are displayed
        const allFields = [
          // Personal fields
          "emailPersonal",
          "phone",
          "alternatePhone",
          "currentAddress",
          "permanentAddress",
          // Bank fields
          "accountNumber",
          "accountHolderName",
          "ifscCode",
          "bankName",
          "branchName",
          "upiId",
          "upiPhoneNumber",
          // ID proof fields
          "aadharNo",
          "panNo",
          "passport",
          "drivingLicense",
          "voterId",
        ];

        const touchedFields = {};
        allFields.forEach((field) => {
          touchedFields[field] = true;
        });
        setFieldTouched((prev) => ({ ...prev, ...touchedFields }));
        setIdProofFieldTouched((prev) => ({ ...prev, ...touchedFields }));

        // Scroll to the first field with an error
        const el = document.querySelector(`[name='${firstErrorField}']`);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      // Always mark fields as touched when there are validation errors
      const allFields = [
        // Personal fields
        "emailPersonal",
        "phone",
        "alternatePhone",
        "currentAddress",
        "permanentAddress",
        // Bank fields
        "accountNumber",
        "accountHolderName",
        "ifscCode",
        "bankName",
        "branchName",
        "upiId",
        "upiPhoneNumber",
        // ID proof fields
        "aadharNo",
        "panNo",
        "passport",
        "drivingLicense",
        "voterId",
      ];

      const touchedFields = {};
      allFields.forEach((field) => {
        touchedFields[field] = true;
      });
      setFieldTouched((prev) => ({ ...prev, ...touchedFields }));
      setIdProofFieldTouched((prev) => ({ ...prev, ...touchedFields }));

      return; // Prevent API call
    }

    setLoading(true);
    try {
      // Create a payload with only the changed fields
      const payload = {
        employeeId: employeeById.employeeId,
      };

      // Only include personal info fields that have changed
      if (formData.employee.email.personal !== employeeById.emailPersonal) {
        payload.emailPersonal = formData.employee.email.personal;
      }
      if (formData.employee.phone1 !== employeeById.phone) {
        payload.phone = formData.employee.phone1;
      }
      if (formData.employee.phone2 !== employeeById.alternatePhone) {
        payload.alternatePhone = formData.employee.phone2;
      }
      if (formData.employee.currentAddress !== employeeById.currentAddress) {
        payload.currentAddress = formData.employee.currentAddress;
      }
      if (
        formData.employee.permanentAddress !== employeeById.permanentAddress
      ) {
        payload.permanentAddress = formData.employee.permanentAddress;
      }

      // Include bank details that have changed (don't require both fields to be filled)
      if (
        formData.bank.accountNumber !== employeeById.bankDetails?.accountNumber
      ) {
        payload.accountNumber = formData.bank.accountNumber;
      }
      if (formData.bank.ifscCode !== employeeById.bankDetails?.ifscCode) {
        payload.ifscCode = formData.bank.ifscCode;
      }
      if (
        formData.bank.accountHolderName !==
        employeeById.bankDetails?.accountHolderName
      ) {
        payload.accountHolderName = formData.bank.accountHolderName;
      }
      if (formData.bank.bankName !== employeeById.bankDetails?.bankName) {
        payload.bankName = formData.bank.bankName;
      }
      if (formData.bank.branchName !== employeeById.bankDetails?.branchName) {
        payload.branchName = formData.bank.branchName;
      }
      if (formData.bank.upiId !== employeeById.bankDetails?.upiId) {
        payload.upiId = formData.bank.upiId;
      }
      if (
        formData.bank.upiContactName !==
        employeeById.bankDetails?.upiPhoneNumber
      ) {
        payload.upiPhoneNumber = formData.bank.upiContactName; // ✅ CORRECT
      }

      // Include ID proof fields that have changed
      if (formData.idProofs.aadharNo !== employeeById.idProofs?.aadharNo) {
        payload.aadharNo = formData.idProofs.aadharNo;
      }
      if (formData.idProofs.panNo !== employeeById.idProofs?.panNo) {
        payload.panNo = formData.idProofs.panNo;
      }
      if (formData.idProofs.passport !== employeeById.idProofs?.passport) {
        payload.passport = formData.idProofs.passport;
      }
      if (
        formData.idProofs.drivingLicense !==
        employeeById.idProofs?.drivingLicense
      ) {
        payload.drivingLicense = formData.idProofs.drivingLicense;
      }
      if (formData.idProofs.voterId !== employeeById.idProofs?.voterId) {
        payload.voterId = formData.idProofs.voterId;
      }

      // Create FormData for the request
      const formDataPayload = new FormData();
      formDataPayload.append("updateRequest", JSON.stringify(payload));

      // Add files if they exist
      if (formData.employee.profileImage instanceof File) {
        formDataPayload.append("profileImage", formData.employee.profileImage);
      }
      if (formData.bank.passbookDoc instanceof File) {
        formDataPayload.append("passbookImage", formData.bank.passbookDoc);
      }

      // Add document files if they exist
      if (formData.idProofs.aadharImage instanceof File) {
        formDataPayload.append("aadharImage", formData.idProofs.aadharImage);
      }
      if (formData.idProofs.panImage instanceof File) {
        formDataPayload.append("panImage", formData.idProofs.panImage);
      }
      if (formData.idProofs.passportImage instanceof File) {
        formDataPayload.append(
          "passportImage",
          formData.idProofs.passportImage
        );
      }
      if (formData.idProofs.drivingLicenseImage instanceof File) {
        formDataPayload.append(
          "drivingLicenseImage",
          formData.idProofs.drivingLicenseImage
        );
      }
      if (formData.idProofs.voterIdImage instanceof File) {
        formDataPayload.append("voterIdImage", formData.idProofs.voterIdImage);
      }

      const token = getItemFromSessionStorage("token");
      const response = await fetch(
        `${publicRuntimeConfig.apiURL}/employee/update-request`,
        {
          method: "PUT",
          body: formDataPayload,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        toast.error("Failed to parse response");
        result = { message: await response.text() };
      }

      if (response.ok) {
        toast.success(
          result.message || "Update request submitted successfully."
        );
        setIsPageInEditMode(false);
        fetchByEmployeeId();
      } else {
        toast.error(result.message || `Failed: ${response.statusText}`);
      }
    } catch (error) {
      toast.error("Failed to submit update request.");
    } finally {
      setLoading(false);
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    clearSession();
    router.push("/login");
    toast.success("Logged out successfully");
  };

  // --- Render ---
  if (loading && !employeeById) {
    // Show a loading indicator only on initial load
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  // Handle case where employee data failed to load
  if (!employeeById && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h2 className="text-xl text-red-600 mb-4">
          Failed to load employee data.
        </h2>
        <button
          onClick={fetchByEmployeeId}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Validation functions
  const validatePhone = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[0-9]+$/.test(value)) return "Only numbers allowed";
    if (value.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateEmail = (value) => {
    if (!value || value.trim() === "") return "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Invalid email format";
    return "";
  };

  const generateEmailSuggestions = (input) => {
    if (!input || !input.includes("@")) return [];

    const [localPart] = input.split("@");
    if (!localPart) return [];

    const commonDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
      "company.com",
    ];
    return commonDomains.map((domain) => `${localPart}@${domain}`);
  };

  const handleEmailInput = (value) => {
    handleNestedInputChange("employee", "email", "personal", value);

    // Generate suggestions
    const suggestions = generateEmailSuggestions(value);
    setEmailSuggestions(suggestions);
    setShowEmailSuggestions(suggestions.length > 0 && value.includes("@"));

    // Validate on input
    const error = validateEmail(value);
    setPersonalValidationErrors((prev) => ({ ...prev, email: error }));
  };

  const selectEmailSuggestion = (suggestion) => {
    handleNestedInputChange("employee", "email", "personal", suggestion);
    setShowEmailSuggestions(false);
    setPersonalValidationErrors((prev) => ({ ...prev, email: "" }));
  };

  const handlePersonalFieldBlur = (field) => {
    setPersonalFieldTouched((prev) => ({ ...prev, [field]: true }));

    let error = "";
    switch (field) {
      case "phone1":
        error = validatePhone(formData.employee.phone1);
        break;
      case "phone2":
        error = validatePhone(formData.employee.phone2);
        break;
      case "email":
        error = validateEmail(formData.employee.email.personal);
        break;
    }

    setPersonalValidationErrors((prev) => ({ ...prev, [field]: error }));
    setShowEmailSuggestions(false);
  };

  // ID Proof validation functions
  const validateAadharNumber = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[0-9]+$/.test(value)) return "Only numbers allowed";
    if (value.length !== 12) return "Aadhar number must be exactly 12 digits";
    return "";
  };

  const validatePANNumber = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase()))
      return "Invalid PAN format (e.g., ABCDE1234F)";
    return "";
  };

  const validatePassportNumber = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Z][0-9]{7}$/.test(value.toUpperCase()))
      return "Passport number must be 1 letter followed by 7 digits (e.g., K1234567)";
    return "";
  };

  const validateDrivingLicenseNumber = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Z0-9]+$/.test(value.toUpperCase()))
      return "Only alphabets and numbers allowed";
    if (value.length < 10 || value.length > 15)
      return "License number must be 10-15 characters";
    return "";
  };

  const validateVoterIdNumber = (value) => {
    if (!value || value.trim() === "") return "";
    if (!/^[A-Z]{3}[0-9]{7}$/.test(value.toUpperCase()))
      return "Voter ID must be 3 letters followed by 7 digits (e.g., ABC1234567)";
    return "";
  };

  const validateIdProofField = (field, value) => {
    switch (field) {
      case "aadharNo":
        return validateAadharNumber(value);
      case "panNo":
        return validatePANNumber(value);
      case "passport":
        return validatePassportNumber(value);
      case "drivingLicense":
        return validateDrivingLicenseNumber(value);
      case "voterId":
        return validateVoterIdNumber(value);
      default:
        return "";
    }
  };

  const validateIdProofConditional = (field) => {
    const numberValue = formData.idProofs[field];
    const hasFile =
      formData.idProofs[
        `${field.replace("No", "").replace("Number", "")}Image`
      ] instanceof File;
    const hasNumber = numberValue && numberValue.trim() !== "";

    if (hasFile && !hasNumber) {
      return `Please enter the ${field
        .replace("No", " Number")
        .replace("Number", " Number")} for the uploaded document`;
    }
    if (hasNumber && !hasFile) {
      return `Please upload the ${field
        .replace("No", " document")
        .replace("Number", " document")}`;
    }
    return "";
  };

  const handleIdProofFieldBlur = (field) => {
    setIdProofFieldTouched((prev) => ({ ...prev, [field]: true }));

    // Validate the number format
    const numberError = validateIdProofField(field, formData.idProofs[field]);

    // Validate conditional requirement
    const conditionalError = validateIdProofConditional(field);

    const finalError = numberError || conditionalError;
    setIdProofValidationErrors((prev) => ({ ...prev, [field]: finalError }));
  };

  const handleIdProofNumberChange = (field, value) => {
    // Auto-uppercase for PAN, Passport, Driving License, Voter ID
    let processedValue = value;
    if (field !== "aadharNo") {
      processedValue = value.toUpperCase();
    }

    handleInputChange("idProofs", field, processedValue);

    // Mark field as touched and validate in real-time
    setIdProofFieldTouched((prev) => ({ ...prev, [field]: true }));
    
    // Validate the number format immediately
    const numberError = validateIdProofField(field, processedValue);
    
    // Validate conditional requirement
    const conditionalError = validateIdProofConditional(field);
    
    const finalError = numberError || conditionalError;
    setIdProofValidationErrors((prev) => ({ ...prev, [field]: finalError }));
  };

  // Helper function to extract filename after underscore
  const getDisplayFileName = (fullFileName) => {
    if (!fullFileName) return "";
    
    // Split by underscore
    const parts = fullFileName.split("_");
    
    // Find the first part that doesn't look like a numeric ID
    // (numeric IDs are typically long numbers)
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      // Check if this part looks like a filename (contains letters, spaces, dots, etc.)
      // and not just a long numeric ID
      if (part && !/^\d{10,}$/.test(part)) {
        // Return this part and all remaining parts joined
        return parts.slice(i).join("_");
      }
    }
    
    // If all parts look like numeric IDs, return the last part
    return parts[parts.length - 1] || fullFileName;
  };

  // Helper function to truncate filename if too long
  const truncateFileName = (fileName, maxLength = 20) => {
    if (!fileName) return "";
    if (fileName.length <= maxLength) return fileName;
    return fileName.substring(0, maxLength - 3) + "...";
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-56"
        }`}
      >
        <HradminNavbar />

        <main className="p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative h-64 bg-gradient-to-r bg-[#3B6FA0]">
                <div className="absolute inset-0 opacity-10 bg-[url('/pattern.svg')] bg-repeat"></div>
                <div className="relative h-full px-8 py-6 flex flex-col justify-between">
                  {/* Top Row */}
                  <div className="flex justify-between items-start">
                    {/* Status Badges */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            employeeById?.updateStatus === "Pending"
                              ? "bg-yellow-400"
                              : "bg-green-400"
                          }`}
                        ></div>
                        <span>
                          {employeeById?.updateStatus === "Pending"
                            ? "Update Pending"
                            : "Active Employee"}
                        </span>
                        {employeeById?.updateStatus === "Pending" && (
                          <button
                            onClick={fetchPendingChanges}
                            className="ml-2 px-2 py-0.5 bg-white/20 rounded-md text-xs hover:bg-white/30 transition-colors"
                          >
                            View Changes
                          </button>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-white text-sm">
                        <FaCalendarCheck className="w-4 h-4" />
                        <span>
                          Joined on{" "}
                          {employeeById?.joiningDate
                            ? new Date(
                                employeeById.joiningDate
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
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
                          <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                            <FiSettings className="w-4 h-4 mr-2" /> Settings
                          </button>
                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 flex items-center"
                          >
                            <FiLogOut className="w-4 h-4 mr-2" /> Log out
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Bottom Row */}
                  <div className="flex items-end space-x-6">
                    {/* Profile Picture */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-xl bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-lg bg-gray-100 border border-white overflow-hidden flex items-center justify-center">
                          {formData.employee.profileImage instanceof File ? (
                            <img
                              src={URL.createObjectURL(
                                formData.employee.profileImage
                              )}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : employeeById?.employeeImgUrl ? (
                            <img
                              src={employeeById.employeeImgUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-16 h-16 text-gray-300" />
                          )}
                        </div>
                      </div>
                      {/* Profile Image Upload Input - only visible/enabled when editing personal info */}
                      {isPageInEditMode && (
                        <>
                          <label
                            htmlFor="profile-upload"
                            className={`absolute -bottom-2 -right-2 bg-blue-500 text-white p-2 rounded-lg shadow-lg transition-colors ${
                              isEditable
                                ? "cursor-pointer hover:bg-blue-600"
                                : "opacity-50 cursor-not-allowed"
                            }`}
                          >
                            <FiUpload className="w-4 h-4" />
                          </label>
                          <input
                            id="profile-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={!isEditable}
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleInputChange(
                                  "employee",
                                  "profileImage",
                                  file
                                );
                              }
                            }}
                          />
                        </>
                      )}
                    </div>
                    {/* Employee Info */}
                    <div className="flex-1 mb-2">
                      <h1 className="text-3xl font-bold text-white mb-1">
                        {employeeById?.name || "Employee Name"}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-lg text-white text-sm">
                          <span className="font-medium">
                            {employeeById?.employeeId || "-"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-white/80 text-sm">
                          <span>{employeeById?.designationName || "-"}</span>
                          <span className="text-white/40">•</span>
                          <span>{employeeById?.departmentName || "-"}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-white/80 text-sm">
                        <span>
                          {employeeById?.emailOfficial || "No official email"}
                        </span>
                      </div>
                    </div>
                    {/* Quick Info */}
                    <div className="flex space-x-3">
                      {/* Add Edit Profile button here, to the left of Reports to */}
                      {!isPageInEditMode ? (
                        <div className="relative group">
                          <button
                            onClick={handleEditProfileClick}
                            className={`flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white ${
                              !isEditable
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-white/20"
                            }`}
                            disabled={!isEditable || loading}
                          >
                            <FiEdit2 className="w-4 h-4 mb-1" />
                            <span className="text-xs">Edit Profile</span>
                          </button>
                          {!isEditable && (
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                              <div className="relative">
                                <p>
                                  Cannot edit while update request is pending
                                </p>
                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <div
                            onClick={handleSaveAllClick}
                            className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white cursor-pointer"
                          >
                            <button
                              className="flex items-center justify-center text-green-400 hover:text-green-300 disabled:opacity-50"
                              disabled={loading || !isEditable}
                            >
                              {loading ? (
                                <FiLoader className="w-4 h-4 animate-spin" />
                              ) : (
                                <FiCheck className="w-4 h-4" />
                              )}
                            </button>
                            <span className="text-xs mt-1">Save Changes</span>
                          </div>
                          <div
                            onClick={handleCancelClick}
                            className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white cursor-pointer"
                          >
                            <button
                              className="flex items-center justify-center text-red-400 hover:text-red-300 disabled:opacity-50"
                              disabled={loading}
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <span className="text-xs mt-1">Cancel</span>
                          </div>
                        </>
                      )}
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">
                          Reports to
                        </span>
                        <span className="font-medium">{managerName}</span>
                      </div>
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">PF Status</span>
                        <span className="font-medium">
                          {employeeById?.pfEnrolled
                            ? "Enrolled"
                            : "Not Enrolled"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Profile Info Sections --- */}
              <div className="p-6 bg-gray-50">
                <div className="grid grid-cols-1 lg:grid-cols-11 gap-6">
                  <div className="lg:col-span-8 space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Personal Information Card */}
                      <div className="lg:col-span-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex justify-between items-center mb-3 pb-3 -mt-2 border-b border-gray-100">
                            <div className="flex items-center">
                              <FiUser className="w-5 h-5 text-blue-500 mr-2" />
                              <h3 className="text-lg font-semibold text-gray-800">
                                Personal Information
                              </h3>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {/* Father's Name - Read Only */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Father&apos;s Name
                              </label>
                              <p className="text-base text-gray-900">
                                {employeeById?.fathersName || "-"}
                              </p>
                            </div>
                            {/* Gender - Read Only */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Gender
                              </label>
                              <p className="text-base text-gray-900">
                                {employeeById?.gender || "-"}
                              </p>
                            </div>
                            {/* Phone - Editable */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Phone
                              </label>
                              {isPageInEditMode ? (
                                <div>
                                  <input
                                    type="tel"
                                    value={formData.employee.phone1}
                                    onChange={(e) => {
                                      const value = e.target.value
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 10);
                                      handleInputChange(
                                        "employee",
                                        "phone1",
                                        value
                                      );
                                    }}
                                    onBlur={() =>
                                      handlePersonalFieldBlur("phone1")
                                    }
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                      personalFieldTouched.phone1 &&
                                      personalValidationErrors.phone1
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    pattern="[0-9]{10}"
                                    disabled={!isEditable}
                                    placeholder="10-digit number"
                                    maxLength={10}
                                    inputMode="numeric"
                                  />
                                  {personalFieldTouched.phone1 &&
                                    personalValidationErrors.phone1 && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {personalValidationErrors.phone1}
                                      </p>
                                    )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    Enter 10-digit mobile number
                                  </p>
                                </div>
                              ) : (
                                <p className="text-base text-gray-900">
                                  {employeeById?.phone || "-"}
                                </p>
                              )}
                            </div>
                            {/* Alternate Phone - Editable */}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Alternate Phone
                              </label>
                              {isPageInEditMode ? (
                                <div>
                                  <input
                                    type="tel"
                                    value={formData.employee.phone2 || ""}
                                    onChange={(e) => {
                                      const value = e.target.value
                                        .replace(/[^0-9]/g, "")
                                        .slice(0, 10);
                                      handleInputChange(
                                        "employee",
                                        "phone2",
                                        value
                                      );
                                    }}
                                    onBlur={() =>
                                      handlePersonalFieldBlur("phone2")
                                    }
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                      personalFieldTouched.phone2 &&
                                      personalValidationErrors.phone2
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    pattern="[0-9]{10}"
                                    placeholder="10-digit number (optional)"
                                    disabled={!isEditable}
                                    maxLength={10}
                                    inputMode="numeric"
                                  />
                                  {personalFieldTouched.phone2 &&
                                    personalValidationErrors.phone2 && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {personalValidationErrors.phone2}
                                      </p>
                                    )}
                                  <p className="text-xs text-gray-500 mt-1">
                                    Optional: Enter 10-digit mobile number
                                  </p>
                                </div>
                              ) : (
                                <p className="text-base text-gray-900">
                                  {employeeById?.alternatePhone || "-"}
                                </p>
                              )}
                            </div>
                            {/* Personal Email - Editable */}
                            <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Personal Email
                              </label>
                              {isPageInEditMode ? (
                                <div className="relative">
                                  <input
                                    type="email"
                                    value={formData.employee.email.personal}
                                    onChange={(e) =>
                                      handleEmailInput(e.target.value)
                                    }
                                    onBlur={() =>
                                      handlePersonalFieldBlur("email")
                                    }
                                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                      personalFieldTouched.email &&
                                      personalValidationErrors.email
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    disabled={!isEditable}
                                    placeholder="Enter your email address"
                                  />
                                  {personalFieldTouched.email &&
                                    personalValidationErrors.email && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {personalValidationErrors.email}
                                      </p>
                                    )}

                                  {/* Email Suggestions Dropdown */}
                                  {showEmailSuggestions &&
                                    emailSuggestions.length > 0 && (
                                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
                                        {emailSuggestions.map(
                                          (suggestion, index) => (
                                            <button
                                              key={index}
                                              type="button"
                                              onClick={() =>
                                                selectEmailSuggestion(
                                                  suggestion
                                                )
                                              }
                                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center"
                                            >
                                              <span className="text-gray-700">
                                                {suggestion}
                                              </span>
                                              <span className="ml-auto text-xs text-gray-400">
                                                Tap to select
                                              </span>
                                            </button>
                                          )
                                        )}
                                      </div>
                                    )}
                                </div>
                              ) : (
                                <p className="text-base text-gray-900">
                                  {employeeById?.emailPersonal || "-"}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Statutory Information Card */}
                      <div className="lg:col-span-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                            <FiShield className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Statutory Information
                            </h3>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                PF Status
                              </label>
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    employeeById?.pfEnrolled
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <p className="text-base text-gray-900">
                                  {employeeById?.pfEnrolled
                                    ? "Enrolled"
                                    : "Not Enrolled"}
                                </p>
                              </div>
                            </div>
                            {employeeById?.pfEnrolled && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                  UAN Number
                                </label>
                                <p className="text-base text-gray-900">
                                  {employeeById?.uanNumber || "-"}
                                </p>
                              </div>
                            )}
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                ESIC Status
                              </label>
                              <div className="flex items-center">
                                <div
                                  className={`w-2 h-2 rounded-full mr-2 ${
                                    employeeById?.esicEnrolled
                                      ? "bg-green-500"
                                      : "bg-red-500"
                                  }`}
                                ></div>
                                <p className="text-base text-gray-900">
                                  {employeeById?.esicEnrolled
                                    ? "Enrolled"
                                    : "Not Enrolled"}
                                </p>
                              </div>
                            </div>
                            {employeeById?.esicEnrolled && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                  ESIC Number
                                </label>
                                <p className="text-base text-gray-900">
                                  {employeeById?.esicNumber || "-"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ID Proofs Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-2 -mt-2 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiBook className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Identity Documents
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Aadhar No.",
                            key: "aadharNo",
                            imgUrlKey: "aadharImgUrl",
                            fileKey: "aadharImage",
                            documentType: "aadhar",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            imgUrlKey: "pancardImgUrl",
                            fileKey: "panImage",
                            documentType: "pan",
                          },
                          {
                            label: "Passport",
                            key: "passport",
                            imgUrlKey: "passportImgUrl",
                            fileKey: "passportImage",
                            documentType: "passport",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            imgUrlKey: "drivingLicenseImgUrl",
                            fileKey: "drivingLicenseImage",
                            documentType: "drivingLicense",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            imgUrlKey: "voterIdImgUrl",
                            fileKey: "voterIdImage",
                            documentType: "voterId",
                          },
                        ].map(
                          ({
                            label,
                            key,
                            imgUrlKey,
                            fileKey,
                            documentType,
                          }) => (
                            <div
                              key={key}
                              className="bg-gray-50 p-3 rounded-lg space-y-1 min-w-0"
                            >
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                {label}
                              </label>
                              {/* Number field - Editable in edit mode */}
                              {isPageInEditMode ? (
                                <div>
                                  <input
                                    type="text"
                                    name={key}
                                    value={formData.idProofs[key] || ""}
                                    onChange={(e) =>
                                      handleIdProofNumberChange(
                                        key,
                                        e.target.value
                                      )
                                    }
                                    onBlur={() => handleIdProofFieldBlur(key)}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                      idProofFieldTouched[key] &&
                                      idProofValidationErrors[key]
                                        ? "border-red-500"
                                        : ""
                                    }`}
                                    disabled={!isEditable}
                                    placeholder={
                                      key === "aadharNo"
                                        ? "12-digit number"
                                        : key === "panNo"
                                        ? "ABCDE1234F"
                                        : key === "passport"
                                        ? "Passport number"
                                        : key === "drivingLicense"
                                        ? "License number"
                                        : "Voter ID number"
                                    }
                                    maxLength={
                                      key === "aadharNo"
                                        ? 12
                                        : key === "panNo"
                                        ? 10
                                        : key === "passport"
                                        ? 9
                                        : key === "drivingLicense"
                                        ? 15
                                        : 10
                                    }
                                  />
                                  {idProofFieldTouched[key] &&
                                    idProofValidationErrors[key] && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {idProofValidationErrors[key]}
                                      </p>
                                    )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <p className="text-base text-gray-900 truncate flex-1 mr-2">
                                    {employeeById?.idProofs?.[key] || "-"}
                                  </p>
                                  {employeeById?.idProofs?.[imgUrlKey] && (
                                    <button
                                      onClick={() =>
                                        openIdProofPreview(
                                          documentType,
                                          imgUrlKey
                                        )
                                      }
                                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center flex-shrink-0"
                                    >
                                      <FiEye className="w-4 h-4 mr-1" /> View
                                    </button>
                                  )}
                                </div>
                              )}
                              <div className="pt-2 border-t border-gray-200 mt-2">
                                {isPageInEditMode ? (
                                  <div>
                                    {!formData.idProofs[fileKey] && (
                                      <label
                                        htmlFor={`upload-${key}`}
                                        className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                                          isEditable
                                            ? "cursor-pointer"
                                            : "opacity-50 cursor-not-allowed"
                                        }`}
                                      >
                                        <FiUpload className="w-3 h-3 mr-1" />{" "}
                                        Upload
                                      </label>
                                    )}
                                    <input
                                      type="file"
                                      id={`upload-${key}`}
                                      className="hidden"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      disabled={!isEditable}
                                      onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                          handleIdProofUpload(
                                            documentType,
                                            file
                                          );
                                        }
                                      }}
                                    />
                                    {formData.idProofs[fileKey] instanceof
                                      File && (
                                      <div className="mt-2 flex items-center text-sm">
                                        <div className="flex items-center space-x-3">
                                          {isPDF(formData.idProofs[fileKey]) ? (
                                            <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-lg border-2 border-red-300 shadow-sm">
                                              <span className="text-sm text-red-600 font-bold">
                                                PDF
                                              </span>
                                            </div>
                                          ) : (
                                            <img
                                              src={URL.createObjectURL(
                                                formData.idProofs[fileKey]
                                              )}
                                              alt={`${label} preview`}
                                              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                                            />
                                          )}
                                          <div className="flex flex-col">
                                            <span className="text-gray-700 font-medium truncate max-w-[120px]">
                                              {truncateFileName(getDisplayFileName(formData.idProofs[fileKey].name))}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                              {(
                                                formData.idProofs[fileKey]
                                                  .size /
                                                1024 /
                                                1024
                                              ).toFixed(2)}{" "}
                                              MB
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-3">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              openUploadedIdProofPreview(
                                                documentType,
                                                formData.idProofs[fileKey]
                                              )
                                            }
                                            className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                            disabled={!isEditable}
                                          >
                                            <FiEye className="w-4 h-4" />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleInputChange(
                                                "idProofs",
                                                fileKey,
                                                null
                                              )
                                            }
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                            disabled={!isEditable}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                      PDF, JPG, JPEG, PNG (max 5MB)
                                    </p>
                                  </div>
                                ) : employeeById?.idProofs?.[imgUrlKey] ? (
                                  <div className="flex items-center space-x-2">
                                    {isPDF(
                                      employeeById.idProofs[imgUrlKey]
                                    ) ? (
                                      <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded border border-red-300">
                                        <span className="text-xs text-red-600 font-medium">
                                          PDF
                                        </span>
                                      </div>
                                    ) : (
                                      <img
                                        src={employeeById.idProofs[imgUrlKey]}
                                        alt={`${label} preview`}
                                        className="w-8 h-8 object-cover rounded border border-gray-300"
                                      />
                                    )}
                                    <span className="text-sm text-gray-700 truncate">
                                      {truncateFileName(getDisplayFileName(employeeById.idProofs[imgUrlKey]
                                        .split("/")
                                        .pop()))}
                                    </span>
                                  </div>
                                ) : (
                                  <p className="text-xs text-gray-500">
                                    No document
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    {/* Salary Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-center mb-5 pb-3 -mt-2 border-b border-gray-100">
                        <FiDollarSign className="w-5 h-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Salary Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Annual CTC
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.annualCtc?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Monthly CTC
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.monthlyCtc?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Basic Salary
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.basicSalary?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            HRA
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.hra?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Allowances
                          </label>
                          <p className="text-base text-gray-900">
                            ₹
                            {employeeById?.salaryDetails?.allowances?.toLocaleString() ||
                              "-"}
                          </p>
                        </div>
                        {employeeById?.pfEnrolled && (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Employer PF
                              </label>
                              <p className="text-base text-gray-900">
                                ₹
                                {employeeById?.salaryDetails?.employerPfContribution?.toLocaleString() ||
                                  "-"}
                              </p>
                            </div>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                                Employee PF
                              </label>
                              <p className="text-base text-gray-900">
                                ₹
                                {employeeById?.salaryDetails?.employeePfContribution?.toLocaleString() ||
                                  "-"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-3">
                    {/* Bank Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Bank Information
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-6">
                        {/* Account Holder Name - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Account Holder Name
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              name="accountHolderName"
                              value={formData.bank.accountHolderName}
                              onChange={(e) =>
                                handleBankFieldChange(
                                  "accountHolderName",
                                  filterAccountHolderName(e.target.value)
                                )
                              }
                              onBlur={() =>
                                handleBankFieldBlur("accountHolderName")
                              }
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.accountHolderName &&
                                validationErrors.accountHolderName
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={50}
                              placeholder="Enter account holder name"
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.accountHolderName || "-"}
                            </p>
                          )}
                          {fieldTouched.accountHolderName &&
                            validationErrors.accountHolderName && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.accountHolderName}
                              </p>
                            )}
                        </div>
                        {/* Account Number - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Account Number
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              name="accountNumber"
                              value={formData.bank.accountNumber}
                              onChange={(e) =>
                                handleBankFieldChange(
                                  "accountNumber",
                                  filterAccountNumber(e.target.value)
                                )
                              }
                              onBlur={() =>
                                handleBankFieldBlur("accountNumber")
                              }
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.accountNumber &&
                                validationErrors.accountNumber
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={18}
                              inputMode="numeric"
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.accountNumber || "-"}
                            </p>
                          )}
                          {fieldTouched.accountNumber &&
                            validationErrors.accountNumber && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.accountNumber}
                              </p>
                            )}
                        </div>
                        {/* IFSC Code - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            IFSC Code
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              name="ifscCode"
                              value={formData.bank.ifscCode}
                              onChange={(e) =>
                                handleBankFieldChange(
                                  "ifscCode",
                                  filterIFSC(e.target.value)
                                )
                              }
                              onBlur={() => handleBankFieldBlur("ifscCode")}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.ifscCode &&
                                validationErrors.ifscCode
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={11}
                              placeholder="e.g., SBIN0001234"
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.ifscCode || "-"}
                            </p>
                          )}
                          {fieldTouched.ifscCode &&
                            validationErrors.ifscCode && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.ifscCode}
                              </p>
                            )}
                        </div>
                        {/* Bank Name - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Bank Name
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              name="bankName"
                              value={formData.bank.bankName}
                              onChange={(e) =>
                                handleBankFieldChange(
                                  "bankName",
                                  filterBankName(e.target.value)
                                )
                              }
                              onBlur={() => handleBankFieldBlur("bankName")}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.bankName &&
                                validationErrors.bankName
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={50}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.bankName || "-"}
                            </p>
                          )}
                          {fieldTouched.bankName &&
                            validationErrors.bankName && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.bankName}
                              </p>
                            )}
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Branch Name
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              name="branchName"
                              value={formData.bank.branchName}
                              onChange={(e) =>
                                handleBankFieldChange(
                                  "branchName",
                                  filterBranchName(e.target.value)
                                )
                              }
                              onBlur={() => handleBankFieldBlur("branchName")}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.branchName &&
                                validationErrors.branchName
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={50}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.branchName || "-"}
                            </p>
                          )}
                          {fieldTouched.branchName &&
                            validationErrors.branchName && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.branchName}
                              </p>
                            )}
                        </div>
                                                {/* Passbook Upload - Enabled in Edit Mode */}
                                                <div className="border-t pt-4 mt-4">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm text-gray-600 font-medium">
                              Bank Passbook
                            </label>
                            {!isPageInEditMode && employeeById?.bankDetails?.passbookImgUrl && (
                              <button
                                onClick={openPassbookPreview}
                                className="text-sm text-blue-600 hover:text-blue-700 flex items-center flex-shrink-0"
                              >
                                <FiEye className="w-4 h-4 mr-1" /> View
                              </button>
                            )}
                          </div>
                          {isPageInEditMode ? (
                            <div>
                              <label
                                htmlFor="passbook-upload"
                                className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                                  isEditable
                                    ? "cursor-pointer"
                                    : "opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <FiUpload className="w-4 h-4 mr-2" />
                                {formData.bank.passbookDoc instanceof File
                                  ? "Change File"
                                  : "Upload File"}
                              </label>
                              <input
                                type="file"
                                id="passbook-upload"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                disabled={!isEditable}
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    handlePassbookUpload(file);
                                  }
                                }}
                              />
                              {formData.bank.passbookDoc instanceof File && (
                                <div className="mt-2 flex items-center text-sm">
                                  <div className="flex items-center space-x-3">
                                    {isPDF(formData.bank.passbookDoc) ? (
                                      <div className="w-12 h-12 bg-red-100 flex items-center justify-center rounded-lg border-2 border-red-300 shadow-sm">
                                        <span className="text-sm text-red-600 font-bold">
                                          PDF
                                        </span>
                                      </div>
                                    ) : (
                                      <img
                                        src={URL.createObjectURL(
                                          formData.bank.passbookDoc
                                        )}
                                        alt="Passbook preview"
                                        className="w-12 h-12 object-cover rounded-lg border-2 border-gray-300 shadow-sm"
                                      />
                                    )}
                                    <div className="flex flex-col">
                                      <span className="text-gray-700 font-medium truncate max-w-[150px]">
                                        {truncateFileName(getDisplayFileName(formData.bank.passbookDoc.name))}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {(
                                          formData.bank.passbookDoc.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 ml-3">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openUploadedPassbookPreview(
                                          formData.bank.passbookDoc
                                        )
                                      }
                                      className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                                      disabled={!isEditable}
                                    >
                                      <FiEye className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleInputChange(
                                          "bank",
                                          "passbookDoc",
                                          null
                                        )
                                      }
                                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                      disabled={!isEditable}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-gray-500 mt-2">
                                Accepted formats: PDF, JPG, JPEG, PNG (max 5MB)
                              </p>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-3 mt-2 bg-gray-50 p-3 rounded-lg">
                              {employeeById?.bankDetails?.passbookImgUrl ? (
                                <>
                                  {isPDF(
                                    employeeById.bankDetails.passbookImgUrl
                                  ) ? (
                                    <div className="w-8 h-8 bg-red-100 flex items-center justify-center rounded border border-red-300">
                                      <span className="text-xs text-red-600 font-medium">
                                        PDF
                                      </span>
                                    </div>
                                  ) : (
                                    <img
                                      src={
                                        employeeById.bankDetails
                                          .passbookImgUrl
                                      }
                                      alt="Passbook preview"
                                      className="w-8 h-8 object-cover rounded border border-gray-300"
                                    />
                                  )}
                                  <span className="text-sm text-gray-700 truncate">
                                    {truncateFileName(getDisplayFileName(employeeById.bankDetails.passbookImgUrl
                                      .split("/")
                                      .pop()))}
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500">
                                  No document uploaded
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {/* UPI ID - Editable */}
                        <div className="border-t border-gray-200 mt-6"></div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            UPI ID
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              value={formData.bank.upiId}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "upiId",
                                  filterUPI(e.target.value)
                                )
                              }
                              onBlur={() => handleBankFieldBlur("upiId")}
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.upiId && validationErrors.upiId
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={50}
                              placeholder="e.g., user@upi"
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.upiId || "-"}
                            </p>
                          )}
                          {fieldTouched.upiId && validationErrors.upiId && (
                            <p className="text-xs text-red-500 mt-1">
                              {validationErrors.upiId}
                            </p>
                          )}
                        </div>
                        {/* UPI Contact Name - Editable */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            UPI Contact Name
                          </label>
                          {isPageInEditMode ? (
                            <input
                              type="text"
                              value={formData.bank.upiContactName}
                              onChange={(e) =>
                                handleInputChange(
                                  "bank",
                                  "upiContactName",
                                  filterUPIContactName(e.target.value)
                                )
                              }
                              onBlur={() =>
                                handleBankFieldBlur("upiContactName")
                              }
                              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100 ${
                                fieldTouched.upiContactName &&
                                validationErrors.upiContactName
                                  ? "border-red-500"
                                  : ""
                              }`}
                              disabled={!isEditable}
                              maxLength={30}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.upiContactName || "-"}
                            </p>
                          )}
                          {fieldTouched.upiContactName &&
                            validationErrors.upiContactName && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.upiContactName}
                              </p>
                            )}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add the Pending Changes Modal */}
      {showPendingChangesModal && pendingChanges && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Field Changes
              </h3>
              <button
                onClick={() => setShowPendingChangesModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {/* Personal Information Changes */}
              {pendingChanges.personalInfo.map((field, index) => (
                <div
                  key={field.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">
                    {field.field}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      <p className="text-gray-800 break-words">
                        {field.oldValue || "(empty)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      <p className="text-green-700 break-words">
                        {field.newValue || "(empty)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Bank Details Changes */}
              {pendingChanges.bankDetails.map((field, index) => (
                <div
                  key={field.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">
                    {field.field}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      <p className="text-gray-800 break-words">
                        {field.oldValue || "(empty)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      <p className="text-green-700 break-words">
                        {field.newValue || "(empty)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Identity Document Changes */}
              {pendingChanges.identityDocuments.map((field, index) => (
                <div
                  key={field.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">
                    {field.field}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      <p className="text-gray-800 break-words">
                        {field.oldValue || "(empty)"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      <p className="text-green-700 break-words">
                        {field.newValue || "(empty)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {/* Document Updates */}
              {pendingChanges.documents.map((doc, index) => (
                <div
                  key={doc.field + index}
                  className="border rounded p-3 bg-gray-50 text-sm"
                >
                  <p className="font-medium text-gray-700 mb-1">{doc.field}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-gray-500">Old Value:</p>
                      {doc.isImage ? (
                        doc.oldValue ? (
                          <a
                            href={doc.oldValue}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={doc.oldValue}
                              alt={`Old ${doc.field}`}
                              className="h-16 rounded border"
                            />
                          </a>
                        ) : (
                          <span className="italic text-gray-400">(empty)</span>
                        )
                      ) : (
                        <p className="text-gray-800 break-words">
                          {doc.oldValue || "(empty)"}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Value:</p>
                      {doc.isImage ? (
                        doc.newValue ? (
                          <a
                            href={doc.newValue}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={doc.newValue}
                              alt={`New ${doc.field}`}
                              className="h-16 rounded border"
                            />
                          </a>
                        ) : (
                          <span className="italic text-gray-400">(empty)</span>
                        )
                      ) : (
                        <p className="text-green-700 break-words">
                          {doc.newValue || "(empty)"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 text-right">
              <button
                onClick={() => setShowPendingChangesModal(false)}
                className="border border-gray-300 rounded px-4 py-1 text-sm hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Passbook Preview Modal */}
      {passbookPreview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {formData.bank.accountNumber ||
                employeeById?.bankDetails?.accountNumber
                  ? `Passbook Document - ${
                      formData.bank.accountNumber ||
                      employeeById?.bankDetails?.accountNumber
                    }`
                  : "Passbook Document Preview"}
              </h3>
              <button
                onClick={() => {
                  setPassbookPreview({ open: false, url: null, file: null });
                  setPdfControls({ rotate: 0, zoom: 1 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isPDF(passbookPreview.file || passbookPreview.url) ? (
              <>
                {/* PDF Toolbar */}
                <div className="flex items-center gap-4 mb-4 bg-gray-50 rounded-lg px-4 py-2">
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate - 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate + 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.max(0.5, c.zoom - 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(pdfControls.zoom * 100)}%
                  </span>
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.min(2, c.zoom + 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() => setPdfControls({ rotate: 0, zoom: 1 })}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
                    title="Reset"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <div className="flex-1"></div>
                  <a
                    href={passbookPreview.url}
                    download="passbook.pdf"
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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

                {/* PDF Preview Area */}
                <div className="flex-1 bg-gray-100 rounded-lg overflow-auto">
                  <div
                    className="flex justify-center items-center p-4"
                    style={{
                      minHeight: "400px",
                      transform: `rotate(${pdfControls.rotate}deg) scale(${pdfControls.zoom})`,
                      transition: "transform 0.2s",
                    }}
                  >
                    <iframe
                      src={`${passbookPreview.url}#toolbar=0`}
                      title="Passbook PDF"
                      className="w-full h-full min-h-[400px] border-none rounded"
                      style={{ background: "white" }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Image Preview */
              <div className="flex-1 flex justify-center items-center bg-gray-100 rounded-lg overflow-auto">
                <img
                  src={passbookPreview.url}
                  alt="Passbook preview"
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ID Proof Preview Modal */}
      {idProofPreview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {idProofPreview.title} Preview
              </h3>
              <button
                onClick={() => {
                  setIdProofPreview({
                    open: false,
                    url: null,
                    file: null,
                    title: "",
                  });
                  setPdfControls({ rotate: 0, zoom: 1 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isPDF(idProofPreview.file || idProofPreview.url) ? (
              <>
                {/* PDF Toolbar */}
                <div className="flex items-center gap-4 mb-4 bg-gray-50 rounded-lg px-4 py-2">
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate - 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate + 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.max(0.5, c.zoom - 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(pdfControls.zoom * 100)}%
                  </span>
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.min(2, c.zoom + 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() => setPdfControls({ rotate: 0, zoom: 1 })}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
                    title="Reset"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <div className="flex-1"></div>
                  <a
                    href={idProofPreview.url}
                    download={`${idProofPreview.title
                      .toLowerCase()
                      .replace(" ", "_")}.pdf`}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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

                {/* PDF Preview Area */}
                <div className="flex-1 bg-gray-100 rounded-lg overflow-auto">
                  <div
                    className="flex justify-center items-center p-4"
                    style={{
                      minHeight: "400px",
                      transform: `rotate(${pdfControls.rotate}deg) scale(${pdfControls.zoom})`,
                      transition: "transform 0.2s",
                    }}
                  >
                    <iframe
                      src={`${idProofPreview.url}#toolbar=0`}
                      title={`${idProofPreview.title} PDF`}
                      className="w-full h-full min-h-[400px] border-none rounded"
                      style={{ background: "white" }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Image Preview */
              <div className="flex-1 flex justify-center items-center bg-gray-100 rounded-lg overflow-auto">
                <img
                  src={idProofPreview.url}
                  alt={`${idProofPreview.title} preview`}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Uploaded ID Proof Preview Modal */}
      {uploadedIdProofPreview.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {uploadedIdProofPreview.title} Preview (Uploaded)
              </h3>
              <button
                onClick={() => {
                  setUploadedIdProofPreview({
                    open: false,
                    url: null,
                    file: null,
                    title: "",
                  });
                  setPdfControls({ rotate: 0, zoom: 1 });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isPDF(uploadedIdProofPreview.file) ? (
              <>
                {/* PDF Toolbar */}
                <div className="flex items-center gap-4 mb-4 bg-gray-50 rounded-lg px-4 py-2">
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate - 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({ ...c, rotate: c.rotate + 90 }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.max(0.5, c.zoom - 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <span className="text-sm text-gray-600 min-w-[60px] text-center">
                    {Math.round(pdfControls.zoom * 100)}%
                  </span>
                  <button
                    onClick={() =>
                      setPdfControls((c) => ({
                        ...c,
                        zoom: Math.min(2, c.zoom + 0.1),
                      }))
                    }
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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
                  <button
                    onClick={() => setPdfControls({ rotate: 0, zoom: 1 })}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
                    title="Reset"
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
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </button>
                  <div className="flex-1"></div>
                  <a
                    href={uploadedIdProofPreview.url}
                    download={uploadedIdProofPreview.file.name}
                    className="text-gray-600 hover:text-blue-600 p-2 rounded hover:bg-gray-100"
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

                {/* PDF Preview Area */}
                <div className="flex-1 bg-gray-100 rounded-lg overflow-auto">
                  <div
                    className="flex justify-center items-center p-4"
                    style={{
                      minHeight: "400px",
                      transform: `rotate(${pdfControls.rotate}deg) scale(${pdfControls.zoom})`,
                      transition: "transform 0.2s",
                    }}
                  >
                    <iframe
                      src={`${uploadedIdProofPreview.url}#toolbar=0`}
                      title={`${uploadedIdProofPreview.title} PDF`}
                      className="w-full h-full min-h-[400px] border-none rounded"
                      style={{ background: "white" }}
                    />
                  </div>
                </div>
              </>
            ) : (
              /* Image Preview */
              <div className="flex-1 flex justify-center items-center bg-gray-100 rounded-lg overflow-auto">
                <img
                  src={uploadedIdProofPreview.url}
                  alt={`${uploadedIdProofPreview.title} preview`}
                  className="max-w-full max-h-full object-contain rounded"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default withAuth(EmployeeProfilePage); 