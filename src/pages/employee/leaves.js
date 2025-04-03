import React, { useState, useEffect } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import { Calendar, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLeaves, createLeave } from "@/redux/slices/leaveSlice";
import CustomDatePicker from '@/components/CustomDatePicker';

const Leaves = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false);
  
  // Simplified form states
  const [leaveForm, setLeaveForm] = useState({
    dates: [],
    reason: ""
  });
  
  const [compOffForm, setCompOffForm] = useState({
    dates: [],
    description: ""
  });

  const dispatch = useDispatch();
  const { leaves, loading, error } = useSelector((state) => state.leaveReducer);

  useEffect(() => {
    // Fetch leaves for employee with ID emp123
    dispatch(fetchLeaves("emp123"));
  }, [dispatch]);

  const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setLeaveForm({ dates: [], reason: "" });
  };
  
  const openCompOffModal = () => setIsCompOffModalOpen(true);
  const closeCompOffModal = () => {
    setIsCompOffModalOpen(false);
    setCompOffForm({ dates: [], description: "" });
  };

  const handleLeaveFormChange = (e) => {
    const { name, value } = e.target;
    setLeaveForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLeaveDatesChange = (dates) => {
    setLeaveForm(prev => ({ ...prev, dates }));
  };

  const handleCompOffDatesChange = (dates) => {
    setCompOffForm(prev => ({ ...prev, dates }));
  };

  const handleCompOffFormChange = (e) => {
    const { name, value } = e.target;
    setCompOffForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format dates to YYYY-MM-DD format
      const formatDate = (date) => {
        return new Date(date).toISOString().split('T')[0];
      };

      const leaveData = {
        employeeId: "emp123",
        employeeName: "Arun",
        department: "Engineering",
        leaveType: "Casual Leave",
        startDate: formatDate(leaveForm.dates[0].date),
        endDate: formatDate(leaveForm.dates[leaveForm.dates.length - 1].date),
        reason: leaveForm.reason,
        status: "Pending"
      };
      
      await dispatch(createLeave(leaveData)).unwrap();
      closeModal();
      // Refresh the page to show updated leave history
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit leave request:", error);
    }
  };

  const handleCompOffSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format dates to YYYY-MM-DD format
      const formatDate = (date) => {
        return new Date(date).toISOString().split('T')[0];
      };

      const leaveData = {
        employeeId: "emp123",
        employeeName: "Arun",
        department: "Sales",
        leaveType: "Comp Off",
        startDate: formatDate(compOffForm.dates[0].date),
        endDate: formatDate(compOffForm.dates[0].date),
        shiftType: "First Half (Morning)", // Default shift type
        reason: compOffForm.description
      };
      
      await dispatch(createLeave(leaveData)).unwrap();
      closeCompOffModal();
      // Refresh the page to show updated leave history
      window.location.reload();
    } catch (error) {
      console.error("Failed to submit comp-off request:", error);
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
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-gray-600">Leave carried from previous year</p>
                  <p className="text-gray-800 font-medium">5</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Leaves earned since January</p>
                  <p className="text-gray-800 font-medium">12</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Comp-off carried forward</p>
                  <p className="text-gray-800 font-medium">2</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Comp-off earned this month</p>
                  <p className="text-gray-800 font-medium">1</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Leaves taken in this year</p>
                  <p className="text-red-500 font-medium">-8</p>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <p className="text-gray-800 font-semibold">Total Balance</p>
                <p className="text-gray-800 font-semibold">12</p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                * Total = Previous year leaves + Earned leaves + Comp-off (carried & earned) - Taken leaves
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Leave History</h2>
              <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="py-4 text-center text-gray-500">Loading leave history...</div>
                ) : error ? (
                  <div className="py-4 text-center text-red-500">Error loading leave history: {error}</div>
                ) : leaves && leaves.length > 0 ? (
                  leaves.map((leave) => {
                    const formattedStartDate = new Date(
                      leave.startDate
                    ).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    });
                    const formattedEndDate = leave.endDate
                      ? new Date(leave.endDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "";

                    return (
                      <div key={leave.id || leave._id} className="py-4 flex justify-between">
                        <div>
                          <p className="text-gray-600 font-medium mb-2">{leave.leaveType}</p>
                          <p className="text-sm text-gray-500">
                            {leave.leaveType === "Comp Off"
                              ? `${formattedStartDate} (${leave.shiftType || 'First Half (Morning)'})`
                              : `${formattedStartDate} - ${formattedEndDate}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                            leave.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : leave.status === "Approved"
                              ? "bg-green-100 text-green-600"
                              : "bg-red-100 text-red-600"
                          }`}>
                            {leave.status}
                          </span>
                          <p className="text-sm text-gray-500 mt-2 mr-1">
                            {leave.leaveType === "Comp Off" ? "1 day" : 
                              `${Math.ceil((new Date(leave.endDate) - new Date(leave.startDate)) / (1000 * 60 * 60 * 24)) + 1} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-4 text-center text-gray-500">No leave history found</div>
                )}
              </div>
            </div>
          </div>

          {/* Leave Policies */}
          <div className="bg-white shadow-md rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Leave Policies</h2>
            <div className="mb-4 bg-gray-50 shadow-md rounded-lg p-3">
              <h3 className="text-md font-semibold text-gray-800">
                Annual Leave Policy
              </h3>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                <li>
                  All employees are entitled to 15 days of annual leave per year
                </li>
                <li>Leave must be applied at least 7 days in advance</li>
                <li>Maximum 5 consecutive days can be taken at once</li>
                <li>
                  Unused leave can be carried forward to the next year (max 5
                  days)
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 shadow-md rounded-lg p-3">
              <h3 className="text-md font-semibold text-gray-800">
                Comp-off Leave Policy
              </h3>
              <ul className="list-disc list-inside text-gray-600 text-sm">
                <li>
                  All employees are entitled to 7 days of sick leave per year
                </li>
                <li>
                  Doctor's certificate required for sick leave of more than 2
                  consecutive days
                </li>
                <li>Unused sick leave cannot be carried forward</li>
              </ul>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <CustomDatePicker
                      selectedDates={leaveForm.dates}
                      onChange={(dates) => {
                        setLeaveForm(prev => ({
                          ...prev,
                          dates: dates.map(d => ({
                            date: d.date instanceof Date ? d.date : new Date(d.date),
                            timeSlot: d.timeSlot
                          }))
                        }));
                      }}
                      maxDays={5}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leave</label>
                    <textarea
                      name="reason"
                      value={leaveForm.reason}
                      onChange={handleLeaveFormChange}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                      placeholder="Please provide a reason for your leave"
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
                            timeSlot: d.timeSlot
                          }))
                        }));
                      }}
                      isCompOff={true}
                      maxDays={1}
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
                      placeholder="Please provide details"
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

export default Leaves;