import React from 'react';
import { createPortal } from 'react-dom';
import { FaTrash, FaTimesCircle, FaExclamationTriangle } from 'react-icons/fa';

const LeadActionChoiceModal = ({ lead, onClose, onChooseLost, onChooseJunk, position = { x: 0, y: 0 }, isOpen = false }) => {
  
  // Calculate position to ensure popup stays within viewport
  const getAdjustedPosition = () => {
    const popupWidth = 200; // estimated width
    const popupHeight = 120; // estimated height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 20; // margin from viewport edges
    
    // Position modal to the right of the click position
    let adjustedX = position.x + 20; // 20px offset to the right
    let adjustedY = position.y - 30; // 30px offset above the click
    
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

  const handleChooseLost = () => {
    onChooseLost();
    onClose();
  };

  const handleChooseJunk = () => {
    onChooseJunk();
    onClose();
  };

  // Get adjusted position
  const adjustedPosition = getAdjustedPosition();
  
  // Fallback to center if position is invalid
  const finalPosition = {
    x: isNaN(adjustedPosition.x) || adjustedPosition.x < 0 ? window.innerWidth / 2 : adjustedPosition.x,
    y: isNaN(adjustedPosition.y) || adjustedPosition.y < 0 ? window.innerHeight / 2 : adjustedPosition.y
  };

  // Final safety check to ensure modal stays within viewport
  const modalLeft = Math.max(20, Math.min(finalPosition.x, window.innerWidth - 220));
  const modalTop = Math.max(20, Math.min(finalPosition.y, window.innerHeight - 140));

  if (!lead || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999]"
      onClick={handleClose}
    >
      <div 
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[180px] max-w-[200px]"
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
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
          <FaTrash className="w-3 h-3 text-gray-600" />
          <h3 className="font-semibold text-gray-800 text-xs">
            Choose Action
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {/* Lost Lead Option */}
          <button
            onClick={handleChooseLost}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-orange-700 hover:bg-orange-50 rounded transition-colors font-medium"
          >
            <FaTimesCircle className="w-3 h-3 text-orange-600" />
            Mark as Lost
          </button>

          {/* Junk Lead Option */}
          <button
            onClick={handleChooseJunk}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded transition-colors font-medium"
          >
            <FaExclamationTriangle className="w-3 h-3 text-red-600" />
            Mark as Junk
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
};

export default LeadActionChoiceModal;
