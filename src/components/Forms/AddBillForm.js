import React, { useState, useRef, useEffect } from "react";
import { FaBuilding, FaUser, FaPlus, FaTrash, FaPaperclip, FaFilePdf, FaFileImage, FaTimes, FaSave, FaUpload } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors, updateVendorCredit } from "../../redux/slices/vendorSlice";
import { addBill, updateBill } from "../../redux/slices/BillSlice";
import { toast } from 'sonner';

const AutoGrowTextarea = ({ className, ...props }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
      if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
  }, [props.value]);

  return (
      <textarea
          ref={textareaRef}
          rows="1"
          className={`${className} resize-none overflow-hidden`}
          {...props}
      />
  );
};

const BillUploadUI = ({ onFileUpload, uploadedImage, error, onRemoveFile }) => {
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
                                    alt="Uploaded Bill" 
                                    className="max-w-full max-h-full object-contain rounded-md shadow-sm" 
                                />
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <span className="text-green-600 font-semibold">✅ File uploaded successfully</span>
                            <p className="text-sm text-gray-500 mt-1">Click to upload a different file</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center">
                        <FaUpload className="text-gray-400 text-4xl mb-4" />
                        <span className="font-semibold text-gray-700 text-lg">Click to upload a bill</span>
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

const mockCompanies = [
  {
    id: 1,
    name: "ABC Pvt Ltd",
    gstin: "27DEFGH5678I2A6",
    departments: ["IT Department", "Finance", "HR"],
  },
  {
    id: 2,
    name: "DEF Solutions",
    gstin: "29LMNOP1234Q5Z6",
    departments: ["Operations", "Sales"],
  },
];

const BillForm = ({ bill, onCancel }) => {
  const companyId = sessionStorage.getItem("employeeCompanyId");
  const dispatch = useDispatch();
  const isEditMode = !!bill;
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);
  const { vendors, loading, error: vendorError } = useSelector((state) => state.vendors);

  const [companies] = useState(mockCompanies);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [billLines, setBillLines] = useState([{ item: '', hsn: '', qty: 1, uom: 'PCS', rate: 0, gst: 18 }]);
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('billLines');

  // Pre-fill form data when bill prop is provided (edit mode)
  useEffect(() => {
    if (bill) {
      setBillNumber(bill.billNumber || '');
      setBillDate(bill.billDate || new Date().toISOString().slice(0, 10));
      setDueDate(bill.dueDate || '');
      setReference(bill.billReference || '');
      
      if (bill.billLineItems && bill.billLineItems.length > 0) {
        const mappedLines = bill.billLineItems.map(line => ({
          item: line.productOrService || '',
          hsn: line.hsnOrSac || '',
          qty: line.quantity || 1,
          uom: line.uom || 'PCS',
          rate: line.rate || 0,
          gst: 18
        }));
        setBillLines(mappedLines);
      } else {
        setBillLines([{ item: '', hsn: '', qty: 1, uom: 'PCS', rate: 0, gst: 18 }]);
      }
      
      if (bill.vendorId && vendors.length > 0) {
        const vendor = vendors.find(v => v.vendorId === bill.vendorId);
        if (vendor) {
          setSelectedVendor(vendor);
        }
      }
    }
  }, [bill, vendors]);

  useEffect(() => {
    if (!selectedVendor) {
      setActiveTab('billLines');
    }
  }, [selectedVendor]);
  
  const [attachments, setAttachments] = useState([]);
  const [previewFile, setPreviewFile] = useState(null);
  const inputRef = useRef(null);
  const mainCardRef = useRef(null);
  const [vendorCredits, setVendorCredits] = useState([]);

  const handleFileUpload = (file) => {
        if (!file) return;
        
        setError(null);
        setUploadedFile(file);
        setUploadedImage(file);
        
        console.log('✅ File uploaded successfully:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    };

  const handleRemoveFile = () => {
        setUploadedImage(null);
        setUploadedFile(null);
        setError(null);
        toast.success('File removed successfully');
    };

  // Calculate totals
  const subtotal = billLines.reduce((sum, l) => sum + l.qty * l.rate, 0);
  const totalGST = billLines.reduce((sum, l) => sum + l.qty * l.rate * (l.gst / 100), 0);
  const tdsAmount = selectedVendor && selectedVendor.tdsPercentage ? (subtotal + totalGST) * (selectedVendor.tdsPercentage / 100) : 0;
  const total = subtotal + totalGST - tdsAmount;

  // Validation helpers
  const validate = () => {
    const errs = {};
    if (!selectedVendor) errs.vendor = "Vendor is required";
    if (!billNumber) errs.billNumber = "Bill Number is required";
    if (!billDate) errs.billDate = "Bill Date is required";
    if (!billLines.length) errs.billLines = "At least one line item required";
    billLines.forEach((l, i) => {
      if (!l.item) errs[`item${i}`] = "Description required";
      if (!l.qty || l.qty <= 0) errs[`qty${i}`] = "Qty must be positive";
      if (!l.rate || l.rate <= 0) errs[`rate${i}`] = "Rate must be positive";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

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

  const handleCompanyChange = (e) => {
    const c = companies.find((c) => c.id === Number(e.target.value));
    setSelectedCompany(c);
    setSelectedDepartment("");
  };

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleLineChange = (idx, field, value) => {
    setBillLines((prev) => prev.map((line, i) => i === idx ? { ...line, [field]: value } : line));
  };

  const handleAddLine = () => {
    setBillLines((prev) => [...prev, { item: '', hsn: '', qty: 1, uom: 'PCS', rate: 0, gst: 18 }]);
  };

  const handleDeleteLine = (idx) => {
    setShowDeleteIdx(idx);
  };

  const confirmDeleteLine = () => {
    setBillLines((lines) => lines.filter((_, i) => i !== showDeleteIdx));
    setShowDeleteIdx(null);
  };

  const cancelDeleteLine = () => setShowDeleteIdx(null);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.filter(f => /pdf|jpg|jpeg|png/i.test(f.type));
    setAttachments(prev => [...prev, ...allowed]);
  };

  const handleRemoveAttachment = (idx) => {
    setAttachments(prev => prev.filter((_, i) => i !== idx));
  };

  const handlePreviewAttachment = (file) => {
    setPreviewFile(file);
  };

  const handleAddVendorCredit = () => {
    setVendorCredits(prev => [...prev, { id: Date.now(), creditDate: new Date().toISOString().slice(0, 10), creditAmount: '', creditDescription: '' }]);
  };

  const handleVendorCreditChange = (id, field, value) => {
    setVendorCredits(prev => prev.map(vc =>
      vc.id === id ? { ...vc, [field]: value } : vc
    ));
  };

  const handleRemoveVendorCredit = (id) => {
    setVendorCredits(prev => prev.filter(vc => vc.id !== id));
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validate()) {
      console.log("Validation failed");
      console.log(errors);
      return;
    }

    setIsSubmitting(true);

    const billData = {
      companyId: companyId,
      vendorId: selectedVendor?.vendorId,
      gstin: selectedVendor?.gstin || "",
      vendorAddress: selectedVendor?.addressLine1 || "",
      tdsPercentage: selectedVendor?.tdsPercentage || null,
      billNumber: billNumber,
      billReference: reference,
      billDate: billDate,
      dueDate: dueDate,
      billLineItems: billLines.map(line => {
        const qty = Number(line.qty) || 0;
        const rate = Number(line.rate) || 0;
        const gst = 18;
        const amount = qty * rate;
        const gstAmount = amount * (gst / 100);
        const totalAmount = amount + gstAmount;
        
        return {
          productOrService: line.item,
          description: line.item,
          hsnOrSac: line.hsn,
          quantity: qty,
          uom: line.uom,
          rate: rate,
          amount: amount,
          gstPercent: gst,
          gstAmount: gstAmount,
          totalAmount: totalAmount
        };
      }),
      totalBeforeGST: subtotal,
      totalGST: totalGST,
      tdsApplied: selectedVendor && selectedVendor.tdsPercentage ? tdsAmount : null,
      finalAmount: total
    };

    try {
      if (isEditMode) {
        const updateData = {
          ...billData,
          billId: bill.billId || bill.id,
          updatedAt: new Date().toISOString()
        };
        
        const formData = new FormData();
        formData.append('bill', JSON.stringify(updateData));
        
        attachments.forEach((file, index) => {
          formData.append('attachment', file);
        });
        
        const result = await dispatch(updateBill({ formData, billId: bill.billId || bill.id })).unwrap();
        if (result) {
          console.log('Bill updated successfully:', result);
          onCancel();
        }
      } else {
        const formData = new FormData();
        formData.append('bill', JSON.stringify(billData));
        
        attachments.forEach((file, index) => {
          formData.append('attachment', file);
        });
        
        const result = await dispatch(addBill(formData)).unwrap();
        if (result) {
          console.log('Bill created successfully:', result);
          onCancel();
        }
      }
    } catch (error) {
      console.error('Error saving bill:', error);
      alert(`Error saving bill: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorCreditSubmit = () => {
    console.log(vendorCredits);
    dispatch(updateVendorCredit({vendorId: selectedVendor.vendorId, vendorCredits: vendorCredits}));
  }

  console.log(selectedVendor);

  // Render
  return (
    <div className="w-full h-screen flex flex-col bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 flex-1 min-h-0 border border-gray-200 rounded-t-lg overflow-hidden shadow-sm relative">
        {/* Form Panel (Left) */}
        <div className="lg:col-span-1 overflow-y-auto p-6 border-r border-gray-200 pb-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Edit Bill' : 'Add New Bill'}
            </h2>
          </div>
          
          {/* Form Content */}
          <div className="space-y-6 pb-6" ref={mainCardRef}>
            {/* Top Section - Vendor, Bill, and Company Details */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Vendor Details */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaUser className="text-gray-400" /> Vendor Details
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vendor Name <span className="text-red-500">*</span>
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    value={selectedVendor?.vendorId || ""} 
                    onChange={handleVendorChange}
                  >
                    <option value="">Select Vendor</option>
                    {vendors.map((v) => (
                      <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                    ))}
                  </select>
                  {errors.vendor && <div className="text-xs text-red-500 mt-1">{errors.vendor}</div>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                    value={selectedVendor?.gstin || ""} 
                    placeholder="Auto-filled from vendor"
                    readOnly 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                    value={selectedVendor?.addressLine1 || ""} 
                    placeholder="Auto-filled from vendor"
                    rows={3}
                    readOnly 
                  />
                </div>
              </div>

              {/* Bill Details */}
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaPaperclip className="text-gray-400" /> Bill Details
                  </h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bill Number <span className="text-red-500">*</span>
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="Enter bill number" 
                    value={billNumber} 
                    onChange={e => setBillNumber(e.target.value)} 
                  />
                  {errors.billNumber && <div className="text-xs text-red-500 mt-1">{errors.billNumber}</div>}
                </div>
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bill Date <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={billDate} 
                      onChange={e => setBillDate(e.target.value)} 
                    />
                    {errors.billDate && <div className="text-xs text-red-500 mt-1">{errors.billDate}</div>}
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input 
                      type="date" 
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                      value={dueDate} 
                      onChange={e => setDueDate(e.target.value)} 
                      min={billDate} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
                    placeholder="PO/Reference number" 
                    value={reference} 
                    onChange={e => setReference(e.target.value)} 
                  />
                </div>
                <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 mt-2">
                  {selectedVendor && selectedVendor.tdsPercentage && (
                    <div className="text-sm text-gray-600 mb-2">
                      TDS Applied: {selectedVendor.tdsPercentage}%
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex">
                <button 
                  type="button" 
                  className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === 'billLines' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`} 
                  onClick={() => setActiveTab('billLines')}
                >
                  Bill Lines
                </button>
                <button 
                  type="button" 
                  className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === 'attachments' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`} 
                  onClick={() => setActiveTab('attachments')}
                >
                  Attachments
                </button>
                {selectedVendor && <button
                  type="button"
                  className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === 'vendorCredit'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('vendorCredit')}
                >
                  Vendor Credit
                </button>}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              {activeTab === 'billLines' && (
                <div className="space-y-6">
                  {errors.billLines && <div className="text-xs text-red-500">{errors.billLines}</div>}
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                      <tr className="border-b border-gray-200">
                          <th className="w-[8%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sr. No.</th>
                          <th className="w-[30%] px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="w-[15%] px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">HSN Code</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="w-[12%] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                          <th className="w-[15%] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {billLines.map((line, idx) => {
                          const qty = Number(line.qty) || 0;
                          const rate = Number(line.rate) || 0;
                          const gst = 18;
                          const amount = qty * rate;
                          const gstAmount = amount * (gst / 100);
                          const total = amount + gstAmount;
                          return (
                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 text-center text-sm font-medium">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3">
                                <AutoGrowTextarea 
                                  className={`w-full bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 ${errors[`item${idx}`] ? 'ring-red-500' : 'focus:ring-blue-500'}`} 
                                  value={line.item} 
                                  onChange={e => handleLineChange(idx, 'item', e.target.value)} 
                                  placeholder="Enter description"
                                />
                                {errors[`item${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`item${idx}`]}</div>}
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  className={`w-full bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-500`}
                                  value={line.hsn}
                                  onChange={e => handleLineChange(idx, 'hsn', e.target.value)}
                                  placeholder="HSN Code"
                                />
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input 
                                  type="text" 
                                  className={`w-full text-center bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 ${errors[`qty${idx}`] ? 'ring-red-500' : 'focus:ring-blue-500'}`} 
                                  value={line.qty} 
                                  onChange={e => handleLineChange(idx, 'qty', e.target.value)} 
                                  placeholder="1"
                                />
                                {errors[`qty${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`qty${idx}`]}</div>}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <input
                                  className={`w-full text-center bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-500`}
                                  value={line.uom}
                                  onChange={e => handleLineChange(idx, 'uom', e.target.value)}
                                  placeholder="PCS"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end">
                                  <span className="text-gray-500 mr-0.5">₹</span>
                                  <input 
                                    type="text" 
                                    className={`w-full text-right bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 ${errors[`rate${idx}`] ? 'ring-red-500' : 'focus:ring-blue-500'}`}
                                    value={line.rate} 
                                    onChange={e => handleLineChange(idx, 'rate', e.target.value)} 
                                    placeholder="0"
                                  />
                                </div>
                                {errors[`rate${idx}`] && <div className="text-xs text-red-500 mt-1">{errors[`rate${idx}`]}</div>}
                              </td>
                              <td className="px-4 py-3 text-right text-sm font-semibold">
                                ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <button 
                                  type="button" 
                                  className="text-red-500 hover:text-red-700 transition-colors" 
                                  onClick={() => handleDeleteLine(idx)}
                                >
                                  <FaTrash />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan="8" className="pt-4">
                            <button 
                              type="button" 
                              onClick={handleAddLine}
                              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <FaPlus /> Add line item
                            </button>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="bg-gray-50 rounded-lg mt-6 p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">Subtotal (before GST):</span>
                      <span className="text-gray-900 font-medium">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-700">Total GST:</span>
                      <span className="text-gray-900 font-medium">₹{totalGST.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {selectedVendor && selectedVendor.tdsPercentage && (
                      <div className="flex justify-between items-center mb-1 text-red-600">
                        <span className="font-medium">TDS/TCS Deducted ({selectedVendor?.tdsPercentage}%):</span>
                        <span className="font-medium">- ₹{tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <hr className="my-2" />
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-lg">Final Amount:</span>
                      <span className="font-bold text-lg">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'attachments' && (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <label htmlFor="attachment-upload" className="flex flex-col items-center justify-center cursor-pointer">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2">
                      <FaPaperclip className="text-2xl text-blue-500" />
                    </div>
                    <button
                      type="button"
                      className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium flex items-center gap-2 mb-2 hover:bg-blue-200 transition-colors"
                      onClick={e => {
                        e.preventDefault();
                        if (inputRef.current) inputRef.current.click();
                      }}
                    >
                      <FaPlus className="text-2xl" /> <span className="text-base">Add Attachment</span>
                    </button>
                    <input
                      id="attachment-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      className="hidden"
                      onChange={handleAttachmentChange}
                      ref={inputRef}
                    />
                  </label>
                  <div className="text-sm text-gray-400 mb-6">PDF, JPG, PNG allowed</div>
                  <div className="w-full max-w-xl">
                    {attachments.length > 0 && (
                      <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow p-4">
                        {attachments.map((file, idx) => (
                          <li key={idx} className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handlePreviewAttachment(file)}>
                              {/pdf/i.test(file.type) ? (
                                <span className="text-red-500"><FaFilePdf /></span>
                              ) : (
                                <span className="text-blue-500"><FaFileImage /></span>
                              )}
                              <span className="text-gray-800 font-medium text-sm truncate max-w-xs">{file.name}</span>
                            </div>
                            <button type="button" className="text-red-500 hover:text-red-700 ml-4" onClick={() => handleRemoveAttachment(idx)}>
                              <FaTimes />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {/* Preview Modal */}
                  {previewFile && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full relative">
                        <button className="absolute top-2 right-2 text-gray-500 hover:text-red-500" onClick={() => setPreviewFile(null)}><FaTimes size={20} /></button>
                        <div className="flex flex-col items-center">
                          <div className="mb-4 text-lg font-semibold text-gray-800">{previewFile.name}</div>
                          {/pdf/i.test(previewFile.type) ? (
                            <iframe src={URL.createObjectURL(previewFile)} className="w-full h-96 border rounded" title="PDF Preview"></iframe>
                          ) : (
                            <img src={URL.createObjectURL(previewFile)} alt="Preview" className="max-h-96 rounded border" />
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'vendorCredit' && (
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full table-fixed">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="w-2/4 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="w-1/4 px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vendorCredits.map((credit) => (
                          <tr key={credit.id}>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                placeholder="0.00"
                                value={credit.creditAmount}
                                onChange={(e) => handleVendorCreditChange(credit.id, 'creditAmount', e.target.value)}
                                className="w-full bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                placeholder="Credit description"
                                value={credit.creditDescription}
                                onChange={(e) => handleVendorCreditChange(credit.id, 'creditDescription', e.target.value)}
                                className="w-full bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <button
                                type="button"
                                onClick={() => handleRemoveVendorCredit(credit.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="mt-6 px-4 py-4">
                        <tr>
                          <td colSpan={3}>
                            <div className="flex justify-between items-center">
                              <button
                                type="button"
                                onClick={handleAddVendorCredit}
                                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium ml-4"
                              >
                                <FaPlus /> Add Vendor Credit
                              </button>
                              <button
                                type="button"
                                onClick={handleVendorCreditSubmit}
                                className="flex items-center gap-2 text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
                              >
                                <FaSave /> Save Vendor Credit
                              </button>
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  {vendorCredits.length === 0 && (
                    <div className="text-center py-16 text-gray-500">
                      <p>No vendor credits have been added yet.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upload Panel (Right) */}
        <div className="lg:col-span-1 overflow-y-auto bg-gray-50 p-6 pb-24">
          <BillUploadUI 
            onFileUpload={handleFileUpload}
            uploadedImage={uploadedImage}
            error={error}
            onRemoveFile={handleRemoveFile}
          />
        </div>

        {/* Sticky Footer integrated within form container */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-6 py-4 rounded-b-lg shadow-sm z-10">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">
              Total Bill Amount: <span className="text-blue-600">₹{total.toLocaleString('en-IN')}</span>
              {isEditMode && <span className="text-sm text-gray-500 ml-2">(Edit Mode)</span>}
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                className={`px-6 py-2 border border-gray-300 rounded-lg transition-colors ${
                  isSubmitting 
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Discard
              </button>
              <button 
                type="button" 
                className={`px-6 py-2 rounded-lg transition-colors font-medium ${
                  isSubmitting 
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (isEditMode ? 'Update & Validate' : 'Confirm & Validate')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteIdx !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTrash className="text-red-600 text-xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Line Item</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this line item? This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <button 
                  type="button" 
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" 
                  onClick={cancelDeleteLine}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" 
                  onClick={confirmDeleteLine}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillForm;