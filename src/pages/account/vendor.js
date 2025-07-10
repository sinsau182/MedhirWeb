// Vendor page implementation based on PRD
import { useState, useEffect } from 'react';
import { FaFileInvoice, FaUndoAlt, FaCreditCard, FaBuilding, FaPlus, FaSearch, FaArrowLeft, FaClipboardList } from 'react-icons/fa';
import Modal from '../../components/Modal';
import { AddBillForm, BulkPaymentForm, AddVendorForm, AddRefundForm, AddPurchaseOrderForm } from '../../components/Forms';
import Sidebar from "../../components/Sidebar";
import HradminNavbar from "../../components/HradminNavbar";
import { useDispatch, useSelector } from 'react-redux';
import { fetchVendors } from '../../redux/slices/vendorSlice';
import { fetchBills } from '../../redux/slices/BillSlice';
import { fetchPayments } from '../../redux/slices/paymentSlice';
import { fetchPurchaseOrders } from '../../redux/slices/PurchaseOrderSlice';
import { toast } from 'sonner';
import axios from 'axios';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';

const Vendor = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dispatch = useDispatch();
  const { vendors, loading, error } = useSelector((state) => state.vendors);
  const { bills, loading: billsLoading, error: billsError } = useSelector((state) => state.bills);
  const { payments, loading: paymentsLoading, error: paymentsError } = useSelector((state) => state.payments);
  const { purchaseOrders, loading: purchaseOrdersLoading, error: purchaseOrdersError } = useSelector((state) => state.purchaseOrders);
  // State for attachment modal
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [selectedBillVendor, setSelectedBillVendor] = useState('');

    useEffect(() => {
      dispatch(fetchVendors());
      dispatch(fetchBills());
      dispatch(fetchPayments());
      dispatch(fetchPurchaseOrders());
    }, [dispatch]);

    console.log(bills);
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };
  const [activeTab, setActiveTab] = useState('bills'); // Default to bills tab
  const [showAddForm, setShowAddForm] = useState(null); // 'bill' | 'refund' | 'payment' | 'vendor' | null

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

  console.log(purchaseOrders);

  // const [purchaseOrders, setPurchaseOrders] = useState([
  //   {
  //     id: 1,
  //     poNumber: 'PO-2025-001',
  //     vendorName: 'Acme Ltd.',
  //     vendorGstin: '27ABCDE1234F1Z5',
  //     orderDate: '2025-01-15',
  //     deliveryDate: '2025-01-25',
  //     status: 'Draft',
  //     subtotal: 10000,
  //     totalGst: 1800,
  //     grandTotal: 11800,
  //     currency: 'INR',
  //     company: 'ABC Pvt Ltd'
  //   },
  //   {
  //     id: 2,
  //     poNumber: 'PO-2025-002',
  //     vendorName: 'XYZ India',
  //     vendorGstin: '29XYZE5678K9Z2',
  //     orderDate: '2025-01-16',
  //     deliveryDate: '2025-01-26',
  //     status: 'Approved',
  //     subtotal: 8000,
  //     totalGst: 1440,
  //     grandTotal: 9440,
  //     currency: 'INR',
  //     company: 'ABC Pvt Ltd'
  //   }
  // ]);

  // const [bills, setBills] = useState([
  //   {
  //     id: 1,
  //     billNo: 'VB-1001',
  //     vendorName: 'Acme Ltd.',
  //     billDate: '12-06-25',
  //     dueDate: '22-06-25',
  //     gstin: '29ABCDE1234F1Z5',
  //     gstTreatment: 'Registered',
  //     totalAmount: 12500,
  //     status: 'Posted',
  //     paymentStatus: 'Paid',
  //     company: 'ABC Pvt Ltd',
  //     journal: 'Purchases',
  //     referencePo: 'PO-2025-001',
  //     reverseCharge: 'No',
  //     attachments: 'Yes'
  //   },
  //   {
  //     id: 2,
  //     billNo: 'VB-1002',
  //     vendorName: 'XYZ India',
  //     billDate: '13-06-25',
  //     dueDate: '23-06-25',
  //     gstin: '29XYZE5678K9Z2',
  //     gstTreatment: 'Unregistered',
  //     totalAmount: 8000,
  //     status: 'Draft',
  //     paymentStatus: 'Unpaid',
  //     company: 'ABC Pvt Ltd',
  //     journal: 'Purchases',
  //     referencePo: '',
  //     reverseCharge: 'Yes',
  //     attachments: 'No'
  //   }
  // ]);

  // const [payments, setPayments] = useState([
  //   {
  //     id: 1,
  //     paymentNo: 'PAY-1001',
  //     paymentDate: '15-06-25',
  //     vendorName: 'Acme Ltd.',
  //     billReference: 'VB-1001, VB-1002',
  //     gstin: '29ABCDE1234F1Z5',
  //     paymentMethod: 'Bank Transfer',
  //     journal: 'Bank',
  //     amount: 20500,
  //     currency: 'INR',
  //     status: 'Posted',
  //     tdsApplied: 'No',
  //     company: 'ABC Pvt Ltd',
  //     paymentReference: 'TXN123456789',
  //     attachments: 'Yes'
  //   },
  //   {
  //     id: 2,
  //     paymentNo: 'PAY-1002',
  //     paymentDate: '16-06-25',
  //     vendorName: 'XYZ India',
  //     billReference: 'VB-1003',
  //     gstin: '29XYZE5678K9Z2',
  //     paymentMethod: 'Cheque',
  //     journal: 'Cheque',
  //     amount: 8000,
  //     currency: 'INR',
  //     status: 'Draft',
  //     tdsApplied: 'Yes',
  //     company: 'ABC Pvt Ltd',
  //     paymentReference: 'CHQ001234',
  //     attachments: 'No'
  //   }
  // ]);

  // const [vendorCredits, setVendorCredits] = useState([
  //   {
  //     id: 'RTRN-001',
  //     referencedBill: 'BILL-12345',
  //     vendor: 'WoodWorks',
  //     date: '2025-06-28',
  //     itemsReturned: 'Oak Tabletop',
  //     totalCredit: 10000,
  //     type: 'Vendor Credit',
  //     status: 'Open (not used yet)'
  //   },
  //   {
  //     id: 'RTRN-002',
  //     referencedBill: 'BILL-12346',
  //     vendor: 'MetalCo',
  //     date: '2025-06-28',
  //     itemsReturned: 'Chair Legs',
  //     totalCredit: 2000,
  //     type: 'Refund',
  //     status: 'Paid (Bank Transfer)'
  //   }
  // ]);

  // const [vendorsList, setVendorsList] = useState(vendors);

  // const handleTabClick = (tab) => {
  //   setActiveTab(tab);
  // };

  // Context-aware Add button handler
  const handleAddClick = () => {
    if (activeTab === 'bills') {
      setShowAddForm('bill');
    } else if (activeTab === 'purchaseOrders') {
      setShowAddForm('po');
    } else if (activeTab === 'payments') {
      setShowAddForm('payment');
    } else if (activeTab === 'vendors') {
      setShowAddForm('vendor');
    }
  };

  console.log(payments)
  // Back button handler for forms
  const handleBackFromForm = () => {
    setShowAddForm(null);
  };

  // Handle attachment icon click
  const handleAttachmentClick = (bill) => {
    const attachments = bill.attachmentUrls || [];
    setSelectedAttachments(attachments);
    setSelectedBillVendor(bill.vendorName);
    setShowAttachmentModal(true);
  };

  // Close attachment modal
  const closeAttachmentModal = () => {
    setShowAttachmentModal(false);
    setSelectedAttachments([]);
    setSelectedBillVendor('');
  };

  const handlePaymentSubmit = (paymentData) => {
    setPayments(prev => [...prev, {
      id: prev.length + 1,
      paymentNo: `PAY-${String(prev.length + 1001).padStart(4, '0')}`,
      paymentDate: paymentData.paymentDate,
      vendorName: paymentData.vendor,
      billReference: paymentData.selectedBills.map(bill => bill.billNo).join(', '),
      gstin: paymentData.gstin,
      paymentMethod: paymentData.paymentMethod,
      journal: paymentData.journal,
      amount: paymentData.totalAmount,
      currency: paymentData.currency,
      status: 'Draft',
      tdsApplied: paymentData.tdsApplied ? 'Yes' : 'No',
      company: paymentData.company,
      paymentReference: paymentData.reference,
      attachments: 'No'
    }]);
    setShowAddForm(null);
    console.log('Payment added successfully:', paymentData);
  };

  const handleBillSubmit = (billData) => {
    setBills(prev => [...prev, {
      id: prev.length + 1,
      billNo: billData.billReference || `VB-${String(prev.length + 1001).padStart(4, '0')}`,
      vendorName: billData.vendor,
      billDate: billData.billDate,
      dueDate: billData.dueDate,
      gstin: billData.gstin,
      gstTreatment: billData.gstTreatment,
      totalAmount: billData.billLines.reduce((sum, line) => sum + line.total, 0),
      status: billData.status || 'Draft',
      paymentStatus: 'Unpaid',
      company: billData.company,
      journal: billData.journal,
      referencePo: billData.billReference,
      reverseCharge: billData.reverseCharge ? 'Yes' : 'No',
      attachments: 'No'
    }]);
    setShowAddForm(null);
    console.log('Bill added successfully:', billData);
  };

  const handleVendorSubmit = (vendorData) => {
    setVendorsList(prev => [...prev, {
      id: prev.length + 1,
      vendorName: vendorData.vendorName,
      companyType: vendorData.companyType,
      gstin: vendorData.gstin,
      pan: vendorData.pan,
      phone: vendorData.mobile,
      email: vendorData.email,
      city: vendorData.city,
      state: vendorData.state,
      paymentTerms: vendorData.paymentTerms,
      vendorTags: vendorData.vendorTags,
      status: vendorData.status
    }]);
    toast.success('Vendor added successfully!');
    dispatch(fetchVendors());
    setShowAddForm(null);
    console.log('Vendor added successfully:', vendorData);
  };

  // const handleRefundSubmit = (refundData) => {
  //   const newCredit = {
  //     id: `RTRN-${String(vendorCredits.length + 1).padStart(3, '0')}`,
  //     referencedBill: refundData.referencedBill,
  //     poReference: refundData.poReference,
  //     vendor: refundData.vendorName,
  //     date: refundData.refundDate,
  //     itemsReturned: refundData.itemsToReturn.filter(i => i.qtyToReturn > 0).map(i => i.name).join(', ') || 'N/A',
  //     totalCredit: refundData.totalCredit,
  //     type: refundData.refundType === 'credit' ? 'Vendor Credit' : 'Refund',
  //     status: refundData.refundType === 'credit' ? 'Open (not used yet)' : 'Pending Payment'
  //   };
  //   setVendorCredits(prev => [...prev, newCredit]);
  //   toast.success('Refund request submitted successfully!');
  //   setShowAddForm(null);
  // };

  const handlePurchaseOrderSubmit = (poData) => {
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
              <h2 className="text-xl font-bold text-gray-900">Add New Bill</h2>
            </div>
            <AddBillForm
              onSubmit={handleBillSubmit}
              onSuccess={() => {
                toast.success('Bill added successfully!');
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
                <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
              </div>
              <AddPurchaseOrderForm
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
              <h2 className="text-xl font-bold text-gray-900">Add New Vendor</h2>
            </div>
            <AddVendorForm
              onSubmit={handleVendorSubmit}
              onSuccess={() => {
                toast.success('Vendor added successfully!');
              }}
              onCancel={handleBackFromForm}
            />
          </div>
        );
        // case 'refund':
        //   return (
        //     <div className="bg-white rounded-lg shadow-md p-6">
        //       <div className="flex items-center mb-4">
        //         <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
        //           <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
        //         </button>
        //         <h2 className="text-xl font-bold text-gray-900">Add Refund Request</h2>
        //       </div>
        //       <AddRefundForm
        //         onSubmit={handleRefundSubmit}
        //         onCancel={handleBackFromForm}
        //       />
        //     </div>
        //   );
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
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill No.</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bill Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Due Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GST Treatment</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining Amount</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Status</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th> */}
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Journal</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reference/PO No.</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Reverse Charge</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50 transition-colors">
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
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.gstTreatment === 'Registered' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {bill.gstTreatment}
                        </span>
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{(bill.finalAmount || 0).toLocaleString('en-IN')}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">₹{(bill.dueAmount || 0).toLocaleString('en-IN')}</span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.status === 'Posted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {bill.status}
                        </span>
                      </td> */}
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
                        {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.company}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{bill.journal}</td> */}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-sm ${bill.billReference ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                          {bill.billReference || '-'}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          bill.reverseCharge === 'Yes' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {bill.reverseCharge}
                        </span>
                      </td> */}
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span 
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            (bill.attachmentUrls && bill.attachmentUrls.length > 0) || 
                            bill.attachmentUrls === 'Yes' || 
                            bill.attachmentUrls === true
                              ? 'bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200' 
                              : 'bg-gray-100 text-gray-500'
                          }`}
                          onClick={() => {
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
          </div>
        );
        case 'purchaseOrders':
          return (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search purchase orders..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PO Number</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor GSTIN</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Delivery Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Currency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {purchaseOrders.map((po) => (
                      <tr key={po.id} className="hover:bg-gray-50 transition-colors">
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
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            po.status === 'Approved' 
                              ? 'bg-green-100 text-green-800' 
                              : po.status === 'Draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">₹{po.finalAmount}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{po.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        // case 'vendorCredits':
        // return (
        //   <div>
        //     <div className="flex justify-between items-center mb-6">
        //       <div className="relative">
        //         <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        //         <input
        //           type="text"
        //           placeholder="Search refunds..."
        //           className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
        //         />
        //       </div>
        //     </div>
        //     <div className="overflow-x-auto">
        //       <table className="min-w-full bg-white">
        //         <thead className="bg-gray-100">
        //           <tr>
        //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund #</th>
        //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
        //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
        //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
        //             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
        //           </tr>
        //         </thead>
        //         <tbody className="divide-y divide-gray-200">
        //            <tr>
        //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">REF-001</td>
        //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">ABC Supplies</td>
        //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">2024-07-25</td>
        //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">$500.00</td>
        //             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">Damaged goods</td>
        //           </tr>
        //         </tbody>
        //       </table>
        //     </div>
        //   </div>
        // );
      case 'payments':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment No.</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Payment Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-48">Vendor Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Bill Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-36">GSTIN (Vendor)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">Payment Method</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Journal</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">Amount from Credits</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Currency</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Status</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">TDS/TCS Applied</th> */}
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-40">Payment Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-20">Attachments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{payment.paymentNo}</span>
                      </td> */}
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
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.journal}</td> */}
                      <td className="px-4 py-4 w-24">
                        <span className="text-sm font-semibold text-gray-900">₹{payment.totalAmount}</span>
                      </td>
                      <td className="px-4 py-4 w-24">
                        <span className="text-sm font-semibold text-gray-900">₹{payment.adjustedAmountFromCredits}</span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.currency}</td> */}
                      <td className="px-4 py-4 w-20">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.status === 'Posted' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          payment.tdsApplied === 'Yes' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.tdsApplied}
                        </span>
                      </td> */}
                      {/* <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{payment.company}</td> */}
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
          </div>
        );
      case 'vendors':
        return (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vendors..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Name</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Company/Individual</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">GSTIN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">PAN</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">City</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">State</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment Terms</th> */}
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Tags</th>
                    {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{vendor.vendorName}</span>
                      </td>
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.companyType === 'Company' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {vendor.companyType}
                        </span>
                      </td> */}
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
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {vendor.paymentTerms}
                        </span>
                      </td> */}
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
                      {/* <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          vendor.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {vendor.status}
                        </span>
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          {/* Vendors heading and Add Button + Tabs as a single block, pushed down together */}
          <div className="mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendors</h1>
            <div className="flex items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
              {/* Add Button */}
              <button
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors font-semibold shadow-sm mr-6 text-sm"
                style={{ minWidth: 120 }}
              >
                {getAddButtonIcon()} <span>{getAddButtonLabel()}</span>
              </button>
              {/* Tabs */}
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
            </div>
          </div>

          {/* Main Content Area */}
          {renderContent()}
        </div>
      </div>

      {/* Attachment Modal */}
      {showAttachmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Attachments - {selectedBillVendor}
              </h3>
              <button
                onClick={closeAttachmentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {selectedAttachments.length > 0 ? (
                <div className="space-y-4">
                  {selectedAttachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          {attachment.toLowerCase().includes('.pdf') ? (
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {typeof attachment === 'string' ? attachment.split('/').pop() || attachment : `Attachment ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {typeof attachment === 'string' ? 'File' : 'Attachment'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(attachment, '_blank')}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = attachment;
                            link.download = typeof attachment === 'string' ? attachment.split('/').pop() || 'attachment' : `attachment-${index + 1}`;
                            link.click();
                          }}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-6xl mb-4">📎</div>
                  <p className="text-gray-500 text-lg">No attachments available</p>
                  <p className="text-gray-400 text-sm mt-2">This bill doesn't have any attachments</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendor;
