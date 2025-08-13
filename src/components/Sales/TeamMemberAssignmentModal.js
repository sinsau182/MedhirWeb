import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaUserTie, FaPalette, FaCheck } from "react-icons/fa";
import { toast } from "sonner";

const TeamMemberAssignmentModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onAssign,
  role, // 'sales' or 'designer'
  salesEmployees = [],
  position = { x: 0, y: 0 } // Position for the popup
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (role === 'sales') {
        setSelectedEmployee(lead?.assignSalesPersonEmpId || "");
      } else if (role === 'designer') {
        setSelectedEmployee(lead?.assignDesignerEmpId || "");
      }
      setIsSubmitting(false);
    }
  }, [isOpen, lead, role, salesEmployees]);

  const handleEmployeeChange = (e) => {
    const newEmployeeId = e.target.value;
    setSelectedEmployee(newEmployeeId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!selectedEmployee) {
      toast.error(`Please select a ${role === 'sales' ? 'Sales Representative' : 'Designer'}`);
      return;
    }

    // Validate that selected employee exists in the list
    const employeeExists = salesEmployees.some(emp => (emp.employeeId || emp._id || emp.id) === selectedEmployee);

    if (!employeeExists) {
      toast.error(`Selected ${role === 'sales' ? 'Sales Representative' : 'Designer'} is not available`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const assignmentData = {
        leadId: lead.leadId,
        salesRep: role === 'sales' ? selectedEmployee : lead?.assignSalesPersonEmpId,
        designer: role === 'designer' ? selectedEmployee : lead?.assignDesignerEmpId
      };
      
      await onAssign(assignmentData);
      
      toast.success(`${role === 'sales' ? 'Sales Person' : 'Designer'} assigned successfully!`);
      onClose();
    } catch (error) {
      toast.error(`Failed to assign ${role === 'sales' ? 'sales person' : 'designer'}`);
      console.error("Assignment error:", error);
      // Revert the selection on error
      setSelectedEmployee(role === 'sales' ? lead?.assignSalesPersonEmpId || "" : lead?.assignDesignerEmpId || "");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleInfo = () => {
    if (role === 'sales') {
      return {
        label: 'Sales Person',
        icon: FaUserTie,
        color: 'blue'
      };
    } else {
      return {
        label: 'Designer',
        icon: FaPalette,
        color: 'green'
      };
    }
  };

  const roleInfo = getRoleInfo();
  const IconComponent = roleInfo.icon;

  // Calculate position to ensure popup stays within viewport
  const getAdjustedPosition = () => {
    const popupWidth = 200; // min-width
    const popupHeight = 100; // estimated height
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = position.x;
    let adjustedY = position.y - 10;
    
    // Ensure popup doesn't go off the right edge
    if (adjustedX + popupWidth / 2 > viewportWidth) {
      adjustedX = viewportWidth - popupWidth / 2 - 10;
    }
    
    // Ensure popup doesn't go off the left edge
    if (adjustedX - popupWidth / 2 < 0) {
      adjustedX = popupWidth / 2 + 10;
    }
    
    // If popup would go above viewport, show it below the element
    if (adjustedY - popupHeight < 0) {
      adjustedY = position.y + 30; // Show below
    }
    
    return { x: adjustedX, y: adjustedY };
  };

  const adjustedPosition = getAdjustedPosition();

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999]"
      onClick={onClose}
    >
      <div 
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[280px]"
        style={{
          position: 'fixed',
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          transform: 'translate(-50%, -100%)',
          zIndex: 100000,
          pointerEvents: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
          <IconComponent className={`w-4 h-4 text-${roleInfo.color}-600`} />
          <h3 className="font-semibold text-gray-800 text-sm">
            Assign {roleInfo.label}
          </h3>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            {/* project address */}
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                {lead.projectAddress}
              </div>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              {roleInfo.label} *
            </label>
            <select
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              disabled={isSubmitting}
              required
            >
              <option value="">Select {roleInfo.label}</option>
              {salesEmployees.length === 0 ? (
                <option value="" disabled>No employees available</option>
              ) : (
                salesEmployees.map((employee) => {
                  const displayName = employee.name || employee.employeeName || employee.employeeId || 'Unknown';
                  const employeeId = employee.employeeId || employee._id || employee.id;
                  return (
                    <option key={employeeId} value={employeeId}>
                      {displayName} {employee.role ? `(${employee.role})` : ''}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {/* Assignment Summary */}
          {selectedEmployee && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
              <p className="text-blue-700">
                <strong>Lead:</strong> {lead?.name || "N/A"}
              </p>
              <p className="text-blue-700">
                <strong>{roleInfo.label}:</strong> {salesEmployees.find(emp => (emp.employeeId || emp._id || emp.id) === selectedEmployee)?.name || 'Unknown'}
              </p>
            </div>
          )}

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
              disabled={isSubmitting || !selectedEmployee}
              className="flex-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <FaCheck className="w-3 h-3" />
                  Assign
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

export default TeamMemberAssignmentModal; 