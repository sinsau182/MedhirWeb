import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, isWeekend, isWithinInterval, isSameDay, eachDayOfInterval } from 'date-fns';

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
    { value: 'First Half (Morning)', label: 'First Half (Morning)' },
    { value: 'Second Half (Afternoon)', label: 'Second Half (Afternoon)' },
    { value: 'Full Day', label: 'Full Day' },
  ];

  useEffect(() => {
    if (selectedDates.length > 0) {
      setSelectedDateObjects(selectedDates.map(date => ({
        date: new Date(date.date),
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
    if (isDateDisabled(date) && !isWeekend(date)) return; // Allow weekend selection but keep other disabled date restrictions

    let newSelectedDates;
    if (isCompOff) {
      // For comp off, only allow single date selection
      if (selectedDateObjects.some(selected => isSameDay(selected.date, date))) {
        newSelectedDates = [];
      } else {
        newSelectedDates = [{ 
          date: new Date(date),
          timeSlot 
        }];
      }
    } else {
      // For leave application, allow consecutive date selection including weekends
      const isAlreadySelected = selectedDateObjects.some(selected => 
        isSameDay(selected.date, date)
      );

      if (isAlreadySelected) {
        // If clicking on a date that's already selected, remove it
        newSelectedDates = selectedDateObjects.filter(selected => !isSameDay(selected.date, date));
      } else {
        if (selectedDateObjects.length > 0) {
          // Get all selected dates including the new one
          const allDates = [...selectedDateObjects.map(d => d.date), date];
          
          // Sort dates chronologically
          const sortedDates = allDates.sort((a, b) => a - b);
          
          // Check if dates form a consecutive sequence (including weekends)
          let isConsecutive = true;
          for (let i = 1; i < sortedDates.length; i++) {
            const prevDate = new Date(sortedDates[i - 1]);
            const currDate = new Date(sortedDates[i]);
            const diffTime = Math.abs(currDate - prevDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // Allow 1 day difference or 2-3 days if spanning a weekend
            if (diffDays > 3 || (diffDays > 1 && !isWeekend(new Date(prevDate.getTime() + 24 * 60 * 60 * 1000)))) {
              isConsecutive = false;
              break;
            }
          }

          if (!isConsecutive) {
            alert("Please select consecutive dates (weekends can be skipped)");
            return;
          }
        }
        
        if (maxDays && selectedDateObjects.length >= maxDays) {
          alert(`You can only select up to ${maxDays} days`);
          return;
        }
        
        newSelectedDates = [...selectedDateObjects, { 
          date: new Date(date),
          timeSlot: timeSlot
        }];
      }
    }

    // Sort the dates chronologically before setting
    newSelectedDates.sort((a, b) => a.date - b.date);
    setSelectedDateObjects(newSelectedDates);
    onChange(newSelectedDates);
  };

  const handleTimeSlotChange = (e) => {
    const newTimeSlot = e.target.value;
    setTimeSlot(newTimeSlot);
    if (onShiftTypeChange) {
      onShiftTypeChange(e);
    }
    // Only update the timeSlot for the most recently selected date
    if (selectedDateObjects.length > 0) {
      const updatedDates = [...selectedDateObjects];
      updatedDates[updatedDates.length - 1] = {
        ...updatedDates[updatedDates.length - 1],
        timeSlot: newTimeSlot
      };
      setSelectedDateObjects(updatedDates);
      onChange(updatedDates);
    }
  };

  const handleIndividualTimeSlotChange = (date, newTimeSlot) => {
    const updatedDates = selectedDateObjects.map(selected => {
      if (isSameDay(selected.date, date)) {
        return {
          ...selected,
          timeSlot: newTimeSlot
        };
      }
      return selected;
    });
    setSelectedDateObjects(updatedDates);
    onChange(updatedDates);
  };

  const removeDate = (dateToRemove) => {
    const newDates = selectedDateObjects.filter(selected => 
      !isSameDay(selected.date, dateToRemove)
    );
    setSelectedDateObjects(newDates);
    onChange(newDates);
  };

  const calculateTotalDays = () => {
    return selectedDateObjects.reduce((total, selected) => {
      if (selected.timeSlot === 'HALF_DAY' || 
          selected.timeSlot === 'FIRST_HALF' || 
          selected.timeSlot === 'SECOND_HALF') {
        return total + 0.5;
      }
      return total + 1;
    }, 0);
  };

  const isInRange = (date) => {
    if (selectedDateObjects.length < 2 || !date) return false;
    const sortedDates = selectedDateObjects
      .map(d => d.date)
      .sort((a, b) => a - b);
    return isWithinInterval(date, { start: sortedDates[0], end: sortedDates[sortedDates.length - 1] });
  };

  const isStartOrEndDate = (date) => {
    if (!date || selectedDateObjects.length === 0) return false;
    const sortedDates = selectedDateObjects
      .map(d => d.date)
      .sort((a, b) => a - b);
    return isSameDay(date, sortedDates[0]) || isSameDay(date, sortedDates[sortedDates.length - 1]);
  };

  return (
    <div className="relative" ref={calendarRef}>
      <div className="w-full">
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
            {selectedDateObjects.length > 0 
              ? selectedDateObjects.map((selected, index) => {
                  const dateObj = selected.date instanceof Date ? selected.date : new Date(selected.date);
                  return (
                    <span key={dateObj.toISOString()}>
                      {format(dateObj, 'dd MMM yyyy')}
                      {index < selectedDateObjects.length - 1 ? ', ' : ''}
                    </span>
                  );
                })
              : 'Select Day'}
          </span>
          <CalendarIcon className="h-5 w-5 text-blue-500" />
        </div>

        {/* Time Slot Selector - Only shown when no dates are selected */}
        {selectedDateObjects.length === 0 && (
          <select
            value={timeSlot}
            onChange={handleTimeSlotChange}
            className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {timeSlotOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {/* Selected Dates Display - Only shown when dates are selected */}
        {selectedDateObjects.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {selectedDateObjects.map((selected) => {
                const dateObj = selected.date instanceof Date ? selected.date : new Date(selected.date);
                
                return (
                  <div
                    key={dateObj.toISOString()}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <span className="font-medium">{format(dateObj, 'dd MMM yyyy')}</span>
                    <select
                      value={selected.timeSlot}
                      onChange={(e) => handleIndividualTimeSlotChange(dateObj, e.target.value)}
                      className="text-xs text-blue-600 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {timeSlotOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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