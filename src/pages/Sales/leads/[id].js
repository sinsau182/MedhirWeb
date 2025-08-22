import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchLeads,
  fetchLeadById,
  updateLead,
} from "@/redux/slices/leadsSlice";
import { fetchPipelines } from "@/redux/slices/pipelineSlice";
import {
  FaStar,
  FaRegStar,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaBuilding,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaBullseye,
  FaUserTie,
  FaTasks,
  FaHistory,
  FaPaperclip,
  FaUserCircle,
  FaCheck,
  FaUsers,
  FaFileAlt,
  FaTimes,
  FaPencilAlt,
  FaRegSmile,
  FaExpandAlt,
  FaChevronDown,
  FaClock,
  FaRegCheckCircle,
  FaRegClock,
  FaDownload,
  FaInfo,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";
import MainLayout from "@/components/MainLayout";
import { toast } from "sonner";
import AdvancedScheduleActivityModal from "@/components/Sales/AdvancedScheduleActivityModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import JunkReasonModal from "@/components/Sales/JunkReasonModal";
import LostLeadModal from "@/components/Sales/LostLeadModal";
import axios from "axios";
import getConfig from "next/config";
import ConvertLeadModal from "@/components/Sales/ConvertLeadModal";
import AssignLeadModal from "@/components/Sales/AssignLeadModal";
import SemiContactedModal from "@/components/Sales/SemiContactedModal";
import PotentialModal from "@/components/Sales/PotentialModal";
import HighPotentialModal from "@/components/Sales/HighPotentialModal";
import { fetchManagerEmployees } from "@/redux/slices/managerEmployeeSlice";
import { jwtDecode } from "jwt-decode";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
// Add Minio image system imports
import MinioImage from "@/components/ui/MinioImage";
import { fetchImageFromMinio } from "@/redux/slices/minioSlice";
import withAuth from "@/components/withAuth";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Add these lists for dropdowns/selects
// Note: salesPersons and designers will be populated from Redux managerEmployees
const propertyTypes = [
  "2BHK Flat",
  "3BHK Flat",
  "4BHK Flat",
  "2BHK Villa",
  "3BHK Villa",
  "4BHK Villa",
];

const sources = [
  "Website",
  "Facebook",
  "Instagram",
  "Google Ads",
  "Referral",
  "Walk-in",
  "Phone Call",
  "Email",
  "Other",
];

// Utility function for date/time formatting
function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-GB");
}

// --- Sub-components for the new UI ---

const SalesHeader = ({ lead, pipelines, onStatusChange }) => {
  const router = useRouter();

  // Filter out LOST and JUNK stages
  const filteredPipelines = pipelines.filter(stage => stage.formType !== "LOST" && stage.formType !== "JUNK");
  
  // Find the index of the current stage in the filtered pipelines
  const currentIndex = filteredPipelines.findIndex(
    (stage) => stage.stageId === lead.stageId
  );
  const getPriorityLabel = (rating) => {
    if (rating >= 3) return "High";
    if (rating === 2) return "Medium";
    if (rating === 1) return "Low";
    return typeof rating === "string" ? rating : "No";
  };
  const priorityLabel = getPriorityLabel(lead.priority);
  const priorityClass = {
    High: "bg-orange-100 text-orange-700",
    Medium: "bg-blue-100 text-blue-700",
    Low: "bg-gray-100 text-gray-600",
    No: "bg-gray-100 text-gray-600",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-orange-100 text-orange-700",
    Low: "bg-gray-100 text-gray-600",
  }[priorityLabel];
  return (
    <div className="sticky top-16 z-10 bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-500 font-medium" onClick={() => router.back()}>
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl text-gray-800 font-semibold">
            {lead.name} &ndash; {lead.propertyType}
          </span>
        </div>
        <div className="flex items-center gap-6 mt-2 ml-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Priority:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${priorityClass}`}
            >
              {priorityLabel}
            </span>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Pipeline Stepper */}
        <div className="flex items-center gap-2">
          {filteredPipelines.map((stage, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx < currentIndex;
            let customCircle = "";
            let customLabel = "";
            let baseCircle = isActive
              ? "bg-gray-800 text-white border-gray-800"
              : "text-gray-400 border-gray-300";
            if (isActive && stage.formType === "LOST") {
              customCircle = "bg-red-600 border-red-600 text-white";
              customLabel = "text-red-600";
              baseCircle = "";
            } else if (isActive && stage.formType === "JUNK") {
              customCircle = "bg-blue-600 border-blue-600 text-white";
              customLabel = "text-blue-600";
              baseCircle = "";
            }
            // return (
            //   <React.Fragment key={stage.stageId}>
            //     <div
            //       className="flex items-center gap-2 cursor-pointer"
            //       onClick={() => onStatusChange(stage.name)}
            //     >
            //       {isCompleted ? (
            //         <FaCheck className="text-green-500" />
            //       ) : (
            //         <span
            //           className={`flex items-center justify-center rounded-full border w-5 h-5 text-xs font-bold ${baseCircle} ${customCircle}`}
            //         >
            //           {idx + 1}
            //         </span>
            //       )}
            //       <span
            //         className={`text-sm ${
            //           isActive || isCompleted ? "font-medium" : ""
            //         } ${
            //           customLabel ||
            //           (isActive || isCompleted
            //             ? "text-gray-800"
            //             : "text-gray-400")
            //         }`}
            //       >
            //         {stage.name}
            //       </span>
            //     </div>
            //     {idx < filteredPipelines.length - 1 && (
            //       <span className="text-gray-300">&gt;</span>
            //     )}
            //   </React.Fragment>
            // );
          })}
        </div>
      </div>
    </div>
  );
};

const SalesDetailBody = ({
  lead,
  isEditing,
  setIsEditing,
  onFieldChange,
  onScheduleActivity,
  activities,
  onEditActivity,
  onDeleteActivity,
  onMarkDone,
  notes: _notes,
  onAddNote,
  conversionData,
  timelineEvents,
  deletedActivityIds,
  currentRole,
  setEditingActivity,
  setIsActivityModalOpen,
  activityLogs,
  activeRole,
}) => {
  const dispatch = useDispatch();
  const { employees: managerEmployees, loading: managerEmployeesLoading } =
    useSelector((state) => state.managerEmployee);
  const [activeTab, setActiveTab] = useState("activity");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [expandedActivities, setExpandedActivities] = useState({});
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllActivityLogs, setShowAllActivityLogs] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState({});
  const [notes, setNotes] = useState([]);
  const [fileModal, setFileModal] = useState({ open: false, url: null });
  // Conversation logs composer state
  const [convoType, setConvoType] = useState("");
  const [convoSummary, setConvoSummary] = useState("");
  const [convoNextAction, setConvoNextAction] = useState("");
  const [convoDueDate, setConvoDueDate] = useState("");

  // Hoisted handler so it's available before JSX is evaluated
  async function handleAddConversationLog() {
    if (!convoType) { toast.error("Please select a conversation type"); return; }
    if (!convoSummary.trim()) { toast.error("Please enter a call summary"); return; }
    try {
      const token = getItemFromSessionStorage("token") || "";
      await axios.post(
        `${API_BASE_URL}/leads/${lead.leadId}/activities`,
        {
          activityType: convoType,
          title: `Conversation - ${convoType}`,
          details: convoSummary,
          nextAction: convoNextAction || null,
          dueDate: convoDueDate || null,
        },
        {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      setConvoType(""); setConvoSummary(""); setConvoNextAction(""); setConvoDueDate("");
      if (lead && lead.leadId) {
        // fetchActivities(lead.leadId);
        // fetchActivityLogs(lead.leadId);
      }
      toast.success("Conversation log added");
    } catch (e) {
      console.error("Failed to add conversation log", e);
      toast.error("Failed to add conversation log");
    }
  }

  const token = getItemFromSessionStorage("token");
  const isManager = jwtDecode(token).roles.includes("MANAGER");

  const [contactFields, setContactFields] = useState({
    name: lead.name || "",
    contactNumber: lead.contactNumber || "",
    alternateContactNumber: lead.alternateContactNumber || "",
    email: lead.email || "",
  });

  const [projectFields, setProjectFields] = useState({});
  const [inlineEditingField, setInlineEditingField] = useState(null);
  // Contacted and Potential inline sections
  const [contactedFields, setContactedFields] = useState({
    floorPlan: lead.floorPlan || "",
    firstCallDate: lead.firstCallDate || "",
    estimatedBudget: lead.estimatedBudget || lead.budget || "",
  });
  const [potentialFields, setPotentialFields] = useState({
    firstMeetingDate: lead.firstMeetingDate || "",
    initialQuote: lead.initialQuote || lead.quotedAmount || "",
    requirements: lead.requirements || "",
  });

  // --- Assigned Team Edit State ---
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [assignedSalesRep, setAssignedSalesRep] = useState("");
  const [assignedDesigner, setAssignedDesigner] = useState("");
  const [assignedSalesRepId, setAssignedSalesRepId] = useState("");
  const [assignedDesignerId, setAssignedDesignerId] = useState("");
  const [contactEditingField, setContactEditingField] = useState(null);
  const [teamEditingField, setTeamEditingField] = useState(null);

  useEffect(() => {
    // Convert employee IDs to names for display
    const salesRepEmployee = managerEmployees.find(emp => emp.employeeId === lead.salesRep);
    const designerEmployee = managerEmployees.find(emp => emp.employeeId === lead.designer);
    
    setAssignedSalesRep(salesRepEmployee?.name || "");
    setAssignedDesigner(designerEmployee?.name || "");
    setAssignedSalesRepId(lead.salesRep || "");
    setAssignedDesignerId(lead.designer || "");
  }, [lead, managerEmployees]);
  // --- End Assigned Team Edit State ---

  useEffect(() => {
    setProjectFields({
      name: lead.name || "",
      propertyType: lead.propertyType || "",
      address: lead.address || "",
      area: lead.area || "",
      leadSource: lead.leadSource || "",
      referralName: lead.referralName || "",
      designStyle: lead.designStyle || "",
      designTimeline: lead.designTimeline || "",
      completionTimeline: lead.completionTimeline || "",
    });
    setContactedFields({
      floorPlan: lead.floorPlan || "",
      firstCallDate: lead.firstCallDate || "",
      estimatedBudget: lead.estimatedBudget || lead.budget || "",
    });
    setPotentialFields({
      firstMeetingDate: lead.firstMeetingDate || "",
      initialQuote: lead.initialQuote || lead.quotedAmount || "",
      requirements: lead.requirements || "",
    });
  }, [lead, isEditing]);

  console.log(activeRole);

  const handleContactFieldChange = (field, value) => {
    let processedValue = value;
    
    // Apply runtime validation and input restrictions
    switch (field) {
      case 'name':
        // Only allow letters, spaces, and common punctuation
        processedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
        break;
      case 'contactNumber':
      case 'alternateContactNumber':
        // Only allow digits, max 10 digits
        processedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'email':
        // Allow email characters, max 100 characters
        processedValue = value.slice(0, 100);
        break;
      default:
        processedValue = value;
    }
    
    setContactFields((prev) => ({ ...prev, [field]: processedValue }));
  };

  const handleDownloadFile = async (url) => {
    try {
      // Use Minio system for authenticated file access
      const { dataUrl } = await dispatch(fetchImageFromMinio({ url })).unwrap();
      
      // Create a temporary link to download the file
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = url.split("/").pop().split("?")[0];
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Clean up blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const handleOpenFile = async (url, fileName) => {
    try {
      // Use Minio system for authenticated file access
      const { dataUrl } = await dispatch(fetchImageFromMinio({ url })).unwrap();
      
      // Open file in new window
      const newWindow = window.open(dataUrl, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.document.title = fileName || 'File Preview';
        newWindow.focus();
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      toast.error('Failed to open file. Please try again.');
    }
  };

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const renderNoteContent = (content, noteId) => {
    const isExpanded = expandedNotes[noteId];
    const isLongNote = content.length > 60;
    
    if (!isLongNote) {
      return <span>{content}</span>;
    }
    
    // Split content into 60-character chunks
    const chunks = [];
    for (let i = 0; i < content.length; i += 60) {
      chunks.push(content.slice(i, i + 60));
    }
    
    const visibleChunks = isExpanded ? chunks : chunks.slice(0, 1);
    
    return (
      <div className="space-y-1">
        <div className="whitespace-pre-wrap">
          {visibleChunks.map((chunk, index) => (
            <div key={index} className="text-sm">
              {chunk}
            </div>
          ))}
        </div>
        <button
          onClick={() => toggleNoteExpansion(noteId)}
          className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              Show Less
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              Show More
            </>
          )}
        </button>
      </div>
    );
  };

  const handleSaveContact = async () => {
    try {
      // Validate form data before submission
      const errors = {};
      
      // Name validation
      if (!contactFields.name.trim()) {
        errors.name = "Name is required";
      } else if (contactFields.name.trim().length < 2) {
        errors.name = "Name must be at least 2 characters";
      } else if (contactFields.name.trim().length > 50) {
        errors.name = "Name must be less than 50 characters";
      }
      
      // Contact number validation
      if (!contactFields.contactNumber.trim()) {
        errors.contactNumber = "Contact number is required";
      } else if (!/^\d{10}$/.test(contactFields.contactNumber.trim())) {
        errors.contactNumber = "Contact number must be exactly 10 digits";
      } else if (contactFields.contactNumber.trim().startsWith('0')) {
        errors.contactNumber = "Contact number cannot start with 0";
      }
      
      // Alternate phone validation (optional)
      if (contactFields.alternateContactNumber.trim()) {
        if (!/^\d{10}$/.test(contactFields.alternateContactNumber.trim())) {
          errors.alternateContactNumber = "Alternate phone must be exactly 10 digits";
        } else if (contactFields.alternateContactNumber.trim().startsWith('0')) {
          errors.alternateContactNumber = "Alternate phone cannot start with 0";
        } else if (contactFields.alternateContactNumber.trim() === contactFields.contactNumber.trim()) {
          errors.alternateContactNumber = "Alternate phone cannot be same as main contact";
        }
      }
      
      // Email validation (optional)
      if (contactFields.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactFields.email.trim())) {
          errors.email = "Please enter a valid email address";
        } else if (contactFields.email.trim().length > 100) {
          errors.email = "Email must be less than 100 characters";
        }
      }
      
      // If there are validation errors, show them and return
      if (Object.keys(errors).length > 0) {
        Object.values(errors).forEach(error => {
          toast.error(error);
        });
        return;
      }
      
      await axios.put(
        `${API_BASE_URL}/leads/${lead.leadId}`,
        {
          name: contactFields.name.trim(),
          contactNumber: contactFields.contactNumber.trim(),
          alternateContactNumber: contactFields.alternateContactNumber.trim(),
          email: contactFields.email.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
      onFieldChange("name", contactFields.name.trim());
      onFieldChange("contactNumber", contactFields.contactNumber.trim());
      onFieldChange("alternateContactNumber", contactFields.alternateContactNumber.trim());
      onFieldChange("email", contactFields.email.trim());
      setIsEditingContact(false);
      // Optimistic local update
      onFieldChange("name", contactFields.name.trim());
      onFieldChange("contactNumber", contactFields.contactNumber.trim());
      onFieldChange("alternateContactNumber", contactFields.alternateContactNumber.trim());
      onFieldChange("email", contactFields.email.trim());
      toast.success("Contact details updated!");
    } catch (e) {
      console.error("Failed to update contact details:", e);
      toast.error("Failed to update contact details");
    }
  };

  const handleProjectFieldChange = (field, value) => {
    setProjectFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactedFieldChange = (field, value) => {
    setContactedFields((prev) => ({ ...prev, [field]: value }));
  };

  const handlePotentialFieldChange = (field, value) => {
    setPotentialFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProject = async () => {
    try {
      // Validate referral name if lead source is "Referral"
      if (projectFields.leadSource === "Referral" && (!projectFields.referralName || !projectFields.referralName.trim())) {
        toast.error("Referral name is required when lead source is Referral");
        return;
      }

      await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, projectFields, {
        headers: {
          Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
        },
      });
      Object.entries(projectFields).forEach(([field, value]) => {
        onFieldChange(field, value);
      });
      setIsEditing(false);
      await dispatch(fetchLeadById(lead.leadId));
      toast.success("Project details updated!");
    } catch (e) {
      console.error("Failed to update project details:", e);
      toast.error("Failed to update project details");
    }
  };

  // Auto-save a single project field on blur/change
  const saveProjectField = async (field, valueOverride) => {
    try {
      const value = valueOverride !== undefined ? valueOverride : projectFields[field];
      const payload = {};
      const numericFields = ["area", "budget"];
      payload[field] = numericFields.includes(field) && value !== "" && value !== null && value !== undefined
        ? Number(value)
        : value;

      await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, payload, {
        headers: { Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}` },
      });
      // Optimistically update local lead display without refetch
      Object.entries(payload).forEach(([k, v]) => onFieldChange(k, v));
      toast.success("Saved");
    } catch (e) {
      console.error("Auto-save failed for", field, e);
      toast.error("Failed to save. Please try again.");
    }
  };

  const saveContactedField = async (field) => {
    try {
      const value = contactedFields[field];
      // Required validation for Estimated Budget
      if (field === "estimatedBudget") {
        if (value === undefined || value === null || String(value).trim() === "") {
          toast.error("Estimated Budget is required");
          return;
        }
      }
      const payload = {};
      const numericFields = ["estimatedBudget"]; 
      payload[field] = numericFields.includes(field) && value !== "" && value !== null && value !== undefined
        ? Number(value)
        : value;
      // Map estimatedBudget to backend if it uses a different key
      if (field === "estimatedBudget") {
        payload.estimatedBudget = payload.estimatedBudget;
      }
      await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, payload, {
        headers: { Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}` },
      });
      Object.entries(payload).forEach(([k, v]) => onFieldChange(k, v));
      toast.success("Saved");
    } catch (e) {
      console.error("Auto-save failed for contacted", field, e);
      toast.error("Failed to save. Please try again.");
    }
  };

  const savePotentialField = async (field) => {
    try {
      const value = potentialFields[field];
      // Required validations for Potential fields
      if (field === "initialQuote") {
        if (value === undefined || value === null || String(value).trim() === "") {
          toast.error("Initial Quotation is required");
          return;
        }
      }
      if (field === "requirements") {
        if (!String(value || "").trim()) {
          toast.error("Requirements are required");
          return;
        }
      }
      const payload = {};
      const numericFields = ["initialQuote"];
      payload[field] = numericFields.includes(field) && value !== "" && value !== null && value !== undefined
        ? Number(value)
        : value;
      await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, payload, {
        headers: { Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}` },
      });
      Object.entries(payload).forEach(([k, v]) => onFieldChange(k, v));
      toast.success("Saved");
    } catch (e) {
      console.error("Auto-save failed for potential", field, e);
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleSaveTeam = async () => {
    try {
      const body = {};
      if (assignedSalesRepId) body.salesRep = assignedSalesRepId;
      if (assignedDesignerId) body.designer = assignedDesignerId;
      await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, body, {
        headers: {
          Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
        },
      });
      setIsEditingTeam(false);
      // Optimistic local update
      if (assignedSalesRepId) onFieldChange("salesRep", assignedSalesRepId);
      if (assignedDesignerId) onFieldChange("designer", assignedDesignerId);
      toast.success("Assigned team updated!");
    } catch (e) {
      console.error("Failed to update assigned team:", e);
      toast.error("Failed to update assigned team");
    }
  };

  const combinedLog = [
    // Include all activities (both active and deleted) to show them in their original timeline position
    ...(activities || []).map((a) => ({
      ...a,
      // DON'T mark activities as deleted here - keep them as original
      // Use createdAt for display and sorting to show when the activity was actually created
      date: new Date(a.createdAt || Date.now()),
      sortDate: new Date(a.createdAt || Date.now()),
      timestamp: a.createdAt || new Date().toISOString(),
    })),
    // Include all timeline events (including deletion events)
    ...(timelineEvents || []).map((e) => ({
      ...e,
      // Use the event date for sorting (when the event actually happened)
      sortDate: new Date(e.date),
      timestamp:
        e.date instanceof Date
          ? e.date.toISOString()
          : new Date(e.date).toISOString(),
    })),
  ].sort((a, b) => {
    // Sort by when things actually happened (creation time for activities, event time for timeline events)
    const dateA = new Date(a.sortDate);
    const dateB = new Date(b.sortDate);
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  const [editingNoteIdx, setEditingNoteIdx] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    let combinedNotes = [];
          if (Array.isArray(lead.notesList)) {
        combinedNotes = lead.notesList.map((n) => ({
          user: n.user || lead.name || "User",
          content: n.content,
          time: n.time || n.createdAt || new Date(),
          noteId: n.noteId || n.id,
        }));
      }
    setNotes(combinedNotes);
  }, [lead]);

  const handleEditNoteClick = (note, idx) => {
    setNoteContent(note.content);
    setEditingNoteIdx(idx);
    setEditingNoteId(note.noteId || note.id);
  };

  const handleAddOrEditNote = async () => {
    console.log(
      "Save Note button pressed. Attempting to post note:",
      noteContent
    );
    setNotesLoading(true);
    try {
      let newNote;
      if (editingNoteId) {
        // Edit note
        await axios.put(
          `${API_BASE_URL}/leads/${lead.leadId}/notes/${editingNoteId}`,
          { content: noteContent },
          {
            headers: {
              Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
            },
          }
        );
        // Update note in local state
        setNotes((prev) =>
          prev.map((n) =>
            n.noteId === editingNoteId ? { ...n, content: noteContent } : n
          )
        );
      } else {
        // Add note
        const res = await axios.post(
          `${API_BASE_URL}/leads/${lead.leadId}/notes`,
          { content: noteContent },
          {
            headers: {
              Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
            },
          }
        );
        // Add new note to local state
        newNote = {
          user: lead.name || "User",
          content: noteContent,
          time: new Date(),
          noteId: res.data?.noteId || undefined,
        };
        setNotes((prev) => [newNote, ...prev]);
      }
      setNoteContent("");
      setEditingNoteIdx(null);
      setEditingNoteId(null);
    } catch (e) {
      console.error("Failed to save note:", e);
    }
    setNotesLoading(false);
  };

  const completionLogs = [...(activityLogs || [])]
    .filter((log) => log.activityType === "ACTIVITY_COMPLETION")
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const allLogs = [...(activityLogs || [])].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  // Move the helper function here so it's in scope
  const getActivityTypeColor = (type) => {
    if (!type) return "text-gray-500";
    const t = type.toUpperCase();
    if (t === "STATUS_CHANGE") return "text-blue-500";
    if (t === "ACTIVITY_COMPLETION") return "text-green-600";
    if (t === "TO-DO" || t === "TODO") return "text-purple-500";
    if (t === "ACTIVITY_DELETION" || t === "DELETED") return "text-red-500";
    return "text-gray-500";
  };

  const HISTORY_LIMIT = 5;
  const ACTIVITY_LOG_LIMIT = 5;

  return (
    <div className="flex-grow bg-gray-50 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Project Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Lead Details
              </h3>
            </div>
            {/* Single border below heading */}
            <div className="border-b border-gray-200 mb-4"></div>
            {/* Contact Details (moved to top of this card) */}
            <div className="border-b border-gray-100 pb-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">Contact Details</h3>
              </div>
              {isEditingContact || contactEditingField ? (
                <div className="space-y-3">
                  <input
                    value={contactFields.name}
                    onChange={(e) => handleContactFieldChange("name", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    autoFocus={contactEditingField === 'name'}
                    onBlur={async () => { setContactEditingField(null); await handleSaveContact(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    placeholder="Full Name"
                  />
                  <input
                    value={contactFields.contactNumber}
                    onChange={(e) => handleContactFieldChange("contactNumber", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    autoFocus={contactEditingField === 'contactNumber'}
                    onBlur={async () => { setContactEditingField(null); await handleSaveContact(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    placeholder="Contact Number"
                  />
                  <input
                    value={contactFields.alternateContactNumber}
                    onChange={(e) => handleContactFieldChange("alternateContactNumber", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    autoFocus={contactEditingField === 'alternateContactNumber'}
                    onBlur={async () => { setContactEditingField(null); await handleSaveContact(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    placeholder="Alternate Phone Number (Optional)"
                  />
                  <input
                    value={contactFields.email}
                    onChange={(e) => handleContactFieldChange("email", e.target.value)}
                    className="w-full p-2 border rounded-md"
                    autoFocus={contactEditingField === 'email'}
                    onBlur={async () => { setContactEditingField(null); await handleSaveContact(); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    placeholder="Email (Optional)"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 text-gray-900 font-semibold cursor-pointer" onClick={() => { setIsEditingContact(true); setContactEditingField('name'); }}>
                    <FaUser className="text-gray-400" />
                    <span>{(contactFields.name || "").trim() || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsEditingContact(true); setContactEditingField('email'); }}>
                    <FaEnvelope className="text-gray-400" />
                    <span className="text-gray-900 font-medium">{(contactFields.email || "").trim() || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsEditingContact(true); setContactEditingField('contactNumber'); }}>
                    <FaPhone className="text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {contactFields.contactNumber ? `+91 ${contactFields.contactNumber}` : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setIsEditingContact(true); setContactEditingField('alternateContactNumber'); }}>
                    <FaPhone className="text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {contactFields.alternateContactNumber ? `+91 ${contactFields.alternateContactNumber}` : "Alternate Phone (click to add)"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
              {[
                {
                  label: "Property Name",
                  field: "propertyName",
                  type: "text",
                },
                {
                  label: "Property Type",
                  field: "propertyType",
                  type: "select",
                  options: propertyTypes,
                },
                { label: "Address", field: "address", type: "text" },
                {
                  label: "Area (sq. ft.)",
                  field: "area",
                  type: "number",
                },
                {
                  label: "Design Timeline",
                  field: "designTimeline",
                  type: "text",
                },
                {
                  label: "Completion Timeline",
                  field: "completionTimeline",
                  type: "text",
                },
                {
                  label: "Lead Source",
                  field: "leadSource",
                  type: "select",
                  options: sources,
                  required: false,
                },
                { label: "Design Style", field: "designStyle", type: "text" },
              ].filter(({ conditional, condition }) => !conditional || condition).map(({ label, field, type, options, required, optional, conditional, condition }) => (
                <div key={field} className="relative group flex flex-col">
                  {/* Floating label */}
                  <span className="text-xs font-semibold text-gray-500 mb-1 group-hover:text-blue-600 transition-all">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                    {optional && (
                      <span className="text-gray-400 font-normal ml-1">
                        (optional)
                      </span>
                    )}
                  </span>
                  {isEditing || inlineEditingField === field ? (
                    type === "select" ? (
                      <select
                        value={projectFields[field] || ""}
                        onChange={(e) =>
                          handleProjectFieldChange(field, e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base"
                        onBlur={() => { saveProjectField(field); setInlineEditingField(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      >
                        {options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={projectFields[field] || ""}
                        onChange={(e) =>
                          handleProjectFieldChange(field, e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base"
                        autoFocus={inlineEditingField === field}
                        onBlur={() => { saveProjectField(field); setInlineEditingField(null); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                      />
                    )
                  ) : (
                    <div
                      className={`w-full text-base font-semibold text-gray-900 truncate ${
                        field === "address"
                          ? "max-w-[220px] md:max-w-[260px]"
                          : ""
                      }`}
                      title={
                        field === "address" &&
                        lead.address &&
                        lead.address.length > 30
                          ? lead.address
                          : undefined
                      }
                      style={
                        field === "address"
                          ? {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }
                          : {}
                      }
                    onClick={() => setInlineEditingField(field)}
                    >
                      {field === "budget" && ((projectFields.budget ?? lead.budget)) ? (
                        <FaRupeeSign className="inline text-gray-400 text-sm mr-1" />
                      ) : null}
                      {field === "budget"
                        ? (projectFields.budget ?? lead.budget)
                          ? Number(projectFields.budget ?? lead.budget).toLocaleString("en-IN")
                          : "N/A"
                        : field === "area"
                        ? (projectFields.area ?? lead.area)
                          ? `${projectFields.area ?? lead.area} sq. ft.`
                          : "N/A"
                        : field === "referralName"
                        ? (projectFields.referralName ?? lead.referralName) || (lead.leadSource === "Referral" ? "Not specified" : "N/A")
                        : (projectFields[field] ?? lead[field]) || "N/A"}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Referral Name Field - Only show when editing and lead source is Referral */}
              {isEditing && projectFields.leadSource === "Referral" && (
                <div className="mt-4">
                  <div className="relative group flex flex-col">
                    <span className="text-xs font-semibold text-gray-500 mb-1 group-hover:text-blue-600 transition-all">
                      Referral Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      value={projectFields.referralName || ""}
                      onChange={(e) => handleProjectFieldChange("referralName", e.target.value)}
                      className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base"
                      placeholder="Enter referral name"
                      required
                    />
                  </div>
                </div>
              )}
              
              {/* Show referral name when lead source is Referral but field is not in form */}
              {!isEditing && lead.leadSource === "Referral" && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-blue-700">Referral Name:</span>
                    <span className="text-sm font-semibold text-blue-900">
                      {lead.referralName || "Not specified"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Contacted Section moved here above Potential */}
            <div className="border-t border-gray-200 my-6"></div>
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Contacted</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Floor Plan</span>
                  <input
                    type="text"
                    value={contactedFields.floorPlan}
                    onChange={(e) => handleContactedFieldChange('floorPlan', e.target.value)}
                    onBlur={() => saveContactedField('floorPlan')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter floor plan"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">First Call Date</span>
                  <input
                    type="datetime-local"
                    value={contactedFields.firstCallDate}
                    onChange={(e) => handleContactedFieldChange('firstCallDate', e.target.value)}
                    onBlur={() => saveContactedField('firstCallDate')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Estimated Budget <span className="text-red-500">*</span></span>
                  <input
                    type="number"
                    value={contactedFields.estimatedBudget}
                    onChange={(e) => handleContactedFieldChange('estimatedBudget', e.target.value)}
                    onBlur={() => saveContactedField('estimatedBudget')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Potential Section */}
            <div className="border-t border-gray-200 my-6"></div>
            <div className="mb-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Potential</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">First Meeting Date</span>
                  <input
                    type="date"
                    value={potentialFields.firstMeetingDate}
                    onChange={(e) => handlePotentialFieldChange('firstMeetingDate', e.target.value)}
                    onBlur={() => savePotentialField('firstMeetingDate')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Initial Quotation <span className="text-red-500">*</span></span>
                  <input
                    type="number"
                    value={potentialFields.initialQuote}
                    onChange={(e) => handlePotentialFieldChange('initialQuote', e.target.value)}
                    onBlur={() => savePotentialField('initialQuote')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0"
                    required
                  />
                </div>
                <div className="flex flex-col md:col-span-1">
                  <span className="text-xs text-gray-500 mb-1">Requirements <span className="text-red-500">*</span></span>
                  <input
                    type="text"
                    value={potentialFields.requirements}
                    onChange={(e) => handlePotentialFieldChange('requirements', e.target.value)}
                    onBlur={() => savePotentialField('requirements')}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter requirements"
                    required
                  />
                </div>
              </div>
            </div>
            {/* Contact Details section duplicated earlier; removing this copy */}

            {/* Merged: Assigned Team */}
            <div className="border-t border-gray-200 my-6"></div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-800">Assigned Team</h3>
                {/* {isManager && (
                  <button
                    onClick={() => setIsEditingTeam(!isEditingTeam)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50"
                  >
                    <FaPencilAlt className="w-3 h-3" /> {isEditingTeam ? "Cancel" : "Edit"}
                  </button>
                )} */}
              </div>
              {isEditingTeam || teamEditingField ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sales Person</label>
                    <Select
                      value={assignedSalesRepId || "unassigned"}
                      onValueChange={async (val) => {
                        if (val === "unassigned") {
                          setAssignedSalesRep("");
                          setAssignedSalesRepId("");
                        } else {
                          const selectedEmployee = managerEmployees.find((emp) => emp.employeeId === val);
                          setAssignedSalesRep(selectedEmployee?.name || "");
                          setAssignedSalesRepId(val);
                        }
                        await handleSaveTeam();
                      }}
                    >
                      <SelectTrigger className="w-full border-gray-300 text-sm rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); /* open menu already handled */ } }}
                      >
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md shadow-lg">
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {managerEmployeesLoading ? (
                          <SelectItem value="" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          managerEmployees.map((employee) => (
                            <SelectItem key={employee.employeeId} value={employee.employeeId}>
                              {employee.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Designer</label>
                    <Select
                      value={assignedDesignerId || "unassigned"}
                      onValueChange={async (val) => {
                        if (val === "unassigned") {
                          setAssignedDesigner("");
                          setAssignedDesignerId("");
                        } else {
                          const selectedEmployee = managerEmployees.find((emp) => emp.employeeId === val);
                          setAssignedDesigner(selectedEmployee?.name || "");
                          setAssignedDesignerId(val);
                        }
                        await handleSaveTeam();
                      }}
                    >
                      <SelectTrigger className="w-full border-gray-300 text-sm rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); } }}
                      >
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md shadow-lg">
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {managerEmployees.map((employee) => (
                          <SelectItem key={employee.employeeId} value={employee.employeeId}>
                            {employee.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Auto-saved on selection change */}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setIsEditingTeam(true); setTeamEditingField('salesRep'); }}>
                    <span className="text-gray-500 text-sm">Sales Person:</span>
                    <span className={lead.salesRep ? "font-semibold text-gray-900" : "text-gray-400 font-medium"}>
                      {(assignedSalesRepId || lead.salesRep)
                        ? managerEmployees.find((emp) => emp.employeeId === (assignedSalesRepId || lead.salesRep))?.name || (assignedSalesRepId || lead.salesRep)
                        : "Unassigned"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setIsEditingTeam(true); setTeamEditingField('designer'); }}>
                    <span className="text-gray-500 text-sm">Designer:</span>
                    <span className={lead.designer ? "font-semibold text-gray-900" : "text-gray-400 font-medium"}>
                      {(assignedDesignerId || lead.designer)
                        ? managerEmployees.find((emp) => emp.employeeId === (assignedDesignerId || lead.designer))?.name || (assignedDesignerId || lead.designer)
                        : "Unassigned"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Conversation Logs
              </h3>
              <button
                onClick={() => {
                  setEditingActivity(null);
                  setIsActivityModalOpen(true);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 transition"
                title="Add Activity"
              >
                +
              </button>
            </div>
            {/* Conversation Logs Composer */}
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-1">Conversation Type</span>
                  <select
                    value={convoType}
                    onChange={(e) => setConvoType(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select type</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="MEETING">Meeting</option>
                  </select>
                </div>
                <div className="md:col-span-2 flex flex-col">
                  <span className="text-xs text-gray-600 mb-1">Call Summary</span>
                  <input
                    type="text"
                    value={convoSummary}
                    onChange={(e) => setConvoSummary(e.target.value)}
                    placeholder="What happened on the call/meet?"
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-1">Next Action / Task</span>
                  <input
                    type="text"
                    value={convoNextAction}
                    onChange={(e) => setConvoNextAction(e.target.value)}
                    placeholder="e.g., Send quote, Follow-up call"
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-600 mb-1">Reminder / Due Date</span>
                  <input
                    type="datetime-local"
                    value={convoDueDate}
                    onChange={(e) => setConvoDueDate(e.target.value)}
                    className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div className="md:col-span-3 flex items-end">
                  <button
                    type="button"
                    onClick={handleAddConversationLog}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Log
                  </button>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              {activities && activities.length > 0 ? (
                activities
                  .filter(
                    (a) =>
                      a.status !== "done" &&
                      a.id &&
                      !deletedActivityIds.has(a.id)
                  )
                  .map((activity, index) => (
                    <div
                      key={activity.id || `temp-${index}`}
                      className="bg-gray-50 rounded-lg border border-gray-200 p-3 flex items-center justify-between"
                    >
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-200 text-gray-700 capitalize">
                            {activity.type}
                          </span>
                          <span className="text-blue-600 text-xs font-medium ml-2">
                            {activity.status}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-800 text-sm">
                          {activity.title}
                        </span>
                        <span className="text-sm text-gray-500">
                          {activity.dueDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <button
                          onClick={() => activity.id && onMarkDone(activity.id)}
                          title="Mark as Done"
                          className="text-green-600 hover:text-green-800"
                        >
                          <FaCheck size={18} />
                        </button>
                        <button
                          onClick={() => onEditActivity(activity)}
                          title="Edit"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaPencilAlt size={18} />
                        </button>
                        <button
                          onClick={() =>
                            activity.id && onDeleteActivity(activity.id)
                          }
                          title="Delete"
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTimes size={18} />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center text-sm text-gray-400 py-4">
                  No pending activities.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LostReasonModal = ({ isOpen, onClose, onSubmit, title, placeholder }) => {
  const [reason, setReason] = useState("");
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <textarea
          className="w-full p-2 border rounded-md"
          rows="4"
          placeholder={placeholder}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex justify-end mt-4 gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md border">
            Cancel
          </button>
          <button
            onClick={() => onSubmit(reason)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

const ConversionModal = ({ isOpen, onClose, onConfirm, lead }) => {
  const [form, setForm] = useState({
    finalQuotation: lead?.finalQuotation || "",
    signupAmount: lead?.signupAmount || "",
    paymentDate: lead?.paymentDate || "",
    paymentMode: lead?.paymentMode || "",
    panNumber: lead?.panNumber || "",
    designTimeline: lead?.designTimeline || "",
    completionTimeline: lead?.completionTimeline || "",
    discount: lead?.discount || "",
    paymentDetails: null,
    bookingForm: null,
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Mark Lead as Converted
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Final Quotation (₹) *
                </label>
                <input
                  type="number"
                  name="finalQuotation"
                  value={form.finalQuotation}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Sign-up Amount (₹) *
                </label>
                <input
                  type="number"
                  name="signupAmount"
                  value={form.signupAmount}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  value={form.paymentDate}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Mode
                </label>
                <input
                  type="text"
                  name="paymentMode"
                  value={form.paymentMode}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  PAN Number
                </label>
                <input
                  type="text"
                  name="panNumber"
                  value={form.panNumber}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Design Timeline
                </label>
                <input
                  type="text"
                  name="designTimeline"
                  value={form.designTimeline}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Completion Timeline
                </label>
                <input
                  type="text"
                  name="completionTimeline"
                  value={form.completionTimeline}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Discount
                </label>
                <input
                  type="text"
                  name="discount"
                  value={form.discount}
                  onChange={handleChange}
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Payment Details
                </label>
                <input
                  type="file"
                  name="paymentDetails"
                  onChange={handleChange}
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Upload Booking Form
                </label>
                <input
                  type="file"
                  name="bookingForm"
                  onChange={handleChange}
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-semibold"
            >
              Confirm Conversion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main View Component ---
const LeadDetailContent = () => {
  // All hooks must be called before any return!
  const router = useRouter();
  const { id } = router.query;
  const dispatch = useDispatch();
  const { lead, loading, error } = useSelector((state) => state.leads);
  const { pipelines, status: pipelinesStatus } = useSelector(
    (state) => state.pipelines
  );
  const { employees: managerEmployees } = useSelector((state) => state.managerEmployee);

  // All state hooks - MUST be called before any conditional returns
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isLostReasonModalOpen, setIsLostReasonModalOpen] = useState(false);
  const [isJunkReasonModalOpen, setIsJunkReasonModalOpen] = useState(false);
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [deletedActivityIds, setDeletedActivityIds] = useState(new Set());
  const [conversionData, setConversionData] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [showJunkModal, setShowJunkModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSemiContactedModal, setShowSemiContactedModal] = useState(false);
  const [showPotentialModal, setShowPotentialModal] = useState(false);
  const [showHighPotentialModal, setShowHighPotentialModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [fileModal, setFileModal] = useState({ open: false, url: null });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);

  // Fetch pipelines on mount if not loaded
  useEffect(() => {
    if (!pipelines || pipelines.length === 0) {
      dispatch(fetchPipelines());
    }
  }, [dispatch, pipelines]);

  // Fetch manager employees on mount
  useEffect(() => {
    dispatch(fetchManagerEmployees());
  }, [dispatch]);

  // Fetch only the current lead by ID
  useEffect(() => {
    if (id) {
      dispatch(fetchLeadById(id));
    }
  }, [dispatch, id]);

  // Set currentRole from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentRole(sessionStorage.getItem("currentRole"));
    }
  }, []);

  // Use dynamic stages from Redux
  const stages = pipelines.map((p) => p.name);

  // Initialize activities and notes when lead is available
  useEffect(() => {
    if (lead && lead.leadId) {
      const fetchActivities = async () => {
        try {
          const token = getItemFromSessionStorage("token") || "";
          const response = await axios.get(
            `${API_BASE_URL}/leads/${lead.leadId}/activities`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setActivities(response.data);
        } catch (err) {
          console.error("Failed to fetch activities:", err);
          setActivities([]);
        }
      };
      fetchActivities();
      setConversionData(lead.stageName === "Converted" ? lead : null);
    }
  }, [lead]);

  // Add state for activity logs
  const [activityLogs, setActivityLogs] = useState([]);

  // Add fetchActivityLogs function
  const fetchActivityLogs = async (leadId) => {
    try {
      const token = getItemFromSessionStorage("token") || "";
      const response = await axios.get(
        `${API_BASE_URL}/leads/${leadId}/activity-logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setActivityLogs(response.data);
    } catch (err) {
      console.error("Failed to fetch activity logs:", err);
    }
  };

  // removed duplicate definition

  useEffect(() => {
    if (lead && lead.leadId) {
      fetchActivityLogs(lead.leadId);
    }
  }, [lead]);

  // Only after all hooks, do conditional returns
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading lead...</span>
      </div>
    );
  }

  if (error) {
    // Extract error message from object if needed
    const errorMessage =
      typeof error === "string"
        ? error
        : error?.message || error?.error || "An unknown error occurred";

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <FaTimes className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-gray-600">Failed to load lead</p>
          <p className="text-sm text-gray-500 mt-1">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <FaUser className="h-8 w-8 mx-auto" />
          </div>
          <p className="text-gray-600">Lead not found</p>
          <p className="text-sm text-gray-500 mt-1">
            The lead you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </div>
    );
  }

  // Handlers
  const addTimelineEvent = ({ action, details, user = "You", date = null }) => {
    const eventDate = date || new Date();
    setTimelineEvents((prev) => [
      {
        id: Date.now(),
        type: "event",
        action,
        details,
        user,
        date: eventDate,
      },
      ...prev,
    ]);
  };

  const handleStatusChange = async (stageName) => {
    if (!lead) return;
    const stage = pipelines.find((p) => p.name === stageName);
    if (!stage) return;
    
    // Check for backward movement restriction
    const currentPipelineIndex = pipelines.findIndex(p => 
      p.stageId === lead.stageId
    );
    const newPipelineIndex = pipelines.findIndex(p => 
      p.stageId === stage.stageId
    );
    
    if (currentPipelineIndex > newPipelineIndex) {
      toast.error("Lead cannot be moved backward in kanban board");
      return;
    }
    
    // Prevent action when clicking on the same stage
    if (currentPipelineIndex === newPipelineIndex) {
      toast.error("Lead is already in this stage");
      return;
    }

    // Handle different form types
    if (stage.formType === "LOST") {
      setShowLostModal(true);
      return;
    }
    if (stage.formType === "JUNK") {
      setShowJunkModal(true);
      return;
    }
    if (stage.formType === "CONVERTED") {
      setShowConvertModal(true);
      return;
    }
    if (stage.formType === "ASSIGNED") {
      setShowAssignModal(true);
      return;
    }
    if (stage.formType === "SEMI") {
      setShowSemiContactedModal(true);
      return;
    }
    if (stage.formType === "POTENTIAL") {
      setShowPotentialModal(true);
      return;
    }
    if (stage.formType === "HIGHPOTENTIAL") {
      setShowHighPotentialModal(true);
      return;
    }
    
    // For all other stages, update stageId directly
    try {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${stage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
      await dispatch(fetchLeadById(lead.leadId));
      toast.success(`Lead moved to ${stage.name}`);
    } catch (error) {
      toast.error("Failed to update lead stage");
    }
  };

  const handleConfirmConversion = async (formData) => {
    addTimelineEvent({
      action: "Converted to Project",
      date: new Date(), // Conversion happens now
    });

    try {
      const updatedLeadData = { ...lead, stageName: "Converted", ...formData };
      await dispatch(
        updateLead({
          leadId: lead.leadId,
          ...updatedLeadData,
        })
      );
      setConversionData(updatedLeadData);
      setIsConversionModalOpen(false);
      toast.success("Lead marked as Converted!");
      // Refetch leads to get updated stageId
      await dispatch(fetchLeads());
    } catch (error) {
      toast.error("Failed to convert lead");
    }
  };

  const handleMarkLost = () => setShowLostModal(true);
  const handleLostReasonSubmit = (reason) => {
    addTimelineEvent({
      action: "Marked as Lost",
      details: reason,
      date: new Date(), // Lost marking happens now
    });
    handleStatusChange("Lost");
    setIsLostReasonModalOpen(false);
  };

  const handleMarkJunk = () => setShowJunkModal(true);
  const handleJunkReasonSubmit = (reason) => {
    addTimelineEvent({
      action: "Marked as Junk",
      details: reason,
      date: new Date(), // Junk marking happens now
    });
    handleStatusChange("Junk");
    setIsJunkReasonModalOpen(false);
  };

  const handleFieldChange = async (field, value) => {
    try {
      await dispatch(
        updateLead({
          leadId: lead.leadId,
          [field]: value,
        })
      );
    } catch (error) {
      toast.error("Failed to update lead field");
    }
  };

  const fetchActivities = async (leadId) => {
    try {
      const token = getItemFromSessionStorage("token") || "";
      const response = await axios.get(
        `${API_BASE_URL}/leads/${leadId}/activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setActivities(response.data);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
      setActivities([]);
    }
  };

  const handleAddOrEditActivity = (activity) => {
    const now = new Date().toISOString();
    const activityWithTimestamp = {
      ...activity,
      createdAt: activity.createdAt || now,
      updatedAt: now,
    };

    // If it's an existing activity (has id), update it
    if (activity.id) {
      setActivities((prev) =>
        prev.map((a) => (a.id === activity.id ? activityWithTimestamp : a))
      );
    } else {
      // For new activities, add it immediately to the state
      setActivities((prev) => [...prev, activityWithTimestamp]);
    }
    
    // Refresh activities and activity logs from backend to ensure consistency
    if (lead && lead.leadId) {
      fetchActivities(lead.leadId);
      fetchActivityLogs(lead.leadId);
    }
  };

  const handleDeleteActivity = async (id) => {
    if (!id) {
      console.warn("handleDeleteActivity called with undefined id");
      return;
    }
    const activity = activities.find((a) => a.id === id);
    if (!activity) {
      console.warn(`Activity not found with id: ${id}`);
      return;
    }
    setActivityToDelete(activity);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteActivity = async () => {
    if (!activityToDelete) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/leads/${lead.leadId}/activities/${activityToDelete.id}`
      );
      await fetchActivities(lead.leadId); // Refresh activities
      await fetchActivityLogs(lead.leadId); // Refresh activity logs
      toast.success("Activity deleted");
    } catch (error) {
      toast.error("Failed to delete activity");
    }
    setShowDeleteConfirm(false);
    setActivityToDelete(null);
  };

  const cancelDeleteActivity = () => {
    setShowDeleteConfirm(false);
    setActivityToDelete(null);
  };

  const handleMarkDone = async (id) => {
    if (!id) {
      console.warn("handleMarkDone called with undefined id");
      return;
    }
    const activity = activities.find((a) => a.id === id);
    if (!activity) {
      console.warn(`Activity not found with id: ${id}`);
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/activities/${activity.id}/status`,
        "done",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
      await fetchActivities(lead.leadId); // Refresh activities
      await fetchActivityLogs(lead.leadId); // Refresh activity logs
      toast.success("Activity marked as done");
    } catch (error) {
      toast.error("Failed to mark activity as done");
    }
  };
  const handleAddNote = (note) => setNotes((prev) => [note, ...prev]);

  if (!lead) return <div className="p-6 text-center">Lead not found.</div>;

  const updatedLead = { ...lead, activities, notes };

  const handleJunkSuccess = async (updatedLead) => {
    setShowJunkModal(false);
    const junkStage = pipelines.find((p) => p.formType === "JUNK");
    if (junkStage) {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${junkStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("Lead marked as Junk!");
  };
  const handleLostSuccess = async (updatedLead) => {
    setShowLostModal(false);
    console.log("All pipelines:", pipelines);
    const lostStage = pipelines.find((p) => p.formType === "LOST");
    console.log("Lost stage:", lostStage);
    if (lostStage) {
      console.log(
        "PATCH URL:",
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${lostStage.stageId}`
      );
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${lostStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    } else {
      console.error("Lost stage not found in pipelines!");
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("Lead marked as Lost!");
  };
  const handleConvertSuccess = async (updatedLead) => {
    setShowConvertModal(false);
    const convertedStage = pipelines.find((p) => p.formType === "CONVERTED");
    if (convertedStage) {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${convertedStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("Lead marked as Converted!");
  };

  const handleAssignSuccess = async (assignmentData) => {
    setShowAssignModal(false);
    
    // Update lead with assignment data
    await dispatch(updateLead({
      leadId: lead.leadId,
      salesRep: assignmentData.salesRep,
      designer: assignmentData.designer
    }));
    
    // Move to assigned stage
    const assignedStage = pipelines.find((p) => p.formType === "ASSIGNED");
    if (assignedStage) {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${assignedStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("Lead assigned successfully!");
  };

  const handleSemiContactedSuccess = async (semiContactedData) => {
    setShowSemiContactedModal(false);
    
    // Update lead with semi contacted data
    await dispatch(updateLead({
      leadId: lead.leadId,
      floorPlan: semiContactedData.floorPlan,
      estimatedBudget: semiContactedData.estimatedBudget,
      firstMeetingDate: semiContactedData.firstMeetingDate,
      priority: semiContactedData.priority
    }));
    
    // Move to semi contacted stage
    const semiStage = pipelines.find((p) => p.formType === "SEMI");
    if (semiStage) {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${semiStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("Semi contacted details saved!");
  };

  const handlePotentialSuccess = async (potentialData) => {
    setShowPotentialModal(false);
    
    // Update lead with potential data
    await dispatch(updateLead({
      leadId: lead.leadId,
      firstMeetingDate: potentialData.firstMeetingDate,
      requirements: potentialData.requirements,
      priority: potentialData.priority,
      initialQuote: potentialData.initialQuote
    }));
    
    // Move to potential stage
    const potentialStage = pipelines.find((p) => p.formType === "POTENTIAL");
    if (potentialStage) {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${potentialStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("Potential details saved!");
  };

  const handleHighPotentialSuccess = async (highPotentialData) => {
    setShowHighPotentialModal(false);
    
    // Update lead with high potential data
    await dispatch(updateLead({
      leadId: lead.leadId,
      requirements: highPotentialData.requirements,
      finalQuotation: highPotentialData.finalQuotation,
      discount: highPotentialData.discount,
      designTimeline: highPotentialData.designTimeline,
      completionTimeline: highPotentialData.completionTimeline
    }));
    
    // Move to high potential stage
    const highPotentialStage = pipelines.find((p) => p.formType === "HIGHPOTENTIAL");
    if (highPotentialStage) {
      await axios.patch(
        `${API_BASE_URL}/leads/${lead.leadId}/stage/${highPotentialStage.stageId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${getItemFromSessionStorage("token") || ""}`,
          },
        }
      );
    }
    await dispatch(fetchLeadById(lead.leadId));
    toast.success("High potential details saved!");
  };

  // Add the edit handler
  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setIsActivityModalOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Progress bar fallback */}
      {pipelinesStatus === "loading" ? (
        <div className="text-gray-400 text-center py-4">
          Loading pipeline stages...
        </div>
      ) : !pipelines || pipelines.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          No pipeline stages found.
        </div>
      ) : (
        <SalesHeader
          lead={updatedLead}
          pipelines={pipelines}
          onStatusChange={handleStatusChange}
        />
      )}
      <SalesDetailBody
        lead={updatedLead}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        onFieldChange={handleFieldChange}
        onScheduleActivity={() => setIsActivityModalOpen(true)}
        activities={activities}
        notes={notes}
        conversionData={conversionData}
        timelineEvents={timelineEvents}
        deletedActivityIds={deletedActivityIds}
        currentRole={currentRole}
        setEditingActivity={setEditingActivity}
        setIsActivityModalOpen={setIsActivityModalOpen}
        onEditActivity={handleEditActivity}
        onDeleteActivity={handleDeleteActivity}
        onMarkDone={handleMarkDone}
        activityLogs={activityLogs}
      />
      <AdvancedScheduleActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        lead={lead}
        initialData={editingActivity}
        onSuccess={handleAddOrEditActivity}
        onActivityChange={fetchActivities}
        onActivityLogsChange={fetchActivityLogs}
      />
      <LostReasonModal
        isOpen={isLostReasonModalOpen}
        onClose={() => setIsLostReasonModalOpen(false)}
        onSubmit={handleLostReasonSubmit}
        title="Reason for Lost Lead"
        placeholder="Enter reason..."
      />
      <LostReasonModal
        isOpen={isJunkReasonModalOpen}
        onClose={() => setIsJunkReasonModalOpen(false)}
        onSubmit={handleJunkReasonSubmit}
        title="Reason for Junk"
        placeholder="Enter reason..."
      />
      <ConversionModal
        isOpen={isConversionModalOpen}
        onClose={() => setIsConversionModalOpen(false)}
        onConfirm={handleConfirmConversion}
        lead={lead}
      />
      <JunkReasonModal
        lead={showJunkModal ? lead : null}
        onClose={() => setShowJunkModal(false)}
        onSuccess={handleJunkSuccess}
      />
      <LostLeadModal
        lead={showLostModal ? lead : null}
        onClose={() => setShowLostModal(false)}
        onSuccess={handleLostSuccess}
      />
      <ConvertLeadModal
        lead={showConvertModal ? lead : null}
        onClose={() => setShowConvertModal(false)}
        onSuccess={handleConvertSuccess}
      />
      <AssignLeadModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        lead={lead}
        onAssign={handleAssignSuccess}
        salesEmployees={managerEmployees || []}
      />
      <SemiContactedModal
        isOpen={showSemiContactedModal}
        onClose={() => setShowSemiContactedModal(false)}
        lead={lead}
        onSuccess={handleSemiContactedSuccess}
      />
      <PotentialModal
        isOpen={showPotentialModal}
        onClose={() => setShowPotentialModal(false)}
        lead={lead}
        onSuccess={handlePotentialSuccess}
      />
      <HighPotentialModal
        isOpen={showHighPotentialModal}
        onClose={() => setShowHighPotentialModal(false)}
        lead={lead}
        onSuccess={handleHighPotentialSuccess}
      />
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center border border-red-200">
            <div className="flex flex-col items-center mb-4">
              <div className="bg-red-100 rounded-full p-3 mb-2">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="text-xl font-bold text-red-700 mb-1">
                Delete Activity?
              </div>
              <div className="text-gray-700 text-center">
                Are you sure you want to delete this activity? This action
                cannot be undone.
              </div>
            </div>
            <div className="flex gap-4 w-full justify-center mt-4">
              <button
                onClick={confirmDeleteActivity}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded shadow transition"
              >
                Delete
              </button>
              <button
                onClick={cancelDeleteActivity}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded shadow transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeadDetailPage = () => {
  return (
    <MainLayout>
      <LeadDetailContent />
    </MainLayout>
  );
};

export default withAuth(LeadDetailPage);