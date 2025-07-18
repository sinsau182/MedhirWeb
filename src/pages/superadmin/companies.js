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
import { Input } from "@/components/ui/input";
import {
  Table,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Search, UserPlus, Trash, Edit, ChevronDown, User } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";


function SuperadminCompanies() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Companies");
  const deleteButtonRef = useRef(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
    useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [companyData, setCompanyData] = useState({
    name: "",
    email: "",
    phone: "",
    gst: "",
    regAdd: "",
    companyHeads: [] // Changed from companyHead to companyHeads array
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
  });
  const [companyHeadError, setCompanyHeadError] = useState("");

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
  const [searchInput, setSearchInput] = useState("");

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

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
        });
      } else {
        setCompanyHeadData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
          phone: "",
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
      });
    }
    setIsCompanyModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => {
      const updatedData = { ...prevData, [name]: value };

      // Auto-generate prefix if the company name is being updated
      if (name === "name" && value.length >= 3) {
        updatedData.prefixForEmpID = value.substring(0, 3).toUpperCase();
      }
      // Ensure prefix is always uppercase
      if (name === "prefixForEmpID") {
        updatedData.prefixForEmpID = value.toUpperCase();
      }

      return updatedData;
    });
  };

  // Email validation function
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

  const handleSaveCompany = async () => {
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
      // Prepare company data in the required format
      const requestBody = {
        company: {
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          gst: companyData.gst,
          regAdd: companyData.regAdd,
          prefixForEmpID: companyData.prefixForEmpID,
          colorCode: companyData.colorCode
        },
        companyHeads: companyData.companyHeads && companyData.companyHeads.length > 0 ? companyData.companyHeads : []
      };

      if (isEditing) {
        // Dispatch update action with Redux
        await dispatch(
          updateCompany({ 
            id: selectedCompany.companyId, // Handle both id formats
            updatedData: requestBody 
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
      });
    } else {
      setCompanyHeadData({
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        phone: "",
      });
    }
    setCompanyHeadError("");
    setIsCompanyHeadModalOpen(true);
  };

  const handleCompanyHeadInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyHeadData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateCompanyHeadData = () => {
    if (!companyHeadData.firstName?.trim()) {
      setCompanyHeadError("First Name is required");
      return false;
    }
    if (!companyHeadData.lastName?.trim()) {
      setCompanyHeadError("Last Name is required");
      return false;
    }
    if (!companyHeadData.email?.trim()) {
      setCompanyHeadError("Email is required");
      return false;
    }
    if (!companyHeadData.phone?.trim()) {
      setCompanyHeadError("Phone is required");
      return false;
    }
    
    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(companyHeadData.email)) {
      setCompanyHeadError("Please enter a valid email address");
      return false;
    }
    
    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(companyHeadData.phone)) {
      setCompanyHeadError("Please enter a valid 10-digit phone number");
      return false;
    }
    
    setCompanyHeadError("");
    return true;
  };

  const handleSaveCompanyHead = () => {
    if (validateCompanyHeadData()) {
      setCompanyData((prevData) => ({
        ...prevData,
        companyHeads: [{
          firstName: companyHeadData.firstName.trim(),
          middleName: companyHeadData.middleName.trim(),
          lastName: companyHeadData.lastName.trim(),
          email: companyHeadData.email,
          phone: companyHeadData.phone,
        }],
      }));
      setIsCompanyHeadModalOpen(false);
      setIsDropdownOpen(false);
      toast.success("Company Head added successfully!");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
                        Company Head
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
                          {company.companyHeads && company.companyHeads.length > 0 ? (
                            company.companyHeads.map((head, index) => (
                              <div key={index}>
                                {[head.firstName, head.middleName, head.lastName].filter(Boolean).join(" ")}
                              </div>
                            ))
                          ) : (
                            "No Company Head"
                          )}
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
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              value={companyData.name}
              onChange={handleInputChange}
              placeholder="Enter company name"
              className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
            />
          </div>
          
          <div>
            <label htmlFor="prefixForEmpID" className="block text-sm font-medium text-gray-700 mb-1">
              Company Prefix <span className="text-red-500">*</span>
            </label>
            <Input
              id="prefixForEmpID"
              name="prefixForEmpID"
              value={companyData.prefixForEmpID || ""}
              onChange={handleInputChange}
              placeholder="Enter company prefix"
              className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
            />
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
                    {companyData.companyHeads && companyData.companyHeads.length > 0
                      ? [companyData.companyHeads[0].firstName, companyData.companyHeads[0].middleName, companyData.companyHeads[0].lastName].filter(Boolean).join(" ")
                      : "Select Company Head"
                    }
                  </span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
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
                      <span className="text-blue-600 font-medium">{companyData.companyHeads && companyData.companyHeads.length > 0 ? "Edit Company Head" : "Add Company Head"}</span>
                    </div>
                  </div>
                  {companyData.companyHeads && companyData.companyHeads.length > 0 && (
                    <div
                      className="p-3 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setCompanyData((prevData) => ({ ...prevData, companyHeads: [] }));
                        setIsDropdownOpen(false);
                      }}
                    >
                      <div className="flex items-center space-x-2">
                        <Trash size={16} className="text-red-600" />
                        <span className="text-red-600">Remove Company Head</span>
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
                    companyData.colorCode === color ? "border-black" : "border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorChange(color)}
                ></div>
              ))}
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              name="email"
              value={companyData.email}
              onChange={handleInputChange}
              placeholder="Enter email address"
              className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              name="phone"
              value={companyData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
            />
          </div>
          
          <div>
            <label htmlFor="gst" className="block text-sm font-medium text-gray-700 mb-1">
              GST Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="gst"
              name="gst"
              value={companyData.gst}
              onChange={handleInputChange}
              placeholder="Enter GST number"
              className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
            />
          </div>
          
          <div>
            <label htmlFor="regAdd" className="block text-sm font-medium text-gray-700 mb-1">
              Registered Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="regAdd"
              name="regAdd"
              value={companyData.regAdd}
              onChange={handleInputChange}
              placeholder="Enter registered address"
              className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
            />
          </div>
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
        <div className="flex justify-center">
          <Button
            onClick={() => {
              handleSaveCompany();
              setSelectedCompany(null);
            }}
            className="mt-1 bg-blue-600 text-white"
          >
            {isEditing ? "Update" : "Add"} Company
          </Button>
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
          });
        }}
      >
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
          <div className="relative w-full flex justify-center -mt-4">
            <h2 className="text-2xl font-thin tracking-wide">
              {companyData.companyHeads && companyData.companyHeads.length > 0 ? "Edit Company Head" : "Add Company Head"}
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
                    placeholder="Enter first name"
                    className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Middle Name
                  </label>
                  <Input
                    name="middleName"
                    value={companyHeadData.middleName}
                    onChange={handleCompanyHeadInputChange}
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
                    placeholder="Enter last name"
                    className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="headEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                id="headEmail"
                name="email"
                type="email"
                value={companyHeadData.email}
                onChange={handleCompanyHeadInputChange}
                placeholder="Enter email address"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Email will be used as login ID</p>
            </div>
            
            <div>
              <label htmlFor="headPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <Input
                id="headPhone"
                name="phone"
                value={companyHeadData.phone}
                onChange={handleCompanyHeadInputChange}
                placeholder="Enter phone number"
                className="bg-gray-100 text-[#4a4a4a] border border-gray-300"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number will be used as password</p>
            </div>
          </div>
          
          {companyHeadError && <p className="text-red-600 mt-2">{companyHeadError}</p>}
          
          <Button
            onClick={handleSaveCompanyHead}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Add Company Head
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminCompanies);