import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { FaTimes, FaTrash, FaTimesCircle, FaExclamationTriangle, FaCalendarAlt, FaRupeeSign } from 'react-icons/fa';

const LostJunkLeadsView = () => {
  const router = useRouter();
  const { leads } = useSelector((state) => state.leads);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'junk'

  // Filter leads based on the grouped structure from fetchLeads
  const lostLeads = [];
  const junkLeads = [];

  // Process the grouped leads data
  if (Array.isArray(leads)) {
    leads.forEach(stage => {
      if (stage.formType === 'LOST' && stage.leads) {
        // Add stage information to each lead
        const leadsWithStage = stage.leads.map(lead => ({
          ...lead,
          stageName: 'Lost',
          formType: stage.formType
        }));
        lostLeads.push(...leadsWithStage);
      } else if (stage.formType === 'JUNK' && stage.leads) {
        // Add stage information to each lead
        const leadsWithStage = stage.leads.map(lead => ({
          ...lead,
          stageName: 'Junk',
          formType: stage.formType
        }));
        junkLeads.push(...leadsWithStage);
      }
    });
  }

  const handleLeadClick = (leadId) => {
    router.push(`/Sales/leads/${leadId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FaTrash className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lost & Junk Leads</h1>
            <p className="text-sm text-gray-600">View and manage lost and junk leads</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex">
          <button
            onClick={() => setActiveTab('lost')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'lost'
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaTimesCircle className="w-4 h-4" />
            Lost Leads ({lostLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('junk')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'junk'
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FaExclamationTriangle className="w-4 h-4" />
            Junk Leads ({junkLeads.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-full overflow-y-auto">
        {activeTab === 'lost' ? (
          <div>
            {lostLeads.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaTimesCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Lost Leads</h3>
                <p className="text-gray-500">There are currently no lost leads to display.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {lostLeads.map((lead) => (
                  <div 
                    key={lead.leadId} 
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
                    onClick={() => handleLeadClick(lead.leadId)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-semibold text-sm">
                          {lead.name?.charAt(0)?.toUpperCase() || 'L'}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Lost</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">{lead.name}</h4>
                    <p className="text-xs text-gray-500 mb-3">ID: {lead.leadId}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium text-gray-900">₹{lead.budget ? Number(lead.budget).toLocaleString('en-IN') : '0'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(lead.dateOfCreation)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <div className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">Sales Rep:</span> {lead.salesRep || 'Not Assigned'}
                      </div>
                      {lead.priority && (
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Priority:</span> {lead.priority}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {junkLeads.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaExclamationTriangle className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">No Junk Leads</h3>
                <p className="text-gray-500">There are currently no junk leads to display.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {junkLeads.map((lead) => (
                  <div 
                    key={lead.leadId} 
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200"
                    onClick={() => handleLeadClick(lead.leadId)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-gray-700 font-semibold text-sm">
                          {lead.name?.charAt(0)?.toUpperCase() || 'J'}
                        </span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Junk</span>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 text-sm mb-2">{lead.name}</h4>
                    <p className="text-xs text-gray-500 mb-3">ID: {lead.leadId}</p>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Budget:</span>
                        <span className="font-medium text-gray-900">₹{lead.budget ? Number(lead.budget).toLocaleString('en-IN') : '0'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">{formatDate(lead.dateOfCreation)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-2 border border-gray-200">
                      <div className="text-xs text-gray-700 mb-1">
                        <span className="font-medium">Sales Rep:</span> {lead.salesRep || 'Not Assigned'}
                      </div>
                      {lead.priority && (
                        <div className="text-xs text-gray-700">
                          <span className="font-medium">Priority:</span> {lead.priority}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LostJunkLeadsView;
