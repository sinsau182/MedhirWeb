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
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import ConvertLeadModal from "@/components/Sales/ConvertLeadModal";
import LostLeadModal from "@/components/Sales/LostLeadModal";
import JunkReasonModal from "@/components/Sales/JunkReasonModal";
import AddLeadModal from "@/components/Sales/AddLeadModal";
import KanbanBoardClientOnly from "@/components/Sales/KanbanBoardClientOnly";
import {
  fetchLeads,
  updateLead,
  createLead,
  moveLeadToPipeline,
} from "@/redux/slices/leadsSlice";
import {
  fetchPipelines,
} from "@/redux/slices/pipelineSlice";
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
import Tooltip from "@/components/ui/ToolTip";
import useFlattenedLeads from "@/hooks/useFlattenedLeads";
import ViewToggle from "@/components/Sales/ViewToggle";
import SearchBar from "@/components/Sales/SearchBar";
// DeletePipelineModal import removed - pipeline management moved to settings
import LeadsTable from "../../components/Sales/LeadsTable";

const salesPersons = [
  { id: "MED101", name: "Alice" },
  { id: "MED102", name: "Bob" },
  { id: "MED103", name: "Charlie" },
  { id: "MED104", name: "Dana" },
];
const designers = [
  { id: "MED101", name: "Bob" },
  { id: "MED102", name: "Dana" },
  { id: "MED103", name: "Frank" },
  { id: "MED104", name: "Jack" },
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


const ManagerContent = ({ role }) => {
  const dispatch = useDispatch();
  const { pipelines } = useSelector((state) => state.pipelines);
  const { leads, loading, error } = useSelector((state) => state.leads);

  // Add lead modal state
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);

  // Pipeline management removed - moved to settings

  // Advanced Schedule Activity Modal state
  const [showAdvancedScheduleModal, setShowAdvancedScheduleModal] =
    useState(false);
  const [selectedLeadForActivity, setSelectedLeadForActivity] = useState(null);

  // Modal states for formType pipelines
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showJunkModal, setShowJunkModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  // Manager-specific state (retained from original)
  const [editingLead, setEditingLead] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [showConvertModalManager, setShowConvertModalManager] = useState(false);
  const [leadToConvertId, setLeadToConvertId] = useState(null);
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [leadToMarkLost, setLeadToMarkLost] = useState(null);
  const [showJunkReasonModal, setShowJunkReasonModal] = useState(false);
  const [leadToMarkJunkId, setLeadToMarkJunkId] = useState(null);
  const [viewMode, setViewMode] = useState("kanban");
  const [pendingConversion, setPendingConversion] = useState(null);
  const [pendingLost, setPendingLost] = useState(null);
  const [pendingJunk, setPendingJunk] = useState(null);
  const [showScheduleActivityModal, setShowScheduleActivityModal] =
    useState(false);
  const [leadToScheduleActivity, setLeadToScheduleActivity] = useState(null);

  // Fetch pipelines and all leads on mount
  useEffect(() => {
    dispatch(fetchPipelines());
    dispatch(fetchLeads());
  }, [dispatch]);



  // Deduplicate leads by leadId (keep first occurrence) - Manager specific
  const dedupedLeads = useFlattenedLeads(leads);

  // Group leads by pipelineId for Kanban board
  const leadsByStatus = useMemo(() => {
    const grouped = {};

    // Check if leads is in the new grouped format
    if (Array.isArray(leads) && leads.length > 0 && leads[0].stageId && leads[0].leads) {
      // New format: leads grouped by stageId
      leads.forEach((stageGroup) => {
        const stageId = stageGroup.stageId;
        const stageLeads = stageGroup.leads || [];
        
        // Find the pipeline/stage name for this stageId
        const pipeline = pipelines.find(p => 
          p.stageId === stageId || p.pipelineId === stageId
        );
        
        if (pipeline) {
          grouped[pipeline.name] = stageLeads;
        } else {
          // Create a fallback name if pipeline not found
          grouped[`Stage-${stageId.slice(-8)}`] = stageLeads;
        }
      });
    } else {
      // Old format: individual leads with pipelineId/stageId
      const usedLeadIds = new Set();

      pipelines.forEach((pipeline) => {
        const matchingLeads = leads.filter((lead) => {
          if (usedLeadIds.has(lead.leadId)) {
            return false;
          }

          const leadPipelineId = lead.pipelineId || lead.stageId;
          const pipelineId = pipeline.pipelineId || pipeline.stageId;
          const isMatch = String(leadPipelineId) === String(pipelineId);

          if (isMatch) {
            usedLeadIds.add(lead.leadId);
          }

          return isMatch;
        });

        grouped[pipeline.name] = matchingLeads;
      });

      // Handle leads without pipelineId
      const leadsWithoutPipeline = leads.filter((lead) => {
        if (usedLeadIds.has(lead.leadId)) {
          return false;
        }
        const leadPipelineId = lead.pipelineId || lead.stageId;
        return !leadPipelineId || leadPipelineId === null || leadPipelineId === undefined;
      });

      if (leadsWithoutPipeline.length > 0) {
        const newStage = pipelines.find((p) => p.name.toLowerCase() === "new") || pipelines[0];
        if (newStage) {
          if (!grouped[newStage.name]) {
            grouped[newStage.name] = [];
          }
          grouped[newStage.name] = [...grouped[newStage.name], ...leadsWithoutPipeline];
        }
      }
    }

    return grouped;
  }, [pipelines, leads]);



  // Pipeline management handlers removed - moved to settings

  // Handle schedule activity
  const handleScheduleActivity = (lead) => {
    setSelectedLeadForActivity(lead);
    setShowAdvancedScheduleModal(true);
  };

  // Drag-and-drop handler for Kanban board
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || !active) {
      console.log("No over or active element");
      return;
    }

    const leadId = active.id;
    const newPipelineName = over.id;

    if (!leadId || !newPipelineName) {
      console.log("Missing leadId or newPipelineName");
      return;
    }

    // Find the new pipeline by name
    const newPipeline = pipelines.find((p) => p.name === newPipelineName);

    if (!newPipeline) {
      console.log("Pipeline not found for name:", newPipelineName);
      return;
    }

    // Find the lead in the grouped format
    let lead = null;
    let currentPipelineId = null;
    
    // Check if leads is in the new grouped format
    if (Array.isArray(leads) && leads.length > 0 && leads[0].stageId && leads[0].leads) {
      // New format: find lead in grouped structure
      for (const stageGroup of leads) {
        const foundLead = stageGroup.leads.find(l => l.leadId === leadId);
        if (foundLead) {
          lead = foundLead;
          currentPipelineId = stageGroup.stageId;
          break;
        }
      }
    } else {
      // Old format: find lead directly
      lead = leads.find((l) => l.leadId === leadId);
      currentPipelineId = lead?.pipelineId || lead?.stageId;
    }

    if (!lead) {
      console.log("Lead not found for ID:", leadId);
      return;
    }

    const newPipelineId = newPipeline.pipelineId || newPipeline.stageId;

    console.log("Pipeline comparison:", {
      currentPipelineId,
      newPipelineId,
      isDifferent: String(currentPipelineId) !== String(newPipelineId),
    });

    if (String(currentPipelineId) !== String(newPipelineId)) {
      // If pipeline requires a form, open the modal instead of moving directly
      if (newPipeline.formType === "CONVERTED") {
        setSelectedLead({ ...lead, pipelineId: newPipelineId });
        setShowConvertModal(true);
        return;
      } else if (newPipeline.formType === "JUNK") {
        setSelectedLead({ ...lead, pipelineId: newPipelineId });
        setShowJunkModal(true);
        return;
      } else if (newPipeline.formType === "LOST") {
        setSelectedLead({ ...lead, pipelineId: newPipelineId });
        setShowLostModal(true);
        return;
      }

      // Otherwise, move lead directly
      console.log("Moving lead directly via API:", { leadId, newPipelineId });
      dispatch(moveLeadToPipeline({ leadId, newPipelineId }));
    } else {
      console.log("Pipeline is the same, no move needed");
    }
  };

  // Manager-specific handlers (retained from original)
  const handleEdit = (lead) => {
    setEditingLead(lead);
    setShowAddLeadModal(true);
  };

  const handleConvert = (lead) => {
    setLeadToConvertId(lead.leadId);
    setShowConvertModalManager(true);
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

  const handleAddLeadSubmit = async (formData) => {
    if (!formData.salesRep || !formData.designer) {
      toast.error("Please assign both Sales Person and Designer.");
      return;
    }
    const leadData = {
      ...defaultLeadData,
      ...formData,
      status: formData.status || "New",
      submittedBy: role,
    };

    try {
      if (editingLead && editingLead.leadId) {
        await dispatch(updateLead(leadData)).unwrap();
        toast.success("Lead updated successfully!");
      } else {
        // Assign a new unique leadId
        const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
        await dispatch(createLead({ ...leadData, leadId: newId })).unwrap();
        toast.success("Lead created successfully!");
      }

      setShowAddLeadModal(false);
      setEditingLead(null);
      // Refresh leads to get the updated grouped format
      dispatch(fetchLeads());
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Failed to save lead. Please try again.");
    }
  };

  const handleConvertModalClose = () => {
    setShowConvertModalManager(false);
    setLeadToConvertId(null);
    setPendingConversion(null);
  };
  const handleConvertSuccess = (updatedLead) => {
    dispatch(updateLead({ ...updatedLead, status: "Converted" }));
    handleConvertModalClose();
  };
  const handleLostModalClose = () => {
    setShowLostReasonModal(false);
    setLeadToMarkLost(null);
    setPendingLost(null);
  };
  const handleLostSuccess = (updatedLead) => {
    dispatch(updateLead({ ...updatedLead, status: "Lost" }));
    handleLostModalClose();
  };
  const handleJunkModalClose = () => {
    setShowJunkReasonModal(false);
    setLeadToMarkJunkId(null);
    setPendingJunk(null);
  };
  const handleJunkSuccess = (updatedLead) => {
    dispatch(updateLead({ ...updatedLead, status: "Junk" }));
    handleJunkModalClose();
  };

  const handleScheduleActivitySuccess = (activity) => {
    dispatch(
      updateLead({
        ...leadToScheduleActivity,
        activities: Array.isArray(leadToScheduleActivity.activities)
          ? [...leadToScheduleActivity.activities]
          : [],
        activities: [
          ...leadToScheduleActivity.activities,
          { ...activity, createdAt: new Date().toISOString() },
        ],
        updatedAt: new Date().toISOString(),
      })
    );
    setShowScheduleActivityModal(false);
    setLeadToScheduleActivity(null);
    toast.success("Activity scheduled successfully!");
  };

  // Confirmation modal for pipeline actions
  // PipelineActionConfirmModal component removed - pipeline management moved to settings

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleOpenAddLeadForm()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow flex items-center min-w-24 justify-center transition-colors duration-200 hover:bg-blue-700"
          >
            New
          </button>
          <div className="flex items-center space-x-1">
            <h2 className="text-xl font-semibold text-gray-700">
              Manager Pipeline
            </h2>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SearchBar filterText={filterText} setFilterText={setFilterText} />
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </div>

      {loading && <p className="text-center">Loading opportunities...</p>}
      {error && (
        <p className="text-center text-red-500">
          Error: {error.message || "Could not fetch opportunities."}
        </p>
      )}

   
{viewMode === "kanban" && (
  <KanbanBoardClientOnly
    leadsByStatus={Object.fromEntries(
      Object.entries(leadsByStatus).map(([status, leads]) => [
        status,
        leads.filter((lead) =>
          lead.name?.toLowerCase().includes(filterText.toLowerCase()) ||
          lead.contactNumber?.includes(filterText) ||
          lead.leadId?.toLowerCase().includes(filterText.toLowerCase())
        ),
      ])
    )}
    statuses={pipelines.map((p) => p.name)}
    kanbanStatuses={pipelines}
    onScheduleActivity={handleScheduleActivity}
    onDragEnd={handleDragEnd}
    debugProps={{ leadsByStatus, statuses: pipelines.map((p) => p.name) }}
  />
)}

{viewMode === "table" && (
  <LeadsTable
    leads={dedupedLeads.filter((lead) =>
      lead.name?.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.contactNumber?.includes(filterText) ||
      lead.leadId?.toLowerCase().includes(filterText.toLowerCase())
    )}
  />
)}


      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLeadSubmit}
        initialData={editingLead || defaultLeadData}
        isManagerView={true}
        salesPersons={salesPersons}
        designers={designers}
      />

      {showConvertModalManager && (
        <ConvertLeadModal
          lead={pendingConversion?.lead}
          onClose={handleConvertModalClose}
          onSuccess={pendingConversion ? handleConvertSuccess : undefined}
        />
      )}
      {showLostReasonModal && (
        <LostLeadModal
          lead={pendingLost?.lead}
          onClose={handleLostModalClose}
          onSuccess={pendingLost ? handleLostSuccess : undefined}
        />
      )}
      {showJunkReasonModal && (
        <JunkReasonModal
          lead={pendingJunk?.lead}
          onClose={handleJunkModalClose}
          onSuccess={pendingJunk ? handleJunkSuccess : undefined}
        />
      )}

      <AdvancedScheduleActivityModal
        isOpen={showScheduleActivityModal}
        onClose={() => {
          setShowScheduleActivityModal(false);
          setLeadToScheduleActivity(null);
        }}
        lead={leadToScheduleActivity}
        onSuccess={handleScheduleActivitySuccess}
      />

      {/* Pipeline management modals removed - moved to settings */}
      <AdvancedScheduleActivityModal
        isOpen={showAdvancedScheduleModal}
        onClose={() => {
          setShowAdvancedScheduleModal(false);
          setSelectedLeadForActivity(null);
        }}
        lead={selectedLeadForActivity}
      />
      <ConvertLeadModal
        lead={showConvertModal ? selectedLead : null}
        onClose={() => setShowConvertModal(false)}
        onSuccess={() => {
          setShowConvertModal(false);
          setSelectedLead(null);
          // Refresh leads to get the updated grouped format
          dispatch(fetchLeads());
        }}
      />
      <JunkReasonModal
        lead={showJunkModal ? selectedLead : null}
        onClose={() => setShowJunkModal(false)}
        onSuccess={() => {
          setShowJunkModal(false);
          setSelectedLead(null);
          // Refresh leads to get the updated grouped format
          dispatch(fetchLeads());
        }}
      />
      <LostLeadModal
        lead={showLostModal ? selectedLead : null}
        onClose={() => setShowLostModal(false)}
        onSuccess={() => {
          setShowLostModal(false);
          setSelectedLead(null);
          // Refresh leads to get the updated grouped format
          dispatch(fetchLeads());
        }}
      />
    </div>
  );
};

const Manager = ({ role }) => {
  return (
    <MainLayout>
      <ManagerContent role={role} />
    </MainLayout>
  );
};

export default Manager;
