import React, { useState } from "react";
import { Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

const PayrollSettings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showTdsModal, setShowTdsModal] = useState(false);
  const [showProfessionalTaxModal, setShowProfessionalTaxModal] = useState(false);
  const [tdsForm, setTdsForm] = useState({
    threshold: "",
    rate: "",
    description: "",
  });
  const [professionalTaxForm, setProfessionalTaxForm] = useState({
    threshold: "25000",
    aboveThresholdAmount: "",
    belowThresholdAmount: "0",
    description: "",
  });
  const [isTdsFormChanged, setIsTdsFormChanged] = useState(false);
  const [isProfessionalTaxFormChanged, setIsProfessionalTaxFormChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Add handlers for Payroll Settings form changes
  const handleTdsFormChange = (e) => {
    setIsTdsFormChanged(true);
    const { name, value } = e.target;
    setTdsForm({
      ...tdsForm,
      [name]: value,
    });
  };

  const handleProfessionalTaxFormChange = (e) => {
    setIsProfessionalTaxFormChanged(true);
    const { name, value } = e.target;
    setProfessionalTaxForm({
      ...professionalTaxForm,
      [name]: value,
    });
  };

  const handleTdsSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!tdsForm.threshold) {
      newErrors.tdsThreshold = "TDS threshold is required";
    }
    if (!tdsForm.rate) {
      newErrors.tdsRate = "TDS rate is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save TDS settings
      setNotification({
        show: true,
        type: "success",
        message: "TDS settings saved successfully!",
      });
      setShowTdsModal(false);
      setTdsForm({
        threshold: "",
        rate: "",
        description: "",
      });
      setIsTdsFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to save TDS settings. Please try again.",
      });
    }
  };

  const handleProfessionalTaxSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!professionalTaxForm.threshold) {
      newErrors.professionalTaxThreshold = "Professional tax threshold is required";
    }
    if (!professionalTaxForm.aboveThresholdAmount) {
      newErrors.professionalTaxAboveThreshold = "Amount for above threshold is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Add API call to save Professional Tax settings
      setNotification({
        show: true,
        type: "success",
        message: "Professional Tax settings saved successfully!",
      });
      setShowProfessionalTaxModal(false);
      setProfessionalTaxForm({
        threshold: "25000",
        aboveThresholdAmount: "",
        belowThresholdAmount: "0",
        description: "",
      });
      setIsProfessionalTaxFormChanged(false);
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: "Failed to save Professional Tax settings. Please try again.",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        <HradminNavbar />

        <div className="p-6 mt-16">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Payroll Settings
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TDS Settings Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">TDS Settings</h3>
                  <button
                    onClick={() => {
                      setTdsForm({
                        threshold: "",
                        rate: "",
                        description: "",
                      });
                      setShowTdsModal(true);
                      setIsTdsFormChanged(false);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Configure
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">
                    Configure Tax Deducted at Source (TDS) settings for employee payroll.
                  </p>
                </div>
              </div>

              {/* Professional Tax Settings Card */}
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-800">Professional Tax</h3>
                  <button
                    onClick={() => {
                      setProfessionalTaxForm({
                        threshold: "25000",
                        aboveThresholdAmount: "",
                        belowThresholdAmount: "0",
                        description: "",
                      });
                      setShowProfessionalTaxModal(true);
                      setIsProfessionalTaxFormChanged(false);
                    }}
                    className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Configure
                  </button>
                </div>
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">
                    Configure Professional Tax settings with salary threshold conditions.
                  </p>
                </div>
              </div>
            </div>

            {/* TDS Modal */}
            {showTdsModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      TDS Settings
                    </h2>
                    <button
                      onClick={() => setShowTdsModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleTdsSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Annual Income Threshold (₹)
                      </label>
                      <input
                        type="number"
                        name="threshold"
                        value={tdsForm.threshold}
                        onChange={handleTdsFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter annual income threshold"
                      />
                      {errors.tdsThreshold && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tdsThreshold}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        TDS Rate (%)
                      </label>
                      <input
                        type="number"
                        name="rate"
                        value={tdsForm.rate}
                        onChange={handleTdsFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter TDS rate percentage"
                      />
                      {errors.tdsRate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.tdsRate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={tdsForm.description}
                        onChange={handleTdsFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter description"
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowTdsModal(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {isTdsFormChanged ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Professional Tax Modal */}
            {showProfessionalTaxModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Professional Tax Settings
                    </h2>
                    <button
                      onClick={() => setShowProfessionalTaxModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleProfessionalTaxSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Salary Threshold (₹)
                      </label>
                      <input
                        type="number"
                        name="threshold"
                        value={professionalTaxForm.threshold}
                        onChange={handleProfessionalTaxFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter monthly salary threshold"
                      />
                      {errors.professionalTaxThreshold && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.professionalTaxThreshold}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount for Salary Above Threshold (₹)
                      </label>
                      <input
                        type="number"
                        name="aboveThresholdAmount"
                        value={professionalTaxForm.aboveThresholdAmount}
                        onChange={handleProfessionalTaxFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount for salary above threshold"
                      />
                      {errors.professionalTaxAboveThreshold && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.professionalTaxAboveThreshold}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Amount for Salary Below Threshold (₹)
                      </label>
                      <input
                        type="number"
                        name="belowThresholdAmount"
                        value={professionalTaxForm.belowThresholdAmount}
                        onChange={handleProfessionalTaxFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount for salary below threshold"
                        disabled
                      />
                      <p className="text-gray-500 text-xs mt-1">
                        This is set to 0 by default for salaries below the threshold
                      </p>
                    </div>

          
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={professionalTaxForm.description}
                        onChange={handleProfessionalTaxFormChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="Enter description"
                      />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowProfessionalTaxModal(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {isProfessionalTaxFormChanged ? "Update" : "Save"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Notification */}
          {notification.show && (
            <div className="fixed bottom-4 right-4 z-50">
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
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

export default PayrollSettings; 