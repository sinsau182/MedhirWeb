import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaTimes } from "react-icons/fa";
import { fetchPipelines, deletePipeline } from "@/redux/slices/pipelineSlice";
import { fetchLeads } from "@/redux/slices/leadsSlice";
import { toast } from "sonner";

const DeletePipelineModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { pipelines } = useSelector((state) => state.pipelines);
  const { leads } = useSelector((state) => state.leads);
  const [selectedStages, setSelectedStages] = useState([]);
  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (isOpen) {
      dispatch(fetchPipelines());
      setSelectedStages([]);
      setWarning("");
    }
  }, [isOpen, dispatch]);

  // Check if any selected stage has leads
  useEffect(() => {
    if (selectedStages.length > 0) {
      let hasLeads = false;
      // Check if leads is in the new grouped format
      if (Array.isArray(leads) && leads.length > 0 && leads[0].stageId && leads[0].leads) {
        // New format: check if any selected stage has leads
        hasLeads = selectedStages.some((stageId) =>
          leads.some((stageGroup) =>
            stageGroup.stageId === stageId && stageGroup.leads && stageGroup.leads.length > 0
          )
        );
      } else {
        // Old format: check individual leads
        hasLeads = selectedStages.some((stageId) =>
          leads.some((lead) => lead.stageId === stageId)
        );
      }
      if (hasLeads) {
        setWarning(
          "Cannot delete: One or more selected pipeline stages contain leads. Please move or delete all leads in these stages first."
        );
      } else {
        setWarning("");
      }
    } else {
      setWarning("");
    }
  }, [selectedStages, leads]);

  const handleStageToggle = (stageId) => {
    setSelectedStages((prev) =>
      prev.includes(stageId)
        ? prev.filter((id) => id !== stageId)
        : [...prev, stageId]
    );
  };

  const handleDelete = async () => {
    // Prevent deletion if warning is present
    if (warning) return;
    if (selectedStages.length === 0) return;
    const results = await Promise.all(
      selectedStages.map((id) => dispatch(deletePipeline(id)))
    );
    let hadLeadsError = false;
    results.forEach((result) => {
      if (result.type && result.type.endsWith("rejected")) {
        const errorMsg = result.payload || result.error?.message || "";
        if (
          typeof errorMsg === "string" &&
          errorMsg.toLowerCase().includes("lead")
        ) {
          hadLeadsError = true;
        }
      }
    });
    if (hadLeadsError) {
      toast.error(
        "Cannot delete pipeline: it contains leads. Please move or delete all leads in this stage first."
      );
    }
    setSelectedStages([]);
    onClose();
    dispatch(fetchPipelines());
    // Refresh leads to get the updated grouped format
    dispatch(fetchLeads());
  };

  const handleSelectAll = () => {
    setSelectedStages(pipelines.map((p) => p.stageId));
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
            Select one or more pipeline stages to delete. This action cannot be
            undone.
          </p>
          {warning && (
            <div className="mb-4 p-3 rounded bg-red-100 border border-red-300 text-red-700 text-sm font-semibold">
              {warning}
            </div>
          )}
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
            {pipelines.map((stage) => (
              <label
                key={stage.stageId}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage.stageId)}
                  onChange={() => handleStageToggle(stage.stageId)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm font-medium">{stage.name}</span>
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
            disabled={selectedStages.length === 0 || !!warning}
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

export default DeletePipelineModal; 