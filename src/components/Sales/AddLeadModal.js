import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';
import { FaRupeeSign } from 'react-icons/fa';

const projectTypes = [
  '2BHK Flat',
  '3BHK Flat',
  '4BHK Flat',
  '2BHK Villa',
  '3BHK Villa',
  '4BHK Villa'
];

const sources = [
  'Website',
  'Facebook',
  'Instagram',
  'Google Ads',
  'Referral',
  'Walk-in',
  'Phone Call',
  'Email',
  'Other'
];

const priorityOptions = [
  { value: 'Low', label: 'Low', stars: 1, color: 'text-gray-400' },
  { value: 'Medium', label: 'Medium', stars: 2, color: 'text-orange-400' },
  { value: 'High', label: 'High', stars: 3, color: 'text-yellow-400' },
];

const AddLeadModal = ({ isOpen, onClose, onSubmit, initialData, isManagerView = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    projectType: '',
    address: '',
    area: '',
    budget: '',
    designStyle: '',
    leadSource: '',
    notes: '',
    priority: 'Low',
    rating: 0,
    salesRep: null,
    designer: null,
    callDescription: null,
    callHistory: [],
    nextCall: null,
    quotedAmount: null,
    finalQuotation: null,
    signupAmount: null,
    paymentDate: null,
    paymentMode: null,
    panNumber: null,
    discount: null,
    reasonForLost: null,
    reasonForJunk: null,
    submittedBy: null,
    paymentDetailsFileName: null,
    bookingFormFileName: null,
    dateOfCreation: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, area: initialData.area || '', priority: initialData.priority || 'Low', dateOfCreation: initialData.dateOfCreation || new Date().toISOString().split('T')[0] });
    }
  }, [initialData]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        projectType: '',
        address: '',
        area: '',
        budget: '',
        designStyle: '',
        leadSource: '',
        notes: '',
        priority: 'Low',
        rating: 0,
        salesRep: null,
        designer: null,
        callDescription: null,
        callHistory: [],
        nextCall: null,
        quotedAmount: null,
        finalQuotation: null,
        signupAmount: null,
        paymentDate: null,
        paymentMode: null,
        panNumber: null,
        discount: null,
        reasonForLost: null,
        reasonForJunk: null,
        submittedBy: null,
        paymentDetailsFileName: null,
        bookingFormFileName: null,
        dateOfCreation: new Date().toISOString().split('T')[0],
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Name must be less than 50 characters';
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = 'Name can only contain letters and spaces';
    }

    // Contact number validation
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Contact number must be exactly 10 digits';
    } else if (formData.contactNumber.replace(/\D/g, '').startsWith('0')) {
      newErrors.contactNumber = 'Contact number cannot start with 0';
    }

    // Alternate phone validation
    if (formData.alternatePhone.trim()) {
      if (!/^\d{10}$/.test(formData.alternatePhone.replace(/\D/g, ''))) {
        newErrors.alternatePhone = 'Alternate phone must be exactly 10 digits';
      } else if (formData.alternatePhone.replace(/\D/g, '').startsWith('0')) {
        newErrors.alternatePhone = 'Alternate phone cannot start with 0';
      } else if (formData.alternatePhone.replace(/\D/g, '') === formData.contactNumber.replace(/\D/g, '')) {
        newErrors.alternatePhone = 'Alternate phone cannot be same as main contact number';
      }
    }

    // Email validation
    if (formData.email.trim()) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      } else if (formData.email.trim().length > 100) {
        newErrors.email = 'Email must be less than 100 characters';
      }
    }

    // Project type validation
    if (!formData.projectType) {
      newErrors.projectType = 'Project type is required';
    }

    // Lead source validation
    if (!formData.leadSource) {
      newErrors.leadSource = 'Lead source is required';
    }

    // Budget validation
    if (formData.budget.trim()) {
      const budgetValue = parseFloat(formData.budget.replace(/[^\d.]/g, ''));
      if (isNaN(budgetValue) || budgetValue < 0) {
        newErrors.budget = 'Budget must be a valid positive number';
      } else if (budgetValue > 999999999) {
        newErrors.budget = 'Budget cannot exceed 999,999,999';
      }
    }

    // Address validation
    if (formData.address.trim()) {
      if (formData.address.trim().length < 10) {
        newErrors.address = 'Address must be at least 10 characters';
      } else if (formData.address.trim().length > 200) {
        newErrors.address = 'Address must be less than 200 characters';
      }
    }

    // Area validation
    if (formData.area.trim()) {
      if (formData.area.trim().length < 2) {
        newErrors.area = 'Area must be at least 2 characters';
      } else if (formData.area.trim().length > 50) {
        newErrors.area = 'Area must be less than 50 characters';
      }
    }

    // Notes validation
    if (formData.notes.trim()) {
      if (formData.notes.trim().length > 500) {
        newErrors.notes = 'Notes must be less than 500 characters';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error adding lead:', error);
    }
  };

  const handleInputChange = (field, value) => {
    let processedValue = value;

    // Apply input restrictions based on field type
    switch (field) {
      case 'name':
        // Only allow letters and spaces, max 50 characters
        processedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
        break;
      
      case 'contactNumber':
      case 'alternatePhone':
        // Only allow digits, max 10 characters
        processedValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      
      case 'email':
        // Allow email characters, max 100 characters
        processedValue = value.slice(0, 100);
        break;
      
      case 'budget':
        // Only allow numbers and decimal point
        processedValue = value.replace(/[^\d.]/g, '');
        // Prevent multiple decimal points
        const decimalCount = (processedValue.match(/\./g) || []).length;
        if (decimalCount > 1) {
          processedValue = processedValue.replace(/\.+$/, '');
        }
        break;
      
      case 'address':
        // Allow alphanumeric, spaces, and common address characters
        processedValue = value.replace(/[^a-zA-Z0-9\s,.-]/g, '').slice(0, 200);
        break;
      
      case 'area':
        // Allow letters, spaces, and numbers
        processedValue = value.replace(/[^a-zA-Z0-9\s]/g, '').slice(0, 50);
        break;
      
      case 'notes':
        // Allow all characters but limit length
        processedValue = value.slice(0, 500);
        break;
      
      default:
        processedValue = value;
    }

    setFormData(prev => ({
      ...prev,
      [field]: processedValue
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 w-full max-w-lg max-h-[70vh] h-auto flex flex-col border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              {initialData?.leadId ? 'Edit Lead' : 'Add New Lead'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable form content with extra bottom padding */}
          <div className="p-5 space-y-4 flex-1 overflow-y-auto bg-gray-50">
            {/* Name Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Name <span className="text-blue-500 font-bold">*</span>
              </label>
              <Input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Contact Number Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contact Number <span className="text-blue-500 font-bold">*</span>
              </label>
              <Input
                type="tel"
                placeholder="Enter contact number"
                value={formData.contactNumber}
                onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.contactNumber ? 'border-red-500' : ''}`}
              />
              {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
            </div>

            {/* Alternate Phone Number Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alternate Phone Number
              </label>
              <Input
                type="tel"
                placeholder="Enter alternate phone number"
                value={formData.alternatePhone}
                onChange={(e) => handleInputChange('alternatePhone', e.target.value)}
                className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.alternatePhone ? 'border-red-500' : ''}`}
              />
              {errors.alternatePhone && <p className="text-red-500 text-xs mt-1">{errors.alternatePhone}</p>}
            </div>

            
            {/* Project Type Field */}
            <div className='grid grid-cols-2 gap-4'>
              <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project Type <span className="text-blue-500 font-bold">*</span>
              </label>
              <Select
                value={formData.projectType}
                onValueChange={value => handleInputChange('projectType', value)}
              >
                <SelectTrigger className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.projectType ? 'border-red-500' : ''} hover:border-blue-400` }>
                  <SelectValue placeholder="Select project type" />
                </SelectTrigger>
                <SelectContent className="rounded-lg shadow-lg">
                  {projectTypes.map(type => (
                    <SelectItem key={type} value={type} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.projectType && <p className="text-red-500 text-xs mt-1">{errors.projectType}</p>}
              </div>
              <div> <label className="block text-xs font-medium text-gray-700 mb-1">
                  Lead Source <span className="text-blue-500 font-bold">*</span>
                </label>
                <Select
                  value={formData.leadSource}
                  onValueChange={value => handleInputChange('leadSource', value)}
                >
                  <SelectTrigger className={`border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 ${errors.leadSource ? 'border-red-500' : ''} hover:border-blue-400`}>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {sources.map(source => (
                      <SelectItem key={source} value={source} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.leadSource && <p className="text-red-500 text-xs mt-1">{errors.leadSource}</p>}</div>
               
            </div>

                        {/* Budget Field with Rupee Icon */}
                        <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Estimated Budget
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <FaRupeeSign className="w-4 h-4" />
                </span>
                <Input
                  type="text"
                  placeholder="Enter estimated project budget"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 pl-8"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
              />
            </div>


            {/* Project Address Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Project Address
              </label>
              <Input
                type="text"
                placeholder="Enter project address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
              />
            </div>
            

            {/* Priority Row (replaces Status) */}
            <div className="grid grid-cols-2 gap-4 items-end">

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Priority
                  <span className="flex items-center ml-1">
                    {(() => {
                      const selected = priorityOptions.find(p => p.value === formData.priority) || priorityOptions[0];
                      return Array.from({ length: 3 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < selected.stars ? selected.color : 'text-gray-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" />
                        </svg>
                      ));
                    })()}
                  </span>
                </label>
                <Select
                  value={formData.priority}
                  onValueChange={value => handleInputChange('priority', value)}
                >
                  <SelectTrigger className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 hover:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-lg shadow-lg">
                    {priorityOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value} className="text-xs hover:bg-blue-50 focus:bg-blue-100 rounded-md">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Area Field (optional) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Area (sq. ft.) <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                type="number"
                min="0"
                placeholder="Enter area in sq. ft."
                value={formData.area}
                onChange={(e) => handleInputChange('area', e.target.value)}
                className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
              />
            </div>
            </div>

            {/* Design Style and Date of Creation Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Design Style
                </label>
                <Input
                  type="text"
                  placeholder="Enter design style preference"
                  value={formData.designStyle}
                  onChange={(e) => handleInputChange('designStyle', e.target.value)}
                  className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Date of Creation
                </label>
                  <Input
                    type="date"
                    value={formData.dateOfCreation}
                    onChange={e => handleInputChange('dateOfCreation', e.target.value)}
                  className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150"
                  />
              </div>
            </div>

            

            {/* Notes Field */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Input
                as="textarea"
                placeholder="Enter any additional notes or requirements"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 min-h-[36px]"
              />
            </div>
          </div>

          {/* Sticky footer for action buttons, outside scrollable area */}
          <div className="bg-white border-t shadow-lg flex items-center justify-end gap-2 p-4 z-10 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                handleSubmit();
              }}
              className="px-3 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 text-xs transition-all duration-150"
            >
              {initialData?.leadId ? 'Update Lead' : 'Add Lead'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddLeadModal;