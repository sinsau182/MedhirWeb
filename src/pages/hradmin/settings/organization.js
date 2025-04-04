import React, { useState } from "react";
import {
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Edit2,
  Save,
  XCircle,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import { toast } from "sonner";
import Select from "react-select";
import { useRouter } from "next/router";

const OrganizationSettings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("departments");
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [showDesignationModal, setShowDesignationModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [departmentForm, setDepartmentForm] = useState({
    name: "",
    description: "",
    head: "",
    leavePolicy: "",
    weeklyHolidays: [],
  });
  const [editingDesignation, setEditingDesignation] = useState(null);
  const [designationForm, setDesignationForm] = useState({
    name: "",
    description: "",
    department: "",
    isManager: false,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showDepartmentEditModal, setShowDepartmentEditModal] = useState(false);
  const [showDesignationEditModal, setShowDesignationEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: "Engineering",
      description: "Software Development Team",
      head: "John Doe",
      leavePolicy: { value: "standard", label: "Standard Leave Policy" },
      weeklyHolidays: [
        { value: "Saturday", label: "Saturday" },
        { value: "Sunday", label: "Sunday" },
      ],
    },
  ]);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedDesignation, setSelectedDesignation] = useState(null);
  const [designations, setDesignations] = useState([
    {
      id: 1,
      name: "Software Engineer",
      description: "Develops software applications",
      department: { value: 1, label: "Engineering" },
      isManager: false,
    },
    {
      id: 2,
      name: "Engineering Manager",
      description: "Manages engineering team",
      department: { value: 1, label: "Engineering" },
      isManager: true,
    },
  ]);

  // Sample data for dropdowns
  const leavePolicies = [
    { value: "standard", label: "Standard Leave Policy" },
    { value: "flexible", label: "Flexible Leave Policy" },
  ];

  const weekDays = [
    { value: "Sunday", label: "Sunday" },
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" },
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
  ];

  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleDepartmentEdit = (department) => {
    setEditingDepartment(department.id);
    setDepartmentForm({
      name: department.name,
      description: department.description,
      head: department.head,
      leavePolicy: department.leavePolicy,
      weeklyHolidays: department.weeklyHolidays,
    });
  };

  const handleDepartmentUpdate = async (id) => {
    try {
      // TODO: Add API call to update department
      const updatedDepartments = departments.map((dept) =>
        dept.id === id ? { ...dept, ...departmentForm } : dept
      );
      setDepartments(updatedDepartments);
      setEditingDepartment(null);
      setNotification({
        show: true,
        type: "success",
        message: "Department updated successfully!",
      });
      setIsFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to update department. Please try again.",
      });
    }
  };

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!departmentForm.name) {
      newErrors.name = "Department name is required";
    }
    if (!departmentForm.head) {
      newErrors.head = "Department head is required";
    }
    if (!departmentForm.leavePolicy) {
      newErrors.leavePolicy = "Leave policy is required";
    }
    if (departmentForm.weeklyHolidays.length === 0) {
      newErrors.weeklyHolidays = "At least one weekly holiday is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save department
      const newDepartment = {
        id: departments.length + 1,
        ...departmentForm,
      };
      setDepartments([...departments, newDepartment]);
      setNotification({
        show: true,
        type: "success",
        message: "Department added successfully!",
      });
      setShowDepartmentModal(false);
      setDepartmentForm({
        name: "",
        description: "",
        head: "",
        leavePolicy: "",
        weeklyHolidays: [],
      });
      setIsFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add department. Please try again.",
      });
    }
  };

  const handleDesignationEdit = (designation) => {
    setEditingDesignation(designation.id);
    setDesignationForm({
      name: designation.name,
      description: designation.description,
      department: designation.department,
      isManager: designation.isManager,
    });
  };

  const handleDesignationUpdate = async (id) => {
    try {
      // TODO: Add API call to update designation
      const updatedDesignations = designations.map((desig) =>
        desig.id === id ? { ...desig, ...designationForm } : desig
      );
      setDesignations(updatedDesignations);
      setEditingDesignation(null);
      setNotification({
        show: true,
        type: "success",
        message: "Designation updated successfully!",
      });
      setIsFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to update designation. Please try again.",
      });
    }
  };

  const handleDesignationSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!designationForm.name) {
      newErrors.name = "Designation name is required";
    }
    if (!designationForm.department) {
      newErrors.department = "Department is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save designation
      setNotification({
        show: true,
        type: "success",
        message: "Designation added successfully!",
      });
      setShowDesignationModal(false);
      setDesignationForm({
        name: "",
        department: "",
        isManager: false,
        description: "",
      });
      setIsFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add designation. Please try again.",
      });
    }
  };

  const handleDepartmentFormChange = (e) => {
    setIsFormChanged(true);
    const { name, value } = e.target;
    setDepartmentForm({
      ...departmentForm,
      [name]: value,
    });
  };

  const handleDesignationFormChange = (e) => {
    setIsFormChanged(true);
    const { name, value, type, checked } = e.target;
    setDesignationForm({
      ...designationForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSelectChange = (selectedOption, actionMeta) => {
    setIsFormChanged(true);
    const { name } = actionMeta;
    if (name === 'leavePolicy') {
      setDepartmentForm({
        ...departmentForm,
        leavePolicy: selectedOption,
      });
    } else if (name === 'weeklyHolidays') {
      setDepartmentForm({
        ...departmentForm,
        weeklyHolidays: selectedOption,
      });
    } else if (name === 'department') {
      setDesignationForm({
        ...designationForm,
        department: selectedOption,
      });
    }
  };

  const handleRowClick = (item) => {
    if (activeTab === "departments") {
      setSelectedDepartment(item);
      setShowDepartmentEditModal(true);
    } else {
      setSelectedDesignation(item);
      setShowDesignationEditModal(true);
    }
    setIsEditing(true);
    setIsFormChanged(false);
  };

  const handleModalClose = () => {
    setShowDepartmentModal(false);
    setShowDepartmentEditModal(false);
    setShowDesignationEditModal(false);
    setShowDesignationModal(false);
    setSelectedItem(null);
    setSelectedDepartment(null);
    setSelectedDesignation(null);
    setIsEditing(false);
    setIsFormChanged(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Organization Settings
          </h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b">
            {["Departments", "Designations"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab.toLowerCase()
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab.toLowerCase())}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Add Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                if (activeTab === "departments") {
                  setSelectedDepartment(null);
                  setShowDepartmentModal(true);
                } else {
                  setSelectedDesignation(null);
                  setShowDesignationModal(true);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add {activeTab === "departments" ? "Department" : "Designation"}
            </button>
          </div>

          {/* Departments Table */}
          {activeTab === "departments" && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department Head
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Policy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Weekly Holidays
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {departments.map((department) => (
                    <tr
                      key={department.id}
                      onClick={() => {
                        setSelectedDepartment(department);
                        setShowDepartmentEditModal(true);
                      }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {department.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {department.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {department.head}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {department.leavePolicy.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {department.weeklyHolidays
                          .map((day) => day.label)
                          .join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Designations Table */}
          {activeTab === "designations" && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Is Manager
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {designations.map((designation) => (
                    <tr
                      key={designation.id}
                      onClick={() => {
                        setSelectedDesignation(designation);
                        setShowDesignationEditModal(true);
                      }}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {designation.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {designation.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {designation.department.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {designation.isManager ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Department Add Modal */}
      {showDepartmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Department
                </h3>
                <button
                  onClick={() => setShowDepartmentModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                handleDepartmentSubmit(e);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department name"
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department description"
                    rows={3}
                    onChange={handleDepartmentFormChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="head"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department head name"
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Policy <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leavePolicy"
                    options={leavePolicies}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select leave policy"
                    onChange={handleSelectChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Holidays <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="weeklyHolidays"
                    isMulti
                    options={weekDays}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select weekly holidays"
                    onChange={handleSelectChange}
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDepartmentModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleDepartmentSubmit(e);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Edit Modal */}
      {showDepartmentEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Department
                </h3>
                <button
                  onClick={() => setShowDepartmentEditModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                handleDepartmentUpdate(selectedDepartment.id);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department name"
                    defaultValue={selectedDepartment?.name}
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department description"
                    rows={3}
                    defaultValue={selectedDepartment?.description}
                    onChange={handleDepartmentFormChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="head"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter department head name"
                    defaultValue={selectedDepartment?.head}
                    onChange={handleDepartmentFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Leave Policy <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="leavePolicy"
                    options={leavePolicies}
                    defaultValue={selectedDepartment?.leavePolicy}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select leave policy"
                    onChange={handleSelectChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weekly Holidays <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="weeklyHolidays"
                    isMulti
                    options={weekDays}
                    defaultValue={selectedDepartment?.weeklyHolidays}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select weekly holidays"
                    onChange={handleSelectChange}
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDepartmentEditModal(false)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Delete
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleDepartmentUpdate(selectedDepartment.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isFormChanged ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Designation Add Modal */}
      {showDesignationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Designation
                </h3>
                <button
                  onClick={() => setShowDesignationModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                handleDesignationSubmit(e);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter designation name"
                    onChange={handleDesignationFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter designation description"
                    rows={3}
                    onChange={handleDesignationFormChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="department"
                    options={departments.map((dept) => ({
                      value: dept.id,
                      label: dept.name,
                    }))}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select department"
                    onChange={handleSelectChange}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isManager"
                    name="isManager"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    onChange={handleDesignationFormChange}
                  />
                  <label
                    htmlFor="isManager"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Is Manager
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDesignationModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleDesignationSubmit(e);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Designation Edit Modal */}
      {showDesignationEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[600px]">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Designation
                </h3>
                <button
                  onClick={() => setShowDesignationEditModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                handleDesignationUpdate(selectedDesignation.id);
              }}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter designation name"
                    defaultValue={selectedDesignation?.name}
                    onChange={handleDesignationFormChange}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter designation description"
                    rows={3}
                    defaultValue={selectedDesignation?.description}
                    onChange={handleDesignationFormChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="department"
                    options={departments.map((dept) => ({
                      value: dept.id,
                      label: dept.name,
                    }))}
                    defaultValue={selectedDesignation?.department}
                    className="react-select"
                    classNamePrefix="select"
                    placeholder="Select department"
                    onChange={handleSelectChange}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isManager"
                    name="isManager"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    defaultChecked={selectedDesignation?.isManager}
                    onChange={handleDesignationFormChange}
                  />
                  <label
                    htmlFor="isManager"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Is Manager
                  </label>
                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDesignationEditModal(false)}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
              >
                Delete
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handleDesignationUpdate(selectedDesignation.id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {isFormChanged ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-md ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationSettings;