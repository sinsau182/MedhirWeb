import React, { useState } from 'react';
import { FaFilter, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const DateFilter = ({ 
  onFilterChange, 
  onReset, 
  title = "Date Filter", 
  showFilterInfo = false,
  className = "",
  startDate = "",
  endDate = "",
  disabled = false,
  compact = true
}) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    setLocalStartDate(newStartDate);
    if (onFilterChange) {
      onFilterChange(newStartDate, localEndDate);
    }
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setLocalEndDate(newEndDate);
    if (onFilterChange) {
      onFilterChange(localStartDate, newEndDate);
    }
  };

  const handleReset = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    if (onReset) {
      onReset();
    }
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const hasActiveFilter = localStartDate || localEndDate;

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        {/* Compact Filter Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            hasActiveFilter
              ? 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
              : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <FaFilter className={`w-3 h-3 ${hasActiveFilter ? 'text-blue-600' : 'text-gray-500'}`} />
          <span className="hidden sm:inline">Filter</span>
          {hasActiveFilter && (
            <span className="inline-flex items-center justify-center w-4 h-4 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
              {[localStartDate, localEndDate].filter(Boolean).length}
            </span>
          )}
        </button>

        {/* Dropdown Filter Panel */}
        {isExpanded && (
          <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="p-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-4 h-4 text-gray-500" />
                  <h3 className="font-medium text-gray-900">{title}</h3>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>

              {/* Date Inputs */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    value={localStartDate}
                    onChange={handleStartDateChange}
                    disabled={disabled}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    value={localEndDate}
                    onChange={handleEndDateChange}
                    disabled={disabled}
                    min={localStartDate}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <button
                  onClick={handleReset}
                  disabled={disabled || !hasActiveFilter}
                  className="text-sm text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                
                <div className="flex items-center gap-2">
                  {hasActiveFilter && (
                    <span className="text-xs text-gray-500">
                      {formatDateForDisplay(localStartDate)} - {formatDateForDisplay(localEndDate)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    );
  }

  // Full width version (original design)
  return (
    <div className={`bg-white p-4 rounded-lg shadow border border-gray-200 ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-500" />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={localStartDate}
              onChange={handleStartDateChange}
              disabled={disabled}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-gray-400" />
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={localEndDate}
              onChange={handleEndDateChange}
              disabled={disabled}
              min={localStartDate}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          <button
            onClick={handleReset}
            disabled={disabled}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors duration-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        </div>
      </div>
      
      {showFilterInfo && (localStartDate || localEndDate) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Filtering data from {formatDateForDisplay(localStartDate)} to {formatDateForDisplay(localEndDate)}
          </p>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
