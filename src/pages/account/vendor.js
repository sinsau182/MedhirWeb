// Vendor page implementation based on PRD
import { useState, useEffect } from 'react';
import { FaFileInvoice, FaUndoAlt, FaCreditCard, FaBuilding, FaPlus, FaSearch, FaArrowLeft, FaClipboardList, FaEye } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { AddBillForm, BulkPaymentForm, AddVendorForm, AddRefundForm, AddPurchaseOrderForm } from '../../components/Forms';
import VendorPreview from '../../components/Previews/VendorPreview';
import PurchaseOrderPreview from '../../components/Previews/PurchaseOrderPreview';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { fetchBills } from '../../redux/slices/BillSlice';
import { fetchPayments } from '../../redux/slices/paymentSlice';
import { fetchPurchaseOrders } from '../../redux/slices/PurchaseOrderSlice';
import { fetchCompanies } from '../../redux/slices/companiesSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import { generatePresignedUrl, fetchImageFromMinio } from '../../redux/slices/minioSlice';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

const Vendor = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  
  // File handling functions using minioSlice directly
  const handleViewFile = async (url, fileName = null) => {
    try {
      // Try to generate pre-signed URL first (preferred method)
      try {
        const { presignedUrl } = await dispatch(generatePresignedUrl({ url, action: 'view' })).unwrap();
        const newWindow = window.open(presignedUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.document.title = fileName || 'File Preview';
          newWindow.focus();
        }
      } catch (presignedError) {
        console.warn('Pre-signed URL generation failed, falling back to fetch method:', presignedError);
        // Fallback to the old method if pre-signed URL generation fails
        const { dataUrl } = await dispatch(fetchImageFromMinio({ url })).unwrap();
        const newWindow = window.open(dataUrl, '_blank', 'noopener,noreferrer');
        if (newWindow) {
          newWindow.document.title = fileName || 'File Preview';
          newWindow.focus();
        }
      }
    } catch (error) {
      console.error('Failed to open file:', error);
      toast.error('Failed to open file. Please try again.');
    }
  };

  const handleDownloadFile = async (url, fileName = null) => {
    try {
      // Try to generate pre-signed URL first (preferred method)
      try {
        const { presignedUrl } = await dispatch(generatePresignedUrl({ url, action: 'download' })).unwrap();
        const a = document.createElement("a");
        a.href = presignedUrl;
        a.download = fileName || url.split("/").pop().split("?")[0];
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (presignedError) {
        console.warn('Pre-signed URL generation failed, falling back to fetch method:', presignedError);
        // Fallback to the old method if pre-signed URL generation fails
        const { dataUrl } = await dispatch(fetchImageFromMinio({ url })).unwrap();
        
        // Create a temporary link to download the file
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = fileName || url.split("/").pop().split("?")[0];
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up blob URL
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };
  const { vendors, loading, error } = useSelector((state) => state.vendors);
  const { bills, loading: billsLoading, error: billsError } = useSelector((state) => state.bills);
  const { payments, loading: paymentsLoading, error: paymentsError } = useSelector((state) => state.payments);
  const { purchaseOrders, loading: purchaseOrdersLoading, error: purchaseOrdersError } = useSelector((state) => state.purchaseOrders);
  const { companies } = useSelector((state) => state.companies);
  // State for attachment modal
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [selectedBillVendor, setSelectedBillVendor] = useState('');
  // State for selected vendor for editing
  const [selectedVendor, setSelectedVendor] = useState(null);
  // State for selected bill for editing
  const [selectedBill, setSelectedBill] = useState(null);
  // Remove selectedPurchaseOrder state, purchaseOrder prop, and edit mode logic for purchase orders
  // Only support creation of new purchase orders
   const [previewFile, setPreviewFile] = useState(null);
   const [showPurchaseOrderPreview, setShowPurchaseOrderPreview] = useState(false);
   const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(null);
   // State for vendor preview modal
   const [showVendorPreview, setShowVendorPreview] = useState(false);
   const [formData, setFormData] = useState({ attachments: [] });
   const [previewVendorData, setPreviewVendorData] = useState(null);
    useEffect(() => {
      dispatch(fetchVendors());
      dispatch(fetchBills());
      dispatch(fetchPayments());
      dispatch(fetchPurchaseOrders());
      dispatch(fetchCompanies());
    }, [dispatch]);

    console.log(bills);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [activeTab, setActiveTab] = useState('bills'); // Default to bills tab
  const [showAddForm, setShowAddForm] = useState(null); // 'bill' | 'refund' | 'payment' | 'vendor' | null
const [editingPO, setEditingPO] = useState(null); // Store the PO being edited
  // Refetch vendors when form is closed and we're on vendors tab
  useEffect(() => {
    if (showAddForm === null && activeTab === 'vendors') {
      dispatch(fetchVendors());
    }
    if (showAddForm === null && activeTab === 'bills') {
      dispatch(fetchBills());
    }
    if (showAddForm === null && activeTab === 'payments') {
      dispatch(fetchPayments());
    }
  }, [showAddForm, activeTab, dispatch]);


  // Context-aware Add button handler
  const handleAddClick = () => {
    if (activeTab === 'bills') {
      setSelectedBill(null); // Clear selected bill for new bill
      setShowAddForm('bill');
    } else if (activeTab === 'purchaseOrders') {
      setShowAddForm('po');
    } else if (activeTab === 'payments') {
      setShowAddForm('payment');
    } else if (activeTab === 'vendors') {
      setSelectedVendor(null); // Clear selected vendor for new vendor
      setShowAddForm('vendor');
    }
  };

  console.log(payments)
  // Back button handler for forms
  const handleBackFromForm = () => {
    setShowAddForm(null);
    setSelectedVendor(null);
    setSelectedBill(null);
     setEditingPO(null);
  };

  // Handle attachment icon click
  const handleAttachmentClick = (bill) => {
    const attachments = bill.attachmentUrls || [];
    if (attachments.length > 0) {
      // Open the first attachment directly in a new tab
      const firstAttachment = attachments[0];
      window.open(firstAttachment, '_blank');
    }
  };
  // Handle PO row click for editing
  const handlePORowClick = (po) => {
    setEditingPO(po);
    setShowAddForm('po');
  };

  const handlePurchaseOrderPreview = async (po) => {
    // Transform the purchase order data to match the preview component's expected format
    const vendor = vendors.find(v => v.vendorId === po.vendorId);
    console.log('Original PO data:', po);
    console.log('Found vendor:', vendor);
    
    // Get company details - use the company that was selected when creating the PO
    let companyDetails = {
      name: 'Your Company',
      address: 'Your Company Address'
    };
    
    try {
      // First, try to find the company using the companyId from the purchase order
      // This should be the company that was selected when creating the PO
      const poCompanyId = po.companyId;
      console.log('PO Company ID:', poCompanyId);
      console.log('Available companies:', companies);
      
      if (poCompanyId && companies && companies.length > 0) {
        // Find the company that was selected when creating this PO
        const company = companies.find(c => c.companyId === poCompanyId || c._id === poCompanyId);
        console.log('Found company for this PO:', company);
        
        if (company) {
          companyDetails = {
            name: company.name || 'Your Company',
            address: company.regAdd || 'Your Company Address'
          };
          console.log('Processed company details for PO:', companyDetails);
        } else {
          console.log('Company not found for this PO, trying to find by address match');
          
          // If company not found by ID, try to find by address matching
          const company = companies.find(c => 
            c.regAdd === po.companyAddress || 
            c.name === po.companyAddress ||
            po.companyAddress?.includes(c.name) ||
            c.regAdd?.includes(po.companyAddress)
          );
          
          if (company) {
            companyDetails = {
              name: company.name || 'Your Company',
              address: company.regAdd || 'Your Company Address'
            };
            console.log('Found company by address match:', companyDetails);
          } else {
            console.log('No company match found, using logged-in company as fallback');
            
            // Fallback to logged-in company if no match found
            const loggedInCompanyId = sessionStorage.getItem('employeeCompanyId');
            if (loggedInCompanyId) {
              const loggedInCompany = companies.find(c => c.companyId === loggedInCompanyId || c._id === loggedInCompanyId);
              if (loggedInCompany) {
                companyDetails = {
                  name: loggedInCompany.name || 'Your Company',
                  address: loggedInCompany.regAdd || 'Your Company Address'
                };
                console.log('Using logged-in company as fallback:', companyDetails);
              }
            }
          }
        }
      } else {
        console.log('No PO company ID or companies loaded, using logged-in company');
        
        // Fallback to logged-in company
        const loggedInCompanyId = sessionStorage.getItem('employeeCompanyId');
        if (loggedInCompanyId && companies && companies.length > 0) {
          const loggedInCompany = companies.find(c => c.companyId === loggedInCompanyId || c._id === loggedInCompanyId);
          if (loggedInCompany) {
            companyDetails = {
              name: loggedInCompany.name || 'Your Company',
              address: loggedInCompany.regAdd || 'Your Company Address'
            };
            console.log('Using logged-in company:', companyDetails);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    }
    
    const transformedPo = {
      ...po,
      poNumber: po.purchaseOrderNumber,
      orderDate: po.purchaseOrderDate,
      deliveryDate: po.purchaseOrderDeliveryDate,
      vendor: vendor ? {
        name: vendor.vendorName,
        address: vendor.addressLine1,
        gstin: vendor.gstin
      } : null,
      company: companyDetails,
      shippingAddress: po.companyAddress || companyDetails.address,
      items: po.purchaseOrderLineItems || [],
      notes: po.notes || '',
      subtotal: po.totalBeforeGST || 0,
      totalGst: po.totalGST || 0,
      grandTotal: po.finalAmount || 0
    };
    
    console.log('Final transformed PO for preview:', transformedPo);
    console.log('Transformed PO data:', transformedPo);
    setSelectedPurchaseOrder(transformedPo);
    setShowPurchaseOrderPreview(true);
  };
  
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
   
  // Close attachment modal
  const closeAttachmentModal = () => {
    setShowAttachmentModal(false);
    setSelectedAttachments([]);
    setSelectedBillVendor('');
  };

  const handlePaymentSubmit = (paymentData) => {
    // The payment submission is handled by the form component itself
    // We just need to refresh the payments list and close the form
    dispatch(fetchPayments());
    setShowAddForm(null);
    console.log('Payment added successfully:', paymentData);
  };

  const handleBillSubmit = (billData) => {
    // The AddBillForm now handles the Redux dispatch internally
    // We just need to refresh the bills list and close the form
    dispatch(fetchBills());
    setShowAddForm(null);
    setSelectedBill(null);
    console.log('Bill operation completed:', billData);
  };

  const handleVendorSubmit = (vendorData) => {
    // The form submission is handled by the AddVendorForm component itself
    // This function is called after successful submission
    dispatch(fetchVendors());
    setShowAddForm(null);
    setSelectedVendor(null);
    console.log('Vendor operation completed:', vendorData);
  };

  const handlePurchaseOrderSubmit = (poData) => {
    if (editingPO) {
      // Update existing PO
      dispatch(fetchPurchaseOrders());
      toast.success('Purchase Order updated successfully!');
      setShowAddForm(null);
      setEditingPO(null);
      console.log('Purchase Order updated successfully:', poData);
    } else {
      // Create new PO
      const newPO = {
        id: purchaseOrders.length + 1,
        poNumber: `PO-2025-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
        vendorName: poData.vendorName,
        vendorGstin: poData.vendorGstin,
        orderDate: poData.orderDate,
        deliveryDate: poData.deliveryDate,
        status: poData.status || 'Draft',
        subtotal: poData.subtotal,
        totalGst: poData.totalGst,
        grandTotal: poData.grandTotal,
        currency: poData.currency,
        company: poData.company,
        items: poData.items,
        notes: poData.notes
      };
      
      dispatch(fetchPurchaseOrders());
      toast.success('Purchase Order created successfully!');
      setShowAddForm(null);
      console.log('Purchase Order created successfully:', poData);
    }
  };

  const tabs = [
    { id: 'bills', label: 'Bills', icon: FaFileInvoice },
    { id: 'purchaseOrders', label: 'Purchase Orders', icon: FaClipboardList },
    { id: 'payments', label: 'Payments', icon: FaCreditCard },
    { id: 'vendors', label: 'Vendors List', icon: FaBuilding },
  ];

  // Context-aware Add button label
  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'bills': return 'New Bill';
      case 'purchaseOrders': return 'New P.O';
      case 'payments': return 'New Payment';
      case 'vendors': return 'New Vendor';
      default: return 'Add';
    }
  };

  // Context-aware Add button icon
  const getAddButtonIcon = () => <FaPlus className="w-4 h-4" />;

  // Inline Add Form renderers
  const renderAddForm = () => {
    switch (showAddForm) {
      case 'bill':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedBill ? 'Edit Bill' : 'Add New Bill'}
              </h2>
            </div>
            <AddBillForm
              bill={selectedBill}
              onSubmit={handleBillSubmit}
              onSuccess={() => {
                toast.success(selectedBill ? 'Bill updated successfully!' : 'Bill added successfully!');
              }}
              onCancel={handleBackFromForm}
            />
          </div>
        );
           case 'po':
          return (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                  <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  {editingPO ? 'Edit Purchase Order' : 'Create Purchase Order'}
                </h2>
              </div>
              <AddPurchaseOrderForm
                mode={editingPO ? 'edit' : 'add'}
                initialData={editingPO}
                onSubmit={handlePurchaseOrderSubmit}
                onCancel={handleBackFromForm}
              />
            </div>
          );
      case 'payment':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">Add Vendor Payment</h2>
            </div>
            <BulkPaymentForm
              onSubmit={handlePaymentSubmit}
              onCancel={handleBackFromForm}
            />
          </div>
        );
      case 'vendor':
        return (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
                <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {selectedVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
            </div>
            <AddVendorForm
              vendor={selectedVendor}
              onSubmit={handleVendorSubmit}
              onSuccess={() => {
                toast.success(selectedVendor ? 'Vendor updated successfully!' : 'Vendor added successfully!');
              }}
              onCancel={handleBackFromForm}
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (showAddForm) {
      return renderAddForm();
    }
    switch (activeTab) {
      case 'bills':
        return (
          <div>
            {bills.length === 0 ? (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                    <FaFileInvoice className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Bills Found</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    You haven&apos;t created any bills yet. Start by adding your first bill to track vendor invoices and payments.
                  </p>
                  <button
                    onClick={() => setShowAddForm('bill')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    Add Your First Bill
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill No.</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference/PO No.</th>
                      <th className="px-1 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attachments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bills.map((bill) => (
                    <tr 
                      key={bill.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedBill(bill);
                        setShowAddForm('bill');
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{bill.billNumber || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{bill.vendorName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.billDate}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.dueDate}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{bill.gstin}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{(bill.finalAmount || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{(bill.dueAmount || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-800' 
                            : bill.paymentStatus === 'PARTIALLY_PAID'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {bill.paymentStatus === 'PAID' 
                            ? 'Paid' 
                            : bill.paymentStatus === 'PARTIALLY_PAID' 
                            ? 'Partially Paid' 
                            : 'Unpaid'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${bill.billReference ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                          {bill.billReference || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span 
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            (bill.attachmentUrls && bill.attachmentUrls.length > 0) || 
                            bill.attachmentUrls === 'Yes' || 
                            bill.attachmentUrls === true
                              ? 'bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200' 
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation()
                            if ((bill.attachmentUrls && bill.attachmentUrls.length > 0) || 
                                bill.attachmentUrls === 'Yes' || 
                                bill.attachmentUrls === true) {
                              handleAttachmentClick(bill);
                            }
                          }}
                        >
                          {(bill.attachmentUrls && bill.attachmentUrls.length > 0) || 
                           bill.attachmentUrls === 'Yes' || 
                           bill.attachmentUrls === true ? '📎' : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        );
        case 'purchaseOrders':
          return (
            <div>
              {purchaseOrders.length === 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200">
                  <div className="flex flex-col items-center justify-center py-16 px-8">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                      <FaClipboardList className="w-10 h-10 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Purchase Orders Found</h3>
                    <p className="text-gray-600 text-center max-w-md mb-6">
                      You haven&apos;t created any purchase orders yet. Start by adding your first PO to manage vendor orders and track deliveries.
                    </p>
                    <button
                      onClick={() => setShowAddForm('po')}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                    >
                      <FaPlus className="w-4 h-4" />
                      Create Your First PO
                    </button>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PO Number</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor GSTIN</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attachments</th>
                       <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchaseOrders.map((po) => (
                      <tr 
                        key={po.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => handlePORowClick(po)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">{po.purchaseOrderNumber}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {(() => {
                              const vendor = vendors.find(v => v.vendorId === po.vendorId);
                              return vendor ? vendor.vendorName : po.vendorId || 'N/A';
                            })()}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{po.gstin}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{po.purchaseOrderDate}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{po.purchaseOrderDeliveryDate}</td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">₹{po.finalAmount}</span>
                        </td>

                 <td className="px-4 py-4 whitespace-nowrap text-center">
                          <span 
                           className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                             (po.attachmentUrls && po.attachmentUrls.length > 0) || 
                                po.attachmentUrls === 'Yes' || po.attachmentUrls === true  ? 'bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200'         : 'bg-gray-100 text-gray-500'
                                  }`}
                            onClick={(e) => {
   e.stopPropagation();
   if (po.attachmentUrls && Array.isArray(po.attachmentUrls) && po.attachmentUrls.length > 0) {
     // Open the first attachment directly in a new tab
     const firstAttachment = po.attachmentUrls[0];
     window.open(firstAttachment, '_blank');
   } else if (typeof po.attachmentUrls === 'string') {
     // Open the string attachment directly in a new tab
     window.open(po.attachmentUrls, '_blank');
   }
 }}
                                          >
                                {(po.attachmentUrls && po.attachmentUrls.length > 0) || 
                                   po.attachmentUrls === 'Yes' || 
                                   po.attachmentUrls === true ? '📎' : '-'}
                             </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePurchaseOrderPreview(po);
                          }}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors"
                          title="Preview Purchase Order"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                      </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          );
      case 'payments':
        return (
          <div>
            {payments.length === 0 ? (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
                    <FaCreditCard className="w-10 h-10 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Payments Found</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    You haven&apos;t recorded any payments yet. Start by adding your first payment to track vendor transactions and maintain payment history.
                  </p>
                  <button
                    onClick={() => setShowAddForm('payment')}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    Record Your First Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Payment Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">Vendor Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Bill Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">GSTIN (Vendor)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Payment Method</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Amount from Credits</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Payment Reference</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Attachments</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-gray-700 w-32">{payment.paymentDate}</td>
                      <td className="px-4 py-4 w-48">
                        <span className="text-sm font-medium text-gray-900 truncate block">{payment.vendorName}</span>
                      </td>
                       <td className="px-4 py-4 w-40">
                         <div className="flex flex-wrap gap-1">
                           {payment?.billPayments?.map((bill) => (
                             <span key={bill.billId} className="text-xs text-blue-600 font-medium">
                               {bill.billId}
                             </span>
                           ))}
                         </div>
                       </td>
                      <td className="px-4 py-4 w-36">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{payment.gstin}</span>
                      </td>
                      <td className="px-4 py-4 w-32">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.paymentMethod === 'Bank Transfer' 
                            ? 'bg-blue-100 text-blue-800' 
                            : payment.paymentMethod === 'Cheque'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-4 w-24">
                        <span className="text-sm font-semibold text-gray-900">₹{payment.totalAmount}</span>
                      </td>
                      <td className="px-4 py-4 w-24">
                        <span className="text-sm font-semibold text-gray-900">₹{payment.adjustedAmountFromCredits}</span>
                      </td>
                      <td className="px-4 py-4 w-20">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'Posted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 w-40">
                        <span className="text-sm text-gray-600 font-mono truncate block">{payment.paymentTransactionId}</span>
                      </td>
                      <td className="px-4 py-4 w-20 text-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          payment.attachments === 'Yes' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {payment.attachments === 'Yes' ? '📎' : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        );
      case 'vendors':
        return (
          <div>
            {vendors.length === 0 ? (
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="flex flex-col items-center justify-center py-16 px-8">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                    <FaBuilding className="w-10 h-10 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Vendors Found</h3>
                  <p className="text-gray-600 text-center max-w-md mb-6">
                    You haven&apos;t added any vendors yet. Start by adding your first vendor to manage supplier relationships and track business transactions.
                  </p>
                  <button
                    onClick={() => setShowAddForm('vendor')}
                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    <FaPlus className="w-4 h-4" />
                    Add Your First Vendor
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PAN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">City</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Tags</th>
                                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Preview</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setShowAddForm('vendor');
                      }}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{vendor.vendorName}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{vendor.gstin}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">{vendor.pan}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.mobile}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-600 hover:text-blue-800">{vendor.email}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.city}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{vendor.state}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {vendor.vendorTags?.slice(0, 2).map((tag, index) => (
                            <span key={index} className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {tag}
                            </span>
                          ))}
                          {vendor.vendorTags?.length > 2 && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                              +{vendor.vendorTags?.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewVendorData(vendor);
                            setShowVendorPreview(true);
                          }}
                          className="text-gray-600 hover:text-blue-600"
                        >
                          <FaEye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        currentRole={"employee"}
      />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-56"
        } transition-all duration-300 overflow-x-auto`}
      >
        {/* Navbar */}
        <HradminNavbar />

        {/* Main Content Area */}
        <div className="mt-20 p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
          </div>

          <div className="flex justify-between items-center mb-6">
            <nav className="flex space-x-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowAddForm(null); // Always reset form on tab switch
                  }}
                  className={`flex items-center space-x-2 whitespace-nowrap pb-1 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none py-1 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                  style={{ minWidth: 110 }}
                >
                  <tab.icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm text-sm"
                style={{ minWidth: 120 }}
              >
                {getAddButtonIcon()} <span>{getAddButtonLabel()}</span>
              </button>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          {renderContent()}
        </div>
      </div>

      {/* Vendor Preview Modal */}
       {showVendorPreview && previewVendorData && (
         <VendorPreview
           vendorData={previewVendorData}
           onClose={() => setShowVendorPreview(false)}
         />
       )}

      {/* Purchase Order Preview Modal */}
      {showPurchaseOrderPreview && selectedPurchaseOrder && (
        <PurchaseOrderPreview
          poData={selectedPurchaseOrder}
          onClose={() => setShowPurchaseOrderPreview(false)}
        />
      )}
    </div>
  );
};

export default Vendor;