import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  FaPlus,
  FaCog,
  FaSearch,
  FaThLarge,
  FaListUl,
  FaChevronDown,
  FaTrash,
  FaTimes,
  FaStream,
  FaTasks,
  FaUserShield,
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import ConvertLeadModal from "@/components/Sales/ConvertLeadModal";
import LostLeadModal from "@/components/Sales/LostLeadModal";
import JunkReasonModal from "@/components/Sales/JunkReasonModal";
import AddLeadModal from "@/components/Sales/AddLeadModal";
import KanbanBoard from "@/components/Sales/KanbanBoard";
import { fetchLeads, updateLead, createLead } from "@/redux/slices/leadsSlice";
import {
  addStage,
  removeStage,
  fetchPipelines,
  createPipeline,
  deletePipeline,
  reorderPipelines,
} from "@/redux/slices/pipelineSlice";
import { fetchFieldTypes, selectFieldTypes, selectFieldTypesLoading } from "@/redux/slices/fieldTypesSlice";
import { 
  createForm, 
  fetchFormByStage, 
  submitFormData,
  selectFormBuilderLoading, 
  selectFormBuilderError, 
  selectFormBuilderSuccess, 
  selectCurrentForm,
  selectFormSubmissionLoading,
  selectFormSubmissionError,
  selectFormSubmissionSuccess,
  clearFormBuilderState 
} from "@/redux/slices/formBuilderSlice";
import DynamicFormModal from "@/components/DynamicFormModal";
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

// Add new warning modal for individual stage deletion
const DeleteStageWarningModal = ({ isOpen, onClose, stage, onConfirmDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  
  console.log('DeleteStageWarningModal render:', { isOpen, stage });
  
  if (!isOpen || !stage) return null;

  const handleConfirmDelete = async () => {
    console.log('handleConfirmDelete called');
    setIsDeleting(true);
    try {
      await onConfirmDelete(stage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Delete Pipeline Stage
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`transition-colors duration-200 ${
              isDeleting 
                ? 'text-gray-300 cursor-not-allowed' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="font-medium text-lg">{stage.name}</span>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="text-yellow-600 text-xl">⚠️</div>
              <div>
                <p className="text-sm text-yellow-700">
                  Are you sure you want to delete this stage?
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm border border-gray-300 rounded-md transition-all duration-200 ${
              isDeleting 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-all duration-200 ${
              isDeleting 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isDeleting ? 'Deleting...' : 'Yes, Delete Stage'}
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
  // Frozen state - no changes allowed
  const roles = [
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
  ];

  // Disable all state changes
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

  // Disabled handlers - no actions allowed
  const handleAddRole = () => {
    toast.error("User Roles & Permissions is currently frozen. No changes allowed.");
  };

  const handlePermissionToggle = (roleId, permissionId) => {
    toast.error("User Roles & Permissions is currently frozen. No changes allowed.");
  };

  const handleDeleteRole = (roleId) => {
    toast.error("User Roles & Permissions is currently frozen. No changes allowed.");
  };

  const permissionsByCategory = allPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaUserShield className="w-7 h-7 text-gray-400" />
            User Roles & Permissions
          </h3>
          <p className="mt-2 text-base text-gray-600">
            Define what each user role can see and do within this module.
          </p>
        </div>
        <button
          onClick={() => setIsAddingRole(true)}
          disabled
          className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed flex items-center gap-2"
          title="User Roles & Permissions is frozen"
        >
          <FaPlus /> Add Role
        </button>
      </div>

      {/* Frozen Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="text-yellow-600">🔒</div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">User Roles & Permissions Frozen</h3>
            <p className="text-sm text-yellow-700">This section is currently locked and no changes can be made.</p>
          </div>
        </div>
      </div>



      {isAddingRole && (
        <div className="p-6 bg-gray-50 rounded-lg border opacity-50">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-500 mb-2">
                Role Name
              </label>
              <input
                type="text"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
                className="border p-2 rounded-md w-full bg-gray-100"
                disabled
                autoFocus
              />
            </div>
            <button
              onClick={handleAddRole}
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md h-10 cursor-not-allowed"
            >
              Save Role
            </button>
            <button
              onClick={() => setIsAddingRole(false)}
              className="px-4 py-2 border rounded-md h-10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h4 className="text-xl font-bold text-gray-800">
                {role.name}
              </h4>
              <button
                onClick={() => handleDeleteRole(role.id)}
                  className="text-gray-300 p-2 rounded-full cursor-not-allowed"
                title="User Roles & Permissions is frozen"
                disabled
              >
                <FaTrash />
              </button>
            </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {Object.entries(permissionsByCategory).map(
                ([category, permissions]) => (
                    <div key={category} className="space-y-4">
                      <h5 className="font-semibold text-gray-700 text-base">
                      {category}
                    </h5>
                      <div className="space-y-3">
                      {permissions.map((permission) => (
                        <label
                          key={permission.id}
                            className="flex items-center gap-3 cursor-not-allowed opacity-60"
                        >
                        <input
                          type="checkbox"
                              checked={role.permissions.includes(
                                permission.id
                              )}
                            onChange={() =>
                              handlePermissionToggle(role.id, permission.id)
                            }
                              className="h-4 w-4 rounded border-gray-300 text-gray-400 focus:ring-gray-300"
                              disabled
                          />
                            <span className="text-sm text-gray-500">
                              {permission.name}
                            </span>
                      </label>
                    ))}
                  </div>
                </div>
                )
              )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



// AutomationSettings component removed - no longer needed

// TemplatesSettings component removed - no longer needed

// Add this new component after the other settings components

const StageDependentFormsSettings = ({ stages }) => {
  const dispatch = useDispatch();
  const fieldTypesData = useSelector(selectFieldTypes);
  const fieldTypesLoading = useSelector(selectFieldTypesLoading);
  const formBuilderLoading = useSelector(selectFormBuilderLoading);
  const formBuilderError = useSelector(selectFormBuilderError);
  const formBuilderSuccess = useSelector(selectFormBuilderSuccess);
  const formSubmissionError = useSelector(selectFormSubmissionError);
  const formSubmissionSuccess = useSelector(selectFormSubmissionSuccess);
  
  const [selectedStage, setSelectedStage] = useState("");
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [formConfig, setFormConfig] = useState({
    formName: "",
    description: "",
    fields: []
  });
  const [selectedField, setSelectedField] = useState(null);

  const availableStages = stages;



  // Fetch field types when form builder is opened
  const handleOpenFormBuilder = () => {
    setIsCreatingForm(true);
  };

  // Fetch field types when Stage Dependent Forms tab is selected
  useEffect(() => {
    dispatch(fetchFieldTypes());
  }, [dispatch]);

  // Get all field types flattened from backend - data is already transformed in Redux
  const allFieldTypes = useMemo(() => {
    if (!fieldTypesData || Object.keys(fieldTypesData).length === 0) {
      return [];
    }
    
    const flattened = [];
    Object.entries(fieldTypesData).forEach(([category, fieldTypes]) => {
      if (Array.isArray(fieldTypes)) {
        // The fieldTypes are already objects with all properties from Redux
        fieldTypes.forEach(fieldType => {
          flattened.push({
            ...fieldType,
            category: category
          });
        });
      }
    });
    return flattened;
  }, [fieldTypesData]);

  // Field creation using backend field types
  const createField = (fieldTypeData) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldTypeData.type,
      label: fieldTypeData.defaultLabel || fieldTypeData.label,
      placeholder: "",
      required: false,
      helpText: "",
      options: ['SELECT', 'RADIO', 'CHECKBOX', 'MULTI_SELECT'].includes(fieldTypeData.type.toUpperCase()) 
        ? ["Option 1", "Option 2", "Option 3"] 
        : [],
      validation: fieldTypeData.validation || {},
      properties: fieldTypeData.properties || {}
    };

    setFormConfig(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
    setSelectedField(newField);
  };
  
  // Simple field operations
  const updateField = (fieldId, updates) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.map(field =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
    
    if (selectedField?.id === fieldId) {
      setSelectedField(prev => ({ ...prev, ...updates }));
    }
  };

  const removeField = (fieldId) => {
    setFormConfig(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId, direction) => {
    setFormConfig(prev => {
      const fields = [...prev.fields];
      const currentIndex = fields.findIndex(f => f.id === fieldId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex >= 0 && newIndex < fields.length) {
        [fields[currentIndex], fields[newIndex]] = [fields[newIndex], fields[currentIndex]];
      }
      
      return { ...prev, fields };
    });
  };

  // Field Palette using backend field types
  const FieldPalette = () => {
    if (fieldTypesLoading) {
      return (
    <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-800">Add Fields</h3>
            <p className="text-sm text-gray-600">Loading field types...</p>
      </div>
          <div className="p-4">
            <div className="animate-pulse space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="w-80 bg-white border-r border-gray-200 h-full overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Add Fields</h3>
          <p className="text-sm text-gray-600">Click to add fields to your form</p>
        </div>
        
                <div className="p-4 space-y-4">
          {Object.entries(fieldTypesData || {}).map(([category, fieldTypes]) => (
            <div key={category} className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {category.replace(/_/g, ' ')}
            </h4>
            <div className="space-y-2">
              {fieldTypes.map((fieldType) => (
                <button
                  key={fieldType.type}
                  onClick={() => createField(fieldType)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 text-left transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{fieldType.icon}</span>
                    <div className="font-medium text-gray-800">{fieldType.label}</div>
                      </div>
                  <div className="text-xs text-gray-600">{fieldType.description}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };

  // Field Preview using backend field types
  const FieldPreview = ({ field }) => {
    const renderField = () => {
      const fieldType = field.type.toUpperCase();
      
      switch (fieldType) {
        case 'TEXT':
        case 'EMAIL':
        case 'PHONE':
        case 'NUMBER':
        case 'PASSWORD':
        case 'URL':
        case 'CURRENCY':
        case 'PERCENTAGE':
          return (
            <input
              type={fieldType === 'EMAIL' ? 'email' : 
                    fieldType === 'PHONE' ? 'tel' : 
                    fieldType === 'NUMBER' ? 'number' : 
                    fieldType === 'PASSWORD' ? 'password' : 
                    fieldType === 'URL' ? 'url' : 'text'}
              placeholder={field.placeholder || `Enter ${String(field.label).toLowerCase()}`}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled
            />
          );

        case 'TEXTAREA':
          return (
            <textarea
              placeholder={field.placeholder || `Enter ${String(field.label).toLowerCase()}`}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              rows="3"
              disabled
            />
          );

        case 'SELECT':
        case 'MULTI_SELECT':
          return (
            <select className="w-full border border-gray-300 rounded-md px-3 py-2" disabled>
              <option>Please select...</option>
              {field.options.map((option, idx) => (
                <option key={idx}>{String(option)}</option>
              ))}
            </select>
          );

        case 'RADIO':
          return (
            <div className="space-y-2">
              {field.options.map((option, idx) => (
                <label key={idx} className="flex items-center gap-2">
                  <input type="radio" disabled className="w-4 h-4" />
                  <span>{String(option)}</span>
                </label>
              ))}
            </div>
          );

        case 'CHECKBOX':
        case 'TOGGLE':
          return (
            <div className="flex items-center gap-2">
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                false ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </div>
            </div>
          );

        case 'DATE':
        case 'TIME':
        case 'DATETIME':
        case 'MONTH':
        case 'WEEK':
          return (
                  <input
              type={fieldType === 'TIME' ? 'time' : 
                    fieldType === 'DATETIME' ? 'datetime-local' : 
                    fieldType === 'MONTH' ? 'month' : 
                    fieldType === 'WEEK' ? 'week' : 'date'}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              disabled
            />
          );

                case 'FILE':
        case 'IMAGE':
          return (
            <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500 text-sm">
              Choose file...
                </div>
          );

        case 'COLOR':
          return (
            <input
              type="color"
              className="w-full h-10 border border-gray-300 rounded-md"
              disabled
            />
          );

        case 'RANGE':
          return (
              <input
                type="range"
              min="0"
              max="100"
                className="w-full"
              disabled
            />
          );

        case 'RATING':
          return (
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-2xl text-gray-300">⭐</span>
              ))}
        </div>
          );

        case 'SIGNATURE':
          return (
            <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
              <span className="text-gray-500">Signature Area</span>
            </div>
          );

        case 'HIDDEN':
          return (
            <input
              type="hidden"
              className="hidden"
              disabled
            />
          );

        case 'SECTION':
          return (
            <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h4 className="font-medium text-gray-800 mb-2">{field.label}</h4>
              <p className="text-sm text-gray-600">Section content goes here</p>
      </div>
          );

        case 'DIVIDER':
          return (
            <hr className="w-full border-t-2 border-gray-300" />
          );

        case 'SPACER':
          return (
            <div className="w-full h-8 bg-transparent"></div>
          );

        case 'HIDDEN':
          return (
            <input
              type="hidden"
              className="hidden"
              disabled
            />
          );



        default:
          return <div className="text-gray-500">Field type: {String(field.type)}</div>;
      }
    };

    return (
      <div className="space-y-2">
        {renderField()}
        {field.helpText && (
          <p className="text-sm text-gray-600">{String(field.helpText)}</p>
        )}
      </div>
    );
  };

    // Simple Properties Panel - NO RE-RENDERS
  const PropertiesPanel = () => {
    if (!selectedField) {
      return (
        <div className="w-80 bg-white border-l border-gray-200 p-6">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">⚙️</div>
            <p>Select a field to edit its settings</p>
          </div>
        </div>
      );
    }

    // Use refs to avoid re-renders
    const labelRef = useRef(null);
    const placeholderRef = useRef(null);
    const helpTextRef = useRef(null);

    // Set initial values
    useEffect(() => {
      if (labelRef.current) labelRef.current.value = selectedField.label || '';
      if (placeholderRef.current) placeholderRef.current.value = selectedField.placeholder || '';
      if (helpTextRef.current) helpTextRef.current.value = selectedField.helpText || '';
    }, [selectedField?.id]);

    const handleLabelChange = () => {
      if (labelRef.current) {
        updateField(selectedField.id, { label: labelRef.current.value });
      }
    };

    const handlePlaceholderChange = () => {
      if (placeholderRef.current) {
        updateField(selectedField.id, { placeholder: placeholderRef.current.value });
      }
    };

    const handleHelpTextChange = () => {
      if (helpTextRef.current) {
        updateField(selectedField.id, { helpText: helpTextRef.current.value });
      }
    };

    const handleRequiredChange = (e) => {
      updateField(selectedField.id, { required: e.target.checked });
    };

    const handleOptionChange = (idx, value) => {
      const newOptions = [...selectedField.options];
      newOptions[idx] = value;
      updateField(selectedField.id, { options: newOptions });
    };

    const handleRemoveOption = (idx) => {
      const newOptions = selectedField.options.filter((_, i) => i !== idx);
      updateField(selectedField.id, { options: newOptions });
    };

    const handleAddOption = () => {
      const newOptions = [...selectedField.options, `Option ${selectedField.options.length + 1}`];
      updateField(selectedField.id, { options: newOptions });
    };

    return (
      <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Edit Field</h3>
          <p className="text-sm text-gray-600">{String(selectedField.type)}</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Label */}
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              Label
              </label>
              <input
              ref={labelRef}
                type="text"
              onBlur={handleLabelChange}
              onKeyDown={(e) => e.key === 'Enter' && handleLabelChange()}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              placeholder="Enter field label"
              />
              </div>

          {/* Placeholder */}
          {['TEXT', 'TEXTAREA', 'EMAIL', 'PHONE', 'NUMBER', 'PASSWORD', 'URL', 'CURRENCY', 'PERCENTAGE'].includes(selectedField.type.toUpperCase()) && (
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Placeholder Text
              </label>
                <input
                ref={placeholderRef}
                  type="text"
                onBlur={handlePlaceholderChange}
                onKeyDown={(e) => e.key === 'Enter' && handlePlaceholderChange()}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Hint text for users"
                />
              </div>
          )}

          {/* Required */}
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedField.required || false}
                onChange={handleRequiredChange}
                className="w-4 h-4"
                />
                <span className="text-sm font-medium text-gray-700">Required field</span>
              </label>
            </div>

          {/* Help Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Help Text (Optional)
              </label>
              <textarea
              ref={helpTextRef}
              onBlur={handleHelpTextChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                placeholder="Additional instructions for users"
              />
            </div>

          {/* Options for choice fields */}
          {['SELECT', 'RADIO', 'MULTI_SELECT', 'CHECKBOX'].includes(selectedField.type.toUpperCase()) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {selectedField.options.map((option, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      defaultValue={option}
                      onBlur={(e) => handleOptionChange(idx, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleOptionChange(idx, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                      placeholder={`Option ${idx + 1}`}
                    />
                <button
                      onClick={() => handleRemoveOption(idx)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      ×
                </button>
              </div>
                ))}
                        <button
                  onClick={handleAddOption}
                  className="w-full py-2 px-3 border-2 border-dashed border-gray-300 rounded-md text-gray-600 hover:border-gray-400"
                >
                  + Add Option
                        </button>
              </div>
            </div>
          )}
                    </div>
                </div>
    );
  };

  // Simple Form Builder - NO RE-RENDERS
  const FormBuilder = () => {
    const formNameRef = useRef(null);
    const formDescRef = useRef(null);

    // Set initial values
    useEffect(() => {
      if (formNameRef.current) formNameRef.current.value = formConfig.formName || '';
      if (formDescRef.current) formDescRef.current.value = formConfig.description || '';
    }, []);

    const handleFormNameChange = () => {
      if (formNameRef.current) {
        setFormConfig(prev => ({ ...prev, formName: formNameRef.current.value }));
      }
    };

    const handleFormDescChange = () => {
      if (formDescRef.current) {
        setFormConfig(prev => ({ ...prev, description: formDescRef.current.value }));
      }
    };

    return (
    <div className="flex-1 bg-gray-50 overflow-auto">
      <div className="p-6">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Title
              </label>
                        <input
                  ref={formNameRef}
                          type="text"
                  onBlur={handleFormNameChange}
                  onKeyDown={(e) => e.key === 'Enter' && handleFormNameChange()}
                placeholder="Enter your form title"
                  className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Form Description (Optional)
              </label>
              <textarea
                  ref={formDescRef}
                  onBlur={handleFormDescChange}
                placeholder="Add a description to help people understand your form"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows="3"
              />
                  </div>
              </div>
            </div>

        {/* Form Fields */}
        <div className="space-y-4">
          {formConfig.fields.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Start Building Your Form</h3>
              <p className="text-gray-600">Click on any field type from the left panel to add it to your form</p>
            </div>
          ) : (
            formConfig.fields.map((field, index) => (
                <FieldEditor key={field.id} field={field} index={index} />
            ))
          )}
          </div>
        </div>
    </div>
  );
  };

  // Simple Field Editor
  const FieldEditor = ({ field, index }) => {
    const isSelected = selectedField?.id === field.id;
    
    // Find field type from backend data
    const fieldType = allFieldTypes.find(f => f.type === field.type);

    return (
      <div className={`bg-white rounded-lg shadow-sm border-2 ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
      }`}>
        {/* Field Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
              <div className="font-medium text-gray-800">{String(field.label)}</div>
                </div>
                <div className="flex items-center gap-2">
            {/* Move buttons */}
                  <button
              onClick={() => moveField(field.id, 'up')}
              disabled={index === 0}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move up"
            >
              ↑
                  </button>
                  <button
              onClick={() => moveField(field.id, 'down')}
              disabled={index === formConfig.fields.length - 1}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
              title="Move down"
            >
              ↓
                  </button>
            {/* Edit button */}
                  <button
              onClick={() => setSelectedField(field)}
              className={`px-3 py-1 text-sm rounded-md ${
                isSelected 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected ? 'Active' : 'Edit'}
            </button>
            {/* Delete button */}
            <button
              onClick={() => removeField(field.id)}
              className="p-1 text-red-400 hover:text-red-600"
              title="Delete field"
            >
              ×
                  </button>
                </div>
              </div>

        {/* Field Preview */}
        <div className="p-4">
          <FieldPreview field={field} />
            </div>
      </div>
    );
  };



  // Handle create form
  const handleCreateForm = async () => {
    if (!selectedStage || !formConfig.formName.trim()) {
      toast.error("Please select a stage and enter a form name");
      return;
    }

    if (formConfig.fields.length === 0) {
      toast.error("Please add at least one field to the form");
      return;
    }

    // Find the selected stage to get its ID
    const selectedStageData = stages.find(stage => stage.id === selectedStage);
    if (!selectedStageData) {
      toast.error("Selected stage not found");
      return;
    }

    // Format fields for API
    const formattedFields = formConfig.fields.map((field, index) => ({
      fieldType: field.type,
      label: field.label,
      placeholder: field.placeholder || "",
      required: field.required || false,
      helpText: field.helpText || "",
      options: field.options || [],
      validation: field.validation || {},
      properties: field.properties || {}
    }));

    // Prepare form data for API
    const formData = {
      formTitle: formConfig.formName,
      formDescription: formConfig.description || "",
      stageId: selectedStageData.stageId, // Use the actual stage ID from the stage data
      createdBy: sessionStorage.getItem("userId") || "USER-123456789", // Get from session or use default
      fields: formattedFields
    };

    console.log("Form Data being sent:", formData);

    try {
      const result = await dispatch(createForm(formData));
      
      if (createForm.fulfilled.match(result)) {
        toast.success("Form created successfully!");
        setIsCreatingForm(false);
        setFormConfig({
          formName: "",
          description: "",
          fields: []
        });
        setSelectedField(null);
        setSelectedStage("");
        
        // Clear form builder state after success
        setTimeout(() => {
          dispatch(clearFormBuilderState());
        }, 2000);
      } else {
        toast.error("Failed to create form. Please try again.");
      }
    } catch (error) {
      console.error("Error creating form:", error);
      toast.error("An error occurred while creating the form");
    }
  };

  // Check if form is ready to be created
  const isFormReady = selectedStage && formConfig.formName.trim() && formConfig.fields.length > 0;

  // Show error toast if form builder has error
  useEffect(() => {
    if (formBuilderError) {
      toast.error(formBuilderError.message || formBuilderError || "Failed to create form");
    }
  }, [formBuilderError]);

  // Show error toast if form submission has error
  useEffect(() => {
    if (formSubmissionError) {
      toast.error(formSubmissionError.message || formSubmissionError || "Failed to submit form");
    }
  }, [formSubmissionError]);

  // Show success toast if form submission is successful
  useEffect(() => {
    if (formSubmissionSuccess) {
      toast.success("Form submitted successfully!");
    }
  }, [formSubmissionSuccess]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaTasks className="w-7 h-7 text-gray-400" />
            Stage Dependent Forms
          </h3>
          <p className="mt-2 text-base text-gray-600">
            Create custom forms required for specific pipeline stages.
          </p>
            </div>
        <button
          onClick={handleOpenFormBuilder}
          className="px-6 py-3 text-sm rounded-md flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 font-medium"
        >
          <FaPlus /> Create New Form
        </button>
          </div>

      {/* Stage availability check */}
      {availableStages.length === 0 && !isCreatingForm && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">No pipeline stages available. Please add pipeline stages first.</p>
        </div>
      )}

      {/* Form Builder Interface */}
      {isCreatingForm && (
        <div className="bg-white border rounded-lg overflow-hidden shadow-xl">
          {/* Header */}
          <div className="p-6 border-b bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-xl text-gray-800">Build Your Form</h4>
              <button
                onClick={() => {
                  setIsCreatingForm(false);
                  setFormConfig({ formName: "", description: "", fields: [] });
                  setSelectedField(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="max-w-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Which stage will use this form?
              </label>
              <select 
                value={selectedStage} 
                onChange={(e) => setSelectedStage(e.target.value)} 
                className="border border-gray-300 p-3 rounded-md w-full"
              >
                <option value="">Choose a stage</option>
                {availableStages.map((stage) => (
                  <option key={stage.id} value={stage.id}>{stage.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="h-[600px] flex">
            <FieldPalette />
            <FormBuilder />
            <PropertiesPanel />
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            {/* Status indicator */}
            <div className="mb-4 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <span className={`flex items-center gap-1 ${selectedStage ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${selectedStage ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {selectedStage ? 'Stage selected' : 'Select a stage'}
                </span>
                <span className={`flex items-center gap-1 ${formConfig.formName.trim() ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${formConfig.formName.trim() ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {formConfig.formName.trim() ? 'Form title added' : 'Add form title'}
                </span>
                <span className={`flex items-center gap-1 ${formConfig.fields.length > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                  <span className={`w-2 h-2 rounded-full ${formConfig.fields.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  {formConfig.fields.length > 0 ? `${formConfig.fields.length} field(s) added` : 'Add at least one field'}
                </span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setIsCreatingForm(false);
                  setFormConfig({ formName: "", description: "", fields: [] });
                  setSelectedField(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateForm}
                disabled={!isFormReady || formBuilderLoading}
                className={`px-8 py-2 rounded-md font-medium transition-all duration-200 ${
                  isFormReady && !formBuilderLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {formBuilderLoading ? 'Creating Form...' : 'Create Form'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isCreatingForm && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">Simple Form Builder</h3>
          <p className="text-gray-600">Create forms for your pipeline stages</p>
        </div>
      )}
    </div>
  );
};

// Update the SettingsPage component to include the new tab
const SettingsPage = ({
  leads,
  kanbanStatuses,
  onAddStage,
  onReorderStages,
  onDeleteStages,
}) => {
  const [activeSettingsPage, setActiveSettingsPage] =
    useState("pipelineStages");

  // If permissions tab is frozen and currently active, switch to pipeline stages
  useEffect(() => {
    if (activeSettingsPage === "permissions") {
      const permissionsPage = settingsPages.find(p => p.id === "permissions");
      if (permissionsPage && permissionsPage.disabled) {
        setActiveSettingsPage("pipelineStages");
        toast.error("User Roles & Permissions is currently frozen. Switched to Pipeline Stages.");
      }
    }
  }, [activeSettingsPage]);

  const settingsPages = [
    {
      id: "pipelineStages",
      label: "Pipeline Stages",
      icon: FaStream,
      description:
        "Add, remove, and reorder the stages in your sales pipeline.",
      disabled: false,
    },
    {
      id: "stageForms",
      label: "Stage Dependent Forms",
      icon: FaTasks,
      description: "Create custom forms required for specific pipeline stages.",
      disabled: false,
    },
    {
      id: "permissions",
      label: "User Roles & Permissions",
      icon: FaUserShield,
      description:
        "Define what each user role can see and do within this module.",
      disabled: true, // Frozen tab
    },
  ];

  const activePage = settingsPages.find((p) => p.id === activeSettingsPage);

  const renderSettingsContent = () => {
    switch (activeSettingsPage) {
      case "pipelineStages":
        return (
          <PipelineSettings
            stages={kanbanStatuses}
            onAddStage={onAddStage}
            onReorderStages={onReorderStages}
            onDeleteStages={onDeleteStages}
          />
        );
      case "stageForms":
        return <StageDependentFormsSettings stages={kanbanStatuses} />;
      case "permissions":
        return <PermissionsSettings />;
      default:
        return (
          <div className="text-center text-gray-500">
            Select a setting to configure.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Horizontal Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto scrollbar-hide">
            {settingsPages.map((page) => (
              <button
                key={page.id}
                onClick={() => {
                  if (!page.disabled) {
                    setActiveSettingsPage(page.id);
                  } else {
                    toast.error("User Roles & Permissions is currently frozen and cannot be accessed.");
                  }
                }}
                disabled={page.disabled}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 ${
                  page.disabled
                    ? "border-transparent text-gray-400 bg-gray-50 cursor-not-allowed opacity-60"
                    : activeSettingsPage === page.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                }`}
                title={page.disabled ? "User Roles & Permissions is frozen" : page.label}
              >
                <page.icon className="w-5 h-5 flex-shrink-0" />
                <span>{page.label}</span>
                {page.disabled && <span className="text-xs text-gray-400">🔒</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Active Page Content */}
        <div className="p-8">
          {activePage && renderSettingsContent()}
        </div>
      </div>
    </div>
  );
};

const PipelineSettings = ({
  stages,
  onAddStage,
  onReorderStages,
  onDeleteStages,
}) => {
  const [newStageName, setNewStageName] = useState("");
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [newStageFormType, setNewStageFormType] = useState("");
  const [newStageColor, setNewStageColor] = useState("#3b82f6");
  const [isAddingStage, setIsAddingStage] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [stageToDelete, setStageToDelete] = useState(null);

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
    if (!newStageName.trim()) {
      toast.error("Pipeline name is required");
      return;
    }
    if (newStageIsForm && !newStageFormType) {
      toast.error("Form type is required when 'Is Form' is enabled");
      return;
    }
    if (stages.some((s) => s.name === newStageName)) {
      toast.error("Pipeline name already exists");
      return;
    }
    
      const newStage = {
        name: newStageName,
        isForm: newStageIsForm,
      formType: newStageIsForm ? newStageFormType : null,
        color: newStageColor,
      };
      onAddStage(newStage);
      setNewStageName("");
      setNewStageIsForm(false);
    setNewStageFormType("");
      setNewStageColor("#3b82f6");
      setIsAddingStage(false);
    toast.success("Pipeline stage added successfully");
  };

  const handleDeleteStage = (stage) => {
    console.log('handleDeleteStage called with stage:', stage);
    setStageToDelete(stage);
    setShowDeleteWarning(true);
    console.log('Modal should now be visible');
  };

  const handleConfirmDeleteStage = async (stage) => {
    console.log('Confirming deletion of stage:', stage);
    await onDeleteStages([stage.name]);
    setStageToDelete(null);
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
      const oldIndex = stages.findIndex((item) => item.stageId === active.id);
      const newIndex = stages.findIndex((item) => item.stageId === over.id);
      const reordered = arrayMove(stages, oldIndex, newIndex);
      onReorderStages(reordered);
    }
  };

  const SortableStageItem = ({ stage }) => {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: stage.stageId });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const handleDeleteClick = (e) => {
      console.log('Delete button clicked - event:', e);
      e.stopPropagation();
      e.preventDefault();
      console.log('Delete button clicked for stage:', stage);
      handleDeleteStage(stage);
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white border rounded-lg p-4 shadow-sm relative"
      >
        {/* Drag handle area */}
        <div
          className="flex justify-between items-center cursor-move"
        {...attributes}
        {...listeners}
      >
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <span className="font-medium">{stage.name}</span>
            {stage.isForm && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                Form: {stage.formType || 'Custom'}
              </span>
            )}
          </div>
        </div>
        
        {/* Delete button - outside drag area */}
          <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors duration-200 z-10"
            title="Delete Stage"
          >
          <FaTrash className="w-4 h-4" />
          </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <FaStream className="w-7 h-7 text-gray-400" />
            Pipeline Stages
          </h3>
          <p className="mt-2 text-base text-gray-600">
            Add, remove, and reorder the stages in your sales pipeline.
          </p>
        </div>
        <button
          onClick={() => setIsAddingStage(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          <FaPlus /> Add Stage
        </button>
      </div>

      {isAddingStage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Add Pipeline</h2>
              <button
                onClick={() => {
                  setIsAddingStage(false);
                  setNewStageName("");
                  setNewStageIsForm(false);
                  setNewStageFormType("");
                  setNewStageColor("#3b82f6");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Pipeline Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pipeline Name
              </label>
              <input
                type="text"
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="Enter pipeline name..."
                  className="w-full border border-blue-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
                {!newStageName.trim() && (
                  <p className="text-red-500 text-sm mt-1">Pipeline name is required.</p>
                )}
            </div>

              {/* Pipeline Color */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Pipeline Color
              </label>
                <div className="flex gap-2">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewStageColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        newStageColor === color 
                          ? 'border-blue-600 scale-110' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    >
                      {newStageColor === color && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-1.5"></div>
                      )}
                    </button>
                  ))}
            </div>
              </div>

              {/* Is Form Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Is Form
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setNewStageIsForm(!newStageIsForm)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      newStageIsForm ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        newStageIsForm ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-600">
                    {newStageIsForm ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>

              {/* Form Type - Only show when Is Form is enabled */}
              {newStageIsForm && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Form Type
              </label>
                  <select
                    value={newStageFormType}
                    onChange={(e) => setNewStageFormType(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select form type...</option>
                    <option value="CONVERTED">Converted</option>
                    <option value="JUNK">Junk</option>
                    <option value="LOST">Lost</option>
                    <option value="ONBOARDING">Onboarding</option>
                    <option value="APPROVAL">Approval</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  {!newStageFormType && (
                    <p className="text-red-500 text-sm mt-1">Form type is required.</p>
                  )}
            </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end items-center gap-2 rounded-b-lg">
            <button
                onClick={() => {
                  setIsAddingStage(false);
                  setNewStageName("");
                  setNewStageIsForm(false);
                  setNewStageFormType("");
                  setNewStageColor("#3b82f6");
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-100"
              >
                Cancel
            </button>
            <button
                onClick={handleAddStage}
                disabled={!newStageName.trim() || (newStageIsForm && !newStageFormType)}
                className={`px-4 py-2 text-sm rounded-md transition-all duration-200 ${
                  !newStageName.trim() || (newStageIsForm && !newStageFormType)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 font-medium"
                }`}
              >
                Add Pipeline
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
          items={stages.map((s) => s.stageId)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {stages.map((stage) => (
              <SortableStageItem key={stage.stageId} stage={stage} />
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

      {/* Delete Warning Modal */}
      <DeleteStageWarningModal
        isOpen={showDeleteWarning}
        onClose={() => {
          setShowDeleteWarning(false);
          setStageToDelete(null);
        }}
        stage={stageToDelete}
        onConfirmDelete={handleConfirmDeleteStage}
      />
    </div>
  );
};

const SettingContent = ({ role }) => {
  const router = useRouter();
  const dispatch = useDispatch();

  // Get data from Redux store instead of local state
  const { leads: allLeads } = useSelector((state) => state.leads);
  const { pipelines } = useSelector((state) => state.pipelines);
  
  // Form builder selectors
  const currentForm = useSelector(selectCurrentForm);
  const formSubmissionLoading = useSelector(selectFormSubmissionLoading);
  const formSubmissionError = useSelector(selectFormSubmissionError);
  const formSubmissionSuccess = useSelector(selectFormSubmissionSuccess);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchPipelines());
    dispatch(fetchLeads()); // Assuming fetchLeads gets all leads
  }, [dispatch]);

  // Map Redux pipeline structure to the one expected by the settings components
  const kanbanStatuses = useMemo(() => {
    return (pipelines || []).map((p) => ({
      ...p,
      id: p.stageId,
      isForm: p.isFormRequired,
    }));
  }, [pipelines]);

  // Deduplicate leads by leadId (keep first occurrence)
  const dedupedLeads = React.useMemo(() => {
    const seen = new Set();
    return (allLeads || []).filter((lead) => {
      if (lead && lead.leadId && !seen.has(lead.leadId)) {
        seen.add(lead.leadId);
        return true;
      }
      return false;
    });
  }, [allLeads]);

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
  const [mainView, setMainView] = useState("settings"); // New state for main view
  const [pendingConversion, setPendingConversion] = useState(null); // {lead, fromStatus}
  const [pendingLost, setPendingLost] = useState(null); // {lead, fromStatus}
  const [pendingJunk, setPendingJunk] = useState(null); // {lead, fromStatus}
  const [showScheduleActivityModal, setShowScheduleActivityModal] =
    useState(false);
  const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);
  
  // Dynamic form states
  const [showDynamicFormModal, setShowDynamicFormModal] = useState(false);
  const [leadForDynamicForm, setLeadForDynamicForm] = useState(null);
  const [stageForDynamicForm, setStageForDynamicForm] = useState(null);

  // Add state for new stage options
  const [newStageIsForm, setNewStageIsForm] = useState(false);
  const [newStageColor, setNewStageColor] = useState("#3b82f6");

  useEffect(() => {
    if (router.query.view === "settings") {
      setMainView("settings");
    }
  }, [router.query]);

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

  const handleDragEnd = async (event) => {
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
    const oldLead = dedupedLeads.find((l) => l.leadId === leadId);
    console.log("DragEnd:", { leadId, newStatus, oldLead });
    
    // Find the target stage
    const targetStage = kanbanStatuses.find((s) => s.name === newStatus);
    
    // Check if stage has a custom form
    if (targetStage && targetStage.isForm && targetStage.formType === 'CUSTOM_FORM') {
      console.log("Stage has custom form, fetching form data...");
      setLeadForDynamicForm(oldLead);
      setStageForDynamicForm(targetStage);
      
      try {
        const result = await dispatch(fetchFormByStage(targetStage.stageId));
        if (fetchFormByStage.fulfilled.match(result)) {
          console.log("Form fetched successfully:", result.payload);
          setShowDynamicFormModal(true);
        } else {
          console.error("Failed to fetch form for stage");
          // Fallback to regular stage logic
          handleRegularStageLogic(oldLead, newStatus);
        }
      } catch (error) {
        console.error("Error fetching form:", error);
        // Fallback to regular stage logic
        handleRegularStageLogic(oldLead, newStatus);
      }
    } else {
      // Handle regular stage logic (existing code)
      handleRegularStageLogic(oldLead, newStatus);
    }
  };

  // Handle regular stage logic (existing functionality)
  const handleRegularStageLogic = (oldLead, newStatus) => {
    if (newStatus === "Converted") {
      setPendingConversion({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToConvertId(oldLead.leadId);
      setShowConvertModal(true);
      console.log("Opening Convert Modal", { leadId: oldLead.leadId, newStatus });
    } else if (newStatus === "Lost") {
      setPendingLost({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkLost(oldLead);
      setShowLostReasonModal(true);
      console.log("Opening Lost Modal", { leadId: oldLead.leadId, newStatus });
    } else if (newStatus === "Junk") {
      setPendingJunk({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkJunkId(oldLead.leadId);
      setShowJunkReasonModal(true);
      console.log("Opening Junk Modal", { leadId: oldLead.leadId, newStatus });
    } else {
      // For other status changes, dispatch an update action
      dispatch(updateLead({ ...oldLead, status: newStatus }));
      console.log("Moved lead to new status", { leadId: oldLead.leadId, newStatus });
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
      dispatch(updateLead({ ...editingLead, ...leadData }));
    } else {
      dispatch(createLead(leadData));
    }
    setShowAddLeadModal(false);
  };

  const handleAddStage = (newStage) => {
    dispatch(
      createPipeline({
        name: newStage.name,
        color: newStage.color,
        isFormRequired: newStage.isForm,
        formType: newStage.isForm ? newStage.formType : null,
      })
    );
  };

  const handleReorderStages = (reorderedStages) => {
    const stageIds = reorderedStages.map((s) => s.stageId);
    dispatch(reorderPipelines(stageIds));
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

  const handleDeleteStages = async (stagesToDelete) => {
    console.log('Attempting to delete stages:', stagesToDelete);
    
    // Check if any leads exist in the stages to be deleted
    const leadsInStages = dedupedLeads.filter((lead) =>
      stagesToDelete.includes(lead.status)
    );
    
    if (leadsInStages.length > 0) {
      const stageNames = stagesToDelete.join(', ');
      toast.error(
        `Cannot delete stage(s): ${stageNames}. Move all leads to other stages first.`
      );
      return;
    }

    const stagesData = stagesToDelete
      .map((name) => kanbanStatuses.find((s) => s.name === name))
      .filter(Boolean);

    console.log('Stages to delete:', stagesData);

    if (stagesData.length > 0) {
      try {
        // Delete each stage using the pipeline slice
        const deletePromises = stagesData.map((stage) => {
          console.log('Deleting stage:', stage.name, 'with stageId:', stage.stageId);
          return dispatch(deletePipeline(stage.stageId));
        });
        
        const results = await Promise.all(deletePromises);
        
        // Check if any deletions failed
        const failedDeletions = results.filter(result => 
          result.type && result.type.endsWith('rejected')
        );
        
        if (failedDeletions.length > 0) {
          console.error('Failed deletions:', failedDeletions);
          
          // Check if the error is about leads in the stage
          const hasLeadError = failedDeletions.some(result => {
            const errorMessage = result.payload || result.error?.message || '';
            return errorMessage.toLowerCase().includes('lead') || 
                   errorMessage.toLowerCase().includes('cannot delete');
          });
          
          if (hasLeadError) {
            toast.error(`Cannot delete stage. Move all leads to other stages first.`);
          } else {
            toast.error(`Failed to delete stage. Please try again.`);
          }
        } else {
          console.log('Successfully deleted stages');
          toast.success(`Stage deleted successfully`);
        }
      } catch (error) {
        console.error('Error deleting stages:', error);
        toast.error('An error occurred while deleting stages. Please try again.');
      }
    }
  };

  const handleConvertModalClose = () => {
    setShowConvertModal(false);
    setLeadToConvertId(null);
    setPendingConversion(null);
  };

  const handleConvertSuccess = (updatedLead) => {
    dispatch(updateLead(updatedLead));
    setPendingConversion(null);
    setShowConvertModal(false);
  };

  const handleLostModalClose = () => {
    setShowLostReasonModal(false);
    setLeadToMarkLost(null);
    setPendingLost(null);
  };

  const handleLostSuccess = (updatedLead) => {
    dispatch(updateLead(updatedLead));
    setPendingLost(null);
    setShowLostReasonModal(false);
  };

  const handleJunkModalClose = () => {
    setShowJunkReasonModal(false);
    setLeadToMarkJunkId(null);
    setPendingJunk(null);
  };

  const handleJunkSuccess = (updatedLead) => {
    dispatch(updateLead(updatedLead));
    setPendingJunk(null);
    setShowJunkReasonModal(false);
  };

  const handleScheduleActivity = (lead) => {
    setLeadToScheduleActivity(lead);
    setShowScheduleActivityModal(true);
  };

  const handleScheduleActivitySuccess = (activity) => {
    const leadId = activity.leadId;
    dispatch(updateLead({ ...dedupedLeads.find((l) => l.leadId === leadId), activities: [...(dedupedLeads.find((l) => l.leadId === leadId)?.activities || []), activity] }));
    setShowScheduleActivityModal(false);
    setLeadToScheduleActivity(null);
    toast.success("Activity scheduled successfully");
  };

  // Handle dynamic form submission
  const handleDynamicFormSubmit = async (formValues) => {
    if (!currentForm || !leadForDynamicForm) {
      toast.error("Form data or lead data is missing");
      return;
    }

    try {
      const formSubmissionData = {
        formId: currentForm.formId,
        leadId: leadForDynamicForm.leadId,
        formData: formValues,
        submittedAt: new Date().toISOString(),
        stageId: stageForDynamicForm?.stageId
      };

      console.log("Submitting form data:", formSubmissionData);

      const result = await dispatch(submitFormData(formSubmissionData));
      
      if (submitFormData.fulfilled.match(result)) {
        toast.success("Form submitted successfully!");
        
        // Update lead status to the new stage
        dispatch(updateLead({ 
          ...leadForDynamicForm, 
          status: stageForDynamicForm?.name 
        }));
        
        // Close modal and reset state
        setShowDynamicFormModal(false);
        setLeadForDynamicForm(null);
        setStageForDynamicForm(null);
        
        // Clear form builder state after success
        setTimeout(() => {
          dispatch(clearFormBuilderState());
        }, 2000);
      } else {
        toast.error("Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form");
    }
  };

  // Handle dynamic form modal close
  const handleDynamicFormClose = () => {
    setShowDynamicFormModal(false);
    setLeadForDynamicForm(null);
    setStageForDynamicForm(null);
    dispatch(clearFormBuilderState());
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
                    onClick={() => handleAddStage({ name: newStageName, isForm: newStageIsForm, color: newStageColor })}
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
            {/* <button
              onClick={() => handleViewChange("pipeline")}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <FaChevronLeft /> Back to Pipeline
            </button> */}
          </div>

          <SettingsPage
            leads={dedupedLeads}
            kanbanStatuses={kanbanStatuses}
            onAddStage={handleAddStage}
            onReorderStages={handleReorderStages}
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
        leads={dedupedLeads}
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
              ? dedupedLeads.find((l) => l.leadId === leadToMarkJunkId)
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

      {/* Dynamic Form Modal */}
      <DynamicFormModal
        isOpen={showDynamicFormModal}
        onClose={handleDynamicFormClose}
        formData={currentForm}
        leadId={leadForDynamicForm?.leadId}
        onSubmit={handleDynamicFormSubmit}
        loading={formSubmissionLoading}
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
