import React, { useState, useEffect, useRef } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaves, createLeave, applyLeave, fetchLeaveHistory, clearErrors, applyCompOffLeave } from "@/redux/slices/leaveSlice";
import { fetchLeaveBalance, resetLeaveBalanceState } from "@/redux/slices/leaveBalanceSlice";
import { fetchPublicHolidays } from "@/redux/slices/publicHolidaySlice";
import { toast } from "sonner";
import CustomDatePicker from '@/components/CustomDatePicker';
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';
import withAuth from "@/components/withAuth";

const Leaves = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = getItemFromSessionStorage('token');
    setToken(storedToken); 
  }, []);

  const dispatch = useDispatch();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);

  const { leaves, loading, error } = useSelector((state) => state.leave);
  const { leaveHistory, historyLoading, historyError } = useSelector((state) => state.leave);
  const { balance: leaveBalance, loading: isLoadingBalance, error: balanceError } = useSelector((state) => state.leaveBalance);
  const { holidays, loading: holidayLoading, error: holidayError } = useSelector((state) => state.publicHoliday);
  const calendarRef = useRef(null);
  const [showLOPWarning, setShowLOPWarning] = useState(false);
  const [requestedDays, setRequestedDays] = useState(0);

  
  // Simplified form states
  const [leaveForm, setLeaveForm] = useState({
    dates: [],
    reason: "",
    shiftType: "Full Day"
  });
  
  const [compOffForm, setCompOffForm] = useState({
    dates: [],
    description: "",
    shiftType: "Full Day"
  });
  
  // Add debug log to check state structure
  const state = useSelector((state) => {
    return state;
  });
  

  useEffect(() => {
    dispatch(fetchLeaves("EMP001"));
    dispatch(fetchLeaveHistory());
    dispatch(fetchLeaveBalance("EMP001"));
    dispatch(fetchPublicHolidays());

    return () => {
      dispatch(clearErrors());
      dispatch(resetLeaveBalanceState());
    };
  }, [dispatch]);

  // Add click outside handler for calendar
  useEffect(() => {
    const handleClickOutside = (event) => {
      const calendar = document.querySelector('.react-calendar');
      if (calendar && !calendar.contains(event.target) && 
          !event.target.closest('.custom-date-picker-input')) {
        // Find and close the calendar by clicking the close button
        const closeButton = calendar.parentElement.querySelector('button');
        if (closeButton) {
          closeButton.click();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setLeaveForm({ dates: [], reason: "", shiftType: "Full Day" });
  };
  
  const openCompOffModal = () => setIsCompOffModalOpen(true);
  const closeCompOffModal = () => {
    setIsCompOffModalOpen(false);
    setCompOffForm({
      dates: [],
      description: "",
      shiftType: "Full Day"
    });
  };

  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
  };

  const handleShiftTypeChange = (e) => {
    setLeaveForm(prev => ({ ...prev, shiftType: e.target.value }));
  };

  const calculateRequestedDays = (dates) => {
    return dates.reduce((total, date) => {
      // Check for half day types (both First Half and Second Half count as 0.5)
      const dayValue = date.shiftType === 'First Half (Morning)' || 
                      date.shiftType === 'Second Half (Evening)' ? 0.5 : 1;
      return total + dayValue;
    }, 0);
  };

  const handleLeaveDatesChange = (dates) => {
    const totalDays = calculateRequestedDays(dates);
    setRequestedDays(totalDays);
    
    // Check if requested days exceed available balance
    if (leaveBalance && totalDays > leaveBalance.newLeaveBalance) {
      setShowLOPWarning(true);
    } else {
      setShowLOPWarning(false);
    }

    setLeaveForm(prev => ({ ...prev, dates }));
  };

  const handleCompOffDatesChange = (dates) => {
    setCompOffForm(prev => ({ ...prev, dates }));
  };

  const handleCompOffFormChange = (e) => {
    const { name, value } = e.target;
    setCompOffForm(prev => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Format dates to YYYY-MM-DD format
  //     const formatDate = (date) => {
  //       return new Date(date).toISOString().split('T')[0];
  //     };

  //     const leaveData = {
  //       employeeId: "emp123",
  //       employeeName: "Arun",
  //       department: "Engineering",
  //       leaveType: "Casual Leave",
  //       startDate: formatDate(leaveForm.dates[0].date),
  //       endDate: formatDate(leaveForm.dates[leaveForm.dates.length - 1].date),
  //       shiftType: leaveForm.shiftType,
  //       reason: leaveForm.reason,
  //       status: "Pending",
  //       companyId: selectedCompanyId
  //     };
      
  //     await dispatch(createLeave({ ...leaveData, companyId: selectedCompanyId })).unwrap();
  //     closeModal();
  //     // Refresh the page to show updated leave history
  //     window.location.reload();
  //   } catch (error) {
  //     toast.error(error.message || "Failed to create leave");
  //   }
  // };

  const handleCompOffSubmit = async (e) => {
    e.preventDefault();
    
    if (!compOffForm.dates.length || !compOffForm.description) {
      toast.error("Please select a date and provide a description");
      return;
    }

    try {
      const formData = {
        startDate: compOffForm.dates[0].date.toISOString().split('T')[0],
        endDate: compOffForm.dates[0].date.toISOString().split('T')[0],
        shiftType: compOffForm.dates[0]?.timeSlot || compOffForm.dates[0]?.shiftType || 'Full Day',
        reason: compOffForm.description,
      };

      const resultAction = await dispatch(applyCompOffLeave(formData));
      if (applyCompOffLeave.fulfilled.match(resultAction)) {
        toast.success("Comp-off application submitted successfully");
        closeCompOffModal();
        // Refresh both leave history and balance
        dispatch(fetchLeaveHistory());
        dispatch(fetchLeaveBalance("EMP001"));
      } else {
        throw new Error(resultAction.error.message || "Failed to apply for comp-off");
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit comp-off request");
    }
  };

  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    
    const formData = {
      startDate: leaveForm.dates[0]?.date.toISOString().split('T')[0],
      endDate: leaveForm.dates[leaveForm.dates.length - 1]?.date.toISOString().split('T')[0],
      shiftType: leaveForm.dates[0]?.timeSlot || leaveForm.dates[0]?.shiftType || 'Full Day',
      reason: leaveForm.reason,
    };

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (showLOPWarning) {
      const confirmLOP = window.confirm(
        `Warning: You are requesting ${requestedDays} days of leave but only have ${leaveBalance.newLeaveBalance} days available. \n\nExcess days will be marked as Loss of Pay (LOP). \n\nDo you want to continue?`
      );
      if (!confirmLOP) {
        return;
      }
    }

    try {
      const resultAction = await dispatch(applyLeave(formData));
      if (applyLeave.fulfilled.match(resultAction)) {
        toast.success("Leave application submitted successfully");
        closeModal();
        dispatch(fetchLeaveHistory());
        dispatch(fetchLeaveBalance("EMP001"));
      } else {
        throw new Error(resultAction.error.message || "Failed to apply for leave");
      }
    } catch (error) {
      toast.error(error.message || "Failed to apply for leave");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 ${isSidebarCollapsed ? "ml-16" : "ml-64"} transition-all duration-300`}>
        <HradminNavbar />
        
        {/* Main Content Area */}
        <div className="p-5 bg-gray-100 h-full">
          {/* Page Heading */}
          <div className="mb-6 pt-16 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Leave Management
            </h1>
            <div className="flex gap-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={openCompOffModal}
              >
                Apply for Comp-off
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                onClick={openModal}
              >
                Apply for Leave
              </button>
            </div>
          </div>

          {/* Leave Balance and History */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-7">
            {/* Leave Balance */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Leave Balance</h2>
              {isLoadingBalance ? (
                <div className="text-center py-4">Loading leave balance...</div>
              ) : balanceError ? (
                <div className="text-center py-4 text-red-500">{balanceError}</div>
              ) : leaveBalance ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <p className="text-gray-600">Leave carried from previous year</p>
                    <p className="text-gray-800 font-medium">{leaveBalance.annualLeavesCarryForwarded}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Leaves earned since January</p>
                    <p className="text-gray-800 font-medium">{leaveBalance.totalAnnualLeavesEarnedSinceJanuary}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Comp-off carried forward</p>
                    <p className="text-gray-800 font-medium">{leaveBalance.compOffLeavesCarryForwarded}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Comp-off earned this month</p>
                    <p className="text-gray-800 font-medium">{leaveBalance.compOffLeavesEarned}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600">Leaves taken in this year</p>
                    <p className="text-red-500 font-medium">-{leaveBalance.leavesTakenThisYear}</p>
                  </div>
                  <hr className="my-4" />
                  <div className="flex justify-between">
                    <p className="text-gray-800 font-semibold">Total Balance</p>
                    <p className="text-gray-800 font-semibold">{leaveBalance.newLeaveBalance}</p>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    * Total = Previous year leaves + Earned leaves + Comp-off (carried & earned) - Taken leaves
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">No leave balance data available</div>
              )}
            </div>

            {/* Leave History */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Leave History</h2>
              <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                {historyLoading ? (
                  <div className="py-4 text-center text-gray-500">Loading leave history...</div>
                ) : historyError ? (
                  <div className="py-4 text-center text-red-500">
                    {typeof historyError === 'string' ? historyError : 
                     historyError.message || 'Error loading leave history'}
                  </div>
                ) : leaveHistory && leaveHistory.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Request Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Shift Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Reason
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[...leaveHistory].sort((a, b) => new Date(b.startDate) - new Date(a.startDate)).map((leave, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(leave.startDate).toLocaleDateString()}
                              {leave.startDate !== leave.endDate && 
                                ` - ${new Date(leave.endDate).toLocaleDateString()}`}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${leave.leaveName === 'Comp-Off' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                                {leave.leaveName || 'Leave'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                                switch (leave.shiftType) {
                                  case 'FULL_DAY':
                                    return 'Full Day';
                                  case 'FIRST_HALF':
                                    return 'First Half (Morning)';
                                  case 'SECOND_HALF':
                                    return 'Second Half (Evening)';
                                  default:
                                    return leave.shiftType || '-';
                                }
                              })()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                  leave.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                  'bg-yellow-100 text-yellow-800'}`}>
                                {leave.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {leave.reason || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-4 text-center text-gray-500">No leave history found</div>
                )}
              </div>
            </div>
          </div>

          {/* Leave Policies and Public Holidays */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {/* Leave Policies */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Leave Policies</h2>
              <div className="mb-4 bg-gray-50 shadow-md rounded-lg p-3">
                <h3 className="text-md font-semibold text-gray-800">
                  Annual Leave Policy
                </h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  <li>
                    All employees are entitled to 18 days of annual leave per year
                  </li>
                  <li>
                    Unused leave can be carried forward to the next year
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 shadow-md rounded-lg p-3">
                <h3 className="text-md font-semibold text-gray-800">
                  Comp-off Leave Policy
                </h3>
                <ul className="list-disc list-inside text-gray-600 text-sm">
                  <li>
                    When applying for leave, it will first be deducted from available comp-off balance
                  </li>
                  <li>
                    If comp-off balance is exhausted, remaining days will be deducted from annual leave
                  </li>
                  <li>
                    Unused comp-off can be carried forward to the next month
                  </li>
                </ul>
              </div>
            </div>

            {/* Public Holidays */}
            <div className="bg-white shadow-md rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-3">Public Holidays</h2>
              <div className="bg-gray-50 shadow-md rounded-lg p-3">
                {holidayLoading ? (
                  <div className="text-center py-4">Loading holidays...</div>
                ) : holidayError ? (
                  <div className="text-center py-4 text-red-500">{holidayError}</div>
                ) : holidays.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No public holidays found</div>
                ) : (
                  <div className="space-y-3">
                    {holidays.map((holiday) => (
                      <div key={holiday.holidayId} className="border-b border-gray-200 pb-2 last:border-b-0">
                        <div className="flex justify-between items-center">
                          <h3 className="text-md font-semibold text-gray-800">
                            {holiday.holidayName}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {new Date(holiday.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        {holiday.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {holiday.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Improved Leave Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Apply for Leave</h2>
                  <button 
                    onClick={closeModal} 
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitLeave} className="space-y-6">
                  <div>
                    <CustomDatePicker
                      selectedDates={leaveForm.dates}
                      onChange={handleLeaveDatesChange}
                      maxDays={5}
                      shiftType={leaveForm.shiftType}
                      onShiftTypeChange={handleShiftTypeChange}
                    />
                    {showLOPWarning && (
                      <div className="mt-2 text-red-500 text-sm flex items-center">
                        <span className="mr-1">⚠️</span>
                        Warning: {requestedDays - leaveBalance.newLeaveBalance} day(s) will be marked as Loss of Pay (LOP)
                      </div>
                    )}
                    {leaveForm.dates.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        Requested: {requestedDays} day(s) | Available Balance: {leaveBalance?.newLeaveBalance || 0} day(s)
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
                    <textarea
                      name="reason"
                      value={leaveForm.reason}
                      onChange={handleLeaveFormChange}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Please provide a reason for your leave request..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Improved Comp-off Modal */}
          {isCompOffModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all duration-300 scale-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Apply for Comp-off</h2>
                  <button 
                    onClick={closeCompOffModal} 
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors duration-200"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCompOffSubmit} className="space-y-6">
                  <div>
                    <CustomDatePicker
                      selectedDates={compOffForm.dates}
                      onChange={(dates) => {
                        setCompOffForm(prev => ({
                          ...prev,
                          dates: dates.map(d => ({
                            date: d.date instanceof Date ? d.date : new Date(d.date),
                            shiftType: d.shiftType,
                            timeSlot: d.timeSlot
                          }))
                        }));
                      }}
                      isCompOff={true}
                      maxDays={1}
                      shiftType={compOffForm.shiftType}
                      onShiftTypeChange={(e) => {
                        setCompOffForm(prev => ({
                          ...prev,
                          shiftType: e.target.value
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      name="description"
                      value={compOffForm.description}
                      onChange={handleCompOffFormChange}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Please provide details about your comp-off request..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeCompOffModal}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(Leaves);