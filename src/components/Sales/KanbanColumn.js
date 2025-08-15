import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FaPlus, FaUsers } from 'react-icons/fa';
import LeadCard from './LeadCard';

const statusColors = {
  'New': 'bg-gray-400 text-gray-400',
  'Contacted': 'bg-blue-500 text-blue-500',
  'Qualified': 'bg-green-500 text-green-500',
  'Quoted': 'bg-purple-500 text-purple-500',
  'Converted': 'bg-green-700 text-green-700',
  'Lost': 'bg-red-500 text-red-500',
  'Junk': 'bg-yellow-500 text-yellow-500',
};
const underlineColors = {
  'New': 'bg-gray-400',
  'Contacted': 'bg-blue-500',
  'Qualified': 'bg-green-500',
  'Quoted': 'bg-purple-500',
  'Converted': 'bg-green-700',
  'Lost': 'bg-red-500',
  'Junk': 'bg-yellow-500',
};

const KanbanColumn = ({
  status,
  stage,
  leads,
  onEdit,
  onConvert,
  onMarkLost,
  onMarkJunk,
  onAddLead,
  onScheduleActivity,
  onTeamAssign,
  managerEmployees = [],
  allowAssignment = false,
  activeRoleTab,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const showAddButton = false;

  return (
    <div
      ref={setNodeRef}
      className={`
        flex-1 min-w-[200px] max-w-[400px] h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 transition-all duration-300 flex flex-col
        ${isOver ? 'bg-blue-50/90 border-blue-300 shadow-xl scale-[1.02] ring-2 ring-blue-200/50' : 'hover:shadow-xl hover:bg-white/90'}
      `}
    >
      {/* Column Header - Fixed */}
      <div className="px-3 py-2.5 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl border-b border-gray-100/60 flex-shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            {/* Colored indicator */}
            <div className="relative">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-sm" 
                style={{ backgroundColor: stage?.color || '#64748b' }}
              ></span>
              <span 
                className="absolute -top-0.5 -right-0.5 w-1 h-1 rounded-full bg-white border border-gray-200"
                style={{ backgroundColor: stage?.color || '#64748b' }}
              ></span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{status}</h3>
            </div>
          </div>
          
          <div className="flex items-center gap-1 mt-0.5">
            <FaUsers className="text-gray-400 text-xs" />
            <span className="text-xs text-gray-500 font-medium">
              {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
            </span>
          </div>
        </div>
        
        {/* Colored accent line */}
        <div 
          className="h-0.5 rounded-full transition-all duration-300"
          style={{ backgroundColor: stage?.color || '#64748b' }}
        ></div>
      </div>

      {/* Column Content - Scrollable */}
      <div className={`
        flex-1 px-2.5 py-2.5 space-y-2 overflow-y-auto scrollbar-thin transition-all duration-300
        ${isOver ? 'bg-blue-50/30' : 'bg-gray-50/30'}
      `}>
        {leads.map((lead) => (
          <LeadCard
            key={lead.leadId}
            lead={lead}
            onEdit={onEdit}
            onConvert={onConvert}
            onMarkLost={onMarkLost}
            onMarkJunk={onMarkJunk}
            onScheduleActivity={onScheduleActivity}
            onTeamAssign={onTeamAssign}
            managerEmployees={managerEmployees}
            allowAssignment={allowAssignment}
            activeRoleTab={activeRoleTab}
          />
        ))}
        
        {/* Drop zone indicator */}
        {isOver && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 transition-all duration-200">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-1.5">
              <FaPlus className="text-blue-600 text-xs" />
            </div>
            <span className="text-blue-600 text-xs font-medium">Drop lead here</span>
            <span className="text-blue-400 text-xs mt-0.5">Move to {status}</span>
          </div>
        )}
        
        {/* Empty state */}
        {!isOver && leads.length === 0 && (
          <div className="flex flex-col items-center justify-center h-20 text-gray-400">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mb-1.5">
              <FaUsers className="text-gray-400 text-xs" />
            </div>
            <span className="text-xs font-medium">No leads</span>
            <span className="text-xs mt-0.5">Drag and drop leads here</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn; 