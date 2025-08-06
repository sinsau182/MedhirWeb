import React, { useState, useEffect } from 'react';
import AssetManagementLayout from '@/components/AssetManagementLayout';
import { FaPlus, FaTimes, FaFileInvoice, FaIdCard, FaSync } from 'react-icons/fa';
import { toast } from 'sonner';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import withAuth from '@/components/withAuth';
import { fetchAssetCategories } from '@/redux/slices/assetCategorySlice';
import { fetchAssetLocations } from '@/redux/slices/assetLocationSlice';
import { fetchAssetStatuses } from '@/redux/slices/assetStatusSlice';
import { createAssetWithDTO, fetchAllAssets } from '@/redux/slices/assetSlice';
import { fetchCustomFormsByCategory } from '@/redux/slices/customFormsSlice';
import { 
    generateAssetId, 
    getSubcategoriesForCategory, 
    getNextSequenceNumber,
    SUBCATEGORIES 
} from '@/utils/assetIdGenerator';

// Mock Data for existing assets display - REMOVED since we now use Redux
// const MOCK_ASSETS = [
//     { id: 'ASSET-2024-0001', name: 'Dell Latitude 5420', category: 'IT Equipment', status: 'Assigned', location: 'Mumbai Head Office', assignedTo: 'Ankit Matwa' },
//     { id: 'ASSET-2024-0002', name: 'Ergonomic Office Chair', category: 'Office Furniture', status: 'In Stock', location: 'Mumbai Head Office', assignedTo: null },
//     { id: 'ASSET-2024-0003', name: 'HP LaserJet Pro MFP', category: 'IT Equipment', status: 'Under Maintenance', location: 'Bangalore Branch', assignedTo: null },
// ];

const MOCK_TEAMS = ['Marketing', 'Production', 'Sales', 'HR', 'Finance'];
const MOCK_LAPTOP_COMPANIES = ['Dell', 'HP', 'Lenovo', 'Apple', 'Asus', 'Acer'];

// Input and Select components defined outside to prevent re-creation on each render
const InputField = ({ label, name, value, onChange, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <input 
            name={name} 
            onChange={onChange} 
            value={value || ''} 
            {...props} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" 
        />
    </div>
);

const SelectField = ({ label, name, value, onChange, children, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <select 
            name={name} 
            onChange={onChange} 
            value={value || ''} 
            {...props} 
            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
        >
            {children}
        </select>
    </div>
);

// Component to render dynamic custom form fields for asset creation
const CustomFormRenderer = ({ customForms, customFormData, setCustomFormData, selectedCategory }) => {
    // Only show custom forms if a category is selected
    if (!selectedCategory) {
        return null;
    }

    if (!customForms || customForms.length === 0) {
        return (
            <div className="p-4 border rounded-md bg-gray-50 border-gray-200">
                <div className="text-center py-6">
                    <div className="text-4xl mb-2">📋</div>
                    <h4 className="text-lg font-semibold mb-2">No Form Assigned</h4>
                    <p className="text-gray-600">No custom form is assigned to this category.</p>
                </div>
            </div>
        );
    }

    const handleCustomFieldChange = (formId, fieldId, value) => {
        setCustomFormData(prev => ({
            ...prev,
            [formId]: {
                ...prev[formId],
                [fieldId]: value
            }
        }));
    };

    const renderField = (form, field) => {
        // Add validation for field properties
        if (!field || !field.id) {
            return null;
        }

        // Map backend field structure to frontend expected structure
        const fieldName = field.name || field.fieldName || field.fieldLabel || 'Unknown Field';
        const fieldType = field.type || field.fieldType || 'text';
        const isRequired = field.required !== undefined ? field.required : false;
        const placeholder = field.placeholder || field.defaultValue || '';
        const options = field.options || [];

        const fieldValue = customFormData[form.id]?.[field.id] || '';
        
        switch (fieldType) {
            case 'text':
            case 'email':
            case 'number':
                return (
                    <InputField
                        key={field.id}
                        label={`${fieldName}${isRequired ? ' *' : ''}`}
                        type={fieldType}
                        value={fieldValue}
                        onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.value)}
                        placeholder={placeholder}
                        required={isRequired}
                    />
                );
            case 'dropdown':
            case 'select':
                return (
                    <SelectField
                        key={field.id}
                        label={`${fieldName}${isRequired ? ' *' : ''}`}
                        value={fieldValue}
                        onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.value)}
                        required={isRequired}
                    >
                        <option value="">Select {fieldName}...</option>
                        {options && Array.isArray(options) && options.map((option, index) => (
                            <option key={option.value || option || index} value={option.value || option}>
                                {option.label || option}
                            </option>
                        ))}
                    </SelectField>
                );
            case 'textarea':
                return (
                    <div key={field.id}>
                        <label className="block text-sm font-medium text-gray-700">
                            {fieldName}{isRequired ? ' *' : ''}
                        </label>
                        <textarea
                            value={fieldValue}
                            onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.value)}
                            placeholder={placeholder}
                            required={isRequired}
                            rows={3}
                            className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                );
            case 'date':
                return (
                    <InputField
                        key={field.id}
                        label={`${fieldName}${isRequired ? ' *' : ''}`}
                        type="date"
                        value={fieldValue}
                        onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.value)}
                        required={isRequired}
                    />
                );
            case 'checkbox':
                return (
                    <div key={field.id} className="flex items-center">
                        <input
                            type="checkbox"
                            checked={fieldValue === true || fieldValue === 'true'}
                            onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.checked)}
                            className="mr-2"
                        />
                        <label className="text-sm text-gray-700">
                            {fieldName}{isRequired ? ' *' : ''}
                        </label>
                    </div>
                    );
                case 'file':
                    return (
                        <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700">
                                {fieldName}{isRequired ? ' *' : ''}
                            </label>
                            <input
                                type="file"
                                onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.files[0])}
                                required={isRequired}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>
                    );
                default:
                    return (
                        <InputField
                            key={field.id}
                            label={`${fieldName}${isRequired ? ' *' : ''}`}
                            type="text"
                            value={fieldValue}
                            onChange={(e) => handleCustomFieldChange(form.id, field.id, e.target.value)}
                            placeholder={placeholder}
                            required={isRequired}
                        />
                    );
        }
    };

    return (
        <div className="space-y-6">
            {customForms.map(form => (
                <div key={form.id || form.formId} className="p-4 border rounded-md bg-purple-50 border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-purple-800">
                            📋 {form.name || form.title}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                {form.fields?.length || 0} fields
                            </span>
                            {form.enabled !== false && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                    Active
                                </span>
                            )}
                        </div>
                    </div>
                    
                    {form.fields && Array.isArray(form.fields) && form.fields.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {form.fields.map((field, index) => {
                                // Map backend field structure to frontend expected structure
                                const fieldName = field.name || field.fieldName || field.fieldLabel || 'Unknown Field';
                                const fieldType = field.type || field.fieldType || 'text';
                                const isRequired = field.required !== undefined ? field.required : false;
                                const placeholder = field.placeholder || field.defaultValue || '';
                                
                                return (
                                    <div key={field.id} className="bg-white p-4 rounded-lg border border-purple-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {/* Removed Required badge - asterisk is shown in field label instead */}
                                            </div>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                {fieldType}
                                            </span>
                                        </div>
                                        
                                        {/* Render the actual field input */}
                                        {renderField(form, field)}
                                        
                                        {/* Show field description if available */}
                                        {placeholder && (
                                            <p className="text-xs text-gray-500 mt-1">
                                                💡 {placeholder}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            <p>No fields defined for this form.</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const AddAssetModal = ({ isOpen, onClose, onSubmit }) => {
    const dispatch = useDispatch();
    const { categories, loading: categoriesLoading, error: categoriesError } = useSelector(state => state.assetCategories);
    const { locations, loading: locationsLoading, error: locationsError } = useSelector(state => state.assetLocations);
    const { statuses, loading: statusesLoading, error: statusesError } = useSelector(state => state.assetStatuses);
    const { creatingAsset, error: assetError } = useSelector(state => state.assets);
    const { formsByCategory, loading: customFormsLoading } = useSelector(state => state.customForms);
    
    // More robust fallback forms access
    const customFormState = useSelector(state => state.customForm);
    const fallbackForms = customFormState?.forms || [];
    const safeFallbackForms = Array.isArray(fallbackForms) ? fallbackForms : [];
    
    const [formData, setFormData] = useState({
        category: '', 
        subcategory: '',
        location: '',
        purchaseDate: '', 
        invoiceNumber: '', 
        purchaseCost: '',
        gstRate: '', 
        invoiceScan: null,
        warrantyExpiry: '',
        // IT Specific Fields
        team: '', 
        laptopCompany: '', 
        processor: '', 
        ram: '', 
        memory: '', 
        condition: 'New', 
        accessories: '', 
        graphicsCard: ''
    });

    const [showITFields, setShowITFields] = useState(false);
    const [generatedAssetId, setGeneratedAssetId] = useState('');
    const [availableSubcategories, setAvailableSubcategories] = useState([]);
    const [selectedCategoryData, setSelectedCategoryData] = useState(null);
    const [customFormData, setCustomFormData] = useState({});

    // Get custom forms for the selected category (moved after state declarations)
    let customForms = [];
    try {
        if (selectedCategoryData && formsByCategory) {
            const categoryKey = selectedCategoryData.categoryId || selectedCategoryData.id;
            customForms = formsByCategory[categoryKey] || [];
        }
    } catch (error) {
        customForms = [];
    }
    
    // Fallback: Also check the other custom forms slice if needed
    let fallbackCustomForms = [];
    try {
        if (selectedCategoryData && Array.isArray(safeFallbackForms)) {
            fallbackCustomForms = safeFallbackForms.filter(form => 
                form && form.categoryId === (selectedCategoryData.categoryId || selectedCategoryData.id)
            );
        }
    } catch (error) {
        fallbackCustomForms = [];
    }
    
    // Use fallback forms if main forms are empty
    const finalCustomForms = customForms.length > 0 ? customForms : fallbackCustomForms;





    // Fetch data from Redux when modal opens
    useEffect(() => {
        if (isOpen) {
            console.log('Modal opened, fetching data from Redux...');
            dispatch(fetchAssetCategories());
            dispatch(fetchAssetLocations());
            dispatch(fetchAssetStatuses());
        }
    }, [isOpen, dispatch]);

    useEffect(() => {
        setShowITFields(formData.category === 'IT Equipment');
        
        // Update available subcategories when category changes
        if (formData.category && Array.isArray(categories)) {
            // Find the selected category from the fetched categories
            const categoryData = categories.find(cat => cat.name === formData.category);
            setSelectedCategoryData(categoryData);
            
            if (categoryData && Array.isArray(categoryData.subCategories)) {
                setAvailableSubcategories(categoryData.subCategories);
                
                // Fetch custom forms for this category
                const categoryId = categoryData.categoryId || categoryData.id;
                if (categoryId) {
                    console.log('Fetching custom forms for category:', categoryId);
                    dispatch(fetchCustomFormsByCategory(categoryId)).then((result) => {
                        if (result.meta.requestStatus === 'fulfilled') {
                            const forms = result.payload?.forms || [];
                            if (forms.length > 0) {
                                toast.success(`Loaded ${forms.length} custom form(s) for ${formData.category}`);
                            }
                        }
                    });
                }
            } else {
                setAvailableSubcategories([]);
            }
            
            // Reset subcategory if it's not valid for the new category
            if (formData.subcategory && categoryData) {
                const isValidSubcategory = categoryData.subCategories?.find(sub => sub.name === formData.subcategory);
                if (!isValidSubcategory) {
                    setFormData(prev => ({ ...prev, subcategory: '' }));
                }
            }
        } else {
            setAvailableSubcategories([]);
            setSelectedCategoryData(null);
            setFormData(prev => ({ ...prev, subcategory: '' }));
        }
    }, [formData.category, categories, dispatch]);

    // Clear custom form data when category changes
    useEffect(() => {
        if (formData.category) {
            setCustomFormData({});
        }
    }, [formData.category]);

    // Generate asset ID when category or subcategory changes
    useEffect(() => {
        if (formData.category && formData.subcategory && selectedCategoryData) {
            // Find the subcategory data for the code
            const subcategoryData = selectedCategoryData.subCategories?.find(sub => sub.name === formData.subcategory);
            if (subcategoryData) {
                // In a real app, you would fetch existing assets for this subcategory
                // and pass them to getNextSequenceNumber
                const nextSequence = getNextSequenceNumber(formData.category, formData.subcategory, []);
                const assetId = generateAssetId(formData.category, formData.subcategory, nextSequence);
                setGeneratedAssetId(assetId);
            }
        } else {
            setGeneratedAssetId('');
        }
    }, [formData.category, formData.subcategory, selectedCategoryData]);

    // Handle Redux errors with toast notifications
    useEffect(() => {
        if (categoriesError) {
            toast.error(`Failed to fetch categories: ${categoriesError}`);
        }
        if (locationsError) {
            toast.error(`Failed to fetch locations: ${locationsError}`);
        }
        if (statusesError) {
            toast.error(`Failed to fetch statuses: ${statusesError}`);
        }
        if (assetError) {
            toast.error(`Failed to add asset: ${assetError}`);
        }
    }, [categoriesError, locationsError, statusesError, assetError]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.category || !formData.subcategory || !formData.purchaseDate || !formData.purchaseCost) {
            toast.error("Please fill all required fields.");
            return;
        }
        
        // Validate custom form fields
        if (finalCustomForms && finalCustomForms.length > 0) {
            console.log('Validating custom forms:', finalCustomForms);
            console.log('Custom form data:', customFormData);
            
            for (const form of finalCustomForms) {
                if (form.fields && Array.isArray(form.fields)) {
                    for (const field of form.fields) {
                        const fieldName = field.name || field.fieldName || field.fieldLabel || 'Unknown Field';
                        const isRequired = field.required !== undefined ? field.required : false;
                        
                        if (isRequired) {
                            const fieldValue = customFormData[form.id]?.[field.id];
                            console.log('Checking required field:', { 
                                formId: form.id, 
                                fieldId: field.id, 
                                fieldName: fieldName, 
                                fieldValue,
                                isRequired: isRequired
                            });
                            
                            if (!fieldValue || fieldValue === '') {
                                toast.error(`Please fill the required field: ${fieldName}`);
                                return;
                            }
                        }
                    }
                }
            }
        }
        

        
        try {
            // Find the selected category and subcategory IDs
            const categoryData = categories.find(cat => cat.name === formData.category);
            const subcategoryData = categoryData?.subCategories?.find(sub => sub.name === formData.subcategory);
            
            // Get session storage values with debugging - try different key variations
            const companyId = sessionStorage.getItem("employeeCompanyId") || 
                             sessionStorage.getItem("companyId") || 
                             sessionStorage.getItem("company");
            const employeeId = sessionStorage.getItem("employeeId") || 
                              sessionStorage.getItem("userId") || 
                              sessionStorage.getItem("user");
            
            console.log('Session storage values:', {
                companyId: companyId,
                employeeId: employeeId,
                allKeys: Object.keys(sessionStorage)
            });
            
            // Prepare asset data according to new API structure
            const assetData = {
                companyId: companyId,
                categoryId: categoryData?.categoryId || categoryData?.id,
                subcategoryId: subcategoryData?.subCategoryId || subcategoryData?.id,
                assetId: generatedAssetId,
                locationId: formData.location,
                purchaseDate: formData.purchaseDate,
                purchaseCost: parseFloat(formData.purchaseCost),
                invoiceNumber: formData.invoiceNumber || '',
                warrantyExpiryDate: formData.warrantyExpiry || null,
                gstRate: parseFloat(formData.gstRate || '0'),
                inputTaxCreditEligible: true, // Default value
                createdBy: employeeId,
            };
            
            // Validate required fields
            if (!assetData.companyId) {
                toast.error("Company ID not found in session");
                return;
            }
            if (!assetData.categoryId) {
                toast.error("Category ID is required");
                return;
            }
            if (!assetData.assetId) {
                toast.error("Asset ID is required");
                return;
            }
            if (!assetData.createdBy) {
                toast.error("User ID not found in session");
                return;
            }
            
            // Add form data from custom forms
            if (Object.keys(customFormData).length > 0) {
                // Convert custom form data to the new formData structure
                const formDataMap = {};
                
                Object.keys(customFormData).forEach(formId => {
                    const form = finalCustomForms.find(f => f.id === formId);
                    if (form && form.fields) {
                        Object.keys(customFormData[formId]).forEach(fieldId => {
                            const field = form.fields.find(f => f.id === fieldId);
                            if (field) {
                                const fieldName = field.name || field.fieldName || field.fieldLabel || 'Unknown Field';
                                const fieldValue = customFormData[formId][fieldId];
                                formDataMap[fieldName] = fieldValue;
                            }
                        });
                    }
                });
                
                assetData.formData = formDataMap;
            }
            
            // Add custom form data with proper structure
            if (Object.keys(customFormData).length > 0) {
                // Structure the custom form data for backend
                const structuredFormData = {
                    forms: Object.keys(customFormData).map(formId => {
                        const form = finalCustomForms.find(f => f.id === formId);
                        return {
                            formId: formId,
                            formName: form?.name || 'Unknown Form',
                            categoryId: categoryData?.categoryId || categoryData?.id,
                            fields: Object.keys(customFormData[formId]).map(fieldId => {
                                const field = form?.fields?.find(f => f.id === fieldId);
                                const fieldName = field?.name || field?.fieldName || field?.fieldLabel || 'Unknown Field';
                                const fieldType = field?.type || field?.fieldType || 'text';
                                const isRequired = field?.required !== undefined ? field.required : false;
                                return {
                                    fieldId: fieldId,
                                    fieldName: fieldName,
                                    fieldType: fieldType,
                                    fieldValue: customFormData[formId][fieldId],
                                    isRequired: isRequired
                                };
                            })
                        };
                    })
                };
                
                assetData.customFormData = structuredFormData;
                console.log('Structured custom form data:', structuredFormData);
            }
            
            // Debug: Log the data being sent
            console.log('Submitting asset data:', assetData);
            console.log('Invoice scan file:', formData.invoiceScan);
            console.log('Custom form data:', customFormData);
            console.log('Request payload structure:', {
                asset: assetData,
                invoiceScan: formData.invoiceScan
            });

            // Create the request payload according to new API structure
            const requestPayload = {
                asset: assetData,
                invoiceScan: formData.invoiceScan
            };
            
            console.log('=== FINAL REQUEST PAYLOAD ===');
            console.log('Request payload:', requestPayload);
            console.log('Asset data keys:', Object.keys(assetData));
            console.log('Form data keys:', Object.keys(customFormData));
            
            // Dispatch the createAssetWithDTO action with new structure
            const result = await dispatch(createAssetWithDTO(requestPayload)).unwrap();
            
            toast.success('Asset added successfully!');
            onSubmit(result); // Pass the response back to parent
            onClose();
            
            // Reset form
            setFormData({
                category: '', subcategory: '', location: '', purchaseDate: '', invoiceNumber: '', purchaseCost: '',
                gstRate: '', invoiceScan: null, warrantyExpiry: '',
                team: '', laptopCompany: '', processor: '', ram: '', memory: '', 
                condition: 'New', accessories: '', graphicsCard: ''
            });
            setGeneratedAssetId('');
            setAvailableSubcategories([]);
            setSelectedCategoryData(null);
            setCustomFormData({});
        } catch (error) {
            // Error is already handled by Redux and useEffect
            console.error('Error adding asset:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">Add New Asset</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Core Identification */}
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-lg mb-4">Core Identification</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <SelectField 
                                label="Category" 
                                name="category" 
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    {categoriesLoading ? 'Loading categories...' : 'Select Category...'}
                                </option>
                                {Array.isArray(categories) && categories.map(c => (
                                    <option key={c.categoryId || c.id} value={c.name}>
                                        {c.name}
                                    </option>
                                ))}
                            </SelectField>
                            <SelectField 
                                label="Subcategory" 
                                name="subcategory" 
                                value={formData.subcategory}
                                onChange={handleChange}
                                required
                                disabled={!formData.category || availableSubcategories.length === 0}
                            >
                                <option value="">
                                    {!formData.category ? 'Select Category First' : 
                                     availableSubcategories.length === 0 ? 'No subcategories available' : 
                                     'Select Subcategory...'}
                                </option>
                                {availableSubcategories.map(sub => (
                                    <option key={sub.subCategoryId || sub.id} value={sub.name}>
                                        {sub.name}
                                    </option>
                                ))}
                            </SelectField>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <FaIdCard className="inline mr-1" />
                                    Asset ID (Auto-generated)
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={generatedAssetId}
                                        readOnly
                                        className="flex-1 p-3 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                                        placeholder="Select category and subcategory to generate ID"
                                    />
                                    {generatedAssetId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                navigator.clipboard.writeText(generatedAssetId);
                                                toast.success('Asset ID copied to clipboard!');
                                            }}
                                            className="p-2 text-blue-600 hover:text-blue-800"
                                            title="Copy Asset ID"
                                        >
                                            <FaSync />
                                        </button>
                                    )}
                                </div>
                                {generatedAssetId && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Format: [Category]-[Subcategory]-[Sequence]
                                    </p>
                                )}
                            </div>
                            <SelectField 
                                label="Location" 
                                name="location" 
                                value={formData.location}
                                onChange={handleChange}
                                required
                            >
                                <option value="">
                                    {locationsLoading ? 'Loading locations...' : 'Select Location...'}
                                </option>
                                {Array.isArray(locations) && locations.map(l => (
                                    <option key={l.locationId || l.id} value={l.locationId || l.id}>
                                        {l.name}
                                    </option>
                                ))}
                            </SelectField>
                        </div>
                    </div>
                    
                    {/* Financial & Purchase */}
                    <div className="p-4 border rounded-md">
                        <h3 className="font-semibold text-lg mb-4">Financial & Purchase Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <InputField 
                                label="Purchase Date" 
                                name="purchaseDate" 
                                value={formData.purchaseDate}
                                onChange={handleChange}
                                type="date" 
                                required 
                            />
                            <InputField 
                                label="Invoice / Bill Number" 
                                name="invoiceNumber" 
                                value={formData.invoiceNumber}
                                onChange={handleChange}
                            />
                            <InputField 
                                label="Purchase Cost (Gross)" 
                                name="purchaseCost" 
                                value={formData.purchaseCost}
                                onChange={handleChange}
                                type="number" 
                                required 
                            />
                            <InputField 
                                label="GST Rate (%)" 
                                name="gstRate" 
                                value={formData.gstRate}
                                onChange={handleChange}
                                type="number" 
                                placeholder="e.g., 18" 
                            />
                            <InputField 
                                label="Warranty Expiry Date" 
                                name="warrantyExpiry" 
                                value={formData.warrantyExpiry}
                                onChange={handleChange}
                                type="date" 
                            />
                            <InputField 
                                label="Invoice Scan" 
                                name="invoiceScan" 
                                onChange={handleChange}
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png" 
                            />
                        </div>
                    </div>
                    
                    {/* Custom Forms Section */}
                    {formData.category && (
                        <div className="p-4 border rounded-md">
                            <h3 className="font-semibold text-lg mb-4 text-purple-800">
                                📋 Custom Forms for {formData.category}
                            </h3>
                            
                            {customFormsLoading && (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                                    <p className="text-purple-600">Loading custom forms...</p>
                                </div>
                            )}
                            
                            {!customFormsLoading && finalCustomForms.length > 0 && (
                                <CustomFormRenderer
                                    customForms={finalCustomForms}
                                    customFormData={customFormData}
                                    setCustomFormData={setCustomFormData}
                                    selectedCategory={formData.category}
                                />
                            )}
                            
                            {/* Static Laptop Form for IT Equipment when no custom forms are loaded */}
                            {!customFormsLoading && finalCustomForms.length === 0 && formData.category === 'IT Equipment' && (
                                <div className="p-4 border rounded-md bg-purple-50 border-purple-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg text-purple-800">
                                            📋 Laptop Form
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded">
                                                4 fields
                                            </span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                Active
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Field name will be shown in label */}
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    text
                                                </span>
                                            </div>
                                            <InputField 
                                                label="Processor *" 
                                                name="processor" 
                                                value={formData.processor}
                                                onChange={handleChange}
                                                placeholder="Enter processor details"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Field name will be shown in label */}
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    text
                                                </span>
                                            </div>
                                            <InputField 
                                                label="RAM *" 
                                                name="ram" 
                                                value={formData.ram}
                                                onChange={handleChange}
                                                placeholder="e.g., 16GB"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Field name will be shown in label */}
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    text
                                                </span>
                                            </div>
                                            <InputField 
                                                label="Storage *" 
                                                name="memory" 
                                                value={formData.memory}
                                                onChange={handleChange}
                                                placeholder="e.g., 512GB SSD"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="bg-white p-4 rounded-lg border border-purple-200">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    {/* Field name will be shown in label */}
                                                </div>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                    text
                                                </span>
                                            </div>
                                            <InputField 
                                                label="Graphics Card *" 
                                                name="graphicsCard" 
                                                value={formData.graphicsCard}
                                                onChange={handleChange}
                                                placeholder="Enter graphics card details"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Conditional IT Fields */}
                    {showITFields && (
                        <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                            <h3 className="font-semibold text-lg mb-4 text-blue-800">IT Equipment Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <SelectField 
                                    label="Laptop Company" 
                                    name="laptopCompany"
                                    value={formData.laptopCompany}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Company...</option>
                                    {MOCK_LAPTOP_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </SelectField>
                                <InputField 
                                    label="Processor/Model" 
                                    name="processor" 
                                    value={formData.processor}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="RAM (e.g., 16GB)" 
                                    name="ram" 
                                    value={formData.ram}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Memory (e.g., 512GB SSD)" 
                                    name="memory" 
                                    value={formData.memory}
                                    onChange={handleChange}
                                />
                                <InputField 
                                    label="Graphics Card" 
                                    name="graphicsCard" 
                                    value={formData.graphicsCard}
                                    onChange={handleChange}
                                />
                                <SelectField 
                                    label="Condition" 
                                    name="condition"
                                    value={formData.condition}
                                    onChange={handleChange}
                                >
                                    <option value="New">New</option>
                                    <option value="Good">Good</option>
                                    <option value="Fair">Fair</option>
                                    <option value="Damaged">Damaged</option>
                                </SelectField>
                                <InputField 
                                    label="Accessories" 
                                    name="accessories" 
                                    value={formData.accessories}
                                    onChange={handleChange}
                                    placeholder="e.g., Charger, Mouse" 
                                />
                                <SelectField 
                                    label="Assigned To Team" 
                                    name="team"
                                    value={formData.team}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Team...</option>
                                    {MOCK_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                                </SelectField>
                            </div>
                        </div>
                    )}



                </div>
                <div className="bg-gray-50 px-6 py-3 flex justify-between items-center rounded-b-lg">
                    <div className="text-sm text-gray-600">
                        
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={creatingAsset}
                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={creatingAsset || categoriesLoading || locationsLoading || statusesLoading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {creatingAsset ? 'Saving...' : 'Save Asset'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const AssetManagementPage = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Get data from Redux store
    const { assets, loading: assetsLoading, error: assetsError } = useSelector(state => state.assets);
    const { categories } = useSelector(state => state.assetCategories);
    const { locations } = useSelector(state => state.assetLocations);
    const { statuses } = useSelector(state => state.assetStatuses);

    // Fetch all data when component mounts
    useEffect(() => {
        console.log('AssetManagementPage: Fetching all asset data...');
        dispatch(fetchAllAssets());
        dispatch(fetchAssetCategories());
        dispatch(fetchAssetLocations());
        dispatch(fetchAssetStatuses());
    }, [dispatch]);

    // Handle errors with toast notifications
    useEffect(() => {
        if (assetsError) {
            toast.error(`Failed to fetch assets: ${assetsError}`);
        }
    }, [assetsError]);

    // Helper functions to map IDs to names
    const getCategoryName = (categoryId) => {
        if (!categoryId || !Array.isArray(categories)) return 'Unknown Category';
        const category = categories.find(c => (c.categoryId || c.id) === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    const getLocationName = (locationId) => {
        if (!locationId || !Array.isArray(locations)) return 'Unknown Location';
        const location = locations.find(l => (l.locationId || l.id) === locationId);
        return location ? location.name : 'Unknown Location';
    };

    const getStatusName = (statusLabelId) => {
        if (!statusLabelId) return 'No Status'; // More accurate when no statusLabelId
        if (!Array.isArray(statuses)) return 'Loading...';
        const status = statuses.find(s => (s.statusLabelId || s.id) === statusLabelId);
        return status ? status.name : 'Unknown Status';
    };

    const handleAddAsset = (newAssetData) => {
        // Handle the API response - the newAssetData will be the response from the server
        console.log('Asset added successfully:', newAssetData);
        
        // Refresh the assets list to show the new asset
        dispatch(fetchAllAssets());
        setIsModalOpen(false);
        
        // The success message is already shown in the modal
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Assigned': return 'bg-blue-100 text-blue-700';
            case 'In Stock': return 'bg-green-100 text-green-700';
            case 'Under Maintenance': return 'bg-yellow-100 text-yellow-700';
            case 'Scrapped': return 'bg-red-100 text-red-700';
            case 'No Status': return 'bg-gray-100 text-gray-600';
            case 'Loading...': return 'bg-gray-100 text-gray-500';
            case 'Unknown Status': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };
    
    return (
        <AssetManagementLayout>
            <div className="p-6">
                <header className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Asset Inventory</h1>
                        <p className="text-gray-600 mt-1">Manage and track all company assets</p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FaPlus /> Add New Asset
                    </button>
                </header>

                {/* Assets Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {assetsLoading && (
                        <div className="p-8 text-center">
                            <div className="text-blue-600">Loading assets...</div>
                        </div>
                    )}
                    {!assetsLoading && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700">Asset ID</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Asset Details</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Category</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Location</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">Assigned To</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(assets) && assets.length > 0 ? (
                                    assets.map((asset) => (
                                        <tr 
                                            key={asset.id} 
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => router.push(`/asset-management/${asset.assetId}`)}
                                        >
                                            <td className="p-4 font-mono text-sm">{asset.assetId}</td>
                                            <td className="p-4 font-medium">
                                                {/* Show first form data field as asset name, or use a default */}
                                                {asset.formData && Object.keys(asset.formData).length > 0 
                                                    ? Object.values(asset.formData)[0] 
                                                    : 'Asset'}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {asset.categoryName || getCategoryName(asset.categoryId)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(getStatusName(asset.statusLabelId))}`}>
                                                    {getStatusName(asset.statusLabelId)}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {asset.location || getLocationName(asset.locationId)}
                                            </td>
                                            <td className="p-4 text-gray-600">{asset.assignedTo || 'N/A'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-8 text-center text-gray-500">
                                            {assetsError ? 'Error loading assets' : 'No assets found'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Add Asset Modal */}
                <AddAssetModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddAsset}
                />
            </div>
        </AssetManagementLayout>
    );
};

export default withAuth(AssetManagementPage); 