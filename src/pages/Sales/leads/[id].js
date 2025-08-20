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
const projectTypes = [
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

const OdooHeader = ({ lead, pipelines, onStatusChange }) => {
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
    <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Left Side */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2">
          <button className="text-sm text-gray-500 font-medium" onClick={() => router.back()}>
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <span className="text-2xl text-gray-800 font-semibold">
            {lead.name} &ndash; {lead.projectType}
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
            return (
              <React.Fragment key={stage.stageId}>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => onStatusChange(stage.name)}
                >
                  {isCompleted ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <span
                      className={`flex items-center justify-center rounded-full border w-5 h-5 text-xs font-bold ${baseCircle} ${customCircle}`}
                    >
                      {idx + 1}
                    </span>
                  )}
                  <span
                    className={`text-sm ${
                      isActive || isCompleted ? "font-medium" : ""
                    } ${
                      customLabel ||
                      (isActive || isCompleted
                        ? "text-gray-800"
                        : "text-gray-400")
                    }`}
                  >
                    {stage.name}
                  </span>
                </div>
                {idx < filteredPipelines.length - 1 && (
                  <span className="text-gray-300">&gt;</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const OdooDetailBody = ({
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

  const token = getItemFromSessionStorage("token");
  const isManager = jwtDecode(token).roles.includes("MANAGER");

  const [contactFields, setContactFields] = useState({
    name: lead.name || "",
    contactNumber: lead.contactNumber || "",
    alternateContactNumber: lead.alternateContactNumber || "",
    email: lead.email || "",
  });

  const [projectFields, setProjectFields] = useState({});

  // --- Assigned Team Edit State ---
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [assignedSalesRep, setAssignedSalesRep] = useState("");
  const [assignedDesigner, setAssignedDesigner] = useState("");
  const [assignedSalesRepId, setAssignedSalesRepId] = useState("");
  const [assignedDesignerId, setAssignedDesignerId] = useState("");

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
      projectType: lead.projectType || "",
      address: lead.address || "",
      area: lead.area || "",
      budget: lead.budget || "",
      leadSource: lead.leadSource || "",
      referralName: lead.referralName || "",
      designStyle: lead.designStyle || "",
      designTimeline: lead.designTimeline || "",
      completionTimeline: lead.completionTimeline || "",
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
      await dispatch(fetchLeadById(lead.leadId));
      toast.success("Contact details updated!");
    } catch (e) {
      console.error("Failed to update contact details:", e);
      toast.error("Failed to update contact details");
    }
  };

  const handleProjectFieldChange = (field, value) => {
    setProjectFields((prev) => ({ ...prev, [field]: value }));
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
      await dispatch(fetchLeadById(lead.leadId));
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
                Project Details
              </h3>
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProject}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-blue-700"
                  >
                    <FaCheck /> Save
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold shadow-sm hover:bg-gray-50"
                >
                  <FaPencilAlt className="w-3 h-3" /> Edit
                </button>
              )}
            </div>
            {/* Single border below heading */}
            <div className="border-b border-gray-200 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-8">
              {[
                {
                  label: "Project Name",
                  field: "name",
                  type: "text",
                },
                {
                  label: "Project Type",
                  field: "projectType",
                  type: "select",
                  options: projectTypes,
                },
                { label: "Project Address", field: "address", type: "text" },
                {
                  label: "Area (sq. ft.)",
                  field: "area",
                  type: "number",
                },
                { label: "Estimated Budget", field: "budget", type: "number" },
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
                  {isEditing ? (
                    type === "select" ? (
                      <select
                        value={projectFields[field] || ""}
                        onChange={(e) =>
                          handleProjectFieldChange(field, e.target.value)
                        }
                        className="w-full p-2 border rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-base"
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
                    >
                      {field === "budget" && lead.budget ? (
                        <FaRupeeSign className="inline text-gray-400 text-sm mr-1" />
                      ) : null}
                      {field === "budget" && lead.budget
                        ? Number(lead.budget).toLocaleString("en-IN")
                        : field === "area"
                        ? lead.area
                          ? `${lead.area} sq. ft.`
                          : "N/A"
                        : field === "referralName"
                        ? (lead.referralName || (lead.leadSource === "Referral" ? "Not specified" : "N/A"))
                        : lead[field] || "N/A"}
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
          </div>

          {/* Tabs and Tab Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 min-h-[300px]">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-6" aria-label="Tabs">
                <button
                  className={`pb-3 text-sm font-medium border-b-2 ${
                    activeTab === "notes"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("notes")}
                >
                  Notes
                </button>
                <button
                  className={`pb-3 text-sm font-medium border-b-2 ${
                    activeTab === "activity"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("activity")}
                >
                  Activity Log
                </button>
                <button
                  className={`pb-3 text-sm font-medium border-b-2 ${
                    activeTab === "file"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("file")}
                >
                  Files
                </button>
                <button
                  className={`pb-3 text-sm font-medium border-b-2 ${
                    activeTab === "status"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("status")}
                >
                  Status Details
                </button>
                <button
                  className={`pb-3 text-sm font-medium border-b-2 ${
                    activeTab === "history"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-blue-600"
                  }`}
                  onClick={() => setActiveTab("history")}
                >
                  Activity History
                </button>
              </nav>
            </div>
            <div className="pt-4">
              {activeTab === "notes" && (
                <div>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className="w-full p-2 border rounded-md"
                    placeholder="Add a note..."
                  />
                  <div className="text-right mt-2 flex gap-2 justify-end items-center">
                    <button
                      onClick={handleAddOrEditNote}
                      className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold"
                      disabled={notesLoading || !(noteContent || "").trim()}
                    >
                      {editingNoteId ? "Edit Note" : "Save Note"}
                    </button>
                    {editingNoteId && (
                      <button
                        onClick={() => {
                          setNoteContent("");
                          setEditingNoteIdx(null);
                          setEditingNoteId(null);
                        }}
                        className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md text-sm font-semibold"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  <div className="mt-4 space-y-4">
                    {notes.map((note, idx) => (
                      <div
                        key={note.noteId || note.id || idx}
                        className="cursor-pointer group"
                        onClick={() => handleEditNoteClick(note, idx)}
                      >
                        <p className="font-semibold text-sm group-hover:text-blue-600">
                          {note.user}{" "}
                          <span className="text-xs text-gray-400 ml-2">
                            {formatRelativeTime(note.time)}
                          </span>
                        </p>
                        <div className="text-sm group-hover:text-blue-600">
                          {renderNoteContent(note.content, `note-${note.noteId || idx}`)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "activity" && (
                <div className="relative">
                  {/* Single vertical line for the whole timeline, connecting all circles */}
                  <div
                    className="absolute left-5 top-0 w-1 h-full bg-gray-200 z-0"
                    style={{ borderRadius: "1px" }}
                  />
                  <ul className="">
                    {activities.length === 0 && (
                      <li className="text-center text-gray-400 py-4">
                        No completed activities yet.
                      </li>
                    )}
                    {(() => {
                      const completedActivities = activities
                        .filter((a) => a.status === "done")
                        .sort(
                          (a, b) => {
                            const dateA = new Date(`${a.dueDate}T${a.dueTime || '00:00'}`);
                            const dateB = new Date(`${b.dueDate}T${b.dueTime || '00:00'}`);
                            return dateB - dateA;
                          }
                        );
                      
                      const visibleActivities = showAllActivityLogs
                        ? completedActivities
                        : completedActivities.slice(0, ACTIVITY_LOG_LIMIT);
                      
                      return (
                        <>
                          {visibleActivities.map((activity, idx, arr) => {
                        // Timeline dot and icon
                        const dotClass = "border-green-200 bg-green-50";
                        const icon = (
                          <svg
                            className="w-6 h-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        );

                        // Activity type label for success only
                        let activityTypeLabel = activity.type || "";
                        if (activity.status === "done" && activity.type) {
                          activityTypeLabel = `Activity_Completed : ${activity.type}`;
                        }

                        return (
                          <li
                            key={activity.id}
                            className="flex items-start mb-8 relative"
                            style={{ minHeight: "48px" }}
                          >
                            {/* Marker column: line and dot perfectly aligned */}
                            <div
                              className="relative flex flex-col items-center"
                              style={{ width: "40px", minWidth: "40px" }}
                            >
                              <span
                                className={`z-10 flex items-center justify-center rounded-full border-2 w-7 h-7 ${dotClass}`}
                                style={{ left: "0px" }}
                              >
                                {icon}
                              </span>
                            </div>
                            {/* Timeline content */}
                            <div className="flex-1 pl-2">
                              {/* Activity type label for success only */}
                              {activityTypeLabel && (
                                <span className="text-xs font-semibold text-green-600 mb-0.5 block">
                                  {activityTypeLabel}
                                </span>
                              )}
                              <span className="font-semibold text-gray-900 ml-2">
                                {activity.title}
                              </span>
                              <div className="text-xs text-gray-500 mb-2">
                                {activity.dueDate
                                  ? new Date(
                                      activity.dueDate
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : ""}
                              </div>
                              {activity.attachment && (
                                <div className="text-sm mb-2">
                                  <button
                                    onClick={() => handleOpenFile(activity.attachment, activity.title)}
                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-xs">View File</span>
                                  </button>
                                </div>
                              )}
                              {activity.notes && (
                                <div className="text-sm">
                                  <span className="font-semibold">Notes:</span>{" "}
                                  {renderNoteContent(activity.notes, activity.id)}
                                </div>
                              )}
                            </div>
                          </li>
                        );
                      })}
                          {/* View More / View Less button */}
                          {completedActivities.length > ACTIVITY_LOG_LIMIT && !showAllActivityLogs && (
                            <div className="flex justify-center mt-4">
                              <button
                                className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                                onClick={() => setShowAllActivityLogs(true)}
                              >
                                View More
                              </button>
                            </div>
                          )}
                          {showAllActivityLogs && completedActivities.length > ACTIVITY_LOG_LIMIT && (
                            <div className="flex justify-center mt-4">
                              <button
                                className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                                onClick={() => setShowAllActivityLogs(false)}
                              >
                                View Less
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </ul>
                </div>
              )}
              {activeTab === "file" && (
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Files
                  </h3>
                  {activities
                    .filter((activity) => activity.attachment)
                    .sort((a, b) => {
                      const dateA = new Date(`${a.dueDate}T${a.dueTime || '00:00'}`);
                      const dateB = new Date(`${b.dueDate}T${b.dueTime || '00:00'}`);
                      return dateB - dateA;
                    })
                    .map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-2 border"
                      >
                        <div className="flex items-center gap-3">
                          {/* File Icon */}
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            {activity.attachment.toLowerCase().includes('.pdf') ? (
                              <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            ) : activity.attachment.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                              <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          
                          {/* File Info */}
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 hover:text-blue-600 flex items-center gap-2">
                              {activity.attachmentName || activity.attachment.split("/").pop()}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Uploaded by {activity.user || "Unknown"}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          {/* View Button */}
                          <button
                            onClick={() => handleOpenFile(activity.attachment, activity.attachmentName || activity.attachment.split("/").pop())}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="View File"
                          >
                            <FaFileAlt className="w-4 h-4" />
                          </button>
                          
                          {/* Download Button */}
                          <button
                            onClick={() => handleDownloadFile(activity.attachment)}
                            className="text-gray-500 hover:text-blue-600 p-2"
                            title="Download File"
                          >
                            <FaDownload className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  {activities.filter((activity) => activity.attachment).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-lg">No files available</p>
                      <p className="text-gray-400 text-sm mt-2">No attachments have been uploaded for this lead</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === "status" && (
                <>
                  {/* Show only the current stage's details */}
                  {lead.stageName &&
                    lead.stageName.toLowerCase() === "converted" &&
                    (lead.finalQuotation ||
                    lead.signupAmount ||
                    lead.paymentDate ||
                    lead.paymentMode ||
                    lead.panNumber ||
                    lead.discount ||
                    lead.paymentDetailsFileName ||
                    lead.bookingFormFileName ||
                    lead.initialQuote ||
                    lead.designTimeline ||
                    lead.completionTimeline ? (
                      <>
                        {/* <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Status Details
                        </h3> */}
                        <div className="flex items-center gap-2">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {lead.stageName}
                          </h3>
                        </div>
                        <div style={{ marginBottom: "1.5rem" }} />
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1.5rem",
                          }}
                        >
                          <div>
                            <div>
                              <strong>Initial Quoted Amount:</strong> ₹{" "}
                              {lead.initialQuote || lead.quotedAmount || "N/A"}
                            </div>
                            <div>
                              <strong>Final Quotation:</strong> ₹{" "}
                              {lead.finalQuotation || "N/A"}
                            </div>
                            <div>
                              <strong>Sign-up Amount:</strong> ₹{" "}
                              {lead.signupAmount || "N/A"}
                            </div>
                            <div>
                              <strong>Discount:</strong>{" "}
                              {lead.discount || "N/A"}
                            </div>
                            <div>
                              <strong>Payment Proof:</strong>{" "}
                              {lead.paymentDetailsFileName ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenFile(lead.paymentDetailsFileName, lead.paymentDetailsFileName.split("/").pop())}
                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                  >
                                    {(() => {
                                      const name = lead.paymentDetailsFileName
                                        .split("/")
                                        .pop();
                                      return (
                                        name.split("_").slice(2).join("_") ||
                                        name
                                      );
                                    })()}
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(lead.paymentDetailsFileName)}
                                    className="text-gray-500 hover:text-blue-600 p-1"
                                    title="Download"
                                  >
                                    <FaDownload className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                "No file uploaded"
                              )}
                            </div>
                          </div>
                          <div>
                            <div>
                              <strong>Payment Date:</strong>{" "}
                              {lead.paymentDate || "N/A"}
                            </div>
                            <div>
                              <strong>Payment Mode:</strong>{" "}
                              {lead.paymentMode || "N/A"}
                            </div>
                            <div>
                              <strong>PAN Number:</strong>{" "}
                              {lead.panNumber || "N/A"}
                            </div>
                            <div>
                              <strong>Design Timeline:</strong>{" "}
                              {lead.designTimeline || "N/A"}
                            </div>
                            <div>
                              <strong>Completion Timeline:</strong>{" "}
                              {lead.completionTimeline || "N/A"}
                            </div>
                            <div>
                              <strong>Discount:</strong>{" "}
                              {lead.discount || "N/A"}
                            </div>
                            <div>
                              <strong>Booking Form:</strong>{" "}
                              {lead.bookingFormFileName ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenFile(lead.bookingFormFileName, lead.bookingFormFileName.split("/").pop())}
                                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                                  >
                                    {(() => {
                                      const name = lead.bookingFormFileName
                                        .split("/")
                                        .pop();
                                      return (
                                        name.split("_").slice(2).join("_") ||
                                        name
                                      );
                                    })()}
                                  </button>
                                  <button
                                    onClick={() => handleDownloadFile(lead.bookingFormFileName)}
                                    className="text-gray-500 hover:text-blue-600 p-1"
                                    title="Download"
                                  >
                                    <FaDownload className="w-3 h-3" />
                                  </button>
                                </div>
                              ) : (
                                "No file uploaded"
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-gray-400 py-4">
                        No status details available.
                      </p>
                    ))}
                  {lead.stageName &&
                    lead.stageName.toLowerCase() === "junk" &&
                    lead.reasonForJunk && (
                      <>
                        <h3 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          JUNK REASON
                        </h3>
                        <div className="text-lg font-bold text-gray-900">
                          {lead.reasonForJunk}
                        </div>
                      </>
                    )}
                  {lead.stageName &&
                    lead.stageName.toLowerCase() === "lost" &&
                    lead.reasonForLost && (
                      <>
                        <h3 className="text-base font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          LOST REASON
                        </h3>
                        <div className="text-lg font-bold text-gray-900">
                          {lead.reasonForLost}
                        </div>
                      </>
                    )}
                  {(!lead.stageName ||
                    (lead.stageName.toLowerCase() === "converted" &&
                      !(
                        lead.finalQuotation ||
                        lead.signupAmount ||
                        lead.paymentDate ||
                        lead.paymentMode ||
                        lead.panNumber ||
                        lead.discount ||
                        lead.paymentDetailsFileName ||
                        lead.bookingFormFileName ||
                        lead.initialQuote ||
                        lead.designTimeline ||
                        lead.completionTimeline
                      )) ||
                    (lead.stageName.toLowerCase() === "junk" &&
                      !lead.reasonForJunk) ||
                    (lead.stageName.toLowerCase() === "lost" &&
                      !lead.reasonForLost)) && (
                    <p className="text-center text-gray-400 py-4">
                      No status details available.
                    </p>
                  )}
                </>
              )}
              {activeTab === "history" && (
                <div className="relative">
                  {(() => {
                    const activityMap = new Map();
                    const specialEvents = [];
                    activityLogs
                      .slice()
                      .sort(
                        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                      )
                      .forEach((log) => {
                        const action = (log.action || "").toLowerCase();
                        if (
                          action === "stage changed" ||
                          action === "pipeline changed" ||
                          action === "activity deleted"
                        ) {
                          specialEvents.push(log);
                        } else if (log.activityId) {
                          if (!activityMap.has(log.activityId)) {
                            activityMap.set(log.activityId, log);
                          } else {
                            const existing = activityMap.get(log.activityId);
                            if (
                              existing.action !== "Activity completed" &&
                              log.action === "Activity completed"
                            ) {
                              activityMap.set(log.activityId, log);
                            }
                          }
                        } else {
                          specialEvents.push(log);
                        }
                      });
                    const merged = [
                      ...specialEvents,
                      ...Array.from(activityMap.values()),
                    ].sort(
                      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
                    );
                    const visibleHistory = showAllHistory
                      ? merged
                      : merged.slice(0, HISTORY_LIMIT);
                    return (
                      <div className="">
                        {/* Timeline vertical line, absolutely positioned in marker column */}
                        <div
                          className="absolute top-0 left-5 w-1 h-full bg-gray-200 z-0"
                          style={{ borderRadius: "1px" }}
                        />
                        {visibleHistory.map((log, idx) => {
                          // Activity type label logic
                          let activityTypeLabel = log.activityType || "";
                          if (
                            ((log.action &&
                              log.action.toLowerCase().includes("created")) ||
                              (log.activityType &&
                                log.activityType
                                  .toLowerCase()
                                  .includes("created"))) &&
                            log.activityType &&
                            log.activityType.toLowerCase() !== "created"
                          ) {
                            activityTypeLabel = `Activity_Created : ${log.activityType}`;
                          }

                          // Main text is always the activity title or fallback
                          let mainText =
                            log.metadata?.activityTitle ||
                            log.details ||
                            log.action ||
                            "Activity";
                          if (
                            log.action &&
                            log.action.toLowerCase() === "stage changed"
                          ) {
                            if (
                              log.metadata &&
                              log.metadata.oldStage &&
                              log.metadata.newStage
                            ) {
                              mainText = `${log.metadata.oldStage} → ${log.metadata.newStage}`;
                            } else {
                              mainText = log.details || "Stage Changed";
                            }
                          } else if (
                            log.action &&
                            log.action.toLowerCase() === "pipeline changed"
                          ) {
                            if (
                              log.metadata &&
                              log.metadata.oldPipeline &&
                              log.metadata.newPipeline
                            ) {
                              mainText = `${log.metadata.oldPipeline} → ${log.metadata.newPipeline}`;
                            } else {
                              mainText = log.details || "Pipeline Changed";
                            }
                          } else if (
                            log.action &&
                            log.action.toLowerCase() === "activity completed"
                          ) {
                            mainText =
                              log.metadata?.activityTitle ||
                              log.details ||
                              "Activity Completed";
                          } else if (
                            log.action &&
                            log.action.toLowerCase() === "activity deleted"
                          ) {
                            mainText =
                              log.metadata?.activityTitle ||
                              log.details ||
                              "Activity Deleted";
                          }

                          // Dot color and icon logic
                          let dotColor = "bg-blue-100 border-blue-500";
                          let icon = (
                            <FaInfo className="text-blue-500 w-3.5 h-3.5" />
                          );
                          if (
                            log.action &&
                            log.action.toLowerCase() === "activity completed"
                          ) {
                            dotColor = "bg-green-100 border-green-500";
                            icon = (
                              <FaCheck className="text-green-500 w-3.5 h-3.5" />
                            );
                          } else if (
                            log.action &&
                            log.action.toLowerCase() === "activity deleted"
                          ) {
                            dotColor = "bg-red-100 border-red-500";
                            icon = (
                              <FaTimes className="text-red-500 w-3.5 h-3.5" />
                            );
                          } else if (
                            log.action &&
                            (log.action.toLowerCase() === "stage changed" ||
                              log.action.toLowerCase() === "pipeline changed")
                          ) {
                            dotColor = "bg-blue-100 border-blue-500";
                            icon = (
                              <FaArrowRight className="text-blue-500 w-3.5 h-3.5" />
                            );
                          } else if (
                            (log.action &&
                              log.action.toLowerCase().includes("created")) ||
                            (log.activityType &&
                              log.activityType
                                .toLowerCase()
                                .includes("created"))
                          ) {
                            dotColor = "bg-blue-100 border-blue-500";
                            icon = (
                              <FaRegClock className="text-blue-500 w-3.5 h-3.5" />
                            );
                          }

                          return (
                            <div
                              key={log.id}
                              className="flex items-start mb-8 relative"
                              style={{ minHeight: "48px" }}
                            >
                              {/* Marker column: line and dot perfectly aligned */}
                              <div
                                className="relative flex flex-col items-center"
                                style={{ width: "40px", minWidth: "40px" }}
                              >
                                <span
                                  className={`z-10 flex items-center justify-center rounded-full border-2 w-7 h-7 ${dotColor}`}
                                  style={{ left: "0px" }}
                                >
                                  {icon}
                                </span>
                              </div>
                              {/* Timeline content */}
                              <div className="flex-1 pl-2">
                                {/* Activity type label if present */}
                                {activityTypeLabel && (
                                  <span
                                    className={`text-xs font-semibold mb-0.5 block ${getActivityTypeColor(
                                      log.activityType
                                    )}`}
                                  >
                                    {activityTypeLabel}
                                  </span>
                                )}
                                <span className="font-semibold text-gray-800 text-base">
                                  {mainText}
                                </span>
                                <span className="text-xs text-gray-400 mt-1 block">
                                  {new Date(log.timestamp).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}{" "}
                                  {log.timestamp &&
                                    new Date(log.timestamp).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      }
                                    )}
                                </span>
                                {/* Optional: show notes/content if present */}
                                {log.metadata?.notes && (
                                  <div className="text-sm text-gray-600 mt-1">
                                    {renderNoteContent(log.metadata.notes, `history-${log.id || idx}`)}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {/* View More / View Less button */}
                        {merged.length > HISTORY_LIMIT && !showAllHistory && (
                          <div className="flex justify-center mt-2">
                            <button
                              className="px-4 py-2 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition"
                              onClick={() => setShowAllHistory(true)}
                            >
                              View More
                            </button>
                          </div>
                        )}
                        {showAllHistory && merged.length > HISTORY_LIMIT && (
                          <div className="flex justify-center mt-2">
                            <button
                              className="px-4 py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                              onClick={() => setShowAllHistory(false)}
                            >
                              View Less
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Contact Details
              </h3>
              <button
                onClick={() => setIsEditingContact(!isEditingContact)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50"
              >
                <FaPencilAlt className="w-3 h-3" />{" "}
                {isEditingContact ? "Cancel" : "Edit"}
              </button>
            </div>
            <div className="border-b border-gray-200 mb-4"></div>
            {isEditingContact ? (
              <div className="space-y-3">
                <input
                  value={contactFields.name}
                  onChange={(e) =>
                    handleContactFieldChange("name", e.target.value)
                  }
                  className="w-full p-1 border-b"
                  placeholder="Full Name"
                />
                <input
                  value={contactFields.contactNumber}
                  onChange={(e) =>
                    handleContactFieldChange("contactNumber", e.target.value)
                  }
                  className="w-full p-1 border-b"
                  placeholder="Contact Number"
                />
                <input
                  value={contactFields.alternateContactNumber}
                  onChange={(e) =>
                    handleContactFieldChange("alternateContactNumber", e.target.value)
                  }
                  className="w-full p-1 border-b"
                  placeholder="Alternate Phone Number (Optional)"
                />
                <input
                  value={contactFields.email}
                  onChange={(e) =>
                    handleContactFieldChange("email", e.target.value)
                  }
                  className="w-full p-1 border-b"
                  placeholder="Email (Optional)"
                />
                <button
                  onClick={handleSaveContact}
                  className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-900 font-semibold">
                  <FaUser className="text-gray-400" />
                  <span>{lead.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FaPhone className="text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {lead.contactNumber ? `+91 ${lead.contactNumber}` : "N/A"}
                  </span>
                </div>
                {lead.alternateContactNumber && (
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-gray-400" />
                    <span className="text-gray-900 font-medium">
                      {`+91 ${lead.alternateContactNumber}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-gray-400" />
                  <span className="text-gray-900 font-medium">
                    {lead.email || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Team (always show, minimal style) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Assigned Team
              </h3>
              {isManager && (
              <button
                onClick={() => setIsEditingTeam(!isEditingTeam)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-semibold hover:bg-gray-50"
              >
                  <FaPencilAlt className="w-3 h-3" />{" "}
                  {isEditingTeam ? "Cancel" : "Edit"}
                </button>
              )}
            </div>
            <div className="border-b border-gray-200 mb-4"></div>
            {isEditingTeam ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sales Person
                  </label>
                  <Select
                    value={assignedSalesRepId || "unassigned"}
                    onValueChange={(val) => {
                      if (val === "unassigned") {
                        setAssignedSalesRep("");
                        setAssignedSalesRepId("");
                      } else {
                        const selectedEmployee = managerEmployees.find(
                          (emp) => emp.employeeId === val
                        );
                        setAssignedSalesRep(selectedEmployee?.name || "");
                        setAssignedSalesRepId(val);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full border-gray-300 text-sm rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
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
                          <SelectItem
                            key={employee.employeeId}
                            value={employee.employeeId}
                          >
                            {employee.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designer
                  </label>
                  <Select
                    value={assignedDesignerId || "unassigned"}
                    onValueChange={(val) => {
                      if (val === "unassigned") {
                        setAssignedDesigner("");
                        setAssignedDesignerId("");
                      } else {
                        const selectedEmployee = managerEmployees.find(
                          (emp) => emp.employeeId === val
                        );
                        setAssignedDesigner(selectedEmployee?.name || "");
                        setAssignedDesignerId(val);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full border-gray-300 text-sm rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md shadow-lg">
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {managerEmployees.map((employee) => (
                        <SelectItem
                          key={employee.employeeId}
                          value={employee.employeeId}
                        >
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <button
              onClick={handleSaveTeam}
              className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold"
            >
              Save
            </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Sales Person:</span>
                  <span
                    className={
                      lead.salesRep
                        ? "font-semibold text-gray-900"
                        : "text-gray-400 font-medium"
                    }
                  >
                    {lead.salesRep ? 
                      (managerEmployees.find(emp => emp.employeeId === lead.salesRep)?.name || lead.salesRep) 
                      : "Unassigned"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">Designer:</span>
                  <span
                    className={
                      lead.designer
                        ? "font-semibold text-gray-900"
                        : "text-gray-400 font-medium"
                    }
                  >
                    {lead.designer ? 
                      (managerEmployees.find(emp => emp.employeeId === lead.designer)?.name || lead.designer) 
                      : "Unassigned"}
                  </span>

                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-800">
                Activity
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
        <OdooHeader
          lead={updatedLead}
          pipelines={pipelines}
          onStatusChange={handleStatusChange}
        />
      )}
      <OdooDetailBody
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