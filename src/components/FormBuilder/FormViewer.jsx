import React, { useState, useEffect } from 'react';
import SmartField from './SmartField';
import { 
  Send, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Eye,
  EyeOff
} from 'lucide-react';

const FormViewer = ({ formId, formData: initialFormData, onSubmit, readonly = false }) => {
  const [formData, setFormData] = useState(initialFormData || null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(!initialFormData);

  // Demo form data if no form is provided
  const demoFormData = {
    formId: 'demo_form_1',
    title: 'Employee Feedback Form',
    description: 'Help us improve our workplace by sharing your feedback',
    fields: [
      {
        fieldId: 'name',
        label: 'Full Name',
        type: 'text',
        placeholder: 'Enter your full name',
        required: true,
        order: 1,
        customization: {
          transformation: { type: 'titleCase', applyOnInput: true }
        }
      },
      {
        fieldId: 'email',
        label: 'Email Address',
        type: 'email',
        placeholder: 'Enter your email',
        required: true,
        order: 2,
        customization: {
          inputHelper: {
            suffix: '@',
            showSuffixDropdown: true,
            suffixOptions: ['@company.com', '@gmail.com', '@outlook.com']
          }
        }
      },
      {
        fieldId: 'phone',
        label: 'Phone Number',
        type: 'tel',
        placeholder: 'Enter your phone number',
        required: false,
        order: 3,
        customization: {
          inputHelper: {
            showPrefixDropdown: true,
            prefixOptions: ['+1', '+44', '+91', '+86']
          },
          inputMask: { mask: 'phone' }
        }
      },
      {
        fieldId: 'department',
        label: 'Department',
        type: 'select',
        placeholder: 'Select your department',
        required: true,
        order: 4,
        options: [
          { value: 'hr', label: 'Human Resources' },
          { value: 'it', label: 'Information Technology' },
          { value: 'sales', label: 'Sales' },
          { value: 'marketing', label: 'Marketing' },
          { value: 'finance', label: 'Finance' }
        ]
      },
      {
        fieldId: 'satisfaction',
        label: 'Overall Satisfaction',
        type: 'radio',
        placeholder: 'Rate your satisfaction',
        required: true,
        order: 5,
        options: [
          { value: 'very_satisfied', label: 'Very Satisfied' },
          { value: 'satisfied', label: 'Satisfied' },
          { value: 'neutral', label: 'Neutral' },
          { value: 'dissatisfied', label: 'Dissatisfied' },
          { value: 'very_dissatisfied', label: 'Very Dissatisfied' }
        ]
      },
      {
        fieldId: 'improvements',
        label: 'Areas for Improvement',
        type: 'checkbox',
        placeholder: 'Select areas that need improvement',
        required: false,
        order: 6,
        options: [
          { value: 'communication', label: 'Communication' },
          { value: 'work_environment', label: 'Work Environment' },
          { value: 'benefits', label: 'Benefits' },
          { value: 'training', label: 'Training & Development' },
          { value: 'management', label: 'Management' }
        ]
      },
      {
        fieldId: 'feedback',
        label: 'Additional Feedback',
        type: 'textarea',
        placeholder: 'Share any additional thoughts or suggestions...',
        required: false,
        order: 7,
        customization: {
          validation: { maxLength: 500 }
        }
      },
      {
        fieldId: 'anonymous',
        label: 'Submit Anonymously',
        type: 'checkbox',
        placeholder: 'Keep my identity private',
        required: false,
        order: 8
      }
    ],
    settings: {
      allowSaveProgress: true,
      showProgressBar: true,
      submitButtonText: 'Submit Feedback',
      successMessage: 'Thank you for your feedback!',
      errorMessage: 'Please fix the errors below and try again.'
    }
  };

  useEffect(() => {
    if (!initialFormData) {
      // Simulate loading demo data
      setTimeout(() => {
        setFormData(demoFormData);
        setLoading(false);
      }, 1000);
    }
  }, [initialFormData]);

  const handleFieldChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldId]) {
      setErrors(prev => ({
        ...prev,
        [fieldId]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    formData.fields.forEach(field => {
      if (field.required && !formValues[field.fieldId]) {
        newErrors[field.fieldId] = `${field.label} is required`;
      }
      
      // Email validation
      if (field.type === 'email' && formValues[field.fieldId]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues[field.fieldId])) {
          newErrors[field.fieldId] = 'Please enter a valid email address';
        }
      }
      
      // Phone validation
      if (field.type === 'tel' && formValues[field.fieldId]) {
        const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
        if (!phoneRegex.test(formValues[field.fieldId])) {
          newErrors[field.fieldId] = 'Please enter a valid phone number';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const submissionData = {
        formId: formData.formId,
        values: formValues,
        submittedAt: new Date().toISOString(),
        submissionId: `sub_${Date.now()}`
      };
      
      if (onSubmit) {
        await onSubmit(submissionData);
      }
      
      console.log('Form submitted:', submissionData);
      setSubmitStatus('success');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormValues({});
        setSubmitStatus(null);
      }, 3000);
      
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProgress = () => {
    const progressData = {
      formId: formData.formId,
      values: formValues,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`form_progress_${formData.formId}`, JSON.stringify(progressData));
    setSubmitStatus('saved');
    
    setTimeout(() => {
      setSubmitStatus(null);
    }, 2000);
  };

  const getCompletionPercentage = () => {
    const totalFields = formData.fields.filter(f => f.required).length;
    const completedFields = formData.fields.filter(f => 
      f.required && formValues[f.fieldId]
    ).length;
    
    return Math.round((completedFields / totalFields) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Form Not Found</h2>
          <p className="text-gray-600">The requested form could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Form Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">📋</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{formData.title}</h1>
                  <p className="text-gray-600">{formData.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center space-x-1 px-3 py-1 text-gray-600 hover:text-gray-900 border rounded-md"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span>{showPreview ? 'Hide' : 'Show'} Preview</span>
                </button>
                
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  Demo Form
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            {formData.settings?.showProgressBar && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage()}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          <form onSubmit={handleSubmit} className="p-6">
            {/* Status Messages */}
            {submitStatus && (
              <div className={`mb-6 p-4 rounded-lg flex items-center space-x-2 ${
                submitStatus === 'success' ? 'bg-green-50 text-green-800' :
                submitStatus === 'error' ? 'bg-red-50 text-red-800' :
                'bg-blue-50 text-blue-800'
              }`}>
                {submitStatus === 'success' && <CheckCircle size={20} />}
                {submitStatus === 'error' && <AlertCircle size={20} />}
                {submitStatus === 'saved' && <Save size={20} />}
                <span>
                  {submitStatus === 'success' && (formData.settings?.successMessage || 'Form submitted successfully!')}
                  {submitStatus === 'error' && (formData.settings?.errorMessage || 'Please fix the errors and try again.')}
                  {submitStatus === 'saved' && 'Progress saved successfully!'}
                </span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              {formData.fields
                .sort((a, b) => a.order - b.order)
                .map((field) => (
                  <div key={field.fieldId} className="space-y-2">
                    <SmartField
                      field={field}
                      value={formValues[field.fieldId] || ''}
                      onChange={(value) => handleFieldChange(field.fieldId, value)}
                      isPreview={true}
                    />
                    {errors[field.fieldId] && (
                      <p className="text-red-600 text-sm flex items-center space-x-1">
                        <AlertCircle size={14} />
                        <span>{errors[field.fieldId]}</span>
                      </p>
                    )}
                  </div>
                ))}
            </div>

            {/* Form Actions */}
            {!readonly && (
              <div className="mt-8 flex items-center justify-between pt-6 border-t">
                <div className="flex items-center space-x-4">
                  {formData.settings?.allowSaveProgress && (
                    <button
                      type="button"
                      onClick={handleSaveProgress}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      <Save size={16} />
                      <span>Save Progress</span>
                    </button>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    {getCompletionPercentage()}% completed
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>{formData.settings?.submitButtonText || 'Submit Form'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Preview Data */}
        {showPreview && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Data Preview</h3>
              <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-x-auto">
                {JSON.stringify(formValues, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormViewer; 