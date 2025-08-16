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
  }, [isOpen, lead, role]);

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
    const popupWidth = 280; // min-width from className
    const popupHeight = 300; // estimated height for the modal
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let adjustedX = position.x;
    let adjustedY = position.y;
    let transform = 'translate(-50%, -100%)'; // Default: center horizontally, above the point
    
    // Ensure popup doesn't go off the right edge
    if (adjustedX + popupWidth / 2 > viewportWidth) {
      adjustedX = viewportWidth - popupWidth / 2 - 10;
    }
    
    // Ensure popup doesn't go off the left edge
    if (adjustedX - popupWidth / 2 < 0) {
      adjustedX = popupWidth / 2 + 10;
    }
    
    // Check if popup would go above viewport (top edge)
    if (adjustedY - popupHeight < 20) {
      // Show below the element instead
      adjustedY = position.y + 20;
      transform = 'translate(-50%, 0%)'; // Center horizontally, no vertical offset
    }
    
    // Check if popup would go below viewport (bottom edge)
    if (adjustedY + popupHeight > viewportHeight - 20) {
      // Show above the element
      adjustedY = position.y - 20;
      transform = 'translate(-50%, -100%)'; // Center horizontally, above the point
    }
    
    return { x: adjustedX, y: adjustedY, transform };
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
          transform: adjustedPosition.transform,
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
            {/* Project Location */}
            <div className="mb-3 p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-slate-200">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0 max-w-[200px]">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                    Project Location
                  </h4>
                  <p className="text-sm text-gray-800 font-medium leading-tight break-words whitespace-pre-wrap">
                    {lead.address || "Location not specified"}
                  </p>
                </div>
              </div>
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