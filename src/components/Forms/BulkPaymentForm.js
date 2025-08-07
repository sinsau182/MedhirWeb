import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaPaperclip, FaFilePdf, FaFileImage, FaTimes, FaUpload } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { fetchBillsOfVendor } from '../../redux/slices/BillSlice';
import { addPayment, updatePayment } from '../../redux/slices/paymentSlice';
import { toast } from 'sonner';

// Payment Receipt Upload UI Component
const PaymentReceiptUploadUI = ({ onFileUpload, uploadedImage, error, onRemoveFile }) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateFile(file)) {
      return;
    }
    
    onFileUpload(file);
  };

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid file (JPG, PNG, BMP, TIFF, PDF)');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size should be less than 10MB');
      return false;
    }
    
    toast.success(`File "${file.name}" uploaded successfully (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    return true;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemoveFile();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        onFileUpload(file);
      }
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center">
      {/* Upload Preview Area - Centered without header */}
      <div 
        className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:bg-gray-100 transition-colors w-full relative"
        onClick={handleUploadClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/bmp,image/tiff,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {uploadedImage && (
          <button
            onClick={handleRemoveClick}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors z-10"
            title="Remove file"
          >
            <FaTimes size={14} />
          </button>
        )}
        
        {uploadedImage ? (
          <div className="flex flex-col items-center w-full h-full">
            <div className="flex-1 flex items-center justify-center w-full">
              {uploadedImage.type === 'application/pdf' ? (
                <div className="text-center">
                  <FaFilePdf className="text-red-500 text-6xl mb-4" />
                  <span className="text-gray-700 font-medium">{uploadedImage.name}</span>
                </div>
              ) : (
                <img 
                  src={typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage)} 
                  alt="Uploaded Payment Receipt" 
                  className="max-w-full max-h-full object-contain rounded-md shadow-sm" 
                />
              )}
            </div>
            <div className="mt-4 text-center">
            
              <p className="text-sm text-gray-500 mt-1">Click to upload a different file</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <FaUpload className="text-gray-400 text-4xl mb-4" />
            <span className="font-semibold text-gray-700 text-lg">Click to upload a payment receipt</span>
            <span className="text-sm text-gray-500 mt-2">or drag and drop files here</span>
            <span className="text-xs text-gray-400 mt-2">JPG, PNG, BMP, TIFF, PDF supported</span>
            <span className="text-xs text-gray-400">Maximum file size: 10MB</span>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-4 text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg text-left">
          <strong>❌ Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

const BulkPaymentForm = ({ mode = 'add', initialData = null, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const { vendors, loading: vendorsLoading, error } = useSelector((state) => state.vendors);
  const { vendorBills: vendorBills, loading: billsLoading } = useSelector((state) => state.bills);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const vendorInputRef = useRef(null);
  const attachmentInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('bills'); // 'bills' | 'notes' | 'attachments'
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Payment receipt upload state
  const [uploadedReceipt, setUploadedReceipt] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const [formData, setFormData] = useState({
    vendor: '',
    gstin: '',
    paymentDate: new Date().toISOString().split('T')[0],
    company: 'ABC Enterprises Ltd.',
    journal: '',
    paymentMethod: '',
    bankAccount: '',
    currency: 'INR',
    reference: '',
    tdsApplied: false,
    notes: ''
  });

  // Initialize form data when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Find the vendor for this payment
      const vendor = vendors.find(v => v.vendorId === initialData.vendorId);
      if (vendor) {
        setSelectedVendor(vendor);
        // Fetch bills for this vendor
        dispatch(fetchBillsOfVendor(vendor.vendorId));
        setFormData({
          vendor: vendor.vendorName,
          gstin: vendor.gstin,
          paymentDate: initialData.paymentDate,
          company: initialData.company || 'ABC Enterprises Ltd.',
          journal: initialData.journal || '',
          paymentMethod: initialData.paymentMethod,
          bankAccount: initialData.bankAccount,
          currency: initialData.currency || 'INR',
          reference: initialData.paymentTransactionId || '',
          tdsApplied: initialData.tdsApplied || false,
          notes: initialData.notes || ''
        });
        
        // Set selected bills based on initial data
        if (initialData.billPayments && initialData.billPayments.length > 0) {
          const billsWithPaymentAmount = initialData.billPayments.map(billPayment => {
            const bill = vendorBills.find(b => b.billId === billPayment.billId);
            return {
              ...bill,
              paymentAmount: billPayment.paidAmount
            };
          });
          setSelectedBills(billsWithPaymentAmount);
        }
        
        // Set payment receipt if available
        if (initialData.paymentProofUrl) {
          setUploadedReceipt(initialData.paymentProofUrl);
        }
      }
    }
  }, [mode, initialData, vendors, vendorBills, dispatch]);

  // Handlers
  const handleVendorChange = (e) => {
    const selectedValue = e.target.value;
    
    if (!vendors || vendors.length === 0) {
      setSelectedVendor(null);
      return;
    }
    
    const v = vendors.find((v) => v.vendorId === selectedValue);
    setSelectedVendor(v);
  };

  const [selectedBills, setSelectedBills] = useState([]);
  const [availableBills, setAvailableBills] = useState([]);
  const [errors, setErrors] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [availableCredit, setAvailableCredit] = useState(0);
  const [appliedCredit, setAppliedCredit] = useState(0);

  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);

  const companies = ['ABC Enterprises Ltd.', 'XYZ India Pvt Ltd.', 'Tech Solutions Pvt Ltd.'];
  const journals = ['Cash Payment Journal', 'Bank Payment Journal', 'Cheque Payment Journal'];
  const paymentMethods = ['Bank Transfer', 'Cheque', 'Cash'];
  const bankAccounts = ['HDFC Bank - *****5678', 'SBI Bank - *****1234', 'ICICI Bank - *****4321'];
  const currencies = ['INR', 'USD', 'EUR'];

  const unpaidBills = [
    {
      id: 1, billNo: 'INV-2025-001', billDate: '2025-06-15', dueDate: '2025-07-15',
      amountDue: 45000.00, subtotal: 38135.59, gst: 6864.41, tdsDeducted: 0,
      gstTreatment: 'GST Registered', reference: 'PO-2025-123'
    },
    {
      id: 2, billNo: 'INV-2025-002', billDate: '2025-06-18', dueDate: '2025-06-28',
      amountDue: 23101.69, subtotal: 19915.25, gst: 3584.75, tdsDeducted: 398.31,
      gstTreatment: 'Composition', reference: 'PO-2025-124'
    },
    {
      id: 3, billNo: 'INV-2025-003', billDate: '2025-06-20', dueDate: '2025-07-20',
      amountDue: 67800.00, subtotal: 57457.63, gst: 10342.37, tdsDeducted: 0,
      gstTreatment: 'GST Registered', reference: 'PO-2025-125'
    }
  ];

  useEffect(() => {
    if (selectedVendor) {
      // In edit mode, show all bills (including paid ones) so we can see what was paid
      // In add mode, filter only unpaid bills
      const billsToShow = mode === 'edit' 
        ? vendorBills 
        : vendorBills.filter(bill => 
            bill.paymentStatus === 'UN_PAID' || bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIALLY_PAID'
          );
      setAvailableBills(billsToShow);
      setFormData(prev => ({ 
        ...prev, 
        gstin: selectedVendor.gstin,
        tdsApplied: selectedVendor.tdsApplicable || false
      }));
      setAvailableCredit(selectedVendor.availableCredit || 0);
    } else {
      setAvailableBills([]);
      setSelectedBills([]);
      setFormData(prev => ({ ...prev, gstin: '', tdsApplied: false }));
      setAvailableCredit(0);
      setAppliedCredit(0);
    }
  }, [selectedVendor, vendorBills, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleVendorInput = (e) => {
    setVendorSearch(e.target.value);
    setShowVendorDropdown(true);
    setFormData(prev => ({ ...prev, vendor: '', gstin: '' }));
  };

  const handleVendorSelect = (vendor) => {
    setFormData(prev => ({ ...prev, vendor: vendor.vendorName, gstin: vendor.gstin }));
    setVendorSearch(vendor.vendorName);
    setShowVendorDropdown(false);
    setErrors(prev => ({ ...prev, vendor: undefined }));
    setSelectedVendor(vendor);
    dispatch(fetchBillsOfVendor(vendor.vendorId));
  };

  const handleBillSelection = (billId, checked) => {
    if (checked) {
      const bill = availableBills.find(b => b.billId === billId);
      const billWithPaymentAmount = {
        ...bill,
        paymentAmount: bill.dueAmount // Default to due amount
      };
      setSelectedBills(prev => [...prev, billWithPaymentAmount]);
    } else {
      setSelectedBills(prev => prev.filter(b => b.billId !== billId));
    }
  };

  const handlePaymentAmountChange = (billId, amount) => {
    // Handle empty string case - don't auto-convert to 0
    if (amount === '') {
      setSelectedBills(prev => 
        prev.map(bill => 
          bill.billId === billId 
            ? { ...bill, paymentAmount: 0 }
            : bill
        )
      );
      return;
    }

    const numAmount = parseFloat(amount);
    
    // Handle invalid numbers
    if (isNaN(numAmount)) {
      return; // Don't update if it's not a valid number
    }

    const bill = availableBills.find(b => b.billId === billId);
    const maxAmount = bill ? bill.dueAmount : 0;
    
    // Ensure amount doesn't exceed the bill's due amount or go below 0
    const validAmount = Math.min(Math.max(0, numAmount), maxAmount);
    
    setSelectedBills(prev => 
      prev.map(bill => 
        bill.billId === billId 
          ? { ...bill, paymentAmount: validAmount }
          : bill
      )
    );
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const billsWithPaymentAmount = availableBills.map(bill => ({
        ...bill,
        paymentAmount: bill.dueAmount // Default to due amount
      }));
      setSelectedBills(billsWithPaymentAmount);
    } else {
      setSelectedBills([]);
    }
  };

  const handleCreditChange = (e) => {
    let amount = parseFloat(e.target.value) || 0;
    const maxApplicable = Math.min(availableCredit, totalAmountDueSelected);
    if (amount < 0) amount = 0;
    if (amount > maxApplicable) amount = maxApplicable;
    setAppliedCredit(amount);
  };

  // Payment receipt upload handlers
  const handleReceiptUpload = (file) => {
    console.log('Receipt upload handler called with file:', file.name, file.size, file.type);
    setUploadedReceipt(file);
    setUploadError('');
  };

  const handleRemoveReceipt = () => {
    setUploadedReceipt(null);
    setUploadError('');
  };

  const totalSelectedSubtotal = selectedBills.reduce((sum, bill) => {
    const ratio = (bill.paymentAmount || 0) / (bill.finalAmount || 1);
    return sum + ((bill.totalBeforeGST || 0) * ratio);
  }, 0);
  
  const totalSelectedGst = selectedBills.reduce((sum, bill) => {
    const ratio = (bill.paymentAmount || 0) / (bill.finalAmount || 1);
    return sum + ((bill.totalGST || 0) * ratio);
  }, 0);
  
  const totalSelectedTds = selectedBills.reduce((sum, bill) => {
    const ratio = (bill.paymentAmount || 0) / (bill.finalAmount || 1);
    return sum + ((bill.tdsApplied || 0) * ratio);
  }, 0);
  
  const totalAmountDueSelected = selectedBills.reduce((sum, bill) => sum + (bill.paymentAmount || 0), 0);
  const finalPaymentAmount = totalAmountDueSelected - appliedCredit;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vendor) newErrors.vendor = 'Please select a vendor';
    if (!formData.company) newErrors.company = 'Please select a company';
    if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
    if (!formData.paymentMethod) newErrors.paymentMethod = 'Please select a payment method';
    if (!formData.bankAccount) newErrors.bankAccount = 'Please select a bank account';
    if (selectedBills.length === 0) newErrors.bills = 'Please select at least one bill to pay';
    
    // Check if at least one bill has a payment amount > 0
    const hasValidPayments = selectedBills.some(bill => (bill.paymentAmount || 0) > 0);
    if (selectedBills.length > 0 && !hasValidPayments) {
      newErrors.bills = 'At least one bill must have a payment amount greater than 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Format the payment data according to the API structure
      const paymentData = {
        vendorId: selectedVendor.vendorId,
        companyId: selectedVendor.companyId, // Use from selectedVendor or default
        gstin: selectedVendor.gstin,
        paymentMethod: formData.paymentMethod,
        bankAccount: formData.bankAccount,
        paymentTransactionId: formData.reference,
        paymentDate: formData.paymentDate,
        totalAmount: finalPaymentAmount-selectedVendor.totalCredit < 0 ? 0 : finalPaymentAmount-selectedVendor.totalCredit,
        adjustedAmountFromCredits: finalPaymentAmount-selectedVendor.totalCredit < 0 ? finalPaymentAmount : selectedVendor.totalCredit,
        tdsApplied: formData.tdsApplied,
        notes: formData.notes,
        paymentProofUrl: null, // Will be set by backend after file upload
        billPayments: selectedBills.map(bill => ({
          billId: bill.billId,
          paidAmount: bill.paymentAmount
        }))
      };

      console.log('Payment data to be sent:', paymentData);

      // Always use FormData since backend doesn't support JSON
      const formDataToSend = new FormData();
      formDataToSend.append('payment', JSON.stringify(paymentData));

      // Add attachments if any
      attachments.forEach((file, index) => {
        formDataToSend.append(`attachments`, file);
      });

      // Add payment receipt if uploaded
      if (uploadedReceipt) {
        formDataToSend.append('paymentProof', uploadedReceipt);
        console.log('Payment proof added to form data:', uploadedReceipt.name, uploadedReceipt.size, uploadedReceipt.type);
      } else {
        console.log('No payment proof uploaded');
      }

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      try {
        let result;
        if (mode === 'edit' && initialData) {
          // Update existing payment
          result = await dispatch(updatePayment({ 
            paymentId: initialData.id, 
            payment: formDataToSend 
          }));
        } else {
          // Add new payment
          result = await dispatch(addPayment(formDataToSend));
        }
        
        console.log('Payment submission result:', result);
        if (result.error) {
          console.error('Payment failed:', result.error);
          toast.error(mode === 'edit' ? 'Payment update failed. Please try again.' : 'Payment failed. Please try again.');
        } else {
          toast.success(mode === 'edit' ? 'Payment updated successfully!' : 'Payment submitted successfully!');
          console.log('Payment payload:', result.payload);
          onSubmit && onSubmit(result.payload);
          onCancel();
        }
      } catch (error) {
        console.error('Payment submission error:', error);
        toast.error(mode === 'edit' ? 'Payment update failed. Please try again.' : 'Payment submission failed. Please try again.');
      }
    } else {
      console.log(errors);
    }
  };

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedFiles = files.filter(f => /pdf|jpg|jpeg|png/i.test(f.type));
    setAttachments(prev => [...prev, ...allowedFiles]);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  const formatCurrency = (num) =>
    '₹' + (num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Close vendor dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (vendorInputRef.current && !vendorInputRef.current.contains(event.target)) {
        setShowVendorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 min-h-0 border border-gray-200 rounded-t-lg overflow-hidden shadow-sm relative">
        {/* Form Panel (Left) */}
        <div className="lg:col-span-1 overflow-y-auto p-6 border-r border-gray-200 pb-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Bulk Payment' : 'Bulk Payment'}
            </h2>
          </div>
          
          {/* Form Content */}
          <div className="space-y-6 pb-6">
            {/* Payment Details */}
            <div>
              <div className="flex items-center mb-6">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column */}
                <div className="space-y-6">
                  {/* Vendor */}
                  <div className="relative" ref={vendorInputRef}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vendor <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.vendor ? 'border-red-500' : 'border-gray-300'
                        } ${mode === 'edit' ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                        placeholder="Select vendor"
                        value={formData.vendor}
                        onChange={handleVendorChange}
                        onFocus={() => mode !== 'edit' && setShowVendorDropdown(true)}
                        autoComplete="off"
                        disabled={mode === 'edit'}
                      />
                      {showVendorDropdown && mode !== 'edit' && (
                        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                          {vendors.map(vendor => (
                            <div
                              key={vendor.vendorId}
                              className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => handleVendorSelect(vendor)}
                            >
                              <div className="font-medium text-gray-900">{vendor.vendorName}</div>
                              <div className="text-xs text-gray-500">{vendor.gstin}</div>
                            </div>
                          ))}
                          {vendors.length === 0 && (
                            <div className="px-4 py-3 text-gray-400">No vendors found</div>
                          )}
                        </div>
                      )}
                    </div>
                    {errors.vendor && <p className="text-red-500 text-xs mt-1">{errors.vendor}</p>}
                  </div>
                  {/* Vendor GSTIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vendor GSTIN</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      value={formData.gstin}
                      placeholder="Auto-filled from vendor"
                      readOnly
                    />
                  </div>
                  {/* Bank Account */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid From Bank Account</label>
                    <select
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select bank account</option>
                      {bankAccounts.map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))}
                    </select>
                    {errors.bankAccount && <p className="text-red-500 text-xs mt-1">{errors.bankAccount}</p>}
                  </div>
                </div>
                {/* Right column */}
                <div className="space-y-6">
                  {/* Payment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="paymentDate"
                      value={formData.paymentDate}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.paymentDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.paymentDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDate}</p>}
                  </div>
                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select payment method</option>
                      {paymentMethods.map(method => (
                        <option key={method} value={method}>{method}</option>
                      ))}
                    </select>
                    {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod}</p>}
                  </div>
                  {/* Payment Transaction ID (was Reference) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Transaction ID</label>
                    <input
                      type="text"
                      name="reference"
                      value={formData.reference}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., June 2025 settlement"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 mt-2">
                {/* Show vendor's TDS percentage if available */}
                {selectedVendor && selectedVendor.tdsPercentage && (
                  <div className="text-sm text-gray-600 mb-2">
                    TDS Applied: {selectedVendor.tdsPercentage}%
                  </div>
                )}
              </div>
            </div>

            {/* Bills & Notes Tabbed Section */}
            <div className="w-full mt-8">
              {/* Tab Buttons */}
              <div className="flex border-b border-gray-200 mb-0">
                <button
                  type="button"
                  className={`px-6 py-3 font-semibold text-lg focus:outline-none transition-colors border-b-2
                    ${activeTab === 'bills' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('bills')}
                  style={{ borderTopLeftRadius: 8, borderTopRightRadius: 0 }}
                >
                  Bills
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 font-semibold text-lg focus:outline-none transition-colors border-b-2
                    ${activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('notes')}
                  style={{ borderTopLeftRadius: 0, borderTopRightRadius: 8 }}
                >
                  Notes
                </button>
              </div>
              {/* Tab Content */}
              <div className="bg-white p-6 border border-t-0 border-gray-200 min-h-[300px]">
                {activeTab === 'bills' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <h2 className="text-lg font-semibold text-gray-900">Select Bills to Pay</h2>
                      </div>
                      <div className="text-sm text-gray-600">
                        💡 Tip: You can pay partial amounts for each bill
                      </div>
                    </div>
                    {!selectedVendor ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📋</div>
                        <p className="text-lg font-medium text-gray-600">Please select a vendor first</p>
                        <p className="text-sm text-gray-500 mt-2">Bills will appear here once you choose a vendor</p>
                      </div>
                    ) : billsLoading ? (
                      <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-lg font-medium text-gray-600">Loading bills...</p>
                      </div>
                    ) : availableBills.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-lg font-medium text-gray-600">No unpaid bills found</p>
                        <p className="text-sm text-gray-500 mt-2">This vendor has no outstanding bills</p>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedBills.length === availableBills.length && availableBills.length > 0}
                                    onChange={e => handleSelectAll(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                  />
                                </th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">BILL NO.</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">BILL DATE</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">DUE DATE</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">TOTAL DUE</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PAYMENT AMOUNT</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">REFERENCE/PO</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {availableBills.map((bill) => {
                                const isSelected = selectedBills.some(sb => sb.billId === bill.billId);
                                const selectedBill = selectedBills.find(sb => sb.billId === bill.billId);
                                // Don't fallback to bill.dueAmount if paymentAmount is 0
                                const paymentAmount = selectedBill ? selectedBill.paymentAmount : bill.dueAmount;
                                
                                return (
                                  <tr key={bill.billId} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={e => handleBillSelection(bill.billId, e.target.checked)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                      />
                                    </td>
                                    <td className="py-4 px-4 text-sm font-medium">{bill.billNumber}</td>
                                    <td className="py-4 px-4 text-sm">{formatDate(bill.billDate)}</td>
                                    <td className="py-4 px-4 text-sm">{formatDate(bill.dueDate)}</td>
                                    <td className="py-4 px-4 text-sm font-medium">{formatCurrency(bill.dueAmount)}</td>
                                    <td className="py-4 px-4">
                                      {isSelected ? (
                                        <div className="flex items-center space-x-2">
                                          <span className="text-xs text-gray-500">₹</span>
                                          <input
                                            type="number"
                                            value={paymentAmount === 0 ? '' : paymentAmount}
                                            onChange={e => handlePaymentAmountChange(bill.billId, e.target.value)}
                                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            min="0"
                                            max={bill.dueAmount}
                                            step="0.01"
                                            placeholder="0"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handlePaymentAmountChange(bill.billId, bill.dueAmount)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                            title="Pay full amount"
                                          >
                                            Full
                                          </button>
                                        </div>
                                      ) : (
                                        <span className="text-sm text-gray-400">Select to set amount</span>
                                      )}
                                    </td>
                                    <td className="py-4 px-4">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        bill.paymentStatus === 'UN_PAID' || bill.paymentStatus === 'UNPAID' || bill.paymentStatus === 'PARTIALLY_PAID'
                                          ? 'bg-red-100 text-red-800' 
                                          : bill.paymentStatus === 'PAID'
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {bill.paymentStatus?.replace('_', ' ') || 'DRAFT'}
                                      </span>
                                    </td>
                                    <td className="py-4 px-4 text-sm">{bill.billReference}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {errors.bills && <div className="text-red-500 text-sm mt-4">{errors.bills}</div>}

                        <div className="flex justify-end items-center mt-6 pt-4 border-t border-gray-200">
                          <div className="w-96 space-y-2">
                            <p className="text-sm text-gray-500 text-left mb-2">
                              {selectedBills.length} bills selected
                              {selectedBills.some(bill => (bill.paymentAmount || 0) < (bill.dueAmount || 0)) && (
                                <span className="ml-2 text-blue-600">(partial payments)</span>
                              )}
                            </p>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Subtotal (Before GST)</span>
                              <span className="text-gray-900 font-medium">{formatCurrency(totalSelectedSubtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Total GST</span>
                              <span className="text-gray-900 font-medium">{formatCurrency(totalSelectedGst)}</span>
                            </div>
                            {totalSelectedTds > 0 && (
                              <div className="flex justify-between items-center text-red-600">
                                <span className="font-medium">TDS Applied</span>
                                <span className="font-medium">- {formatCurrency(totalSelectedTds)}</span>
                              </div>
                            )}
                            <hr className="my-1" />
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-800">Total Payment Amount</span>
                              <span className="font-semibold text-gray-900">{formatCurrency(totalAmountDueSelected)}</span>
                            </div>
                            {selectedBills.length > 0 && selectedVendor.vendorCredits && selectedVendor.totalCredit > 0 && (
                              <div className="flex justify-between items-center text-green-600">
                                <span className="font-medium">Vendor Credit Adjusted</span>
                                <span className="font-medium">- {finalPaymentAmount-selectedVendor.totalCredit < 0 ? formatCurrency(finalPaymentAmount) : formatCurrency(selectedVendor.totalCredit)}</span>
                              </div>
                            )}
                            <hr className="my-2 border-dashed" />
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-lg">Final Payment</span>
                              <span className="font-bold text-lg">{selectedBills.length > 0 ? (finalPaymentAmount-selectedVendor.totalCredit) < 0 ? '0' : formatCurrency(finalPaymentAmount-selectedVendor.totalCredit) : formatCurrency(finalPaymentAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {activeTab === 'notes' && (
                  <div>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add payment notes (optional)"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upload Panel (Right) */}
        <div className="lg:col-span-1 overflow-y-auto bg-gray-50 p-6 pb-24">
          <PaymentReceiptUploadUI 
            onFileUpload={handleReceiptUpload}
            uploadedImage={uploadedReceipt}
            error={uploadError}
            onRemoveFile={handleRemoveReceipt}
          />
        </div>

        {/* Sticky Footer integrated within form container */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 rounded-b-lg shadow-sm z-10">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">
              Total Payment: {formatCurrency(finalPaymentAmount)}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => alert('Draft saved!')}
              >
                Save Draft
              </button>
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => alert('Preview opened!')}
              >
                Preview
              </button>
              <button
                type="button"
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                onClick={handleSubmit}
              >
                {mode === 'edit' ? 'Update Payment' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPaymentForm; 