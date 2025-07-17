import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';

const DynamicFormModal = ({ 
  isOpen, 
  onClose, 
  formData, 
  leadId, 
  onSubmit, 
  loading = false 
}) => {
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && formData) {
      // Initialize form values
      const initialValues = {};
      formData.fields?.forEach(field => {
        initialValues[field.fieldId] = '';
      });
      setFormValues(initialValues);
      setErrors({});
    }
  }, [isOpen, formData]);

  const handleInputChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    formData.fields?.forEach(field => {
      const value = formValues[field.fieldId];
      
      if (field.required && (!value || value.trim() === '')) {
        newErrors[field.fieldId] = `${field.label} is required`;
      }
      
      // Email validation
      if (field.fieldType === 'EMAIL' && value && !/\S+@\S+\.\S+/.test(value)) {
        newErrors[field.fieldId] = 'Please enter a valid email address';
      }
      
      // Number validation
      if (field.fieldType === 'NUMBER' && value && isNaN(value)) {
        newErrors[field.fieldId] = 'Please enter a valid number';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      await onSubmit(formValues);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const renderFormField = (field) => {
    const fieldId = field.fieldId;
    const value = formValues[fieldId] || '';
    const fieldError = errors[fieldId];
    const required = field.required;
    const placeholder = field.placeholder || '';
    const helpText = field.helpText;

    const baseInputProps = {
      id: fieldId,
      name: fieldId,
      value: value,
      onChange: (e) => handleInputChange(fieldId, e.target.value),
      placeholder: placeholder,
      className: `w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        fieldError ? 'border-red-500' : 'border-gray-300'
      }`,
      required: required
    };

    switch (field.fieldType) {
      case 'TEXT':
        return (
          <input
            type="text"
            {...baseInputProps}
          />
        );

      case 'EMAIL':
        return (
          <input
            type="email"
            {...baseInputProps}
          />
        );

      case 'PHONE':
        return (
          <input
            type="tel"
            {...baseInputProps}
          />
        );

      case 'NUMBER':
        return (
          <input
            type="number"
            {...baseInputProps}
          />
        );

      case 'PASSWORD':
        return (
          <input
            type="password"
            {...baseInputProps}
          />
        );

      case 'URL':
        return (
          <input
            type="url"
            {...baseInputProps}
          />
        );

      case 'TEXTAREA':
        return (
          <textarea
            {...baseInputProps}
            rows="3"
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'SELECT':
        return (
          <select
            {...baseInputProps}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'RADIO':
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={fieldId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleInputChange(fieldId, e.target.value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'CHECKBOX':
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name={fieldId}
              checked={value === 'true'}
              onChange={(e) => handleInputChange(fieldId, e.target.checked ? 'true' : 'false')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500"
            />
            <span>{field.label}</span>
          </label>
        );

      case 'DATE':
        return (
          <input
            type="date"
            {...baseInputProps}
          />
        );

      case 'TIME':
        return (
          <input
            type="time"
            {...baseInputProps}
          />
        );

      case 'DATETIME':
        return (
          <input
            type="datetime-local"
            {...baseInputProps}
          />
        );

      case 'FILE':
        return (
          <input
            type="file"
            onChange={(e) => handleInputChange(fieldId, e.target.files[0]?.name || '')}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              fieldError ? 'border-red-500' : 'border-gray-300'
            }`}
          />
        );

      case 'COLOR':
        return (
          <input
            type="color"
            {...baseInputProps}
            className="w-full h-10 border rounded-md cursor-pointer"
          />
        );

      case 'RANGE':
        return (
          <input
            type="range"
            min="0"
            max="100"
            {...baseInputProps}
            className="w-full"
          />
        );

      default:
        return (
          <input
            type="text"
            {...baseInputProps}
          />
        );
    }
  };

  if (!isOpen || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{formData.formTitle}</h2>
            {formData.formDescription && (
              <p className="text-sm text-gray-600 mt-1">{formData.formDescription}</p>
            )}
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formData.fields?.map((field, index) => {
              const fieldError = errors[field.fieldId];
              return (
                <div key={field.fieldId || index} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {renderFormField(field)}
                  
                  {fieldError && (
                    <p className="text-sm text-red-600">{fieldError}</p>
                  )}
                  
                  {field.helpText && (
                    <p className="text-sm text-gray-600">{field.helpText}</p>
                  )}
                </div>
              );
            })}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Form'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DynamicFormModal; 