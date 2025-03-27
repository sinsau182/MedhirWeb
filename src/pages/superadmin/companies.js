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
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Search, UserPlus, Trash, Edit, Grid2x2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FaBuilding, FaCog, FaUserCircle } from "react-icons/fa"; // Import the icons
import { useRouter } from "next/router";
import withAuth from "@/components/withAuth";
import SuperadminHeaders from "@/components/SuperadminHeaders";

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
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dispatch = useDispatch();
  const { companies, loading, err } = useSelector((state) => state.companies);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchCompanies());

    if (err) {
      toast.error("Operation Failed: " + err);
    }
  }, [dispatch, err]);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchInput, setSearchInput] = useState("");

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  const handleOpenCompanyModal = (company = null) => {
    setSelectedCompany(company);
    if (company) {
      setIsEditing(true); // Set the state to editing if a company is selected for update
      setCompanyData({ ...company });
    } else {
      setIsEditing(false); // Reset to adding mode
      setCompanyData({
        name: "",
        email: "",
        phone: "",
        gst: "",
        regAdd: "",
      });
    }
    setIsCompanyModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData((prevData) => ({ ...prevData, [name]: value }));
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
      if (isEditing) {
        // Dispatch update action with Redux
        await dispatch(
          updateCompany({ id: selectedCompany.id, updatedData: companyData })
        );
      } else {
        // Dispatch create action with Redux
        await dispatch(createCompany(companyData));
      }

      // Refetch updated list
      dispatch(fetchCompanies());

      // Close modal and reset selection
      setIsCompanyModalOpen(false);
      setSelectedCompany(null);
    } catch (error) {
      console.log("Error saving company:", error);
    }
  };

  const handleSelectCompany = (company) => {
    if (selectedCompany && selectedCompany.id === company.id) {
      setSelectedCompany(null);
    } else {
      setSelectedCompany(company);
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
      console.error("Error deleting company:", error);
    }
  };

  const filteredCompanies = companies.filter((company) =>
    company?.name?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="bg-white text-black min-h-screen">
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
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
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
            <ClientOnlyTable>
              <Table className="w-full border border-gray-300 rounded-lg shadow-md">
                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-700 font-medium">
                    Name
                  </TableHeader>
                </TableHead>

                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-700 font-medium">
                    Email
                  </TableHeader>
                </TableHead>

                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-700 font-medium">
                    Phone
                  </TableHeader>
                </TableHead>

                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-700 font-medium">
                    GST
                  </TableHeader>
                </TableHead>

                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-700 font-medium">
                    Register Add.
                  </TableHeader>
                </TableHead>

                <TableBody>
                  {filteredCompanies.map((company, index) => (
                    <TableRow
                      key={company.id}
                      onClick={() => handleSelectCompany(company)}
                      className={`cursor-pointer hover:bg-gray-100 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                      } ${
                        selectedCompany && selectedCompany.id === company.id
                          ? "bg-gray-200"
                          : ""
                      }`}
                    >
                      <TableCell>{company.name}</TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>{company.phone}</TableCell>
                      <TableCell>{company.gst}</TableCell>
                      <TableCell>{company.regAdd}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ClientOnlyTable>
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
        <div className="p-6 bg-gray-200 text-[#4a4a4a] rounded-lg flex flex-col items-center justify-center">
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

          <Input
            name="name"
            value={companyData.name}
            onChange={handleInputChange}
            placeholder="Name"
            className="mt-4 bg-gray-100 text-[#4a4a4a] border border-gray-300"
          />
          <Input
            name="email"
            value={companyData.email}
            onChange={handleInputChange}
            placeholder="Email"
            className="mt-4 bg-gray-100 text-[#4a4a4a] border border-gray-300"
          />
          {/* Show email error message */}
          <Input
            name="phone"
            value={companyData.phone}
            onChange={handleInputChange}
            placeholder="Phone"
            className="mt-4 bg-gray-100 text-[#4a4a4a] border border-gray-300"
          />
          <Input
            name="gst"
            value={companyData.gst}
            onChange={handleInputChange}
            placeholder="GST"
            className="mt-4 bg-gray-100 text-[#4a4a4a] border border-gray-300"
          />
          <Input
            name="regAdd"
            value={companyData.regAdd}
            onChange={handleInputChange}
            placeholder="Register Address"
            className="mt-4 bg-gray-100 text-[#4a4a4a] border border-gray-300"
          />
          {error && <p className="text-red-600 mt-2">{error}</p>}{" "}
          {/* Show general error message */}
          <Button
            onClick={() => {
              handleSaveCompany();
              setSelectedCompany(null);
            }}
            className="mt-6 bg-green-600 text-white"
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
    </div>
  );
}

export default withAuth(SuperadminCompanies);

