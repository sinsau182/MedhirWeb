import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import withAuth from "@/components/withAuth";
import HradminNavbar from "@/components/HradminNavbar";
import Sidebar from "@/components/Sidebar";
import { Badge } from "@/components/ui/badge";
import { UserMinus, UserPlus } from "lucide-react";
import { Modal } from "@/components/ui/modal";

// // Hardcoded users for testing
// const TEST_USERS = [
//   {
//     userId: 101,
//     name: "Alice Johnson",
//     email: "alice.j@techsolutions.com",
//     isAdmin: true, // Let's make Alice an admin initially for testing
//   },
//   {
//     userId: 102,
//     name: "Bob Williams",
//     email: "bob.w@techsolutions.com",
//     isAdmin: false,
//   },
//   {
//     userId: 103,
//     name: "Charlie Brown",
//     email: "charlie.b@techsolutions.com",
//     isAdmin: false,
//   },
//   {
//     userId: 201,
//     name: "Diana Miller",
//     email: "diana.m@globalservices.com",
//     isAdmin: false,
//   },
//   {
//     userId: 202,
//     name: "Ethan Davis",
//     email: "ethan.d@globalservices.com",
//     isAdmin: true, // Let's make Ethan an admin initially for testing
//   },
// ];

function AdminAccess() {
  const router = useRouter();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedAccessType, setSelectedAccessType] = useState(null);
  const [userToUnassign, setUserToUnassign] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAssignConfirmModalOpen, setIsAssignConfirmModalOpen] =
    useState(false);
  const [usersToAssignInfo, setUsersToAssignInfo] = useState([]);

  // Define available access types
  const ACCESS_TYPES = [
    { id: "hr_admin", label: "HR Admin Access" },
    // Add other access types here if needed in the future
  ];

  // API Utilities
  // const getAuthHeaders = () => {
  //   const token = getItemFromSessionStorage("token");
  //   if (!token) {
  //     router.push("/login?error=Please login to continue");
  //     return null;
  //   }
  //   return {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   };
  // };

  // const handleApiError = (error, customMessage = "Operation failed") => {
  //   console.error(customMessage, error);
  //   if (error.response?.status === 401) {
  //     router.push("/login?error=Session expired. Please login again");
  //   } else {
  //     setError(error.response?.data?.message || customMessage);
  //   }
  // };

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = getItemFromSessionStorage("token", null);
        const response = await axios.get(
          "http://localhost:8083/hradmin/companies/MED102",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data && Array.isArray(response.data)) {
          setCompanies(response.data); // Store the full company objects
          if (
            !response.data.some(
              (company) => company.companyName === selectedCompany
            )
          ) {
            setSelectedCompany(response.data[0].companyName); // Set default company if current selection is not in the list
          }
        }
      } catch (error) {
        toast.error("Error fetching companies:", error);
      }
    };

    fetchCompanies();
  }, []);

  // Fetch users for selected company
  const fetchUsers = async (companyId) => {
    try {
      setLoading(true);
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `http://localhost:8083/hradmin/companies/${companyId}/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data); // Store the full user objects
        setError("");
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle company selection
  const handleCompanyChange = (companyId) => {
    const selected = companies.find(
      (company) => company.companyId === companyId
    );
    if (selected) {
      setSelectedCompany(selected);
      setSelectedUsers([]);
      fetchUsers(companyId);
    }
  };

  // Handle user selection (for ASSIGNING)
  const handleUserSelectForAssign = (user) => {
    // Only allow selecting non-admins for assignment
    if (user.isAdmin) return;
    setSelectedUsers((prev) => {
      if (prev.includes(user.userId)) {
        return prev.filter((id) => id !== user.userId);
      } else {
        return [...prev, user.userId];
      }
    });
  };

  // Handle clicking an existing admin (for UNASSIGNING)
  const handleUserClickForUnassign = (user) => {
    if (user.isAdmin) {
      setUserToUnassign(user);
      setIsConfirmModalOpen(true);
    }
  };

  // Handle opening the assign confirmation modal
  const handleAssignAdmin = async () => {
    if (selectedUsers.length === 0 || !selectedAccessType) {
      setError("Please select at least one user and an access type");
      return;
    }

    // Get full user info for the modal
    const usersInfo = selectedUsers
      .map((userId) => users.find((u) => u.userId === userId))
      .filter((user) => user !== undefined); // Filter out potential undefined results

    setUsersToAssignInfo(usersInfo);
    setIsAssignConfirmModalOpen(true);
  };

  // New function to handle the actual assignment after confirmation
  const confirmAssignAdmin = async () => {
    if (usersToAssignInfo.length === 0 || !selectedAccessType) return;

    const userIdsToAssign = usersToAssignInfo.map((u) => u.userId);

    console.log(
      "Assigning admin access for users:",
      userIdsToAssign,
      "with access:",
      selectedAccessType,
      "in company:",
      selectedCompany.companyId
    );
    // Update local state to reflect assignment (for UI)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        userIdsToAssign.includes(user.userId)
          ? { ...user, isAdmin: true }
          : user
      )
    );
    setSuccessMessage("Admin access granted successfully! (Simulated)");
    setSelectedUsers([]);
    setSelectedAccessType(null); // Reset access type selection
    setError("");
    setIsAssignConfirmModalOpen(false); // Close the modal
    setUsersToAssignInfo([]); // Clear temp state
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Handle admin unassignment (Simulated)
  const handleUnassignAdmin = async () => {
    if (!userToUnassign) return;

    console.log(
      "Simulating unassigning admin access for user:",
      userToUnassign.userId
    );

    // Update local state to reflect unassignment (for UI)
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.userId === userToUnassign.userId
          ? { ...user, isAdmin: false }
          : user
      )
    );

    setSuccessMessage("Admin access revoked successfully! (Simulated)");
    setIsConfirmModalOpen(false);
    setUserToUnassign(null);
    setError("");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Filter users based on search input
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchInput.toLowerCase()) ||
      user.email.toLowerCase().includes(searchInput.toLowerCase())
  );


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <HradminNavbar />
        <main className="flex-1 px-6 pt-24 pb-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Grant Admin Access
              </h1>

              {/* Company Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Company
                </label>
                <Select onValueChange={handleCompanyChange}>
                  <SelectTrigger className="w-full">
                    {selectedCompany
                      ? selectedCompany.companyName
                      : "Select a company"}
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem
                        key={company.companyId}
                        value={company.companyId}
                      >
                        {company.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* User Search and Selection List */}
              {selectedCompany && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>

                  <div className="max-h-96 overflow-y-auto border rounded-lg">
                    {loading ? (
                      <div className="p-4 text-center text-gray-500">
                        Loading users...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No users found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.userId}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${
                              selectedUsers.includes(user.userId) &&
                              !user.isAdmin
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() =>
                              user.isAdmin
                                ? handleUserClickForUnassign(user)
                                : handleUserSelectForAssign(user)
                            }
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {user.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                              </div>
                              {user.isAdmin ? (
                                <Badge variant="destructive">HR Admin</Badge>
                              ) : selectedUsers.includes(user.userId) ? (
                                <div className="w-4 h-4 bg-blue-500 rounded-full" />
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedCompany(null);
                        setSelectedUsers([]);
                        setSearchInput("");
                        setSelectedAccessType(null);
                      }}
                    >
                      Cancel
                    </Button>
                    {selectedUsers.length > 0 && (
                      <Button
                        onClick={handleAssignAdmin}
                        disabled={!selectedCompany || !selectedAccessType}
                      >
                        Assign Admin Access
                      </Button>
                    )}
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="text-red-500 text-sm mt-2">{error}</div>
                  )}
                  {successMessage && (
                    <div className="text-green-500 text-sm mt-2">
                      {successMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal for Unassign */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
      >
        <div className="p-6 bg-white text-black rounded-lg shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <UserMinus className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">
            Confirm Unassign
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Are you sure you want to revoke HR Admin access for{" "}
            {userToUnassign?.name}?
          </p>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleUnassignAdmin}>
              Yes, Unassign
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Modal for Assign */}
      <Modal
        isOpen={isAssignConfirmModalOpen}
        onClose={() => setIsAssignConfirmModalOpen(false)}
      >
        <div className="p-6 bg-white text-black rounded-lg shadow-xl">
          <div className="flex items-center justify-center mb-4">
            <UserPlus className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold text-center mb-4">
            Confirm Assignment
          </h2>
          <p className="text-center text-gray-600 mb-2">
            Are you sure you want to grant{" "}
            <span className="font-medium">
              {ACCESS_TYPES.find((t) => t.id === selectedAccessType)?.label ||
                "Admin"}
            </span>{" "}
            access to the following user(s)?
          </p>
          <ul className="list-disc list-inside text-center text-gray-700 mb-6 max-h-40 overflow-y-auto">
            {usersToAssignInfo.map((user) => (
              <li key={user.userId}>{user.name}</li>
            ))}
          </ul>
          <div className="flex justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsAssignConfirmModalOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmAssignAdmin}>Yes, Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default withAuth(AdminAccess);
