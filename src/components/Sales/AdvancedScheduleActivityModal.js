import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FaCheck, FaEnvelope, FaPhone, FaUsers, FaPaperclip, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import getConfig from 'next/config';
import { useDispatch } from 'react-redux';
import { fetchImageFromMinio } from '@/redux/slices/minioSlice';

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

const AdvancedScheduleActivityModal = ({ isOpen, onClose, lead, initialData, onSuccess, onActivityChange }) => {
  const dispatch = useDispatch();
  
  const [activeType, setActiveType] = useState('To-Do');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState('');
  // Remove unused global state variables since we're using per-tab state
  // const [meetingLink, setMeetingLink] = useState('');
  // const [attendees, setAttendees] = useState([{ id: 1, name: '' }]);
  // const [callPurpose, setCallPurpose] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  // const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  // const [nextFollowUpTime, setNextFollowUpTime] = useState('');
  // const [meetingVenue, setMeetingVenue] = useState('In Office');
  const [title, setTitle] = useState('');

  // Add separate state for each outcome field
  const [meetingOutcome, setMeetingOutcome] = useState('');
  const [emailOutcome, setEmailOutcome] = useState('');
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachmentError, setAttachmentError] = useState(null);

  // Add a flag to determine if editing and which tab is being edited
  const isEditingActivity = !!(initialData && initialData.id);
  const editingType = initialData?.type;

  // Per-tab state
  const [todo, setTodo] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null });
  const [email, setEmail] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callOutcome: '' });
  const [call, setCall] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callPurpose: '', callOutcome: '', nextFollowUpDate: '', nextFollowUpTime: '' });
  const [meeting, setMeeting] = useState({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, meetingVenue: 'In Office', meetingLink: '', attendees: [{ id: 1, name: '' }], callOutcome: '' });

  const fileInputRef = useRef(null);

  // Reset all tab states on open/close
  useEffect(() => {
    if (isOpen) {
      if (initialData && (initialData.id || initialData._id)) {
        // This useEffect is conflicting with the second one below
        // Remove this entire block to avoid conflicts
        // setActiveType(initialData.type || 'To-Do');
        // if (initialData.type === 'To-Do') setTodo({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, ...initialData, note: initialData.note || initialData.notes || '' });
        // if (initialData.type === 'Email') setEmail({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callOutcome: '', ...initialData, note: initialData.note || initialData.notes || '' });
        // if (initialData.type === 'Call') setCall({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callPurpose: '', callOutcome: '', nextFollowUpDate: '', nextFollowUpTime: '', ...initialData, note: initialData.note || initialData.notes || '' });
        // if (initialData.type === 'Meeting') setMeeting({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, meetingVenue: 'In Office', meetingLink: '', attendees: [{ id: 1, name: '' }], callOutcome: '', ...initialData, note: initialData.note || initialData.notes || '' });
      } else {
        // Reset to default values when creating new activity
        setActiveType('To-Do');
        setTodo({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null });
        setEmail({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callOutcome: '' });
        setCall({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, callPurpose: '', callOutcome: '', nextFollowUpDate: '', nextFollowUpTime: '' });
        setMeeting({ title: '', dueDate: new Date().toISOString().split('T')[0], dueTime: '', note: '', attachment: null, meetingVenue: 'In Office', meetingLink: '', attendees: [{ id: 1, name: '' }], callOutcome: '' });
      }
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (initialData && isOpen) {
      setActiveType(initialData.type || 'To-Do');
      // Remove global state setting since we're using per-tab state
      // setTitle(initialData.title || '');
      // setDueDate(initialData.dueDate || new Date().toISOString().split('T')[0]);
      // setDueTime(initialData.dueTime || '');
      // Remove global state setting and use per-tab state instead
      // setAttendees(initialData.attendees || [{ id: 1, name: '' }]);
      // setCallPurpose(initialData.callPurpose || '');
      setCallOutcome(initialData.type === 'Call' ? initialData.callOutcome || '' : '');
      // setNextFollowUpDate(initialData.nextFollowUpDate || '');
      // setNextFollowUpTime(initialData.nextFollowUpTime || '');
      // setMeetingVenue(initialData.meetingVenue || 'In Office');
      // Remove global attachment setting since we're using per-tab state
      // setAttachment(initialData.attachment || null);
      setMeetingOutcome(initialData.type === 'Meeting' ? initialData.callOutcome || '' : '');
      setEmailOutcome(initialData.type === 'Email' ? initialData.callOutcome || '' : '');
      
      // Set the note and other fields in the appropriate per-tab state based on activity type
      if (initialData.type === 'To-Do') {
        // Create a custom attachment object for existing attachments
        const attachmentObj = initialData.attachment ? {
          name: initialData.attachment.split('/').pop() || 'attachment',
          type: 'application/octet-stream',
          url: initialData.attachment,
          isExisting: true
        } : null;
        
        setTodo(prev => ({ 
          ...prev, 
          note: initialData.note || initialData.notes || '',
          title: initialData.title || '',
          dueDate: initialData.dueDate || new Date().toISOString().split('T')[0],
          dueTime: initialData.dueTime || '',
          attachment: attachmentObj
        }));
      } else if (initialData.type === 'Email') {
        // Create a custom attachment object for existing attachments
        const attachmentObj = initialData.attachment ? {
          name: initialData.attachment.split('/').pop() || 'attachment',
          type: 'application/octet-stream',
          url: initialData.attachment,
          isExisting: true
        } : null;
        
        setEmail(prev => ({ 
          ...prev, 
          note: initialData.note || initialData.notes || '',
          title: initialData.title || '',
          dueDate: initialData.dueDate || new Date().toISOString().split('T')[0],
          dueTime: initialData.dueTime || '',
          attachment: attachmentObj
        }));
      } else if (initialData.type === 'Call') {
        // Create a custom attachment object for existing attachments
        const attachmentObj = initialData.attachment ? {
          name: initialData.attachment.split('/').pop() || 'attachment',
          type: 'application/octet-stream',
          url: initialData.attachment,
          isExisting: true
        } : null;
        
        setCall(prev => ({ 
          ...prev, 
          note: initialData.note || initialData.notes || '',
          title: initialData.title || '',
          dueDate: initialData.dueDate || new Date().toISOString().split('T')[0],
          dueTime: initialData.dueTime || '',
          callPurpose: initialData.callPurpose || '',
          nextFollowUpDate: initialData.nextFollowUpDate || '',
          nextFollowUpTime: initialData.nextFollowUpTime || '',
          attachment: attachmentObj
        }));
      } else if (initialData.type === 'Meeting') {
        // Convert attendees from array of strings to array of objects with id and name
        let attendeesArray = [{ id: 1, name: '' }];
        if (initialData.attendees && Array.isArray(initialData.attendees)) {
          if (initialData.attendees.length > 0 && typeof initialData.attendees[0] === 'string') {
            // Convert from array of strings to array of objects
            attendeesArray = initialData.attendees.map((name, index) => ({ 
              id: index + 1, 
              name: name || '' 
            }));
          } else if (initialData.attendees.length > 0 && typeof initialData.attendees[0] === 'object') {
            // Already in correct format
            attendeesArray = initialData.attendees;
          }
        }
        
        // Create a custom attachment object for existing attachments
        const attachmentObj = initialData.attachment ? {
          name: initialData.attachment.split('/').pop() || 'attachment',
          type: 'application/octet-stream',
          url: initialData.attachment,
          isExisting: true
        } : null;
        
        setMeeting(prev => ({ 
          ...prev, 
          note: initialData.note || initialData.notes || '',
          title: initialData.title || '',
          dueDate: initialData.dueDate || new Date().toISOString().split('T')[0],
          dueTime: initialData.dueTime || '',
          meetingVenue: initialData.meetingVenue || 'In Office',
          meetingLink: initialData.meetingLink || '',
          attendees: attendeesArray,
          attachment: attachmentObj
        }));
      }
    }
  }, [initialData, isOpen]);

  // Cleanup effect when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when modal closes
      setActiveType('To-Do');
      // Remove global state reset since we're using per-tab state
      // setTitle('');
      // setDueDate(new Date().toISOString().split('T')[0]);
      // setDueTime('');
      // setMeetingLink('');
      // setAttendees([{ id: 1, name: '' }]);
      // setCallPurpose('');
      setCallOutcome('');
      // setNextFollowUpDate('');
      // setNextFollowUpTime('');
      // setMeetingVenue('In Office');
      // Remove the global note reset since we're using per-tab state
      // setNote('');
      // Remove global attachment reset since we're using per-tab state
      // setAttachment(null);
      setMeetingOutcome('');
      setEmailOutcome('');
      setAttachmentLoading(false);
      setAttachmentError(null);
    }
  }, [isOpen]);

  // Per-tab field/handler mapping
  const tabState = useMemo(() => ({
    'To-Do': [todo, setTodo],
    'Email': [email, setEmail],
    'Call': [call, setCall],
    'Meeting': [meeting, setMeeting],
  }), [todo, email, call, meeting]);

  // Per-tab attendee handlers for Meeting
  const handleAddAttendee = useCallback(() => setMeeting(m => ({ ...m, attendees: [...m.attendees, { id: Date.now(), name: '' }] })), []);
  const handleAttendeeChange = useCallback((id, name) => setMeeting(m => ({ ...m, attendees: m.attendees.map(att => att.id === id ? { ...att, name } : att) })), []);
  const handleRemoveAttendee = useCallback((id) => setMeeting(m => ({ ...m, attendees: m.attendees.filter(att => att.id !== id) })), []);

  // Save: if editing, only update the selected activity; if creating, create all filled tabs
  const handleSave = useCallback(async (statusOverride) => {
    try {
      const token = localStorage.getItem('token') || '';
      let formData = new FormData();
      let activities = [];
      // If editing, only update the selected activity
      if (isEditingActivity && initialData && initialData.id) {
        // Build the activity object as per backend format
        let activityToSend = null;
        if (editingType === 'To-Do') {
          activityToSend = {
            type: 'To-Do',
            title: todo.title,
            notes: todo.note || '',
            dueDate: todo.dueDate,
            dueTime: todo.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: '',
            attendees: [],
            callPurpose: '',
            callOutcome: '',
            nextFollowUpDate: '',
            nextFollowUpTime: '',
            meetingVenue: '',
            note: '',
            attachment: todo.attachment ? todo.attachment.name : ''
          };
        } else if (editingType === 'Email') {
          activityToSend = {
            type: 'Email',
            title: email.title,
            notes: email.note || '',
            dueDate: email.dueDate,
            dueTime: email.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: '',
            attendees: [],
            callPurpose: '',
            callOutcome: emailOutcome || '',
            nextFollowUpDate: '',
            nextFollowUpTime: '',
            meetingVenue: '',
            note: '',
            attachment: email.attachment ? email.attachment.name : ''
          };
        } else if (editingType === 'Call') {
          activityToSend = {
            type: 'Call',
            title: call.title,
            notes: call.note || '',
            dueDate: call.dueDate,
            dueTime: call.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: call.meetingLink || '',
            attendees: [],
            callPurpose: call.callPurpose || '',
            callOutcome: callOutcome || '',
            nextFollowUpDate: call.nextFollowUpDate || '',
            nextFollowUpTime: call.nextFollowUpTime || '',
            meetingVenue: call.meetingVenue || '',
            note: '',
            attachment: call.attachment ? call.attachment.name : ''
          };
        } else if (editingType === 'Meeting') {
          let attendeesArr = Array.isArray(meeting.attendees)
            ? meeting.attendees.map(att => att.name || '').filter(Boolean)
            : [];
          activityToSend = {
            type: 'Meeting',
            title: meeting.title,
            notes: meeting.note || '',
            dueDate: meeting.dueDate,
            dueTime: meeting.dueTime,
            user: lead?.name || '',
            status: statusOverride || 'pending',
            meetingLink: meeting.meetingLink || '',
            attendees: attendeesArr,
            callPurpose: '',
            callOutcome: meetingOutcome || '',
            nextFollowUpDate: '',
            nextFollowUpTime: '',
            meetingVenue: meeting.meetingVenue || '',
            note: '',
            attachment: meeting.attachment ? meeting.attachment.name : ''
          };
        }
        
        // Handle file upload for editing
        console.log('Saving activity with attachments:');
        console.log('Todo attachment:', todo.attachment);
        console.log('Email attachment:', email.attachment);
        console.log('Call attachment:', call.attachment);
        console.log('Meeting attachment:', meeting.attachment);
        
        if (editingType === 'To-Do' && todo.attachment && todo.attachment instanceof File) {
          console.log('Saving To-Do with file attachment');
          let editFormData = new FormData();
          editFormData.append('activity', JSON.stringify(activityToSend));
          editFormData.append('file', todo.attachment);
          await axios.put(
            `${API_BASE_URL}/leads/${lead.leadId}/activities/${initialData.id}`,
            editFormData,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else if (editingType === 'Email' && email.attachment && email.attachment instanceof File) {
          console.log('Saving Email with file attachment');
          let editFormData = new FormData();
          editFormData.append('activity', JSON.stringify(activityToSend));
          editFormData.append('file', email.attachment);
          await axios.put(
            `${API_BASE_URL}/leads/${lead.leadId}/activities/${initialData.id}`,
            editFormData,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else if (editingType === 'Call' && call.attachment && call.attachment instanceof File) {
          console.log('Saving Call with file attachment');
          let editFormData = new FormData();
          editFormData.append('activity', JSON.stringify(activityToSend));
          editFormData.append('file', call.attachment);
          await axios.put(
            `${API_BASE_URL}/leads/${lead.leadId}/activities/${initialData.id}`,
            editFormData,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else if (editingType === 'Meeting' && meeting.attachment && meeting.attachment instanceof File) {
          console.log('Saving Meeting with file attachment');
          let editFormData = new FormData();
          editFormData.append('activity', JSON.stringify(activityToSend));
          editFormData.append('file', meeting.attachment);
          await axios.put(
            `${API_BASE_URL}/leads/${lead.leadId}/activities/${initialData.id}`,
            editFormData,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          console.log('Saving without file attachment');
          // Even without files, we need to send as FormData
          let editFormData = new FormData();
          editFormData.append('activity', JSON.stringify(activityToSend));
          await axios.put(
            `${API_BASE_URL}/leads/${lead.leadId}/activities/${initialData.id}`,
            editFormData,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        if (onSuccess) onSuccess(activityToSend);
        if (onActivityChange) onActivityChange(lead.leadId);
        onClose();
        return;
      }
      // To-Do
      if (todo.title) {
        activities.push({
          type: 'To-Do',
          title: todo.title,
          notes: todo.note || '',
          dueDate: todo.dueDate,
          dueTime: todo.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: '',
          attendees: [],
          callPurpose: '',
          callOutcome: '',
          nextFollowUpDate: '',
          nextFollowUpTime: '',
          meetingVenue: '',
          note: '',
          attachment: todo.attachment ? todo.attachment.name : ''
        });
      }
      // Email
      if (email.title) {
        activities.push({
          type: 'Email',
          title: email.title,
          notes: email.note || '',
          dueDate: email.dueDate,
          dueTime: email.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: '',
          attendees: [],
          callPurpose: '',
          callOutcome: emailOutcome || '',
          nextFollowUpDate: '',
          nextFollowUpTime: '',
          meetingVenue: '',
          note: '',
          attachment: email.attachment ? email.attachment.name : ''
        });
      }
      // Call
      if (call.title) {
        activities.push({
          type: 'Call',
          title: call.title,
          notes: call.note || '',
          dueDate: call.dueDate,
          dueTime: call.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: call.meetingLink || '',
          attendees: [],
          callPurpose: call.callPurpose || '',
          callOutcome: callOutcome || '',
          nextFollowUpDate: call.nextFollowUpDate || '',
          nextFollowUpTime: call.nextFollowUpTime || '',
          meetingVenue: call.meetingVenue || '',
          note: '',
          attachment: call.attachment ? call.attachment.name : ''
        });
      }
      // Meeting
      if (meeting.title) {
        let attendeesArr = Array.isArray(meeting.attendees)
          ? meeting.attendees.map(att => att.name || '').filter(Boolean)
          : [];
        activities.push({
          type: 'Meeting',
          title: meeting.title,
          notes: meeting.note || '',
          dueDate: meeting.dueDate,
          dueTime: meeting.dueTime,
          user: lead?.name || '',
          status: statusOverride || 'pending',
          meetingLink: meeting.meetingLink || '',
          attendees: attendeesArr,
          callPurpose: '',
          callOutcome: meetingOutcome || '',
          nextFollowUpDate: '',
          nextFollowUpTime: '',
          meetingVenue: meeting.meetingVenue || '',
          note: '',
          attachment: meeting.attachment ? meeting.attachment.name : ''
        });
      }
      formData.append('activities', JSON.stringify(activities));
      // Handle attachments for each activity
      activities.forEach((activity, index) => {
        const activityData = [todo, email, call, meeting].find(a => a.title === activity.title);
        if (activityData && activityData.attachment instanceof File) {
          formData.append('files', activityData.attachment);
        }
      });
      const response = await axios.post(
        `${API_BASE_URL}/leads/${lead.leadId}/activities/bulk-with-files`,
        formData,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (onSuccess && response.data && response.data.length > 0) {
        onSuccess(response.data[0]);
      } else if (onSuccess && activities.length) {
        onSuccess(activities[0]);
      }
      onClose();
    } catch (e) {
      console.error('Failed to save activity:', e);
    }
  }, [isEditingActivity, editingType, todo, email, call, meeting, emailOutcome, callOutcome, meetingOutcome, lead, onSuccess, onActivityChange, onClose, initialData]);

  const activityTypes = useMemo(() => [
    { name: 'To-Do', icon: <FaCheck /> },
    { name: 'Email', icon: <FaEnvelope /> },
    { name: 'Call', icon: <FaPhone /> },
    { name: 'Meeting', icon: <FaUsers /> },
  ], []);

  if (!isOpen) return null;

  const [tabData, setTabData] = tabState[activeType];

  const summary = activeType === 'Call' ? 'Call Information' : activeType;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[70vh] h-auto flex flex-col border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
          <h2 className="text-base font-semibold text-gray-900">Schedule Activity</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors duration-150">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        <div className="flex border-b mb-0 px-4 bg-white sticky top-0 z-10">
          {activityTypes.map(type => (
            <button
              key={type.name}
              onClick={() => !isEditingActivity || editingType === type.name ? setActiveType(type.name) : null}
              disabled={isEditingActivity && editingType !== type.name}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-medium ${activeType === type.name ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:bg-gray-100'} ${isEditingActivity && editingType !== type.name ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {type.icon}
              {type.name}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50" style={{ minHeight: '320px', maxHeight: '420px' }}>
          {/* Title Field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={tabData.title}
              onChange={e => setTabData({ ...tabData, title: e.target.value })}
              className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
              placeholder="Enter activity title"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Due Date</label>
              <input type="date" value={tabData.dueDate} onChange={e => setTabData({ ...tabData, dueDate: e.target.value })} className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300" />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-700">Time</label>
              <input type="time" value={tabData.dueTime} onChange={e => setTabData({ ...tabData, dueTime: e.target.value })} className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300" />
            </div>
          </div>

          {/* Call Fields */}
          {activeType === 'Call' && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-700">Purpose of the Call</label>
                <textarea
                  className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  placeholder="Add purpose of the call..."
                  value={call.callPurpose}
                  onChange={e => setCall(prev => ({ ...prev, callPurpose: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Outcome of the Call</label>
                <textarea
                  className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  placeholder="Add outcome of the call..."
                  value={callOutcome}
                  onChange={e => setCallOutcome(e.target.value)}
                />
              </div>
              {isEditingActivity && (
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-gray-700">Next Follow Up</label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={call.nextFollowUpDate}
                        onChange={e => setCall(prev => ({ ...prev, nextFollowUpDate: e.target.value }))}
                        className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                        placeholder="Next Date"
                      />
                      <input
                        type="time"
                        value={call.nextFollowUpTime}
                        onChange={e => setCall(prev => ({ ...prev, nextFollowUpTime: e.target.value }))}
                        className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                        placeholder="Call Time"
                      />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email Fields */}
          {activeType === 'Email' && isEditingActivity && (
            <div>
              <label className="text-xs font-medium text-gray-700">Outcome</label>
              <textarea
                className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                placeholder="Add outcome of the email..."
                value={emailOutcome}
                onChange={e => setEmailOutcome(e.target.value)}
              />
            </div>
          )}

          {/* Meeting Fields */}
          {activeType === 'Meeting' && (
            <>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex-1 relative">
                  <label className="text-xs font-medium text-gray-700">Meeting Venue</label>
                  <select
                    className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-gray-100 border-gray-300 text-gray-800 pr-10 pl-3 hover:border-blue-400 transition-all"
                    value={meeting.meetingVenue}
                    onChange={e => setMeeting(m => ({ ...m, meetingVenue: e.target.value }))}
                    style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                  >
                    <option value="In Office">In Office</option>
                    <option value="Online">Online</option>
                    <option value="Client Site">Client Site</option>
                    <option value="Other">Other</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-9 text-gray-500 flex items-center">
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 8L10 12L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-gray-700">Meeting Link</label>
                  <input
                    type="text"
                    value={meeting.meetingLink}
                    onChange={e => setMeeting(m => ({ ...m, meetingLink: e.target.value }))}
                    placeholder="https://..."
                    className="w-full p-2 mt-1 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Attendees</label>
                {meeting.attendees.map((attendee, index) => (
                  <div key={attendee.id} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={attendee.name}
                      onChange={e => handleAttendeeChange(attendee.id, e.target.value)}
                      placeholder={`Attendee ${index + 1} name`}
                      className="w-full p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                    />
                    <button type="button" onClick={() => handleRemoveAttendee(attendee.id)} className="text-red-500 hover:text-red-700 p-2">
                      <FaTimes />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddAttendee} className="text-blue-600 text-xs mt-2">+ Add Attendee</button>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700">Outcome of the Meeting</label>
                <textarea
                  className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
                  placeholder="Add outcome of the meeting..."
                  value={meetingOutcome}
                  onChange={e => setMeetingOutcome(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Note and Attachment Section (all tabs) */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Note</label>
            <textarea
              className="w-full h-16 p-2 border rounded-md text-xs focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-150 border-gray-300"
              placeholder="Add a note..."
              value={tabData.note}
              onChange={e => setTabData({ ...tabData, note: e.target.value })}
            />
            <div className="flex items-center gap-2 mt-2">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={e => {
                  console.log('File input changed:', e.target.files);
                  if (e.target.files && e.target.files[0]) {
                    const selectedFile = e.target.files[0];
                    console.log('Selected file:', selectedFile);
                    setTabData({ ...tabData, attachment: selectedFile });
                    setAttachmentError(null); // Clear any previous errors
                  }
                }}
              />
              <button
                type="button"
                className="cursor-pointer flex items-center gap-1 text-blue-600 hover:text-blue-800"
                onClick={() => {
                  console.log('File input button clicked');
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <FaPaperclip />
                <span className="text-xs font-medium">Attach</span>
              </button>
              {tabData.attachment && (
                <span 
                  className={`px-2 py-1 rounded flex items-center gap-1 text-xs ${attachmentLoading ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 cursor-pointer hover:bg-blue-200'}`}
                  onClick={async () => {
                    if (attachmentLoading) return; // Prevent multiple clicks while loading
                    if (tabData.attachment.isExisting && tabData.attachment.url) {
                      // For existing attachments, fetch through Minio and open in new tab
                      try {
                        setAttachmentLoading(true);
                        const result = await dispatch(fetchImageFromMinio({ url: tabData.attachment.url })).unwrap();
                        if (result && result.dataUrl) {
                          window.open(result.dataUrl, '_blank');
                        } else {
                          console.error('Failed to fetch attachment from Minio');
                        }
                                              } catch (error) {
                          console.error('Error fetching attachment:', error);
                          setAttachmentError('Failed to load attachment');
                        } finally {
                          setAttachmentLoading(false);
                        }
                    } else if (tabData.attachment instanceof File) {
                      // For new files, create a blob URL and open in new tab
                      const blobUrl = URL.createObjectURL(tabData.attachment);
                      window.open(blobUrl, '_blank');
                    }
                  }}
                >
                                     {attachmentLoading ? (
                     <svg className="animate-spin h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                 ) : attachmentError ? (
                   <span className="text-red-600 text-xs" title={attachmentError}>
                     ❌ {tabData.attachment.name}
                   </span>
                 ) : (
                   <>
                     {tabData.attachment.isExisting ? '📎 ' : ''}{tabData.attachment.name}
                     <FaTimes 
                       className="ml-1 text-xs hover:text-red-500" 
                       onClick={e => { 
                         e.stopPropagation(); 
                         setTabData({ ...tabData, attachment: null }); 
                       }} 
                     />
                   </>
                 )}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white border-t shadow-lg flex items-center justify-end gap-2 p-4 z-10 rounded-b-2xl sticky bottom-0">
          <button onClick={() => handleSave()} className="bg-blue-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-blue-700">{isEditingActivity ? 'Edit' : 'Save'}</button>
          <button onClick={() => handleSave('done')} className="bg-gray-600 text-white px-4 py-2 rounded-md text-xs font-semibold hover:bg-gray-700">Mark Done</button>
          <button onClick={onClose} className="bg-white border border-gray-300 px-4 py-2 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50">Discard</button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedScheduleActivityModal; 