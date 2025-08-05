import React, { useState, useEffect } from "react";
import { FaTimes, FaFileInvoiceDollar, FaDollarSign, FaPercent, FaCalendarAlt, FaClock, FaCheck } from "react-icons/fa";
import { toast } from "sonner";

const HighPotentialModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    quotationDetails: "",
    initialQuotedAmount: "",
    finalQuotedAmount: "",
    discountPercent: "",
    designTimeline: "",
    completionTimeline: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        quotationDetails: "",
        initialQuotedAmount: "",
        finalQuotedAmount: "",
        discountPercent: "",
        designTimeline: "",
        completionTimeline: ""
      });
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.quotationDetails.trim()) {
      toast.error("Please provide the quotation details");
      return;
    }

    if (!formData.initialQuotedAmount.trim()) {
      toast.error("Please provide the initial quoted amount");
      return;
    }

    if (!formData.finalQuotedAmount.trim()) {
      toast.error("Please provide the final quoted amount");
      return;
    }

    if (!formData.discountPercent.trim()) {
      toast.error("Please provide the discount percentage");
      return;
    }

    if (!formData.designTimeline.trim()) {
      toast.error("Please provide the design timeline");
      return;
    }

    if (!formData.completionTimeline.trim()) {
      toast.error("Please provide the completion timeline");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSuccess({
        leadId: lead.leadId,
        quotationDetails: formData.quotationDetails,
        initialQuotedAmount: formData.initialQuotedAmount,
        finalQuotedAmount: formData.finalQuotedAmount,
        discountPercent: formData.discountPercent,
        designTimeline: formData.designTimeline,
        completionTimeline: formData.completionTimeline
      });
      
      toast.success("Lead updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update lead");
      console.error("High potential update error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaFileInvoiceDollar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                High Potential Lead Details
              </h2>
              <p className="text-sm text-gray-600">
                Update quotation and timeline information
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
            {/* Quotation Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaFileInvoiceDollar className="w-4 h-4 text-blue-600" />
                Quotation Details *
              </label>
              <textarea
                value={formData.quotationDetails}
                onChange={(e) => handleInputChange('quotationDetails', e.target.value)}
                placeholder="Provide detailed quotation information..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
                rows="3"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide comprehensive quotation details
              </p>
            </div>

            {/* Initial Quoted Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="w-4 h-4 text-green-600" />
                Initial Quoted Amount *
              </label>
              <input
                type="text"
                value={formData.initialQuotedAmount}
                onChange={(e) => handleInputChange('initialQuotedAmount', e.target.value)}
                placeholder="Enter initial quoted amount (e.g., ₹10,00,000)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the initial quoted amount
              </p>
            </div>

            {/* Final Quoted Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaDollarSign className="w-4 h-4 text-green-600" />
                Final Quoted Amount *
              </label>
              <input
                type="text"
                value={formData.finalQuotedAmount}
                onChange={(e) => handleInputChange('finalQuotedAmount', e.target.value)}
                placeholder="Enter final quoted amount (e.g., ₹9,50,000)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the final quoted amount after negotiations
              </p>
            </div>

            {/* Discount Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaPercent className="w-4 h-4 text-red-600" />
                Discount Percentage *
              </label>
              <input
                type="text"
                value={formData.discountPercent}
                onChange={(e) => handleInputChange('discountPercent', e.target.value)}
                placeholder="Enter discount percentage (e.g., 5%)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the discount percentage offered
              </p>
            </div>

            {/* Design Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaCalendarAlt className="w-4 h-4 text-purple-600" />
                Design Timeline *
              </label>
              <input
                type="text"
                value={formData.designTimeline}
                onChange={(e) => handleInputChange('designTimeline', e.target.value)}
                placeholder="Enter design timeline (e.g., 2-3 weeks)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the timeline for design completion
              </p>
            </div>

            {/* Completion Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaClock className="w-4 h-4 text-orange-600" />
                Completion Timeline *
              </label>
              <input
                type="text"
                value={formData.completionTimeline}
                onChange={(e) => handleInputChange('completionTimeline', e.target.value)}
                placeholder="Enter completion timeline (e.g., 3-4 months)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the timeline for project completion
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">Update Summary</h4>
              <div className="text-sm text-purple-700 space-y-1">
                <p><strong>Lead:</strong> {lead?.name || "N/A"}</p>
                <p><strong>Quotation Details:</strong> {formData.quotationDetails ? "Provided" : "Not provided"}</p>
                <p><strong>Initial Amount:</strong> {formData.initialQuotedAmount || "Not specified"}</p>
                <p><strong>Final Amount:</strong> {formData.finalQuotedAmount || "Not specified"}</p>
                <p><strong>Discount:</strong> {formData.discountPercent || "Not specified"}</p>
                <p><strong>Design Timeline:</strong> {formData.designTimeline || "Not specified"}</p>
                <p><strong>Completion Timeline:</strong> {formData.completionTimeline || "Not specified"}</p>
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
            disabled={isSubmitting || !formData.quotationDetails.trim() || !formData.initialQuotedAmount.trim() || !formData.finalQuotedAmount.trim() || !formData.discountPercent.trim() || !formData.designTimeline.trim() || !formData.completionTimeline.trim()}
            className="px-6 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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

export default HighPotentialModal; 