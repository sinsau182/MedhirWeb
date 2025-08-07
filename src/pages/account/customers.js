// Updated customers page with PRD implementation
import { useState, useEffect } from 'react';
import { FaFileInvoiceDollar, FaReceipt, FaUsers, FaPlus, FaSearch, FaArrowLeft, FaEye, FaTimes, FaFileAlt } from 'react-icons/fa';
import { AddInvoiceForm, AddReceiptForm, AddClientForm } from '../../components/Forms';
import { toast } from 'sonner';
import MainLayout from '@/components/MainLayout'; // Import MainLayout
import { useDispatch, useSelector } from 'react-redux';
import { fetchReceipts } from '@/redux/slices/receiptSlice';
import { fetchInvoices, createInvoice } from '@/redux/slices/invoiceSlice';
import { fetchImageFromMinio } from '@/redux/slices/minioSlice';
import { fetchCustomers, addCustomer } from '@/redux/slices/customerSlice';
import MinioImage from '@/components/ui/MinioImage';

// Small preview component for attachments
const AttachmentPreview = ({ fileUrl, onClick }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImage, setIsImage] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fileUrl) {
      setIsLoading(true);
      // Check if it's an image by file extension
      const isImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
      setIsImage(isImageFile);
      
      if (isImageFile) {
        // For images, try to get preview from MinIO
        dispatch(fetchImageFromMinio({ url: fileUrl }))
          .unwrap()
          .then(result => {
            if (result.dataUrl) {
              setPreviewUrl(result.dataUrl);
            } else {
              setPreviewUrl(fileUrl); // Fallback to direct URL
            }
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Preview error:', error);
            setPreviewUrl(fileUrl); // Fallback to direct URL
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [fileUrl, dispatch]);

  if (!fileUrl) {
    return (
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
        <span className="text-gray-400 text-xs">-</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center animate-pulse">
        <div className="w-3 h-3 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (isImage && previewUrl) {
    return (
      <div 
        className="w-8 h-8 rounded border border-gray-200 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
        onClick={onClick}
        title="Click to view full size"
      >
        <img 
          src={previewUrl} 
          alt="Attachment preview" 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
          <FaFileAlt className="text-gray-400 text-xs" />
        </div>
      </div>
    );
  }

  // For PDFs and other files
  return (
    <div 
      className="w-8 h-8 bg-blue-100 rounded border border-blue-200 flex items-center justify-center cursor-pointer hover:bg-blue-200 transition-colors"
      onClick={onClick}
      title="Click to view file"
    >
      <FaFileAlt className="text-blue-600 text-xs" />
    </div>
  );
};

const FullSizeAttachmentPreview = ({ fileUrl, onClick }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImage, setIsImage] = useState(false);
  const [isPdf, setIsPdf] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (fileUrl) {
      setIsLoading(true);
      // Check if it's an image by file extension
      const isImageFile = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
      const isPdfFile = /\.pdf$/i.test(fileUrl);
      setIsImage(isImageFile);
      setIsPdf(isPdfFile);
      
      if (isImageFile) {
        // For images, try to get preview from MinIO
        dispatch(fetchImageFromMinio({ url: fileUrl }))
          .unwrap()
          .then(result => {
            if (result.dataUrl) {
              setPreviewUrl(result.dataUrl);
            } else {
              setPreviewUrl(fileUrl); // Fallback to direct URL
            }
            setIsLoading(false);
          })
          .catch(error => {
            console.error('Preview error:', error);
            setPreviewUrl(fileUrl); // Fallback to direct URL
            setIsLoading(false);
          });
      } else if (isPdfFile) {
        // For PDFs, try to get the URL for preview
        dispatch(fetchImageFromMinio({ url: fileUrl }))
          .unwrap()
          .then(result => {
            if (result.dataUrl) {
              setPreviewUrl(result.dataUrl);
            } else {
              setPreviewUrl(fileUrl); // Fallback to direct URL
            }
            setIsLoading(false);
          })
          .catch(error => {
            console.error('PDF preview error:', error);
            setPreviewUrl(fileUrl); // Fallback to direct URL
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    }
  }, [fileUrl, dispatch]);

  if (!fileUrl) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No attachment</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (isImage && previewUrl) {
    return (
      <div 
        className="w-full h-full rounded-lg border-2 border-gray-200 overflow-hidden cursor-pointer hover:border-blue-400 transition-all duration-200 shadow-lg"
        onClick={onClick}
        title="Click to view full size"
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-2 overflow-y-auto">
          <img 
            src={previewUrl} 
            alt="Attachment preview" 
            className="w-full min-h-full object-contain rounded-md shadow-sm"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        </div>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
          <FaFileAlt className="text-gray-400 text-2xl" />
        </div>
      </div>
    );
  }

  if (isPdf && previewUrl) {
    return (
      <div 
        className="w-full h-full rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-400 transition-all duration-200 shadow-lg"
        title="PDF Preview"
      >
        <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white p-2 overflow-y-auto">
          <iframe
            src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            className="w-full min-h-full rounded-md shadow-sm border-0"
            title="PDF Preview"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        </div>
        <div className="w-full h-full bg-gray-100 flex items-center justify-center" style={{ display: 'none' }}>
          <FaFileAlt className="text-gray-400 text-2xl" />
        </div>
      </div>
    );
  }

  // For other files (not images or PDFs)
  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 shadow-lg"
      onClick={onClick}
      title="Click to view file"
    >
      <div className="text-center p-6">
        <div className="bg-white rounded-full p-4 mb-4 shadow-md">
          <FaFileAlt className="text-blue-600 text-5xl" />
        </div>
        <p className="text-blue-700 text-lg font-medium">Click to view file</p>
        <p className="text-blue-500 text-sm mt-1">Document or File</p>
      </div>
    </div>
  );
};

const InvoicePreviewModal = ({ invoice, receipts: allReceipts, onClose }) => {
  if (!invoice) return null;

  // Find receipts associated with this invoice
  const relatedReceipts = allReceipts.filter(receipt => receipt.refInvoice && receipt.refInvoice.includes(invoice.invoiceNo));

  const amountRemaining = invoice.totalAmount - invoice.amountReceived;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Invoice Preview: {invoice.id}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Project:</strong> {invoice.project?.projectName}</div>
              <div><strong>Customer:</strong> {invoice.customer?.customerName}</div>
              <div><strong>Invoice Date:</strong> {invoice.invoiceDate}</div>
              <div><strong>Status:</strong> <span className={`font-semibold ${invoice.status?.toLowerCase() === 'received' || invoice.status?.toLowerCase() === 'paid' ? 'text-green-600' : invoice.status?.toLowerCase() === 'partial received' || invoice.status?.toLowerCase() === 'partial paid' || invoice.status?.toLowerCase() === 'partially paid' || invoice.status?.toLowerCase() === 'partiallypaid' ? 'text-yellow-600' : 'text-red-600'}`}>{invoice.status}</span></div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Amount Summary</h3>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-gray-500">Total Amount</div>
                <div className="text-xl font-bold text-gray-800">₹{invoice.totalAmount.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount Received</div>
                <div className="text-xl font-bold text-green-600">₹{invoice.amountReceived.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Amount Remaining</div>
                <div className="text-xl font-bold text-red-600">₹{amountRemaining.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">Linked Receipts</h3>
            {relatedReceipts.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-2 px-3">Receipt #</th>
                    <th className="text-left py-2 px-3">Date</th>
                    <th className="text-right py-2 px-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {relatedReceipts.map(r => (
                    <tr key={r.id} className="border-b">
                      <td className="py-2 px-3 font-medium text-blue-600">{r.receiptNumber}</td>
                      <td className="py-2 px-3">{r.date}</td>
                      <td className="text-right py-2 px-3 font-semibold">₹{r.amountReceived.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6 text-gray-500">
                No receipts generated for this invoice yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptPreviewModal = ({ receipt, onClose }) => {
  const dispatch = useDispatch();
  
  if (!receipt) return null;

  // Prefer linkedInvoices if present, else fallback to allocations for backward compatibility
  const invoiceLinks = receipt.linkedInvoices && receipt.linkedInvoices.length > 0
    ? receipt.linkedInvoices.map(link => ({
        invoiceNumber: link.invoiceNumber || link.invoiceId || link.number,
        amountAllocated: link.amountAllocated || link.allocatedAmount || link.payment,
      }))
    : (receipt.allocations || []).map(link => ({
        invoiceNumber: link.invoiceId || link.number,
        amountAllocated: link.allocatedAmount || link.payment,
      }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Receipt Preview: {receipt.receiptNumber}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FaTimes />
          </button>
        </div>
        <div className="p-8 h-[85vh] flex">
          <div className="grid grid-cols-7 gap-10 w-full">
            {/* Left side - All text fields */}
            <div className="col-span-3">
              <div className="space-y-5 text-sm mb-8">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <strong className="text-gray-600">Customer:</strong>
                  <span className="font-medium">{receipt.customer?.customerName || receipt.client}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <strong className="text-gray-600">Project:</strong>
                  <span className="font-medium">{receipt.project?.projectName || receipt.project}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <strong className="text-gray-600">Receipt Date:</strong>
                  <span className="font-medium">{receipt.receiptDate}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <strong className="text-gray-600">Payment Method:</strong>
                  <span className="font-medium">{receipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <strong className="text-gray-600">Receipt No.:</strong>
                  <span className="font-medium">{receipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <strong className="text-gray-600">Payment Trans. ID:</strong>
                  <span className="font-mono font-medium">{receipt.paymentTransactionId}</span>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-gray-700">Total Amount Received:</span>
                    <span className="text-2xl font-bold text-green-600 bg-white px-3 py-1 rounded-md shadow-sm">₹{receipt.amountReceived}</span>
                </div>

                <h4 className="text-md font-semibold text-gray-700 mb-3 border-b border-green-200 pb-2">Invoice Allocations</h4>
                {invoiceLinks.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-200">
                      <tr>
                        <th className="text-left py-2 px-3">Invoice #</th>
                        <th className="text-right py-2 px-3">Allocated Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {invoiceLinks.map((alloc, index) => (
                        <tr key={index}>
                          <td className="py-2 px-3 font-medium text-blue-600">{alloc.invoiceNumber}</td>
                          <td className="text-right py-2 px-3 font-semibold">₹{alloc.amountAllocated}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No invoices linked to this receipt.
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Only attachment */}
            <div className="col-span-4">
              <div className="bg-gray-50 rounded-lg p-4 h-full flex flex-col">
                <h4 className="text-md font-semibold text-gray-700 mb-4">Attachment</h4>
                <div className="flex-1 overflow-y-auto">
                {receipt.receiptFileUrl || receipt.attachmentUrl ? (
                  <FullSizeAttachmentPreview 
                    fileUrl={receipt.receiptFileUrl || receipt.attachmentUrl}
                    onClick={async () => {
                      try {
                        const { dataUrl } = await dispatch(fetchImageFromMinio({ url: receipt.receiptFileUrl || receipt.attachmentUrl })).unwrap();
                        if (dataUrl) {
                          window.open(dataUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          // Fallback to direct URL if authentication failed or access denied
                          const directUrl = receipt.receiptFileUrl || receipt.attachmentUrl;
                          if (directUrl) {
                            window.open(directUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            toast.error('Unable to open attachment');
                          }
                        }
                      } catch (error) {
                        console.error('Receipt file preview error:', error);
                        // Fallback to direct URL
                        const directUrl = receipt.receiptFileUrl || receipt.attachmentUrl;
                        if (directUrl) {
                          window.open(directUrl, '_blank', 'noopener,noreferrer');
                        } else {
                          toast.error('Unable to open attachment');
                        }
                      }
                    }}
                  />
                ) : (
                  <div className="w-full text-center py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>No attachment</span>
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Customers = () => {
  const dispatch = useDispatch();
  const { receipts, loading, error } = useSelector(state => state.receipts);
  const { invoices } = useSelector(state => state.invoices);
  const { customers, loading: customersLoading, error: customersError } = useSelector(state => state.customers);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('invoice');
  const [showAddForm, setShowAddForm] = useState(null);
  const [invoiceForReceipt, setInvoiceForReceipt] = useState(null);
  const [selectedInvoiceForPreview, setSelectedInvoiceForPreview] = useState(null);
  const [selectedReceiptForPreview, setSelectedReceiptForPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);
  
  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  // const [invoices, setInvoices] = useState([
  //   { id: 'INV-001', projectName: 'Project Medhit', client: 'Client A', date: '2024-07-29', totalAmount: 1200.00, amountReceived: 1200.00, status: 'Received', receiptGenerated: 'Yes' },
  //   { id: 'INV-002', projectName: 'Internal HRMS', client: 'Client B', date: '2024-07-28', totalAmount: 800.00, amountReceived: 0.00, status: 'Due', receiptGenerated: 'No' },
  //   { id: 'INV-003', projectName: 'Marketing Website', client: 'Client A', date: '2024-07-27', totalAmount: 1500.00, amountReceived: 1000.00, status: 'Partial received', receiptGenerated: 'Yes' },
  // ]);
  // const [receipts, setReceipts] = useState([
  //   { id: 'REC-001', projectName: 'Project Medhit', client: 'Client A', date: '2024-07-29', amount: 1200.00, method: 'Credit Card', paymentTransId: 'TXN12345', status: 'Received', allocations: [{ invoiceId: 'INV-001', allocatedAmount: 1200.00 }], invoiceGenerated: 'Yes' },
  //   { id: 'REC-002', projectName: 'Marketing Website', client: 'Client A', date: '2024-07-28', amount: 1000.00, method: 'Bank Transfer', paymentTransId: 'TXN67890', status: 'Partial received', allocations: [{ invoiceId: 'INV-003', allocatedAmount: 1000.00 }], invoiceGenerated: 'Yes' }
  // ]);
  // Remove the static clients state since we're now using Redux

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const handleTabClick = (tab) => { setActiveTab(tab); setShowAddForm(null); };
  const handleAddClick = () => {
    if (activeTab === 'invoice') setShowAddForm('invoice');
    else if (activeTab === 'receipts') setShowAddForm('receipt');
    else if (activeTab === 'clients') setShowAddForm('client');
  };
  const handleBackFromForm = () => {
    setShowAddForm(null);
    setInvoiceForReceipt(null);
  };

  const handleGenerateReceiptClick = (invoice) => {
    setInvoiceForReceipt(invoice);
    setShowAddForm('receipt');
  };

  // const handleInvoiceSubmit = (data) => {
  //   setInvoices(prev => [...prev, { 
  //     id: data.invoiceNumber, 
  //     projectName: data.projectName,
  //     client: data.customerName, 
  //     date: data.invoiceDate, 
  //     totalAmount: data.totalAmount, 
  //     amountReceived: 0,
  //     status: 'Due',
  //     receiptGenerated: 'No'
  //   }]);
  //   toast.success('Invoice added!');
  //   setShowAddForm(null);
  // };

const handleInvoiceSubmit = (data) => {
  dispatch(createInvoice(data))
    .unwrap()
    .then(() => {
      toast.success('Invoice added!');
      dispatch(fetchInvoices());
      setShowAddForm(null);
    })
    .catch((err) => {
      toast.error('Failed to add invoice: ' + (err?.message || 'Unknown error'));
    });
};


  const handleReceiptSubmit = (data) => {
    setActiveTab('receipts'); // Switch to Receipts tab FIRST
    setShowAddForm(null);     // Then close the form
    setInvoiceForReceipt(null);
    dispatch(fetchReceipts()); // Refresh receipts list
    dispatch(fetchInvoices()); // Refresh invoices list so amountReceived is updated
    // toast.success('Receipt added!');
  };


  const handleClientSubmit = (data) => {
    // The AddClientForm now handles the Redux dispatch internally
    setShowAddForm(null);
    dispatch(fetchCustomers()); // Refresh the customers list
  };

  const tabs = [
    { id: 'invoice', label: 'Invoice', icon: FaFileInvoiceDollar },
    { id: 'receipts', label: 'Receipts', icon: FaReceipt },
    { id: 'clients', label: 'Customers', icon: FaUsers },
  ];
  
  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'invoice': return 'Add Invoice';
      case 'receipts': return 'Add Receipt';
      case 'clients': return 'Add Customers';
      default: return 'Add';
    }
  };

  const renderAddForm = () => {
    const commonProps = { onCancel: handleBackFromForm };
    const formTitle = `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}`;

    let formComponent;
    switch (showAddForm) {
      case 'invoice': formComponent = <AddInvoiceForm {...commonProps} onSubmit={handleInvoiceSubmit} />; break;
      case 'receipt': formComponent = <AddReceiptForm {...commonProps} onSubmit={handleReceiptSubmit} initialData={invoiceForReceipt} />; break;
      case 'client': formComponent = <AddClientForm {...commonProps} onSubmit={handleClientSubmit} />; break;
      default: return null;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <button onClick={handleBackFromForm} className="mr-4 text-gray-600 hover:text-blue-600 flex items-center gap-2">
            <FaArrowLeft className="w-5 h-5" /> <span>Back</span>
          </button>
          <h2 className="text-xl font-bold text-gray-900">{formTitle}</h2>
        </div>
        {formComponent}
      </div>
    );
  };

  const renderContent = () => {
    if (showAddForm) return renderAddForm();

    let table;
    switch (activeTab) {
      case 'invoice':
        const filteredInvoices = invoices.filter(invoice =>
          (invoice.invoiceNumber && invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (invoice.project?.projectName && invoice.project.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (invoice.customer?.customerName && invoice.customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (invoice.status && invoice.status.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        table = (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice no.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {/* <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Receipt Generated</th> */}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map(invoice => {
                const amountRemaining = invoice.totalAmount - invoice.amountReceived;
                return (
                  <tr key={invoice.id}>
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm">{invoice.project?.projectName}</td>
                    <td className="px-6 py-4 text-sm">{invoice.customer?.customerName}</td>
                    <td className="px-6 py-4 text-sm">${invoice.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-green-600">${invoice.amountReceived.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">${amountRemaining.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        invoice.status?.toLowerCase() === 'received' || invoice.status?.toLowerCase() === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status?.toLowerCase() === 'partial received' || invoice.status?.toLowerCase() === 'partial paid' || invoice.status?.toLowerCase() === 'partially paid' || invoice.status?.toLowerCase() === 'partiallypaid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    {/* <td className="px-6 py-4 text-sm text-center">
                      <span className={`font-medium ${invoice.receiptGenerated === 'Yes' ? 'text-green-600' : 'text-gray-500'}`}>
                        {invoice.receiptGenerated}
                      </span>
                    </td> */}
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setSelectedInvoiceForPreview(invoice)} className="text-gray-500 hover:text-blue-600">
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                )
              })}
                </tbody>
              </table>
        );
        break;
      case 'receipts':
        const filteredReceipts = receipts.filter(r =>
          (r.receiptNumber && r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.project?.projectName && r.project.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.customer?.customerName && r.customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.paymentMethod && r.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (r.paymentTransactionId && r.paymentTransactionId.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        table = (
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount Received</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment trans. Id</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Attachment</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
              {filteredReceipts.map(r => {
                // Debug: Log receipt data to see available fields
                console.log('Receipt data:', r);
                return (
                <tr key={r.id}>
                  <td className="px-6 py-4 text-sm font-medium text-blue-600 whitespace-nowrap max-w-xs truncate">{r.receiptNumber}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap max-w-xs truncate">{r.project?.projectName}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap max-w-xs truncate">{r.customer?.customerName}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap max-w-xs truncate">{r.receiptDate}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">₹{r.amountReceived}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap max-w-xs truncate">{r.paymentMethod}</td>
                  <td className="px-6 py-4 text-sm font-mono whitespace-nowrap max-w-xs truncate">{r.paymentTransactionId}</td>
                  <td className="px-6 py-4 text-center">
                    <AttachmentPreview 
                      fileUrl={r.receiptFileUrl || r.attachmentUrl}
                      onClick={async () => {
                        try {
                          const result = await dispatch(fetchImageFromMinio({ url: r.receiptFileUrl || r.attachmentUrl })).unwrap();
                          if (result.dataUrl) {
                            window.open(result.dataUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            // Fallback to direct URL if authentication failed or access denied
                            const directUrl = r.receiptFileUrl || r.attachmentUrl;
                            if (directUrl) {
                              window.open(directUrl, '_blank', 'noopener,noreferrer');
                            } else {
                              toast.error('Unable to open attachment');
                            }
                          }
                        } catch (error) {
                          console.error('Receipt file preview error:', error);
                          // Fallback to direct URL
                          const directUrl = r.receiptFileUrl || r.attachmentUrl;
                          if (directUrl) {
                            window.open(directUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            toast.error('Unable to open attachment');
                          }
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => setSelectedReceiptForPreview(r)} className="text-gray-500 hover:text-blue-600">
                      <FaEye />
                    </button>
                  </td>
                  </tr>
              );
              })}
                </tbody>
              </table>
        );
        break;
      case 'clients':
        if (customersLoading) {
          table = (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading customers...</p>
              </div>
            </div>
          );
        } else if (customersError) {
          table = (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <p className="text-red-600 mb-2">Error loading customers</p>
                <p className="text-gray-600 text-sm">{customersError}</p>
              </div>
            </div>
          );
        } else {
          const filteredCustomers = customers.filter(customer =>
            (customer.customerName && customer.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.companyName && customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (customer.contactNumber && customer.contactNumber.toLowerCase().includes(searchTerm.toLowerCase()))
          );
          table = (
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-100">
                    <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(customer => (
                    <tr key={customer.customerId}>
                      <td className="px-6 py-4 text-sm font-medium text-blue-600">{customer.customerId}</td>
                      <td className="px-6 py-4 text-sm font-semibold">{customer.customerName}</td>
                      <td className="px-6 py-4 text-sm">{customer.companyName || '-'}</td>
                      <td className="px-6 py-4 text-sm">{customer.email || '-'}</td>
                      <td className="px-6 py-4 text-sm">{customer.contactNumber}</td>
                      <td className="px-6 py-4 text-sm">{customer.address || '-'}</td>
                      </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      {searchTerm ? 'No customers found matching your search.' : 'No customers found.'}
                    </td>
                  </tr>
                )}
                  </tbody>
                </table>
          );
        }
        break;
      default: return null;
    }
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">{table}</div>
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">Manage customer relationships and transactions</p>
      </div>
        <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg px-4 py-3">
          <div className="flex items-center">
            <nav className="flex space-x-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center space-x-2 whitespace-nowrap pb-1 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  style={{ minWidth: 110 }}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
          <div className="flex items-center space-x-4">
            <button onClick={handleAddClick} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm text-sm" style={{ minWidth: 120 }}>
              <FaPlus className="w-4 h-4" /> <span>{getAddButtonLabel()}</span>
            </button>
            <div className="flex items-center bg-white rounded-md shadow-sm p-2 border border-gray-300">
              <FaSearch className="w-4 h-4 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
      </div>
        {renderContent()}
        {selectedInvoiceForPreview && (
          <InvoicePreviewModal 
            invoice={selectedInvoiceForPreview} 
            receipts={receipts}
            onClose={() => setSelectedInvoiceForPreview(null)} 
          />
        )}
        {selectedReceiptForPreview && (
          <ReceiptPreviewModal
            receipt={selectedReceiptForPreview}
            onClose={() => setSelectedReceiptForPreview(null)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Customers; 