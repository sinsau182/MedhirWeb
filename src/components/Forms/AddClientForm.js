import { useState } from 'react';
import { FaSave, FaTimes, FaUsers, FaInfoCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addCustomer } from '@/redux/slices/customerSlice';
import { toast } from 'sonner';

const AddClientForm = ({ onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    customerName: '',
    companyName: '',
    email: '',
    contactNumber: '',
    address: '',
    gst: '', // NEW FIELD
    addressDetails: {
      address: '',
      city: '',
      state: ''
    }
  });

  const [errors, setErrors] = useState({});
  const indianStates = ['Maharashtra', 'Karnataka', 'Delhi', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Rajasthan', 'Madhya Pradesh', 'West Bengal', 'Andhra Pradesh', 'Telangana', 'Kerala', 'Punjab', 'Haryana', 'Bihar', 'Odisha', 'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh', 'Tripura', 'Meghalaya', 'Manipur', 'Nagaland', 'Goa', 'Arunachal Pradesh', 'Mizoram', 'Sikkim'];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'customerName') {
      const sanitized = value.toUpperCase().replace(/[^A-Z\s]/g, '');
      setFormData((prev) => ({ ...prev, customerName: sanitized }));
    } else if (name === 'contactNumber') {
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, contactNumber: digitsOnly }));
    } else if (name === 'gst') {
      const sanitized = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
      setFormData((prev) => ({ ...prev, gst: sanitized }));
    } else if (name.startsWith('addressDetails.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        addressDetails: {
          ...prev.addressDetails,
          [field]: value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateGST = (gst) => {
    const normalized = (gst || '').toUpperCase().trim();
    if (normalized === '') return true; // Optional
    const gstRegex = /^[0-3][0-9][A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
    return gstRegex.test(normalized);
  };

  const validateEmail = (email) => {
    const trimmed = (email || '').trim();
    if (trimmed === '') return true; // Optional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  };

  const validateContactNumber = (num) => {
    return /^\d{10}$/.test(num || '');
  };

  const validateCustomerName = (name) => {
    const normalized = (name || '').trim();
    if (normalized.length === 0) return false;
    return /^[A-Z\s]+$/.test(normalized);
  };
  const validateForm = () => {
    const newErrors = {};
    if (!validateCustomerName(formData.customerName)) {
      newErrors.customerName = 'Customer name must be uppercase letters and spaces only';
    }
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.contactNumber.trim() && !validateContactNumber(formData.contactNumber)) {
      newErrors.contactNumber = 'Contact number must be exactly 10 digits';
    }
    if (formData.gst && !validateGST(formData.gst)) newErrors.gst = 'Invalid GST number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Prepare the data according to the API structure
        const customerData = {
          customerName: formData.customerName,
          companyName: formData.companyName,
          email: formData.email.trim() || '',
          contactNumber: formData.contactNumber,
          address: formData.address,
          addressDetails: {
            address: formData.addressDetails.address || formData.address,
            city: formData.addressDetails.city,
            state: formData.addressDetails.state
          }
        };

        await dispatch(addCustomer(customerData)).unwrap();
        toast.success('Customer added successfully!');
        if (onSubmit) {
          onSubmit(customerData);
        }
      } catch (error) {
        const message = typeof error === 'string' ? error : (error?.message || '');
        const fieldErrors = {};
        if (/email/i.test(message) && /exist/i.test(message)) {
          fieldErrors.email = 'Email already exists';
        }
        if (/(phone|mobile|contact)/i.test(message) && /exist/i.test(message)) {
          fieldErrors.contactNumber = 'Phone number already exists';
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(prev => ({ ...prev, ...fieldErrors }));
        } else {
          toast.error('Failed to add customer: ' + (message || 'Unknown error'));
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information<span className="text-red-500">*</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label>Customer Name <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="customerName" 
                      value={formData.customerName} 
                      onChange={handleChange} 
                      className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.customerName ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <div className="text-xs text-gray-400 mt-1">Only uppercase letters and spaces (e.g., JOHN DOE)</div>
                    {errors.customerName && <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>}
                </div>
                <div>
                    <label>Company Name</label>
                    <input 
                      type="text" 
                      name="companyName" 
                      value={formData.companyName} 
                      onChange={handleChange} 
                      className="w-full mt-2 px-4 py-2 border rounded-lg" 
                    />
                </div>
                 <div>
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <div className="text-xs text-gray-400 mt-1">Format: username@domain.com</div>
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                 <div>
                    <label>Contact Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="contactNumber" 
                      value={formData.contactNumber} 
                      onChange={handleChange} 
                      inputMode="numeric"
                      maxLength={10}
                      className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    <div className="text-xs text-gray-400 mt-1">Format: 10 digits only (e.g., 9876543210)</div>
                    {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                </div>
                <div>
                    <label>GST Number <span className="text-gray-400 text-xs">(Optional)</span></label>
                    <input
                      type="text"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.gst ? 'border-red-500' : 'border-gray-300'}`}
                      maxLength={15}
                    />
                    <div className="text-xs text-gray-400 mt-1">Format: 27AAECS1234F1Z2 (15 characters length)</div>
                    {errors.gst && <p className="text-red-500 text-sm mt-1">{errors.gst}</p>}
                </div>
            </div>
        </div>
         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Address Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label>Address</label>
                    <input 
                      type="text" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      className="w-full mt-2 px-4 py-2 border rounded-lg" 
                    />
                </div>
                 <div>
                    <label>City</label>
                    <input 
                      type="text" 
                      name="addressDetails.city" 
                      value={formData.addressDetails.city} 
                      onChange={handleChange} 
                      className="w-full mt-2 px-4 py-2 border rounded-lg" 
                    />
                </div>
                <div>
                    <label>State</label>
                    <select 
                      name="addressDetails.state" 
                      value={formData.addressDetails.state} 
                      onChange={handleChange} 
                      className="w-full mt-2 px-4 py-2 border rounded-lg"
                    >
                        <option value="">Select State</option>
                        {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>
        </div>
        <div className="flex justify-end space-x-4">
            <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-purple-600 text-white rounded-lg">
              Save Customer
            </button>
        </div>
      </div>
    </form>
  );
};
export default AddClientForm; 