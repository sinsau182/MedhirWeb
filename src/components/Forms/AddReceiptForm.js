import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaReceipt, FaChevronDown, FaChevronRight, FaInfoCircle, FaUpload, FaLink } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addReceipt } from "../../redux/slices/receiptSlice";
import { fetchProjectCustomerList, fetchInvoicesByProject } from "@/redux/slices/receiptSlice";


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
    attachment: null,
    linkedInvoices: [],
  });
const dispatch = useDispatch();
  const { projectCustomerList, invoicesByProject } = useSelector((state) => state.receipts);
  const [errors, setErrors] = useState({});
  const [isAccountingCollapsed, setIsAccountingCollapsed] = useState(true);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isInvoiceLinkModalOpen, setIsInvoiceLinkModalOpen] = useState(false);
  const [invoicesToLink, setInvoicesToLink] = useState([]);
  const [activeTab, setActiveTab] = useState('linking');

  // Static data - in real app, these would come from APIs
  const customers = [
    { id: 1, name: 'Evergreen Solar' },
    { id: 2, name: 'Horizon Dynamics' },
    { id: 3, name: 'Pioneer Builders' }
  ];

  const paymentMethods = ['Bank Transfer', 'Cheque', 'UPI', 'Cash', 'Credit Card', 'Debit Card'];
  const bankAccounts = ['HDFC Bank - *****5678', 'SBI Bank - *****1234', 'ICICI Bank - *****4321'];

  const getInvoicesForCustomer = (customerName) => {
    if (!customerName) return [];
    // Dummy data for customer invoices - now includes total amount and received amount
    const allInvoices = {
      'Evergreen Solar': [
        { id: 1, number: 'INV-2025-001', dueDate: '2025-07-15', totalAmount: 60000, amountReceived: 10000 },
        { id: 2, number: 'INV-2025-004', dueDate: '2025-07-22', totalAmount: 12000, amountReceived: 0 },
      ],
      'Horizon Dynamics': [
        { id: 3, number: 'INV-2025-002', dueDate: '2025-06-28', totalAmount: 23500, amountReceived: 20000 },
      ],
      'Pioneer Builders': [
        { id: 4, number: 'INV-2025-003', dueDate: '2025-07-20', totalAmount: 67800, amountReceived: 0 },
        { id: 5, number: 'INV-2025-005', dueDate: '2025-07-25', totalAmount: 8500, amountReceived: 8500 },
        { id: 6, number: 'INV-2025-006', dueDate: '2025-07-30', totalAmount: 34000, amountReceived: 10000 },
      ],
    };
    return allInvoices[customerName] || [];
  };
  
  // useEffect(() => {
  //   if (initialData) {
  //     setFormData(prev => ({
  //       ...prev,
  //       projectName: initialData.projectName || '',
  //       customerName: initialData.client || '',
  //       amount: initialData.amount || ''
  //     }));
  //   }
  // }, [initialData]);
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
      // If initialData.linkedInvoices exists, map to formData.linkedInvoices
      linkedInvoices: initialData.linkedInvoices
        ? initialData.linkedInvoices.map(li => ({
            invoiceNumber: li.invoiceNumber || li.invoiceId || li.number,
            amountAllocated: li.amountAllocated || li.allocatedAmount || li.payment,
          }))
        : [],
    }));
  }
}, [initialData]);

useEffect(() => {
  dispatch(fetchProjectCustomerList());
}, [dispatch]);



  useEffect(() => {
    if (formData.leadId && invoicesByProject[formData.leadId]) {
      const apiInvoices = invoicesByProject[formData.leadId];
      let invoicesWithPayments = apiInvoices.map(inv => ({ ...inv, payment: 0 }));
      setInvoicesToLink(invoicesWithPayments);
    }
  }, [formData.leadId, invoicesByProject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, attachment: file }));
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => setAttachmentPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setAttachmentPreview(null);
      }
    }
  };

  const removeAttachment = () => {
    setFormData(prev => ({ ...prev, attachment: null }));
    setAttachmentPreview(null);
  };

  const toggleAccountingSection = () => {
    setIsAccountingCollapsed(!isAccountingCollapsed);
  };

  const handleOpenInvoiceLinkModal = () => {
    if (!formData.customerName) {
      alert("Please select a customer first.");
      return;
    }
    const customerInvoices = getInvoicesForCustomer(formData.customerName);
    const initialInvoices = customerInvoices.map(inv => {
      const linked = formData.linkedInvoices.find(li => li.invoiceNumber === inv.number);
      return { ...inv, payment: linked ? linked.amountAllocated : 0 };
    });
    setInvoicesToLink(initialInvoices);
    setIsInvoiceLinkModalOpen(true);
  };
  
  const handleInvoicePaymentChange = (index, paymentAmount) => {
    const receiptAmount = parseFloat(formData.amount) || 0;
    const updatedInvoices = [...invoicesToLink];
    const invoice = updatedInvoices[index];
    const amountRemaining = invoice.totalAmount - invoice.amountReceived;
    
    let newPayment = parseFloat(paymentAmount) || 0;
    if (newPayment < 0) newPayment = 0;
    if (newPayment > amountRemaining) newPayment = amountRemaining;
    invoice.payment = newPayment;
    
    const totalAllocated = updatedInvoices.reduce((sum, inv) => sum + (inv.payment || 0), 0);
    if (totalAllocated > receiptAmount) {
      invoice.payment -= (totalAllocated - receiptAmount);
      if (invoice.payment < 0) invoice.payment = 0;
    }
    setInvoicesToLink(updatedInvoices);
  };
  
  const handleSaveInvoiceLinks = () => {
    // Save as per backend structure: { invoiceNumber, amountAllocated }
    const linked = invoicesToLink.filter(inv => inv.payment > 0).map(inv => ({
      invoiceNumber: inv.number,
      amountAllocated: inv.payment,
    }));
    setFormData(prev => ({ ...prev, linkedInvoices: linked }));
    setIsInvoiceLinkModalOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName) newErrors.customerName = 'Customer name is required';
    if (!formData.receiptNumber.trim()) newErrors.receiptNumber = 'Receipt number is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


const [selectedOption, setSelectedOption] = useState(null);
const [isOpen, setIsOpen] = useState(false);


// const handleSubmit = (e) => {
//   e.preventDefault();
//   if (validateForm()) {
//     const finalLinkedInvoices = invoicesToLink
//       .filter((inv) => inv.payment > 0)
//       .map((inv) => ({
//         id: inv.id,
//         number: inv.number,
//         payment: inv.payment,
//       }));

//     const receiptData = {
//       ...formData,
//       amount: parseFloat(formData.amount),
//       linkedInvoices: finalLinkedInvoices,
//     };

//     // Call the backend via Redux slice (send plain object, not FormData)
//     dispatch(addReceipt(receiptData));
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (validateForm()) {
    const selectedCustomer = customers.find(c => c.name === formData.customerName);
    // Use linkedInvoices as per backend structure
    const receiptData = {
      ...formData,
      customerId: formData.customerId, // ✅ directly use the one already set from dropdown
      projectId: formData.leadId,      // ✅ use leadId as projectId
      customerName: formData.customerName,
      projectName: formData.projectName,
      amountReceived: parseFloat(formData.amount),
      amount: parseFloat(formData.amount),
      linkedInvoices: formData.linkedInvoices, // Already in correct structure
      attachment: formData.attachment ? formData.attachment.name : null,
      receiptDate: formData.receiptDate,
      paymentMethod: formData.paymentMethod,
      receiptNumber: formData.receiptNumber,
      paymentTransactionId:
        formData.reference ||
        formData.chequeNumber ||
        formData.upiTransactionId ||
        '',
    };
    try {
      await dispatch(addReceipt(receiptData)).unwrap();
      if (onSubmit) onSubmit(); // Notify parent to refresh UI and close form
    } catch (error) {
      setErrors({ submit: error?.message || 'Failed to add receipt' });
    }
  }
};
  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const totalAllocatedInModal = invoicesToLink.reduce((sum, inv) => sum + (inv.payment || 0), 0);
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
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input type="text"
                   name="projectName"
                    value={formData.projectName} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., Office Renovation"
                     />
                </div> */}
                {/* <div className="relative inline-block w-full mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
  <button
    type="button"
    onClick={() => setIsOpen(!isOpen)}
    className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
  >
    {selectedOption?.projectName || "Select Project"}
    <span className="float-right">
      <svg
        className={`w-4 h-4 inline transition-transform ${isOpen ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  </button>

  {isOpen && (
    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded max-h-60 overflow-y-auto">
      {projectCustomerList.map((project) => (
        <li
          key={project.projectId}
          onClick={() => {
            setSelectedOption(project);
            setIsOpen(false);
            setFormData((prev) => ({
              ...prev,
              projectName: project.projectName,
              projectId: project.projectId,
              customerId: project.customerId,
              customerName: project.customerName,
            }));
          }}
          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          {project.projectName}
        </li>
      ))}
    </ul>
  )}
                </div> */}
                
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
              linkedInvoices: [],
            }));
            setInvoicesToLink([]);
            setIsOpen(false);
            // Fetch invoices for this project
            dispatch(fetchInvoicesByProject(project.projectId));
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
                  {/* <select name="customerName" value={formData.customerName} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select customer</option>
                    {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select> */}
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
                  <input type="text" name="receiptNumber" value={formData.receiptNumber} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.receiptNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., REC-2025-001" />
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
                {['Bank Transfer', 'Cheque'].includes(formData.paymentMethod) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account <span className="text-red-500">*</span></label>
                    <select name="bankAccount" value={formData.bankAccount} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.bankAccount ? 'border-red-500' : 'border-gray-300'}`}>
                      <option value="">Select bank account</option>
                      {bankAccounts.map(account => <option key={account} value={account}>{account}</option>)}
                    </select>
                  </div>
                )}
                {formData.paymentMethod === 'Cheque' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cheque Number <span className="text-red-500">*</span></label>
                    <input type="text" name="chequeNumber" value={formData.chequeNumber} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter cheque number" />
                  </div>
                )}
                {formData.paymentMethod === 'UPI' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">UPI Transaction ID <span className="text-red-500">*</span></label>
                    <input type="text" name="upiTransactionId" value={formData.upiTransactionId} onChange={handleChange} className="w-full px-4 py-3 text-base border rounded-lg focus:ring-2 focus:ring-green-500" placeholder="Enter UPI transaction ID" />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment trans. ID</label>
                  <input type="text" name="reference" value={formData.reference} onChange={handleChange} className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="e.g., Bank transaction ID" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6 px-6" aria-label="Tabs">
                <button type="button" onClick={() => setActiveTab('linking')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'linking' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Invoice Linking
                </button>
                <button type="button" onClick={() => setActiveTab('attachment')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'attachment' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Attachment
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'linking' && (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-6 text-center">
                      <div className="bg-blue-50 p-3 rounded-lg"><div className="text-sm text-gray-600">Total Receipt Amount</div><div className="text-lg font-bold">{formatCurrency(receiptAmount)}</div></div>
                      <div className="bg-green-50 p-3 rounded-lg"><div className="text-sm text-gray-600">Unallocated Amount</div><div className="text-lg font-bold text-green-700">{formatCurrency(receiptAmount - totalAllocatedInModal)}</div></div>
                  </div>
                  {invoicesToLink.length > 0 ? (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Invoice </th>
                          <th className="text-right py-2">Amount</th>
                          <th className="text-right py-2">Amount Received</th>
                          <th className="text-right py-2">Amount Remaining</th>
                          <th className="text-right py-2 pl-4 w-40">Payment Allocation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoicesToLink.map((inv, index) => {
                          const amountRemaining = inv.totalAmount - inv.amountReceived;
                          return (
                            <tr key={inv.id} className="border-b">
                              <td className="py-3">{inv.invoiceNumber}</td>
                              <td className="text-right py-3">{formatCurrency(inv.totalAmount)}</td>
                              <td className="text-right py-3">{formatCurrency(inv.amountReceived || 0)}</td>
                              <td className="text-right py-3 font-semibold">{formatCurrency(amountRemaining)}</td>
                              <td className="py-2 pl-4">
                                <div className="relative">
                                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                  <input type="number" value={inv.payment} onChange={(e) => handleInvoicePaymentChange(index, e.target.value)} className="w-full text-right p-1 pl-5 border rounded-md" />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-10">
                      <FaLink className="mx-auto text-4xl text-gray-300" />
                      <p className="mt-4 text-gray-500">Select a customer to see their outstanding invoices.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'attachment' && (
                <div>
                  {!formData.attachment ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                      <input type="file" onChange={handleFileChange} accept="image/*,.pdf" className="hidden" id="attachment-upload" />
                      <label htmlFor="attachment-upload" className="cursor-pointer">
                        <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700 mb-2">Upload Payment Proof</p>
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3"><div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">{formData.attachment.type.startsWith('image/') ? '🖼️' : '📄'}</div><div><p className="text-sm font-medium text-gray-900">{formData.attachment.name}</p><p className="text-xs text-gray-500">{(formData.attachment.size / 1024 / 1024).toFixed(2)} MB</p></div></div>
                        <button type="button" onClick={removeAttachment} className="text-red-600 hover:text-red-800 p-1"><FaTimes /></button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
      {isInvoiceLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl">
            <div className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">Link Invoices and Allocate Payment</h2><button onClick={() => setIsInvoiceLinkModalOpen(false)}><FaTimes /></button></div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div className="bg-blue-50 p-3 rounded-lg"><div className="text-sm text-gray-600">Total Receipt Amount</div><div className="text-lg font-bold">{formatCurrency(receiptAmount)}</div></div>
                    <div className="bg-green-50 p-3 rounded-lg"><div className="text-sm text-gray-600">Unallocated Amount</div><div className="text-lg font-bold">{formatCurrency(receiptAmount - totalAllocatedInModal)}</div></div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Invoice #</th>
                        <th className="text-right py-2">Amount</th>
                        <th className="text-right py-2">Amount Received</th>
                        <th className="text-right py-2">Amount Remaining</th>
                        <th className="text-right py-2 pl-4 w-40">Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesToLink.map((inv, index) => {
                        const amountRemaining = inv.totalAmount - inv.amountReceived;
                        return (
                          <tr key={inv.id} className="border-b">
                            <td className="py-2">{inv.number}</td>
                            <td className="text-right py-2">{formatCurrency(inv.totalAmount)}</td>
                            <td className="text-right py-2">{formatCurrency(inv.amountReceived)}</td>
                            <td className="text-right py-2 font-semibold">{formatCurrency(amountRemaining)}</td>
                            <td className="py-2 pl-4">
                              <input type="number" value={inv.payment} onChange={(e) => handleInvoicePaymentChange(index, e.target.value)} className="w-32 text-right p-1 border rounded-md" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                </table>
            </div>
            <div className="p-4 border-t flex justify-between items-center">
                <div><strong>Total Allocated:</strong> {formatCurrency(totalAllocatedInModal)}</div>
                <div className="space-x-3"><button type="button" onClick={() => setIsInvoiceLinkModalOpen(false)} className="px-5 py-2 border rounded-lg">Cancel</button><button type="button" onClick={handleSaveInvoiceLinks} className="px-5 py-2 bg-blue-600 text-white rounded-lg">Save Links</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AddReceiptForm; 