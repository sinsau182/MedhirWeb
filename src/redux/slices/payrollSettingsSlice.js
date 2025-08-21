import React, { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";
import withAuth from "@/components/withAuth";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { 
  savePayrollFreezeSettings, 
  fetchPayrollFreezeSettings,
  savePTAX,
  fetchPTAX,
  fetchPayrollSettings,
  savePayStructureSettings,
  fetchPayStructureSettings
} from "@/redux/slices/payrollSettingsSlice";


const PayrollSettings = () => {
  const dispatch = useDispatch();
  
  const { 
    payrollFreezeData: reduxPayrollFreezeData, 
    isPayrollFreezeConfigured: reduxIsPayrollFreezeConfigured,
    ptaxData: reduxPtaxData,
    isPtaxConfigured: reduxIsPtaxConfigured,
    payStructureData: reduxPayStructureData,
    isPayStructureConfigured: reduxIsPayStructureConfigured,
    loading: payrollFreezeLoading,
    error: payrollFreezeError,
    settings: completePayrollSettings
  } = useSelector((state) => state.payrollSettings);


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showPayrollFreezeModal, setShowPayrollFreezeModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isEditingPayrollFreeze, setIsEditingPayrollFreeze] = useState(false);
  
  // Professional Tax modal states
  const [showPtaxModal, setShowPtaxModal] = useState(false);
  const [showPtaxConfirmationModal, setShowPtaxConfirmationModal] = useState(false);
  const [isEditingPtax, setIsEditingPtax] = useState(false);

  // Pay Structure modal states
  const [showPayStructureModal, setShowPayStructureModal] = useState(false);
  const [showPayStructureConfirmationModal, setShowPayStructureConfirmationModal] = useState(false);
  const [isEditingPayStructure, setIsEditingPayStructure] = useState(false);

  const [payrollFreezeForm, setPayrollFreezeForm] = useState({
    payrollEnablementDay: "",
    freezeAfterDays: "",
  });

  // Professional Tax form state
  const [ptaxForm, setPtaxForm] = useState({
    monthlySalaryThreshold: "",
    amountAboveThreshold: "",
    amountBelowThreshold: "",
    description: "",
  });

  // Pay Structure form state
  const [payStructureForm, setPayStructureForm] = useState({
    basicPercentage: "",
    hraPercentage: "",
    employerPfPercentage: "",
    employeePfPercentage: "",
    pfCap: "",
    description: "",
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
  
  // Professional Tax state
  const [ptaxData, setPtaxData] = useState(null);
  const [isPtaxConfigured, setIsPtaxConfigured] = useState(false);

  // Pay Structure state
  const [payStructureData, setPayStructureData] = useState(null);
  const [isPayStructureConfigured, setIsPayStructureConfigured] = useState(false);

  // Fetch payroll freeze settings on component mount
  useEffect(() => {
    const companyId = sessionStorage.getItem("employeeCompanyId");
    if (companyId) {
      dispatch(fetchPayrollSettings(companyId));
    }
    dispatch(fetchPayrollFreezeSettings());
    dispatch(fetchPTAX());
    dispatch(fetchPayStructureSettings());
  }, [dispatch]);

  // Sync local state with Redux state
  useEffect(() => {
    if (reduxPayrollFreezeData) {
      setPayrollFreezeData(reduxPayrollFreezeData);
      setIsPayrollFreezeConfigured(true);
    }
  }, [reduxPayrollFreezeData]);

  // Sync Professional Tax state with Redux
  useEffect(() => {
    if (reduxPtaxData) {
      setPtaxData(reduxPtaxData);
      setIsPtaxConfigured(true);
    }
  }, [reduxPtaxData]);

  // Sync Pay Structure state with Redux
  useEffect(() => {
    if (reduxPayStructureData) {
      setPayStructureData(reduxPayStructureData);
      setIsPayStructureConfigured(true);
    }
  }, [reduxPayStructureData]);

  // Sync complete payroll settings with local state
  useEffect(() => {
    if (completePayrollSettings) {
      // Update payroll freeze data if available
      if (completePayrollSettings.payrollEnablementDate !== undefined) {
        setPayrollFreezeData(completePayrollSettings);
        setIsPayrollFreezeConfigured(true);
      }
      
      // Update professional tax data if available
      if (completePayrollSettings.professionalTaxThreshold !== undefined) {
        const ptaxDataFromSettings = {
          monthlySalaryThreshold: completePayrollSettings.professionalTaxThreshold,
          amountAboveThreshold: completePayrollSettings.professionalTaxAmountAboveThreshold,
          amountBelowThreshold: completePayrollSettings.professionalTaxAmountBelowThreshold,
          description: completePayrollSettings.description || "",
        };
        setPtaxData(ptaxDataFromSettings);
        setIsPtaxConfigured(true);
      }

      // Update pay structure data if available
      if (completePayrollSettings.basicPercentage !== undefined) {
        const payStructureDataFromSettings = {
          basicPercentage: completePayrollSettings.basicPercentage,
          hraPercentage: completePayrollSettings.hraPercentage,
          employerPfPercentage: completePayrollSettings.employerPfPercentage,
          employeePfPercentage: completePayrollSettings.employeePfPercentage,
          pfCap: completePayrollSettings.pfCap,
          description: completePayrollSettings.description || "",
        };
        setPayStructureData(payStructureDataFromSettings);
        setIsPayStructureConfigured(true);
      }
    }
  }, [completePayrollSettings]);

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
        const companyId = sessionStorage.getItem("employeeCompanyId");
        if (companyId) {
          await dispatch(fetchPayrollSettings(companyId));
        }
        await dispatch(fetchPayrollFreezeSettings());
        await dispatch(fetchPTAX());
        await dispatch(fetchPayStructureSettings());
        
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

  // Professional Tax handlers
  const handlePtaxSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const monthlySalaryThreshold = parseFloat(ptaxForm.monthlySalaryThreshold) || 0;
    const amountAboveThreshold = parseFloat(ptaxForm.amountAboveThreshold) || 0;
    const amountBelowThreshold = parseFloat(ptaxForm.amountBelowThreshold) || 0;
    
    if (monthlySalaryThreshold <= 0) {
      toast.error("Monthly Salary Threshold must be greater than 0");
      return;
    }
    
    if (amountAboveThreshold < 0) {
      toast.error("Amount Above Threshold cannot be negative");
      return;
    }
    
    if (amountBelowThreshold < 0) {
      toast.error("Amount Below Threshold cannot be negative");
      return;
    }
    
    setShowPtaxConfirmationModal(true);
  };

  const confirmPtaxSubmit = async () => {
    try {
      const resultAction = await dispatch(savePTAX(ptaxForm));
      
      if (savePTAX.fulfilled.match(resultAction)) {
        setShowPtaxModal(false);
        setShowPtaxConfirmationModal(false);
        
        // Refresh the data from Redux
        const companyId = sessionStorage.getItem("employeeCompanyId");
        if (companyId) {
          await dispatch(fetchPayrollSettings(companyId));
        }
        await dispatch(fetchPayrollFreezeSettings());
        await dispatch(fetchPTAX());
        await dispatch(fetchPayStructureSettings());
        
        setNotification({
          show: true,
          type: "success",
          message: `Professional Tax settings ${
            isPtaxConfigured ? "updated" : "created"
          } successfully!`,
        });
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message || "Failed to save Professional Tax settings",
      });
    }
  };

  // Pay Structure handlers
  const handlePayStructureSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const basicPercentage = parseFloat(payStructureForm.basicPercentage) || 0;
    const hraPercentage = parseFloat(payStructureForm.hraPercentage) || 0;
    const employerPfPercentage = parseFloat(payStructureForm.employerPfPercentage) || 0;
    const employeePfPercentage = parseFloat(payStructureForm.employeePfPercentage) || 0;
    const pfCap = parseFloat(payStructureForm.pfCap) || 0;

    if (basicPercentage < 0 || basicPercentage > 100) {
      toast.error("Basic Percentage must be between 0 and 100");
      return;
    }
    if (hraPercentage < 0 || hraPercentage > 100) {
      toast.error("HRA Percentage must be between 0 and 100");
      return;
    }
    if (employerPfPercentage < 0 || employerPfPercentage > 100) {
      toast.error("Employer PF Percentage must be between 0 and 100");
      return;
    }
    if (employeePfPercentage < 0 || employeePfPercentage > 100) {
      toast.error("Employee PF Percentage must be between 0 and 100");
      return;
    }
    if (pfCap < 0) {
      toast.error("PF Cap cannot be negative");
      return;
    }
    
    setShowPayStructureConfirmationModal(true);
  };

  const confirmPayStructureSubmit = async () => {
    try {
      const resultAction = await dispatch(savePayStructureSettings(payStructureForm));
      
      if (savePayStructureSettings.fulfilled.match(resultAction)) {
        setShowPayStructureModal(false);
        setShowPayStructureConfirmationModal(false);
        
        // Refresh the data from Redux
        const companyId = sessionStorage.getItem("employeeCompanyId");
        if (companyId) {
          await dispatch(fetchPayrollSettings(companyId));
        }
        await dispatch(fetchPayrollFreezeSettings());
        await dispatch(fetchPTAX());
        await dispatch(fetchPayStructureSettings());
        
        setNotification({
          show: true,
          type: "success",
          message: `Pay Structure settings ${
            isPayStructureConfigured ? "updated" : "created"
          } successfully!`,
        });
      } else {
        throw new Error(resultAction.error.message);
      }
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message || "Failed to save Pay Structure settings",
      });
    }
  };

  const handleEditPtax = () => {
    if (ptaxData) {
      setPtaxForm({
        monthlySalaryThreshold: ptaxData.monthlySalaryThreshold?.toString() || "",
        amountAboveThreshold: ptaxData.amountAboveThreshold?.toString() || "",
        amountBelowThreshold: ptaxData.amountBelowThreshold?.toString() || "",
        description: ptaxData.description || "",
      });
    }
    setIsEditingPtax(true);
    setShowPtaxModal(true);
  };

  const handleClosePtaxModal = () => {
    setShowPtaxModal(false);
    setIsEditingPtax(false);
    
    // Reset form to current values if editing, or empty if creating
    if (isPtaxConfigured && ptaxData) {
      setPtaxForm({
        monthlySalaryThreshold: ptaxData.monthlySalaryThreshold?.toString() || "",
        amountAboveThreshold: ptaxData.amountAboveThreshold?.toString() || "",
        amountBelowThreshold: ptaxData.amountBelowThreshold?.toString() || "",
        description: ptaxData.description || "",
      });
    } else {
      setPtaxForm({
        monthlySalaryThreshold: "",
        amountAboveThreshold: "",
        amountBelowThreshold: "",
        description: "",
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
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Payroll Freeze Settings</h3>
        {payrollFreezeLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        ) : isPayrollFreezeConfigured ? (
          <button
            onClick={handleEditPayrollFreeze}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleEditPayrollFreeze}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Configure
          </button>
        )}
      </div>
      
      {!payrollFreezeLoading && !isPayrollFreezeConfigured && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            No settings configured
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Click Configure to set up
          </p>
        </div>
      )}
    </div>
  );

  // Professional Tax Settings Card
  const renderProfessionalTaxSettings = () => (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Professional Tax Settings</h3>
        {payrollFreezeLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        ) : isPtaxConfigured ? (
          <button
            onClick={handleEditPtax}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleEditPtax}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Configure
          </button>
        )}
      </div>
      
      {!payrollFreezeLoading && !isPtaxConfigured && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            No settings configured
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Click Configure to set up
          </p>
        </div>
      )}
    </div>
  );

  // Pay Structure Settings Card
  const renderPayStructureSettings = () => (
    <div>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Pay Structure Settings</h3>
        {payrollFreezeLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        ) : isPayStructureConfigured ? (
          <button
            onClick={handleEditPayStructure}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit
          </button>
        ) : (
          <button
            onClick={handleEditPayStructure}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Configure
          </button>
        )}
      </div>
      
      {!payrollFreezeLoading && !isPayStructureConfigured && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-3">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            No settings configured
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Click Configure to set up
          </p>
        </div>
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

  const handlePtaxFormChange = (e) => {
    setIsPtaxConfigured(false); // Force re-sync
    const { name, value } = e.target;
    
    // Allow empty values and partial input (for backspace to work)
    if (value === '' || value === '-') {
      setPtaxForm({
        ...ptaxForm,
        [name]: value,
      });
      return;
    }
    
    // Convert to number for validation
    const numericValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numericValue)) {
      return; // Don't update if not a number
    }
    
    // Validation logic
    if (name === 'monthlySalaryThreshold') {
      if (numericValue <= 0) {
        return; // Don't update if invalid
      }
    }
    if (name === 'amountAboveThreshold') {
      if (numericValue < 0) {
        return; // Don't update if invalid
      }
    }
    if (name === 'amountBelowThreshold') {
      if (numericValue < 0) {
        return; // Don't update if invalid
      }
    }
    
    setPtaxForm({
      ...ptaxForm,
      [name]: value,
    });
  };

  const handlePayStructureFormChange = (e) => {
    setIsPayStructureConfigured(false); // Force re-sync
    const { name, value } = e.target;
    
    // Allow empty values and partial input (for backspace to work)
    if (value === '' || value === '-') {
      setPayStructureForm({
        ...payStructureForm,
        [name]: value,
      });
      return;
    }
    
    // Convert to number for validation
    const numericValue = parseFloat(value);
    
    // Check if it's a valid number
    if (isNaN(numericValue)) {
      return; // Don't update if not a number
    }
    
    // Validation logic
    if (name === 'basicPercentage') {
      if (numericValue < 0 || numericValue > 100) {
        return; // Don't update if invalid
      }
    }
    if (name === 'hraPercentage') {
      if (numericValue < 0 || numericValue > 100) {
        return; // Don't update if invalid
      }
    }
    if (name === 'employerPfPercentage') {
      if (numericValue < 0 || numericValue > 100) {
        return; // Don't update if invalid
      }
    }
    if (name === 'employeePfPercentage') {
      if (numericValue < 0 || numericValue > 100) {
        return; // Don't update if invalid
      }
    }
    if (name === 'pfCap') {
      if (numericValue < 0) {
        return; // Don't update if invalid
      }
    }
    
    setPayStructureForm({
      ...payStructureForm,
      [name]: value,
    });
  };

  const handleEditPayStructure = () => {
    if (payStructureData) {
      setPayStructureForm({
        basicPercentage: payStructureData.basicPercentage?.toString() || "",
        hraPercentage: payStructureData.hraPercentage?.toString() || "",
        employerPfPercentage: payStructureData.employerPfPercentage?.toString() || "",
        employeePfPercentage: payStructureData.employeePfPercentage?.toString() || "",
        pfCap: payStructureData.pfCap?.toString() || "",
        description: payStructureData.description || "",
      });
    }
    setIsEditingPayStructure(true);
    setShowPayStructureModal(true);
  };

  const handleClosePayStructureModal = () => {
    setShowPayStructureModal(false);
    setIsEditingPayStructure(false);
    
    // Reset form to current values if editing, or empty if creating
    if (isPayStructureConfigured && payStructureData) {
      setPayStructureForm({
        basicPercentage: payStructureData.basicPercentage?.toString() || "",
        hraPercentage: payStructureData.hraPercentage?.toString() || "",
        employerPfPercentage: payStructureData.employerPfPercentage?.toString() || "",
        employeePfPercentage: payStructureData.employeePfPercentage?.toString() || "",
        pfCap: payStructureData.pfCap?.toString() || "",
        description: payStructureData.description || "",
      });
    } else {
      setPayStructureForm({
        basicPercentage: "",
        hraPercentage: "",
        employerPfPercentage: "",
        employeePfPercentage: "",
        pfCap: "",
        description: "",
      });
    }
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

          {/* Three separate cards without common container */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payroll Freeze Settings Box */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
              {renderPayrollFreezeSettings()}
            </div>
            
            {/* Professional Tax Settings Box */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
              {renderProfessionalTaxSettings()}
            </div>
            
            {/* Pay Structure Settings Box */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200">
              {renderPayStructureSettings()}
            </div>
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

          {/* Professional Tax Settings Modal */}
          {showPtaxModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {isPtaxConfigured
                      ? "Edit Professional Tax Settings"
                      : "Configure Professional Tax Settings"}
                  </h2>
                  <button
                    onClick={handleClosePtaxModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handlePtaxSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Salary Threshold <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="monthlySalaryThreshold"
                      value={ptaxForm.monthlySalaryThreshold}
                      onChange={handlePtaxFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 25000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Monthly salary amount above which higher tax applies
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Above Threshold <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amountAboveThreshold"
                      value={ptaxForm.amountAboveThreshold}
                      onChange={handlePtaxFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Professional tax amount for salary above threshold
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Below Threshold <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="amountBelowThreshold"
                      value={ptaxForm.amountBelowThreshold}
                      onChange={handlePtaxFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 150"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Professional tax amount for salary below threshold
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={ptaxForm.description}
                      onChange={(e) => setPtaxForm({...ptaxForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Optional description for these settings"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClosePtaxModal}
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
                        : (isPtaxConfigured ? "Update" : "Save")
                      }
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Pay Structure Settings Modal */}
          {showPayStructureModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {isPayStructureConfigured
                      ? "Edit Pay Structure Settings"
                      : "Configure Pay Structure Settings"}
                  </h2>
                  <button
                    onClick={handleClosePayStructureModal}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handlePayStructureSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Basic Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="basicPercentage"
                      value={payStructureForm.basicPercentage}
                      onChange={handlePayStructureFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of basic salary for PF contribution
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      HRA Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="hraPercentage"
                      value={payStructureForm.hraPercentage}
                      onChange={handlePayStructureFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of HRA for PF contribution
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employer PF Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="employerPfPercentage"
                      value={payStructureForm.employerPfPercentage}
                      onChange={handlePayStructureFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 12"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of employer&apos;s contribution to PF
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Employee PF Percentage <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="employeePfPercentage"
                      value={payStructureForm.employeePfPercentage}
                      onChange={handlePayStructureFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="e.g., 12"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Percentage of employee&apos;s contribution to PF
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PF Cap <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="pfCap"
                      value={payStructureForm.pfCap}
                      onChange={handlePayStructureFormChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                      placeholder="e.g., 15000"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum PF contribution limit per employee
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={payStructureForm.description}
                      onChange={(e) => setPayStructureForm({...payStructureForm, description: e.target.value})}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      placeholder="Optional description for these settings"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={handleClosePayStructureModal}
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
                        : (isPayStructureConfigured ? "Update" : "Save")
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

          {/* Professional Tax Confirmation Modal */}
          {showPtaxConfirmationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Confirm Professional Tax Settings
                  </h2>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    Are you sure you want to save these Professional Tax settings?
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p><strong>Monthly Salary Threshold:</strong> ₹{ptaxForm.monthlySalaryThreshold}</p>
                    <p><strong>Amount Above Threshold:</strong> ₹{ptaxForm.amountAboveThreshold}</p>
                    <p><strong>Amount Below Threshold:</strong> ₹{ptaxForm.amountBelowThreshold}</p>
                    {ptaxForm.description && (
                      <p><strong>Description:</strong> {ptaxForm.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPtaxConfirmationModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPtaxSubmit}
                    disabled={payrollFreezeLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {payrollFreezeLoading ? "Saving..." : "OK"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pay Structure Confirmation Modal */}
          {showPayStructureConfirmationModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    Confirm Pay Structure Settings
                  </h2>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 mb-3">
                    Are you sure you want to save these Pay Structure settings?
                  </p>
                  <div className="bg-gray-50 p-3 rounded-md text-sm">
                    <p><strong>Basic Percentage:</strong> {payStructureForm.basicPercentage}%</p>
                    <p><strong>HRA Percentage:</strong> {payStructureForm.hraPercentage}%</p>
                    <p><strong>Employer PF Percentage:</strong> {payStructureForm.employerPfPercentage}%</p>
                    <p><strong>Employee PF Percentage:</strong> {payStructureForm.employeePfPercentage}%</p>
                    <p><strong>PF Cap:</strong> ₹{payStructureForm.pfCap}</p>
                    {payStructureForm.description && (
                      <p><strong>Description:</strong> {payStructureForm.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowPayStructureConfirmationModal(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPayStructureSubmit}
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