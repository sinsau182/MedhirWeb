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
    if (name.startsWith('addressDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        addressDetails: {
          ...prev.addressDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateGST = (gst) => {
    // GSTIN: 15 chars, alphanumeric, format: 2 digits + 10 chars + 1 char + Z + 1 char
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}Z[A-Z0-9]{1}$/i;
    return gst.trim() === '' || gstRegex.test(gst.trim());
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = 'Customer name is required';
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
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
        toast.error('Failed to add customer: ' + (error?.message || 'Unknown error'));
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
                      placeholder="Optional"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                 <div>
                    <label>Contact Number <span className="text-red-500">*</span></label>
                    <input 
                      type="tel" 
                      name="contactNumber" 
                      value={formData.contactNumber} 
                      onChange={handleChange} 
                      className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`} 
                    />
                    {errors.contactNumber && <p className="text-red-500 text-sm mt-1">{errors.contactNumber}</p>}
                </div>
                <div>
                    <label>GST Number</label>
                    <input
                      type="text"
                      name="gst"
                      value={formData.gst}
                      onChange={handleChange}
                      className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.gst ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Optional"
                      maxLength={15}
                    />
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