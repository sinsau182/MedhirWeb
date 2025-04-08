import React, { useEffect, useState } from "react";
import { Plus, X, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import HradminNavbar from "@/components/HradminNavbar";

const PayrollSettings = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showTdsModal, setShowTdsModal] = useState(false);
  const [showProfessionalTaxModal, setShowProfessionalTaxModal] = useState(false);

  const [tdsData, setTdsData] = useState(null);
  const [ptaxData, setPtaxData] = useState(null);
  const [isEditingTDS, setIsEditingTDS] = useState(false);
  const [isEditingPTax, setIsEditingPTax] = useState(false);

  const [tdsForm, setTdsForm] = useState({
    tdsRate: "",
    description: ""
  });

  const [ptaxForm, setPtaxForm] = useState({
    monthlySalaryThreshold: "",
    amountAboveThreshold: "",
    amountBelowThreshold: "",
    description: ""
  });

  const [isTdsFormChanged, setIsTdsFormChanged] = useState(false);
  const [isProfessionalTaxFormChanged, setIsProfessionalTaxFormChanged] = useState(false);
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tdsResult, ptaxResult] = await Promise.all([
          fetchTDS(),
          fetchPTAX()
        ]);
        setTdsData(tdsResult);
        setPtaxData(ptaxResult);
      } catch (error) {
        console.error("Error fetching data:", error);
        setNotification({
          show: true,
          type: "error",
          message: "Failed to load settings. Please try again.",
        });
      }
    };
    fetchData();
  }, []);

  const fetchTDS = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://192.168.0.200:8083/api/tds-settings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 404) {
        return null;
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch TDS settings");
      }
      
      return data;
    } catch (error) {
      console.error("Error in fetchTDS:", error);
      throw error;
    }
  };

  const fetchPTAX = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://192.168.0.200:8083/api/professional-tax-settings", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 404) {
        return null;
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch Professional Tax settings");
      }
      
      return data;
    } catch (error) {
      console.error("Error in fetchPTAX:", error);
      throw error;
    }
  };

  const handleTdsSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const url = "http://192.168.0.200:8083/api/tds-settings";
      const method = tdsData ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tdsRate: parseFloat(tdsForm.tdsRate),
          description: tdsForm.description
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save TDS settings");
      }

      setTdsData(data);
      setShowTdsModal(false);
      setNotification({
        show: true,
        type: "success",
        message: `TDS settings ${tdsData ? "updated" : "created"} successfully!`,
      });
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message,
      });
    }
  };

  const handlePTaxSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const url = "http://192.168.0.200:8083/api/professional-tax-settings";
      const method = ptaxData ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          monthlySalaryThreshold: parseFloat(ptaxForm.monthlySalaryThreshold),
          amountAboveThreshold: parseFloat(ptaxForm.amountAboveThreshold),
          amountBelowThreshold: parseFloat(ptaxForm.amountBelowThreshold),
          description: ptaxForm.description
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save Professional Tax settings");
      }

      setPtaxData(data);
      setShowProfessionalTaxModal(false);
      setNotification({
        show: true,
        type: "success",
        message: `Professional Tax settings ${ptaxData ? "updated" : "created"} successfully!`,
      });
    } catch (error) {
      setNotification({
        show: true,
        type: "error",
        message: error.message,
      });
    }
  };

  const handleEditTDS = () => {
    if (tdsData) {
      setTdsForm({
        tdsRate: tdsData.tdsRate,
        description: tdsData.description
      });
    }
    setIsEditingTDS(true);
    setShowTdsModal(true);
  };

  const handleEditPTax = () => {
    if (ptaxData) {
      setPtaxForm({
        monthlySalaryThreshold: ptaxData.monthlySalaryThreshold,
        amountAboveThreshold: ptaxData.amountAboveThreshold,
        amountBelowThreshold: ptaxData.amountBelowThreshold,
        description: ptaxData.description
      });
    }
    setIsEditingPTax(true);
    setShowProfessionalTaxModal(true);
  };

  // Update the TDS Settings Card
  const renderTdsSettings = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">TDS Settings</h3>
        <button
          onClick={handleEditTDS}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          {tdsData ? "Edit" : "Configure"}
        </button>
      </div>
      {tdsData ? (
        <div className="space-y-2">
          <p className="text-gray-600 text-xl">Rate: {tdsData.tdsRate}%</p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          No TDS settings configured. Click "Configure" to set up TDS settings.
        </p>
      )}
    </div>
  );

  // Update the Professional Tax Settings Card
  const renderPTaxSettings = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-800">Professional Tax</h3>
        <button
          onClick={handleEditPTax}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          {ptaxData ? "Edit" : "Configure"}
        </button>
      </div>
      {ptaxData ? (
        <div className="space-y-2">
          <p className="text-gray-600">Monthly Salary Threshold: ₹{ptaxData.monthlySalaryThreshold}</p>
          <p className="text-gray-600">Amount Above Threshold: ₹{ptaxData.amountAboveThreshold}</p>
        </div>
      ) : (
        <p className="text-gray-600 text-sm">
          No Professional Tax settings configured. Click "Configure" to set up Professional Tax settings.
        </p>
      )}
    </div>
  );

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
    setPtaxForm({
      ...ptaxForm,
      [name]: value,
    });
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderTdsSettings()}
            {renderPTaxSettings()}
          </div>

          {/* TDS Modal */}
          {showTdsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {tdsData ? "Edit TDS Settings" : "Configure TDS Settings"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowTdsModal(false);
                      setIsEditingTDS(false);
                      setTdsForm({
                        tdsRate: "",
                        description: ""
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handleTdsSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TDS Rate (%)
                    </label>
                    <input
                      type="number"
                      name="tdsRate"
                      value={tdsForm.tdsRate}
                      onChange={(e) => setTdsForm({ ...tdsForm, tdsRate: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={tdsForm.description}
                      onChange={(e) => setTdsForm({ ...tdsForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTdsModal(false);
                        setIsEditingTDS(false);
                        setTdsForm({
                          tdsRate: "",
                          description: ""
                        });
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {tdsData ? "Update" : "Save"}
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
                    {ptaxData ? "Edit Professional Tax Settings" : "Configure Professional Tax Settings"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowProfessionalTaxModal(false);
                      setIsEditingPTax(false);
                      setPtaxForm({
                        monthlySalaryThreshold: "",
                        amountAboveThreshold: "",
                        amountBelowThreshold: "",
                        description: ""
                      });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
                <form onSubmit={handlePTaxSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Salary Threshold (₹)
                    </label>
                    <input
                      type="number"
                      name="monthlySalaryThreshold"
                      value={ptaxForm.monthlySalaryThreshold}
                      onChange={(e) => setPtaxForm({ ...ptaxForm, monthlySalaryThreshold: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Above Threshold (₹)
                    </label>
                    <input
                      type="number"
                      name="amountAboveThreshold"
                      value={ptaxForm.amountAboveThreshold}
                      onChange={(e) => setPtaxForm({ ...ptaxForm, amountAboveThreshold: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Amount Below Threshold (₹)
                    </label>
                    <input
                      type="number"
                      name="amountBelowThreshold"
                      value={ptaxForm.amountBelowThreshold}
                      onChange={(e) => setPtaxForm({ ...ptaxForm, amountBelowThreshold: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={ptaxForm.description}
                      onChange={(e) => setPtaxForm({ ...ptaxForm, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfessionalTaxModal(false);
                        setIsEditingPTax(false);
                        setPtaxForm({
                          monthlySalaryThreshold: "",
                          amountAboveThreshold: "",
                          amountBelowThreshold: "",
                          description: ""
                        });
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {ptaxData ? "Update" : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

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