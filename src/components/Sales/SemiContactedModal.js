import React, { useState, useEffect } from "react";
import { FaTimes, FaFileAlt, FaCalendarAlt, FaDollarSign, FaExclamationTriangle, FaCheck } from "react-icons/fa";
import { toast } from "sonner";

const SemiContactedModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    floorPlan: "",
    estimatedBudget: "",
    firstMeetingDate: "",
    priority: "MEDIUM"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        floorPlan: "",
        estimatedBudget: "",
        firstMeetingDate: "",
        priority: "MEDIUM"
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.floorPlan.trim()) {
      toast.error("Please provide the floor plan");
      return;
    }
    
    if (formData.floorPlan.trim().length < 5) {
      toast.error("Floor plan must be at least 5 characters");
      return;
    }
    
    if (formData.floorPlan.trim().length > 200) {
      toast.error("Floor plan must be less than 200 characters");
      return;
    }

    if (!formData.estimatedBudget.trim()) {
      toast.error("Please provide the estimated budget");
      return;
    }
    
    // Validate budget format
    const budgetValue = parseFloat(formData.estimatedBudget.replace(/[^\d.]/g, ''));
    if (isNaN(budgetValue) || budgetValue <= 0) {
      toast.error("Budget must be a valid positive number");
      return;
    }
    
    if (budgetValue > 999999999) {
      toast.error("Budget cannot exceed 999,999,999");
      return;
    }

    if (!formData.firstMeetingDate) {
      toast.error("Please select the first meeting date");
      return;
    }
    
    // Validate meeting date is not in the past
    const meetingDate = new Date(formData.firstMeetingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (meetingDate < today) {
      toast.error("Meeting date cannot be in the past");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSuccess({
        leadId: lead.leadId,
        floorPlan: formData.floorPlan.trim(),
        estimatedBudget: formData.estimatedBudget.trim(),
        firstMeetingDate: formData.firstMeetingDate,
        priority: formData.priority
      });
      
      toast.success("Lead updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update lead");
      console.error("Semi contacted update error:", error);
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
      case 'floorPlan':
        // Allow alphanumeric, spaces, and common characters
        processedValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, '').slice(0, 200);
        break;
      
      case 'estimatedBudget':
        // Only allow numbers and decimal point
        processedValue = value.replace(/[^\d.]/g, '');
        // Prevent multiple decimal points
        const decimalCount = (processedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          processedValue = processedValue.replace(/\.+$/, '');
        }
        break;
      
      case 'firstMeetingDate':
        // Allow date input
        processedValue = value;
        break;
      
      case 'priority':
        // Allow priority selection
        processedValue = value;
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
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <FaFileAlt className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Semi Contacted Details
              </h2>
              <p className="text-sm text-gray-600">
                Update lead information for semi contacted stage
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
            {/* Floor Plan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaFileAlt className="w-4 h-4 text-blue-600" />
                Floor Plan *
              </label>
              <textarea
                value={formData.floorPlan}
                onChange={(e) => handleInputChange('floorPlan', e.target.value)}
                placeholder="Describe the floor plan requirements..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                rows="3"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide details about the floor plan specifications
              </p>
            </div>

            {/* Estimated Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="w-4 h-4 text-green-600" />
                Estimated Budget *
              </label>
              <input
                type="text"
                value={formData.estimatedBudget}
                onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
                placeholder="Enter estimated budget (e.g., ₹50,00,000)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the estimated budget for the project
              </p>
            </div>

            {/* First Meeting Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                First Meeting Date *
              </label>
              <input
                type="datetime-local"
                value={formData.firstMeetingDate}
                onChange={(e) => handleInputChange('firstMeetingDate', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Schedule the first meeting with the client
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaExclamationTriangle className="w-4 h-4 text-red-600" />
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
                <option value="URGENT">Urgent</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Set the priority level for this lead
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Update Summary</h4>
              <div className="text-sm text-orange-700 space-y-1">
                <p><strong>Lead:</strong> {lead?.name || "N/A"}</p>
                <p><strong>Floor Plan:</strong> {formData.floorPlan ? "Provided" : "Not provided"}</p>
                <p><strong>Budget:</strong> {formData.estimatedBudget || "Not specified"}</p>
                <p><strong>Meeting Date:</strong> {formData.firstMeetingDate ? new Date(formData.firstMeetingDate).toLocaleString() : "Not scheduled"}</p>
                <p><strong>Priority:</strong> {formData.priority}</p>
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
            disabled={isSubmitting || !formData.floorPlan.trim() || !formData.estimatedBudget.trim() || !formData.firstMeetingDate}
            className="px-6 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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

export default SemiContactedModal; 