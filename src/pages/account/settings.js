import React, { useState } from 'react';
import { FaFileInvoice, FaUniversity } from 'react-icons/fa';
import MainLayout from '@/components/MainLayout';
import { toast } from 'sonner';

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

const CompanyBankDetails = ({ bankDetails, onBankDetailsChange, errors = {} }) => {
  const onChangeUpper = (key, value) => {
    const upper = (value || '').toUpperCase();
    onBankDetailsChange(key, upper);
  };
  const onChangeDigits = (key, value) => {
    const digits = (value || '').replace(/[^0-9]/g, '');
    onBankDetailsChange(key, digits);
  };

  // Keyboard-level restrictions
  const allowControl = (e) => {
    const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
    if (controlKeys.includes(e.key)) return true;
    if (e.ctrlKey || e.metaKey) return true; // allow copy/paste, select-all, etc.
    return false;
  };
  const handleAlphaSpaceKeyDown = (e) => {
    if (allowControl(e)) return;
    if (/^[A-Za-z ]$/.test(e.key)) return;
    e.preventDefault();
  };
  const handleDigitsKeyDown = (e) => {
    if (allowControl(e)) return;
    if (/^[0-9]$/.test(e.key)) return;
    e.preventDefault();
  };
  const handleAlphaNumKeyDown = (e) => {
    if (allowControl(e)) return;
    if (/^[A-Za-z0-9]$/.test(e.key)) return;
    e.preventDefault();
  };

  // Paste sanitization to enforce the same restriction
  const onPasteSanitize = (pattern) => (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text');
    if (!pattern.test(text)) {
      e.preventDefault();
      const sanitized = text.replace(/[^A-Za-z ]/g, '');
      // Let caller update value via change handler if needed
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Company Bank Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input
            type="text"
            value={bankDetails.bankName}
            onChange={(e) => onChangeUpper('bankName', e.target.value)}
            onKeyDown={handleAlphaSpaceKeyDown}
            onPaste={onPasteSanitize(/^[A-Za-z ]+$/)}
            placeholder="e.g., State Bank of India"
            disabled
            aria-disabled="true"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 opacity-75 cursor-not-allowed"
          />
          {errors.bankName && <p className="text-xs text-red-600 mt-1">{errors.bankName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Account Number</label>
          <input
            type="text"
            value={bankDetails.accountNumber}
            onChange={(e) => onChangeDigits('accountNumber', e.target.value)}
            onKeyDown={handleDigitsKeyDown}
            onPaste={(e)=>{ const t=(e.clipboardData||window.clipboardData).getData('text'); if(!/^\d+$/.test(t)) e.preventDefault(); }}
            placeholder="e.g., 123456789"
            maxLength={18}
            disabled
            aria-disabled="true"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 opacity-75 cursor-not-allowed"
          />
          {errors.accountNumber && <p className="text-xs text-red-600 mt-1">{errors.accountNumber}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">IFSC Code</label>
          <input
            type="text"
            value={bankDetails.ifscCode}
            onChange={(e) => onChangeUpper('ifscCode', e.target.value)}
            onKeyDown={handleAlphaNumKeyDown}
            onPaste={(e)=>{ const t=(e.clipboardData||window.clipboardData).getData('text'); if(!/^[A-Za-z0-9]+$/.test(t)) e.preventDefault(); }}
            placeholder="e.g., SBIN0001234"
            disabled
            aria-disabled="true"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm uppercase bg-gray-50 opacity-75 cursor-not-allowed"
          />
          {errors.ifscCode && <p className="text-xs text-red-600 mt-1">{errors.ifscCode}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Branch Name</label>
          <input
            type="text"
            value={bankDetails.branchName}
            onChange={(e) => onChangeUpper('branchName', e.target.value)}
            onKeyDown={handleAlphaSpaceKeyDown}
            onPaste={onPasteSanitize(/^[A-Za-z ]+$/)}
            placeholder="e.g., MG Road, Bengaluru"
            disabled
            aria-disabled="true"
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 opacity-75 cursor-not-allowed"
          />
          {errors.branchName && <p className="text-xs text-red-600 mt-1">{errors.branchName}</p>}
        </div>
      </div>
    </div>
  );
};

const AccountSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('documents');
  
  const [documentSettings, setDocumentSettings] = useState({
    logo: null,
    terms: 'Payment is due within 30 days of the invoice date.',
    invoicePrefix: 'INV-',
    invoiceStartNumber: 1001,
    poPrefix: 'PO-',
    poStartNumber: 1001,
    receiptPrefix: 'RCPT-',
    receiptStartNumber: 1001,
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    branchName: '',
  });
  const [bankErrors, setBankErrors] = useState({});

  const handleDocumentSettingsChange = (key, value) => {
    setDocumentSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleBankDetailsChange = (key, value) => {
    setBankDetails(prev => ({ ...prev, [key]: value }));
  };

  const validateBankDetails = () => {
    const errors = {};
    // BANK NAME: required, letters & spaces, 3+ chars
    if (!bankDetails.bankName?.trim()) {
      errors.bankName = 'BANK NAME IS REQUIRED';
    } else if (!/^[A-Z ]{3,}$/.test(bankDetails.bankName)) {
      errors.bankName = 'ONLY CAPITAL LETTERS AND SPACES, MIN 3 CHARACTERS';
    }
    // ACCOUNT NUMBER: 9-18 digits
    if (!bankDetails.accountNumber?.trim()) {
      errors.accountNumber = 'ACCOUNT NUMBER IS REQUIRED';
    } else if (!/^\d{9,18}$/.test(bankDetails.accountNumber)) {
      errors.accountNumber = 'ACCOUNT NUMBER MUST BE 9-18 DIGITS';
    }
    // IFSC: 4 letters + 0 + 6 alphanumerics
    if (!bankDetails.ifscCode?.trim()) {
      errors.ifscCode = 'IFSC CODE IS REQUIRED';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankDetails.ifscCode)) {
      errors.ifscCode = 'INVALID IFSC CODE FORMAT (e.g., SBIN0001234)';
    }
    // BRANCH NAME: required, 3+ chars, only capital letters and spaces
    if (!bankDetails.branchName?.trim()) {
      errors.branchName = 'BRANCH NAME IS REQUIRED';
    } else if (!/^[A-Z ]{3,}$/.test(bankDetails.branchName)) {
      errors.branchName = 'ONLY CAPITAL LETTERS AND SPACES; MIN 3 CHARACTERS';
    }
    setBankErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveChanges = () => {
    // Validate bank details before save
    if (!validateBankDetails()) {
      toast.error('PLEASE FIX BANK DETAILS');
      return;
    }
    console.log('Saving settings:', { documentSettings, bankDetails });
    toast.success('Settings saved successfully!');
  };

  const settingsTabs = [
    { id: 'documents', label: 'Document Settings', icon: FaFileInvoice },
    { id: 'bank', label: 'Company Bank Details', icon: FaUniversity },
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
                    {activeTab === 'bank' && (
                        <CompanyBankDetails bankDetails={bankDetails} onBankDetailsChange={handleBankDetailsChange} errors={bankErrors} />
                    )}
                    
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