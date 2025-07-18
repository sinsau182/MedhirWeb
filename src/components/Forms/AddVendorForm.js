import { useState, useEffect, useRef } from 'react';
import { FaSave, FaTimes, FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaBuilding, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaGlobe, FaCreditCard, FaFileAlt, FaInfoCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addVendor } from '../../redux/slices/vendorSlice';
import { toast } from 'sonner';

const steps = [
  { label: 'Basic Details' },
  { label: 'Contact & Address' },
  { label: 'Compliance & Banking' },
];

const AddVendorForm = ({ onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.vendors);
  const [step, setStep] = useState(1);
  const formRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const sentinelRef = useRef(null);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const tagsDropdownRef = useRef(null);

  const [tdsApplied, setTdsApplied] = useState(false);
  const [tdsRate, setTdsRate] = useState(2);
  const TDS_RATES = [1, 2, 5, 10];

  const [formData, setFormData] = useState({
    // Basic Information
    vendorName: '',
    companyId: sessionStorage.getItem("employeeCompanyId"),
    companyType: 'Company', // Company or Individual
    vendorCategory: '',
    gstin: '',
    tdsPercentage: '',
    pan: '',
    taxTreatment: '',
    vendorTags: [],
    // Contact Information
    contactName: '',
    email: '',
    mobile: '', // Main phone number
    phone: '', // Alternate phone number
    
    // Address Information
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pinCode: '',
    
    // Banking Details (nested structure)
    bankDetails: {
      accountHolderName: '',
      branchName: '',
      bankName: '',
      accountType: '',
      accountNumber: '',
      ifscCode: '',
      upiId: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [collapsedSections, setCollapsedSections] = useState({
    contactAddresses: true,
    banking: true,
    salesPurchase: true,
    accounting: true,
    notes: true
  });

  // Separate state for confirm account number (not part of formData)
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');

  // Static data - in real app, these would come from APIs
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
    'Lakshadweep', 'Andaman and Nicobar Islands', 'Jammu and Kashmir', 'Ladakh'
  ];

  const paymentTermsOptions = [
    '15 Days', '30 Days', '45 Days', '60 Days', '90 Days', 'Immediate', 'Net 10', 'Net 15', 'Net 30'
  ];

  const priceListOptions = [
    'Standard Price List', 'Wholesale Price List', 'Retail Price List', 'Special Rate'
  ];

  const fiscalPositionOptions = [
    'Domestic', 'Export', 'Import', 'SEZ', 'Interstate', 'Intrastate'
  ];

  const productsServicesOptions = [
    'Office Supplies', 'Computer Equipment', 'Software Services', 'Consulting Services',
    'Transportation Services', 'Maintenance Services', 'Raw Materials', 'Finished Goods'
  ];

  const accountOptions = [
    'Account Payable - Domestic', 'Account Payable - Import', 'Account Receivable - Domestic',
    'Account Receivable - Export', 'Sundry Creditors', 'Sundry Debtors'
  ];

  const vendorTagOptions = [
    'Critical Supplier', 'Preferred Vendor', 'Local Supplier', 'International Supplier',
    'Service Provider', 'Raw Material Supplier', 'Equipment Supplier', 'Contractor'
  ];

  const contactTypes = ['Billing', 'Shipping', 'Finance', 'Technical', 'Sales', 'Support'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Handle nested bankDetails fields
    if (name.startsWith('bankDetails.')) {
      const fieldName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [fieldName]: newValue
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Separate handler for confirm account number
  const handleConfirmAccountNumberChange = (e) => {
    const value = e.target.value;
    setConfirmAccountNumber(value);
    
    // Clear error when user starts typing
    if (errors.confirmAccountNumber) {
      setErrors(prev => ({
        ...prev,
        confirmAccountNumber: ''
      }));
    }
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value) 
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleContactChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      contactAddresses: prev.contactAddresses.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addContact = () => {
    setFormData(prev => ({
      ...prev,
      contactAddresses: [...prev.contactAddresses, {
        id: Date.now(),
        name: '',
        phone: '',
        email: '',
        type: 'Billing'
      }]
    }));
  };

  const removeContact = (index) => {
    setFormData(prev => ({
      ...prev,
      contactAddresses: prev.contactAddresses.filter((_, i) => i !== index)
    }));
  };

  const toggleSection = (section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Basic Information validations
    if (!formData.vendorName.trim()) {
      newErrors.vendorName = 'Vendor name is required';
    }

    // if (!formData.gstin.trim()) {
    //   newErrors.gstin = 'GSTIN is required';
    // } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/.test(formData.gstin)) {
    //   newErrors.gstin = 'Invalid GSTIN format';
    // }

    if (!formData.pan.trim()) {
      newErrors.pan = 'PAN is required';
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan)) {
      newErrors.pan = 'Invalid PAN format';
    }

    if (!formData.taxTreatment.trim()) {
      newErrors.taxTreatment = 'GST treatment is required';
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address Line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = 'PIN Code is required';
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pinCode)) {
      newErrors.pinCode = 'Invalid PIN Code format';
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Mobile validation (main phone)
    if (formData.mobile && !/^\d{10}$/.test(formData.mobile)) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    // Phone validation (alternate phone)
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Banking details validation
    if (!formData.bankDetails.accountHolderName.trim()) {
      newErrors['bankDetails.accountHolderName'] = 'Account holder name is required';
    }

    if (!formData.bankDetails.branchName.trim()) {
      newErrors['bankDetails.branchName'] = 'Branch name is required';
    }

    if (!formData.bankDetails.bankName.trim()) {
      newErrors['bankDetails.bankName'] = 'Bank name is required';
    }

    if (!formData.bankDetails.accountType.trim()) {
      newErrors['bankDetails.accountType'] = 'Account type is required';
    }

    if (!formData.bankDetails.accountNumber.trim()) {
      newErrors['bankDetails.accountNumber'] = 'Account number is required';
    } else if (!/^[0-9]{9,18}$/.test(formData.bankDetails.accountNumber)) {
      newErrors['bankDetails.accountNumber'] = 'Invalid account number format';
    }

    if (!formData.bankDetails.ifscCode.trim()) {
      newErrors['bankDetails.ifscCode'] = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.bankDetails.ifscCode)) {
      newErrors['bankDetails.ifscCode'] = 'Invalid IFSC code format';
    }

    if (!formData.bankDetails.upiId.trim()) {
      newErrors['bankDetails.upiId'] = 'UPI ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.bankDetails.upiId)) {
      newErrors['bankDetails.upiId'] = 'Invalid UPI ID format';
    }

    // Confirm Account Number validation
    if (!confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Please confirm your account number';
    } else if (formData.bankDetails.accountNumber !== confirmAccountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const submitData = {
        ...formData,
        vendorId: `V${Date.now()}`, // Generate vendor ID
        status: 'Active',
        createdAt: new Date().toISOString(),
        // Convert tdsPercentage to double type
        tdsPercentage: formData.tdsPercentage ? parseFloat(formData.tdsPercentage) : null
      };
      
      try {
        const result = await dispatch(addVendor(submitData)).unwrap();
        if (result) {
          toast.success('Vendor added successfully!');
          onCancel();
        }
      } catch (err) {
        toast.error(err);
      }
    } else {
      toast.error('Please fill all the required fields');
    }
  };

  const renderCollapsibleSection = (title, section, icon, children) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {collapsedSections[section] ? (
          <FaChevronRight className="w-5 h-5 text-gray-400" />
        ) : (
          <FaChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      
      {!collapsedSections[section] && (
        <div className="px-6 pb-6 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );

  // --- Step Content Renderers ---
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <div className="flex items-center mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBuilding className="text-gray-400" /> Basic Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter vendor name"
                  maxLength={100}
                />
                {errors.vendorName && <div className="text-red-500 text-sm mt-1">{errors.vendorName}</div>}
              </div>
                            {/* Tax Treatment */}
                            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GST Treatment <span className="text-red-500">*</span></label>
                <select
                  name="taxTreatment"
                  value={formData.taxTreatment || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select tax treatment</option>
                  <option value="Registered">Registered</option>
                  <option value="Unregistered">Unregistered</option>
                  <option value="Composition">Composition</option>
                  <option value="Consumer">Consumer</option>
                </select>
                {errors.taxTreatment && <div className="text-red-500 text-sm mt-1">{errors.taxTreatment}</div>}
              </div>
                            {/* Vendor Tags */}
                            <div className="relative" ref={tagsDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Tags</label>
                <button
                  type="button"
                  onClick={() => setShowTagsDropdown(prev => !prev)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <span className="truncate">
                    {formData.vendorTags.length > 0 ? formData.vendorTags.join(', ') : 'Select one or more tags'}
                  </span>
                  <FaChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showTagsDropdown && (
                  <div className="absolute z-30 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto mb-3" style={{maxHeight: '12.5rem'}}>
                    {vendorTagOptions.map(tag => (
                      <label key={tag} className="flex items-center w-full px-4 py-2 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-4 w-4 text-blue-600 rounded"
                          checked={formData.vendorTags.includes(tag)}
                          onChange={() => handleMultiSelect('vendorTags', tag)}
                        />
                        <span className="ml-3 text-sm text-gray-700">{tag}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {/* Vendor Type */}
              {/* <div className="flex flex-col justify-end">
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Type <span className="text-red-500">*</span></label>
                <div className="flex items-center gap-6 h-full">
                  <label className="inline-flex items-center">
                    <input type="radio" name="companyType" value="Company" checked={formData.companyType === 'Company'} onChange={handleChange} className="form-radio text-blue-600" />
                    <span className="ml-2">Company</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="companyType" value="Individual" checked={formData.companyType === 'Individual'} onChange={handleChange} className="form-radio text-blue-600" />
                    <span className="ml-2">Individual</span>
                  </label>
                </div>
              </div> */}
              {/* Vendor Category */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Category <span className="text-red-500">*</span></label>
                <select
                  name="vendorCategory"
                  value={formData.vendorCategory || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select vendor category</option>
                  <option value="Goods">Goods</option>
                  <option value="Services">Services</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Contractor">Contractor</option>
                </select>
              </div> */}
              {/* GSTIN */}
              <div>
                <label className={`block text-sm font-medium mb-2 flex items-center ${formData.taxTreatment !== 'Registered' ? 'text-gray-400' : 'text-gray-700'}`}>GSTIN <span className="text-gray-400 ml-1"><FaInfoCircle title="15-digit Goods and Services Tax Identification Number" /></span></label>
                <input
                  type="text"
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter GSTIN"
                  maxLength={15}
                  disabled={formData.taxTreatment !== 'Registered'}
                />
                <div className="text-xs text-gray-400 mt-1">15-digit Goods and Services Tax Identification Number</div>
                {errors.gstin && <div className="text-red-500 text-sm mt-1">{errors.gstin}</div>}
              </div>
              {/* PAN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PAN <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter PAN"
                  maxLength={10}
                />
                <div className="text-xs text-gray-400 mt-1">10-character Permanent Account Number</div>
                {errors.pan && <div className="text-red-500 text-sm mt-1">{errors.pan}</div>}
              </div>
              {/* TDS Selection */}
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-100 mt-2">
              <label className="flex items-center">
                <input 
                  type="checkbox"
                  checked={tdsApplied}
                  onChange={e => {
                    setTdsApplied(e.target.checked);
                    if (!e.target.checked) {
                      // Clear TDS percentage when unchecked
                      setFormData(prev => ({
                        ...prev,
                        tdsPercentage: ''
                      }));
                    } else {
                      // Set TDS percentage when checked
                      setFormData(prev => ({
                        ...prev,
                        tdsPercentage: tdsRate.toString()
                      }));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={formData.taxTreatment !== 'Registered'}
                />
                <span className={`ml-2 text-sm font-medium ${formData.taxTreatment !== 'Registered' ? 'text-gray-400' : 'text-gray-700'}`}>TDS/TCS Applied</span>
              </label>
              {tdsApplied && formData.taxTreatment === 'Registered' && (
                <div>
                  <label className="sr-only">TDS Rate</label>
                  <select
                    value={tdsRate}
                    onChange={e => {
                      const newRate = Number(e.target.value);
                      setTdsRate(newRate);
                      // Update formData.tdsPercentage when rate changes
                      setFormData(prev => ({
                        ...prev,
                        tdsPercentage: newRate.toString()
                      }));
                    }}
                    className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TDS_RATES.map(rate => (
                      <option key={rate} value={rate}>{rate}%</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Information (Left Column) */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                </div>
                <div className="space-y-6">
                  {/* Contact Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="contactName"
                      value={formData.contactName || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter full name"
                    />
                    {errors.contactName && <div className="text-red-500 text-sm mt-1">{errors.contactName}</div>}
                  </div>
                  {/* Email Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="contact@vendor.com"
                    />
                    {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                  </div>
                  {/* Main Phone Number (Mobile) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Main Phone Number</label>
                    <div className="flex">
                      <select className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                        <option>+91</option>
                      </select>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-base border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter main phone number"
                        maxLength={10}
                      />
                    </div>
                    {errors.mobile && <div className="text-red-500 text-sm mt-1">{errors.mobile}</div>}
                  </div>
                  {/* Alternate Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone Number</label>
                    <div className="flex">
                      <select className="border border-gray-300 rounded-l-lg px-3 py-2 bg-gray-50 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled>
                        <option>+91</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-base border-t border-b border-r border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter alternate phone number"
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                  </div>
                </div>
              </div>
              {/* Address Information (Right Column) */}
              <div>
                <div className="flex items-center mb-4">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
                </div>
                <div className="space-y-6">
                  {/* Address Line 1 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={formData.addressLine1 || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Building name, street address"
                    />
                    {errors.addressLine1 && <div className="text-red-500 text-sm mt-1">{errors.addressLine1}</div>}
                  </div>
                  {/* Address Line 2 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={formData.addressLine2 || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>
                  {/* City & State/Province */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter city"
                      />
                      {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State/Province <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state || ""}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Enter state or province"
                      />
                      {errors.state && <div className="text-red-500 text-sm mt-1">{errors.state}</div>}
                    </div>
                  </div>
                  {/* PIN/ZIP Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN/ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pinCode"
                      value={formData.pinCode || ""}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter PIN or ZIP code"
                      maxLength={6}
                    />
                    {errors.pinCode && <div className="text-red-500 text-sm mt-1">{errors.pinCode}</div>}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="flex items-center mb-2 mt-0">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              <h3 className="text-lg font-semibold text-gray-900">Bank Account Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 space-y-0">
              {/* Account Holder Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="bankDetails.accountHolderName"
                  value={formData.bankDetails.accountHolderName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter account holder name"
                />
                {errors['bankDetails.accountHolderName'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.accountHolderName']}</div>}
              </div>
              {/* Branch Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="bankDetails.branchName"
                  value={formData.bankDetails.branchName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter branch name"
                />
                {errors['bankDetails.branchName'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.branchName']}</div>}
              </div>
              {/* Bank Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name <span className="text-red-500">*</span></label>
                <select
                  name="bankDetails.bankName"
                  value={formData.bankDetails.bankName || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="PNB">Punjab National Bank</option>
                </select>
                {errors['bankDetails.bankName'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.bankName']}</div>}
              </div>
              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type <span className="text-red-500">*</span></label>
                <select
                  name="bankDetails.accountType"
                  value={formData.bankDetails.accountType || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select account type</option>
                  <option value="Savings">Savings</option>
                  <option value="Current">Current</option>
                  <option value="OD">Overdraft</option>
                </select>
                {errors['bankDetails.accountType'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.accountType']}</div>}
              </div>
              {/* Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter account number"
                  maxLength={18}
                />
                {errors['bankDetails.accountNumber'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.accountNumber']}</div>}
              </div>
              {/* Confirm Account Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Account Number <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={confirmAccountNumber}
                  onChange={handleConfirmAccountNumberChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Re-enter account number"
                  maxLength={18}
                />
                {errors.confirmAccountNumber && <div className="text-red-500 text-sm mt-1">{errors.confirmAccountNumber}</div>}
              </div>
              {/* IFSC Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="bankDetails.ifscCode"
                  value={formData.bankDetails.ifscCode || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="ENTER IFSC CODE"
                  maxLength={11}
                />
                <div className="text-xs text-gray-400 mt-1">11-character alphanumeric code</div>
                {errors['bankDetails.ifscCode'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.ifscCode']}</div>}
              </div>
              {/* UPI ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="bankDetails.upiId"
                  value={formData.bankDetails.upiId || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="example@paytm or example@upi"
                />
                <div className="text-xs text-gray-400 mt-1">For quick digital payments</div>
                {errors['bankDetails.upiId'] && <div className="text-red-500 text-sm mt-1">{errors['bankDetails.upiId']}</div>}
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  // --- Progress Bar ---
  const renderProgressBar = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between">
        {steps.map((s, idx) => {
          const isActive = step === idx + 1;
          const isCompleted = step > idx + 1;
          const isClickable = true; // allow clicking any step
          return (
            <div key={s.label} className="flex-1 flex items-center">
              <button
                type="button"
                onClick={() => isClickable && setStep(idx + 1)}
                className={`flex flex-col items-center w-[60%] focus:outline-none group`}
                tabIndex={0}
                aria-current={isActive ? 'step' : undefined}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300
                  ${isActive || isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-gray-400'}
                  group-hover:border-blue-500 group-hover:text-blue-600
                `}>
                  <span className="font-bold text-sm">{idx + 1}</span>
                </div>
                <span className={`mt-2 text-xs font-medium
                  ${isActive || isCompleted ? 'text-blue-600' : 'text-gray-500'}
                  group-hover:text-blue-600
                `}>{s.label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-1 mx-4 rounded transition-all duration-300
                  ${(idx + 1) < step ? 'bg-blue-600' : 'bg-gray-200'}
                `}></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setIsAtBottom(entry.isIntersecting),
      { root: null, threshold: 0.99 }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tagsDropdownRef.current && !tagsDropdownRef.current.contains(event.target)) {
        setShowTagsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tagsDropdownRef]);

  return (
    <form ref={formRef} className="w-full bg-white border border-gray-200 shadow-lg p-0 flex flex-col relative pb-6">
      {/* Progress Bar */}
      <div className="w-full px-8 pt-2">
        {renderProgressBar()}
      </div>
      {/* Step Content */}
      <div className="w-full px-8 pb-24 pt-2 flex-1">
        {renderStepContent()}
      </div>
      {/* Sentinel for IntersectionObserver */}
      <div ref={sentinelRef} style={{ height: 1 }} />
      {/* Sticky Action Bar (full width, flush with form edges) */}
      <div className="sticky bottom-0 z-20 w-full bg-white px-8 py-2 flex justify-between items-center">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          disabled={step === 1}
        >
          Back
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-6 py-2 border border-blue-300 rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
          >
            Save Draft
          </button>
          {step < steps.length ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.min(steps.length, s + 1))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddVendorForm;