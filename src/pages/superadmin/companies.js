import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "@/redux/slices/companiesSlice";
import { fetchModules } from "@/redux/slices/modulesSlice";
import { fetchEmployees, createEmployee } from "@/redux/slices/employeeSlice";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Search, UserPlus, Trash, Edit, Plus, Building2, Mail, Phone, Hash, MapPin, Briefcase, Users, Check, X, ArrowRight, ArrowLeft, Palette, Upload, Sparkles, Settings, Grid3X3, Table as LucideTable } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import React from "react"; // Added for React.Fragment

// Enhanced Modal Component for the 3-stage process
const StepperModal = ({ isOpen, onClose, children, title }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function SuperadminCompanies() {
  const router = useRouter();
  const deleteButtonRef = useRef(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    prefixForEmpID: "", // FIX: Consistent prefix field
    name: "",
    email: "",
    phone: "",
    gst: "",
    regAdd: "",
    colorCode: "#4F46E5",
    headOfCompanyId: null,
    logo: null,
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);

  const dispatch = useDispatch();
  const { companies, loading, err } = useSelector((state) => state.companies);
  const { employees } = useSelector((state) => state.employees);
  const [error, setError] = useState("");

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  // Add head of company related state
  const [isAddHeadOfCompanyModalOpen, setIsAddHeadOfCompanyModalOpen] = useState(false);
  const [newHeadOfCompanyData, setNewHeadOfCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });
  
  const handleOpenCompanyModal = (company = null) => {
    setCurrentStep(1);
    setLogoPreview(null);
    setError("");
    if (company) {
      setIsEditing(true);
      setSelectedCompany(company);
      setCompanyData({
        prefixForEmpID: company.prefixForEmpID || "", // FIX: Consistent prefix field
        name: company.name || "",
        email: company.email || "",
        phone: company.phone || "",
        gst: company.gst || "",
        regAdd: company.regAdd || "",
        colorCode: company.colorCode || "#4F46E5",
        headOfCompanyId: company.headOfCompany?.id || null,
        logo: company.logo || null
      });
      if (company.logo) setLogoPreview(company.logo);
    } else {
      setIsEditing(false);
      setSelectedCompany(null);
      setCompanyData({
        prefixForEmpID: "", // FIX: Consistent prefix field
        name: "", email: "", phone: "", gst: "", regAdd: "",
        colorCode: "#4F46E5", headOfCompanyId: null, logo: null
      });
    }
    setIsCompanyModalOpen(true);
  };

  // const handleInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setCompanyData((prevData) => {
  //     const updatedData = { ...prevData, [name]: value };

  //     // Auto-generate prefix if the company name is being updated
  //     if (name === "name" && value.length >= 3) {
  //       updatedData.prefixForEmpID = value.substring(0, 3).toUpperCase();
  //     }
  //     // Ensure prefix is always uppercase
  //     if (name === "prefixForEmpID") {
  //       updatedData.prefixForEmpID = value.toUpperCase();
  //     }

  //     return updatedData;
  //   });
  // };

  // Email validation function

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

    // Auto-generate prefix if the company name is being updated
    if (name === "name" && value.length >= 3) {
      updatedData.prefixForEmpID = value.substring(0, 3).toUpperCase();
    }

    // Ensure prefixForEmpID is always uppercase
    if (name === "prefixForEmpID") {
      updatedData.prefixForEmpID = value.toUpperCase();
    }

    // Ensure GST is always uppercase
    if (name === "gst") {
      updatedData.gst = value.toUpperCase();
    }

      return updatedData;
    });
};

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validatePhone = (phone) => {
    const regex = /^[0-9]{10}$/;
    return regex.test(phone);
  };

  const validateGST = (gst) => {
    const regex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return regex.test(gst);
  };

  const handleCreateAndNext = async () => {
    const { name, email, phone, gst, regAdd } = companyData;

    // Validate required fields
    if (!name || !email || !phone || !gst || !regAdd) {
      setError("All fields are required!");
      return;
    }
    setError("");

    // Validate phone number
    if (!validatePhone(phone)) {
      setError("Please enter a valid phone number.");
      return;
    }
    setError("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");

    // Validate GST
    if (!validateGST(gst)) {
      setError("Please enter a valid GST number.");
      return;
    }
    setError("");

    try {
    if (isEditing) {
        await dispatch(
          updateCompany({ 
            id: selectedCompany.companyId,
            updatedData: companyData 
          })
        );
      toast.success("Company updated successfully!");
        setCurrentStep(2);
    } else {
        const result = await dispatch(createCompany(companyData));
        if (createCompany.fulfilled.match(result)) {
      toast.success("Company created successfully!");
          setSelectedCompany(result.payload); // Store newly created company for step 2
          setCurrentStep(2);
        } else {
          toast.error(result.payload || "Failed to create company.");
        }
      }
      dispatch(fetchCompanies());
    } catch (error) {
      toast.error("Failed to save company data.");
    }
  };

  const handleFinishSetup = async () => {
    if (companyData.headOfCompanyId) {
      await dispatch(updateCompany({
        id: selectedCompany._id,
        updatedData: { headOfCompany: companyData.headOfCompanyId }
      }));
      toast.success("Head of Company assigned successfully!");
    } else {
      toast.info("No Head of Company was assigned. You can add one later.");
    }
    setIsCompanyModalOpen(false);
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) return;

    try {
      await dispatch(deleteCompany(selectedCompany.id)); // Delete from backend & Redux store
      dispatch(fetchCompanies()); // Refetch the updated list
      setIsDeleteConfirmationOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      toast.error("Failed to delete company.");
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );


  const predefinedColors = [
    "#B0E0E6", "#FFE4E1", "#F0E68C", "#E6E6FA", "#D1D5DB"
  ];

  const handleColorChange = (color) => {
    setCompanyData((prevData) => ({ ...prevData, colorCode: color }));
  };

  const handleHeadOfCompanyChange = (value) => {
    if (value === "add_new") {
      setIsAddHeadOfCompanyModalOpen(true);
    } else {
      setCompanyData((prevData) => ({ ...prevData, headOfCompanyId: value }));
    }
  };

  const handleNewHeadOfCompanyInputChange = (e) => {
    const { name, value } = e.target;
    setNewHeadOfCompanyData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleAddHeadOfCompany = async () => {
    if (!newHeadOfCompanyData.name || !newHeadOfCompanyData.email || !newHeadOfCompanyData.phone) {
      toast.error("All fields are required.");
      return;
    }

    // You would dispatch an action to create the employee
    const newHead = { id: Date.now(), ...newHeadOfCompanyData };
    // For demo, just add to a local list and select it.
    // In a real app, you'd dispatch(createEmployee(newHeadOfCompanyData)) and then
    // on success, fetch the new list of employees.
    
    toast.success("Head of Company created successfully!");
    setCompanyData((prev) => ({ ...prev, headOfCompanyId: newHead.id }));
    setIsAddHeadOfCompanyModalOpen(false);
    setNewHeadOfCompanyData({ name: "", email: "", phone: "" });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCompanyData(prev => ({ ...prev, logo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="bg-white text-[#4a4a4a] max-h-screen">
      <SuperadminHeaders />
      <div className="p-5">
        <div className="mt-6 p-4 rounded-lg bg-white">
          <div className="mt-4 p-4 rounded-lg flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 text-gray-800 border border-gray-500 rounded-lg bg-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500"
              />
            </div>
            <div className="flex space-x-10 mr-16">
              <div className="flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105">
                <UserPlus
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={() => handleOpenCompanyModal()}
                />
                <span className="text-xs text-[#4a4a4a]">Add</span>
          </div>
              <div
                ref={deleteButtonRef}
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  selectedCompany ? "" : "opacity-20 pointer-events-none"
                }`}
              >
                <Edit
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={() => handleOpenCompanyModal(selectedCompany)}
                />
                <span className="text-xs text-[#4a4a4a]">Edit</span>
                        </div>
              <div
                ref={deleteButtonRef}
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  selectedCompany ? "" : "opacity-20 pointer-events-none"
                }`}
              >
                <Trash
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={() => setIsDeleteConfirmationOpen(true)}
                />
                <span className="text-xs text-[#4a4a4a]">Delete</span>
                      </div>
                        </div>
                      </div>
          <div className="mt-4 p-2 rounded-lg">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : err ? (
              <div className="text-center text-red-500 py-4">{err}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-[#E2E8F0]">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        GST
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Register Add.
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-gray-700 tracking-wider w-1/5">
                        Company Prefix
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCompanies.map((company) => (
                      <tr 
                        key={company._id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedCompany?._id === company._id ? 'bg-gray-100' : ''
                        }`}
                        onClick={() => setSelectedCompany(company)}
                      >
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.name}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.email}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                              {company.phone}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                              {company.gst}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                            {company.regAdd}
                        </td>
                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                          {company.prefixForEmpID}
                        </td>
                      </tr>
                    ))}
              {filteredCompanies.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                          No companies found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
            </div>
              )}
            </div>
        </div>
      </div>

      <StepperModal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)}>
        <div className="flex flex-col h-full">
          {/* Modal Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEditing ? "Update Company" : "Create New Company"}
                  </h2>
                  <p className="text-gray-600 text-sm">Step {currentStep} of 2 - Complete all steps to finish</p>
                </div>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* 2-Stage Progress Bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                {[1, 2].map((step, index) => (
                  <React.Fragment key={step}>
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                        currentStep > step ? 'bg-green-500 text-white' : 
                        currentStep === step ? 'bg-blue-600 text-white' : 
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {currentStep > step ? <Check size={16} /> : step}
                      </div>
                      <div className="ml-3 text-sm">
                        <p className={`font-medium ${currentStep >= step ? 'text-blue-600' : 'text-gray-500'}`}>
                          {step === 1 && "Company Details"}
                          {step === 2 && "Leadership & Branding"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {step === 1 && "Basic information"}
                          {step === 2 && "Head of company & visual identity"}
                        </p>
                      </div>
                    </div>
                    {index < 1 && (
                      <div className={`flex-1 h-0.5 mx-4 transition-colors ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 px-8 py-6 overflow-y-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Column 1 */}
                    <div className="space-y-6">
                      {/* Company Name */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <div className="mt-1 relative">
                          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input name="name" value={companyData.name} onChange={handleInputChange} placeholder="e.g., Innovate Inc." className="pl-10" />
                        </div>
                      </div>
                      {/* Company Email */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Company Email</label>
                        <div className="mt-1 relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input name="email" type="email" value={companyData.email} onChange={handleInputChange} placeholder="e.g., contact@innovate.com" className="pl-10" />
                        </div>
                      </div>
                      {/* Phone Number */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="mt-1 relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input name="phone" value={companyData.phone} onChange={handleInputChange} placeholder="e.g., 9876543210" className="pl-10" />
                        </div>
                      </div>
                    </div>
                    {/* Column 2 */}
                    <div className="space-y-6">
                      {/* GST Number */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">GST Number</label>
                        <div className="mt-1 relative">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input name="gst" value={companyData.gst} onChange={handleInputChange} placeholder="e.g., 22AAAAA0000A1Z5" className="pl-10 uppercase" />
                        </div>
                      </div>
                      {/* Registered Address */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Registered Address</label>
                        <div className="mt-1 relative">
                          <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <textarea name="regAdd" value={companyData.regAdd} onChange={handleInputChange} placeholder="Company's full registered address" rows="3" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 transition resize-none"></textarea>
                        </div>
                      </div>
                      {/* Employee ID Prefix */}
                      <div>
                        <label className="text-sm font-medium text-gray-700">Employee ID Prefix</label>
                        <div className="mt-1 relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <Input name="prefixForEmpID" value={companyData.prefixForEmpID} onChange={handleInputChange} placeholder="Auto-generated or custom" className="pl-10 uppercase" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">First 3 letters of company name. Customize if needed.</p>
                      </div>
                    </div>
                  </div>
                )}
                {currentStep === 2 && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                     {/* Column 1: Leadership */}
                      <div className="space-y-6">
                       <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                         <Users size={20} />
                         Leadership
                        </h3>
                       <div>
                         <label className="text-sm font-medium text-gray-700">Head of Company</label>
                         <p className="text-xs text-gray-500 mb-2">Assign an employee as the main point of contact.</p>
                         <Select onValueChange={handleHeadOfCompanyChange} value={companyData.headOfCompanyId}>
                           <SelectTrigger className="w-full">
                             <SelectValue placeholder="Select an employee..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="add_new">
                               <div className="flex items-center gap-2">
                                 <Plus size={16} />
                                Add New Head of Company
                                </div>
                              </SelectItem>
                             {employees.map(emp => (
                               <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                       </div>
                     </div>

                     {/* Column 2: Branding */}
                     <div className="space-y-6">
                       <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 flex items-center gap-2">
                         <Sparkles size={20} />
                         Branding
                       </h3>
                       {/* Logo Upload */}
                       <div>
                         <label className="text-sm font-medium text-gray-700">Company Logo</label>
                         <div className="mt-2 flex items-center gap-6">
                           <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border">
                              {logoPreview ? (
                               <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                              ) : (
                               <Upload size={32} className="text-gray-400" />
                              )}
                            </div>
                           <label htmlFor="logo-upload" className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                             <span>Upload a file</span>
                             <input id="logo-upload" name="logo" type="file" className="sr-only" onChange={handleLogoChange} accept="image/*" />
                              </label>
                            </div>
                          </div>
                       {/* Theme Color */}
                       <div>
                         <label className="text-sm font-medium text-gray-700">Theme Color</label>
                         <div className="mt-2 flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full border-2 border-white shadow" style={{ backgroundColor: companyData.colorCode }} />
                           <div className="flex gap-2">
                             {predefinedColors.map(color => (
                               <button key={color} type="button" onClick={() => handleColorChange(color)} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${companyData.colorCode === color ? 'ring-2 ring-offset-2 ring-blue-600' : ''}`} style={{ backgroundColor: color }} />
                             ))}
                            <input
                              type="color"
                               value={companyData.colorCode}
                              onChange={(e) => handleColorChange(e.target.value)}
                               className="w-8 h-8 p-0 border-none rounded-full cursor-pointer"
                               style={{ backgroundColor: 'transparent' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between">
              <div>
              {currentStep === 2 && <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>}
              </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setIsCompanyModalOpen(false)}>Cancel</Button>
              {currentStep === 1 && <Button onClick={handleCreateAndNext}>{isEditing ? "Save & Next" : "Create & Next"}</Button>}
              {currentStep === 2 && <Button onClick={handleFinishSetup}>Finish Setup</Button>}
            </div>
          </div>
        </div>
      </StepperModal>

      <Modal isOpen={isAddHeadOfCompanyModalOpen} onClose={() => setIsAddHeadOfCompanyModalOpen(false)} title="Add New Head of Company">
        <div className="p-6 space-y-4">
           <p className="text-sm text-gray-600">Quickly add a new employee who will be assigned as the Head of Company.</p>
            <div>
             <label className="text-sm font-medium text-gray-700">Full Name</label>
             <Input name="name" value={newHeadOfCompanyData.name} onChange={handleNewHeadOfCompanyInputChange} placeholder="e.g., John Doe" />
            </div>
            <div>
             <label className="text-sm font-medium text-gray-700">Email Address</label>
             <Input name="email" type="email" value={newHeadOfCompanyData.email} onChange={handleNewHeadOfCompanyInputChange} placeholder="e.g., john.doe@company.com" />
            </div>
            <div>
             <label className="text-sm font-medium text-gray-700">Phone Number</label>
             <Input name="phone" value={newHeadOfCompanyData.phone} onChange={handleNewHeadOfCompanyInputChange} placeholder="e.g., 9876543210" />
            </div>
           <div className="pt-4 flex justify-end">
             <Button onClick={handleAddHeadOfCompany}>Add & Assign</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteConfirmationOpen}
        onClose={() => {
          setIsDeleteConfirmationOpen(false);
          setSelectedCompany(null);
        }}
      >
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
          <h3 className="text-xl font-semibold">
            Are you sure you want to delete this company?
          </h3>
          <div className="mt-4">
            <Button
              onClick={handleDeleteCompany}
              className="bg-red-600 text-white"
            >
              Yes, Delete
            </Button>
            <Button
              onClick={() => {
                setIsDeleteConfirmationOpen(false);
                setSelectedCompany(null);
              }}
              className="ml-4 bg-gray-600 text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminCompanies);