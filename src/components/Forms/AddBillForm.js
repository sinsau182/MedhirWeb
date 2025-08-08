import React, { useState, useRef, useEffect } from "react";
import { FaBuilding, FaUser, FaPlus, FaTrash, FaPaperclip, FaFilePdf, FaFileImage, FaTimes, FaSave, FaUpload, FaDownload, FaSearchPlus, FaSearchMinus } from "react-icons/fa";
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
    const [zoomLevel, setZoomLevel] = useState(1);
    const [showZoomControls, setShowZoomControls] = useState(false);
    
    const isPdf = (value) => {
        if (!value) return false;
        if (typeof value !== 'string') {
            return value.type === 'application/pdf';
        }
        const lower = value.toLowerCase();
        return lower.endsWith('.pdf') || lower.includes('application%2Fpdf') || lower.includes('content-type=application/pdf');
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!validateFile(file)) {
            return;
        }
        
        onFileUpload(file);
        setZoomLevel(1); // reset the zoom when new functionality is uploaded
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
        setZoomLevel(1);
        setShowZoomControls(false);
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
                setZoomLevel(1);
            }
        }
    };

    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoomLevel(prev => Math.max(prev - 0.25, 0.25));
    };

    const handleDownload = () => {
        if (!uploadedImage) return;
        
        const url = typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage);
        const link = document.createElement('a');
        link.href = url;
        link.download = uploadedImage.name || 'bill-document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (typeof uploadedImage !== 'string') {
            URL.revokeObjectURL(url);
        }
    };

    const handleImageLoad = () => {
        setShowZoomControls(true);
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
                
               
              
                {uploadedImage ? (
                    <div className="flex flex-col items-center w-full h-full">
                        <div className="flex-1 flex items-center justify-center w-full relative overflow-hidden">
                            {isPdf(uploadedImage) ? (
                                <div className="relative w-full h-full flex flex-col">
                                    <div className="absolute top-2 right-2 flex gap-2 z-10">
                                        <button
                                            onClick={handleRemoveClick}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                                            title="Remove file"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-colors"
                                            title="Download file"
                                        >
                                            <FaDownload size={14} />
                                        </button>
                                    </div>
                                    <div className="w-full h-full flex items-center justify-center">
                                        <iframe 
                                            src={typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage)}
                                            className="w-full h-full border-0 rounded-md shadow-sm"
                                            title="PDF Preview"
                                            onLoad={() => setShowZoomControls(true)}
                                        />
                                    </div>
                                    {showZoomControls && (
                                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
                                            <span className="px-2 py-1 text-sm text-gray-600 font-medium">
                                                PDF Document
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <img 
                                        src={typeof uploadedImage === 'string' ? uploadedImage : URL.createObjectURL(uploadedImage)} 
                                        alt="Uploaded Bill" 
                                        className="max-w-full max-h-full object-contain rounded-md shadow-sm transition-transform duration-200" 
                                        style={{ transform: `scale(${zoomLevel})` }}
                                        onLoad={handleImageLoad}
                                    />
                                    {showZoomControls && (
                                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
                                                className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                                                title="Zoom Out"
                                                disabled={zoomLevel <= 0.25}
                                            >
                                                <FaSearchMinus size={14} className={zoomLevel <= 0.25 ? 'text-gray-400' : 'text-gray-600'} />
                                            </button>
                                            <span className="px-2 py-1 text-sm text-gray-600 font-medium">
                                                {Math.round(zoomLevel * 100)}%
                                            </span>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
                                                className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                                                title="Zoom In"
                                                disabled={zoomLevel >= 3}
                                            >
                                                <FaSearchPlus size={14} className={zoomLevel >= 3 ? 'text-gray-400' : 'text-gray-600'} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <button
                                            onClick={handleRemoveClick}
                                            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                                            title="Remove file"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 text-center">
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

//const mockCompanies = [
//  {
//    id: 1,
//    name: "ABC Pvt Ltd",
//    gstin: "27DEFGH5678I2A6",
//    departments: ["IT Department", "Finance", "HR"],
//  },
//  {
//    id: 2,
//    name: "DEF Solutions",
//    gstin: "29LMNOP1234Q5Z6",
//    departments: ["Operations", "Sales"],
//  },
//];

const BillForm = ({ bill, onCancel }) => {
  const companyId = sessionStorage.getItem("employeeCompanyId");
  const dispatch = useDispatch();
  const isEditMode = !!bill;
  const fileInputRef = useRef(null);
  const mainCardRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    dispatch(fetchVendors());
  }, [dispatch]);
  const { vendors, loading, error: vendorError } = useSelector((state) => state.vendors);

  //const [companies] = useState(mockCompanies);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [billNumber, setBillNumber] = useState("");
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [reference, setReference] = useState("");
  const [billLines, setBillLines] = useState([{ item: '', hsn: '', qty: 1, uom: 'PCS', rate: 0, gst: 18, cgst: 9, sgst: 9, igst: 18 }]);
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('billLines');
  const [vendorCredits, setVendorCredits] = useState([]);
  const [placeOfSupply, setPlaceOfSupply] = useState('interstate');
  // Add state for projectType
  const [projectType, setProjectType] = useState([]); // NEW

  // Pre-fill form data when bill prop is provided (edit mode)
  useEffect(() => {
    if (bill) {
      setBillNumber(bill.billNumber || '');
      setBillDate(bill.billDate || new Date().toISOString().slice(0, 10));
      setDueDate(bill.dueDate || '');
      setReference(bill.billReference || '');
      setPlaceOfSupply(bill.placeOfSupply || 'interstate');
      
      if (bill.billLineItems && bill.billLineItems.length > 0) {
        const mappedLines = bill.billLineItems.map(line => ({
          item: line.productOrService || '',
          hsn: line.hsnOrSac || '',
          qty: line.quantity || 1,
          uom: line.uom || 'PCS',
          rate: line.rate || 0,
          gst: line.gstPercent || 18,
          cgst: line.cgstPercent || 9,
          sgst: line.sgstPercent || 9,
          igst: line.igstPercent || 18
        }));
        setBillLines(mappedLines);
      } else {
        setBillLines([{ item: '', hsn: '', qty: 1, uom: 'PCS', rate: 0, gst: 18, cgst: 9, sgst: 9, igst: 18 }]);
      }
      
      // Auto-load first attachment into preview if present
      try {
        const attachmentSource = bill.attachmentUrls;
        let firstUrl = null;
        if (Array.isArray(attachmentSource) && attachmentSource.length > 0) {
          firstUrl = attachmentSource[0];
        } else if (typeof attachmentSource === 'string' && attachmentSource.trim().length > 0 && attachmentSource !== 'Yes') {
          firstUrl = attachmentSource;
        }
        if (firstUrl) {
          setUploadedImage(firstUrl);
          setUploadedFile(null);
        }
      } catch (e) {
        // Ignore attachment preload errors
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
  
  const handleFileUpload = (file) => {
        if (!file) return;
        
        setError(null);
        setUploadedFile(file);
        setUploadedImage(file);
        
        console.log(' File uploaded successfully:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
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
  const totalCGST = billLines.reduce((sum, l) => sum + l.qty * l.rate * (l.cgst / 100), 0);
  const totalSGST = billLines.reduce((sum, l) => sum + l.qty * l.rate * (l.sgst / 100), 0);
  const totalIGST = billLines.reduce((sum, l) => sum + l.qty * l.rate * (l.igst / 100), 0);
  const total = placeOfSupply === 'interstate' ? subtotal + totalCGST + totalSGST : subtotal + totalIGST;

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

  //const handleCompanyChange = (e) => {
  //  const c = companies.find((c) => c.id === Number(e.target.value));
  //  setSelectedCompany(c);
  //  setSelectedDepartment("");
  //};

  const handleDepartmentChange = (e) => {
    setSelectedDepartment(e.target.value);
  };

  const handleLineChange = (idx, field, value) => {
    setBillLines((previousLines) => {
      const updatedLines = [...previousLines];
      const line = { ...updatedLines[idx] };
      if (field === 'gst') {
        const gstValue = Number(value) || 0;
        line.gst = gstValue;
        if (placeOfSupply === 'interstate') {
          // Split equally between CGST and SGST, no IGST
          line.cgst = gstValue / 2;
          line.sgst = gstValue / 2;
          line.igst = 0;
        } else {
          // Use IGST only
          line.igst = gstValue;
          line.cgst = 0;
          line.sgst = 0;
        }
      } else {
        line[field] = value;
      }
      updatedLines[idx] = line;
      return updatedLines;
    });
  };

  const handleAddLine = () => {
    setBillLines((prev) => [...prev, { item: '', hsn: '', qty: 1, uom: 'PCS', rate: 0, gst: 18, cgst: 9, sgst: 9, igst: 18 }]);
  };

  const handleDeleteLine = (idx) => {
    setShowDeleteIdx(idx);
  };

  const confirmDeleteLine = () => {
    setBillLines((lines) => lines.filter((_, i) => i !== showDeleteIdx));
    setShowDeleteIdx(null);
  };

  const cancelDeleteLine = () => setShowDeleteIdx(null);

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

  // Add handler for project type checkbox
  const handleProjectTypeChange = (type) => {
    setProjectType(prev => {
      const exists = prev.includes(type);
      return exists ? prev.filter(t => t !== type) : [...prev, type];
    });
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
      //gstin: selectedVendor?.gstin || "",
      //vendorAddress: selectedVendor?.addressLine1 || "",
      tdsPercentage: selectedVendor?.tdsPercentage || null,
      placeOfSupply: placeOfSupply,
      billNumber: billNumber,
      billReference: reference,
      billDate: billDate,
      dueDate: dueDate,
      projectType: projectType, // Add projectType to billData
      billLineItems: billLines.map(line => {
        const qty = Number(line.qty) || 0;
        const rate = Number(line.rate) || 0;
        const gst = Number(line.gst) || 18;
        const cgst = Number(line.cgst) || 9;
        const sgst = Number(line.sgst) || 9;
        const igst = Number(line.igst) || 18;
        const amount = qty * rate;
        const gstAmount = amount * (gst / 100);
        const cgstAmount = amount * (cgst / 100);
        const sgstAmount = amount * (sgst / 100);
        const igstAmount = amount * (igst / 100);
        const totalAmount = amount + (placeOfSupply === 'interstate' ? cgstAmount + sgstAmount : igstAmount);
        
        return {
          productOrService: line.item,
          description: line.item,
          hsnOrSac: line.hsn,
          quantity: qty,
          uom: line.uom,
          rate: rate,
          amount: amount,
          gstPercent: gst,
          cgstPercent: cgst,
          sgstPercent: sgst,
          igstPercent: igst,
          gstAmount: gstAmount,
          cgstAmount: cgstAmount,
          sgstAmount: sgstAmount,
          igstAmount: igstAmount,
          totalAmount: totalAmount
        };
      }),
      totalBeforeGST: subtotal,
      totalGST: totalGST,
      totalCGST: totalCGST,
      totalSGST: totalSGST,
      totalIGST: totalIGST,
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
        
        // Add uploaded file if exists
        if (uploadedFile) {
          formData.append('attachment', uploadedFile);
        }
        
        const result = await dispatch(updateBill({ formData, billId: bill.billId || bill.id })).unwrap();
        if (result) {
          console.log('Bill updated successfully:', result);
          onCancel();
        }
      } else {
        const formData = new FormData();
        formData.append('bill', JSON.stringify(billData));
        
        // Add uploaded file if exists
        if (uploadedFile) {
          formData.append('attachment', uploadedFile);
        }
        
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
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center">
                      <input type="checkbox" checked={projectType.includes('Project')} onChange={() => handleProjectTypeChange('Project')} className="form-checkbox" />
                      <span className="ml-2">Project</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input type="checkbox" checked={projectType.includes('Non Project')} onChange={() => handleProjectTypeChange('Non Project')} className="form-checkbox" />
                      <span className="ml-2">Non Project</span>
                    </label>
                  </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor GSTIN</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                    value={selectedVendor?.gstin || ""} 
                    placeholder="Auto-filled from vendor"
                    readOnly 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Place of Supply</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={placeOfSupply}
                    onChange={(e) => {
                      const newPlaceOfSupply = e.target.value;
                      setPlaceOfSupply(newPlaceOfSupply);
                      
                      // Update line items based on place of supply
                      if (newPlaceOfSupply === 'intrastate') {
                        // Convert CGST + SGST to IGST
                         setBillLines(prev => prev.map(line => {
                           const igst = (Number(line.cgst) + Number(line.sgst)) || 0;
                           return {
                             ...line,
                             igst,
                             cgst: 0,
                             sgst: 0,
                             gst: igst,
                           };
                         }));
                      } else {
                        // Convert IGST to CGST and SGST (split equally)
                         setBillLines(prev => prev.map(line => {
                           const total = Number(line.igst) || 0;
                           return {
                             ...line,
                             cgst: total / 2,
                             sgst: total / 2,
                             igst: 0,
                             gst: total,
                           };
                         }));
                      }
                    }}
                  >
                    <option value="interstate">Interstate</option>
                    <option value="intrastate">Intrastate</option>
                  </select>
                </div>
                {/*<div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                    value={selectedVendor?.gstin || ""} 
                    placeholder="Auto-filled from vendor"
                    readOnly 
                  />
                </div>*/}
                {/*<div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none" 
                    value={selectedVendor?.addressLine1 || ""} 
                    placeholder="Auto-filled from vendor"
                    rows={3}
                    readOnly 
                  />
                </div>*/}
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
                          <th className="w-[25%] px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">UOM</th>
                          <th className="w-[12%] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">GST%</th>
                          <th className="w-[15%] px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                          <th className="w-[10%] px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {billLines.map((line, idx) => {
                          const qty = Number(line.qty) || 0;
                          const rate = Number(line.rate) || 0;
                          const gst = Number(line.gst) || 18;
                          const cgst = Number(line.cgst) || 9;
                          const sgst = Number(line.sgst) || 9;
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
                              <td className="px-4 py-3 text-center">
                                <select
                                  className="w-full text-center bg-transparent p-2 rounded-md focus:bg-white focus:ring-1 focus:ring-blue-500"
                                  value={line.gst}
                                  onChange={e => handleLineChange(idx, 'gst', Number(e.target.value))}
                                >
                                  <option value={0}>0%</option>
                                  <option value={5}>5%</option>
                                  <option value={12}>12%</option>
                                  <option value={18}>18%</option>
                                  <option value={28}>28%</option>
                                </select>
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
                    
                    {placeOfSupply === 'interstate' ? (
                      <>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-700">CGST:</span>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">₹</span>
                            <input
                              type="number"
                              className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={totalCGST.toFixed(2)}
                              onChange={(e) => {
                                const newCGST = parseFloat(e.target.value) || 0;
                                // Update all line items to reflect the new CGST total
                                const cgstPerLine = newCGST / billLines.length;
                                setBillLines(prev => prev.map(line => {
                                  const lineAmount = Number(line.qty) * Number(line.rate);
                                  return {
                                    ...line,
                                    cgst: lineAmount > 0 ? (cgstPerLine / lineAmount) * 100 : 0
                                  };
                                }));
                              }}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-700">SGST:</span>
                          <div className="flex items-center">
                            <span className="text-gray-500 mr-1">₹</span>
                            <input
                              type="number"
                              className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={totalSGST.toFixed(2)}
                              onChange={(e) => {
                                const newSGST = parseFloat(e.target.value) || 0;
                                // Update all line items to reflect the new SGST total
                                const sgstPerLine = newSGST / billLines.length;
                                setBillLines(prev => prev.map(line => {
                                  const lineAmount = Number(line.qty) * Number(line.rate);
                                  return {
                                    ...line,
                                    sgst: lineAmount > 0 ? (sgstPerLine / lineAmount) * 100 : 0
                                  };
                                }));
                              }}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700">IGST:</span>
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">₹</span>
                          <input
                            type="number"
                            className="w-24 text-right bg-white border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={totalIGST.toFixed(2)}
                            onChange={(e) => {
                              const newIGST = parseFloat(e.target.value) || 0;
                              // Update all line items to reflect the new IGST total
                              const igstPerLine = newIGST / billLines.length;
                              setBillLines(prev => prev.map(line => {
                                const lineAmount = Number(line.qty) * Number(line.rate);
                                return {
                                  ...line,
                                  igst: lineAmount > 0 ? (igstPerLine / lineAmount) * 100 : 0
                                };
                              }));
                            }}
                            min="0"
                            step="0.01"
                          />
                        </div>
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