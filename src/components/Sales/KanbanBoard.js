import React, { useEffect, useRef, useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { FaPlus, FaPalette, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import KanbanColumn from './KanbanColumn';
import LeadCard from './LeadCard';

const KanbanBoard = ({
  leadsByStatus,
  onDragEnd,
  statuses,
  onEdit,
  onConvert,
  onMarkLost,
  onMarkJunk,
  onAddLead,
  isAddingStage,
  newStageName,
  setNewStageName,
  onAddStage,
  onCancelAddStage,
  onScheduleActivity,
  onTeamAssign,
  managerEmployees = [],
  allowAssignment = false,
  setIsForm,
  setStageColor,
  stageColor,
  isForm,
  ...rest
}) => {
  const inputRef = useRef(null);
  const [activeLead, setActiveLead] = useState(null);

  // Configure sensors for better drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced minimum distance to start dragging
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Professional color palette with better contrast
  const COLOR_PALETTE = [
    { color: '#3b82f6', name: 'Blue' },
    { color: '#6366f1', name: 'Indigo' },
    { color: '#10b981', name: 'Emerald' },
    { color: '#f59e0b', name: 'Amber' },
    { color: '#06b6d4', name: 'Cyan' },
    { color: '#ef4444', name: 'Red' },
    { color: '#8b5cf6', name: 'Violet' },
    { color: '#64748b', name: 'Slate' }
  ];

  useEffect(() => {
    if (isAddingStage && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAddingStage]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onCancelAddStage();
      }
    };

    if (isAddingStage) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAddingStage, onCancelAddStage]);

  const handleDragStart = (event) => {
    const { active } = event;
    
    // Find the lead being dragged
    const leadId = active.id;
    const allLeads = Object.values(leadsByStatus).flat();
    const draggedLead = allLeads.find(lead => lead.leadId === leadId);
    setActiveLead(draggedLead);
  };

  const handleDragEnd = (event) => {
    setActiveLead(null);
    onDragEnd(event);
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 overflow-hidden">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 p-4 h-full w-full overflow-x-auto scrollbar-hide">
          {Array.isArray(statuses) && statuses.map((statusName, idx) => {
            const stageObj = (rest.kanbanStatuses || []).find(s => s.name === statusName);
            return (
              <KanbanColumn
                key={statusName}
                status={statusName}
                stage={stageObj}
                leads={leadsByStatus[statusName] || []}
                onEdit={onEdit}
                onConvert={onConvert}
                onMarkLost={onMarkLost}
                onMarkJunk={onMarkJunk}
                onAddLead={onAddLead}
                onScheduleActivity={onScheduleActivity}
                onTeamAssign={onTeamAssign}
                managerEmployees={managerEmployees}
                allowAssignment={allowAssignment}
              />
            );
          })}
          {isAddingStage && (
            <div className="flex-shrink-0 w-[320px] bg-white rounded-2xl shadow-xl border border-gray-200/60 backdrop-blur-sm h-full overflow-y-auto">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <FaPlus className="text-white text-sm" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Add Pipeline Stage</h3>
                    <p className="text-xs text-gray-500">Create a new stage for your sales pipeline</p>
                  </div>
                </div>

                {/* Stage Name Input */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Stage Name
                  </label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newStageName}
                      onChange={(e) => setNewStageName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && onAddStage()}
                      placeholder="e.g., Qualified Leads"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50 hover:bg-white text-sm"
                    />
                    {newStageName === '' && (
                      <span className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                        Stage name is required
                      </span>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2 mb-5">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <FaPalette className="text-gray-400" />
                    Stage Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PALETTE.map(({ color, name }) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setStageColor(color)}
                        className={`group relative w-10 h-10 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                          stageColor === color 
                            ? 'border-blue-600 ring-2 ring-blue-200 shadow-lg' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ background: color }}
                        aria-label={`Select ${name} color`}
                      >
                        {stageColor === color && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                          </div>
                        )}
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-xs bg-gray-900 text-white px-2 py-1 rounded whitespace-nowrap">
                            {name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Toggle */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    {isForm ? <FaToggleOn className="text-blue-500" /> : <FaToggleOff className="text-gray-400" />}
                    Require Form Completion
                  </label>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Form Required</p>
                      <p className="text-xs text-gray-500">Leads must complete a form to enter this stage</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsForm(prev => !prev)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        isForm ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      aria-pressed={isForm}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                          isForm ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={onCancelAddStage}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onAddStage}
                    disabled={!newStageName}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Stage
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DragOverlay zIndex={9999}>
          {activeLead ? (
            <div className="transform rotate-1 scale-105 shadow-2xl">
              <LeadCard
                lead={activeLead}
                onEdit={onEdit}
                onConvert={onConvert}
                onMarkLost={onMarkLost}
                onMarkJunk={onMarkJunk}
                onScheduleActivity={onScheduleActivity}
                onTeamAssign={onTeamAssign}
                managerEmployees={managerEmployees}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;