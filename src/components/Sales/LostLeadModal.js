import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { updateLead, moveLeadToPipeline } from '@/redux/slices/leadsSlice';
import axios from 'axios';
import getConfig from 'next/config';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import { FaTimes, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';
import { fetchLeads } from '@/redux/slices/leadsSlice';
import { toast } from 'sonner';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Define predefined reasons for losing a lead
const lostReasons = [
    "Budget constraints",
    "Timeline mismatch",
    "Went with competitor",
    "Project cancelled/postponed",
    "Unresponsive",
    "Requirements not met",
    "Location issue",
    "Other (Specify in notes if possible)" // Consider adding a notes field later if needed
  ];

const LostLeadModal = ({ lead, onClose, onSuccess, position = { x: 0, y: 0 }, isOpen = false, activeRoleTab }) => {
  console.log(activeRoleTab);
  const dispatch = useDispatch();
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const employeeId = sessionStorage.getItem("employeeId");

  useEffect(() => {
    if (lead) {
      setReason(lead?.reasonForLost || '');
      setIsSubmitting(false);
    }
  }, [lead]);

  // Calculate position to ensure popup stays within viewport
  const getAdjustedPosition = () => {
    const popupWidth = 380; // estimated width
    const popupHeight = 280; // estimated height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 20; // margin from viewport edges
    
    // Position modal to the right of the click position
    let adjustedX = position.x; // 20px offset to the right
    let adjustedY = position.y; // 50px offset above the click
    
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) {
      alert("No lead selected.");
      return;
    }
    if (!reason.trim()) {
      alert("Please provide a reason for marking the lead as lost.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('formType', 'LOST');
      formData.append('reasonForLost', reason.trim());
      formData.append('dateOfLost', new Date().toISOString().split('T')[0]);

      // Send to the correct API endpoint
      await axios.patch(`${API_BASE_URL}/leads/${lead.leadId}/stage`, formData, {
        headers: {
          'Authorization': `Bearer ${getItemFromSessionStorage('token') || ''}`,
          'Content-Type': 'multipart/form-data',
        }
      });
      
      if (onSuccess) {
        onSuccess({ ...lead, status: 'Lost', reasonForLost: reason.trim() });
        toast.success('Lead marked as lost successfully');
        if (activeRoleTab === "sales") {
          dispatch(fetchLeads({ employeeId }));
        } else {
          dispatch(fetchLeads());
        }
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error marking lead as lost:', error);
      alert('Failed to mark lead as lost. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Get adjusted position
  const adjustedPosition = getAdjustedPosition();
  
  // Fallback to center if position is invalid
  const finalPosition = {
    x: isNaN(adjustedPosition.x) || adjustedPosition.x < 0 ? window.innerWidth / 2 : adjustedPosition.x,
    y: isNaN(adjustedPosition.y) || adjustedPosition.y < 0 ? window.innerHeight / 2 : adjustedPosition.y
  };

  // Final safety check to ensure modal stays within viewport
  const modalLeft = Math.max(20, Math.min(finalPosition.x, window.innerWidth - 400));
  const modalTop = Math.max(20, Math.min(finalPosition.y, window.innerHeight - 300));

  if (!lead || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999]"
      onClick={handleClose}
    >
      <div 
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[320px] max-w-[380px]"
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
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
          <FaTimesCircle className="w-4 h-4 text-orange-600" />
          <h3 className="font-semibold text-gray-800 text-sm">
            Mark as Lost
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Lead Info */}
          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <p className="text-orange-700">
              <strong>Lead:</strong> {lead?.name || "N/A"}
            </p>
            {lead?.budget && (
              <p className="text-orange-700">
                <strong>Budget:</strong> ₹{Number(lead.budget).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Lost Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaExclamationTriangle className="w-3 h-3 text-orange-600" />
              Reason for Lost *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Enter reason for marking as lost..."
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-sm resize-none"
              disabled={isSubmitting}
              required
            >
              <option value="" disabled>Select a reason</option>
              {lostReasons.map((reason, index) => (
                <option key={index} value={reason}>{reason}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 px-3 py-1.5 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Marking...
                </>
              ) : (
                <>
                  <FaTimesCircle className="w-3 h-3" />
                  Mark as Lost
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
};

export default LostLeadModal; 