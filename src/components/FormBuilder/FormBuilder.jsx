import React, { useState, useEffect } from 'react';
import SmartField from './SmartField';
import { 
  Plus, 
  Save, 
  Eye, 
  Code, 
  Settings, 
  Palette, 
  FileText, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  Hash, 
  Type, 
  CheckSquare, 
  Circle, 
  List, 
  Upload,
  DollarSign,
  Clock,
  MapPin,
  User
} from 'lucide-react';

const FormBuilder = () => {
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({
    title: 'Untitled Form',
    description: '',
    companyId: 'your-company-id'
  });
  const [activeTab, setActiveTab] = useState('builder');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Smart Field Templates
  const fieldTemplates = [
    {
      templateId: 'text-basic',
      name: 'Text Field',
      icon: <Type size={20} />,
      description: 'Basic text input',
      type: 'text',
      smartFeatures: ['Auto-capitalize', 'Validation'],
      customization: {
        transformation: { type: 'titleCase', applyOnInput: true },
        validation: { required: true, minLength: 2 }
      }
    },
    {
      templateId: 'email-smart',
      name: 'Smart Email',
      icon: <Mail size={20} />,
      description: 'Email with auto-complete',
      type: 'email',
      smartFeatures: ['Auto-suffix', 'Validation', 'Domain suggestions'],
      customization: {
        inputHelper: {
          suffix: '@',
          showSuffixDropdown: true,
          suffixOptions: ['@gmail.com', '@outlook.com', '@yahoo.com', '@company.com']
        },
        validation: { required: true, pattern: 'email' }
      }
    },
    {
      templateId: 'phone-smart',
      name: 'Smart Phone',
      icon: <Phone size={20} />,
      description: 'Phone with country codes',
      type: 'tel',
      smartFeatures: ['Country codes', 'Auto-format', 'Validation'],
      customization: {
        inputHelper: {
          showPrefixDropdown: true,
          prefixOptions: ['+1', '+44', '+91', '+86', '+33']
        },
        inputMask: { mask: 'phone' },
        realTimeFormat: { formatExample: '+1 (123) 456-7890' }
      }
    },
    {
      templateId: 'currency-smart',
      name: 'Currency Field',
      icon: <DollarSign size={20} />,
      description: 'Money input with symbols',
      type: 'number',
      smartFeatures: ['Currency symbols', 'Auto-format', 'Validation'],
      customization: {
        inputHelper: {
          showPrefixDropdown: true,
          prefixOptions: ['$', '€', '£', '₹', '¥']
        },
        validation: { required: true, min: 0 }
      }
    },
    {
      templateId: 'url-smart',
      name: 'Smart URL',
      icon: <Globe size={20} />,
      description: 'URL with protocol prefix',
      type: 'url',
      smartFeatures: ['Protocol prefix', 'Auto-validation'],
      customization: {
        inputHelper: {
          showPrefixDropdown: true,
          prefixOptions: ['https://', 'http://', 'ftp://']
        },
        validation: { required: true, pattern: 'url' }
      }
    },
    {
      templateId: 'date-smart',
      name: 'Date Picker',
      icon: <Calendar size={20} />,
      description: 'Enhanced date input',
      type: 'date',
      smartFeatures: ['Date validation', 'Min/Max dates'],
      customization: {
        validation: { required: true, type: 'date' }
      }
    },
    {
      templateId: 'number-smart',
      name: 'Number Field',
      icon: <Hash size={20} />,
      description: 'Numeric input with validation',
      type: 'number',
      smartFeatures: ['Min/Max validation', 'Step control'],
      customization: {
        validation: { required: true, type: 'number' }
      }
    },
    {
      templateId: 'textarea-smart',
      name: 'Text Area',
      icon: <FileText size={20} />,
      description: 'Multi-line text input',
      type: 'textarea',
      smartFeatures: ['Character count', 'Auto-resize'],
      customization: {
        validation: { required: true, maxLength: 500 }
      }
    },
    {
      templateId: 'select-smart',
      name: 'Dropdown',
      icon: <List size={20} />,
      description: 'Select from options',
      type: 'select',
      smartFeatures: ['Search options', 'Multiple selection'],
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      customization: {
        validation: { required: true }
      }
    },
    {
      templateId: 'checkbox-smart',
      name: 'Checkbox',
      icon: <CheckSquare size={20} />,
      description: 'Single or multiple checkboxes',
      type: 'checkbox',
      smartFeatures: ['Conditional logic', 'Validation'],
      customization: {
        validation: { required: true }
      }
    },
    {
      templateId: 'radio-smart',
      name: 'Radio Group',
      icon: <Circle size={20} />,
      description: 'Single choice selection',
      type: 'radio',
      smartFeatures: ['Conditional logic', 'Custom styling'],
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ],
      customization: {
        validation: { required: true }
      }
    },
    {
      templateId: 'file-smart',
      name: 'File Upload',
      icon: <Upload size={20} />,
      description: 'File upload with validation',
      type: 'file',
      smartFeatures: ['File type validation', 'Size limits', 'Multiple files'],
      customization: {
        validation: { required: true, fileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'] }
      }
    }
  ];

  const addFieldToForm = (template) => {
    const newField = {
      ...template,
      fieldId: `field_${Date.now()}`,
      order: formFields.length + 1,
      label: template.name,
      placeholder: `Enter ${template.name.toLowerCase()}...`,
      required: template.customization?.validation?.required || false,
      isVisible: true
    };
    setFormFields([...formFields, newField]);
  };

  const updateField = (fieldId, updatedField) => {
    setFormFields(fields => 
      fields.map(field => 
        field.fieldId === fieldId ? { ...field, ...updatedField } : field
      )
    );
  };

  const deleteField = (fieldId) => {
    setFormFields(fields => fields.filter(field => field.fieldId !== fieldId));
  };

  const duplicateField = (field) => {
    const duplicatedField = {
      ...field,
      fieldId: `field_${Date.now()}`,
      order: formFields.length + 1,
      label: `${field.label} (Copy)`
    };
    setFormFields([...formFields, duplicatedField]);
  };

  const moveField = (dragIndex, hoverIndex) => {
    const dragField = formFields[dragIndex];
    const newFields = [...formFields];
    newFields.splice(dragIndex, 1);
    newFields.splice(hoverIndex, 0, dragField);
    setFormFields(newFields);
  };

  const saveForm = async () => {
    try {
      const formRequest = {
        ...formData,
        fields: formFields.map((field, index) => ({
          fieldId: field.fieldId,
          label: field.label,
          type: field.type,
          placeholder: field.placeholder,
          required: field.required,
          order: index + 1,
          customization: field.customization,
          options: field.options,
          isVisible: field.isVisible
        }))
      };
      
      console.log('Saving form:', formRequest);
      alert('Form saved successfully!');
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    }
  };

  const exportForm = () => {
    const exportData = {
      formData,
      formFields,
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${formData.title.replace(/\s+/g, '_')}_form.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const renderTemplateCard = (template) => (
    <div 
      key={template.templateId}
      className={`group p-4 bg-white rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 ${
        selectedTemplate?.templateId === template.templateId ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
      onClick={() => setSelectedTemplate(template)}
      onDoubleClick={() => addFieldToForm(template)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          {template.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{template.name}</div>
          <div className="text-sm text-gray-500 mt-1">{template.description}</div>
          
          {template.smartFeatures && (
            <div className="flex flex-wrap gap-1 mt-2">
              {template.smartFeatures.slice(0, 2).map((feature, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  ✨ {feature}
                </span>
              ))}
              {template.smartFeatures.length > 2 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{template.smartFeatures.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            addFieldToForm(template);
          }}
          className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          <Plus size={14} />
          <span>Add Field</span>
        </button>
        <div className="text-xs text-gray-400">Double-click to add</div>
      </div>
    </div>
  );

  const renderFormCanvas = () => (
    <div className="h-full flex flex-col">
      {/* Form Header */}
      <div className="p-6 bg-white border-b">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          className="w-full text-2xl font-bold text-gray-900 border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none px-0 py-2"
          placeholder="Form Title"
        />
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full mt-2 text-gray-600 border-0 border-b border-transparent hover:border-gray-200 focus:border-blue-500 focus:outline-none px-0 py-1"
          placeholder="Form description (optional)"
        />
      </div>

      {/* Form Fields */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="space-y-4">
          {formFields.map((field, index) => (
            <div key={field.fieldId} className="group">
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <SmartField 
                  field={field} 
                  onChange={(value) => console.log(`Field ${field.fieldId}:`, value)}
                  onUpdate={(updatedField) => updateField(field.fieldId, updatedField)}
                  onDelete={() => deleteField(field.fieldId)}
                  onDuplicate={() => duplicateField(field)}
                />
              </div>
            </div>
          ))}
        </div>
        
        {formFields.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No fields yet</h3>
            <p className="text-sm">Add fields from the template palette on the left to start building your form</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {formFields.length > 0 && (
        <div className="p-6 bg-white border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{formFields.length} fields</span>
              <span>•</span>
              <span>{formFields.filter(f => f.required).length} required</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportForm}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Code size={16} />
                <span>Export</span>
              </button>
              <button
                onClick={saveForm}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Save size={16} />
                <span>Save Form</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-6 bg-white border-b">
        <h1 className="text-2xl font-bold text-gray-900">{formData.title}</h1>
        {formData.description && (
          <p className="mt-2 text-gray-600">{formData.description}</p>
        )}
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {formFields.filter(field => field.isVisible).map((field, index) => (
            <div key={field.fieldId} className="bg-white p-4 rounded-lg border">
              <SmartField 
                field={field} 
                onChange={(value) => console.log(`Preview Field ${field.fieldId}:`, value)}
                isPreview={true}
              />
            </div>
          ))}
        </div>
        
        {formFields.filter(field => field.isVisible).length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">👁️</div>
            <h3 className="text-lg font-medium mb-2">No visible fields</h3>
            <p className="text-sm">Add and make fields visible to see the preview</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Template Palette */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Palette size={20} />
            <span>Field Templates</span>
          </h2>
          <p className="text-sm text-gray-500 mt-1">Double-click to add to form</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {fieldTemplates.map(renderTemplateCard)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="flex items-center space-x-1 p-1">
            <button
              onClick={() => setActiveTab('builder')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'builder' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Settings size={16} />
              <span>Builder</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'preview' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Eye size={16} />
              <span>Preview</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'builder' ? renderFormCanvas() : renderPreview()}
        </div>
      </div>
    </div>
  );
};

export default FormBuilder; 