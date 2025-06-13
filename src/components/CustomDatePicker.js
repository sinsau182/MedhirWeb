import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isWeekend, isSameDay } from 'date-fns';
import { toast } from 'sonner';

const CustomDatePicker = ({
  selectedDates = [],
  onChange,
  disabledDates = [],
  isCompOff = false,
  maxDays,
  minDate = new Date(),
  shiftType = 'FULL_DAY',
  onShiftTypeChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState(shiftType);
  const [selectedDateObjects, setSelectedDateObjects] = useState([]);
  const [hoverDate, setHoverDate] = useState(null);
  const calendarRef = useRef(null);
  const inputRef = useRef(null);
  const calendarPopupRef = useRef(null);

  const timeSlotOptions = [
    { value: 'FULL_DAY', label: 'Full Day' },
    { value: 'FIRST_HALF', label: 'First Half (Morning)' },
    { value: 'SECOND_HALF', label: 'Second Half (Evening)' }
  ];

  // Handle shift type change
  const handleShiftTypeChange = (e) => {
    const newShiftType = e.target.value;
    setTimeSlot(newShiftType);
    
    // Update all selected dates with new shift type
    const updatedDates = selectedDateObjects.map(date => ({
      ...date,
      shiftType: newShiftType,
      timeSlot: newShiftType
    }));
    setSelectedDateObjects(updatedDates);
    
    // Notify parent component
    if (onShiftTypeChange) {
      onShiftTypeChange({
        ...e,
        target: {
          ...e.target,
          value: newShiftType
        }
      });
    }
    if (onChange) {
      onChange(updatedDates);
    }
  };

  useEffect(() => {
    if (selectedDates.length > 0) {
      setSelectedDateObjects(selectedDates.map(date => ({
        date: date.date instanceof Date ? date.date : new Date(date.date),
        shiftType: date.shiftType || timeSlot,
        timeSlot: date.timeSlot || timeSlot
      })));
    } else {
      setSelectedDateObjects([]);
    }
  }, [selectedDates, timeSlot]);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close calendar if click is outside calendar popup and input field
      if (
        calendarPopupRef.current && 
        !calendarPopupRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return true;
    if (isWeekend(date)) return true;
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) return true;
    
    return disabledDates.some(disabledDate => 
      isSameDay(new Date(disabledDate), date)
    );
  };

  const isDateSelected = (date) => {
    return selectedDateObjects.some(selected => 
      isSameDay(selected.date, date)
    );
  };

  const handleDateClick = (date) => {
    if (isDateDisabled(date) && !isWeekend(date)) return;

    let newSelectedDates;
    if (isCompOff) {
      if (selectedDateObjects.some(selected => isSameDay(selected.date, date))) {
        newSelectedDates = [];
      } else {
        // Create date with UTC midnight
        const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        newSelectedDates = [{ 
          date: newDate,
          shiftType: timeSlot,
          timeSlot: timeSlot
        }];
      }
    } else {
      const isAlreadySelected = selectedDateObjects.some(selected => 
        isSameDay(selected.date, date)
      );

      if (isAlreadySelected) {
        // When removing a date, only allow if it's at the start or end of the range
        const sortedDates = [...selectedDateObjects].sort((a, b) => a.date - b.date);
        const isStartOrEnd = isSameDay(sortedDates[0].date, date) || 
                           isSameDay(sortedDates[sortedDates.length - 1].date, date);
        
        if (!isStartOrEnd) {
          toast.error("You can only remove dates from the start or end of the range");
          return;
        }
        newSelectedDates = selectedDateObjects.filter(selected => !isSameDay(selected.date, date));
      } else {
        if (maxDays && selectedDateObjects.length >= maxDays) {
          toast.error(`You can only select up to ${maxDays} days`);
          return;
        }

        // When adding a date, ensure it's continuous with existing dates (skipping weekends)
        if (selectedDateObjects.length > 0) {
          const sortedDates = [...selectedDateObjects].sort((a, b) => a.date - b.date);
          const firstDate = sortedDates[0].date;
          const lastDate = sortedDates[sortedDates.length - 1].date;
          const newDateValue = date.getTime();
          
          // Check if the new date is adjacent to the existing range (considering weekends)
          const isAdjacent = (() => {
            // Function to get next working day
            const getNextWorkingDay = (date) => {
              let nextDay = new Date(date);
              nextDay.setDate(nextDay.getDate() + 1);
              while (isWeekend(nextDay)) {
                nextDay.setDate(nextDay.getDate() + 1);
              }
              return nextDay;
            };

            // Function to get previous working day
            const getPrevWorkingDay = (date) => {
              let prevDay = new Date(date);
              prevDay.setDate(prevDay.getDate() - 1);
              while (isWeekend(prevDay)) {
                prevDay.setDate(prevDay.getDate() - 1);
              }
              return prevDay;
            };

            // Check if the new date is the next working day after the last date
            const nextWorkingDay = getNextWorkingDay(lastDate);
            if (isSameDay(date, nextWorkingDay)) return true;

            // Check if the new date is the previous working day before the first date
            const prevWorkingDay = getPrevWorkingDay(firstDate);
            if (isSameDay(date, prevWorkingDay)) return true;

            return false;
          })();
          
          if (!isAdjacent) {
            toast.error("Please select continuous working days (weekends will be skipped)");
            return;
          }
        }
        
        // Create date with UTC midnight
        const newDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        newSelectedDates = [...selectedDateObjects, { 
          date: newDate,
          shiftType: timeSlot,
          timeSlot: timeSlot
        }];
      }
    }

    newSelectedDates.sort((a, b) => a.date - b.date);
    setSelectedDateObjects(newSelectedDates);
    onChange(newSelectedDates);
  };

  const removeDate = (dateToRemove) => {
    const newDates = selectedDateObjects.filter(selected => 
      !isSameDay(selected.date, dateToRemove)
    );
    setSelectedDateObjects(newDates);
    onChange(newDates);
  };

  return (
    <div className="relative" ref={calendarRef}>
      <div className="w-full space-y-2">
        {/* Time Slot Selector - Always visible */}
        <select
          value={timeSlot || "Full Day"}
          onChange={handleShiftTypeChange}
          className="block w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        >
          {timeSlotOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Date Picker Trigger */}
        <div
          ref={inputRef}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between cursor-pointer hover:border-blue-500 hover:shadow-sm transition-all duration-200 bg-white"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <span className="text-gray-700 font-medium">
            {selectedDateObjects.length > 0 ? 'Selected Days' : 'Select Day'}
          </span>
          <CalendarIcon className="h-5 w-5 text-blue-500" />
        </div>

        {/* Selected Dates Display */}
        {selectedDateObjects.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {selectedDateObjects.map((selected) => {
                const dateObj = selected.date instanceof Date ? selected.date : new Date(selected.date);
                
                const shiftTypeLabel = timeSlotOptions.find(option => option.value === selected.shiftType)?.label || selected.shiftType;
                return (
                  <div
                    key={dateObj.toISOString()}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="font-medium">{format(dateObj, 'dd MMM yyyy')}</span>
                    <span className="text-xs text-blue-600 ml-1">
                      {shiftTypeLabel}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDate(dateObj);
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-200 rounded-full p-0.5 transition-colors duration-200"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Calendar Popup */}
        {isOpen && (
          <div 
            ref={calendarPopupRef}
            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg transform transition-all duration-200 ease-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)));
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <span className="font-semibold text-gray-800">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
                  }}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 p-1.5">
                    {day}
                  </div>
                ))}
                {getDaysInMonth(currentMonth).map((date, index) => (
                  <div
                    key={index}
                    className={`
                      relative p-1.5 text-center cursor-pointer rounded-md transition-all duration-200
                      ${!date ? 'invisible' : ''}
                      ${isDateDisabled(date) ? 'text-gray-300 cursor-not-allowed' : 
                        isDateSelected(date) ? 'bg-blue-500 text-white hover:bg-blue-600' :
                        'hover:bg-blue-50 text-gray-700'
                      }
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      date && handleDateClick(date);
                    }}
                    onMouseEnter={() => setHoverDate(date)}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    {date ? (
                      <>
                        <span className={`
                          relative z-10 font-medium
                          ${isDateSelected(date) ? 'text-white' : ''}
                        `}>
                          {format(date, 'd')}
                        </span>
                        {isDateSelected(date) && (
                          <span className="absolute inset-0 rounded-md bg-blue-500 shadow-sm"></span>
                        )}
                      </>
                    ) : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomDatePicker; 