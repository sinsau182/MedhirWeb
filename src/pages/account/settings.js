import React, { useEffect, useState } from 'react';
import { FaFileInvoice } from 'react-icons/fa';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';
import getConfig from 'next/config';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';

const { publicRuntimeConfig } = getConfig();

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
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled
                aria-disabled="true"
                className="cursor-not-allowed opacity-50 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Default Terms & Conditions</h4>
            <textarea
              value={settings.terms}
              onChange={(e) => onSettingsChange('terms', e.target.value)}
              rows="5"
              disabled
              aria-disabled="true"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 opacity-75 cursor-not-allowed"
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

// Removed CompanyBankDetails per request

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('documents');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingSettings, setHasExistingSettings] = useState(false);

  const buildAuthHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  });
  
  const [documentSettings, setDocumentSettings] = useState({
    logo: null,
    terms: 'Payment is due within 30 days of the invoice date.',
    invoicePrefix: 'INV-',
    invoiceStartNumber: 1001,
    invoiceCurrentNumber: 1001,
    poPrefix: 'PO-',
    poStartNumber: 1001,
    poCurrentNumber: 1001,
    receiptPrefix: 'RCPT-',
    receiptStartNumber: 1001,
    receiptCurrentNumber: 1001,
  });

  // Removed bank details state

  const handleDocumentSettingsChange = (key, value) => {
    setDocumentSettings(prev => ({ ...prev, [key]: value }));
  };

  // Robust companyId resolver (handles encrypted, plain, and nested data)
  const resolveCompanyId = () => {
    try {
      let cid = sessionStorage.getItem('employeeCompanyId')
        || sessionStorage.getItem('companyId')
        || sessionStorage.getItem('company');
      if (cid) return cid;
      // Fallback: read raw sessionStorage
      if (typeof window !== 'undefined') {
        cid = sessionStorage.getItem('employeeCompanyId')
          || sessionStorage.getItem('companyId')
          || sessionStorage.getItem('company');
        if (cid) return cid;
        // Try to parse bis_data if present
        const bisRaw = sessionStorage.getItem('bis_data');
        if (bisRaw) {
          try {
            const bis = JSON.parse(bisRaw);
            if (bis?.companyId) return bis.companyId;
            if (bis?.employeeCompanyId) return bis.employeeCompanyId;
          } catch {}
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Removed bank details handler

  // Removed bank validation

  // Fetch existing settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const companyId = resolveCompanyId();
        if (!companyId) return;
        const token = getItemFromSessionStorage('token', null);
        setIsLoading(true);
        const res = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/company/${companyId}`, {
          headers: buildAuthHeaders(token),
        });
        if (res.status === 401) {
          toast.error('Authentication required. Please sign in again.');
          setHasExistingSettings(false);
          setIsLoading(false);
          return;
        }
        if (res.status === 404) {
          setHasExistingSettings(false);
          setIsLoading(false);
          return;
        }
        if (!res.ok) {
          setHasExistingSettings(false);
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setHasExistingSettings(true);
        setDocumentSettings(prev => ({
          ...prev,
          invoicePrefix: data.invoicePrefix ?? prev.invoicePrefix,
          invoiceStartNumber: data.invoiceStartingNumber ?? data.invoiceStartNumber ?? prev.invoiceStartNumber,
          invoiceCurrentNumber: data.invoiceCurrentNumber ?? prev.invoiceCurrentNumber,
          poPrefix: data.purchaseOrderPrefix ?? data.poPrefix ?? prev.poPrefix,
          poStartNumber: data.purchaseOrderStartingNumber ?? data.purchaseOrderStartNumber ?? data.poStartNumber ?? prev.poStartNumber,
          poCurrentNumber: data.purchaseOrderCurrentNumber ?? prev.poCurrentNumber,
          receiptPrefix: data.receiptPrefix ?? prev.receiptPrefix,
          receiptStartNumber: data.receiptStartingNumber ?? data.receiptStartNumber ?? prev.receiptStartNumber,
          receiptCurrentNumber: data.receiptCurrentNumber ?? prev.receiptCurrentNumber,
        }));
        setIsLoading(false);
      } catch (e) {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const companyId = resolveCompanyId();
      if (!companyId) {
        toast.error('Company ID not found.');
        return;
      }
      const token = getItemFromSessionStorage('token', null);
      if (!token) {
        toast.error('You are not signed in. Please sign in and try again.');
        return;
      }
      setIsSaving(true);
      const invoiceStartingNumber = Number(documentSettings.invoiceStartNumber) || 1;
      const poStartingNumber = Number(documentSettings.poStartNumber) || 1;
      const receiptStartingNumber = Number(documentSettings.receiptStartNumber) || 1;

      const payload = {
        companyId,
        invoicePrefix: documentSettings.invoicePrefix,
        invoiceStartingNumber,
        invoiceCurrentNumber: hasExistingSettings
          ? Number(documentSettings.invoiceCurrentNumber ?? invoiceStartingNumber)
          : invoiceStartingNumber,
        purchaseOrderPrefix: documentSettings.poPrefix,
        purchaseOrderStartingNumber: poStartingNumber,
        purchaseOrderCurrentNumber: hasExistingSettings
          ? Number(documentSettings.poCurrentNumber ?? poStartingNumber)
          : poStartingNumber,
        receiptPrefix: documentSettings.receiptPrefix,
        receiptStartingNumber,
        receiptCurrentNumber: hasExistingSettings
          ? Number(documentSettings.receiptCurrentNumber ?? receiptStartingNumber)
          : receiptStartingNumber,
      };
      const method = hasExistingSettings ? 'PUT' : 'POST';
      const res = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/account/company/${companyId}`, {
        method,
        headers: buildAuthHeaders(token),
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        toast.error('Authentication required. Please sign in again.');
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to save settings');
      }
      setHasExistingSettings(true);
      toast.success('Settings saved successfully!');
    } catch (err) {
      toast.error(`Failed to save settings: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const settingsTabs = [
    { id: 'documents', label: 'Document Settings', icon: FaFileInvoice },
  ];

  return (
    <MainLayout>
      <div className="p-6">
        <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Settings</h1>
            <p className="text-gray-500 mb-8">Manage financial document defaults, branding, and numbering for the accounting module.</p>
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
                    {activeTab === 'documents' && (
                        <DocumentSettings settings={documentSettings} onSettingsChange={handleDocumentSettingsChange} />
                    )}
                    {/* Company bank details removed */}
                    
                    <div className="mt-8 pt-6 border-t flex justify-end">
                        <button
                            onClick={handleSaveChanges}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 shadow-sm"
                        >
                            Save All Changes
                        </button>
                    </div>
                </main>
            </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AccountSettingsPage; 