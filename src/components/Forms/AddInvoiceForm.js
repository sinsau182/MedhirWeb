import { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaFileInvoiceDollar, FaChevronDown, FaChevronRight, FaInfoCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProjectCustomerList } from '../../redux/slices/invoiceSlice';

const AddInvoiceForm = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        projectId: '', // NEW
        customerName: '',
        customerId: '', // NEW
        address: '',
        invoiceNumber: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        invoiceLines: [
            { id: 1, item: '', hsn: '', quantity: 1, uom: 'NOS', rate: 0, gst: 18 }
        ],
    });

    const [errors, setErrors] = useState({});
    const [isAccountingCollapsed, setIsAccountingCollapsed] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Remove static customers and projects arrays
    // const customers = [...];
    // const projects = [...];

    const dispatch = useDispatch();
    const { projectCustomerList, loading } = useSelector(state => state.invoices);

    // Extract unique projects from projectCustomerList
    const projects = projectCustomerList?.map(p => ({
        projectId: p.projectId,
        projectName: p.projectName,
        customerId: p.customerId,
        customerName: p.customerName,
        address: p.address
    })) || [];

    useEffect(() => {
        if (!projectCustomerList || projectCustomerList.length === 0) {
            dispatch(fetchProjectCustomerList());
        }
    }, [dispatch, projectCustomerList]);

    // When project changes, auto-set customer and store IDs
    const handleProjectChange = (e) => {
        const selectedProjectName = e.target.value;
        setFormData(prev => {
            const selected = projects.find(p => p.projectName === selectedProjectName);
            return {
                ...prev,
                projectName: selectedProjectName,
                projectId: selected ? selected.projectId : '', // set projectId
                customerName: selected ? selected.customerName : '',
                customerId: selected ? selected.customerId : '', // set customerId
                address: selected ? selected.address : '', // set address
            };
        });
        if (errors.projectName) setErrors(prev => ({ ...prev, projectName: '' }));
    };

    const uomOptions = ['NOS', 'PCS', 'KG', 'MTR', 'LTR', 'BAGS', 'BOX'];

    const gstOptions = [
        { value: 0, label: 'No GST' },
        { value: 5, label: 'GST 5%' },
        { value: 12, label: 'GST 12%' },
        { value: 18, label: 'GST 18%' },
        { value: 28, label: 'GST 28%' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleLineChange = (index, field, value) => {
        const newLines = [...formData.invoiceLines];
        newLines[index][field] = value;
        setFormData(prev => ({ ...prev, invoiceLines: newLines }));
    };

    const addInvoiceLine = () => {
        setFormData(prev => ({
            ...prev,
            invoiceLines: [...prev.invoiceLines, {
                id: Date.now(), item: '', hsn: '', quantity: 1, uom: 'NOS', rate: 0, gst: 18
            }]
        }));
    };

    const removeInvoiceLine = (index) => {
        if (formData.invoiceLines.length > 1) {
            setFormData(prev => ({
                ...prev,
                invoiceLines: prev.invoiceLines.filter((_, i) => i !== index)
            }));
        }
    };

    const calculateLineTotal = (line) => (line.quantity * line.rate) * (1 + line.gst / 100);
    const calculateSubtotal = () => formData.invoiceLines.reduce((sum, line) => sum + (line.quantity * line.rate), 0);
    const calculateTotalGST = () => formData.invoiceLines.reduce((sum, line) => sum + (line.quantity * line.rate * line.gst / 100), 0);
    const calculateTotal = () => calculateSubtotal() + calculateTotalGST();

    const validateForm = () => {
        const newErrors = {};
        if (!formData.customerName) newErrors.customerName = 'Customer name is required';
        if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = 'Invoice number is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        formData.invoiceLines.forEach((line, index) => {
            if (!line.item.trim()) newErrors[`item_${index}`] = 'Item required';
            if (line.quantity <= 0) newErrors[`quantity_${index}`] = 'Qty must be > 0';
            if (line.rate < 0) newErrors[`rate_${index}`] = 'Rate must be >= 0';
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Calculate totals
            const subtotal = calculateSubtotal();
            const totalGst = calculateTotalGST();
            const totalAmount = calculateTotal();
            // Map invoiceLines to items
            const items = formData.invoiceLines.map(line => ({
                item: line.item,
                hsn: line.hsn,
                quantity: line.quantity,
                uom: line.uom,
                rate: line.rate,
                gst: line.gst
            }));
            // Prepare payload for backend
            const payload = {
                ...formData,
                projectId: formData.projectId,
                customerId: formData.customerId,
                subtotal, 
                totalGst, 
                totalAmount,
                items, 
            };
            delete payload.invoiceLines; // remove invoiceLines from payload
            onSubmit(payload);
        }
    };

    const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

    const toggleAccountingSection = () => {
        setIsAccountingCollapsed(!isAccountingCollapsed);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6 mb-24">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        Invoice Details
                        <span className="ml-2 text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative inline-block w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                            <button
                                type="button"
                                onClick={() => setIsOpen(!isOpen)}
                                className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                                    {projects.map((project) => (
                                        <li
                                            key={project.projectId}
                                            onClick={() => {
                                                setSelectedOption(project);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    projectName: project.projectName,
                                                    projectId: project.projectId,
                                                    customerName: project.customerName,
                                                    customerId: project.customerId,
                                                    address: project.address,
                                                }));
                                                setIsOpen(false);
                                                if (errors.projectName) setErrors(prev => ({ ...prev, projectName: '' }));
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="customerName"
                                value={formData.customerName}
                                readOnly
                                className={`w-full px-4 py-3 text-base border rounded-lg ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Customer will be auto-filled"
                            />
                            {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Address</label>
                            <textarea name="siteAddress" value={formData.address} onChange={handleChange} rows="2" className="w-full px-4 py-3 text-base border rounded-lg border-gray-300" placeholder="Enter site address or location"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number <span className="text-red-500">*</span></label>
                            <input type="text" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg ${errors.invoiceNumber ? 'border-red-500' : 'border-gray-300'}`} placeholder="e.g., INV-2025-001" />
                            {errors.invoiceNumber && <p className="text-red-500 text-sm mt-1">{errors.invoiceNumber}</p>}
                        </div>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                                <input type="date" name="invoiceDate" value={formData.invoiceDate} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg border-gray-300`} />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date <span className="text-red-500">*</span></label>
                                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} className={`w-full px-4 py-3 text-base border rounded-lg ${errors.dueDate ? 'border-red-500' : 'border-gray-300'}`} />
                                {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                            Invoice Items
                            <span className="ml-2 text-red-500">*</span>
                        </h3>
                        <button type="button" onClick={addInvoiceLine} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <FaPlus className="w-4 h-4" />
                            <span>Add Item</span>
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.invoiceLines.map((line, index) => (
                            <div key={line.id} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-x-4 gap-y-2 items-start">
                                    <div className="md:col-span-3">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Item <span className="text-red-500">*</span></label>
                                        <input type="text" value={line.item} onChange={(e) => handleLineChange(index, 'item', e.target.value)} className={`w-full px-3 py-2 text-sm border rounded-lg ${errors[`item_${index}`] ? 'border-red-500' : 'border-gray-300'}`} placeholder="Product/Service" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">HSN</label>
                                        <input type="text" value={line.hsn} onChange={(e) => handleLineChange(index, 'hsn', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300" placeholder="HSN/SAC" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Qty <span className="text-red-500">*</span></label>
                                        <input type="number" value={line.quantity} onChange={(e) => handleLineChange(index, 'quantity', parseFloat(e.target.value) || 1)} min="1" step="1" className={`w-full px-3 py-2 text-sm border rounded-lg ${errors[`quantity_${index}`] ? 'border-red-500' : 'border-gray-300'}`} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">UOM</label>
                                        <select value={line.uom} onChange={(e) => handleLineChange(index, 'uom', e.target.value)} className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300">
                                            {uomOptions.map(o => (<option key={o} value={o}>{o}</option>))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">Rate (₹) <span className="text-red-500">*</span></label>
                                        <input type="number" value={line.rate} onChange={(e) => handleLineChange(index, 'rate', parseFloat(e.target.value) || 0)} min="0" step="0.01" className={`w-full px-3 py-2 text-sm border rounded-lg ${errors[`rate_${index}`] ? 'border-red-500' : 'border-gray-300'}`} />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 mb-1">GST %</label>
                                        <select value={line.gst} onChange={(e) => handleLineChange(index, 'gst', parseFloat(e.target.value))} className="w-full px-3 py-2 text-sm border rounded-lg border-gray-300">
                                            {gstOptions.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                                        </select>
                                    </div>
                                    <div className="md:col-span-2 flex items-end justify-between">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Total</label>
                                            <div className="text-sm font-semibold text-gray-900 pt-2">{formatCurrency(calculateLineTotal(line))}</div>
                                        </div>
                                        {formData.invoiceLines.length > 1 && (
                                            <button type="button" onClick={() => removeInvoiceLine(index)} className="text-red-600 hover:text-red-800 p-1 self-center mb-1"><FaTrash className="w-4 h-4" /></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-end">
                            <div className="w-80 space-y-2">
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal:</span><span className="font-medium">{formatCurrency(calculateSubtotal())}</span></div>
                                <div className="flex justify-between text-sm"><span className="text-gray-600">Total GST:</span><span className="font-medium">{formatCurrency(calculateTotalGST())}</span></div>
                                <div className="border-t border-gray-300 pt-2 flex justify-between font-semibold"><span>Total Amount:</span><span className="text-lg">{formatCurrency(calculateTotal())}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="sticky bottom-0 -mx-6 -mb-6">
                <div className="bg-white/90 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-end space-x-4">
                        <button type="button" onClick={onCancel} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            <span>Cancel</span>
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                            <FaSave className="w-4 h-4" />
                            <span>Save Invoice</span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default AddInvoiceForm; 