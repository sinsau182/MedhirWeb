import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Minus, Settings, Copy, Trash2 } from 'lucide-react';

const SmartField = ({ field, value, onChange, onUpdate, onDelete, onDuplicate, isPreview = false }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [isVisible, setIsVisible] = useState(field.isVisible !== false);
  const [showSettings, setShowSettings] = useState(false);
  const [localField, setLocalField] = useState(field);
  
  const customization = field.customization || {};
  const inputHelper = customization.inputHelper || {};

  useEffect(() => {
    if (inputHelper.prefix) setPrefix(inputHelper.prefix);
    if (inputHelper.suffix || inputHelper.defaultSuffix) {
      setSuffix(inputHelper.defaultSuffix || inputHelper.suffix);
    }
  }, [inputHelper]);

  const handleInputChange = (e) => {
    let newValue = e.target.value;
    
    // Apply transformations
    if (customization.transformation?.applyOnInput) {
      newValue = applyTransformation(newValue, customization.transformation.type);
    }
    
    // Apply input mask
    if (customization.inputMask?.mask) {
      newValue = applyMask(newValue, customization.inputMask.mask);
    }
    
    setInputValue(newValue);
    onChange?.(prefix + newValue + suffix);
  };

  const applyTransformation = (value, type) => {
    switch (type) {
      case 'titleCase': return toTitleCase(value);
      case 'uppercase': return value.toUpperCase();
      case 'lowercase': return value.toLowerCase();
      default: return value;
    }
  };

  const applyMask = (value, mask) => {
    if (mask === 'phone') {
      return value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return value.replace(/\D/g, '').replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const handleFieldUpdate = (updates) => {
    const updatedField = { ...localField, ...updates };
    setLocalField(updatedField);
    onUpdate?.(updatedField);
  };

  const renderFieldSettings = () => (
    <div className="bg-gray-50 p-4 rounded-lg border-t">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Field Label</label>
          <input
            type="text"
            value={localField.label}
            onChange={(e) => handleFieldUpdate({ label: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Placeholder</label>
          <input
            type="text"
            value={localField.placeholder || ''}
            onChange={(e) => handleFieldUpdate({ placeholder: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Field Type</label>
          <select
            value={localField.type}
            onChange={(e) => handleFieldUpdate({ type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="number">Number</option>
            <option value="url">URL</option>
            <option value="date">Date</option>
            <option value="textarea">Textarea</option>
            <option value="select">Select</option>
            <option value="checkbox">Checkbox</option>
            <option value="radio">Radio</option>
          </select>
        </div>
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={localField.required}
              onChange={(e) => handleFieldUpdate({ required: e.target.checked })}
              className="mr-2"
            />
            Required
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isVisible}
              onChange={(e) => {
                setIsVisible(e.target.checked);
                handleFieldUpdate({ isVisible: e.target.checked });
              }}
              className="mr-2"
            />
            Visible
          </label>
        </div>
      </div>
    </div>
  );

  const renderField = () => {
    const commonProps = {
      value: inputValue,
      onChange: handleInputChange,
      placeholder: localField.placeholder,
      required: localField.required,
      className: "flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    };

    switch (localField.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} className="w-full px-3 py-2 border rounded-md resize-none" />;
      case 'select':
        return (
          <select {...commonProps} className="w-full px-3 py-2 border rounded-md">
            <option value="">Select an option</option>
            {localField.options?.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={inputValue}
              onChange={(e) => setInputValue(e.target.checked)}
              className="w-4 h-4"
            />
            <span>{localField.label}</span>
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-2">
            {localField.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={localField.fieldId}
                  value={option.value}
                  checked={inputValue === option.value}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-4 h-4"
                />
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        );
      default:
        return <input {...commonProps} type={localField.type} />;
    }
  };

  if (!isVisible && isPreview) return null;

  return (
    <div className={`smart-field ${!isVisible ? 'opacity-50' : ''}`}>
      {!isPreview && (
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsVisible(!isVisible)}
              className="text-gray-500 hover:text-gray-700"
            >
              {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <span className="text-sm font-medium text-gray-600">
              {localField.label || 'Untitled Field'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Settings size={14} />
            </button>
            <button
              onClick={() => onDuplicate?.(localField)}
              className="p-1 text-gray-500 hover:text-gray-700"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => onDelete?.(localField.fieldId)}
              className="p-1 text-red-500 hover:text-red-700"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
      
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">
          {localField.label}
          {localField.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="flex items-center border rounded-md">
          {/* Prefix Dropdown */}
          {inputHelper.showPrefixDropdown && (
            <select 
              value={prefix} 
              onChange={(e) => setPrefix(e.target.value)}
              className="border-r px-2 py-2 bg-gray-50"
            >
              {inputHelper.prefixOptions?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
          
          {/* Static Prefix */}
          {inputHelper.prefix && !inputHelper.showPrefixDropdown && (
            <span className="px-3 py-2 bg-gray-50 border-r text-gray-600">
              {prefix}
            </span>
          )}
          
          {/* Main Input */}
          {renderField()}
          
          {/* Static Suffix */}
          {inputHelper.suffix && !inputHelper.showSuffixDropdown && (
            <span className="px-3 py-2 bg-gray-50 border-l text-gray-600">
              {suffix}
            </span>
          )}
          
          {/* Suffix Dropdown */}
          {inputHelper.showSuffixDropdown && (
            <select 
              value={suffix} 
              onChange={(e) => setSuffix(e.target.value)}
              className="border-l px-2 py-2 bg-gray-50"
            >
              {inputHelper.suffixOptions?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          )}
        </div>
        
        {/* Format Example */}
        {customization.realTimeFormat?.formatExample && (
          <div className="text-xs text-gray-500 mt-1">
            Example: {customization.realTimeFormat.formatExample}
          </div>
        )}
      </div>
      
      {!isPreview && showSettings && renderFieldSettings()}
    </div>
  );
};

export default SmartField; 