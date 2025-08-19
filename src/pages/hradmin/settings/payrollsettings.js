import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { savePayrollFreezeSettings, fetchPayrollFreezeSettings } from "@/redux/slices/payrollSettingsSlice";


const PayrollSettings = () => {
  const dispatch = useDispatch();
  
  const { 
    payrollFreezeData: reduxPayrollFreezeData, 
    isPayrollFreezeConfigured: reduxIsPayrollFreezeConfigured,
    loading: payrollFreezeLoading,
    error: payrollFreezeError
  } = useSelector((state) => state.payrollSettings);


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPayrollFreezeModal, setShowPayrollFreezeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isEditingPayrollFreeze, setIsEditingPayrollFreeze] = useState(false);

  const [payrollFreezeForm, setPayrollFreezeForm] = useState({
    payrollEnablementDay: "",
    freezeAfterDays: "",
  });

  const [isPayrollFreezeFormChanged, setIsPayrollFreezeFormChanged] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  // Use Redux state for payroll freeze settings
  const [payrollFreezeData, setPayrollFreezeData] = useState(null);
  const [isPayrollFreezeConfigured, setIsPayrollFreezeConfigured] = useState(false);

  // Fetch payroll freeze settings on component mount
  useEffect(() => {
    dispatch(fetchPayrollFreezeSettings());
  }, [dispatch]);

  // Sync local state with Redux state
  useEffect(() => {
    if (reduxPayrollFreezeData) {
      setPayrollFreezeData(reduxPayrollFreezeData);
      setIsPayrollFreezeConfigured(true);
    }
  }, [reduxPayrollFreezeData]);

  // Handle Redux errors
  useEffect(() => {
    if (payrollFreezeError) {
      toast.error(payrollFreezeError);
    }
  }, [payrollFreezeError]);





  useEffect(() => {
    let timeoutId;
    if (notification.show) {
      timeoutId = setTimeout(() => {
        setNotification({
          show: false,
          type: "",
          message: "",
        });
      }, 2000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [notification.show]);



  const handlePayrollFreezeSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation before showing confirmation
    const enablementDay = parseInt(payrollFreezeForm.payrollEnablementDay) || 0;
    const freezeAfterDays = parseInt(payrollFreezeForm.freezeAfterDays) || 0;
    
    if (enablementDay < 1 || enablementDay > 28) {
      toast.error("Payroll Enablement Day must be between 1 and 28");
      return;
    }
    
    if (freezeAfterDays < 1 || freezeAfterDays > 28) {
      toast.error("Freeze After Days must be between 1 and 28");
      return;
    }
    
    if ((enablementDay + freezeAfterDays) > 28) {
      toast.error(`Enablement Day + Freeze After Days cannot exceed 28. Current sum is ${enablementDay + freezeAfterDays}`);
      return;
    }
    
    setShowConfirmationModal(true);
  };

  const confirmPayrollFreezeSubmit = async () => {
    try {
      const resultAction = await dispatch(savePayrollFreezeSettings(payrollFreezeForm));
      
      if (savePayrollFreezeSettings.fulfilled.match(resultAction)) {
        setShowPayrollFreezeModal(false);
        setShowConfirmationModal(false);
        
        // Refresh the data from Redux
        await dispatch(fetchPayrollFreezeSettings());
        
        setNotification({
          show: true,
          type: "success",
          message: `Payroll Freeze settings ${
            isPayrollFreezeConfigured ? "updated" : "created"
          } successfully!`,
        });
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message || "Failed to save payroll freeze settings",
      });
    }
  };



  const handleEditPayrollFreeze = () => {
    if (payrollFreezeData) {
      setPayrollFreezeForm({
        payrollEnablementDay: payrollFreezeData.payrollEnablementDate || payrollFreezeData.payrollEnablementDay || "",
        freezeAfterDays: payrollFreezeData.freezeAfterDays || "",
      });
    }
    setIsEditingPayrollFreeze(true);
    setShowPayrollFreezeModal(true);
    setIsPayrollFreezeFormChanged(false);
  };



  const handleClosePayrollFreezeModal = () => {
    setShowPayrollFreezeModal(false);
    setIsEditingPayrollFreeze(false);
    
    // Reset form to current values if editing, or empty if creating
    if (isPayrollFreezeConfigured && payrollFreezeData) {
      setPayrollFreezeForm({
        payrollEnablementDay: payrollFreezeData.payrollEnablementDate || payrollFreezeData.payrollEnablementDay || "",
        freezeAfterDays: payrollFreezeData.freezeAfterDays || "",
      });
    } else {
      setPayrollFreezeForm({
        payrollEnablementDay: "",
        freezeAfterDays: "",
      });
    }
    
    setIsPayrollFreezeFormChanged(false);
  };





  // New Payroll Freeze Settings Card
  const renderPayrollFreezeSettings = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Payroll Freeze Settings</h3>
        <button
          onClick={handleEditPayrollFreeze}
          disabled={payrollFreezeLoading}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {payrollFreezeLoading 
            ? "Loading..." 
            : (isPayrollFreezeConfigured ? "Edit" : "Configure")
          }
        </button>
      </div>
      
      {payrollFreezeLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading settings...</span>
        </div>
      ) : isPayrollFreezeConfigured && payrollFreezeData ? (
        <div className="space-y-2">
          <p className="text-gray-600">
            Enablement Day: {payrollFreezeData.payrollEnablementDate || payrollFreezeData.payrollEnablementDay}th of every month
          </p>
          <p className="text-gray-600">
            Freeze After: {payrollFreezeData.freezeAfterDays} days
          </p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          No Payroll Freeze settings configured. Click Configure to set up Payroll Freeze settings.
        </p>
      )}
    </div>
  );

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };



  const handlePayrollFreezeFormChange = (e) => {
    setIsPayrollFreezeFormChanged(true);
    const { name, value } = e.target;
    
    // Allow empty values and partial input (for backspace to work)
    if (value === '' || value === '-') {
      setPayrollFreezeForm({
        ...payrollFreezeForm,
        [name]: value,
      });
      return;
    }
    
    // Convert to number for validation
    const numericValue = parseInt(value);
    
    // Check if it's a valid number
    if (isNaN(numericValue)) {
      return; // Don't update if not a number
    }
    
    // Validation logic
    if (name === 'payrollEnablementDay') {
      if (numericValue < 1 || numericValue > 28) {
        return; // Don't update if invalid
      }
      
      // Check if sum with freezeAfterDays exceeds 28
      const freezeAfterDays = parseInt(payrollFreezeForm.freezeAfterDays) || 0;
      if (freezeAfterDays > 0 && (numericValue + freezeAfterDays) > 28) {
        toast.error(`Enablement Day + Freeze After Days cannot exceed 28. Current sum would be ${numericValue + freezeAfterDays}`);
        return;
      }
    }
    
    if (name === 'freezeAfterDays') {
      if (numericValue < 1 || numericValue > 28) {
        return; // Don't update if invalid
      }
      
      // Check if sum with payrollEnablementDay exceeds 28
      const enablementDay = parseInt(payrollFreezeForm.payrollEnablementDay) || 0;
      if (enablementDay > 0 && (enablementDay + numericValue) > 28) {
        toast.error(`Enablement Day + Freeze After Days cannot exceed 28. Current sum would be ${enablementDay + numericValue}`);
        return;
      }
    }
    
    setPayrollFreezeForm({
      ...payrollFreezeForm,
      [name]: value,
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Payroll Settings
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {renderPayrollFreezeSettings()}
          </div>





          {/* Payroll Freeze Settings Modal */}
          {showPayrollFreezeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {isPayrollFreezeConfigured
                      ? "Edit Payroll Freeze Settings"
                      : "Configure Payroll Freeze Settings"}
                  </h2>
                  <button
                    onClick={handleClosePayrollFreezeModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handlePayrollFreezeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payroll Enablement Day <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="payrollEnablementDay"
                      value={payrollFreezeForm.payrollEnablementDay}
                      onChange={handlePayrollFreezeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      max="28"
                      step="1"
                      placeholder="e.g., 1 for 1st of every month"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Day of the month when payroll becomes active (1-28)
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Freeze After (Days) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="freezeAfterDays"
                      value={payrollFreezeForm.freezeAfterDays}
                      onChange={handlePayrollFreezeFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                      max="28"
                      step="1"
                      placeholder="e.g., 15 for 15 days"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Days after enablement before freeze (1-28)
                    </p>
                  </div>


                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClosePayrollFreezeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={payrollFreezeLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {payrollFreezeLoading 
                        ? "Saving..." 
                        : (isPayrollFreezeConfigured ? "Update" : "Save")
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirmationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Confirm Settings
                  </h2>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    Are you sure you want to save these Payroll Freeze settings?
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p><strong>Enablement Day:</strong> {payrollFreezeForm.payrollEnablementDay}th of every month</p>
                    <p><strong>Freeze After:</strong> {payrollFreezeForm.freezeAfterDays} days</p>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowConfirmationModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPayrollFreezeSubmit}
                    disabled={payrollFreezeLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {payrollFreezeLoading ? "Saving..." : "OK"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification */}
          {notification.show && (
            <div className="fixed top-4 right-4 z-50">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-md transform transition-all duration-300 ease-in-out ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } ${
                  notification.show
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{notification.message}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(PayrollSettings);