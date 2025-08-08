import { useState, useRef, useEffect } from 'react';
import { FaBuilding, FaPaperclip, FaPlus, FaTrash, FaShippingFast, FaFilePdf, FaFileImage, FaTimes } from 'react-icons/fa';
import PurchaseOrderPreview from '../Previews/PurchaseOrderPreview';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { fetchCompanies } from '../../redux/slices/companiesSlice';
import { createPurchaseOrder, updatePurchaseOrder, getNextPurchaseOrderNumber, generateNextPurchaseOrderNumber } from '../../redux/slices/PurchaseOrderSlice';

const AddPurchaseOrderForm = ({ onSubmit, onCancel, mode = 'add', initialData = null }) => {
  const companyId = sessionStorage.getItem('employeeCompanyId');
  const dispatch = useDispatch();
  const { vendors, loading: vendorsLoading, error } = useSelector((state) => state.vendors);
  const { companies, loading: companiesLoading } = useSelector((state) => state.companies);
  const { nextPurchaseOrderNumber, loading: poNumberLoading, error: poNumberError } = useSelector((state) => state.purchaseOrders);

  useEffect(() => {
    dispatch(fetchVendors());
    dispatch(fetchCompanies());
  }, [dispatch]);

  useEffect(() => {
    if (mode === 'add' && companyId) {
      dispatch(getNextPurchaseOrderNumber(companyId)).then((action) => {
        if (action.payload && action.payload.nextPurchaseOrderNumber) {
          setFormData((prev) => ({ ...prev, poNumber: action.payload.nextPurchaseOrderNumber }));
        }
      });
    }
  }, [dispatch, mode, companyId]);

  // Transform API data to form format for edit mode
  const transformApiDataToFormData = (apiData) => {
    if (!apiData) return null;
    
    return {
      poNumber: apiData.purchaseOrderNumber || `PO-${Date.now().toString().slice(-6)}`,
      vendor: null, // Will be set when vendors are loaded
      orderDate: apiData.purchaseOrderDate || new Date().toISOString().split('T')[0],
      deliveryDate: apiData.purchaseOrderDeliveryDate || '',
      notes: apiData.notes || '',
      company: null, // Will be set based on company address
      shippingAddress: apiData.companyAddress || '',
      items: apiData.purchaseOrderLineItems ? apiData.purchaseOrderLineItems.map((item, index) => ({
        id: index + 1,
        itemName: item.itemName || '',
        description: item.description || '',
        //hsnCode: item.hsnOrSac || '',
        quantity: item.quantity || 1,
        rate: item.rate || 0,
        unit: item.uom || 'PCS'
      })) : [{
        id: 1,
        itemName: 'Sample Item',
        description: 'A sample item for this PO.',
        //hsnCode: '998877',
        quantity: 2,
        unit: 'PCS'
      }],
      attachments: []
    };
  };

  const [formData, setFormData] = useState(() => {
    if (mode === 'edit' && initialData) {
      return transformApiDataToFormData(initialData);
    }
    return {
      poNumber: `PO-${Date.now().toString().slice(-6)}`,
      vendor: null,
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      notes: '',
      company: null,
      shippingAddress: '',
      items: [{
        id: 1,
        itemName: 'Sample Item',
        description: 'A sample item for this PO.',
        //hsnCode: '998877',
        quantity: 2,
        unit: 'PCS'
      }],
      attachments: []
    };
  });

  const [errors, setErrors] = useState({});
  const [showDeleteIdx, setShowDeleteIdx] = useState(null);
  const [activeTab, setActiveTab] = useState('poItems');
  const [previewFile, setPreviewFile] = useState(null);
  const inputRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // Set selected vendor when vendors are loaded and we're in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && vendors.length > 0) {
      const vendor = vendors.find(v => v.vendorId === initialData.vendorId);
      setSelectedVendor(vendor);
    }
  }, [mode, initialData, vendors]);

  // Set company when in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData && initialData.companyAddress && companies && companies.length > 0) {
      const company = companies.find(c => 
        c.regAdd?.includes(initialData.companyAddress) || 
        initialData.companyAddress?.includes(c.name) ||
        c.name?.includes(initialData.companyAddress)
      );
      if (company) {
        setFormData(prev => ({
          ...prev,
          company: company,
          shippingAddress: company.regAdd || company.address || initialData.companyAddress
        }));
      }
    }
  }, [mode, initialData, companies]);

  // Companies are now fetched from Redux state

  const unitOptions = ['PCS', 'KG', 'LTR', 'MTR', 'NOS', 'BOX', 'SET'];
  
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
    const companyId = e.target.value;
    const selected = companies.find(c => c._id === companyId || c.companyId === companyId);
    setFormData(prev => ({
        ...prev,
        company: selected,
        shippingAddress: selected ? selected.regAdd : ''
    }));
    if (errors.company) setErrors(prev => ({...prev, company: null}));
  };

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleItemChange = (itemId, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === itemId ? { ...item, [field]: value } : item)
    }));
  };
  
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      itemName: '',
      description: '',
      //hsnCode: '',
      quantity: 1,
      unit: 'PCS'
    };
    setFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  };
  
  const handleDeleteLine = (idx) => setShowDeleteIdx(idx);
  const confirmDeleteLine = () => {
    setFormData(prev => ({...prev, items: prev.items.filter((_, i) => i !== showDeleteIdx)}));
    setShowDeleteIdx(null);
  };
  const cancelDeleteLine = () => setShowDeleteIdx(null);

  const handleAttachmentChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.filter(f => /pdf|jpg|jpeg|png/i.test(f.type));
    setFormData(prev => ({...prev, attachments: [...prev.attachments, ...allowed]}));
  };

  const handleRemoveAttachment = (idx) => {
    setFormData(prev => ({...prev, attachments: prev.attachments.filter((_, i) => i !== idx)}));
  };

  const handlePreviewAttachment = (file) => {
    setPreviewFile(file);
  };

  const calculateTotals = () => {
    const subtotal = 0; // No rate calculation needed
    const totalGst = 0; // GST not calculated in this simplified form
    const grandTotal = subtotal + totalGst;
    return { subtotal, totalGst, grandTotal };
  };
  
  const { subtotal, totalGst, grandTotal } = calculateTotals();

  const validateForm = () => {
    const newErrors = {};
    if (!selectedVendor) newErrors.vendor = "Vendor is required";
    if (!formData.orderDate) newErrors.orderDate = 'Order date is required.';
    
    // Only validate delivery date if it's provided
    if (formData.deliveryDate && new Date(formData.deliveryDate) < new Date(formData.orderDate)) {
      newErrors.deliveryDate = 'Delivery date cannot be before order date.';
    }
    
    formData.items.forEach((item, index) => {
      if (!item.itemName) newErrors[`itemName_${index}`] = 'Item name is required.';
      if (item.quantity <= 0) newErrors[`quantity_${index}`] = 'Qty must be > 0.';
      // Rate is no longer required - removed validation
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log("Validation failed");
      console.log(errors);
      return;
    }


    // Calculate TDS amount
    const tdsAmount = selectedVendor && selectedVendor.tdsPercentage ? 
      (subtotal + totalGst) * (selectedVendor.tdsPercentage / 100) : 0;
    let finalPONumber = formData.poNumber;
    if (mode === 'add' && companyId) {
      try {
        const result = await dispatch(generateNextPurchaseOrderNumber(companyId)).unwrap();
        if (result && result.nextPurchaseOrderNumber) {
          finalPONumber = result.nextPurchaseOrderNumber;
        }
      } catch (error) {
        console.error('Failed to generate PO number:', error);
        // fallback to preview or existing number
      }
    }


    // Prepare the purchase order data matching your API structure
    const poData = {
      purchaseOrderId: finalPONumber,
      purchaseOrderNumber: finalPONumber,
      companyId: formData.company?._id || formData.company?.companyId || companyId, // Use selected company ID
      companyAddress: formData.shippingAddress,
      vendorId: selectedVendor.vendorId,
      //gstin: selectedVendor.gstin,
      vendorAddress: selectedVendor.addressLine1,
      tdsPercentage: selectedVendor.tdsPercentage || 0,
      purchaseOrderDate: formData.orderDate,
      purchaseOrderDeliveryDate: formData.deliveryDate,
      purchaseOrderLineItems: formData.items.map(item => {
        const qty = Number(item.quantity) || 0;
        
        return {
          itemName: item.itemName,
          description: item.description,
          //hsnOrSac: item.hsnCode,
          quantity: qty,
          uom: item.unit,
          // Provide numeric fields expected by backend to avoid null BigDecimal operations
          rate: 0,
          amount: 0,
          gstPercent: 0,
          cgstPercent: 0,
          sgstPercent: 0,
          igstPercent: 0,
          gstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
          igstAmount: 0,
          totalAmount: 0
        };
      }),
      // Top-level totals mirrored from bills API to satisfy backend schema
      totalBeforeGST: subtotal,
      totalGST: totalGst,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
      finalAmount: grandTotal,
      tdsAmount: tdsAmount || 0,
      notes: formData.notes || ''
    };

    console.log('Purchase Order Data:', poData);
    console.log('Selected Company:', formData.company);
    console.log('Company ID being saved:', formData.company?._id || formData.company?.companyId || companyId);

    // Create FormData for multipart upload
    const formDataToSend = new FormData();
    formDataToSend.append('purchaseOrder', JSON.stringify(poData));
    
    // Add attachments as separate files
    formData.attachments.forEach((file, index) => {
      formDataToSend.append('attachment', file);
    });

    try {
      if (mode === 'add') {
        dispatch(createPurchaseOrder(formDataToSend));
      } else if (mode === 'edit') {
        dispatch(updatePurchaseOrder({ purchaseOrderId: initialData.purchaseOrderId, purchaseOrder: formDataToSend }));
      }
      onCancel();
    } catch (error) {
      console.error('Error creating purchase order:', error);
    }
  };

  return (
    <div className="w-full relative pb-20">
      {/* Form Content */}
      <div className="space-y-6">
        {/* Top Section */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Vendor Details */}
          <div className="space-y-4">
             <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-gray-400" /> Vendor Details
              </h2>
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
          
          {/* PO Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaPaperclip className="text-gray-400" /> PO Details
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
              <input type="text" readOnly value={formData.poNumber} className="w-full bg-gray-50 border-gray-300 rounded-lg px-3 py-2"/>
              {poNumberLoading && <p className="text-xs text-gray-500 mt-1">Generating PO number...</p>}
              {poNumberError && <p className="text-xs text-red-500 mt-1">{poNumberError}</p>}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Date <span className="text-red-500">*</span></label>
                <input 
                  type="date"
                  className={`w-full border rounded-lg px-3 py-2 ${errors.orderDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.orderDate}
                  onChange={(e) => handleChange('orderDate', e.target.value)}
                />
                {errors.orderDate && <p className="text-xs text-red-500 mt-1">{errors.orderDate}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                <input 
                  type="date" 
                  className={`w-full border rounded-lg px-3 py-2 ${errors.deliveryDate ? 'border-red-500' : 'border-gray-300'}`}
                  value={formData.deliveryDate}
                  min={formData.orderDate}
                  onChange={(e) => handleChange('deliveryDate', e.target.value)}
                />
                {errors.deliveryDate && <p className="text-xs text-red-500 mt-1">{errors.deliveryDate}</p>}
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  placeholder="Notes or terms for the PO"
                  rows="4"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="w-full border-gray-300 rounded-lg p-2"
                ></textarea>
            </div>
          </div>

          {/* Ship To Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaShippingFast className="text-gray-400" /> Ship To
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company </label>
              <select
                className={`w-full border rounded-lg px-3 py-2 ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.company?._id || formData.company?.companyId || ''}
                onChange={handleCompanyChange}
                disabled={companiesLoading}
              >
                <option value="">{companiesLoading ? 'Loading companies...' : 'Select Company'}</option>
                {companies && companies.map(c => (
                  <option key={c._id || c.companyId} value={c._id || c.companyId}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.company && <p className="text-xs text-red-500 mt-1">{errors.company}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address </label>
              <textarea
                rows="5"
                className={`w-full border rounded-lg px-3 py-2 ${errors.shippingAddress ? 'border-red-500' : 'border-gray-300'}`}
                value={formData.shippingAddress}
                onChange={(e) => handleChange('shippingAddress', e.target.value)}
                placeholder="Enter shipping address"
              />
              {errors.shippingAddress && <p className="text-xs text-red-500 mt-1">{errors.shippingAddress}</p>}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
            <div className="flex">
                <button 
                  type="button" 
                  className={`px-6 py-3 border-b-2 font-semibold transition-colors ${
                    activeTab === 'poItems' 
                      ? 'border-blue-600 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`} 
                  onClick={() => setActiveTab('poItems')}
                >
                  PO Items
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
            </div>
        </div>
        
        {/* Tab Content */}
        <div className="min-h-[300px]">
          {activeTab === 'poItems' && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold">Items</h3>
                <button type="button" onClick={addItem} className="flex items-center gap-2 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700">
                  <FaPlus size={12} /> Add New Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr className="text-left text-gray-600 font-medium">
                      <th className="p-3 w-1/3">Item</th>
                      <th className="p-3 w-2/5">Description</th>
                      {/*<th className="p-3">HSN</th>*/}
                      <th className="p-3">Qty</th>
                      <th className="p-3">Unit</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-2"><input type="text" placeholder="Item Name" value={item.itemName} onChange={e => handleItemChange(item.id, 'itemName', e.target.value)} className={`w-full border rounded-md p-2 ${errors[`itemName_${index}`] ? 'border-red-400' : 'border-gray-200'}`} /></td>
                          <td className="p-2"><input type="text" placeholder="Description" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full border-gray-200 rounded-md p-2" /></td>
                          {/*<td className="p-2"><input type="text" placeholder="HSN" value={item.hsnCode} onChange={e => handleItemChange(item.id, 'hsnCode', e.target.value)} className="w-full border-gray-200 rounded-md p-2" /></td>*/}
                          <td className="p-2"><input type="number" placeholder="1" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)} className={`w-20 border rounded-md p-2 ${errors[`quantity_${index}`] ? 'border-red-400' : 'border-gray-200'}`} /></td>
                          <td className="p-2">
                            <select value={item.unit} onChange={e => handleItemChange(item.id, 'unit', e.target.value)} className="w-full border-gray-200 rounded-md p-2">
                              {unitOptions.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="p-2 text-center"><button type="button" onClick={() => handleDeleteLine(index)} className="text-gray-400 hover:text-red-500"><FaTrash /></button></td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                <label htmlFor="attachment-upload" className="flex flex-col items-center justify-center cursor-not-allowed pointer-events-none opacity-60">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-2">
                        <FaPaperclip className="text-2xl text-blue-500" />
                    </div>
                    <button
                        type="button"
                        disabled
                        aria-disabled="true"
                        className="px-6 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium"
                    >
                        Add Attachment
                    </button>
                    <input
                        id="attachment-upload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        multiple
                        className="hidden"
                        disabled
                        aria-disabled="true"
                        onChange={handleAttachmentChange}
                        ref={inputRef}
                    />
                </label>
                <div className="text-sm text-gray-400 mt-2 mb-6">Attachments are disabled</div>
                
                {formData.attachments.length > 0 && (
                  <div className="w-full max-w-2xl">
                      <ul className="divide-y divide-gray-200 bg-gray-50 rounded-lg shadow-inner p-4">
                          {formData.attachments.map((file, idx) => (
                              <li key={idx} className="flex items-center justify-between py-2">
                                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => handlePreviewAttachment(file)}>
                                      {/pdf/i.test(file.type) ? (
                                          <FaFilePdf className="text-red-500 text-lg" />
                                      ) : (
                                          <FaFileImage className="text-blue-500 text-lg" />
                                      )}
                                      <span className="text-gray-800 font-medium text-sm truncate max-w-xs">{file.name}</span>
                                  </div>
                                  <button type="button" className="text-gray-500 hover:text-red-700 ml-4" onClick={() => handleRemoveAttachment(idx)}>
                                      <FaTimes />
                                  </button>
                              </li>
                          ))}
                      </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
      
      {/* Sticky Footer */}
    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 sticky bottom-0 z-20">
    <div className="flex justify-end items-center">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="px-6 py-2 border border-gray-300 rounded-lg transition-colors bg-white text-gray-800 font-bold hover:bg-gray-50"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg transition-colors bg-gray-200 text-gray-800 font-bold hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 rounded-lg transition-colors font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          {mode === 'edit' ? 'Update PO' : 'Save PO'}
        </button>
      </div>
    </div>
  </div>
      {/* PO Preview Modal */}
      {showPreview && (
        <PurchaseOrderPreview 
            poData={{...formData, vendor: selectedVendor, subtotal, grandTotal}}
            onClose={() => setShowPreview(false)}
        />
      )}

      {/* Attachment Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full relative" onClick={e => e.stopPropagation()}>
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

      {/* Delete Confirmation Modal */}
      {showDeleteIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 text-center">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to remove this item?</p>
            <div className="flex justify-center gap-4">
              <button onClick={cancelDeleteLine} className="bg-gray-200 py-2 px-6 rounded-lg">Cancel</button>
              <button onClick={confirmDeleteLine} className="bg-red-600 text-white py-2 px-6 rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddPurchaseOrderForm;