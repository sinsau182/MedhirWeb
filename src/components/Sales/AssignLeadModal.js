import React, { useState, useEffect } from "react";
import { FaTimes, FaUserTie, FaUserCog, FaCheck } from "react-icons/fa";
import { toast } from "sonner";

const AssignLeadModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onAssign,
  salesEmployees = [] // Array of available sales employees
}) => {
  const [selectedSalesRep, setSelectedSalesRep] = useState("");
  const [selectedDesigner, setSelectedDesigner] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedSalesRep("");
      setSelectedDesigner("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSalesRep) {
      toast.error("Please select a Sales Representative");
      return;
    }

    if (!selectedDesigner) {
      toast.error("Please select a Sales Designer");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAssign({
        leadId: lead.leadId,
        salesRep: selectedSalesRep,
        designer: selectedDesigner
      });
      
      toast.success("Lead assigned successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to assign lead");
      console.error("Assignment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUserTie className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Assign Lead
              </h2>
              <p className="text-sm text-gray-600">
                Assign this lead to sales team members
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
        <div className="p-6">
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

          {/* Assignment Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sales Representative */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaUserTie className="w-4 h-4 text-blue-600" />
                Sales Representative *
              </label>
              <select
                value={selectedSalesRep}
                onChange={(e) => setSelectedSalesRep(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                required
              >
                <option value="">Select Sales Representative</option>
                {salesEmployees
                  .filter(emp => emp.role === 'SALES_REP' || emp.role === 'SALES_MANAGER')
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role})
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the sales representative who will handle this lead
              </p>
            </div>

            {/* Sales Designer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FaUserCog className="w-4 h-4 text-purple-600" />
                Sales Designer *
              </label>
              <select
                value={selectedDesigner}
                onChange={(e) => setSelectedDesigner(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                required
              >
                <option value="">Select Sales Designer</option>
                {salesEmployees
                  .filter(emp => emp.role === 'DESIGNER' || emp.role === 'SALES_DESIGNER')
                  .map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name} ({employee.role})
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Choose the designer who will work on this project
              </p>
            </div>

            {/* Assignment Summary */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Assignment Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <p><strong>Lead:</strong> {lead?.name || "N/A"}</p>
                <p><strong>Sales Rep:</strong> {selectedSalesRep ? salesEmployees.find(emp => emp.id === selectedSalesRep)?.name : "Not selected"}</p>
                <p><strong>Designer:</strong> {selectedDesigner ? salesEmployees.find(emp => emp.id === selectedDesigner)?.name : "Not selected"}</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 rounded-b-lg border-t">
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
            disabled={isSubmitting || !selectedSalesRep || !selectedDesigner}
            className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Assigning...
              </>
            ) : (
              <>
                <FaCheck className="w-4 h-4" />
                Assign Lead
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal; 