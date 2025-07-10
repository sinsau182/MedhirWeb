import React, { useState, useMemo, useEffect } from "react";
import {
  FaPlus,
  FaCog,
  FaSearch,
  FaThLarge,
  FaListUl,
  FaCalendarAlt,
  FaChartBar,
  FaMapMarkerAlt,
  FaClock,
  FaChevronDown,
  FaTrash,
  FaTimes,
  FaWrench,
  FaStream,
  FaTasks,
  FaUserShield,
  FaSitemap,
  FaChevronLeft,
  FaChevronRight,
  FaRobot,
  FaEnvelopeOpenText,
  FaCopy,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import ConvertLeadModal from "@/components/Sales/ConvertLeadModal";
import LostLeadModal from "@/components/Sales/LostLeadModal";
import JunkReasonModal from "@/components/Sales/JunkReasonModal";
import AddLeadModal from "@/components/Sales/AddLeadModal";
import KanbanBoard from "@/components/Sales/KanbanBoard";
import { fetchLeads, updateLead, createLead } from "@/redux/slices/leadsSlice";
import { addStage, removeStage } from "@/redux/slices/pipelineSlice";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import AdvancedScheduleActivityModal from "@/components/Sales/AdvancedScheduleActivityModal";
import { useRouter } from "next/router";
import Tooltip from "@/components/ui/ToolTip";

// Add these imports for settings functionality
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const salesPersons = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
  { id: 4, name: "Dana" },
];
const designers = [
  { id: 1, name: "Bob" },
  { id: 2, name: "Dana" },
  { id: 3, name: "Frank" },
  { id: 4, name: "Jack" },
];

const defaultLeadData = {
  name: "",
  contactNumber: "",
  email: "",
  projectType: "",
  propertyType: "",
  address: "",
  area: "",
  budget: "",
  designStyle: "",
  leadSource: "",
  preferredContact: "",
  notes: "",
  status: "New",
  rating: 0,
  salesRep: null,
  designer: null,
  callDescription: null,
  callHistory: [],
  nextCall: null,
  quotedAmount: null,
  finalQuotation: null,
  signupAmount: null,
  paymentDate: null,
  paymentMode: null,
  panNumber: null,
  discount: null,
  reasonForLost: null,
  reasonForJunk: null,
  submittedBy: null,
  paymentDetailsFileName: null,
  bookingFormFileName: null,
};

const DeletePipelineModal = ({ isOpen, onClose, stages, onDeleteStages }) => {
  const [selectedStages, setSelectedStages] = useState([]);

  const handleStageToggle = (stage) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const handleDelete = () => {
    if (selectedStages.length === 0) {
      toast.error("Please select at least one stage to delete");
      return;
    }
    onDeleteStages(selectedStages);
    setSelectedStages([]);
    onClose();
  };

  const handleSelectAll = () => {
    setSelectedStages(stages);
  };

  const handleDeselectAll = () => {
    setSelectedStages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Delete Pipeline Stages
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select the pipeline stages you want to delete. This action cannot be
            undone.
          </p>

          <div className="flex gap-2 mb-4">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Select All
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Deselect All
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stages.map((stage) => (
              <label
                key={stage}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage)}
                  onChange={() => handleStageToggle(stage)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium">{stage}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={selectedStages.length === 0}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Delete{" "}
            {selectedStages.length > 0 ? `(${selectedStages.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
};

// MOCK DATA: Replace with your own if needed
const MOCK_LEADS = [
  {
    leadId: "LEAD101",
    name: "John Doe",
    contactNumber: "1234567890",
    email: "john@example.com",
    projectType: "Residential",
    propertyType: "Apartment",
    address: "123 Main St",
    area: "1200",
    budget: "1500000",
    designStyle: "Modern",
    leadSource: "Website",
    preferredContact: "Phone",
    notes: "Interested in 2BHK",
    status: "New",
    rating: 2,
    salesRep: "Alice",
    designer: "Bob",
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: "MANAGER",
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    createdAt: "2024-05-10T09:00:00Z",
    activities: [
      {
        id: 1,
        type: "task",
        summary: "Follow-up call",
        dueDate: "2024-05-15",
        status: "done",
      },
      {
        id: 2,
        type: "meeting",
        summary: "Client meeting",
        dueDate: "2024-07-30",
        status: "pending",
      },
    ],
  },
  {
    leadId: "LEAD102",
    name: "Jane Smith",
    contactNumber: "9876543210",
    email: "jane@example.com",
    projectType: "Commercial",
    propertyType: "Office",
    address: "456 Market St",
    area: "2000",
    budget: "3000000",
    designStyle: "Contemporary",
    leadSource: "Referral",
    preferredContact: "Email",
    notes: "Needs open workspace",
    status: "Contacted",
    rating: 3,
    salesRep: "Charlie",
    designer: "Dana",
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: "MANAGER",
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    createdAt: "2024-05-20T11:30:00Z",
    activities: [
      {
        id: 3,
        type: "call",
        summary: "Initial call",
        dueDate: "2024-05-21",
        status: "done",
      },
      {
        id: 4,
        type: "task",
        summary: "Send quote",
        dueDate: "2024-05-25",
        status: "pending",
      },
    ],
  },
  {
    leadId: "LEAD103",
    name: "Emily Davis",
    contactNumber: "1112223333",
    email: "emily@example.com",
    projectType: "Residential",
    propertyType: "Villa",
    address: "789 Pine Ln",
    area: "2500",
    budget: "4000000",
    designStyle: "Minimalist",
    leadSource: "Social Media",
    preferredContact: "Email",
    notes: "Wants a minimalist design for a new villa.",
    status: "Qualified",
    rating: 3,
    salesRep: "Alice",
    designer: "Frank",
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: "MANAGER",
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    createdAt: "2024-06-01T14:00:00Z",
    activities: [],
  },
];

const LeadsTable = ({ leads }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Sales Rep</TableHead>
          <TableHead>Designer</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((lead) => (
          <TableRow key={lead.leadId}>
            <TableCell className="font-medium">{lead.name}</TableCell>
            <TableCell>{lead.contactNumber}</TableCell>
            <TableCell>{lead.email}</TableCell>
            <TableCell>{lead.status}</TableCell>
            <TableCell>
              {lead.salesRep || (
                <span className="text-gray-400">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              {lead.designer || (
                <span className="text-gray-400">Unassigned</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

// Add these new components before the SettingsPage component

const PermissionsSettings = () => {
  const [roles, setRoles] = useState([
    {
      id: 1,
      name: "Sales Manager",
      permissions: [
        "view_all_leads",
        "edit_all_leads",
        "delete_leads",
        "manage_pipeline",
        "assign_leads",
        "view_reports",
      ],
    },
    {
      id: 2,
      name: "Sales Executive",
      permissions: [
        "view_own_leads",
        "edit_own_leads",
        "create_leads",
        "schedule_activities",
      ],
    },
    {
      id: 3,
      name: "Designer",
      permissions: [
        "view_assigned_leads",
        "edit_assigned_leads",
        "upload_designs",
      ],
    },
  ]);

  const [newRoleName, setNewRoleName] = useState("");
  const [isAddingRole, setIsAddingRole] = useState(false);

  const allPermissions = [
    { id: "view_all_leads", name: "View All Leads", category: "Leads" },
    { id: "view_own_leads", name: "View Own Leads", category: "Leads" },
    {
      id: "view_assigned_leads",
      name: "View Assigned Leads",
      category: "Leads",
    },
    { id: "edit_all_leads", name: "Edit All Leads", category: "Leads" },
    { id: "edit_own_leads", name: "Edit Own Leads", category: "Leads" },
    {
      id: "edit_assigned_leads",
      name: "Edit Assigned Leads",
      category: "Leads",
    },
    { id: "create_leads", name: "Create New Leads", category: "Leads" },
    { id: "delete_leads", name: "Delete Leads", category: "Leads" },
    {
      id: "assign_leads",
      name: "Assign Leads to Team",
      category: "Management",
    },
    {
      id: "manage_pipeline",
      name: "Manage Pipeline Stages",
      category: "Management",
    },
    {
      id: "view_reports",
      name: "View Reports & Analytics",
      category: "Reports",
    },
    {
      id: "schedule_activities",
      name: "Schedule Activities",
      category: "Activities",
    },
    { id: "upload_designs", name: "Upload Design Files", category: "Design" },
  ];

  const handleAddRole = () => {
    if (newRoleName.trim()) {
      const newRole = {
        id: Date.now(),
        name: newRoleName.trim(),
        permissions: [],
      };
      setRoles((prev) => [...prev, newRole]);
      setNewRoleName("");
      setIsAddingRole(false);
      toast.success("Role added successfully");
    }
  };

  const handlePermissionToggle = (roleId, permissionId) => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id === roleId) {
          const hasPermission = role.permissions.includes(permissionId);
          return {
            ...role,
            permissions: hasPermission
              ? role.permissions.filter((p) => p !== permissionId)
              : [...role.permissions, permissionId],
          };
        }
        return role;
      })
    );
  };

  const handleDeleteRole = (roleId) => {
    setRoles((prev) => prev.filter((role) => role.id !== roleId));
    toast.success("Role deleted successfully");
  };

  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            User Roles & Permissions
          </h3>
          <p className="text-sm text-gray-600">
            Define what each user role can see and do within this module.
          </p>
        </div>
        <button
          onClick={() => setIsAddingRole(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Role
        </button>
      </div>

      {isAddingRole && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Name
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                className="border p-2 rounded-md w-full"
                autoFocus
              />
            </div>
            <button
              onClick={handleAddRole}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Save
            </button>
            <button
              onClick={() => setIsAddingRole(false)}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800">
                {role.name}
              </h4>
              <button
                onClick={() => handleDeleteRole(role.id)}
                className="text-red-600 hover:text-red-800 p-2"
                title="Delete Role"
              >
                <FaTrash />
              </button>
            </div>

            <div className="space-y-4">
              {Object.entries(permissionsByCategory).map(
                ([category, permissions]) => (
                  <div key={category}>
                    <h5 className="font-medium text-gray-700 mb-2">
                      {category}
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {permissions.map((permission) => (
                        <label
                          key={permission.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={role.permissions.includes(permission.id)}
                            onChange={() =>
                              handlePermissionToggle(role.id, permission.id)
                            }
                            className="rounded border-gray-300"
                          />
                          <span className="text-sm">{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WorkflowSettings = () => {
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: "Lead Conversion Approval",
      description: "Approval required before converting leads to customers",
      stages: [
        { id: 1, role: "Sales Executive", action: "Submit for Approval" },
        { id: 2, role: "Sales Manager", action: "Review & Approve" },
        { id: 3, role: "Admin", action: "Final Approval" },
      ],
      isActive: true,
    },
  ]);

  const [newWorkflow, setNewWorkflow] = useState({
    name: "",
    description: "",
    stages: [{ id: 1, role: "", action: "" }],
  });
  const [isAddingWorkflow, setIsAddingWorkflow] = useState(false);

  const availableRoles = [
    "Sales Executive",
    "Sales Manager",
    "Designer",
    "Admin",
  ];

  const handleAddWorkflow = () => {
    if (
      newWorkflow.name.trim() &&
      newWorkflow.stages.every((s) => s.role && s.action)
    ) {
      const workflow = {
        ...newWorkflow,
        id: Date.now(),
        isActive: true,
      };
      setWorkflows((prev) => [...prev, workflow]);
      setNewWorkflow({
        name: "",
        description: "",
        stages: [{ id: 1, role: "", action: "" }],
      });
      setIsAddingWorkflow(false);
      toast.success("Workflow created successfully");
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const addStageToNewWorkflow = () => {
    setNewWorkflow((prev) => ({
      ...prev,
      stages: [...prev.stages, { id: Date.now(), role: "", action: "" }],
    }));
  };

  const updateNewWorkflowStage = (stageId, field, value) => {
    setNewWorkflow((prev) => ({
      ...prev,
      stages: prev.stages.map((stage) =>
        stage.id === stageId ? { ...stage, [field]: value } : stage
      ),
    }));
  };

  const removeStageFromNewWorkflow = (stageId) => {
    setNewWorkflow((prev) => ({
      ...prev,
      stages: prev.stages.filter((stage) => stage.id !== stageId),
    }));
  };

  const toggleWorkflowStatus = (workflowId) => {
    setWorkflows((prev) =>
      prev.map((workflow) =>
        workflow.id === workflowId
          ? { ...workflow, isActive: !workflow.isActive }
          : workflow
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Approval Workflows
          </h3>
          <p className="text-sm text-gray-600">
            Set up approval sequences for different processes.
          </p>
        </div>
        <button
          onClick={() => setIsAddingWorkflow(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Create Workflow
        </button>
      </div>

      {isAddingWorkflow && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create New Workflow</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Workflow Name
              </label>
              <input
                type="text"
                value={newWorkflow.name}
                onChange={(e) =>
                  setNewWorkflow((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border p-2 rounded-md w-full"
                placeholder="Enter workflow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={newWorkflow.description}
                onChange={(e) =>
                  setNewWorkflow((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="border p-2 rounded-md w-full h-20"
                placeholder="Describe this workflow"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Approval Stages
                </label>
                <button
                  onClick={addStageToNewWorkflow}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Stage
                </button>
              </div>

              <div className="space-y-3">
                {newWorkflow.stages.map((stage, index) => (
                  <div
                    key={stage.id}
                    className="flex items-center gap-3 p-3 bg-white border rounded"
                  >
                    <span className="text-sm font-medium text-gray-500 w-8">
                      #{index + 1}
                    </span>
                    <select
                      value={stage.role}
                      onChange={(e) =>
                        updateNewWorkflowStage(stage.id, "role", e.target.value)
                      }
                      className="border p-2 rounded flex-1"
                    >
                      <option value="">Select Role</option>
                      {availableRoles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={stage.action}
                      onChange={(e) =>
                        updateNewWorkflowStage(
                          stage.id,
                          "action",
                          e.target.value
                        )
                      }
                      placeholder="Action description"
                      className="border p-2 rounded flex-1"
                    />
                    {newWorkflow.stages.length > 1 && (
                      <button
                        onClick={() => removeStageFromNewWorkflow(stage.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddWorkflow}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Workflow
              </button>
              <button
                onClick={() => setIsAddingWorkflow(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {workflow.name}
                </h4>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    workflow.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {workflow.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleWorkflowStatus(workflow.id)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  {workflow.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 overflow-x-auto">
              {workflow.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center gap-2 flex-shrink-0"
                >
                  <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm whitespace-nowrap">
                    <div className="font-medium">{stage.role}</div>
                    <div className="text-xs">{stage.action}</div>
                  </div>
                  {index < workflow.stages.length - 1 && (
                    <FaChevronRight className="text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AutomationSettings = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: "New Lead Alert",
      trigger: "lead_created",
      conditions: [
        { field: "leadSource", operator: "equals", value: "Website" },
      ],
      actions: [
        {
          type: "send_notification",
          target: "sales_team",
          message: "New website lead received",
        },
      ],
      isActive: true,
    },
  ]);

  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "",
    conditions: [{ field: "", operator: "", value: "" }],
    actions: [{ type: "", target: "", message: "" }],
  });
  const [isAddingRule, setIsAddingRule] = useState(false);

  const triggers = [
    { id: "lead_created", name: "When Lead is Created" },
    { id: "lead_updated", name: "When Lead is Updated" },
    { id: "status_changed", name: "When Status Changes" },
    { id: "activity_scheduled", name: "When Activity is Scheduled" },
    { id: "activity_overdue", name: "When Activity is Overdue" },
  ];

  const conditionFields = [
    { id: "leadSource", name: "Lead Source" },
    { id: "projectType", name: "Project Type" },
    { id: "budget", name: "Budget" },
    { id: "status", name: "Status" },
    { id: "rating", name: "Rating" },
  ];

  const operators = [
    { id: "equals", name: "Equals" },
    { id: "not_equals", name: "Not Equals" },
    { id: "greater_than", name: "Greater Than" },
    { id: "less_than", name: "Less Than" },
    { id: "contains", name: "Contains" },
  ];

  const actionTypes = [
    { id: "send_notification", name: "Send Notification" },
    { id: "send_email", name: "Send Email" },
    { id: "send_sms", name: "Send SMS" },
    { id: "assign_lead", name: "Assign Lead" },
    { id: "update_field", name: "Update Field" },
  ];

  const handleAddRule = () => {
    if (newRule.name.trim() && newRule.trigger) {
      const rule = {
        ...newRule,
        id: Date.now(),
        isActive: true,
      };
      setRules((prev) => [...prev, rule]);
      setNewRule({
        name: "",
        trigger: "",
        conditions: [{ field: "", operator: "", value: "" }],
        actions: [{ type: "", target: "", message: "" }],
      });
      setIsAddingRule(false);
      toast.success("Automation rule created successfully");
    }
  };

  const addCondition = () => {
    setNewRule((prev) => ({
      ...prev,
      conditions: [...prev.conditions, { field: "", operator: "", value: "" }],
    }));
  };

  const addAction = () => {
    setNewRule((prev) => ({
      ...prev,
      actions: [...prev.actions, { type: "", target: "", message: "" }],
    }));
  };

  const updateCondition = (index, field, value) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions.map((cond, i) =>
        i === index ? { ...cond, [field]: value } : cond
      ),
    }));
  };

  const updateAction = (index, field, value) => {
    setNewRule((prev) => ({
      ...prev,
      actions: prev.actions.map((action, i) =>
        i === index ? { ...action, [field]: value } : action
      ),
    }));
  };

  const toggleRuleStatus = (ruleId) => {
    setRules((prev) =>
      prev.map((rule) =>
        rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Automation Rules</h3>
          <p className="text-sm text-gray-600">
            Create IF-THEN rules to automate tasks and notifications.
          </p>
        </div>
        <button
          onClick={() => setIsAddingRule(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaRobot /> Create Rule
        </button>
      </div>

      {isAddingRule && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create Automation Rule</h4>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rule Name
              </label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, name: e.target.value }))
                }
                className="border p-2 rounded-md w-full"
                placeholder="Enter rule name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger
              </label>
              <select
                value={newRule.trigger}
                onChange={(e) =>
                  setNewRule((prev) => ({ ...prev, trigger: e.target.value }))
                }
                className="border p-2 rounded-md w-full"
              >
                <option value="">Select trigger</option>
                {triggers.map((trigger) => (
                  <option key={trigger.id} value={trigger.id}>
                    {trigger.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Conditions
                </label>
                <button
                  onClick={addCondition}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  Add Condition
                </button>
              </div>
              {newRule.conditions.map((condition, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={condition.field}
                    onChange={(e) =>
                      updateCondition(index, "field", e.target.value)
                    }
                    className="border p-2 rounded flex-1"
                  >
                    <option value="">Select field</option>
                    {conditionFields.map((field) => (
                      <option key={field.id} value={field.id}>
                        {field.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={condition.operator}
                    onChange={(e) =>
                      updateCondition(index, "operator", e.target.value)
                    }
                    className="border p-2 rounded flex-1"
                  >
                    <option value="">Select operator</option>
                    {operators.map((op) => (
                      <option key={op.id} value={op.id}>
                        {op.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) =>
                      updateCondition(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="border p-2 rounded flex-1"
                  />
                </div>
              ))}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Actions
                </label>
                <button
                  onClick={addAction}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded"
                >
                  Add Action
                </button>
              </div>
              {newRule.actions.map((action, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={action.type}
                    onChange={(e) =>
                      updateAction(index, "type", e.target.value)
                    }
                    className="border p-2 rounded flex-1"
                  >
                    <option value="">Select action</option>
                    {actionTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={action.target}
                    onChange={(e) =>
                      updateAction(index, "target", e.target.value)
                    }
                    placeholder="Target"
                    className="border p-2 rounded flex-1"
                  />
                  <input
                    type="text"
                    value={action.message}
                    onChange={(e) =>
                      updateAction(index, "message", e.target.value)
                    }
                    placeholder="Message"
                    className="border p-2 rounded flex-1"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddRule}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Rule
              </button>
              <button
                onClick={() => setIsAddingRule(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white border rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-semibold text-gray-800">
                  {rule.name}
                </h4>
                <p className="text-sm text-gray-600">
                  Trigger: {triggers.find((t) => t.id === rule.trigger)?.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    rule.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {rule.isActive ? "Active" : "Inactive"}
                </span>
                <button
                  onClick={() => toggleRuleStatus(rule.id)}
                  className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                >
                  {rule.isActive ? "Disable" : "Enable"}
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Conditions</h5>
                {rule.conditions.map((condition, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {
                      conditionFields.find((f) => f.id === condition.field)
                        ?.name
                    }{" "}
                    {operators.find((o) => o.id === condition.operator)?.name}{" "}
                    {condition.value}
                  </div>
                ))}
              </div>
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Actions</h5>
                {rule.actions.map((action, index) => (
                  <div key={index} className="text-sm text-gray-600 mb-1">
                    {actionTypes.find((t) => t.id === action.type)?.name}:{" "}
                    {action.message || action.target}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TemplatesSettings = () => {
  const [templates, setTemplates] = useState([
    {
      id: 1,
      name: "Welcome Email",
      type: "email",
      subject: "Welcome to ArunMedhir Interior Design",
      content:
        "Dear {name}, Thank you for your interest in our interior design services...",
      isActive: true,
    },
    {
      id: 2,
      name: "Follow-up SMS",
      type: "sms",
      subject: "",
      content:
        "Hi {name}, Following up on your interior design inquiry. Call us at {phone} for a free consultation.",
      isActive: true,
    },
  ]);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    type: "email",
    subject: "",
    content: "",
  });
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [activeTab, setActiveTab] = useState("email");

  const handleAddTemplate = () => {
    if (newTemplate.name.trim() && newTemplate.content.trim()) {
      const template = {
        ...newTemplate,
        id: Date.now(),
        isActive: true,
      };
      setTemplates((prev) => [...prev, template]);
      setNewTemplate({ name: "", type: "email", subject: "", content: "" });
      setIsAddingTemplate(false);
      toast.success("Template created successfully");
    }
  };

  const toggleTemplateStatus = (templateId) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId
          ? { ...template, isActive: !template.isActive }
          : template
      )
    );
  };

  const deleteTemplate = (templateId) => {
    setTemplates((prev) =>
      prev.filter((template) => template.id !== templateId)
    );
    toast.success("Template deleted successfully");
  };

  const emailTemplates = templates.filter((t) => t.type === "email");
  const smsTemplates = templates.filter((t) => t.type === "sms");

  const availableVariables = [
    "{name}",
    "{email}",
    "{phone}",
    "{projectType}",
    "{budget}",
    "{address}",
    "{salesRep}",
    "{designer}",
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Email & SMS Templates
          </h3>
          <p className="text-sm text-gray-600">
            Create and manage standardized templates for your team.
          </p>
        </div>
        <button
          onClick={() => setIsAddingTemplate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaEnvelopeOpenText /> Create Template
        </button>
      </div>

      {isAddingTemplate && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create New Template</h4>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={newTemplate.name}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="border p-2 rounded-md w-full"
                  placeholder="Enter template name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={newTemplate.type}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
                  }
                  className="border p-2 rounded-md w-full"
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
            </div>

            {newTemplate.type === "email" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={newTemplate.subject}
                  onChange={(e) =>
                    setNewTemplate((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="border p-2 rounded-md w-full"
                  placeholder="Enter email subject"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                value={newTemplate.content}
                onChange={(e) =>
                  setNewTemplate((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                className="border p-2 rounded-md w-full h-32"
                placeholder="Enter template content"
              />
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">
                  Available variables:
                </p>
                <div className="flex flex-wrap gap-1">
                  {availableVariables.map((variable) => (
                    <button
                      key={variable}
                      onClick={() =>
                        setNewTemplate((prev) => ({
                          ...prev,
                          content: prev.content + variable,
                        }))
                      }
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Save Template
              </button>
              <button
                onClick={() => setIsAddingTemplate(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("email")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "email"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Email Templates ({emailTemplates.length})
            </button>
            <button
              onClick={() => setActiveTab("sms")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "sms"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              SMS Templates ({smsTemplates.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "email" && (
            <div className="space-y-4">
              {emailTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-600 font-medium">
                        Subject: {template.subject}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          template.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        {template.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {template.content}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "sms" && (
            <div className="space-y-4">
              {smsTemplates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800">
                      {template.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          template.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </span>
                      <button
                        onClick={() => toggleTemplateStatus(template.id)}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                      >
                        {template.isActive ? "Disable" : "Enable"}
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded text-sm">
                    {template.content}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Character count: {template.content.length}/160
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add this new component after the other settings components

const StageDependentFormsSettings = ({ stages }) => {
  const [stageForms, setStageForms] = useState([
    {
      id: 1,
      stageId: 4, // Quoted stage
      stageName: "Quoted",
      formName: "Quotation Form",
      fields: [
        {
          id: 1,
          name: "quotedAmount",
          label: "Quoted Amount",
          type: "number",
          required: true,
        },
        {
          id: 2,
          name: "quotationDate",
          label: "Quotation Date",
          type: "date",
          required: true,
        },
        {
          id: 3,
          name: "validUntil",
          label: "Valid Until",
          type: "date",
          required: true,
        },
        {
          id: 4,
          name: "quotationNotes",
          label: "Quotation Notes",
          type: "textarea",
          required: false,
        },
      ],
      isActive: true,
    },
    {
      id: 2,
      stageId: 5, // Converted stage
      stageName: "Converted",
      formName: "Conversion Form",
      fields: [
        {
          id: 1,
          name: "finalQuotation",
          label: "Final Quotation Amount",
          type: "number",
          required: true,
        },
        {
          id: 2,
          name: "signupAmount",
          label: "Signup Amount",
          type: "number",
          required: true,
        },
        {
          id: 3,
          name: "paymentDate",
          label: "Payment Date",
          type: "date",
          required: true,
        },
        {
          id: 4,
          name: "paymentMode",
          label: "Payment Mode",
          type: "select",
          options: ["Cash", "Cheque", "Bank Transfer", "UPI"],
          required: true,
        },
        {
          id: 5,
          name: "panNumber",
          label: "PAN Number",
          type: "text",
          required: false,
        },
        {
          id: 6,
          name: "discount",
          label: "Discount %",
          type: "number",
          required: false,
        },
      ],
      isActive: true,
    },
  ]);

  const [selectedStage, setSelectedStage] = useState("");
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [newForm, setNewForm] = useState({
    formName: "",
    fields: [{ id: 1, name: "", label: "", type: "text", required: true }],
  });

  const fieldTypes = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "tel", label: "Phone" },
    { value: "date", label: "Date" },
    { value: "textarea", label: "Textarea" },
    { value: "select", label: "Dropdown" },
    { value: "checkbox", label: "Checkbox" },
    { value: "file", label: "File Upload" },
  ];

  const availableStages = stages.filter(
    (stage) =>
      stage.isForm && !stageForms.find((form) => form.stageId === stage.id)
  );

  const handleCreateForm = () => {
    if (!selectedStage || !newForm.formName.trim()) {
      toast.error("Please select a stage and enter form name");
      return;
    }

    const stage = stages.find((s) => s.id === parseInt(selectedStage));
    if (!stage) return;

    const form = {
      id: Date.now(),
      stageId: stage.id,
      stageName: stage.name,
      formName: newForm.formName,
      fields: newForm.fields.filter((field) => field.name && field.label),
      isActive: true,
    };

    setStageForms((prev) => [...prev, form]);
    setNewForm({
      formName: "",
      fields: [{ id: 1, name: "", label: "", type: "text", required: true }],
    });
    setSelectedStage("");
    setIsCreatingForm(false);
    toast.success("Form created successfully");
  };

  const addField = () => {
    setNewForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        { id: Date.now(), name: "", label: "", type: "text", required: true },
      ],
    }));
  };

  const updateField = (fieldId, property, value) => {
    setNewForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field) =>
        field.id === fieldId ? { ...field, [property]: value } : field
      ),
    }));
  };

  const removeField = (fieldId) => {
    setNewForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((field) => field.id !== fieldId),
    }));
  };

  const deleteForm = (formId) => {
    setStageForms((prev) => prev.filter((form) => form.id !== formId));
    toast.success("Form deleted successfully");
  };

  const toggleFormStatus = (formId) => {
    setStageForms((prev) =>
      prev.map((form) =>
        form.id === formId ? { ...form, isActive: !form.isActive } : form
      )
    );
  };

  const duplicateForm = (form) => {
    const duplicatedForm = {
      ...form,
      id: Date.now(),
      formName: `${form.formName} (Copy)`,
      fields: form.fields.map((field) => ({
        ...field,
        id: Date.now() + Math.random(),
      })),
    };
    setStageForms((prev) => [...prev, duplicatedForm]);
    toast.success("Form duplicated successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Stage Dependent Forms
          </h3>
          <p className="text-sm text-gray-600">
            Create custom forms that are required when leads move to specific
            pipeline stages.
          </p>
        </div>
        <button
          onClick={() => setIsCreatingForm(true)}
          disabled={availableStages.length === 0}
          className={`px-4 py-2 text-sm rounded-md flex items-center gap-2 ${
            availableStages.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <FaPlus /> Create Form
        </button>
      </div>

      {availableStages.length === 0 && !isCreatingForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            No stages available for form creation. Please add pipeline stages
            with "Form Required" enabled first.
          </p>
        </div>
      )}

      {isCreatingForm && (
        <div className="bg-gray-50 border rounded-lg p-6">
          <h4 className="font-semibold mb-4">Create Stage Form</h4>
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Stage
                </label>
                <select
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Choose a stage</option>
                  {availableStages.map((stage) => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Form Name
                </label>
                <input
                  type="text"
                  value={newForm.formName}
                  onChange={(e) =>
                    setNewForm((prev) => ({
                      ...prev,
                      formName: e.target.value,
                    }))
                  }
                  placeholder="Enter form name"
                  className="border p-2 rounded-md w-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Form Fields
                </label>
                <button
                  onClick={addField}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Field
                </button>
              </div>

              <div className="space-y-4">
                {newForm.fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-4 bg-white"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-medium text-gray-700">
                        Field {index + 1}
                      </h5>
                      {newForm.fields.length > 1 && (
                        <button
                          onClick={() => removeField(field.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Field Name
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) =>
                            updateField(field.id, "name", e.target.value)
                          }
                          placeholder="fieldName"
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            updateField(field.id, "label", e.target.value)
                          }
                          placeholder="Display Label"
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(field.id, "type", e.target.value)
                          }
                          className="border p-2 rounded text-sm w-full"
                        >
                          {fieldTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              updateField(
                                field.id,
                                "required",
                                e.target.checked
                              )
                            }
                            className="rounded border-gray-300"
                          />
                          Required
                        </label>
                      </div>
                    </div>

                    {field.type === "select" && (
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Options (comma separated)
                        </label>
                        <input
                          type="text"
                          value={field.options ? field.options.join(", ") : ""}
                          onChange={(e) =>
                            updateField(
                              field.id,
                              "options",
                              e.target.value.split(", ").filter(Boolean)
                            )
                          }
                          placeholder="Option 1, Option 2, Option 3"
                          className="border p-2 rounded text-sm w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCreateForm}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Create Form
              </button>
              <button
                onClick={() => setIsCreatingForm(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {stageForms.map((form) => (
          <div key={form.id} className="bg-white border rounded-lg">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {form.formName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Required for stage:{" "}
                    <span className="font-medium">{form.stageName}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      form.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    onClick={() => toggleFormStatus(form.id)}
                    className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
                  >
                    {form.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => duplicateForm(form)}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    title="Duplicate Form"
                  >
                    <FaCopy />
                  </button>
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Delete Form"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h5 className="font-medium text-gray-700 mb-3">
                Form Fields ({form.fields.length})
              </h5>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.fields.map((field) => (
                  <div
                    key={field.id}
                    className="border rounded-lg p-3 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-sm text-gray-800">
                        {field.label}
                      </span>
                      {field.required && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Name: {field.name}</div>
                      <div>
                        Type:{" "}
                        {fieldTypes.find((t) => t.value === field.type)?.label}
                      </div>
                      {field.options && (
                        <div>Options: {field.options.join(", ")}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stageForms.length === 0 && !isCreatingForm && (
        <div className="text-center py-12 text-gray-500">
          <FaWrench className="mx-auto text-4xl mb-4 text-gray-300" />
          <p>No stage forms created yet.</p>
          <p className="text-sm">
            Create forms that will be required when leads move to specific
            stages.
          </p>
        </div>
      )}
    </div>
  );
};

// Update the SettingsPage component to include the new tab
const SettingsPage = ({
  leads,
  kanbanStatuses,
  setKanbanStatuses,
  onDeleteStages,
}) => {
  const [activeSettingsPage, setActiveSettingsPage] =
    useState("pipelineStages");

  const settingsPages = [
    {
      id: "pipelineStages",
      label: "Pipeline Stages",
      icon: FaStream,
      description:
        "Add, remove, and reorder the stages in your sales pipeline.",
    },
    {
      id: "stageForms",
      label: "Stage Dependent Forms",
      icon: FaTasks,
      description: "Create custom forms required for specific pipeline stages.",
    },
    {
      id: "permissions",
      label: "User Roles & Permissions",
      icon: FaUserShield,
      description:
        "Define what each user role can see and do within this module.",
    },
    {
      id: "workflow",
      label: "Approval Workflow",
      icon: FaSitemap,
      description:
        "Set up a sequence of roles that must approve a lead to proceed.",
    },
    {
      id: "automation",
      label: "Automation Rules",
      icon: FaRobot,
      description:
        "Create IF-THEN rules to automate tasks like alerts and notifications.",
    },
    {
      id: "templates",
      label: "Email & SMS Templates",
      icon: FaEnvelopeOpenText,
      description:
        "Create and manage standardized templates for your team to use.",
    },
  ];

  const activePage = settingsPages.find((p) => p.id === activeSettingsPage);

  const renderSettingsContent = () => {
    switch (activeSettingsPage) {
      case "pipelineStages":
        return (
          <PipelineSettings
            stages={kanbanStatuses}
            setStages={setKanbanStatuses}
            leads={leads}
            onDeleteStages={onDeleteStages}
          />
        );
      case "stageForms":
        return <StageDependentFormsSettings stages={kanbanStatuses} />;
      case "permissions":
        return <PermissionsSettings />;
      case "workflow":
        return <WorkflowSettings />;
      case "automation":
        return <AutomationSettings />;
      case "templates":
        return <TemplatesSettings />;
      default:
        return (
          <div className="text-center text-gray-500">
            Select a setting to configure.
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg -m-6">
      {/* Top Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex flex-wrap gap-1 border-b border-gray-200">
          {settingsPages.map((page) => (
            <button
              key={page.id}
              onClick={() => setActiveSettingsPage(page.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeSettingsPage === page.id
                  ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              }`}
            >
              <page.icon className="w-4 h-4 flex-shrink-0" />
              <span>{page.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {activePage && (
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <activePage.icon className="w-6 h-6 text-gray-400" />
              {activePage.label}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {activePage.description}
            </p>
          </div>
        )}
        {renderSettingsContent()}
      </div>
    </div>
  );
};

const PipelineSettings = ({ stages, setStages, leads, onDeleteStages }) => {
  const [newStageName, setNewStageName] = useState("");
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [newStageColor, setNewStageColor] = useState("#3b82f6");
  const [isAddingStage, setIsAddingStage] = useState(false);

  const availableColors = [
    "#3b82f6",
    "#6366f1",
    "#10b981",
    "#f59e42",
    "#22d3ee",
    "#ef4444",
    "#a3a3a3",
    "#8b5cf6",
    "#f97316",
    "#06b6d4",
  ];

  const handleAddStage = () => {
    if (newStageName && !stages.some((s) => s.name === newStageName)) {
      const newStage = {
        id: Date.now(),
        name: newStageName,
        isForm: newStageIsForm,
        color: newStageColor,
      };
      setStages((prev) => [...prev, newStage]);
      setNewStageName("");
      setNewStageIsForm(false);
      setNewStageColor("#3b82f6");
      setIsAddingStage(false);
      toast.success("Stage added successfully");
    }
  };

  const handleDeleteStage = (stageToDelete) => {
    onDeleteStages([stageToDelete.name]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setStages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const SortableStageItem = ({ stage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: stage.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border rounded-lg p-4 shadow-sm"
        {...attributes}
        {...listeners}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span className="font-medium">{stage.name}</span>
            {stage.isForm && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                Form Required
              </span>
            )}
          </div>
          <button
            onClick={() => handleDeleteStage(stage)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Delete Stage"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Pipeline Stages</h3>
          <p className="text-sm text-gray-600">
            Add, remove, and reorder the stages in your sales pipeline.
          </p>
        </div>
        <button
          onClick={() => setIsAddingStage(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus /> Add Stage
        </button>
      </div>

      {isAddingStage && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-4">Add New Stage</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stage Name
              </label>
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Enter stage name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <input
                type="color"
                value={newStageColor}
                onChange={(e) => setNewStageColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newStageIsForm}
                  onChange={(e) => setNewStageIsForm(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm">Require form</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddStage}
                disabled={!newStageName.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-all duration-200"
              >
                Add Stage
              </button>
              <button
                onClick={() => setIsAddingStage(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={stages.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {stages.map((stage) => (
              <SortableStageItem key={stage.id} stage={stage} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {stages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FaStream className="mx-auto text-3xl mb-2" />
          <p>No pipeline stages configured</p>
        </div>
      )}
    </div>
  );
};

const SettingContent = ({ role }) => {
  const router = useRouter();

  // Use local state for leads and pipeline stages
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [kanbanStatuses, setKanbanStatuses] = useState([
    { id: 1, name: "New", color: "#3b82f6", isForm: false },
    { id: 2, name: "Contacted", color: "#6366f1", isForm: false },
    { id: 3, name: "Qualified", color: "#10b981", isForm: false },
    { id: 4, name: "Quoted", color: "#f59e42", isForm: false },
    { id: 5, name: "Converted", color: "#22d3ee", isForm: false },
    { id: 6, name: "Lost", color: "#ef4444", isForm: false },
    { id: 7, name: "Junk", color: "#a3a3a3", isForm: false },
  ]);

  // Add state for main view (pipeline or settings)
  const [mainView, setMainView] = useState("settings");

  // Check URL parameters to set initial view
  useEffect(() => {
    if (router.query.view === "settings") {
      setMainView("settings");
    }
  }, [router.query]);

  // Deduplicate leads by leadId (keep first occurrence)
  const dedupedLeads = React.useMemo(() => {
    const seen = new Set();
    return leads.filter((lead) => {
      if (lead && lead.leadId && !seen.has(lead.leadId)) {
        seen.add(lead.leadId);
        return true;
      }
      return false;
    });
  }, [leads]);

  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterText, setFilterText] = useState("");

  // Modal states
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [leadToConvertId, setLeadToConvertId] = useState(null);
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [leadToMarkLost, setLeadToMarkLost] = useState(null);
  const [showJunkReasonModal, setShowJunkReasonModal] = useState(false);
  const [leadToMarkJunkId, setLeadToMarkJunkId] = useState(null);
  const [newStageName, setNewStageName] = useState("");
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showPipelineDropdown, setShowPipelineDropdown] = useState(false);
  const [showDeletePipelineModal, setShowDeletePipelineModal] = useState(false);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'table'
  const [pendingConversion, setPendingConversion] = useState(null); // {lead, fromStatus}
  const [pendingLost, setPendingLost] = useState(null); // {lead, fromStatus}
  const [pendingJunk, setPendingJunk] = useState(null); // {lead, fromStatus}
  const [showScheduleActivityModal, setShowScheduleActivityModal] =
    useState(false);
  const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);

  // Add state for new stage options
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [newStageColor, setNewStageColor] = useState("#3b82f6");

  // All lead operations now update local state
  const leadsByStatus = useMemo(() => {
    const grouped = {};
    kanbanStatuses.forEach((status) => {
      grouped[status.name] = [];
    });
    const filteredLeads = dedupedLeads.filter((lead) =>
      Object.values(lead).some((value) =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      )
    );
    filteredLeads.forEach((lead) => {
      if (grouped[lead.status]) {
        grouped[lead.status].push(lead);
      } else {
        if (!grouped[lead.status]) {
          grouped[lead.status] = [];
        }
        grouped[lead.status].push(lead);
      }
    });
    return grouped;
  }, [dedupedLeads, filterText, kanbanStatuses]);

  const handleViewChange = (view) => {
    setMainView(view);
    if (view === "settings") {
      router.push("?view=settings", undefined, { shallow: true });
    } else {
      router.push(router.pathname, undefined, { shallow: true });
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      console.log("DragEnd: No valid drop target or same position", {
        active,
        over,
      });
      return;
    }
    const leadId = active.id;
    const newStatus = over.id;
    const oldLead = leads.find((l) => l.leadId === leadId);
    console.log("DragEnd:", { leadId, newStatus, oldLead });
    if (newStatus === "Converted") {
      setPendingConversion({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToConvertId(leadId);
      setShowConvertModal(true);
      console.log("Opening Convert Modal", { leadId, newStatus });
    } else if (newStatus === "Lost") {
      setPendingLost({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkLost(oldLead);
      setShowLostReasonModal(true);
      console.log("Opening Lost Modal", { leadId, newStatus });
    } else if (newStatus === "Junk") {
      setPendingJunk({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkJunkId(leadId);
      setShowJunkReasonModal(true);
      console.log("Opening Junk Modal", { leadId, newStatus });
    } else {
      setLeads((prevLeads) =>
        prevLeads.map((l) =>
          l.leadId === leadId ? { ...l, status: newStatus } : l
        )
      );
      console.log("Moved lead to new status", { leadId, newStatus });
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowAddLeadModal(true);
  };

  const handleConvert = (lead) => {
    setLeadToConvertId(lead.leadId);
    setShowConvertModal(true);
  };

  const handleMarkLost = (lead) => {
    setLeadToMarkLost(lead);
    setShowLostReasonModal(true);
  };

  const handleMarkJunk = (lead) => {
    setLeadToMarkJunkId(lead.leadId);
    setShowJunkReasonModal(true);
  };

  const handleOpenAddLeadForm = (status) => {
    const newLeadData = { ...defaultLeadData };
    if (typeof status === "string") {
      newLeadData.status = status;
    }
    setEditingLead(newLeadData);
    setShowAddLeadModal(true);
  };

  const handleAddLeadSubmit = (formData) => {
    const leadData = {
      ...defaultLeadData,
      ...formData,
      status: formData.status || "New",
      submittedBy: role,
    };
    if (editingLead && editingLead.leadId) {
      setLeads((prevLeads) =>
        prevLeads.map((l) =>
          l.leadId === editingLead.leadId ? { ...l, ...leadData } : l
        )
      );
    } else {
      // Assign a new unique leadId
      const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
      setLeads((prevLeads) => [...prevLeads, { ...leadData, leadId: newId }]);
    }
    setShowAddLeadModal(false);
  };

  const handleAddStage = () => {
    if (newStageName && !kanbanStatuses.some((s) => s.name === newStageName)) {
      setKanbanStatuses((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: newStageName,
          isForm: newStageIsForm,
          color: newStageColor,
        },
      ]);
      setNewStageName("");
      setNewStageIsForm(false);
      setNewStageColor("#3b82f6");
      setIsAddingStage(false);
    }
  };

  const handleCancelAddStage = () => {
    setNewStageName("");
    setIsAddingStage(false);
  };

  const handlePipelineAction = (action) => {
    setShowPipelineDropdown(false);
    if (action === "add") {
      setIsAddingStage(true);
    } else if (action === "delete") {
      setShowDeletePipelineModal(true);
    }
  };

  const handleDeleteStages = (stagesToDelete) => {
    // Check if any leads are currently in the stages being deleted
    const leadsInStages = dedupedLeads.filter((lead) =>
      stagesToDelete.includes(lead.status)
    );
    if (leadsInStages.length > 0) {
      toast.error(
        `Cannot delete stages with existing leads. Move ${leadsInStages.length} leads to other stages first.`
      );
      return;
    }

    // Remove stages from kanbanStatuses
    setKanbanStatuses((prev) =>
      prev.filter((stage) => !stagesToDelete.includes(stage.name))
    );
    toast.success(`Deleted ${stagesToDelete.length} stage(s) successfully`);
  };

  const handleConvertModalClose = () => {
    setShowConvertModal(false);
    setLeadToConvertId(null);
    setPendingConversion(null);
  };

  const handleConvertSuccess = (updatedLead) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.leadId === updatedLead.leadId ? updatedLead : l))
    );
    setPendingConversion(null);
    setShowConvertModal(false);
  };

  const handleLostModalClose = () => {
    setShowLostReasonModal(false);
    setLeadToMarkLost(null);
    setPendingLost(null);
  };

  const handleLostSuccess = (updatedLead) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.leadId === updatedLead.leadId ? updatedLead : l))
    );
    setPendingLost(null);
    setShowLostReasonModal(false);
  };

  const handleJunkModalClose = () => {
    setShowJunkReasonModal(false);
    setLeadToMarkJunkId(null);
    setPendingJunk(null);
  };

  const handleJunkSuccess = (updatedLead) => {
    setLeads((prevLeads) =>
      prevLeads.map((l) => (l.leadId === updatedLead.leadId ? updatedLead : l))
    );
    setPendingJunk(null);
    setShowJunkReasonModal(false);
  };

  const handleScheduleActivity = (lead) => {
    setLeadToScheduleActivity(lead);
    setShowScheduleActivityModal(true);
  };

  const handleScheduleActivitySuccess = (activity) => {
    const leadId = activity.leadId;
    setLeads((prevLeads) =>
      prevLeads.map((lead) => {
        if (lead.leadId === leadId) {
          return {
            ...lead,
            activities: [...(lead.activities || []), activity],
          };
        }
        return lead;
      })
    );
    setShowScheduleActivityModal(false);
    setLeadToScheduleActivity(null);
    toast.success("Activity scheduled successfully");
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Pipeline View */}
      {mainView === "pipeline" && (
        <>
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            {/* Left side: New button */}
            <div className="flex items-center gap-4">
              {kanbanStatuses.length > 0 ? (
                <button
                  onClick={() => handleOpenAddLeadForm()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition-all duration-200"
                >
                  <FaPlus /> New
                </button>
              ) : (
                <Tooltip content="Please add pipeline stages first">
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md font-medium flex items-center gap-2 cursor-not-allowed"
                  >
                    <FaPlus /> New
                  </button>
                </Tooltip>
              )}
            </div>

            {/* Center: Sales Manager Pipeline */}
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                Sales Manager - Lead Pipeline
              </h1>
              <div className="relative">
                <button
                  onClick={() => setShowPipelineDropdown(!showPipelineDropdown)}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-all duration-200"
                  title="Pipeline Settings"
                >
                  <FaCog />
                </button>
                {showPipelineDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-10">
                    <div className="py-1">
                      <button
                        onClick={() => handlePipelineAction("add")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <FaPlus /> Add Stage
                      </button>
                      <button
                        onClick={() => handlePipelineAction("delete")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        disabled={kanbanStatuses.length === 0}
                      >
                        <FaTrash /> Delete Stages
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Search, View toggles, and Settings */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    viewMode === "kanban"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Kanban View"
                >
                  <FaThLarge />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 border-l border-gray-300 ${
                    viewMode === "table"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                  title="Table View"
                >
                  <FaListUl />
                </button>
              </div>

              {/* Settings Button */}
              <button
                onClick={() => handleViewChange("settings")}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2 transition-all duration-200"
              >
                <FaCog /> Settings
              </button>
            </div>
          </div>

          {/* Add Stage Form */}
          {isAddingStage && (
            <div className="mb-6 p-4 bg-white rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Add New Pipeline Stage
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stage Name
                  </label>
                  <input
                    type="text"
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    placeholder="Enter stage name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={newStageColor}
                    onChange={(e) => setNewStageColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="requireForm"
                      checked={newStageIsForm}
                      onChange={(e) => setNewStageIsForm(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm">Require form</span>
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddStage}
                    disabled={!newStageName.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-md transition-all duration-200"
                  >
                    Add Stage
                  </button>
                  <button
                    onClick={handleCancelAddStage}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {viewMode === "kanban" ? (
            <KanbanBoard
              leadsByStatus={leadsByStatus}
              kanbanStatuses={kanbanStatuses}
              onDragEnd={handleDragEnd}
              onEdit={handleEdit}
              onConvert={handleConvert}
              onMarkLost={handleMarkLost}
              onMarkJunk={handleMarkJunk}
              onScheduleActivity={handleScheduleActivity}
              onAddLead={handleOpenAddLeadForm}
            />
          ) : (
            <LeadsTable leads={dedupedLeads} />
          )}
        </>
      )}

      {/* Settings View */}
      {mainView === "settings" && (
        <div className="space-y-6">
          {/* Settings Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sales Manager Settings
              </h1>
              <p className="text-sm text-gray-600">
                Configure your lead management system
              </p>
            </div>
            <button
              onClick={() => handleViewChange("pipeline")}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FaChevronLeft /> Back to Pipeline
            </button>
          </div>

          <SettingsPage
            leads={dedupedLeads}
            kanbanStatuses={kanbanStatuses}
            setKanbanStatuses={setKanbanStatuses}
            onDeleteStages={handleDeleteStages}
          />
        </div>
      )}

      {/* Modals */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => {
          setShowAddLeadModal(false);
          setEditingLead(null);
        }}
        onSubmit={handleAddLeadSubmit}
        editingLead={editingLead}
        salesPersons={salesPersons}
        designers={designers}
        kanbanStatuses={kanbanStatuses}
      />

      <ConvertLeadModal
        isOpen={showConvertModal}
        onClose={handleConvertModalClose}
        leadId={leadToConvertId}
        onSuccess={handleConvertSuccess}
        leads={leads}
      />

      <LostLeadModal
        isOpen={showLostReasonModal}
        onClose={handleLostModalClose}
        lead={leadToMarkLost}
        onSuccess={handleLostSuccess}
      />

      {showJunkReasonModal && (
        <JunkReasonModal
          onClose={handleJunkModalClose}
          lead={
            leadToMarkJunkId
              ? leads.find((l) => l.leadId === leadToMarkJunkId)
              : null
          }
          onSuccess={handleJunkSuccess}
        />
      )}

      <DeletePipelineModal
        isOpen={showDeletePipelineModal}
        onClose={() => setShowDeletePipelineModal(false)}
        stages={kanbanStatuses.map((s) => s.name)}
        onDeleteStages={handleDeleteStages}
      />

      <AdvancedScheduleActivityModal
        isOpen={showScheduleActivityModal}
        onClose={() => {
          setShowScheduleActivityModal(false);
          setLeadToScheduleActivity(null);
        }}
        lead={leadToScheduleActivity}
        onSuccess={handleScheduleActivitySuccess}
      />
    </div>
  );
};

const Setting = () => {
  const [currentRole, setCurrentRole] = useState("");

  useEffect(() => {
    // Get role from sessionStorage
    const role = sessionStorage.getItem("currentRole");
    setCurrentRole(role || "SALESMANAGER");
  }, []);

  return (
    <MainLayout>
      <SettingContent role={currentRole} />
    </MainLayout>
  );
};

export default Setting;
