import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaClipboardList,
  FaPalette,
  FaCheck,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaDollarSign,
} from "react-icons/fa";
import { toast } from "sonner";

const PotentialModal = ({ isOpen, onClose, lead, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstMeetingDate: "",
    requirements: "",
    priority: "MEDIUM",
    initialQuote: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstMeetingDate: "",
        requirements: "",
        priority: "MEDIUM",
        initialQuote: "",
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

    if (formData.initialQuote && parseFloat(formData.initialQuote) <= 0) {
      toast.error("Initial quote must be a positive number");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSuccess({
        leadId: lead.leadId,
        firstMeetingDate: formData.firstMeetingDate,
        requirements: formData.requirements.trim(),
        priority: formData.priority,
        initialQuote: formData.initialQuote ? parseFloat(formData.initialQuote) : null,
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
      case "requirements":
        // Allow alphanumeric, spaces, and common characters
        processedValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, "").slice(0, 500);
        break;

      case "initialQuote":
        // Only allow numbers and decimal point
        processedValue = value.replace(/[^\d.]/g, "");
        // Prevent multiple decimal points
        const decimalCount = (processedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          processedValue = processedValue.replace(/\.+$/, "");
        }
        break;

      default:
        processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [field]: processedValue,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-3">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Meeting Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                First Meeting Date
              </label>
              <input
                type="date"
                value={formData.firstMeetingDate}
                onChange={(e) =>
                  handleInputChange("firstMeetingDate", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Select the first meeting date with the client
              </p>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  handleInputChange("priority", e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                required
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Set the priority level for this lead
              </p>
            </div>

            {/* Initial Quote */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Initial Quote
              </label>
              <input
                type="text"
                value={formData.initialQuote}
                onChange={(e) =>
                  handleInputChange("initialQuote", e.target.value)
                }
                placeholder="Enter initial quote amount..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the initial quote amount for the project
              </p>
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                Requirements *
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) =>
                  handleInputChange("requirements", e.target.value)
                }
                placeholder="Describe the project requirements in detail..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
                rows="4"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide detailed requirements for the project (10-500 characters)
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 flex justify-end items-center gap-3 border-t flex-shrink-0">
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
            disabled={isSubmitting || !formData.requirements.trim()}
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
