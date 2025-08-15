import React, { useState } from 'react';
import { FaTimes, FaBuilding, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaMoneyCheckAlt, FaHashtag, FaTags, FaUniversity, FaFileInvoiceDollar, FaStickyNote, FaEdit, FaSave } from 'react-icons/fa';

// Static data options (same as AddVendorForm)
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Puducherry', 'Chandigarh', 'Dadra and Nagar Haveli', 'Daman and Diu',
  'Lakshadweep', 'Andaman and Nicobar Islands', 'Jammu and Kashmir', 'Ladakh'
];

const taxTreatmentOptions = [
  'Registered', 'Unregistered', 'Composition', 'Consumer'
];

const companyTypeOptions = [
  'Company', 'Individual'
];

const vendorCategoryOptions = [
  'Supplier', 'Service Provider', 'Contractor', 'Consultant', 'Manufacturer', 'Distributor'
];

const accountTypeOptions = [
  'Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit'
];

const DetailItem = ({ label, value, fullWidth = false, isEditing = false, onChange = null, fieldName = '', type = 'text', options = [], placeholder = '' }) => (
    <div className={`text-sm ${fullWidth ? 'col-span-2' : ''}`}>
        <p className="text-gray-500 mb-2">{label}</p>
        {isEditing ? (
            type === 'select' ? (
                <select
                    value={value || ''}
                    onChange={(e) => onChange && onChange(fieldName, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
                    {options.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            ) : type === 'textarea' ? (
                <textarea
                    value={value || ''}
                    onChange={(e) => onChange && onChange(fieldName, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                />
            ) : (
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => onChange && onChange(fieldName, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={placeholder || `Enter ${label.toLowerCase()}`}
                />
            )
        ) : (
            <p className="font-semibold text-gray-800 break-words">{value || 'N/A'}</p>
        )}
    </div>
);

const Section = ({ title, icon, children }) => (
    <div>
        <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4 flex items-center gap-3">{icon}{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {children}
        </div>
    </div>
);

const VendorPreview = ({ vendorData, onClose, onEdit = null, onSave = null }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(vendorData);

  const {
  vendorName, email, phone, mobile, website,
  addressLine1, addressLine2, city, state, pinCode, country,
  gstin, pan, taxTreatment, companyType, vendorCategory,
  contactAddresses, vendorTags, bankDetails,
  paymentTerms, priceList, fiscalPosition,
  notes, upiId
} = editedData;

  const fullAddress = [addressLine1, addressLine2, city, state, pinCode, country].filter(Boolean).join(',\n');

  // Check if any bank details exist
  const hasBankDetails = bankDetails && (
    bankDetails.accountHolderName || 
    bankDetails.branchName || 
    bankDetails.bankName || 
    bankDetails.accountType || 
    bankDetails.accountNumber || 
    bankDetails.ifscCode || 
    bankDetails.upiId
  );

  const handleFieldChange = (fieldName, value) => {
    if (fieldName.includes('.')) {
      // Handle nested fields like bankDetails.accountHolderName
      const [parent, child] = fieldName.split('.');
      setEditedData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setEditedData(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editedData);
    }
    setIsEditing(false);
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(editedData);
    }
    setIsEditing(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-6xl w-full relative m-4" onClick={e => e.stopPropagation()}>
        {/* Close and Edit buttons */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {isEditing ? (
            <button 
              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50" 
              onClick={handleSave}
              title="Save Changes"
            >
              <FaSave size={20} />
            </button>
          ) : (
            <button 
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50" 
              onClick={handleEdit}
              title="Edit Vendor"
            >
              <FaEdit size={20} />
            </button>
          )}
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-50" onClick={onClose}>
            <FaTimes size={20} />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto p-2">
          {/* Header */}
          <header className="flex items-center pb-6 border-b mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6">
              <FaBuilding className="text-3xl text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{vendorName || 'Vendor Profile'}</h1>
              <p className="text-gray-500 flex items-center gap-2">{email || 'No email provided'}</p>
            </div>
          </header>

          {/* Vendor Details */}
          <div className="space-y-8">

            <Section title="Basic Information" icon={<FaBuilding className="text-gray-400" />}>
                <DetailItem label="Vendor Name" value={vendorName} isEditing={isEditing} onChange={handleFieldChange} fieldName="vendorName" />
                <DetailItem label="Company Type" value={companyType} isEditing={isEditing} onChange={handleFieldChange} fieldName="companyType" type="select" options={companyTypeOptions} />
                <DetailItem label="Vendor Category" value={vendorCategory} isEditing={isEditing} onChange={handleFieldChange} fieldName="vendorCategory" type="select" options={vendorCategoryOptions} />
                <DetailItem label="GST Treatment" value={taxTreatment} isEditing={isEditing} onChange={handleFieldChange} fieldName="taxTreatment" type="select" options={taxTreatmentOptions} />
            </Section>

            <Section title="Contact Information" icon={<FaUser className="text-gray-400" />}>
                <DetailItem label="Contact Name" value={editedData.contactName} isEditing={isEditing} onChange={handleFieldChange} fieldName="contactName" />
                <DetailItem label="Email Address" value={email} isEditing={isEditing} onChange={handleFieldChange} fieldName="email" type="email" />
                <DetailItem label="Mobile Number" value={mobile} isEditing={isEditing} onChange={handleFieldChange} fieldName="mobile" type="tel" />
                <DetailItem label="Phone Number" value={phone} isEditing={isEditing} onChange={handleFieldChange} fieldName="phone" type="tel" />
            </Section>

            <Section title="Address Information" icon={<FaMapMarkerAlt className="text-gray-400" />}>
                <DetailItem label="Address Line 1" value={addressLine1} isEditing={isEditing} onChange={handleFieldChange} fieldName="addressLine1" />
                <DetailItem label="Address Line 2" value={addressLine2} isEditing={isEditing} onChange={handleFieldChange} fieldName="addressLine2" />
                <DetailItem label="City" value={city} isEditing={isEditing} onChange={handleFieldChange} fieldName="city" />
                <DetailItem label="State" value={state} isEditing={isEditing} onChange={handleFieldChange} fieldName="state" type="select" options={indianStates} placeholder="Select state" />
                <DetailItem label="PIN Code" value={pinCode} isEditing={isEditing} onChange={handleFieldChange} fieldName="pinCode" type="text" />
                <DetailItem label="Country" value={country} isEditing={isEditing} onChange={handleFieldChange} fieldName="country" />
            </Section>

            <Section title="Compliance" icon={<FaFileInvoiceDollar className="text-gray-400" />}>
                <DetailItem label="GSTIN" value={gstin} isEditing={isEditing} onChange={handleFieldChange} fieldName="gstin" />
                <DetailItem label="PAN" value={pan} isEditing={isEditing} onChange={handleFieldChange} fieldName="pan" />
                <DetailItem label="TDS Percentage" value={editedData.tdsPercentage} isEditing={isEditing} onChange={handleFieldChange} fieldName="tdsPercentage" type="number" />
            </Section>

            {hasBankDetails && (
              <Section title="Banking Information" icon={<FaUniversity className="text-gray-400" />}>
                  {bankDetails.accountHolderName && <DetailItem label="Account Holder Name" value={bankDetails.accountHolderName} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.accountHolderName" />}
                  {bankDetails.branchName && <DetailItem label="Branch Name" value={bankDetails.branchName} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.branchName" />}
                  {bankDetails.bankName && <DetailItem label="Bank Name" value={bankDetails.bankName} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.bankName" />}
                  {bankDetails.accountType && <DetailItem label="Account Type" value={bankDetails.accountType} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.accountType" type="select" options={accountTypeOptions} />}
                  {bankDetails.accountNumber && <DetailItem label="Account Number" value={bankDetails.accountNumber} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.accountNumber" />}
                  {bankDetails.ifscCode && <DetailItem label="IFSC Code" value={bankDetails.ifscCode} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.ifscCode" />}
                  {bankDetails.upiId && <DetailItem label="UPI ID" value={bankDetails.upiId} isEditing={isEditing} onChange={handleFieldChange} fieldName="bankDetails.upiId" />}
              </Section>
            )}
            
            {contactAddresses && contactAddresses.length > 0 &&
                <div>
                    <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-3"><FaUser className="text-gray-400" />Additional Contacts</h3>
                    <div className="space-y-4">
                    {contactAddresses.map((contact, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg border text-sm grid grid-cols-3 gap-4">
                           <DetailItem label="Contact Name" value={contact.name}/>
                           <DetailItem label="Email" value={contact.email}/>
                           <DetailItem label="Phone" value={contact.phone}/>
                        </div>
                    ))}
                    </div>
                </div>
            }

            {vendorTags && vendorTags.length > 0 &&
                <div>
                     <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-3"><FaTags className="text-gray-400" />Vendor Tags</h3>
                     <div className="flex flex-wrap gap-2">
                        {vendorTags.map(tag => (
                            <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{tag}</span>
                        ))}
                     </div>
                </div>
            }

            {notes &&
                 <div>
                     <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-3 flex items-center gap-3"><FaStickyNote className="text-gray-400" />Internal Notes</h3>
                     <DetailItem label="Notes" value={notes} isEditing={isEditing} onChange={handleFieldChange} fieldName="notes" type="textarea" fullWidth={true} />
                </div>
            }
          </div>

          {/* Footer */}
          <footer className="text-center pt-8 mt-8 border-t text-xs text-gray-400">
              <p>This is a computer-generated document.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default VendorPreview;