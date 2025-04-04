import React, { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

const LeaveSettings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("Leave Types");
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [showLeaveTypeEditModal, setShowLeaveTypeEditModal] = useState(false);
  const [leaveTypeForm, setLeaveTypeForm] = useState({
    name: "",
    accrual: "",
    description: "",
    allowedInProbation: false,
    allowedInNotice: false,
    canCarryForward: false,
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Add new state variables for Leave Policies
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showPolicyEditModal, setShowPolicyEditModal] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    name: "",
    leaveAllocation: [{ leaveType: "", annualQuota: "" }],
  });

  // Add new state variables for Public Holidays
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [showHolidayEditModal, setShowHolidayEditModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    name: "",
    date: "",
    description: "",
  });

  // Add state for tracking form changes
  const [isLeaveTypeFormChanged, setIsLeaveTypeFormChanged] = useState(false);
  const [isPolicyFormChanged, setIsPolicyFormChanged] = useState(false);
  const [isHolidayFormChanged, setIsHolidayFormChanged] = useState(false);

  // Add state for selected items
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedHoliday, setSelectedHoliday] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Add handlers for form changes
  const handleLeaveTypeFormChange = (e) => {
    setIsLeaveTypeFormChanged(true);
    const { name, value, type, checked } = e.target;
    setLeaveTypeForm({
      ...leaveTypeForm,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePolicyFormChange = (e) => {
    setIsPolicyFormChanged(true);
    const { name, value } = e.target;
    setPolicyForm({
      ...policyForm,
      [name]: value,
    });
  };

  const handleHolidayFormChange = (e) => {
    setIsHolidayFormChanged(true);
    const { name, value } = e.target;
    setHolidayForm({
      ...holidayForm,
      [name]: value,
    });
  };

  const handleLeaveTypeSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!leaveTypeForm.name) {
      newErrors.name = "Leave type name is required";
    }
    if (!leaveTypeForm.accrual) {
      newErrors.accrual = "Accrual period is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save leave type
      setNotification({
        show: true,
        type: "success",
        message: "Leave type added successfully!",
      });
      setShowLeaveTypeModal(false);
      setLeaveTypeForm({
        name: "",
        accrual: "",
        description: "",
        allowedInProbation: false,
        allowedInNotice: false,
        canCarryForward: false,
      });
      setIsLeaveTypeFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add leave type. Please try again.",
      });
    }
  };

  // Add handler for leave type update
  const handleLeaveTypeUpdate = async (id) => {
    try {
      // TODO: Add API call to update leave type
      setNotification({
        show: true,
        type: "success",
        message: "Leave type updated successfully!",
      });
      setShowLeaveTypeModal(false);
      setSelectedLeaveType(null);
      setIsLeaveTypeFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to update leave type. Please try again.",
      });
    }
  };

  // Sample leave types data (this would come from your API)
  const leaveTypes = [
    { id: 1, name: "Annual Leave" },
    { id: 2, name: "Sick Leave" },
    { id: 3, name: "Comp-off" },
  ];

  // Sample policies data (this would come from your API)
  const policies = [
    {
      id: 1,
      name: "Standard Policy",
      leaveAllocation: [
        { leaveType: "Annual Leave", annualQuota: 24 },
        { leaveType: "Sick Leave", annualQuota: 12 },
      ],
    },
    // Add more sample policies as needed
  ];

  const handleAddLeaveAllocation = () => {
    setIsPolicyFormChanged(true);
    setPolicyForm((prev) => ({
      ...prev,
      leaveAllocation: [
        ...prev.leaveAllocation,
        { leaveType: "", annualQuota: "" },
      ],
    }));
  };

  const handleRemoveLeaveAllocation = (index) => {
    setIsPolicyFormChanged(true);
    setPolicyForm((prev) => ({
      ...prev,
      leaveAllocation: prev.leaveAllocation.filter((_, i) => i !== index),
    }));
  };

  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!policyForm.name) {
      newErrors.policyName = "Policy name is required";
    }

    if (
      policyForm.leaveAllocation.some(
        (item) => !item.leaveType || !item.annualQuota
      )
    ) {
      newErrors.leaveAllocation = "All leave types and quotas must be filled";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save policy
      setNotification({
        show: true,
        type: "success",
        message: "Leave policy added successfully!",
      });
      setShowPolicyModal(false);
      setPolicyForm({
        name: "",
        leaveAllocation: [{ leaveType: "", annualQuota: "" }],
      });
      setIsPolicyFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add leave policy. Please try again.",
      });
    }
  };

  // Add handler for policy update
  const handlePolicyUpdate = async (id) => {
    try {
      // TODO: Add API call to update policy
      setNotification({
        show: true,
        type: "success",
        message: "Leave policy updated successfully!",
      });
      setShowPolicyModal(false);
      setSelectedPolicy(null);
      setIsPolicyFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to update leave policy. Please try again.",
      });
    }
  };

  // Sample public holidays data (this would come from your API)
  const publicHolidays = [
    {
      id: 1,
      name: "Republic Day",
      date: "2025-01-26",
      description: "National Holiday",
    },
    {
      id: 2,
      name: "Independence Day",
      date: "2024-08-15",
      description: "National Holiday",
    },
    // Add more sample holidays as needed
  ];

  const handleHolidaySubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!holidayForm.name) {
      newErrors.holidayName = "Holiday name is required";
    }
    if (!holidayForm.date) {
      newErrors.holidayDate = "Date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save holiday
      setNotification({
        show: true,
        type: "success",
        message: "Public holiday added successfully!",
      });
      setShowHolidayModal(false);
      setHolidayForm({
        name: "",
        date: "",
        description: "",
      });
      setIsHolidayFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to add public holiday. Please try again.",
      });
    }
  };

  // Add handler for holiday update
  const handleHolidayUpdate = async (id) => {
    try {
      // TODO: Add API call to update holiday
      setNotification({
        show: true,
        type: "success",
        message: "Public holiday updated successfully!",
      });
      setShowHolidayModal(false);
      setSelectedHoliday(null);
      setIsHolidayFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to update public holiday. Please try again.",
      });
    }
  };

  // Format date to display in table
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Add handlers for row clicks
  const handleLeaveTypeRowClick = (type) => {
    setSelectedLeaveType(type);
    setLeaveTypeForm({
      name: type.name,
      accrual: type.accrual || "",
      description: type.description || "",
      allowedInProbation: type.allowedInProbation || false,
      allowedInNotice: type.allowedInNotice || false,
      canCarryForward: type.canCarryForward || false,
    });
    setShowLeaveTypeEditModal(true);
    setIsLeaveTypeFormChanged(false);
  };

  const handlePolicyRowClick = (policy) => {
    setSelectedPolicy(policy);
    setPolicyForm({
      name: policy.name,
      leaveAllocation: policy.leaveAllocation || [{ leaveType: "", annualQuota: "" }],
    });
    setShowPolicyEditModal(true);
    setIsPolicyFormChanged(false);
  };

  const handleHolidayRowClick = (holiday) => {
    setSelectedHoliday(holiday);
    setHolidayForm({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || "",
    });
    setShowHolidayEditModal(true);
    setIsHolidayFormChanged(false);
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
            Leave Settings
          </h1>

          {/* Tabs */}
          <div className="flex gap-6 mb-6">
            {["Leave Types", "Leave Policies", "Public Holidays"].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === tab
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Leave Types Content */}
          {activeTab === "Leave Types" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {/* Header with Add Button */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    setSelectedLeaveType(null);
                    setLeaveTypeForm({
                      name: "",
                      accrual: "",
                      description: "",
                      allowedInProbation: false,
                      allowedInNotice: false,
                      canCarryForward: false,
                    });
                    setShowLeaveTypeModal(true);
                    setIsLeaveTypeFormChanged(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Leave Type
                </button>
              </div>

              {/* Leave Types List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Accrual
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Settings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaveTypes.map((type, index) => (
                      <tr 
                        key={index} 
                        onClick={() => handleLeaveTypeRowClick(type)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {type.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {type.accrual}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {type.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex flex-col gap-1">
                            <span>
                              Probation:{" "}
                              {type.allowedInProbation ? "Yes" : "No"}
                            </span>
                            <span>
                              Notice: {type.allowedInNotice ? "Yes" : "No"}
                            </span>
                            <span>
                              Carry Forward:{" "}
                              {type.canCarryForward ? "Yes" : "No"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Leave Policies Content */}
          {activeTab === "Leave Policies" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    setSelectedPolicy(null);
                    setPolicyForm({
                      name: "",
                      leaveAllocation: [{ leaveType: "", annualQuota: "" }],
                    });
                    setShowPolicyModal(true);
                    setIsPolicyFormChanged(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Leave Policy
                </button>
              </div>

              {/* Policies List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Policy Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leave Allocations
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {policies.map((policy) => (
                      <tr 
                        key={policy.id}
                        onClick={() => handlePolicyRowClick(policy)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {policy.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="space-y-1">
                            {policy.leaveAllocation.map((allocation, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <span className="font-medium">
                                  {allocation.leaveType}:
                                </span>
                                <span>{allocation.annualQuota} days/year</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Leave Policy Modal */}
              {showPolicyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Add New Leave Policy
                      </h2>
                      <button
                        onClick={() => setShowPolicyModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handlePolicySubmit(e);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={policyForm.name}
                          onChange={handlePolicyFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter policy name"
                        />
                        {errors.policyName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.policyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            Leave Allocations
                          </label>
                          <button
                            type="button"
                            onClick={handleAddLeaveAllocation}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Leave Type
                          </button>
                        </div>

                        {policyForm.leaveAllocation.map((allocation, index) => (
                          <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1">
                              <select
                                value={allocation.leaveType}
                                onChange={(e) => {
                                  setIsPolicyFormChanged(true);
                                  const newAllocations = [
                                    ...policyForm.leaveAllocation,
                                  ];
                                  newAllocations[index].leaveType =
                                    e.target.value;
                                  setPolicyForm({
                                    ...policyForm,
                                    leaveAllocation: newAllocations,
                                  });
                                }}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Leave Type</option>
                                {leaveTypes.map((type) => (
                                  <option key={type.id} value={type.name}>
                                    {type.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={allocation.annualQuota}
                                onChange={(e) => {
                                  setIsPolicyFormChanged(true);
                                  const newAllocations = [
                                    ...policyForm.leaveAllocation,
                                  ];
                                  newAllocations[index].annualQuota =
                                    e.target.value;
                                  setPolicyForm({
                                    ...policyForm,
                                    leaveAllocation: newAllocations,
                                  });
                                }}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Days/year"
                              />
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLeaveAllocation(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {errors.leaveAllocation && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.leaveAllocation}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowPolicyModal(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Leave Policy Edit Modal */}
              {showPolicyEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Edit Leave Policy
                      </h2>
                      <button
                        onClick={() => setShowPolicyEditModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handlePolicyUpdate(selectedPolicy.id);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Policy Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={policyForm.name}
                          onChange={handlePolicyFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter policy name"
                        />
                        {errors.policyName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.policyName}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="block text-sm font-medium text-gray-700">
                            Leave Allocations
                          </label>
                          <button
                            type="button"
                            onClick={handleAddLeaveAllocation}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            + Add Leave Type
                          </button>
                        </div>

                        {policyForm.leaveAllocation.map((allocation, index) => (
                          <div key={index} className="flex gap-4 items-start">
                            <div className="flex-1">
                              <select
                                value={allocation.leaveType}
                                onChange={(e) => {
                                  setIsPolicyFormChanged(true);
                                  const newAllocations = [
                                    ...policyForm.leaveAllocation,
                                  ];
                                  newAllocations[index].leaveType =
                                    e.target.value;
                                  setPolicyForm({
                                    ...policyForm,
                                    leaveAllocation: newAllocations,
                                  });
                                }}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="">Select Leave Type</option>
                                {leaveTypes.map((type) => (
                                  <option key={type.id} value={type.name}>
                                    {type.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex-1">
                              <input
                                type="number"
                                value={allocation.annualQuota}
                                onChange={(e) => {
                                  setIsPolicyFormChanged(true);
                                  const newAllocations = [
                                    ...policyForm.leaveAllocation,
                                  ];
                                  newAllocations[index].annualQuota =
                                    e.target.value;
                                  setPolicyForm({
                                    ...policyForm,
                                    leaveAllocation: newAllocations,
                                  });
                                }}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Days/year"
                              />
                            </div>
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveLeaveAllocation(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        ))}
                        {errors.leaveAllocation && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.leaveAllocation}
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowPolicyEditModal(false)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {isPolicyFormChanged ? "Update" : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Public Holidays Content */}
          {activeTab === "Public Holidays" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              {/* Header with Add Button */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => {
                    setSelectedHoliday(null);
                    setHolidayForm({
                      name: "",
                      date: "",
                      description: "",
                    });
                    setShowHolidayModal(true);
                    setIsHolidayFormChanged(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Add Public Holiday
                </button>
              </div>

              {/* Public Holidays List */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Holiday Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {publicHolidays.map((holiday) => (
                      <tr 
                        key={holiday.id}
                        onClick={() => handleHolidayRowClick(holiday)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {holiday.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(holiday.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {holiday.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Public Holiday Modal */}
              {showHolidayModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Add New Public Holiday
                      </h2>
                      <button
                        onClick={() => setShowHolidayModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleHolidaySubmit(e);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Holiday Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={holidayForm.name}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter holiday name"
                        />
                        {errors.holidayName && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.holidayName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={holidayForm.date}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.holidayDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.holidayDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={holidayForm.description}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowHolidayModal(false)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Public Holiday Edit Modal */}
              {showHolidayEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-gray-800">
                        Edit Public Holiday
                      </h2>
                      <button
                        onClick={() => setShowHolidayEditModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleHolidayUpdate(selectedHoliday.id);
                    }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Holiday Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={holidayForm.name}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter holiday name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <input
                          type="date"
                          name="date"
                          value={holidayForm.date}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={holidayForm.description}
                          onChange={handleHolidayFormChange}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="3"
                          placeholder="Enter description"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => setShowHolidayEditModal(false)}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                        >
                          Delete
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          {isHolidayFormChanged ? "Update" : "Save"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leave Type Modal */}
          {showLeaveTypeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Add New Leave Type
                  </h2>
                  <button
                    onClick={() => setShowLeaveTypeModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLeaveTypeSubmit(e);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={leaveTypeForm.name}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter leave type name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accrual Period
                    </label>
                    <select
                      name="accrual"
                      value={leaveTypeForm.accrual}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select accrual period</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                      <option value="On Request">On Request</option>
                    </select>
                    {errors.accrual && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.accrual}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={leaveTypeForm.description}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInProbation"
                        name="allowedInProbation"
                        checked={leaveTypeForm.allowedInProbation}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInProbation"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Probation Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInNotice"
                        name="allowedInNotice"
                        checked={leaveTypeForm.allowedInNotice}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInNotice"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Notice Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="canCarryForward"
                        name="canCarryForward"
                        checked={leaveTypeForm.canCarryForward}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="canCarryForward"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Can be Carried Forward
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLeaveTypeModal(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Leave Type Edit Modal */}
          {showLeaveTypeEditModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Edit Leave Type
                  </h2>
                  <button
                    onClick={() => setShowLeaveTypeEditModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLeaveTypeUpdate(selectedLeaveType.id);
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Leave Type Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={leaveTypeForm.name}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter leave type name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Accrual Period
                    </label>
                    <select
                      name="accrual"
                      value={leaveTypeForm.accrual}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select accrual period</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Annually">Annually</option>
                      <option value="On Request">On Request</option>
                    </select>
                    {errors.accrual && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.accrual}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={leaveTypeForm.description}
                      onChange={handleLeaveTypeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Enter description"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInProbation"
                        name="allowedInProbation"
                        checked={leaveTypeForm.allowedInProbation}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInProbation"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Probation Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="allowedInNotice"
                        name="allowedInNotice"
                        checked={leaveTypeForm.allowedInNotice}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="allowedInNotice"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Allowed in Notice Period
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="canCarryForward"
                        name="canCarryForward"
                        checked={leaveTypeForm.canCarryForward}
                        onChange={handleLeaveTypeFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="canCarryForward"
                        className="ml-2 block text-sm text-gray-700"
                      >
                        Can be Carried Forward
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowLeaveTypeEditModal(false)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {isLeaveTypeFormChanged ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
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
      </div>
    </div>
  );
};

export default LeaveSettings;