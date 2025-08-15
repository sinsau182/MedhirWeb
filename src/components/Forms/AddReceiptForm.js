import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaReceipt, FaChevronDown, FaChevronRight, FaInfoCircle, FaLink, FaUpload, FaFileAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { addReceipt, getNextReceiptNumber, generateNextReceiptNumber } from "../../redux/slices/receiptSlice";
import { fetchProjectCustomerList, fetchInvoicesByProject, fetchReceiptsByProject } from "@/redux/slices/receiptSlice";


const AddReceiptForm = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    customerName: '',
    receiptNumber: '',
    receiptDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'Bank Transfer',
    reference: '',
    bankAccount: '',
    chequeNumber: '',
    upiTransactionId: '',
  });
const dispatch = useDispatch();
  const { projectCustomerList, invoicesByProject, receiptsByProject, nextReceiptNumber, loading } = useSelector((state) => state.receipts);
  const [errors, setErrors] = useState({});
  const [isAccountingCollapsed, setIsAccountingCollapsed] = useState(true);

  // File upload state
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // New state for project-specific data
  const [projectReceiptData, setProjectReceiptData] = useState({
    totalAmountReceived: 0,
    totalUnallocatedAmount: 0,
    previousReceipts: []
  });

  // Static data - in real app, these would come from APIs
  const customers = [
    { id: 1, name: 'Evergreen Solar' },
    { id: 2, name: 'Horizon Dynamics' },
    { id: 3, name: 'Pioneer Builders' }
  ];

  // Get company ID from session storage
  const companyId = typeof window !== 'undefined' ? 
    sessionStorage.getItem("employeeCompanyId") || 
    sessionStorage.getItem("companyId") || 
    sessionStorage.getItem("company") : null;

  // Function to fetch next receipt number (generates and increments)
  const fetchNextReceiptNumber = async () => {
    if (companyId) {
      try {
        await dispatch(getNextReceiptNumber(companyId)).unwrap();
      } catch (error) {
        console.error('Failed to fetch next receipt number:', error);
        // Don't show error toast as this is optional functionality
      }
    }
  };



  const paymentMethods = ['Bank Transfer', 'Cheque', 'UPI', 'Cash', 'Credit Card', 'Debit Card'];
  const bankAccounts = ['HDFC Bank - *****5678', 'SBI Bank - *****1234', 'ICICI Bank - *****4321'];

  // Auto-fill receipt number on form load
  useEffect(() => {
    if (companyId) {
      fetchNextReceiptNumber();
    }
  }, [companyId]);

  // Auto-populate receipt number when next receipt number is generated (always updates the field)
  useEffect(() => {
    if (nextReceiptNumber) {
      setFormData(prev => ({
        ...prev,
        receiptNumber: nextReceiptNumber
      }));
    }
  }, [nextReceiptNumber]);

  useEffect(() => {
  if (initialData) {
    setFormData(prev => ({
      ...prev,
      projectName: initialData.projectName || '',
      customerName: initialData.client || '',
      customerId: initialData.customerId || '',
      projectId: initialData.projectId || '',
      amount: initialData.amount || '',
      amountReceived: initialData.amount || '',
    }));
  }
}, [initialData]);

useEffect(() => {
  dispatch(fetchProjectCustomerList());
}, [dispatch]);

// Calculate project-specific receipt data when receiptsByProject changes
useEffect(() => {
  if (receiptsByProject) {
    if (receiptsByProject.length > 0) {
      const totalReceived = receiptsByProject.reduce((sum, receipt) => sum + (receipt.amountReceived || 0), 0);
      const totalAllocated = receiptsByProject.reduce((sum, receipt) => {
        const allocated = receipt.linkedInvoices ? 
          receipt.linkedInvoices.reduce((invSum, inv) => invSum + (inv.amountAllocated || 0), 0) : 0;
        return sum + allocated;
      }, 0);
      
      // Use backend's totalUnallocatedAmount if available, otherwise calculate
      const unallocatedAmount = receiptsByProject.totalUnallocatedAmount || (totalReceived - totalAllocated);
      
      setProjectReceiptData({
        totalAmountReceived: totalReceived,
        totalUnallocatedAmount: unallocatedAmount,
        previousReceipts: receiptsByProject
      });
    } else {
      // First receipt for this project - no previous receipts
      setProjectReceiptData({
        totalAmountReceived: 0,
        totalUnallocatedAmount: 0,
        previousReceipts: []
      });
    }
    
    // Remove auto-population - user must manually enter amount
  }
}, [receiptsByProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // File upload handlers
  const handleFileSelect = (file) => {
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error('Please select a valid file type (PNG, JPG, PDF)');
        return;
      }
      
      if (file.size > maxSize) {
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setPaymentProof(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPaymentProofPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPaymentProofPreview(null);
      }
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const removeFile = () => {
    setPaymentProof(null);
    setPaymentProofPreview(null);
  };



  const toggleAccountingSection = () => {
    setIsAccountingCollapsed(!isAccountingCollapsed);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName) {
      newErrors.customerName = 'Customer name is required';
      toast.error('Customer name is required');
    }
    if (!formData.receiptNumber.trim()) {
      newErrors.receiptNumber = 'Receipt number is required';
      toast.error('Receipt number is required');
    } else if (checkReceiptNumberExists(formData.receiptNumber.trim())) {
      newErrors.receiptNumber = 'Receipt number already exists';
      toast.error('Receipt number already exists');
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
      toast.error('Valid amount is required');
    }
    
    // Validate cheque number if payment method is Cheque
    if (formData.paymentMethod === 'Cheque') {
      if (!formData.chequeNumber || !formData.chequeNumber.trim()) {
        newErrors.chequeNumber = 'Cheque number is required';
        toast.error('Cheque number is required');
      } else if (!validateChequeNumber(formData.chequeNumber.trim())) {
        newErrors.chequeNumber = 'Cheque number must be exactly 6 digits';
        toast.error('Cheque number must be exactly 6 digits');
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


const [selectedOption, setSelectedOption] = useState(null);
const [isOpen, setIsOpen] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    try {
      // Generate the actual receipt number (this will increment the counter)
      let finalReceiptNumber = formData.receiptNumber;
      if (companyId) {
        try {
          const result = await dispatch(generateNextReceiptNumber(companyId)).unwrap();
          finalReceiptNumber = result.nextReceiptNumber;
        } catch (error) {
          console.error('Failed to generate receipt number:', error);
          // Continue with the current number if generation fails
        }
      }
      
      // Create receipt data object - only include fields that DTO expects
      const receiptData = {
        customerId: formData.customerId,
        projectId: formData.leadId,
        amountReceived: parseFloat(formData.amount),
        linkedInvoices: [], // Empty array since invoice linking is removed
        receiptDate: formData.receiptDate,
        paymentMethod: formData.paymentMethod,
        receiptNumber: finalReceiptNumber,
        paymentTransactionId:
          formData.reference ||
          formData.chequeNumber ||
          formData.upiTransactionId ||
          '',
        bankAccountId: formData.bankAccount || null, // Add if your DTO has this field
      };
      
      // Always send as FormData since backend expects multipart form data
      const formDataToSend = new FormData();
      
      // Append receipt data as a JSON string (like bill endpoint)
      formDataToSend.append('receipt', JSON.stringify(receiptData));
      
      // Add file if selected (optional)
      if (paymentProof) {
        formDataToSend.append('file', paymentProof);
      }
      
      await dispatch(addReceipt(formDataToSend)).unwrap();
      
      // Debug: Log the data being sent
      console.log('Receipt Data being sent:', receiptData);
      console.log('Payment Proof:', paymentProof);
      toast.success('Receipt added successfully!');
      // Add small delay to prevent duplicate messages
      setTimeout(() => {
        if (onSubmit) onSubmit(); // Notify parent to refresh UI and close form
      }, 100);
    } catch (error) {
      console.error('Receipt submission error:', error);
      toast.error(error?.message || 'Failed to add receipt');
      setErrors({ submit: error?.message || 'Failed to add receipt' });
    }
  }
};
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  // Validate cheque number format
  function validateChequeNumber(chequeNumber) {
    const regex = /^\d{6}$/;
    return regex.test(chequeNumber);
  }

  // Check if receipt number already exists
  function checkReceiptNumberExists(receiptNumber) {
    if (!receiptsByProject || receiptsByProject.length === 0) return false;
    return receiptsByProject.some(receipt => receipt.receiptNumber === receiptNumber);
  }

  const receiptAmount = parseFloat(formData.amount) || 0;

  return (
    <>
      <form onSubmit={handleSubmit} className="min-h-screen bg-gray-50">
        <div className="space-y-6 mb-24">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Receipt Details <span className="ml-2 text-red-500">*</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Panel */}
              <div className="space-y-6">
                <div className="relative inline-block w-full">
  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
  >
    {selectedOption?.projectName || "Select Project"}
    <span className="float-right">
      <svg className={`w-4 h-4 inline transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </button>

  {isOpen && (
    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded max-h-60 overflow-y-auto">
      {projectCustomerList.map((project) => (
        <li
          key={project.projectId}
          onClick={async () => {
            setSelectedOption(project);
            setFormData(prev => ({
              ...prev,
              projectName: project.projectName,
              customerName: project.customerName,
              customerId: project.customerId,
              leadId: project.projectId,
            }));
            setIsOpen(false);
            // Fetch receipts for this project
            dispatch(fetchReceiptsByProject(project.projectId));
          }}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          {project.projectName}
        </li>
      ))}
    </ul>
  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name <span className="text-red-500">*</span></label>
                  <input
  type="text"
  name="customerName"
  value={formData.customerName}
  readOnly
  className={`w-full px-4 py-3 text-base border rounded-lg bg-gray-100 cursor-not-allowed ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}
  placeholder="Auto-filled from Project"
/>

                  {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date <span className="text-red-500">*</span></label>
                  <input type="date" name="receiptDate" value={formData.receiptDate} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.receiptDate ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Number <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="receiptNumber" 
                    value={formData.receiptNumber} 
                    onChange={handleChange} 
                    className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.receiptNumber ? 'border-red-500' : 'border-gray-300'}`} 
                    placeholder="e.g., REC-2025-001" 
                  />
                  {errors.receiptNumber && <p className="text-red-500 text-sm mt-1">{errors.receiptNumber}</p>}
                </div>
              </div>

              {/* Right Panel */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Received (INR) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                    <input type="number" name="amount" value={formData.amount} onChange={handleChange} step="0.01" min="0" className={`w-full pl-8 pr-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.amount ? 'border-red-500' : 'border-gray-300'}`} placeholder="0.00" />
                  </div>
                  {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method <span className="text-red-500">*</span></label>
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.paymentMethod ? 'border-red-500' : 'border-gray-300'}`}>
                    {paymentMethods.map(method => <option key={method} value={method}>{method}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Received Bank Account <span className="text-red-500">*</span></label>
                  <select name="bankAccount" value={formData.bankAccount} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.bankAccount ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select bank account</option>
                    {bankAccounts.map(account => <option key={account} value={account}>{account}</option>)}
                  </select>
                </div>
                {formData.paymentMethod === 'Cheque' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Number <span className="text-red-500">*</span></label>
                    <input type="text" name="chequeNumber" value={formData.chequeNumber} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.chequeNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter 6-digit cheque number" />
                    {errors.chequeNumber && <p className="text-red-500 text-sm mt-1">{errors.chequeNumber}</p>}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment trans. ID</label>
                  <input type="text" name="reference" value={formData.reference} onChange={handleChange} className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., Bank transaction ID" />
                </div>
              </div>
            </div>
          </div>

          {/* Attachment Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                <button type="button" className="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600">
                  Attachment
                </button>
              </nav>
            </div>
            <div className="p-6">
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Payment Proof Upload</h3>
                  <p className="text-sm text-gray-600 mb-4">Upload a photo or PDF of the payment proof for this receipt.</p>
                </div>
                
                <div className="space-y-4">
                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      isDragOver 
                        ? 'border-green-400 bg-green-50' 
                        : paymentProof 
                          ? 'border-green-300 bg-green-50' 
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDrop={handleFileDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {!paymentProof ? (
                      <div>
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Payment Proof</h3>
                        <p className="text-gray-500 mb-4">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-400">PNG, JPG, PDF up to 10MB</p>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.pdf"
                          onChange={(e) => handleFileSelect(e.target.files[0])}
                          className="hidden"
                          id="payment-proof-upload"
                        />
                        <label
                          htmlFor="payment-proof-upload"
                          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
                        >
                          <FaUpload className="w-4 h-4 mr-2" />
                          Choose File
                        </label>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-center mb-4">
                          {paymentProofPreview ? (
                            <img 
                              src={paymentProofPreview} 
                              alt="Payment proof preview" 
                              className="max-h-32 max-w-full rounded-lg"
                            />
                          ) : (
                            <FaFileAlt className="text-4xl text-gray-400" />
                          )}
                        </div>
                        <div className="mb-4">
                          <p className="font-semibold text-gray-700">{paymentProof.name}</p>
                          <p className="text-sm text-gray-500">
                            {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="inline-flex items-center px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          <FaTimes className="w-3 h-3 mr-1" />
                          Remove File
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* File Info */}
                  {paymentProof && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <FaInfoCircle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-blue-700">
                          <p className="font-semibold mb-1">File uploaded successfully!</p>
                          <p>This file will be attached to the receipt when you save.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sticky bottom-0 -mx-6 -mb-6">
          <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 border rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg flex items-center space-x-2"
              >
                <FaSave className="w-4 h-4" />
                <span>Save Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default AddReceiptForm; 