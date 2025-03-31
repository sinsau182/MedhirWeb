import React, { useState } from "react";
import HradminNavbar from "../../components/HradminNavbar";
import Sidebar from "../../components/Sidebar";
import DatePicker from "react-multi-date-picker"; // Import the multi-date picker
import TimePicker from "react-multi-date-picker/plugins/time_picker"; // Import the time picker plugin

const Leaves = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Leave modal state
  const [isCompOffModalOpen, setIsCompOffModalOpen] = useState(false); // Comp-off modal state
  const [selectedDates, setSelectedDates] = useState([]); // Leave dates
  const [compOffDate, setCompOffDate] = useState(null); // Comp-off date
  const [startTime, setStartTime] = useState(""); // Start time for comp-off
  const [endTime, setEndTime] = useState(""); // End time for comp-off
  const [description, setDescription] = useState(""); // Description for comp-off

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openCompOffModal = () => {
    setIsCompOffModalOpen(true); // Sets the state to true, making the modal visible
  };

  const closeCompOffModal = () => {
    setIsCompOffModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Selected Dates:", selectedDates); // Handle selected dates
    closeModal();
  };

  const handleCompOffSubmit = (e) => {
    e.preventDefault();
    console.log("Comp-off Date:", compOffDate);
    console.log("Start Time:", startTime);
    console.log("End Time:", endTime);
    console.log("Description:", description);
    closeCompOffModal();
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div
        className={`flex-1 ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        } transition-all duration-300`}
      >
        {/* Navbar */}
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
                onClick={openCompOffModal} // This function sets isCompOffModalOpen to true
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
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-gray-600">Leaves Earned This Month</p>
                  <p className="text-gray-800 font-medium">2</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Leaves Carried Forward</p>
                  <p className="text-gray-800 font-medium">5</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Comp Off Earned This Month</p>
                  <p className="text-gray-800 font-medium">1</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Comp Off Carried Forward</p>
                  <p className="text-gray-800 font-medium">2</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-600">Leaves Taken This Month</p>
                  <p className="text-red-500 font-medium">-3</p>
                </div>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <p className="text-gray-800 font-semibold">Total Balance</p>
                <p className="text-gray-800 font-semibold">7</p>
              </div>
            </div>

            {/* Leave History */}
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Leave History</h2>
              <div className="divide-y divide-gray-200">
                {/* Casual Leave */}
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 font-medium">Annual Leave</p>
                    <p className="text-sm text-gray-500">
                      May 12 - May 14, 2023
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                      Approved
                    </span>
                    <p className="text-sm text-gray-500 mt-1">3 days</p>
                  </div>
                </div>

                {/* Sick Leave */}
                <div className="py-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-600 font-medium">Comp-Off Leave</p>
                    <p className="text-sm text-gray-500">Apr 3, 2023</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-green-100 text-green-600 text-xs font-semibold px-2 py-1 rounded-full">
                      Approved
                    </span>
                    <p className="text-sm text-gray-500 mt-1">1 day</p>
                  </div>
                </div>
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
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                New Leave Application
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Leave Type
                </label>
                <p className="text-gray-800 font-medium">Leave</p> {/* Static text */}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Dates
                </label>
                <DatePicker
                  multiple
                  value={selectedDates}
                  onChange={setSelectedDates}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Reason
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                  rows="3"
                  placeholder="Please provide a reason for your leave"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comp-off Modal */}
      {isCompOffModalOpen && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md border border-gray-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Apply for Comp-off
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeCompOffModal} // Closes the modal
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCompOffSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Select Date
                </label>
                <DatePicker
                  value={compOffDate}
                  onChange={setCompOffDate}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <DatePicker
                  value={startTime}
                  onChange={setStartTime}
                  format="HH:mm"
                  plugins={[<TimePicker position="bottom" />]}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <DatePicker
                  value={endTime}
                  onChange={setEndTime}
                  format="HH:mm"
                  plugins={[<TimePicker position="bottom" />]}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-md shadow-sm focus:ring-0 focus:border-gray-400 text-sm"
                  rows="3"
                  placeholder="Provide details about the work done"
                ></textarea>
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 text-sm"
                  onClick={closeCompOffModal} // Closes the modal
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
