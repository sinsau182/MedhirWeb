import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Calendar,
  UserCog,
  DollarSign,
  Wallet,
  Eye,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import PropTypes from "prop-types";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import Leaves from "@/pages/employee/leaves";

// --- Simple Modal Component --- (Can be replaced with shadcn Dialog if available)
const ChangesModal = ({ isOpen, onClose, changes }) => {
  if (!isOpen || !changes || changes.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Field Changes</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {changes.map((change, index) => (
            <div key={index} className="border rounded p-3 bg-gray-50 text-sm">
              <p className="font-medium text-gray-700 mb-1">{change.fieldName}</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500">Old Value:</p>
                  <p className="text-gray-800 break-words">{change.oldValue || "(empty)"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">New Value:</p>
                  <p className="text-green-700 break-words">{change.newValue || "(empty)"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 text-right">
          <Button onClick={onClose} variant="outline" size="sm">Close</Button>
        </div>
      </div>
    </div>
  );
};
ChangesModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    changes: PropTypes.arrayOf(PropTypes.shape({
        fieldName: PropTypes.string,
        oldValue: PropTypes.string,
        newValue: PropTypes.string
    }))
};
// --- End Modal Component ---

const RequestDetails = ({ activeTab, onTabChange }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUpdateChanges, setSelectedUpdateChanges] = useState([]);

  // --- State for fetched data and loading status ---
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [isLoadingLeave, setIsLoadingLeave] = useState(false);

  const [profileUpdates, setProfileUpdates] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [approvingProfileUpdateId, setApprovingProfileUpdateId] = useState(null);

  const [expenseRequests, setExpenseRequests] = useState([]);
  const [isLoadingExpense, setIsLoadingExpense] = useState(false);

  const [advanceRequests, setAdvanceRequests] = useState([]);
  const [isLoadingAdvance, setIsLoadingAdvance] = useState(false);

  const [compOffRequests, setCompOffRequests] = useState([]);
  const [isLoadingCompOff, setIsLoadingCompOff] = useState(false);

  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [pendingCompOffs, setPendingCompOffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Base URL for API (adjust as needed) ---
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ''; // Ensure this is set

  // --- Generic Fetch Function ---
  // const fetchData = async (endpoint, setData, setIsLoading) => {
  //   setIsLoading(true);
  //   console.log(`Fetching data from: ${API_BASE_URL}${endpoint}`);
  //   try {
  //     // Add headers for authentication if needed, e.g., Authorization: Bearer token
  //     const headers = {
  //         'Content-Type': 'application/json',
  //         // Add other headers like Authorization if required by your API
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //     };
  //     const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
  //     }
  //     const data = await response.json();
  //     console.log(`Data received for ${endpoint}:`, data);
  //     setData(data || []); // Set empty array if data is null/undefined
  //   } catch (error) {
  //     console.error(`Error fetching ${endpoint}:`, error);
  //     // toast({ title: "Error", description: `Failed to fetch ${endpoint}.`, variant: "destructive" }); // Re-enable if useToast is kept
  //     setData([]); // Clear data on error
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // --- useEffect hooks for fetching data based on activeTab ---
  // useEffect(() => {
  //   if (activeTab === 'leaveRequests') {
  //     fetchData('/api/leave-requests', setLeaveRequests, setIsLoadingLeave);
  //   }
  // }, [activeTab]);

  // useEffect(() => {
  //   if (activeTab === 'expenseRequests') {
  //     fetchData('/api/expense-requests', setExpenseRequests, setIsLoadingExpense);
  //   }
  // }, [activeTab]);

  // useEffect(() => {
  //   if (activeTab === 'advanceRequests') {
  //     fetchData('/api/advance-requests', setAdvanceRequests, setIsLoadingAdvance);
  //   }
  // }, [activeTab]);

  // useEffect(() => {
  //   if (activeTab === 'compOffRequests') {
  //     fetchData('/api/comp-off-requests', setCompOffRequests, setIsLoadingCompOff);
  //   }
  // }, [activeTab]);

  const fetchProfileUpdates = async () => {
      setIsLoadingProfile(true);
      try {
          const headers = {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
          };
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hradmin/update-requests`, { headers });
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
          }
          const data = await response.json();
          const updatesWithChanges = Array.isArray(data)
              ? data.filter(update => update.changes && update.changes.length > 0)
              : [];
          setProfileUpdates(updatesWithChanges);
      } catch (error) {
          console.error(`Error fetching profile updates:`, error);
          toast({ title: "Error", description: `Failed to fetch profile updates: ${error.message}`, variant: "destructive" });
          setProfileUpdates([]);
      } finally {
          setIsLoadingProfile(false);
      }
  };

const fetchPendingRequests = async () => {
  try {
    const token = localStorage.getItem('token');
    setLoading(true);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/leave/status/Pending`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('API Response:', response.data);

    if (response.data && Array.isArray(response.data.leaves)) {
      const regularLeaves = response.data.leaves.filter(leave => leave.leaveName !== "Comp-Off");
      const compOffLeaves = response.data.leaves.filter(leave => leave.leaveName === "Comp-Off");
      
      setPendingLeaves(regularLeaves);
      setPendingCompOffs(compOffLeaves);
    } else {
      setPendingLeaves([]);
      setPendingCompOffs([]);
    }
  } catch (error) {
    console.error('Error details:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    setError(error.response?.data?.message || error.message);
    setPendingLeaves([]);
    setPendingCompOffs([]);
  } finally {
    setLoading(false);
  }
};





  useEffect(() => {
    fetchPendingRequests();
    fetchProfileUpdates();
  }, []);

  if (loading) {
    return <div className="text-center py-4">Loading pending requests...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }



  // Function to open the modal
  const handleViewDetails = (changes) => {
      if (changes && changes.length > 0) {
          setSelectedUpdateChanges(changes);
          setIsModalOpen(true);
      } else {
          toast({ title: "No details", description: "No specific field changes available for this request." });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // Parse the MongoDB date format and convert to local date
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid Date';
    }
  };

  // Updated combined loading state
  const isLoading = isLoadingLeave || isLoadingProfile || isLoadingExpense || isLoadingAdvance || isLoadingCompOff;

  // --- Approve/Reject Logic for Profile Updates ---
  const handleApproveProfileUpdate = async (employeeId) => {
    if (!employeeId) {
        toast({ title: "Error", description: "Employee ID missing.", variant: "destructive" });
        return;
    }
    setApprovingProfileUpdateId(employeeId); // Set loading state for this specific ID
    console.log(`Approving profile update for employee: ${employeeId}`);
    try {
        const headers = {
            // Content-Type is set automatically by browser for FormData
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        };

        // Create FormData as per the screenshot
        const formData = new FormData();
        formData.append('status', 'Approved');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hradmin/update-requests/${employeeId}`, {
            method: 'PUT',
            headers: headers,
            body: formData
        });

        let resultText = await response.text(); // Read response as text first
        console.log(`Approval response for ${employeeId}:`, response.status, resultText);

        if (!response.ok) {
             // Try to parse error message if JSON, otherwise use text
             let errorMessage = resultText;
             try {
                 const errorJson = JSON.parse(resultText);
                 errorMessage = errorJson.message || resultText;
             } catch (e) { /* Ignore if not JSON */ }
            throw new Error(errorMessage || `HTTP error! status: ${response.status}`);
        }

        toast({ title: "Success", description: `Profile update for ${employeeId} approved.` });
        // Re-fetch the list to remove the approved item
        fetchProfileUpdates();

    } catch (error) {
        console.error(`Error approving profile update for ${employeeId}:`, error);
        toast({ title: "Approval Failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
        setApprovingProfileUpdateId(null); // Clear loading state
    }
  };

  // Placeholder for reject functionality if needed later
  const handleRejectProfileUpdate = async (employeeId) => {
      console.log(`Rejecting profile update for ${employeeId}`);
      toast({ title: "Action Disabled", description: "Reject functionality not implemented yet.", variant: "destructive" });
      // Similar fetch logic with PUT/PATCH and status: 'Rejected' would go here
  };

  const handleApprove = async (leaveId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Approving leave request:', { leaveId });
  
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/leave/update-status`, {
        leaveId: leaveId,
        status: "Approved",
        remarks: "approved successfully"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      console.log('Approve response:', response.data);
  
      toast({
        title: "Success",
        description: "Request approved successfully"
      });
      
      // Refresh the list after successful approval
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error.response?.data || error.message);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to approve request',
        variant: "destructive"
      });
    }
  };

  const handleReject = async (leaveId) => {
    try {
      const token = localStorage.getItem('token');
      
      console.log('Rejecting leave request:', { leaveId });

      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/leave/update-status`, {
        leaveId: leaveId,
        status: "Rejected",
        remarks: "Request rejected by HR"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Reject response:', response.data);

      toast({
        title: "Success",
        description: "Request rejected successfully"
      });
      
      // Refresh the list after successful rejection
      await fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error.response?.data || error.message);
      
      toast({
        title: "Error",
        description: error.response?.data?.message || 'Failed to reject request',
        variant: "destructive"
      });
    }
  };


  return (
    <div className="bg-[#F7FBFE] p-6 rounded-xl shadow-md transition-all duration-200">
      <h2 className="text-xl font-semibold text-blue-800 mb-5 pl-2">
        Request Details
      </h2>
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="grid grid-cols-5 gap-3 mb-5 bg-transparent p-0">
          <TabsTrigger
            value="leaveRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span>Leave Requests</span>
          </TabsTrigger>
          <TabsTrigger
            value="compOffRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span>Comp Off</span>
          </TabsTrigger>
          <TabsTrigger
            value="profileUpdates"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <UserCog className="h-4 w-4 mr-2" />
            <span>Profile Updates</span>
          </TabsTrigger>
          <TabsTrigger
            value="expenseRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Reimbursement Requests</span>
          </TabsTrigger>
          <TabsTrigger
            value="advanceRequests"
            className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors"
          >
            <Wallet className="h-4 w-4 mr-2" />
            <span>Advance Requests</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaveRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Type of Leave
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Start Date
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    End Date
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Leave Balance
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Reason
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                  <tr><td colSpan="9" className="text-center py-5">Loading...</td></tr>
                ) : !pendingLeaves || pendingLeaves.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-5 text-gray-500">No pending leave requests.</td></tr>
                ) : (
                  pendingLeaves.map((request, index) => (
                    <tr 
                      key={`${request.leaveId}-${request.employeeId}-${index}`} 
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {request.employeeId}
                    </td>
                      <td className="px-5 py-4 text-sm">
                        {request.employeeName}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.department}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.leaveType}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {formatDate(request.startDate)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {formatDate(request.endDate)}
                      </td>
                      <td className="px-5 py-4 text-sm">
                        {request.shiftType}
                      </td>
                    <td className="px-5 py-4 text-sm">
                        {request.reason}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleApprove(request.leaveId)}
                          title={request.remarks || 'Approve request'}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleReject(request.leaveId)}
                          title="Reject request"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="compOffRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Date
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Shift Type
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Description
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">Loading...</td></tr>
                ) : !pendingCompOffs || pendingCompOffs.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-gray-500">No pending comp-off requests.</td></tr>
                ) : (
                  pendingCompOffs.map((request, index) => (
                    <tr 
                      key={`${request.leaveId}-${request.employeeId}-${index}`} 
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {request.employeeId}
                    </td>
                      <td className="px-5 py-4 text-sm">{request.employeeName}</td>
                    <td className="px-5 py-4 text-sm">{request.department}</td>
                      <td className="px-5 py-4 text-sm">{formatDate(request.startDate)}</td>
                    <td className="px-5 py-4 text-sm">{request.shiftType}</td>
                      <td className="px-5 py-4 text-sm">{request.reason}</td>
                    <td className="px-5 py-4 text-sm font-medium space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleApprove(request.leaveId)}
                          title={request.remarks || 'Approve request'}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                          onClick={() => handleReject(request.leaveId)}
                          title="Reject request"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="profileUpdates">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Employee ID</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Employee Name</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Updates</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingProfile ? (
                  <tr><td colSpan="4" className="text-center py-5">Loading...</td></tr>
                ) : profileUpdates.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-5 text-gray-500">No pending profile update requests.</td></tr>
                ) : (
                  profileUpdates.map((update) => {
                    const isApproving = approvingProfileUpdateId === update.employeeId;
                    return (
                      <tr key={update.id || update.employeeId} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-900">{update.employeeId}</td>
                        <td className="px-5 py-4 text-sm">{update.employeeName}</td>
                        <td className="px-5 py-4 text-sm">
                          {update.changes && update.changes.length > 0 ? (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-blue-600 hover:underline"
                              onClick={() => handleViewDetails(update.changes)}
                              disabled={isApproving}
                            >
                              {`${update.changes.length} field(s) changed`}
                            </Button>
                          ) : (
                            <span className="text-gray-500 italic">No specific changes listed</span>
                          )}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                            className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleApproveProfileUpdate(update.employeeId)}
                            disabled={isApproving || !!approvingProfileUpdateId}
                           >
                            {isApproving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                            className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleRejectProfileUpdate(update.employeeId)}
                            disabled={isApproving || !!approvingProfileUpdateId}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="expenseRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Amount
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Description
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Receipt
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingExpense ? (
                  <tr><td colSpan="7" className="text-center py-5">Loading...</td></tr>
                ) : expenseRequests.length === 0 ? (
                   <tr><td colSpan="7" className="text-center py-5 text-gray-500">No pending expense requests.</td></tr>
                ) : (
                   expenseRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {request.employeeId}
                    </td>
                    <td className="px-5 py-4 text-sm">{request.name}</td>
                    <td className="px-5 py-4 text-sm">{request.department}</td>
                    <td className="px-5 py-4 text-sm">{request.amount}</td>
                    <td className="px-5 py-4 text-sm">{request.description}</td>
                    <td className="px-5 py-4 text-sm">
                      {request.hasReceipt && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-full h-8 px-3 inline-flex items-center justify-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                            disabled
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                            disabled
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                   ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="advanceRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee ID
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Employee Name
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Department
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Amount
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Reason
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Repayment Plan
                  </th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoadingAdvance ? (
                  <tr><td colSpan="7" className="text-center py-5">Loading...</td></tr>
                ) : advanceRequests.length === 0 ? (
                   <tr><td colSpan="7" className="text-center py-5 text-gray-500">No pending advance requests.</td></tr>
                ) : (
                   advanceRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {request.employeeId}
                    </td>
                    <td className="px-5 py-4 text-sm">{request.name}</td>
                    <td className="px-5 py-4 text-sm">{request.department}</td>
                    <td className="px-5 py-4 text-sm">{request.amount}</td>
                    <td className="px-5 py-4 text-sm">{request.reason}</td>
                    <td className="px-5 py-4 text-sm">
                      {request.repaymentPlan}
                    </td>
                    <td className="px-5 py-4 text-sm font-medium space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                            disabled
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                            disabled
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                   ))
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal for showing changes */}
      <ChangesModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          changes={selectedUpdateChanges}
      />
    </div>
  );
};

RequestDetails.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default RequestDetails;