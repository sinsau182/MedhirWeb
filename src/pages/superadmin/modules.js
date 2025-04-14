import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchModules,
  addModule,
  updateModule,
  deleteModule,
} from "@/redux/slices/modulesSlice";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
import { fetchUsers, addUser } from "@/redux/slices/usersSlice";

import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import dynamic from "next/dynamic";
import { Search, UserPlus, Edit, Trash } from "lucide-react";

import SuperadminHeaders from "@/components/SuperadminHeaders";
import withAuth from "@/components/withAuth";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { useRouter } from "next/router";

function SuperadminModules() {
  const router = useRouter();
  const dispatch = useDispatch();


  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);


  const [selectedModule, setSelectedModule] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);


  // const [selectedUser, setSelectedUser] = useState(null);


  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");


  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");


  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedAdmins, setSelectedAdmins] = useState([]);


  // const [companyUsers, setCompanyUsers] = useState([]);

  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  // Helper function to get auth headers
  // const getAuthHeaders = () => {
  //   const token = getItemFromSessionStorage("token");
  //   return {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   };
  // };

  const {
    modules,
    loading: modulesLoading,
    error: modulesError,
  } = useSelector((state) => state.modules);
  const {
    companies,
    loading: companiesLoading,
    error: companiesError,
  } = useSelector((state) => state.companies);
  const {
    users,
    loading: usersLoading,
    error: usersError,
  } = useSelector((state) => state.users);

  // console.log(selectedCompany);
console.log(selectedCompanyId);

  useEffect(() => {
    dispatch(fetchModules()); // Use Redux slice method to fetch modules
    dispatch(fetchCompanies()); // Use Redux slice method to fetch companies
    dispatch(fetchUsers()); // Use Redux slice method to fetch users
  }, [dispatch]);



  const handleOpenAddModule = () => {
    setIsEditMode(false);
    setSelectedModule(null);
    setSelectedCompany(null);
    setSelectedAdmins([]);
    setModuleName("");
    setModuleDescription("");
    setIsAddModuleOpen(true);
  };

  const handleEditModule = () => {
    if (!selectedModule) return;
    setIsEditMode(true);
    setModuleName(selectedModule.moduleName);
    setModuleDescription(selectedModule.description);
    setSelectedCompany(selectedModule.companyName);
    setSelectedAdmins(
      selectedModule.userNames?.map((name) => ({ name })) || []
    );
    setIsAddModuleOpen(true);
  };

  const handleDeleteModule = async () => {
    if (
      !selectedModule ||
      !window.confirm("Are you sure you want to delete this module?")
    )
      return;
    try {
      await dispatch(deleteModule(selectedModule.moduleId)).unwrap(); // Use Redux slice method to delete module
      setSelectedModule(null);
    } catch (err) {
      console.error("Error deleting module:", err);
      if (err.response?.status === 401) {
        router.push("/login?error=Session expired. Please login again");
      } else {
        alert("Failed to delete module");
      }
    }
  };

  // const fetchUsersByCompany = async (companyId) => {
  //   try {
  //     const response = await axios.get(
  //       `http://localhost:8083/superadmin/companies/${companyId}/users`,
  //       getAuthHeaders()
  //     );
  //     setCompanyUsers(response.data || []);
  //   } catch (error) {
  //     console.error('Error fetching company users:', error);
  //     if (error.response?.status === 401) {
  //       router.push("/login?error=Session expired. Please login again");
  //     }
  //     setCompanyUsers([]);
  //   }
  // };

  // Update handleCompanyChange
  const handleCompanyChange = (companyId) => {
    setSelectedCompany(companyId);
  };

  // Update handleAddOrUpdateModule
  const handleAddOrUpdateModule = async () => {
    if (
      !moduleName ||
      !moduleDescription ||
      !selectedCompany ||
      selectedAdmins.length === 0
    ) {
      alert("Please fill in all fields and select at least one admin.");
      return;
    }

    const moduleData = {
      moduleName,
      description: moduleDescription,
      companyId: selectedCompany.companyId, // Use companyId
      userIds: selectedAdmins.map((admin) => admin.userId),
    };

    try {
      if (isEditMode) {
        await dispatch(
          updateModule({ moduleId: selectedModule.moduleId, moduleData })
        ).unwrap(); // Use Redux slice method to update module
      } else {
        await dispatch(addModule(moduleData)).unwrap(); // Use Redux slice method to add module
      }

      setModuleName("");
      setModuleDescription("");
      setSelectedCompany(null);
      setSelectedAdmins([]);
      // setCompanyUsers([]);
      setSelectedModule(null);
      setIsEditMode(false);
      setIsAddModuleOpen(false);
    } catch (err) {
      console.error("Error saving module:", err);
      if (err.response?.status === 401) {
        router.push("/login?error=Session expired. Please login again");
      } else {
        alert("Failed to save module");
      }
    }
  };

  const filteredModules = modules.filter((module) =>
    module?.moduleName?.toLowerCase().includes(searchInput?.toLowerCase() || "")
  );

  const handleAddUser = async () => {
    if (!userName || !userEmail || !userPhone) {
      alert("Please fill in all fields.");
      return;
    }

    const userData = {
      name: userName,
      email: userEmail,
      phone: userPhone,
    };


    try {
      await dispatch(addUser(userData)).unwrap(); // Use Redux slice method to add user
      setUserName("");
      setUserEmail("");
      setUserPhone("");
      setIsAddUserOpen(false);
    } catch (err) {
      console.error("Error adding user:", err);
      if (err.response?.status === 401) {
        router.push("/login?error=Session expired. Please login again");
      } else {
        alert("Failed to add user");
      }
    }
  }

  
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
                  onClick={handleOpenAddModule}
                />
                <span className="text-xs text-[#4a4a4a]">Add</span>
              </div>
              <div
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  !selectedModule ? "opacity-20 pointer-events-none" : ""
                }`}
              >
                <Edit
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={handleEditModule}
                />
                <span className="text-xs text-[#4a4a4a]">Edit</span>
              </div>
              <div
                className={`flex flex-col items-center cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 ${
                  !selectedModule ? "opacity-20 pointer-events-none" : ""
                }`}
              >
                <Trash
                  size={32}
                  className="text-[#4a4a4a] p-1 rounded-md"
                  onClick={handleDeleteModule}
                />
                <span className="text-xs text-[#4a4a4a]">Delete</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-2 rounded-lg">
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500 py-4">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <ClientOnlyTable>
                  <TableHeader className="shadow-md">
                    <TableRow className="bg-[#E2E8F0]">
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Name
                      </TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Description
                      </TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Company
                      </TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Admins
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No modules found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredModules.map((module) => (
                        <TableRow
                          key={module.moduleId}
                          className={`cursor-pointer ${
                            selectedModule?.moduleId === module.moduleId
                              ? "bg-gray-100"
                              : ""
                          }`}
                          onClick={() => setSelectedModule(module)}
                        >
                          <TableCell className="px-6 py-4">
                            {module.moduleName}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {module.description}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {module.companyName}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {module.userNames.join(", ")}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </ClientOnlyTable>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Module Modal */}
      <Modal
        isOpen={isAddModuleOpen}
        onClose={() => {
          setIsAddModuleOpen(false);
          setIsAddUserOpen(false);
          setIsEditMode(false);
          setModuleName("");
          setModuleDescription("");
          setSelectedCompany(null);
          setSelectedAdmins([]);
        }}
      >
        <div className="p-6 bg-gray-200 text-black rounded-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {isEditMode ? "Edit Module" : "Add Module"}
            </h2>
            {isEditMode && (
              <button
                onClick={handleDeleteModule}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
              >
                Delete
              </button>
            )}
          </div>

          {/* Company Select */}
          <Select onValueChange={handleCompanyChange} value={selectedCompany}>
            <SelectTrigger className="bg-white text-gray-900 border border-gray-300 hover:border-blue-500 cursor-pointer">
              <span
                className={`${
                  !selectedCompany ? "text-gray-500" : "text-gray-900"
                }`}
              >
                {selectedCompany ? selectedCompany : "Select Company"}
              </span>
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem
                  key={company.companyId}
                  value={company.name}
                  className="cursor-pointer hover:bg-blue-50 transition-colors duration-150 py-2"
                >
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter module name"
              className="bg-white text-gray-900 border border-gray-300"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="Enter module description"
              className="bg-white text-gray-900 border border-gray-300"
              value={moduleDescription}
              onChange={(e) => setModuleDescription(e.target.value)}
            />
          </div>



          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Admins <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <Select
                  onValueChange={(value) => {
                    if (value === "addUser") {
                      setIsAddUserOpen(true);
                    } else {
                      const selectedUser = users.find((user) => user.id === value);
                      if (selectedUser && !selectedAdmins.some(admin => admin.id === selectedUser.id)) {
                        setSelectedAdmins((prevAdmins) => [...prevAdmins, selectedUser]);
                      } else {
                        alert("Admin already selected");
                      }
                    }
                  }}
                  value=""
                >
                  <SelectTrigger className="bg-white text-gray-900 border border-gray-300">
                    {!selectedCompany 
                      ? "Select a company first" 
                      : selectedAdmins.length > 0 
                        ? `${selectedAdmins.length} admin(s) selected` 
                        : "Select Admins"}
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem 
                        key={user.id} 
                        value={user.id}
                        disabled={selectedAdmins.some(admin => admin.id === user.id)}
                      >
                        {user.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="addUser" className="text-blue-600 font-semibold border-t">
                      + Add New Admin
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Selected Admins Tags */}
                {selectedAdmins.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md">
                    {selectedAdmins.map((admin) => (
                      <div
                        key={admin.id}
                        className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                      >
                        <span>{admin.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAdmins(selectedAdmins.filter(a => a.id !== admin.id));
                          }}
                          className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        {/* Add User Form */}
        {isAddUserOpen && (
          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter admin name"
                  className="bg-white text-gray-900 border border-gray-300"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter admin email"
                  className="bg-white text-gray-900 border border-gray-300"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter admin phone"
                  className="bg-white text-gray-900 border border-gray-300"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                />
              </div>

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>Add Admin</Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setIsAddModuleOpen(false);
              setIsEditMode(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAddOrUpdateModule}>
            {isEditMode ? "Update" : "Add"} Module
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminModules);
