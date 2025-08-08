import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaFileInvoice, FaPercentage, FaPlus, FaTrash } from 'react-icons/fa';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';
import { 
    fetchAccountSettings, 
    createDefaultAccountSettings, 
    updateAccountSettings,
    updateDocumentSettings
} from '@/redux/slices/accountSettingsSlice';

const DocumentSettings = ({ settings, onSettingsChange }) => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSettingsChange('logo', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Branding & Defaults</h3>
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Company Logo</h4>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 border-2 border-dashed rounded-md flex items-center justify-center bg-gray-50">
                {settings.logo ? (
                  <img src={settings.logo} alt="Company Logo" className="object-contain h-full w-full" />
                ) : (
                  <span className="text-xs text-gray-400">No Logo</span>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Default Terms & Conditions</h4>
            <textarea
              value={settings.terms}
              onChange={(e) => onSettingsChange('terms', e.target.value)}
              rows="5"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
              placeholder="e.g., Payment due within 30 days of invoice date."
            />
          </div>
        </div>
      </div>
       <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Document Numbering</h3>
        <div className="space-y-6">
          {/* Invoice Numbering */}
          <div>
            <h4 className="font-semibold text-gray-700">Invoice Numbering</h4>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="text"
                value={settings.invoicePrefix}
                onChange={(e) => onSettingsChange('invoicePrefix', e.target.value)}
                placeholder="Prefix (e.g., INV-)"
                className="p-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="number"
                value={settings.invoiceStartNumber}
                onChange={(e) => onSettingsChange('invoiceStartNumber', e.target.value)}
                placeholder="Start Number (e.g., 1001)"
                className="p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Next invoice number will be: {settings.invoicePrefix || ''}{settings.invoiceStartNumber || ''}
            </p>
          </div>
           {/* Purchase Order Numbering */}
           <div>
            <h4 className="font-semibold text-gray-700">Purchase Order Numbering</h4>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="text"
                value={settings.poPrefix}
                onChange={(e) => onSettingsChange('poPrefix', e.target.value)}
                placeholder="Prefix (e.g., PO-)"
                className="p-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="number"
                value={settings.poStartNumber}
                onChange={(e) => onSettingsChange('poStartNumber', e.target.value)}
                placeholder="Start Number (e.g., 1001)"
                className="p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Next PO number will be: {settings.poPrefix || ''}{settings.poStartNumber || ''}
            </p>
          </div>
           {/* Receipt Numbering */}
           <div>
            <h4 className="font-semibold text-gray-700">Receipt Numbering</h4>
            <div className="flex items-center gap-4 mt-2">
              <input
                type="text"
                value={settings.receiptPrefix}
                onChange={(e) => onSettingsChange('receiptPrefix', e.target.value)}
                placeholder="Prefix (e.g., RCPT-)"
                className="p-2 border border-gray-300 rounded-md shadow-sm"
              />
              <input
                type="number"
                value={settings.receiptStartNumber}
                onChange={(e) => onSettingsChange('receiptStartNumber', e.target.value)}
                placeholder="Start Number (e.g., 1001)"
                className="p-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Next receipt number will be: {settings.receiptPrefix || ''}{settings.receiptStartNumber || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaxSettings = ({ taxes, onTaxesChange }) => {
  const [newTax, setNewTax] = useState({ name: '', rate: '' });

  const handleAddTax = () => {
    if (!newTax.name || !newTax.rate) {
      toast.error("Tax name and rate are required.");
      return;
    }
    const updatedTaxes = [...taxes, { ...newTax, id: `tax_${Date.now()}` }];
    onTaxesChange(updatedTaxes);
    setNewTax({ name: '', rate: '' });
  };
  
  const handleRemoveTax = (id) => {
    const updatedTaxes = taxes.filter(t => t.id !== id);
    onTaxesChange(updatedTaxes);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-lg border flex items-end gap-4">
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700">Tax Name</label>
          <input
            type="text"
            value={newTax.name}
            onChange={(e) => setNewTax({ ...newTax, name: e.target.value })}
            placeholder="e.g., GST 18%"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700">Rate (%)</label>
          <input
            type="number"
            value={newTax.rate}
            onChange={(e) => setNewTax({ ...newTax, rate: e.target.value })}
            placeholder="e.g., 18"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <button onClick={handleAddTax} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"><FaPlus/> Add Tax</button>
      </div>
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Current Tax Rates</h4>
        <div className="space-y-2">
            {taxes.map(tax => (
                <div key={tax.id} className="flex justify-between items-center p-3 bg-white border rounded-md">
                    <div>
                        <span className="font-semibold text-gray-800">{tax.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{tax.rate}%</span>
                        <button onClick={() => handleRemoveTax(tax.id)} className="text-red-500 hover:text-red-700">
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};


const AccountSettingsPage = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('documents');
  
  // Get account settings from Redux store
  const { 
    documentSettings, 
    taxRates, 
    loading, 
    error, 
    lastUpdated
  } = useSelector((state) => state.accountSettings);

  // Get company ID from session storage
  const companyId = typeof window !== 'undefined' ? 
    sessionStorage.getItem("employeeCompanyId") || 
    sessionStorage.getItem("companyId") || 
    sessionStorage.getItem("company") : null;

  // Fetch account settings on component mount
  useEffect(() => {
    if (companyId) {
      dispatch(fetchAccountSettings(companyId));
    }
  }, [dispatch, companyId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleDocumentSettingsChange = (key, value) => {
    dispatch(updateDocumentSettings({ [key]: value }));
  };

  const handleTaxRatesChange = (newTaxRates) => {
    dispatch(updateTaxRates(newTaxRates));
  };

  const handleSaveChanges = async () => {
    if (!companyId) {
      toast.error("Company ID not found. Please login again.");
      return;
    }

    try {
      // Prepare the complete settings object with all required fields
      const completeSettings = {
        ...documentSettings,
        taxRates,
        // Ensure all required fields are present with default values if missing
        invoicePrefix: documentSettings.invoicePrefix || 'INV-',
        invoiceStartNumber: documentSettings.invoiceStartNumber || 1001,
        invoiceCurrentNumber: documentSettings.invoiceCurrentNumber || 1001,
        receiptPrefix: documentSettings.receiptPrefix || 'RCPT-',
        receiptStartNumber: documentSettings.receiptStartNumber || 1001,
        receiptCurrentNumber: documentSettings.receiptCurrentNumber || 1001,
        // Map frontend field names to backend field names
        purchaseOrderPrefix: documentSettings.poPrefix || 'PO-',
        purchaseOrderStartingNumber: documentSettings.poStartNumber || 1001,
        purchaseOrderCurrentNumber: documentSettings.poCurrentNumber || 1001,
        invoiceStartingNumber: documentSettings.invoiceStartNumber || 1001,
        receiptStartingNumber: documentSettings.receiptStartNumber || 1001,
        companyId: companyId
      };

      try {
        // Try to update existing settings
        await dispatch(updateAccountSettings({ 
          companyId, 
          settings: completeSettings
        })).unwrap();
        toast.success("Settings saved successfully!");
      } catch (updateError) {
        // If update fails (likely because settings don't exist), create default settings
        console.log("Update failed, creating default settings:", updateError);
        await dispatch(createDefaultAccountSettings({ 
          companyId, 
          customDefaults: completeSettings
        })).unwrap();
        toast.success("Default settings created successfully!");
      }
    } catch (error) {
      toast.error("Failed to save settings: " + error);
    }
  };



  const settingsTabs = [
    { id: 'documents', label: 'Document Settings', icon: FaFileInvoice },
    { id: 'tax', label: 'Tax Configuration', icon: FaPercentage },
  ];

  return (
    <MainLayout>
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-8">
                <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Settings</h1>
                    <p className="text-gray-500">Manage financial documents, taxes, and global configurations for the accounting module.</p>
                </div>
                {lastUpdated && (
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date(lastUpdated).toLocaleString()}
                    </div>
                )}
            </div>
            {loading && !documentSettings ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading account settings...</span>
                </div>
            ) : (
            <div className="flex gap-8">
                <aside className="w-1/4 border-r border-gray-200 pr-8">
                    <nav className="flex flex-col gap-2">
                        {settingsTabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 w-full text-left p-3 rounded-md transition-colors duration-150 text-sm font-medium ${
                                activeTab === tab.id
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="w-3/4">
                                                 {activeTab === 'documents' && <DocumentSettings settings={documentSettings} onSettingsChange={handleDocumentSettingsChange} />}
                        {activeTab === 'tax' && <TaxSettings taxes={taxRates} onTaxesChange={handleTaxRatesChange} />}
                    
                    <div className="mt-8 pt-6 border-t flex justify-end">
                        <button
                            onClick={handleSaveChanges}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : (
                                    'Save All Changes'
                                )}
                        </button>
                    </div>
                </main>
            </div>
            )}
        </div>
    </MainLayout>
  );
};

export default AccountSettingsPage; 