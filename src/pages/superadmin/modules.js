import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchModules, addModule } from "@/redux/slices/modulesSlice"; // Adjust the import path as needed
// import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import SuperadminNavbar from "@/components/SuperadminNavbar";
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
import { Edit, Grid2X2, Search, Trash, UserPlus } from "lucide-react";
import { fetchUsers, addUser } from "@/redux/slices/usersSlice"; // Adjust the import path as needed
import Link from "next/link";
import { useRouter } from "next/router";
import Loader from "@/components/Loader";
import withAuth from "@/components/withAuth";
import { FaBuilding, FaUserCircle, FaCog } from "react-icons/fa"; // Import the icons

function SuperadminModules() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { modules, loading, error } = useSelector((state) => state.modules);
  const [activeTab, setActiveTab] = useState("Modules");
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [moduleName, setModuleName] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const { users } = useSelector((state) => state.users);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const ClientOnlyTable = dynamic(() => Promise.resolve(Table), { ssr: false });

  useEffect(() => {
    dispatch(fetchModules());
    dispatch(fetchUsers());
  }, [dispatch, users]);

  const handleOpenAddModule = () => {
    setSelectedUser(null);
    setIsAddModuleOpen(true);
  };

  const handleAddUser = () => {
    if (!newUser || !userEmail || !userPhone) {
      alert("Please fill in all fields.");
      return;
    }

    const userData = {
      name: newUser,
      email: userEmail,
      phone: userPhone,
    };

    dispatch(addUser(userData)); // Dispatch createUser action
    setIsAddUserOpen(false); // Close the Add User form

    // Clear the input fields
    setNewUser("");
    setUserEmail("");
    setUserPhone("");
  };

  const handleAddModule = () => {
    if (!moduleName || !moduleDescription || !selectedUser) {
      alert("Please fill in all fields.");
      return;
    }

    const moduleData = {
      moduleName,
      description: moduleDescription,
      userId: selectedUser.id,
    };

    dispatch(addModule(moduleData)); // Dispatch addModule action
    setIsAddModuleOpen(false); // Close the Add Module form

    // Clear the input fields
    setModuleName("");
    setModuleDescription("");
    setSelectedUser(null);
  };

  const handleLogout = () => {
    router.push("/login");
    localStorage.removeItem("token");
  };

  return (
    <div className="bg-white text-[#4a4a4a] max-h-screen">
      <header className="fixed top-0 left-0 right-0 w-full bg-[#F5F9FE] shadow-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] px-10 py-4 flex justify-between items-start z-50 border-b border-gray-300">
        <h1 className="text-2xl font-serif text-[#4a4a4a] tracking-wide">
          MEDHIR
        </h1>
        <nav className="flex flex-grow justify-center space-x-20 text-lg font-medium">
          {["Companies", "Modules", "Settings"].map((item, index) => (
            <Link
              key={index}
              href={`/superadmin/${item.toLowerCase()}`}
              passHref
            >
              <button
                onClick={() => setActiveTab(item)}
                className={`hover:text-[#4876D6] ${
                  activeTab === item
                    ? "text-black bg-[#E3ECFB] rounded-md px-2 py-1"
                    : "text-[#333333]"
                }`}
                style={{
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {item === "Companies" && (
                  <FaBuilding
                    className="inline-block text-black opacity-80"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                  />
                )}
                {item === "Modules" && (
                  <Grid2X2
                    className="inline-block w-5 h-5 text-gray-800"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                  />
                )}
                {item === "Settings" && (
                  <FaCog
                    className="inline-block text-black opacity-80"
                    style={{ fontSize: "16px", verticalAlign: "middle" }}
                  />
                )}
                {item}
              </button>
            </Link>
          ))}
        </nav>
        <div className="relative">
          <button
            className="flex items-center gap-2 text-black font-medium"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <FaUserCircle className="text-2xl" />
            Super Admin
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg">
              <button
                className="block w-full text-left px-4 py-2 text-black hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="p-5">
        <div className="mt-6 p-4 rounded-lg bg-white">
          <div className="mt-4 p-4 rounded-lg flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-1.5 text-gray-800 border border-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-300 shadow-sm bg-white"
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
              <div className="flex flex-col items-center cursor-pointer opacity-20 pointer-events-none">
                <Edit size={32} className="text-[#4a4a4a] p-1 rounded-md" />
                <span className="text-xs text-[#4a4a4a]">Edit</span>
              </div>
              <div className="flex flex-col items-center cursor-pointer opacity-20 pointer-events-none">
                <Trash size={32} className="text-[#4a4a4a] p-1 rounded-md" />
                <span className="text-xs text-[#4a4a4a]">Delete</span>
              </div>
            </div>
          </div>
          <div className="mt-4 p-2 rounded-lg">
            <ClientOnlyTable>
              <Table className="w-full border border-gray-300 rounded-lg shadow-md">
                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-800 font-medium font-bold">
                    Name
                  </TableHeader>
                </TableHead>

                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-800 font-medium font-bold">
                    Description
                  </TableHeader>
                </TableHead>

                <TableHead className="bg-gray-300 text-gray-800 font-bold">
                  <TableHeader className="text-gray-800 font-medium font-bold">
                    Admin
                  </TableHeader>
                </TableHead>
                
                <TableBody>
                  {modules.map((module, index) => (
                    <TableRow
                      key={index}
                      className={`cursor-pointer hover:bg-gray-100 transition ${
                        index % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]"
                      }`}
                    >
                      <TableCell>{module.moduleName}</TableCell>
                      <TableCell>{module.description}</TableCell>
                      <TableCell>{module.user?.name}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ClientOnlyTable>
          </div>
        </div>
      </div>

      {/* Add Module Modal */}
      <Modal
        isOpen={isAddModuleOpen}
        onClose={() => {
          setIsAddModuleOpen(false);
          setIsAddUserOpen(false);
        }}
      >
        <div className="p-4 bg-gray-200 text-black rounded-lg">
          <h2 className="text-2xl font-bold">Add Module</h2>
          <Input
            placeholder="Module Name"
            className="mt-4 bg-gray-100 text-black border border-gray-300"
            value={moduleName}
            onChange={(e) => setModuleName(e.target.value)}
          />
          <Input
            placeholder="Description"
            className="mt-4 bg-gray-100 text-black border border-gray-300"
            value={moduleDescription}
            onChange={(e) => setModuleDescription(e.target.value)}
          />

          {/* Admin Select */}
          <Select
            onValueChange={(value) => {
              if (value === "addUser") {
                setNewUser(""); // Clear input fields
                setUserEmail("");
                setUserPhone("");
                setIsAddUserOpen(true);
              } else {
                const selected = users.find((user) => user.id === value);
                setSelectedUser(selected || null);
                setIsAddUserOpen(false);
              }
            }}
          >
            <SelectTrigger className="mt-4 bg-gray-100 text-black border border-gray-300">
              {selectedUser ? selectedUser.name : "Select Admin"}
            </SelectTrigger>
            <SelectContent>
              {users.map((user, index) => (
                <SelectItem key={index} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}

              <SelectItem value="addUser" className="text-blue-600 font-bold">
                + Add User
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Add User Form */}
          {isAddUserOpen && (
            <div className="mt-4 mx-4">
              <h3 className="text- font-bold">Add User</h3>
              <Input
                placeholder="Name"
                className="mt-2 bg-gray-100 text-black border border-gray-300"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
              />
              <Input
                placeholder="Email"
                className="mt-2 bg-gray-100 text-black border border-gray-300"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
              />
              <Input
                placeholder="Phone"
                className="mt-2 bg-gray-100 text-black border border-gray-300"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
              />
              <div className="mt-4 flex space-x-2">
                <Button onClick={handleAddUser}>Save User</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Save and Cancel buttons */}
          {!isAddUserOpen && (
            <div className="mt-4 flex space-x-2">
              <Button onClick={handleAddModule}>Save</Button>
              <Button
                variant="outline"
                onClick={() => setIsAddModuleOpen(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </Modal>

      <style jsx>{`
        .logout-button {
          background: white;
          color: black;
          border: 1px solid black;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: bold;
          transition: 0.3s;
        }
        .logout-button:hover {
          background: black;
          color: white;
        }
      `}</style>
    </div>
  );
}

export default withAuth(SuperadminModules);
