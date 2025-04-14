import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchModules, addModule, updateModule, deleteModule } from "@/redux/slices/modulesSlice";
import { fetchCompanies } from "@/redux/slices/companiesSlice";
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
import { fetchUsers, addUser } from "@/redux/slices/usersSlice";
import SuperadminHeaders from "@/components/SuperadminHeaders";
import withAuth from "@/components/withAuth";
import axios from 'axios';

function SuperadminModules() {
  const dispatch = useDispatch();
  const [searchInput, setSearchInput] = useState("");
  const { modules = [], loading, err } = useSelector((state) => state.modules);
  const { users } = useSelector((state) => state.users);
  const { companies } = useSelector((state) => state.companies);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [companyUsers, setCompanyUsers] = useState([]);

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  useEffect(() => {
    dispatch(fetchModules());
    dispatch(fetchUsers());
    dispatch(fetchCompanies());
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
    setSelectedCompany(selectedModule.company);
    setSelectedAdmins(selectedModule.admins || []);
    setIsAddModuleOpen(true);
  };

  const handleDeleteModule = async () => {
    if (!selectedModule || !window.confirm("Are you sure you want to delete this module?")) return;
    const result = await dispatch(deleteModule(selectedModule._id));
    if (result.payload) {
      setSelectedModule(null);
    }
  };

  const fetchUsersByCompany = async (companyId) => {
    try {
      const response = await axios.get(`http://localhost:8083/superadmin/companies/${companyId}/users`);
      setCompanyUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching company users:', error);
      setCompanyUsers([]);
    }
  };

  const handleCompanyChange = async (value) => {
    const selected = companies.find((company) => company.id === value);
    setSelectedCompany(selected || null);
    setSelectedAdmins([]);
    if (selected) {
      await fetchUsersByCompany(selected.id);
    }
  };

  const handleAddOrUpdateModule = async () => {
    if (!moduleName || !moduleDescription || !selectedCompany || selectedAdmins.length === 0) {
      alert("Please fill in all fields and select at least one admin.");
      return;
    }

    const moduleData = {
      moduleName,
      description: moduleDescription,
      companyId: selectedCompany.id,
      userIds: selectedAdmins.map(admin => admin.id)
    };

    let result;
    if (isEditMode) {
      result = await dispatch(updateModule({ id: selectedModule._id, ...moduleData }));
    } else {
      result = await dispatch(addModule(moduleData));
    }

    if (result.payload) {
      setModuleName("");
      setModuleDescription("");
      setSelectedCompany(null);
      setSelectedAdmins([]);
      setCompanyUsers([]);
      setSelectedModule(null);
      setIsEditMode(false);
      setIsAddModuleOpen(false);
    }
  };

  const filteredModules = modules?.filter((module) =>
    module?.moduleName?.toLowerCase().includes(searchInput?.toLowerCase() || '')
  ) || [];

  // Helper function to get company name
  const getCompanyName = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : companyId;
  };

  // Helper function to get admin names
  const getAdminNames = (userIds) => {
    if (!userIds || !Array.isArray(userIds)) return '';
    return userIds.map(userId => {
      const user = users.find(u => u.id === userId);
      return user ? user.name : userId;
    }).join(', ');
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
                  !selectedModule ? 'opacity-20 pointer-events-none' : ''
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
                  !selectedModule ? 'opacity-20 pointer-events-none' : ''
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
            ) : err ? (
              <div className="text-center text-red-500 py-4">{err}</div>
            ) : (
              <div className="overflow-x-auto">
                <ClientOnlyTable>
                  <TableHeader className="shadow-md">
                    <TableRow className="bg-[#E2E8F0]">
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">Company</TableHead>
                      <TableHead className="w-1/4 px-6 py-4 text-left text-sm font-semibold text-gray-700">Admins</TableHead>
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
                          key={module._id}
                          className={`cursor-pointer ${
                            selectedModule?._id === module._id ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => setSelectedModule(module)}
                        >
                          <TableCell className="px-6 py-4">{module.moduleName}</TableCell>
                          <TableCell className="px-6 py-4">{module.description}</TableCell>
                          <TableCell className="px-6 py-4">{getCompanyName(module.companyId)}</TableCell>
                          <TableCell className="px-6 py-4">{getAdminNames(module.userIds)}</TableCell>
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
            <h2 className="text-2xl font-bold">{isEditMode ? 'Edit Module' : 'Add Module'}</h2>
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
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <Select
                onValueChange={handleCompanyChange}
                value={selectedCompany?.id}
              >
                <SelectTrigger className="bg-white text-gray-900 border border-gray-300">
                  {selectedCompany ? selectedCompany.name : "Select Company"}
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Admin Select */}
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
                      const selected = companyUsers.find((user) => user.id === value);
                      if (selected && !selectedAdmins.find(admin => admin.id === selected.id)) {
                        setSelectedAdmins([...selectedAdmins, selected]);
                      }
                    }
                  }}
                  disabled={!selectedCompany}
                >
                  <SelectTrigger className="bg-white text-gray-900 border border-gray-300">
                    {!selectedCompany 
                      ? "Select a company first" 
                      : selectedAdmins.length > 0 
                        ? `${selectedAdmins.length} admin(s) selected` 
                        : "Select Admins"}
                  </SelectTrigger>
                  <SelectContent>
                    {companyUsers.map((user) => (
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
                  <Button onClick={handleAddUser}>
                    Add Admin
                  </Button>
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
              {isEditMode ? 'Update' : 'Add'} Module
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(SuperadminModules);