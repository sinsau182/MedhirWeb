import React, { useState, useEffect } from "react";
import { FaTimes, FaClipboardList, FaDollarSign, FaPalette, FaCheck } from "react-icons/fa";
import { toast } from "sonner";

const PotentialModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    requirements: "",
    consultationFee: "",
    designConsultation: "NO"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        requirements: "",
        consultationFee: "",
        designConsultation: "NO"
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.requirements.trim()) {
      toast.error("Please provide the requirements");
      return;
    }
    
    if (formData.requirements.trim().length < 10) {
      toast.error("Requirements must be at least 10 characters");
      return;
    }
    
    if (formData.requirements.trim().length > 500) {
      toast.error("Requirements must be less than 500 characters");
      return;
    }

    if (!formData.consultationFee.trim()) {
      toast.error("Please provide the consultation fee");
      return;
    }
    
    // Validate consultation fee
    const consultationFee = parseFloat(formData.consultationFee.replace(/[^\d.]/g, ''));
    if (isNaN(consultationFee) || consultationFee < 0) {
      toast.error("Consultation fee must be a valid positive number");
      return;
    }
    
    if (consultationFee > 999999) {
      toast.error("Consultation fee cannot exceed 999,999");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSuccess({
        leadId: lead.leadId,
        requirements: formData.requirements.trim(),
        consultationFee: formData.consultationFee.trim(),
        designConsultation: formData.designConsultation
      });
      
      toast.success("Lead updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update lead");
      console.error("Potential update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;

    // Apply input restrictions based on field type
    switch (field) {
      case 'requirements':
        // Allow alphanumeric, spaces, and common characters
        processedValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, '').slice(0, 500);
        break;
      
      case 'consultationFee':
        // Only allow numbers and decimal point
        processedValue = value.replace(/[^\d.]/g, '');
        // Prevent multiple decimal points
        const decimalCount = (processedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          processedValue = processedValue.replace(/\.+$/, '');
        }
        break;
      
      case 'designConsultation':
        // Allow alphanumeric, spaces, and common characters
        processedValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, '').slice(0, 200);
        break;
      
      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaClipboardList className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Potential Lead Details
              </h2>
              <p className="text-sm text-gray-600">
                Update lead information for potential stage
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Lead Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaCheck className="w-4 h-4 text-green-600" />
              Lead Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{lead?.name || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Contact:</span>
                <p className="text-gray-900">{lead?.contactNumber || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{lead?.email || "N/A"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Project Type:</span>
                <p className="text-gray-900">{lead?.projectType || "N/A"}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaClipboardList className="w-4 h-4 text-blue-600" />
                Requirements *
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                placeholder="Describe the project requirements in detail..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                rows="4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide detailed requirements for the project
              </p>
            </div>

            {/* Consultation Fee */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="w-4 h-4 text-green-600" />
                Refundable Token Amount *
              </label>
              <input
                type="text"
                value={formData.consultationFee}
                onChange={(e) => handleInputChange('consultationFee', e.target.value)}
                placeholder="Enter refundable token amount (e.g., ₹5,000)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the refundable token amount
              </p>
            </div> */}

            {/* Design Consultation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaPalette className="w-4 h-4 text-purple-600" />
                Design Consultation
              </label>
              <select
                value={formData.designConsultation}
                onChange={(e) => handleInputChange('designConsultation', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
              >
                <option value="NO">No Design Consultation</option>
                <option value="YES">Yes, Design Consultation Required</option>
                <option value="OPTIONAL">Optional Design Consultation</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select if design consultation is required
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Update Summary</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>Lead:</strong> {lead?.name || "N/A"}</p>
                <p><strong>Requirements:</strong> {formData.requirements ? "Provided" : "Not provided"}</p>
                <p><strong>Refundable Token Amount:</strong> {formData.consultationFee || "Not specified"}</p>
                <p><strong>Design Consultation:</strong> {formData.designConsultation}</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 border-t flex-shrink-0">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.requirements.trim() || !formData.consultationFee.trim()}
            className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                Update Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PotentialModal; 