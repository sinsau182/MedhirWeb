import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { FaTimes, FaTrash, FaTimesCircle, FaExclamationTriangle, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';
import { fetchLeads } from '@/redux/slices/leadsSlice';

const LostJunkLeadsModal = ({ isOpen, onClose, position = { x: 0, y: 0 } }) => {
  const router = useRouter();
  const { leads } = useSelector((state) => state.leads);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'junk'

  // Filter leads based on the grouped structure from fetchLeads
  const lostLeads = [];
  const junkLeads = [];

  // Process the grouped leads data
  if (Array.isArray(leads)) {
    leads.forEach(stage => {
      if (stage.formType === 'LOST' && stage.leads) {
        // Add stage information to each lead
        const leadsWithStage = stage.leads.map(lead => ({
          ...lead,
          stageName: 'Lost',
          formType: stage.formType
        }));
        lostLeads.push(...leadsWithStage);
      } else if (stage.formType === 'JUNK' && stage.leads) {
        // Add stage information to each lead
        const leadsWithStage = stage.leads.map(lead => ({
          ...lead,
          stageName: 'Junk',
          formType: stage.formType
        }));
        junkLeads.push(...leadsWithStage);
      }
    });
  }

  // Debug logging
  console.log('All leads data:', leads);
  console.log('Lost leads:', lostLeads);
  console.log('Junk leads:', junkLeads);

  // Calculate position to ensure popup stays within viewport
  const getAdjustedPosition = () => {
    const popupWidth = 600; // estimated width
    const popupHeight = 500; // estimated height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 20; // margin from viewport edges
    
    // Position modal to the right of the click position
    let adjustedX = position.x + 20; // 20px offset to the right
    let adjustedY = position.y - 50; // 50px offset above the click
    
    // Calculate the popup boundaries
    const popupLeft = adjustedX;
    const popupRight = adjustedX + popupWidth;
    const popupTop = adjustedY;
    const popupBottom = adjustedY + popupHeight;
    
    // Adjust X position to keep within viewport
    if (popupRight > viewportWidth - margin) {
      // If it would go off the right edge, position to the left of the click
      adjustedX = position.x - popupWidth - 20;
    }
    if (popupLeft < margin) {
      // If it would go off the left edge, position at the left margin
      adjustedX = margin;
    }
    
    // Adjust Y position to keep within viewport
    if (popupTop < margin) {
      // If it would go above viewport, show below the click position
      adjustedY = position.y + 20;
    }
    if (popupBottom > viewportHeight - margin) {
      // If it would go below viewport, show above the click position
      adjustedY = viewportHeight - popupHeight - margin;
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const handleClose = () => {
    onClose();
  };

  const handleLeadClick = (leadId) => {
    router.push(`/Sales/leads/${leadId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get adjusted position
  const adjustedPosition = getAdjustedPosition();
  
  // Fallback to center if position is invalid
  const finalPosition = {
    x: isNaN(adjustedPosition.x) || adjustedPosition.x < 0 ? window.innerWidth / 2 : adjustedPosition.x,
    y: isNaN(adjustedPosition.y) || adjustedPosition.y < 0 ? window.innerHeight / 2 : adjustedPosition.y
  };

  // Final safety check to ensure modal stays within viewport
  const modalLeft = Math.max(20, Math.min(finalPosition.x, window.innerWidth - 620));
  const modalTop = Math.max(20, Math.min(finalPosition.y, window.innerHeight - 520));

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999]"
      onClick={handleClose}
    >
      <div 
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[500px] max-w-[600px] max-h-[500px] overflow-hidden"
        style={{
          position: 'fixed',
          left: `${modalLeft}px`,
          top: `${modalTop}px`,
          zIndex: 100000,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FaTrash className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-800 text-lg">
              Lost & Junk Leads
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('lost')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'lost'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTimesCircle className="w-4 h-4" />
            Lost Leads ({lostLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('junk')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'junk'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaExclamationTriangle className="w-4 h-4" />
            Junk Leads ({junkLeads.length})
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[350px]">
          {activeTab === 'lost' ? (
            <div className="space-y-3">
              {lostLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaTimesCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No lost leads found</p>
                </div>
              ) : (
                                 lostLeads.map((lead) => (
                   <div 
                     key={lead.leadId} 
                     className="p-3 border border-orange-200 rounded-lg bg-orange-50 cursor-pointer hover:bg-orange-100 transition-colors"
                     onClick={() => handleLeadClick(lead.leadId)}
                   >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{lead.name}</h4>
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">Lost</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <FaRupeeSign className="text-orange-500" />
                        {lead.budget ? Number(lead.budget).toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-orange-500" />
                        {formatDate(lead.dateOfCreation)}
                      </span>
                    </div>
                                         <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded">
                       <strong>Sales Rep:</strong> {lead.salesRep || 'Not Assigned'}
                     </div>
                     {lead.priority && (
                       <div className="text-xs text-orange-600 bg-orange-100 p-2 rounded mt-1">
                         <strong>Priority:</strong> {lead.priority}
                       </div>
                     )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {junkLeads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FaExclamationTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No junk leads found</p>
                </div>
              ) : (
                                 junkLeads.map((lead) => (
                   <div 
                     key={lead.leadId} 
                     className="p-3 border border-red-200 rounded-lg bg-red-50 cursor-pointer hover:bg-red-100 transition-colors"
                     onClick={() => handleLeadClick(lead.leadId)}
                   >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-800">{lead.name}</h4>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Junk</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                      <span className="flex items-center gap-1">
                        <FaRupeeSign className="text-red-500" />
                        {lead.budget ? Number(lead.budget).toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-red-500" />
                        {formatDate(lead.dateOfCreation)}
                      </span>
                    </div>
                                         <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
                       <strong>Sales Rep:</strong> {lead.salesRep || 'Not Assigned'}
                     </div>
                     {lead.priority && (
                       <div className="text-xs text-red-600 bg-red-100 p-2 rounded mt-1">
                         <strong>Priority:</strong> {lead.priority}
                       </div>
                     )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
};

export default LostJunkLeadsModal;
