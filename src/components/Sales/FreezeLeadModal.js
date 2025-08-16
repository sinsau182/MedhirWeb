import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import axios from 'axios';
import getConfig from 'next/config';
import { FaTimes, FaUpload, FaSnowflake, FaRupeeSign, FaCalendarAlt, FaCreditCard } from 'react-icons/fa';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import { fetchLeads } from '@/redux/slices/leadsSlice';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

const FreezeLeadModal = ({ isOpen, onClose, lead, onSuccess, position = { x: 0, y: 0 }, activeRoleTab }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    freezingAmount: '',
    freezingPaymentDate: '',
    freezingPaymentMode: '',
  });
  const [proofFile, setProofFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const employeeId = sessionStorage.getItem("employeeId");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        freezingAmount: '',
        freezingPaymentDate: '',
        freezingPaymentMode: '',
      });
      setProofFile(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProofFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.freezingAmount || !formData.freezingPaymentDate || !formData.freezingPaymentMode) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!proofFile) {
      toast.error("Please upload payment proof file");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = getItemFromSessionStorage("token") || "";
      
      // Create FormData for multipart submission
      const formDataToSend = new FormData();
      
      // Add lead data as JSON string
      const leadData = {
        freezingAmount: formData.freezingAmount,
        freezingPaymentDate: formData.freezingPaymentDate,
        freezingPaymentMode: formData.freezingPaymentMode
      };
      
      formDataToSend.append('leadData', JSON.stringify(leadData));
      formDataToSend.append('freezingAmountProofFile', proofFile);

      const response = await axios.put(
        `${API_BASE_URL}/leads/freeze/${lead.leadId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success("Lead frozen successfully!");
      
      if (onSuccess) {
        onSuccess();
      }

      // Refresh the page to update the UI
      if (activeRoleTab === "sales") {
        dispatch(fetchLeads({ employeeId }));
      } else {
        dispatch(fetchLeads());
      }
      
      onClose();
      
    } catch (error) {
      console.error("Failed to freeze lead:", error);
      toast.error("Failed to freeze lead. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Calculate position to ensure popup stays within viewport
  const getAdjustedPosition = () => {
    const popupWidth = 400; // estimated width
    const popupHeight = 500; // estimated height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const margin = 20; // margin from viewport edges
    
    let adjustedX = position.x;
    let adjustedY = position.y;
    
    // Calculate the popup boundaries
    const popupLeft = adjustedX - popupWidth / 2;
    const popupRight = adjustedX + popupWidth / 2;
    const popupTop = adjustedY - popupHeight;
    const popupBottom = adjustedY;
    
    // Adjust X position to keep within viewport
    if (popupRight > viewportWidth - margin) {
      adjustedX = viewportWidth - popupWidth / 2 - margin;
    }
    if (popupLeft < margin) {
      adjustedX = popupWidth / 2 + margin;
    }
    
    // Adjust Y position to keep within viewport
    if (popupTop < margin) {
      // If it would go above viewport, show below the click position
      adjustedY = position.y + 50;
    }
    if (adjustedY + popupHeight > viewportHeight - margin) {
      // If it would go below viewport, show above the click position
      adjustedY = viewportHeight - popupHeight - margin;
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const adjustedPosition = getAdjustedPosition();

  // Fallback to center if position is invalid
  const finalPosition = {
    x: isNaN(adjustedPosition.x) || adjustedPosition.x < 0 ? window.innerWidth / 2 : adjustedPosition.x,
    y: isNaN(adjustedPosition.y) || adjustedPosition.y < 0 ? window.innerHeight / 2 : adjustedPosition.y
  };

  // Final safety check to ensure modal stays within viewport
  const modalLeft = Math.max(20, Math.min(finalPosition.x - 200, window.innerWidth - 420));
  const modalTop = Math.max(20, Math.min(finalPosition.y - 250, window.innerHeight - 520));

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999]"
      onClick={onClose}
    >
             <div 
         className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[320px] max-w-[400px]"
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
          <FaSnowflake className="w-4 h-4 text-purple-600" />
          <h3 className="font-semibold text-gray-800 text-sm">
            Freeze Lead
          </h3>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Lead Info */}
          <div className="p-2 bg-purple-50 border border-purple-200 rounded text-xs">
            <p className="text-purple-700">
              <strong>Lead:</strong> {lead?.name || "N/A"}
            </p>
            {lead?.budget && (
              <p className="text-purple-700">
                <strong>Budget:</strong> ₹{Number(lead.budget).toLocaleString('en-IN')}
              </p>
            )}
          </div>

          {/* Freezing Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaRupeeSign className="w-3 h-3 text-purple-600" />
              Freezing Amount *
            </label>
            <input
              type="number"
              name="freezingAmount"
              value={formData.freezingAmount}
              onChange={handleInputChange}
              placeholder="Enter amount"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="w-3 h-3 text-purple-600" />
              Payment Date *
            </label>
            <input
              type="date"
              name="freezingPaymentDate"
              value={formData.freezingPaymentDate}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaCreditCard className="w-3 h-3 text-purple-600" />
              Payment Mode *
            </label>
            <select
              name="freezingPaymentMode"
              value={formData.freezingPaymentMode}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-sm"
              disabled={isSubmitting}
              required
            >
              <option value="">Select payment mode</option>
              <option value="cash">💵 Cash</option>
              <option value="cheque">🏦 Cheque</option>
              <option value="upi">📱 UPI</option>
              <option value="bank_transfer">🏛️ Bank Transfer</option>
              <option value="card">💳 Card</option>
              <option value="online">🌐 Online</option>
            </select>
          </div>

          {/* Proof File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaUpload className="w-3 h-3 text-purple-600" />
              Payment Proof *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-3 text-center hover:border-purple-400 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                id="proof-file"
                disabled={isSubmitting}
                required
              />
              <label htmlFor="proof-file" className="cursor-pointer block">
                <FaUpload className="mx-auto text-purple-400 text-lg mb-1" />
                <p className="text-xs text-gray-600">
                  {proofFile ? proofFile.name : "Click to upload proof"}
                </p>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG, DOC files
                </p>
              </label>
            </div>
            {proofFile && (
              <p className="text-xs text-green-600 mt-1">
                ✓ {proofFile.name} selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.freezingAmount || !formData.freezingPaymentDate || !formData.freezingPaymentMode || !proofFile}
              className="flex-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Freezing...
                </>
              ) : (
                <>
                  <FaSnowflake className="w-3 h-3" />
                  Freeze Lead
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

export default FreezeLeadModal;
