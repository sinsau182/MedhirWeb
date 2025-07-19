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
  FaTimes
} from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import ConvertLeadModal from "@/components/Sales/ConvertLeadModal";
import LostLeadModal from "@/components/Sales/LostLeadModal";
import JunkReasonModal from "@/components/Sales/JunkReasonModal";
import AddLeadModal from "@/components/Sales/AddLeadModal";
import KanbanBoard from "@/components/Sales/KanbanBoard";
import {
  fetchLeads,
  updateLead,
  createLead,
} from "@/redux/slices/leadsSlice";
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
} from '@/components/ui/table';

const salesPersons = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' },
  { id: 4, name: 'Dana' },
];
const designers = [
  { id: 1, name: 'Bob' },
  { id: 2, name: 'Dana' },
  { id: 3, name: 'Frank' },
  { id: 4, name: 'Jack' },
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
    setSelectedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
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
          <h2 className="text-xl font-bold text-gray-800">Delete Pipeline Stages</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Select the pipeline stages you want to delete. This action cannot be undone.
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
              <label key={stage} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
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
            Delete {selectedStages.length > 0 ? `(${selectedStages.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

// MOCK DATA: Replace with your own if needed
const MOCK_LEADS = [
  {
    leadId: 'LEAD101',
    name: 'John Doe',
    contactNumber: '1234567890',
    email: 'john@example.com',
    projectType: 'Residential',
    propertyType: 'Apartment',
    address: '123 Main St',
    area: '1200',
    budget: '1500000',
    designStyle: 'Modern',
    leadSource: 'Website',
    preferredContact: 'Phone',
    notes: 'Interested in 2BHK',
    status: 'New',
    rating: 2,
    salesRep: 'Alice',
    designer: 'Bob',
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
    submittedBy: 'MANAGER',
    paymentDetailsFileName: null,
    bookingFormFileName: null,
  },
  {
    leadId: 'LEAD102',
    name: 'Jane Smith',
    contactNumber: '9876543210',
    email: 'jane@example.com',
    projectType: 'Commercial',
    propertyType: 'Office',
    address: '456 Market St',
    area: '2000',
    budget: '3000000',
    designStyle: 'Contemporary',
    leadSource: 'Referral',
    preferredContact: 'Email',
    notes: 'Needs open workspace',
    status: 'Contacted',
    rating: 3,
    salesRep: 'Charlie',
    designer: 'Dana',
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
    submittedBy: 'MANAGER',
    paymentDetailsFileName: null,
    bookingFormFileName: null,
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
            <TableCell>{lead.salesRep || <span className="text-gray-400">Unassigned</span>}</TableCell>
            <TableCell>{lead.designer || <span className="text-gray-400">Unassigned</span>}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

const ManagerContent = ({ role }) => {
  // const dispatch = useDispatch();
  // const { leads, loading, error } = useSelector((state) => state.leads);
  // const { stages: kanbanStatuses } = useSelector((state) => state.pipeline);

  // Use local state for leads and pipeline stages
  const [leads, setLeads] = useState(MOCK_LEADS);
  const [kanbanStatuses, setKanbanStatuses] = useState([
    'New',
    'Contacted',
    'Qualified',
    'Quoted',
    'Converted',
    'Lost',
    'Junk',
  ]);

  // Deduplicate leads by leadId (keep first occurrence)
  const dedupedLeads = React.useMemo(() => {
    const seen = new Set();
    return leads.filter(lead => {
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
  const [viewMode, setViewMode] = useState('kanban');

  const [pendingConversion, setPendingConversion] = useState(null); // {lead, fromStatus}
  const [pendingLost, setPendingLost] = useState(null); // {lead, fromStatus}
  const [pendingJunk, setPendingJunk] = useState(null); // {lead, fromStatus}

  // Remove backend fetch
  // useEffect(() => {
  //   dispatch(fetchLeads());
  // }, [dispatch]);

  // Remove backend pipeline fetch
  // useEffect(() => {
  //   ...
  // }, [showPipelineDropdown]);

  // All lead operations now update local state
  const leadsByStatus = useMemo(() => {
    const grouped = {};
    kanbanStatuses.forEach(status => {
      grouped[status] = [];
    });
    const filteredLeads = dedupedLeads.filter(lead =>
      Object.values(lead).some(value =>
        String(value).toLowerCase().includes(filterText.toLowerCase())
      )
    );
    filteredLeads.forEach(lead => {
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

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const leadId = active.id;
    const newStatus = over.id;
    const oldLead = leads.find(l => l.leadId === leadId);
    if (newStatus === 'Converted') {
      setPendingConversion({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToConvertId(leadId);
      setShowConvertModal(true);
    } else if (newStatus === 'Lost') {
      setPendingLost({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkLost(oldLead);
      setShowLostReasonModal(true);
    } else if (newStatus === 'Junk') {
      setPendingJunk({ lead: oldLead, fromStatus: oldLead.status });
      setLeadToMarkJunkId(leadId);
      setShowJunkReasonModal(true);
    } else {
      setLeads(prevLeads => prevLeads.map(l =>
        l.leadId === leadId ? { ...l, status: newStatus } : l
      ));
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
    if (typeof status === 'string') {
      newLeadData.status = status;
    }
    setEditingLead(newLeadData);
    setShowAddLeadModal(true);
  };

  const handleAddLeadSubmit = (formData) => {
    if (!formData.salesRep || !formData.designer) {
      toast.error('Please assign both Sales Person and Designer.');
      return;
    }
    const leadData = {
      ...defaultLeadData,
      ...formData,
      status: formData.status || "New",
      submittedBy: role,
    };
    if (editingLead && editingLead.leadId) {
      setLeads(prevLeads => prevLeads.map(l =>
        l.leadId === editingLead.leadId ? { ...l, ...leadData } : l
      ));
    } else {
      // Assign a new unique leadId
      const newId = `LEAD${Math.floor(Math.random() * 100000)}`;
      setLeads(prevLeads => [
        ...prevLeads,
        { ...leadData, leadId: newId },
      ]);
    }
    setShowAddLeadModal(false);
  };

  const handleAddStage = () => {
    if (newStageName && !kanbanStatuses.includes(newStageName)) {
      setKanbanStatuses(prev => [...prev, newStageName]);
      setNewStageName("");
      setIsAddingStage(false);
    }
  };

  const handleCancelAddStage = () => {
    setNewStageName("");
    setIsAddingStage(false);
  };

  const handlePipelineAction = (action) => {
    setShowPipelineDropdown(false);
    if (action === 'add') {
      setIsAddingStage(true);
    } else if (action === 'delete') {
      setShowDeletePipelineModal(true);
    }
  };

  const handleDeleteStages = (stagesToDelete) => {
    // Check if any leads are currently in the stages being deleted
    const leadsInStages = dedupedLeads.filter(lead => stagesToDelete.includes(lead.status));
    if (leadsInStages.length > 0) {
      toast.error(`Cannot delete stages with active leads. Please move ${leadsInStages.length} lead(s) to other stages first.`);
      return;
    }
    setKanbanStatuses(prev => prev.filter(stage => !stagesToDelete.includes(stage)));
    toast.success(`Successfully deleted ${stagesToDelete.length} stage(s)`);
  };

  const handleConvertModalClose = () => {
    setShowConvertModal(false);
    setLeadToConvertId(null);
    setPendingConversion(null);
  };
  const handleConvertSuccess = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l =>
      l.leadId === updatedLead.leadId ? { ...l, ...updatedLead, status: 'Converted' } : l
    ));
    handleConvertModalClose();
  };
  const handleLostModalClose = () => {
    setShowLostReasonModal(false);
    setLeadToMarkLost(null);
    setPendingLost(null);
  };
  const handleLostSuccess = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l =>
      l.leadId === updatedLead.leadId ? { ...l, ...updatedLead, status: 'Lost' } : l
    ));
    handleLostModalClose();
  };
  const handleJunkModalClose = () => {
    setShowJunkReasonModal(false);
    setLeadToMarkJunkId(null);
    setPendingJunk(null);
  };
  const handleJunkSuccess = (updatedLead) => {
    setLeads(prevLeads => prevLeads.map(l =>
      l.leadId === updatedLead.leadId ? { ...l, ...updatedLead, status: 'Junk' } : l
    ));
    handleJunkModalClose();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => handleOpenAddLeadForm()}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg shadow hover:bg-purple-700 flex items-center min-w-24 justify-center"
          >
            New
          </button>

        </div>

        <div className="flex items-center space-x-4">
          <div className="relative w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="border p-2 rounded-md shadow-sm w-full pl-10 bg-white"
            />
          </div>

          <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-md">
            <button
              className={`p-2 rounded-md transition-colors ${viewMode === 'kanban' ? 'bg-white shadow text-purple-700' : 'hover:bg-white/50 text-gray-600'}`}
              onClick={() => setViewMode('kanban')}
              title="Kanban Board View"
            >
              <FaThLarge size={18} />
            </button>
            <button
              className={`p-2 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white shadow text-purple-700' : 'hover:bg-white/50 text-gray-600'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <FaListUl size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* {loading && <p className="text-center">Loading opportunities...</p>}
      {error && <p className="text-center text-red-500">Error: {error.message || "Could not fetch opportunities."}</p>} */}

      {viewMode === 'kanban' ? (
        <KanbanBoard
          leadsByStatus={leadsByStatus}
          onDragEnd={handleDragEnd}
          statuses={kanbanStatuses}
          onEdit={handleEdit}
          onConvert={handleConvert}
          onMarkLost={handleMarkLost}
          onMarkJunk={handleMarkJunk}
          onAddLead={handleOpenAddLeadForm}
          isAddingStage={isAddingStage}
          newStageName={newStageName}
          setNewStageName={setNewStageName}
          onAddStage={handleAddStage}
          onCancelAddStage={handleCancelAddStage}
        />
      ) : (
        <LeadsTable leads={dedupedLeads} />
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

      {showConvertModal && (
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
      
      <DeletePipelineModal
        isOpen={showDeletePipelineModal}
        onClose={() => setShowDeletePipelineModal(false)}
        stages={kanbanStatuses}
        onDeleteStages={handleDeleteStages}
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