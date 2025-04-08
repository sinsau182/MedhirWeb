import { useState, useEffect } from "react";
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
  FiMapPin,
} from "react-icons/fi";
import { FaCalendarCheck } from "react-icons/fa";
import { X } from "lucide-react";

function EmployeeProfilePage() {
  const router = useRouter();
  const { id } = router.query; // Get ID from URL query parameter

  const [loading, setLoading] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [employeeById, setEmployeeById] = useState(null); // Holds the fetched employee data
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    address: false,
    bank: false,
    documents: false,
    // Add other sections if they become editable
  });
  const [isEditable, setIsEditable] = useState(true); // Controls if editing is allowed based on updateStatus

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
      upiPhone: "",
      passbookDoc: null, // Stores File object or null/URL string
    },
    // Add statutory, salary etc. if they become editable
  });

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

  // --- Data Fetching ---
  const fetchByEmployeeId = async () => {
    const employeeIdToFetch = "emp123"; // Use ID from URL or default
    setLoading(true);
    console.log("Fetching employee data for ID:", employeeIdToFetch);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/id/${employeeIdToFetch}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Employee Data Received:", data);
      setEmployeeById(data);

      // Check update status to enable/disable editing
      if (data.updateStatus === "Pending") {
        setIsEditable(false);
        toast.info("An update request is pending. Editing is disabled.");
      } else {
        setIsEditable(true);
      }
    } catch (error) {
      console.error("Error fetching employee data:", error);
      toast.error(`Failed to fetch employee data: ${error.message}`);
      setEmployeeById(null); // Clear data on error
      setIsEditable(false); // Disable editing on fetch error
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount or when URL 'id' changes
  // Fetch data on component mount
  useEffect(() => {
    // Fetch data once when the component mounts
    // fetchByEmployeeId will use the id from the router if available,
    // or the default 'emp123' if id is undefined/falsy.
    fetchByEmployeeId();
  }, []); // Empty dependency array ensures this runs only on mount

  // --- Input Handling ---// Dependency on 'id' from router query

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
  const handleEdit = (section) => {
    if (!isEditable) {
      toast.error("Editing is disabled while an update request is pending.");
      return;
    }
    if (!employeeById) {
      toast.error("Employee data not loaded yet.");
      return;
    }

    try {
      // Pre-fill formData with existing data from employeeById when editing starts
      if (!isEditing[section]) {
        const currentData = employeeById;
        let sectionDataToPrefill = {};

        // Map fetched data (employeeById) to the structure of formData for pre-filling
        switch (section) {
          case "personal":
            sectionDataToPrefill = {
              employee: {
                ...formData.employee,
                fatherName: currentData?.fathersName || "",
                gender: currentData?.gender || "",
                phone1: currentData?.phone || "",
                phone2: currentData?.alternatePhone || "",
                email: { personal: currentData?.emailPersonal || "" },
                // Reset profileImage state if it's not a File (keep File if user selected one)
                profileImage:
                  formData.employee.profileImage instanceof File
                    ? formData.employee.profileImage
                    : null,
              },
            };
            break;
          case "address":
            sectionDataToPrefill = {
              employee: {
                ...formData.employee,
                currentAddress: currentData?.currentAddress || "",
                permanentAddress: currentData?.permanentAddress || "",
                profileImage:
                  formData.employee.profileImage instanceof File
                    ? formData.employee.profileImage
                    : null, // Preserve potential profile image change
              },
            };
            break;
          case "bank":
            sectionDataToPrefill = {
              bank: {
                ...formData.bank,
                accountNumber: currentData?.bankDetails?.accountNumber || "",
                accountHolderName:
                  currentData?.bankDetails?.accountHolderName || "",
                ifscCode: currentData?.bankDetails?.ifscCode || "",
                bankName: currentData?.bankDetails?.bankName || "",
                branchName: currentData?.bankDetails?.branchName || "",
                upiId: currentData?.bankDetails?.upiId || "",
                upiPhone: currentData?.bankDetails?.upiPhoneNumber || "", // Key from backend
                // Reset passbookDoc state if it's not a File
                passbookDoc:
                  formData.bank.passbookDoc instanceof File
                    ? formData.bank.passbookDoc
                    : null,
              },
            };
            break;
          case "documents":
            sectionDataToPrefill = {
              idProofs: {
                ...formData.idProofs,
                aadharNo: currentData?.idProofs?.aadharNo || "",
                panNo: currentData?.idProofs?.panNo || "",
                passport: currentData?.idProofs?.passport || "",
                drivingLicense: currentData?.idProofs?.drivingLicense || "",
                voterId: currentData?.idProofs?.voterId || "",
                // Reset potential file states here if you store them separately
              },
            };
            break;
        }
        console.log("Pre-filling section:", section, sectionDataToPrefill);
        setFormData((prev) => ({ ...prev, ...sectionDataToPrefill }));
      } else {
        // If canceling edit, potentially reset formData section to original or re-fetch?
        // For now, just toggle editing state. Re-fetching might be safer.
        // fetchByEmployeeId(); // Uncomment if you want to discard changes on cancel
      }

      setIsEditing((prev) => ({ ...prev, [section]: !prev[section] }));
    } catch (error) {
      console.error("Error in handleEdit:", error);
      toast.error("Failed to toggle edit mode");
    }
  };

  const handleSave = async (section) => {
    if (!isEditable) {
      toast.error("Cannot save while an update request is pending.");
      return;
    }
    if (!employeeById?.employeeId) {
      toast.error("Cannot save: Employee ID is missing.");
      return;
    }

    setLoading(true);
    try {
      let payload = { employeeId: employeeById.employeeId };
      let filesToUpload = {};

      switch (section) {
        case "personal":
          payload = {
            ...payload,
            // ONLY include allowed editable fields
            emailPersonal: formData.employee.email.personal,
            phone: formData.employee.phone1,
            // fathersName, gender, alternatePhone are NOT included
          };
          if (formData.employee.profileImage instanceof File) {
            filesToUpload.profileImage = formData.employee.profileImage; // Allowed
          }
          break;
        case "address":
          payload = {
            ...payload,
            // ONLY include allowed editable fields
            currentAddress: formData.employee.currentAddress,
            permanentAddress: formData.employee.permanentAddress,
          };
          break;
        case "bank":
          payload = {
            ...payload,
            // ONLY include allowed editable fields
            accountHolderName: formData.bank.accountHolderName,
            accountNumber: formData.bank.accountNumber,
            bankName: formData.bank.bankName,
            branchName: formData.bank.branchName,
            ifscCode: formData.bank.ifscCode,
            upiPhoneNumber: formData.bank.upiPhone,
            // upiId is NOT included
          };
          if (formData.bank.passbookDoc instanceof File) {
            filesToUpload.passbookImage = formData.bank.passbookDoc; // Allowed
          }
          break;
        case "documents":
          // Only includes file uploads for documents, text fields are not sent
          payload = {
            ...payload,
            // Text fields like aadharNo, panNo are NOT included
          };
          // Placeholder: Add logic to include ID document files IF they have been selected/changed
          // const idFiles = { aadharImage: formData.idProofs.aadharFile, panImage: formData.idProofs.panFile, ... };
          // Object.entries(idFiles).forEach(([key, file]) => {
          //   if (file instanceof File) { // Ensure key matches backend expectation
          //     filesToUpload[key] = file;
          //   }
          // });
          break;
      }

      // Create FormData for the request
      const formDataPayload = new FormData();

      // Only add updateRequest if there are text fields to update OR files to upload for this section
      const hasTextFieldUpdates = Object.keys(payload).length > 1; // More than just employeeId
      const hasFileUploads = Object.keys(filesToUpload).length > 0;

      if (!hasTextFieldUpdates && !hasFileUploads) {
        toast.info("No changes detected for this section.");
        setLoading(false);
        // Optionally toggle editing mode off
        // setIsEditing(prev => ({ ...prev, [section]: false }));
        return;
      }

      formDataPayload.append("updateRequest", JSON.stringify(payload));

      Object.entries(filesToUpload).forEach(([key, file]) => {
        if (file instanceof File) {
          console.log(`Appending file: ${key}, Name: ${file.name}`);
          formDataPayload.append(key, file);
        }
      });

      console.log("Submitting update request for section:", section);
      console.log("Payload (JSON part):", payload);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/update-request`,
        {
          method: "PUT",
          body: formDataPayload,
        }
      );

      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.warn("Response was not JSON, reading as text.");
        result = { message: await response.text() };
      }
      console.log("API Response:", response.status, result);

      if (response.ok) {
        toast.success(
          result.message || "Update request submitted successfully."
        );
        setIsEditing((prev) => ({ ...prev, [section]: false }));
        fetchByEmployeeId();
      } else {
        toast.error(result.message || `Failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Error saving ${section}:`, error);
      toast.error(`Failed to submit update request for ${section}.`);
    } finally {
      setLoading(false);
    }
  };

  // --- Logout ---
  const handleLogout = () => {
    localStorage.removeItem("token"); // Assuming token is stored in localStorage
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

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <HradminNavbar />

        {/* Main Content Area */}
        <main className="p-6 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* --- Profile Card --- */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Profile Header */}
              <div className="relative h-64 bg-gradient-to-r from-blue-600 to-blue-700">
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
                          <button
                            onClick={() => router.push("/settings")} // Example route
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                          >
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
                          ) : employeeById?.profileImgUrl ? (
                            <img
                              src={employeeById.profileImgUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FiUser className="w-16 h-16 text-gray-300" />
                          )}
                        </div>
                      </div>
                      {/* Profile Image Upload Input - only visible/enabled when editing personal info */}
                      {isEditing.personal && (
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
                          <span>
                            {employeeById?.designation || "Designation"}
                          </span>
                          <span className="text-white/40">•</span>
                          <span>
                            {employeeById?.department || "Department"}
                          </span>
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
                      <div className="flex flex-col items-center bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-white">
                        <span className="text-xs text-white/80">
                          Reports to
                        </span>
                        <span className="font-medium">
                          {employeeById?.reportingManager || "-"}
                        </span>
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
              <div className="pt-10 px-14 pb-10 bg-gray-50">
                <div className="grid grid-cols-12 gap-8">
                  {/* --- Left Column --- */}
                  <div className="col-span-12 lg:col-span-5 space-y-6">
                    {/* Personal Information Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiUser className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Personal Information
                          </h3>
                        </div>
                        <button
                          onClick={() => handleEdit("personal")}
                          className={`text-sm font-medium flex items-center ${
                            isEditable
                              ? "text-blue-600 hover:text-blue-700"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={loading || !isEditable}
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
                        {/* Father's Name - Read Only Even in Edit Mode */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Father's Name
                          </label>
                          <p className="text-base text-gray-900">
                            {employeeById?.fathersName || "-"}
                          </p>
                        </div>
                        {/* Gender - Read Only Even in Edit Mode */}
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
                          {isEditing.personal ? (
                            <input
                              type="tel"
                              value={formData.employee.phone1}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "phone1",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              pattern="[0-9]{10}"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.phone || "-"}
                            </p>
                          )}
                        </div>
                        {/* Alternate Phone - Read Only Even in Edit Mode */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Alternate Phone
                          </label>
                          <p className="text-base text-gray-900">
                            {employeeById?.alternatePhone || "-"}
                          </p>
                        </div>
                        {/* Personal Email - Editable */}
                        <div className="col-span-2 bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Personal Email
                          </label>
                          {isEditing.personal ? (
                            <input
                              type="email"
                              value={formData.employee.email.personal}
                              onChange={(e) =>
                                handleNestedInputChange(
                                  "employee",
                                  "email",
                                  "personal",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900">
                              {employeeById?.emailPersonal || "-"}
                            </p>
                          )}
                        </div>
                        {/* Save Button */}
                        {isEditing.personal && (
                          <div className="col-span-2 flex justify-end mt-4">
                            <button
                              onClick={() => handleSave("personal")}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center"
                              disabled={loading || !isEditable}
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
                          <h3 className="text-lg font-semibold text-gray-800">
                            Address Information
                          </h3>
                        </div>
                        <button
                          onClick={() => handleEdit("address")}
                          className={`text-sm font-medium flex items-center ${
                            isEditable
                              ? "text-blue-600 hover:text-blue-700"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={loading || !isEditable}
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
                        {/* Current Address */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Current Address
                          </label>
                          {isEditing.address ? (
                            <textarea
                              value={formData.employee.currentAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "currentAddress",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              rows={3}
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900 mt-1">
                              {employeeById?.currentAddress || "-"}
                            </p>
                          )}
                        </div>
                        {/* Permanent Address */}
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                            Permanent Address
                          </label>
                          {isEditing.address ? (
                            <textarea
                              value={formData.employee.permanentAddress}
                              onChange={(e) =>
                                handleInputChange(
                                  "employee",
                                  "permanentAddress",
                                  e.target.value
                                )
                              }
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                              rows={3}
                              disabled={!isEditable}
                            />
                          ) : (
                            <p className="text-base text-gray-900 mt-1">
                              {employeeById?.permanentAddress || "-"}
                            </p>
                          )}
                        </div>
                        {/* Save Button */}
                        {isEditing.address && (
                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSave("address")}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center"
                              disabled={loading || !isEditable}
                            >
                              <FiCheck className="w-4 h-4 mr-2" />
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>{" "}
                  {/* End Left Column */}
                  {/* --- Right Column --- */}
                  <div className="col-span-12 lg:col-span-7 space-y-6">
                    {/* Bank and Statutory Info Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {" "}
                      {/* Adjusted grid for responsiveness */}
                      {/* Bank Information Card */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                          <div className="flex items-center">
                            <FiCreditCard className="w-5 h-5 text-blue-500 mr-2" />
                            <h3 className="text-lg font-semibold text-gray-800">
                              Bank Information
                            </h3>
                          </div>
                          <button
                            onClick={() => handleEdit("bank")}
                            className={`text-sm font-medium flex items-center ${
                              isEditable
                                ? "text-blue-600 hover:text-blue-700"
                                : "text-gray-400 cursor-not-allowed"
                            }`}
                            disabled={loading || !isEditable}
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
                          {/* Account Number - Editable */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              Account Number
                            </label>
                            {isEditing.bank ? (
                              <input
                                type="text"
                                value={formData.bank.accountNumber}
                                onChange={(e) =>
                                  handleInputChange(
                                    "bank",
                                    "accountNumber",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                disabled={!isEditable}
                              />
                            ) : (
                              <p className="text-base text-gray-900">
                                {employeeById?.bankDetails?.accountNumber ||
                                  "-"}
                              </p>
                            )}
                          </div>
                          {/* IFSC Code - Editable */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              IFSC Code
                            </label>
                            {isEditing.bank ? (
                              <input
                                type="text"
                                value={formData.bank.ifscCode}
                                onChange={(e) =>
                                  handleInputChange(
                                    "bank",
                                    "ifscCode",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                disabled={!isEditable}
                              />
                            ) : (
                              <p className="text-base text-gray-900">
                                {employeeById?.bankDetails?.ifscCode || "-"}
                              </p>
                            )}
                          </div>
                          {/* Bank Name - Editable */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              Bank Name
                            </label>
                            {isEditing.bank ? (
                              <input
                                type="text"
                                value={formData.bank.bankName}
                                onChange={(e) =>
                                  handleInputChange(
                                    "bank",
                                    "bankName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                disabled={!isEditable}
                              />
                            ) : (
                              <p className="text-base text-gray-900">
                                {employeeById?.bankDetails?.bankName || "-"}
                              </p>
                            )}
                          </div>
                          {/* UPI Phone - Editable */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              UPI Phone
                            </label>
                            {isEditing.bank ? (
                              <input
                                type="tel"
                                value={formData.bank.upiPhone}
                                onChange={(e) =>
                                  handleInputChange(
                                    "bank",
                                    "upiPhone",
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                pattern="[0-9]{10}"
                                placeholder="10-digit number"
                                disabled={!isEditable}
                              />
                            ) : (
                              <p className="text-base text-gray-900">
                                {employeeById?.bankDetails?.upiPhoneNumber ||
                                  "-"}
                              </p>
                            )}
                          </div>
                          {/* UPI ID - Read Only Even in Edit Mode */}
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              UPI ID
                            </label>
                            <p className="text-base text-gray-900">
                              {employeeById?.bankDetails?.upiId || "-"}
                            </p>
                          </div>
                          {/* Passbook Upload - Enabled in Edit Mode */}
                          <div className="border-t pt-4 mt-2">
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              Bank Passbook
                            </label>
                            {isEditing.bank ? (
                              <div>
                                {" "}
                                {/* File Upload UI */}
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
                                      handleInputChange(
                                        "bank",
                                        "passbookDoc",
                                        file
                                      );
                                    }
                                  }}
                                />
                                {formData.bank.passbookDoc instanceof File && (
                                  <div className="mt-2 flex items-center text-sm">
                                    <span className="text-gray-600 mr-2 truncate">
                                      {formData.bank.passbookDoc.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleInputChange(
                                          "bank",
                                          "passbookDoc",
                                          null
                                        )
                                      }
                                      className="text-red-500 hover:text-red-700"
                                      disabled={!isEditable}
                                    >
                                      {" "}
                                      <X className="w-4 h-4" />{" "}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Display View for Existing */
                              <div className="flex items-center justify-between mt-2 bg-gray-50 p-3 rounded-lg">
                                <p className="text-base text-gray-900 truncate">
                                  {employeeById?.bankDetails?.passbookImgUrl
                                    ? employeeById.bankDetails.passbookImgUrl
                                        .split("/")
                                        .pop()
                                    : "Not uploaded"}
                                </p>
                                {employeeById?.bankDetails?.passbookImgUrl && (
                                  <a
                                    href={
                                      employeeById.bankDetails.passbookImgUrl
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                  >
                                    <FiEye className="w-4 h-4 mr-1" /> View
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                          {/* Save Button */}
                          {isEditing.bank && (
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => handleSave("bank")}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center"
                                disabled={loading || !isEditable}
                              >
                                <FiCheck className="w-4 h-4 mr-2" /> Save
                                Changes
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Statutory Information Card (Read-only) */}
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                          <FiShield className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Statutory Information
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
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

                    {/* ID Proofs Card */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <FiBook className="w-5 h-5 text-blue-500 mr-2" />
                          <h3 className="text-lg font-semibold text-gray-800">
                            Identity Documents
                          </h3>
                        </div>
                        <button
                          onClick={() => handleEdit("documents")}
                          className={`text-sm font-medium flex items-center ${
                            isEditable
                              ? "text-blue-600 hover:text-blue-700"
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={loading || !isEditable}
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {" "}
                        {/* Responsive grid */}
                        {[
                          {
                            label: "Aadhar No.",
                            key: "aadharNo",
                            imgUrlKey: "aadharImgUrl",
                            fileKey: "aadharImage",
                          },
                          {
                            label: "PAN No.",
                            key: "panNo",
                            imgUrlKey: "pancardImgUrl",
                            fileKey: "panImage",
                          }, // Note backend key difference
                          {
                            label: "Passport",
                            key: "passport",
                            imgUrlKey: "passportImgUrl",
                            fileKey: "passportImage",
                          },
                          {
                            label: "Driving License",
                            key: "drivingLicense",
                            imgUrlKey: "drivingLicenseImgUrl",
                            fileKey: "drivingLicenseImage",
                          },
                          {
                            label: "Voter ID",
                            key: "voterId",
                            imgUrlKey: "voterIdImgUrl",
                            fileKey: "voterIdImage",
                          },
                        ].map(({ label, key, imgUrlKey, fileKey }) => (
                          <div
                            key={key}
                            className="bg-gray-50 p-3 rounded-lg space-y-1"
                          >
                            <label className="text-sm text-gray-600 mb-1.5 block font-medium">
                              {label}
                            </label>
                            {isEditing.documents ? ( // Input field for number
                              <input
                                type="text"
                                value={formData.idProofs[key] || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    "idProofs",
                                    key,
                                    e.target.value
                                  )
                                }
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white disabled:bg-gray-100"
                                disabled={!isEditable}
                              />
                            ) : (
                              // Display number
                              <p className="text-base text-gray-900">
                                {employeeById?.idProofs?.[key] || "-"}
                              </p>
                            )}
                            {/* File Upload / View */}
                            <div className="pt-2 border-t border-gray-200 mt-2">
                              {isEditing.documents ? (
                                <div>
                                  <label
                                    htmlFor={`upload-${key}`}
                                    className={`inline-flex items-center px-3 py-1 border border-gray-300 rounded text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                                      isEditable
                                        ? "cursor-pointer"
                                        : "opacity-50 cursor-not-allowed"
                                    }`}
                                  >
                                    <FiUpload className="w-3 h-3 mr-1" /> Upload
                                  </label>
                                  <input
                                    type="file"
                                    id={`upload-${key}`}
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    disabled={!isEditable}
                                    onChange={(e) => {
                                      console.warn(
                                        `File input change for ${key} not fully implemented for state update.`
                                      );
                                      // TODO: Implement state update to store this file for handleSave
                                      // E.g., handleInputChange('idProofsFiles', fileKey, e.target.files[0]);
                                    }}
                                  />
                                </div>
                              ) : employeeById?.[imgUrlKey] ? (
                                <a
                                  href={employeeById[imgUrlKey]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  <FiEye className="w-4 h-4 mr-1" /> View
                                  Document
                                </a>
                              ) : (
                                <p className="text-xs text-gray-500">
                                  No document
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {isEditing.documents && (
                        <div className="flex justify-end mt-4">
                          <button
                            onClick={() => handleSave("documents")}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50 flex items-center"
                            disabled={loading || !isEditable}
                          >
                            <FiCheck className="w-4 h-4 mr-2" /> Save Changes
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Salary Information Card (Read-only) */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <div className="flex items-center mb-5 pb-3 border-b border-gray-100">
                        <FiDollarSign className="w-5 h-5 text-blue-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">
                          Salary Information
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                        {" "}
                        {/* Responsive grid */}
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
                  </div>{" "}
                  {/* End Right Column */}
                </div>{" "}
                {/* End Grid */}
              </div>{" "}
              {/* End Profile Info Section */}
            </div>{" "}
            {/* End Profile Card */}
          </div>{" "}
          {/* End max-w-7xl */}
        </main>
      </div>{" "}
      {/* End flex-1 div */}
    </div>
  );
}

export default withAuth(EmployeeProfilePage);
