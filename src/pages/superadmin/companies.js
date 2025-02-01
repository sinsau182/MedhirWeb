import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import SuperadminNavbar from "@/components/SuperadminNavbar";
import { Input } from "@/components/ui/input";
import { Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from "@/components/ui/table";
import { Modal } from "@/components/ui/modal";
import { Search, UserPlus, Trash, Edit } from "lucide-react";
import dynamic from "next/dynamic";
import { fetchCompanies, createCompany, updateCompany, deleteCompany } from "@/utils/api";

export default function SuperadminCompanies() {
    const deleteButtonRef = useRef(null);
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [companyData, setCompanyData] = useState({
        name: "",
        email: "",
        phone: "",
        gst: "",
        regAdd: ""
    });
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [error, setError] = useState(""); // Error state
    const [emailError, setEmailError] = useState(""); // New state for email error

    const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

    useEffect(() => {
        const getCompanies = async () => {
            try {
                const fetchedCompanies = await fetchCompanies();
                setCompanies(fetchedCompanies);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        };
        getCompanies();
    }, []);

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
                regAdd: ""
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

    const handleSaveCompany = async () => {
        // Validation: Check if any input field is empty
        const { name, email, phone, gst, regAdd } = companyData;
        
        if (!name || !email || !phone || !gst || !regAdd) {
            setError("All fields are required!");
            return;
        } else {
            setError(""); // Clear any existing error
        }

        // Email validation
        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        } else {
            setEmailError(""); // Clear email error
        }

        try {
            if (isEditing && selectedCompany) {
                await updateCompany(selectedCompany._id, companyData);
                setCompanies(companies.map((c) => (c._id === selectedCompany._id ? { ...companyData, _id: c._id } : c)));
            } else {
                const createdCompany = await createCompany(companyData);
                setCompanies([...companies, createdCompany]);
            }
            setIsCompanyModalOpen(false);
        } catch (error) {
            console.error("Error saving company:", error);
        }
    };

    const handleSelectCompany = (company) => {
        if (selectedCompany && selectedCompany._id === company._id) {
            setSelectedCompany(null);
        } else {
            setSelectedCompany(company);
        }
    };

    const handleDeleteCompany = async () => {
        if (!selectedCompany) return;
    
        try {
            await deleteCompany(selectedCompany._id);
            setCompanies((prevCompanies) => prevCompanies.filter((company) => company._id !== selectedCompany._id));
            setIsDeleteConfirmationOpen(false);
            setSelectedCompany(null);
        } catch (error) {
            console.error("Error deleting company:", error);
        }
    };

    return (
        <div className="bg-white text-black min-h-screen">
            <header className="fixed top-0 left-0 w-full bg-gray-100 shadow-md px-8 py-4 flex justify-between items-center z-50">
                <div className="flex flex-row items-baseline space-x-20">
                    <h1 className="text-2xl font-bold text-black">MEDHIR</h1>
                    <h2 className="text-lg font-normal text-gray-700">Welcome, SuperAdmin</h2>
                </div>
                <Button className="bg-green-600 hover:bg-green-500 text-white">Logout</Button>
            </header>

            <div className="h-16" />

            <div className="p-8">
                <SuperadminNavbar />
                <div className="mt-6 p-4 rounded-lg">
                    <div className="mt-4 bg-gray-200 p-4 rounded-lg flex justify-between items-center">
                        <div className="relative w-1/3">
                            <Input placeholder="Search" className="w-full bg-gray-100 text-black border border-gray-300 pr-10" />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                        </div>
                        <div className="flex space-x-10 mr-16">
                            <div className="flex flex-col items-center cursor-pointer">
                                <UserPlus size={32} className="text-black p-1 rounded-md" onClick={() => handleOpenCompanyModal()} />
                                <span className="text-xs text-black">Add</span>
                            </div>
                            <div ref={deleteButtonRef} className={`flex flex-col items-center cursor-pointer ${selectedCompany ? "" : "opacity-20 pointer-events-none"}`}>
                                <Edit size={32} className="text-black p-1 rounded-md" onClick={() => handleOpenCompanyModal(selectedCompany)} />
                                <span className="text-xs text-black">Edit</span>
                            </div>
                            <div ref={deleteButtonRef} className={`flex flex-col items-center cursor-pointer ${selectedCompany ? "" : "opacity-20 pointer-events-none"}`}>
                                <Trash size={32} className="text-black p-1 rounded-md" onClick={() => setIsDeleteConfirmationOpen(true)} />
                                <span className="text-xs text-black">Delete</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-300 p-2 rounded-lg">
                        <ClientOnlyTable>
                            <Table className="company-table">
                                <TableHead>
                                    <TableHeader>Name</TableHeader>
                                </TableHead>
                                <TableHead>
                                    <TableHeader>Email</TableHeader>
                                </TableHead>
                                <TableHead>
                                    <TableHeader>Phone</TableHeader>
                                </TableHead>
                                <TableHead>
                                    <TableHeader>GST</TableHeader>
                                </TableHead>
                                <TableHead>
                                    <TableHeader>Register Add.</TableHeader>
                                </TableHead>
                                <TableBody>
                                    {companies.map((company) => (
                                        <TableRow
                                            key={company._id}
                                            onClick={() => handleSelectCompany(company)}
                                            className={`cursor-pointer hover:bg-gray-200 ${selectedCompany && selectedCompany._id === company._id ? "bg-blue-100" : ""}`}
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

            <Modal isOpen={isCompanyModalOpen} onClose={() => {
                setIsCompanyModalOpen(false);
                setSelectedCompany(null);
            }}>
                <div className="p-6 bg-gray-200 text-black rounded-lg flex flex-col items-center justify-center">
                    <div className="relative w-full flex justify-center -mt-4">
                        <h2 className="text-2xl font-bold">{isEditing ? "Update" : "Add"} Company</h2>
                        <button
                            onClick={() => {
                                setIsCompanyModalOpen(false);
                                setSelectedCompany(null);
                            }}
                            className="absolute right-0 text-gray-500 hover:text-gray-800 mt-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="mt-4 bg-gray-100 text-black border border-gray-300"
                    />
                    <Input
                        name="email"
                        value={companyData.email}
                        onChange={handleInputChange}
                        placeholder="Email"
                        className="mt-4 bg-gray-100 text-black border border-gray-300"
                    />
                    {emailError && <p className="text-red-600 mt-2">{emailError}</p>} {/* Show email error message */}
                    <Input
                        name="phone"
                        value={companyData.phone}
                        onChange={handleInputChange}
                        placeholder="Phone"
                        className="mt-4 bg-gray-100 text-black border border-gray-300"
                    />
                    <Input
                        name="gst"
                        value={companyData.gst}
                        onChange={handleInputChange}
                        placeholder="GST"
                        className="mt-4 bg-gray-100 text-black border border-gray-300"
                    />
                    <Input
                        name="regAdd"
                        value={companyData.regAdd}
                        onChange={handleInputChange}
                        placeholder="Register Address"
                        className="mt-4 bg-gray-100 text-black border border-gray-300"
                    />
                    {error && <p className="text-red-600 mt-2">{error}</p>} {/* Show general error message */}
                    <Button onClick={() => {
                        handleSaveCompany();
                        setSelectedCompany(null);
                    }} className="mt-6 bg-green-600 text-white">
                        {isEditing ? "Update" : "Add"} Company
                    </Button>
                </div>
            </Modal>

            <Modal isOpen={isDeleteConfirmationOpen} onClose={() => {
                setIsDeleteConfirmationOpen(false);
                setSelectedCompany(null);
            }}>
                <div className="p-6 bg-gray-200 text-black rounded-lg flex flex-col items-center justify-center">
                    <h3 className="text-xl font-semibold">Are you sure you want to delete this company?</h3>
                    <div className="mt-4">
                        <Button onClick={handleDeleteCompany} className="bg-red-600 text-white">
                            Yes, Delete
                        </Button>
                        <Button onClick={() => {
                            setIsDeleteConfirmationOpen(false);
                            setSelectedCompany(null);
                        }} className="ml-4 bg-gray-600 text-white">
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
