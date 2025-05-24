import React, { useState, useMemo, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const dayAbbr = ['M', 'T', 'W', 'TH', 'F', 'Sa', 'S'];
const days = Array.from({ length: 31 }, (_, i) => {
  const dayIdx = i % 7;
  return {
    date: (i + 1).toString().padStart(2, '0'),
    abbr: dayAbbr[dayIdx],
    isMonday: dayAbbr[dayIdx] === 'M',
    isSunday: dayAbbr[dayIdx] === 'S',
  };
});

const statusStyles = {
  'P': 'bg-green-50 text-green-600 border-green-100',
  'AB': 'bg-red-50 text-red-500 border-red-100',
  'H': 'bg-yellow-50 text-yellow-600 border-yellow-100',
  'L': 'bg-blue-50 text-blue-600 border-blue-100',
  '': 'bg-gray-50 text-gray-600 border-gray-100'
};

const legend = [
  { style: 'bg-green-50 text-green-600', label: 'Present' },
  { style: 'bg-red-50 text-red-500', label: 'Absent' },
  { style: 'bg-yellow-50 text-yellow-600', label: 'Half Day' },
  { style: 'bg-gray-100 text-gray-400', label: 'Week Off' },
];

const months = [
  { value: '2025-May', label: 'May 2025' },
  { value: '2025-Apr', label: 'April 2025' },
  { value: '2025-Mar', label: 'March 2025' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'P', label: 'Present' },
  { value: 'AB', label: 'Absent' },
  { value: 'H', label: 'Half Day' },
];

const CustomDropdown = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target) &&
        listRef.current && !listRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selected = options.find(o => o.value === value);

  return (
    <div className="relative min-w-[120px]">
      <button
        ref={btnRef}
        type="button"
        className="flex items-center justify-between w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm text-xs text-gray-700 hover:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {selected?.label || 'Select'}
        <svg className="w-3 h-3 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          ref={listRef}
          tabIndex={-1}
          className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-xs text-gray-700 max-h-48 overflow-auto animate-fade-in"
          role="listbox"
        >
          {options.map(opt => (
            <li
              key={opt.value}
              className={`px-3 py-1.5 cursor-pointer hover:bg-blue-50 transition ${opt.value === value ? 'bg-blue-50 text-blue-600 font-semibold' : ''}`}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const summaryIcons = {
  P: (
    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  ),
  AB: (
    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  H: (
    <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
  ),
  W: (
    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8" /></svg>
  ),
};

const summaryColors = {
  P: 'bg-green-50 border-green-200 text-green-700',
  AB: 'bg-red-50 border-red-200 text-red-600',
  H: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  W: 'bg-gray-50 border-gray-200 text-gray-500',
};

const summaryLabels = {
  P: 'Present',
  AB: 'Absent',
  H: 'Half Day',
  W: 'Week Off',
};

const getFormattedDate = (dateObj) => {
  return dateObj.toLocaleDateString('en-CA'); // yyyy-mm-dd
};

const getDisplayDate = (dateObj) => {
  return dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

function getDeterministicStatus(empIndex, dayIndex) {
  // Use a combination of employee index and day index to generate a consistent status
  const statuses = ['P', 'AB', 'H'];
  const combinedIndex = (empIndex + dayIndex) % 3;
  return statuses[combinedIndex];
}

// Generate 20 employees with deterministic attendance for first 14 days, rest empty
const employeeList = [
  { name: 'Aparna Sharma', dept: 'Human Resource' },
  { name: 'Rahul Verma', dept: 'Development' },
  { name: 'Priya Patel', dept: 'Design' },
  { name: 'Amit Kumar', dept: 'Development' },
  { name: 'Neha Singh', dept: 'Marketing' },
  { name: 'Vikram Mehta', dept: 'Sales' },
  { name: 'Ananya Gupta', dept: 'Design' },
  { name: 'Rajesh Kumar', dept: 'Development' },
  { name: 'Sneha Reddy', dept: 'Human Resource' },
  { name: 'Karan Malhotra', dept: 'Marketing' },
  { name: 'Suresh Iyer', dept: 'Finance' },
  { name: 'Meena Joshi', dept: 'Support' },
  { name: 'Rohit Sinha', dept: 'Development' },
  { name: 'Divya Nair', dept: 'Design' },
  { name: 'Arjun Kapoor', dept: 'Sales' },
  { name: 'Pooja Batra', dept: 'Marketing' },
  { name: 'Sanjay Rao', dept: 'Finance' },
  { name: 'Kavita Desai', dept: 'Support' },
  { name: 'Nitin Shah', dept: 'Development' },
  { name: 'Ritu Jain', dept: 'Design' },
  // 11 more employees
  { name: 'Manoj Pillai', dept: 'Sales' },
  { name: 'Shweta Tripathi', dept: 'Marketing' },
  { name: 'Deepak Chawla', dept: 'Finance' },
  { name: 'Aishwarya Menon', dept: 'Support' },
  { name: 'Vikas Dubey', dept: 'Development' },
  { name: 'Priyanka Chopra', dept: 'Design' },
  { name: 'Harshad Mehta', dept: 'Sales' },
  { name: 'Geeta Kumari', dept: 'Marketing' },
  { name: 'Tarun Khanna', dept: 'Finance' },
  { name: 'Snehal Patil', dept: 'Support' },
  { name: 'Ramesh Pawar', dept: 'Development' },
];

const attendanceData = employeeList.map((emp, idx) => ({
  empId: `MED${101 + idx}`,
  name: emp.name,
  dept: emp.dept,
  days: [
    ...Array.from({ length: 14 }, (_, dayIdx) => getDeterministicStatus(idx, dayIdx)),
    ...Array(17).fill(''),
  ],
}));

const EmployeeAttendance = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2025-May');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [playcardFilter, setPlaycardFilter] = useState(null);

  // Find index for selected date (move this above useMemo)
  const selectedDateObj = selectedDate;
  const selectedIdx = selectedDateObj.getDate() - 1;
  const safeIdx = selectedIdx >= 0 && selectedIdx < days.length ? selectedIdx : 0;

  // Filter data based on search, status, and playcard filter
  const filteredData = useMemo(() => {
    return attendanceData.filter(employee => {
      const matchesSearch = searchQuery === '' || 
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.dept.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = selectedStatus === 'all' || 
        (days[safeIdx].isMonday ? 'W' : employee.days[safeIdx]) === selectedStatus;
      const matchesPlaycard = !playcardFilter || (() => {
        let val = employee.days[safeIdx];
        if (days[safeIdx].isMonday) val = 'W';
        return val === playcardFilter;
      })();
      return matchesSearch && matchesStatus && matchesPlaycard;
    });
  }, [searchQuery, selectedStatus, playcardFilter, safeIdx]);

  // Calculate summary counts for selected date
  const summary = { P: 0, AB: 0, H: 0, W: 0 };
  filteredData.forEach(emp => {
    let val = emp.days[safeIdx];
    if (days[safeIdx].isMonday) val = 'W';
    if (val === 'P') summary.P++;
    else if (val === 'AB') summary.AB++;
    else if (val === 'H') summary.H++;
    else if (val === 'W' || val === '') summary.W++;
  });

  // Render cell: if Monday, always show W
  const renderCell = (status, i) => {
    if (days[i].isMonday) {
      return <span className={`inline-flex w-6 h-6 rounded bg-gray-100 text-gray-400 font-medium items-center justify-center text-[10px] shadow-sm border border-gray-100`}>W</span>;
    }
    if (days[i].isSunday) {
      if (status === 'P') {
        return <span className={`inline-flex w-6 h-6 rounded bg-green-50 text-green-600 font-medium items-center justify-center text-[10px] shadow-sm border border-green-100`}>{status}</span>;
      }
      return <span className={`inline-flex w-6 h-6 rounded bg-red-50 text-red-500 font-medium items-center justify-center text-[10px] shadow-sm border border-red-100`}>{status}</span>;
    }
    return <span className={`inline-flex w-6 h-6 rounded ${statusStyles[status] || statusStyles['']} items-center justify-center text-[10px] shadow-sm border border-gray-100`}>{status}</span>;
  };

  return (
    <div className="min-h-screen w-full py-6 px-2 md:px-6" style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      fontFamily: 'Inter, sans-serif',
    }}>
      <div className="max-w-[1600px] mx-auto">
        {/* Heading at the very top */}
        <h1 className="text-lg md:text-xl font-medium text-gray-900 mb-2 tracking-tight">Employee Attendance</h1>
        {/* Attendance Tracker Container */}
        <div className="rounded-lg shadow-sm p-4 bg-white/80 border border-gray-100 overflow-x-auto">
          <div className="min-w-[1200px]">
            {/* Tabs as modern tabs (not capsule) */}
            <div className="flex border-b border-gray-200 mb-4">
            <button
                className={`px-5 py-2 font-medium text-xs border-b-2 transition-all duration-200 focus:outline-none ${activeTab === 'attendance' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-500 bg-transparent hover:text-blue-500'}`}
              onClick={() => setActiveTab('attendance')}
                style={{ marginRight: '-1px' }}
            >
              Attendance Tracker
            </button>
            <button
                className={`px-5 py-2 font-medium text-xs border-b-2 transition-all duration-200 focus:outline-none ${activeTab === 'leave' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-gray-500 bg-transparent hover:text-blue-500'}`}
              onClick={() => setActiveTab('leave')}
            >
              Leave Tracker
            </button>
          </div>
            {/* Modern summary bar for today's attendance or coming soon for leave */}
            {activeTab === 'attendance' && (
              <div className="w-full rounded-2xl border border-gray-100 bg-white shadow-md px-6 py-5 mb-8 flex flex-col gap-4">
                <div className="flex flex-row items-center justify-between mb-3 gap-2">
                  <div className="text-sm md:text-base font-medium text-gray-700 whitespace-nowrap">Attendance Summary <span className="text-xs text-gray-400 ml-1">({getDisplayDate(selectedDateObj)})</span></div>
                  <div className="ml-auto">
                    <DatePicker
                      selected={selectedDate}
                      onChange={date => { setSelectedDate(date); setPlaycardFilter(null); }}
                      dateFormat="yyyy-MM-dd"
                      maxDate={new Date()}
                      minDate={new Date('2025-03-01')}
                      customInput={
                        <button
                          className="flex items-center gap-1 px-3 py-1 rounded-lg border border-gray-200 bg-white shadow-sm text-xs text-gray-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                          style={{ minWidth: 0 }}
                          type="button"
                        >
                          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs md:text-sm font-medium text-gray-700">{getDisplayDate(selectedDateObj)}</span>
                        </button>
                      }
                      calendarClassName="!rounded-xl !shadow-lg !border !border-gray-200 !bg-white"
                      dayClassName={date => 'text-xs'}
                    />
                  </div>
                </div>
                <div className="flex flex-row gap-6 justify-center items-center">
                  <div
                    className="flex flex-col items-center justify-center rounded-lg min-w-[110px] py-3 px-3 bg-green-50 border border-green-100 text-green-700 text-xs md:text-sm font-normal shadow-sm transition-all duration-150"
                  >
                    <span className="text-lg md:text-xl font-medium mb-1">{summary.P}</span>
                    <span>Present</span>
                  </div>
                  <div
                    className="flex flex-col items-center justify-center rounded-lg min-w-[110px] py-3 px-3 bg-red-50 border border-red-100 text-red-600 text-xs md:text-sm font-normal shadow-sm transition-all duration-150"
                  >
                    <span className="text-lg md:text-xl font-medium mb-1">{summary.AB}</span>
                    <span>Absent</span>
                  </div>
                  <div
                    className="flex flex-col items-center justify-center rounded-lg min-w-[110px] py-3 px-3 bg-yellow-50 border border-yellow-100 text-yellow-700 text-xs md:text-sm font-normal shadow-sm transition-all duration-150"
                  >
                    <span className="text-lg md:text-xl font-medium mb-1">{summary.H}</span>
                    <span>Half Day</span>
                  </div>
                  {/* <div
                    className="flex flex-col items-center justify-center rounded-lg min-w-[110px] py-3 px-3 bg-gray-50 border border-gray-100 text-gray-500 text-xs md:text-sm font-normal shadow-sm transition-all duration-150"
                  >
                    <span className="text-lg md:text-xl font-medium mb-1">{summary.W}</span>
                    <span>Week Off</span>
                  </div> */}
                </div>
              </div>
            )}
            {activeTab === 'leave' && (
              <div className="flex flex-col items-center justify-center min-h-[220px] w-full bg-white/80 rounded-2xl border border-gray-100 shadow-md my-8">
                <span className="text-2xl font-medium text-blue-500 mb-2">🚧</span>
                <span className="text-lg font-medium text-gray-700 mb-1">Feature coming soon</span>
                <span className="text-xs text-gray-400">Leave Tracker will be available in a future update.</span>
              </div>
            )}
              {/* Filters and Search */}
            {activeTab === 'attendance' && (
              <div className="flex flex-wrap gap-3 mb-4 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Filter by:</span>
                  <CustomDropdown value={selectedStatus} onChange={setSelectedStatus} options={statusOptions} />
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search by name, ID or department..."
                      className="w-full rounded-lg border border-gray-200 pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-200 bg-white/80 shadow-sm text-gray-600 placeholder-gray-400 transition text-xs"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Month selector and legend row just above table */}
            {activeTab === 'attendance' && (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                {/* Legends center */}
                <div className="flex flex-wrap gap-3 items-center justify-center w-full">
                {legend.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs">
                    <span className={`inline-flex w-5 h-5 rounded ${item.style} items-center justify-center border border-gray-100`}> 
                        {item.label.startsWith('W') ? 'W' : item.label.charAt(0)}
                    </span>
                    <span className="text-gray-600">{item.label}</span>
                  </div>
                ))}
              </div>
                {/* Month selector right */}
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <CustomDropdown value={selectedMonth} onChange={setSelectedMonth} options={months} />
                </div>
              </div>
            )}
              {/* Table */}
            {activeTab === 'attendance' && (
              <div className="rounded-lg border border-gray-100 bg-white/80 overflow-x-auto">
                <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="w-full min-w-[1400px] table-fixed text-[11px]">
                    <colgroup>
                      <col style={{ width: '120px' }} />
                      <col style={{ width: '120px' }} />
                      {days.map(() => <col style={{ width: '32px' }} />)}
                    </colgroup>
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 h-7 py-0" style={{ position: 'sticky', top: 0, zIndex: 2, background: '#F9FAFB' }}>
                        <th className="h-7 py-0" style={{ background: '#F9FAFB' }}></th><th className="h-7 py-0" style={{ background: '#F9FAFB' }}></th>
                        {days.map((d, i) => (
                          <th
                            key={d.date}
                            className={`h-7 py-0 px-0.5 font-medium text-center cursor-pointer ${i === safeIdx ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-400' : ''}`}
                            style={{ background: '#F9FAFB' }}
                            onClick={() => {
                              const newDate = new Date(selectedDate);
                              newDate.setDate(i + 1);
                              setSelectedDate(newDate);
                            }}
                          >
                            {d.date}
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-gray-50 text-gray-600 h-7 py-0 border-b border-gray-200" style={{ position: 'sticky', top: 28, zIndex: 1, background: '#F9FAFB' }}>
                        <th className="h-7 py-0 px-3 font-medium text-left" style={{ background: '#F9FAFB' }}>Name</th>
                        <th className="h-7 py-0 px-3 font-medium text-left" style={{ background: '#F9FAFB' }}>Dept</th>
                        {days.map((d, i) => (
                          <th
                            key={d.date}
                            className={`h-7 py-0 px-0.5 font-medium text-center cursor-pointer ${i === safeIdx ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-400' : ''}`}
                            style={{ background: '#F9FAFB' }}
                            onClick={() => {
                              const newDate = new Date(selectedDate);
                              newDate.setDate(i + 1);
                              setSelectedDate(newDate);
                            }}
                          >
                            <span className={d.abbr === 'S' ? 'text-red-500' : ''}>{d.abbr}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, idx) => (
                        <tr key={row.empId} className="border-t border-gray-100 hover:bg-gray-50/50">
                          <td className="px-3 py-2 whitespace-nowrap text-gray-600">{row.name}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-gray-600">{row.dept}</td>
                          {row.days.map((status, i) => (
                            <td key={i} className="px-0.5 py-1 text-center">{renderCell(status, i)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendance; 