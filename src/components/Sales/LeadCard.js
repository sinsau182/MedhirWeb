import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import {
  FaStar,
  FaRegStar,
  FaRupeeSign,
  FaCalendarAlt,
  FaUser,
  FaUserTie,
  FaPhone,
  FaEnvelope,
  FaCommentDots,
  FaRegClock,
} from "react-icons/fa";
import LeadActions from './LeadActions';
import TeamMemberAssignmentModal from './TeamMemberAssignmentModal';

const LeadCard = ({ lead, onEdit, onConvert, onMarkLost, onMarkJunk, onScheduleActivity, onTeamAssign, managerEmployees = [], allowAssignment = false }) => {
  const router = useRouter();
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamModalRole, setTeamModalRole] = useState('');
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  console.log(managerEmployees)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ 
    id: lead.leadId,
    data: {
      type: 'lead',
      lead: lead
    }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const handleCardDoubleClick = (e) => {
    if (e.target.closest('.lead-actions')) {
      return;
    }
    router.push(`/Sales/leads/${lead.leadId}`);
  };

  const renderStars = (priority) => {
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        i < priority ? (
          <FaStar key={i} className="text-yellow-400" />
        ) : (
          <FaRegStar key={i} className="text-gray-300" />
        )
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  // Map priority string to stars
  const priorityToStars = (priority) => {
    if (typeof priority === 'number') return priority;
    if (!priority) return 0;
    const map = { low: 1, medium: 2, high: 3 };
    return map[String(priority).toLowerCase()] || 0;
  };

  // Initials for Sales Rep and Designer (fallback to salesRep/designer if assignSalesPersonEmpId/assignDesignerEmpId are null)
  const getInitial = (id, fallback) => {
    if (id) return id.toString().charAt(0).toUpperCase();
    if (fallback) return fallback.toString().charAt(0).toUpperCase();
    return '--';
  };

  // Tooltip helpers
  const tooltip = (label, value) => `${label}: ${value || 'Unassigned'}`;

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });
  }

  function CustomTooltip({ children, text }) {
    const [show, setShow] = useState(false);
    return (
      <span
        className="relative"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
        {show && (
          <div className="absolute left-1/2 -translate-x-1/2 top-8 z-50 bg-white text-gray-800 px-3 py-2 rounded shadow-lg border text-xs whitespace-pre min-w-max">
            {text}
          </div>
        )}
      </span>
    );
  }

  const handleTeamMemberClick = (role, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setTeamModalRole(role);
    setShowTeamModal(true);
  };

  const handleTeamAssignment = (assignmentData) => {
    if (onTeamAssign) {
      onTeamAssign(assignmentData);
    }
    setShowTeamModal(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onDoubleClick={handleCardDoubleClick}
      {...attributes}
      {...listeners}
      className={`
        bg-white p-3 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 cursor-grab
        ${isDragging ? 'opacity-50 shadow-lg scale-105 rotate-1' : 'hover:shadow-md'}
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
        ${isDragging ? 'z-50' : ''}
      `}
    >
      {/* Header: Name and Priority */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-sm truncate flex-1 mr-2">{lead.name}</h3>
        <div className="flex items-center">{renderStars(priorityToStars(lead.priority))  || ''}</div>
      </div>
      
      {/* Budget and Date */}
      <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
        <span className="flex items-center gap-1 font-medium">
          <FaRupeeSign className="text-blue-500 text-xs" />
          {lead.budget ? Number(lead.budget).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
        </span>
        <span className="text-gray-300">•</span>
        <span className="flex items-center gap-1">
          <FaCalendarAlt className="text-gray-400 text-xs" />
          {formatDate(lead.dateOfCreation)}
        </span>
      </div>
      
      {/* Team Members */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {allowAssignment ? (
            <>
              <CustomTooltip text={`${lead.assignSalesPersonEmpId || lead.salesRep || '--'}\nSales Person\nClick to assign`}>
                <button
                  onClick={(e) => handleTeamMemberClick('sales', e)}
                  className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs cursor-pointer border border-white shadow-sm hover:bg-blue-200 hover:scale-110 transition-all duration-200"
                >
                  {getInitial(lead.assignSalesPersonEmpId, lead.salesRep)}
                </button>
              </CustomTooltip>
              <CustomTooltip text={`${lead.assignDesignerEmpId || lead.designer || '--'}\nDesigner\nClick to assign`}>
                <button
                  onClick={(e) => handleTeamMemberClick('designer', e)}
                  className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs cursor-pointer border border-white shadow-sm hover:bg-green-200 hover:scale-110 transition-all duration-200"
                >
                  {getInitial(lead.assignDesignerEmpId, lead.designer)}
                </button>
              </CustomTooltip>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-white shadow-sm">
                {getInitial(lead.assignSalesPersonEmpId, lead.salesRep)}
              </div>
              <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs border border-white shadow-sm">
                {getInitial(lead.assignDesignerEmpId, lead.designer)}
              </div>
            </>
          )}
        </div>
        
        {/* Activity Button */}
        <button
          type="button"
          title="Schedule Activity"
          onClick={() => onScheduleActivity && onScheduleActivity(lead)}
          className="hover:bg-blue-50 rounded-full p-1 transition-colors text-gray-400 hover:text-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-300"
        >
          <FaRegClock size={14} />
        </button>
      </div>
      
      {/* Activity Status */}
      {lead.latestActivityTitle && (
        <div className="text-xs text-gray-400 truncate">
          {lead.latestActivityTitle}
        </div>
      )}

      {/* Team Member Assignment Modal */}
      <TeamMemberAssignmentModal
        isOpen={showTeamModal}
        onClose={() => setShowTeamModal(false)}
        lead={lead}
        onAssign={handleTeamAssignment}
        role={teamModalRole}
        salesEmployees={managerEmployees}
        position={modalPosition}
      />
    </div>
  );
};

export default LeadCard;