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
import DynamicFormModal from "@/components/DynamicFormModal";
import {
  fetchLeads,
  updateLead,
  createLead,
  moveLeadToPipeline,
} from "@/redux/slices/leadsSlice";
import {
  fetchPipelines,
} from "@/redux/slices/pipelineSlice";
import {
  fetchFormByStage,
  submitFormData,
} from "@/redux/slices/formBuilderSlice";
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

// DeletePipelineModal component removed - pipeline management moved to settings

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

const LeadManagementContent = ({ role }) => {
  const dispatch = useDispatch();
  const { pipelines } = useSelector((state) => state.pipelines);
  const { leads } = useSelector((state) => state.leads);

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
  const [showDynamicFormModal, setShowDynamicFormModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Form builder state
  const { currentForm, formSubmissionLoading } = useSelector((state) => state.formBuilder);

  // Fetch pipelines and all leads on mount
  useEffect(() => {
    dispatch(fetchPipelines());
    dispatch(fetchLeads());
  }, [dispatch]);



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
  const handleDragEnd = async (event) => {
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

    console.log("Found pipeline:", newPipeline);

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
      console.log("Pipeline form type:", newPipeline.formType);
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
      } else if (newPipeline.formType === "CUSTOM_FORM" || 
                 (newPipeline.isForm && newPipeline.formType === "CUSTOM_FORM") ||
                 (newPipeline.isForm && newPipeline.customFormId)) {
        console.log("Handling CUSTOM_FORM for stage:", newPipeline);
        console.log("Stage ID:", newPipeline.stageId);
        console.log("Custom Form ID:", newPipeline.customFormId);
        console.log("Is Form:", newPipeline.isForm);
        console.log("Form Type:", newPipeline.formType);
        
        // Handle custom form - fetch the form and show dynamic modal
        try {
          const result = await dispatch(fetchFormByStage(newPipeline.stageId));
          console.log("Fetch form result:", result);
          console.log("Result payload:", result.payload);
          console.log("Result meta:", result.meta);
          
          if (fetchFormByStage.fulfilled.match(result)) {
            console.log("Form fetched successfully, showing modal");
            console.log("Current form in state:", result.payload);
            setSelectedLead({ ...lead, pipelineId: newPipelineId });
            setShowDynamicFormModal(true);
          } else {
            console.error("Failed to fetch form for stage:", newPipeline.stageId);
            console.error("Error details:", result.error);
            toast.error("Failed to load form. Please try again.");
          }
        } catch (error) {
          console.error("Error fetching form:", error);
          toast.error("Failed to load form. Please try again.");
        }
        return;
      }

      // Otherwise, move lead directly
      console.log("Moving lead directly via API:", { leadId, newPipelineId });
      dispatch(moveLeadToPipeline({ leadId, newPipelineId }));
    } else {
      console.log("Pipeline is the same, no move needed");
    }
  };

  // PipelineActionConfirmModal component removed - pipeline management moved to settings

  // Add lead handler for AddLeadModal
  const handleAddLead = async (leadData) => {
    await dispatch(createLead(leadData));
    // Refresh leads to get the updated grouped format
    dispatch(fetchLeads());
  };

  // Dynamic form submission handler
  const handleDynamicFormSubmit = async (formValues) => {
    if (!selectedLead || !currentForm) {
      toast.error("Missing lead or form data");
      return;
    }

    try {
      const formSubmissionData = {
        formId: currentForm.formId,
        leadId: selectedLead.leadId,
        formData: formValues,
        submittedBy: role || "SALESMANAGER"
      };

      const result = await dispatch(submitFormData(formSubmissionData));
      if (submitFormData.fulfilled.match(result)) {
        toast.success("Form submitted successfully!");
        // Move the lead to the new pipeline
        const newPipelineId = selectedLead.pipelineId;
        if (newPipelineId) {
          dispatch(moveLeadToPipeline({ leadId: selectedLead.leadId, newPipelineId }));
        }
        setShowDynamicFormModal(false);
        setSelectedLead(null);
        // Refresh leads
        dispatch(fetchLeads());
      } else {
        toast.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => setShowAddLeadModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow flex items-center min-w-24 justify-center transition-colors duration-200 hover:bg-blue-700"
          >
            New
          </button>
          <div className="flex items-center space-x-1">
            <h2 className="text-xl font-semibold text-gray-700">Pipeline</h2>
          </div>
        </div>
      </div>
      <KanbanBoardClientOnly
        leadsByStatus={leadsByStatus}
        statuses={pipelines.map((p) => p.name)}
        kanbanStatuses={pipelines}
        onScheduleActivity={handleScheduleActivity}
        onDragEnd={handleDragEnd}
        // Debug props
        debugProps={{ leadsByStatus, statuses: pipelines.map((p) => p.name) }}
      />
      {/* Pipeline management modals removed - moved to settings */}
      <AddLeadModal
        isOpen={showAddLeadModal}
        onClose={() => setShowAddLeadModal(false)}
        onSubmit={handleAddLead}
        // Add other props as needed
      />
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
      <DynamicFormModal
        isOpen={showDynamicFormModal}
        onClose={() => {
          setShowDynamicFormModal(false);
          setSelectedLead(null);
        }}
        formData={currentForm}
        leadId={selectedLead?.leadId}
        onSubmit={handleDynamicFormSubmit}
        loading={formSubmissionLoading}
      />
    </div>
  );
};

const LeadManagement = ({ role }) => {
  return (
    <MainLayout>
      <LeadManagementContent role={role} />
    </MainLayout>
  );
};

export default LeadManagement;