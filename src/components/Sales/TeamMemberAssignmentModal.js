import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FaUserTie, FaPalette } from "react-icons/fa";
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
      
      // Debug: Log the employee data
      console.log('TeamMemberAssignmentModal - Role:', role);
      console.log('TeamMemberAssignmentModal - Sales Employees:', salesEmployees);
      console.log('TeamMemberAssignmentModal - Total Employees:', salesEmployees.length);
    }
  }, [isOpen, lead, role, salesEmployees]);

  const handleEmployeeChange = async (e) => {
    const newEmployeeId = e.target.value;
    setSelectedEmployee(newEmployeeId);
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const assignmentData = {
        leadId: lead.leadId,
        salesRep: role === 'sales' ? newEmployeeId : lead?.assignSalesPersonEmpId,
        designer: role === 'designer' ? newEmployeeId : lead?.assignDesignerEmpId
      };
      
      await onAssign(assignmentData);
      
      toast.success(`${role === 'sales' ? 'Sales Person' : 'Designer'} assigned successfully!`);
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
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-3 min-w-[200px]"
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
        {/* Assignment Field */}
                 <div className="space-y-2">
           <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
             <IconComponent className={`w-4 h-4 text-${roleInfo.color}-600`} />
             {roleInfo.label}
             {selectedEmployee && (
               <span className="text-xs text-gray-500 ml-1">
                 (Current: {salesEmployees.find(emp => emp.employeeId === selectedEmployee)?.name || 'Unknown'})
               </span>
             )}
           </label>
                     <select
             value={selectedEmployee}
             onChange={handleEmployeeChange}
             className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
             disabled={isSubmitting}
           >
             <option value="">Unassigned</option>
             {salesEmployees.length === 0 ? (
               <option value="" disabled>No employees available ({salesEmployees.length})</option>
             ) : (
               salesEmployees.map((employee) => {
                 const displayName = employee.name || employee.employeeName || employee.employeeId || 'Unknown';
                 return (
                   <option key={employee.employeeId} value={employee.employeeId}>
                     {displayName} {employee.role ? `(${employee.role})` : ''}
                   </option>
                 );
               })
             )}
           </select>
          {isSubmitting && (
            <div className="flex items-center justify-center py-1">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
                 </div>
       </div>
     </div>
   );

  // Use portal to render at document body level
  return createPortal(modalContent, document.body);
 };

export default TeamMemberAssignmentModal; 