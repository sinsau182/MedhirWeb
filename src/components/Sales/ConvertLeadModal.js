// src/components/ConvertLeadModal.js (Apply these changes manually)
import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateLead, moveLeadToPipeline } from '@/redux/slices/leadsSlice';
import { FaRupeeSign, FaTimes, FaFilePdf } from 'react-icons/fa';
import axios from 'axios';
import getConfig from 'next/config';
import { fetchImageFromMinio } from '@/redux/slices/minioSlice';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Receive leadData object containing id and initialQuote
const ConvertLeadModal = ({ lead, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  const [finalQuotation, setFinalQuotation] = useState('');
  const [signupAmount, setSignupAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paymentTransactionId, setPaymentTransactionId] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [projectTimeline, setProjectTimeline] = useState('');
  const [discount, setDiscount] = useState('');
  const [paymentDetailsFile, setPaymentDetailsFile] = useState(null);
  const [bookingFormFile, setBookingFormFile] = useState(null);
  const [quotedAmount, setQuotedAmount] = useState(lead?.quotedAmount || '');
  const [fileLoading, setFileLoading] = useState({ payment: false, booking: false });
  const [fileError, setFileError] = useState({ payment: null, booking: null });

  const formRef = useRef(null);

  const paymentModes = [
    'UPI',
    'Debit Card',
    'Credit Card',
    'IMPS/NEFT'
  ];

  useEffect(() => {
    if (lead) {
      setFinalQuotation(lead.finalQuotation || '');
      setSignupAmount(lead.signupAmount || '');
      setPaymentDate(lead.paymentDate || '');
      setPaymentMode(lead.paymentMode || '');
      setPaymentTransactionId(lead.paymentTransactionId || '');
      setPanNumber(lead.panNumber || '');
      setProjectTimeline(lead.projectTimeline || '');
      setDiscount(lead.discount || '');
      setQuotedAmount(lead.quotedAmount || '');
      
      // Handle existing files
      if (lead.paymentDetailsFileName) {
        setPaymentDetailsFile({
          name: lead.paymentDetailsFileName,
          url: lead.paymentDetailsFileName, // This should be the full URL from backend
          isExisting: true,
          type: 'application/octet-stream'
        });
      }
      
      if (lead.bookingFormFileName) {
        setBookingFormFile({
          name: lead.bookingFormFileName,
          url: lead.bookingFormFileName, // This should be the full URL from backend
          isExisting: true,
          type: 'application/octet-stream'
        });
      }
    }
  }, [lead]);

  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [lead]);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files.length > 0) {
      if (name === 'paymentDetailsFile') {
        setPaymentDetailsFile(files[0]);
        setFileError(prev => ({ ...prev, payment: null }));
      } else if (name === 'bookingFormFile') {
        setBookingFormFile(files[0]);
        setFileError(prev => ({ ...prev, booking: null }));
      }
    } else {
      if (name === 'paymentDetailsFile') setPaymentDetailsFile(null);
      if (name === 'bookingFormFile') setBookingFormFile(null);
    }
  };

  const handleRemoveFile = (type) => {
    if (type === 'payment') {
      setPaymentDetailsFile(null);
      setFileError(prev => ({ ...prev, payment: null }));
    }
    if (type === 'booking') {
      setBookingFormFile(null);
      setFileError(prev => ({ ...prev, booking: null }));
    }
  };

  const handleOpenFile = async (file, type) => {
    if (!file) return;
    
    try {
      setFileLoading(prev => ({ ...prev, [type]: true }));
      setFileError(prev => ({ ...prev, [type]: null }));
      
      if (file.isExisting && file.url) {
        // For existing files, fetch through Minio
        const result = await dispatch(fetchImageFromMinio({ url: file.url })).unwrap();
        if (result && result.dataUrl) {
          window.open(result.dataUrl, '_blank');
        } else {
          throw new Error('Failed to fetch file from Minio');
        }
      } else if (file instanceof File) {
        // For new files, create blob URL
        const blobUrl = URL.createObjectURL(file);
        window.open(blobUrl, '_blank');
      }
    } catch (error) {
      console.error('Error opening file:', error);
      setFileError(prev => ({ ...prev, [type]: 'Failed to open file' }));
    } finally {
      setFileLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lead) {
      alert("No lead selected.");
      return;
    }
    if (!finalQuotation || !signupAmount) {
      alert("Please fill in Final Quotation and Sign-up Amount.");
      return;
    }
    if (isNaN(parseFloat(finalQuotation)) || isNaN(parseFloat(signupAmount))) {
      alert("Quotation and Sign-up Amount must be valid numbers.");
      return;
    }
    try {
      // Prepare FormData for file upload - ALWAYS use FormData since backend expects multipart/form-data
      const formData = new FormData();
      formData.append('finalQuotation', finalQuotation);
      formData.append('signupAmount', signupAmount);
      formData.append('initialQuote', quotedAmount || '');
      formData.append('paymentDate', paymentDate || '');
      formData.append('paymentMode', paymentMode || '');
      formData.append('paymentTransactionId', paymentTransactionId || '');
      formData.append('panNumber', panNumber || '');
      formData.append('projectTimeline', projectTimeline || '');
      formData.append('discount', discount || '');

      if (paymentDetailsFile) formData.append('paymentDetailsFile', paymentDetailsFile);
      if (bookingFormFile) formData.append('bookingFormFile', bookingFormFile);

      // If conversion details already exist, use PUT to update
      if (lead.finalQuotation || lead.signupAmount || lead.paymentDate || lead.paymentMode || lead.panNumber || lead.discount || lead.paymentDetailsFileName || lead.bookingFormFileName || lead.initialQuote || lead.projectTimeline) {
        await axios.put(`${API_BASE_URL}/leads/${lead.leadId}`, {
          finalQuotation: parseFloat(finalQuotation),
          signupAmount: parseFloat(signupAmount),
          initialQuote: quotedAmount ? parseFloat(quotedAmount) : null,
          paymentDate,
          paymentMode,
          paymentTransactionId,
          panNumber,
          projectTimeline,
          discount: discount ? parseFloat(discount) : null
        }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        // Optionally handle file uploads separately if needed
      } else {
        // Always use FormData since backend expects multipart/form-data
        await axios.post(`${API_BASE_URL}/leads/${lead.leadId}/convert-with-docs`, formData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            // Don't set Content-Type for FormData, let browser set it automatically to multipart/form-data
          }
        });
      }

      // Move the lead to the converted stage (update stageId)
      if (lead.pipelineId || lead.stageId) {
        await dispatch(moveLeadToPipeline({
          leadId: lead.leadId,
          newPipelineId: lead.pipelineId || lead.stageId
        }));
      }
      if (onSuccess) {
        onSuccess({ ...lead, status: 'Converted' });
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to convert lead. Please try again.');
    }
  };

  if (!lead) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-2xl shadow-2xl my-8 max-h-[95vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Mark Lead as Converted</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Quoted Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                <input
                  type="number"
                  value={quotedAmount}
                  onChange={e => setQuotedAmount(e.target.value)}
                  className="pl-9 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                  placeholder="Enter initial quoted amount"
                  min="0"
                  step="any"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Quotation (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
                <input
                  type="number"
                  value={finalQuotation}
                  onChange={(e) => setFinalQuotation(e.target.value)}
                  className="pl-9 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                  required
                  min="0"
                  step="any"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sign-up Amount (₹) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><FaRupeeSign /></span>
              <input
                type="number"
                value={signupAmount}
                onChange={(e) => setSignupAmount(e.target.value)}
                className="pl-9 pr-3 py-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                required
                min="0"
                step="any"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 transition-all py-2 px-3"
              >
                <option value="">Select Payment Mode</option>
                {paymentModes.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Transaction ID</label>
            <input
              type="text"
              value={paymentTransactionId}
              onChange={(e) => setPaymentTransactionId(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all py-2 px-3"
              placeholder="Enter transaction ID"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
              <input
                type="text"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all py-2 px-3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Timeline</label>
              <input
                type="text"
                value={projectTimeline}
                onChange={(e) => setProjectTimeline(e.target.value)}
                className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all py-2 px-3"
                placeholder="e.g., 6 Months, Jan-Mar 2025"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (Optional)</label>
            <input
              type="text"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-400 focus:ring-blue-100 bg-gray-50 text-gray-800 placeholder-gray-400 transition-all py-2 px-3"
              placeholder="e.g., 10% or 5000"
            />
          </div>
          <hr className="my-6"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Payment Proof</label>
              <input
                type="file"
                name="paymentDetailsFile"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {paymentDetailsFile && (
                <div className="relative mt-3">
                  <div 
                    className={`cursor-pointer ${fileLoading.payment ? 'opacity-50' : 'hover:opacity-80'}`}
                    onClick={() => handleOpenFile(paymentDetailsFile, 'payment')}
                    title="Click to open in new tab"
                  >
                    {paymentDetailsFile.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(paymentDetailsFile)}
                        alt="Payment Proof Preview"
                        className="w-full max-h-56 object-contain rounded border"
                      />
                    ) : (
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded border">
                        <FaFilePdf className="text-red-600 text-2xl" />
                        <span className="truncate">{paymentDetailsFile.name}</span>
                      </div>
                    )}
                  </div>
                  {fileLoading.payment && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                      <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {fileError.payment && (
                    <div className="absolute top-2 left-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      {fileError.payment}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('payment')}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                    title="Remove file"
                  >
                    <FaTimes className="text-gray-500 text-lg" />
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Booking Form</label>
              <input
                type="file"
                name="bookingFormFile"
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              />
              {bookingFormFile && (
                <div className="relative mt-3">
                  <div 
                    className={`cursor-pointer ${fileLoading.booking ? 'opacity-50' : 'hover:opacity-80'}`}
                    onClick={() => handleOpenFile(bookingFormFile, 'booking')}
                    title="Click to open in new tab"
                  >
                    {bookingFormFile.type.startsWith('image/') ? (
                      <img
                        src={URL.createObjectURL(bookingFormFile)}
                        alt="Booking Form Preview"
                        className="w-full max-h-56 object-contain rounded border"
                      />
                    ) : (
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded border">
                        <FaFilePdf className="text-red-600 text-2xl" />
                        <span className="truncate">{bookingFormFile.name}</span>
                      </div>
                    )}
                  </div>
                  {fileLoading.booking && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                      <svg className="animate-spin h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                  {fileError.booking && (
                    <div className="absolute top-2 left-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
                      {fileError.booking}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile('booking')}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                    title="Remove file"
                  >
                    <FaTimes className="text-gray-500 text-lg" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 transition-all"
            >
              Confirm Conversion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertLeadModal;