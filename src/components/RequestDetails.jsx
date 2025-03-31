import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, UserCog, DollarSign, Wallet, Eye } from "lucide-react";
import { RequestTab } from "@/lib/types";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

import PropTypes from "prop-types";

const RequestDetails = ({ activeTab, onTabChange }) => {
  const { toast } = useToast();

  // Fetch leave requests
  const { data: leaveRequests = [], isLoading: isLoadingLeave } = useQuery({
    queryKey: ["/api/leave-requests"],
    enabled: activeTab === "leaveRequests",
  });

  // Fetch profile updates
  const { data: profileUpdates = [], isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/profile-updates"],
    enabled: activeTab === "profileUpdates",
  });

  // Fetch expense requests
  const { data: expenseRequests = [], isLoading: isLoadingExpense } = useQuery({
    queryKey: ["/api/expense-requests"],
    enabled: activeTab === "expenseRequests",
  });

  // Fetch advance requests
  const { data: advanceRequests = [], isLoading: isLoadingAdvance } = useQuery({
    queryKey: ["/api/advance-requests"],
    enabled: activeTab === "advanceRequests",
  });

  // Update leave request status
  const updateLeaveStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiRequest("PATCH", `/api/leave-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leave-requests"] });
      queryClient.invalidateQueries({ queryKey: ["/api/requests/counts"] });
      toast({
        title: "Status updated",
        description: "The leave request has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "There was an error updating the leave request.",
        variant: "destructive",
      });
    },
  });

  // Update profile update status
  const updateProfileStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiRequest('PATCH', `/api/profile-updates/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile-updates'] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/counts'] });
      toast({
        title: "Status updated",
        description: "The profile update has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating the profile update.",
        variant: "destructive",
      });
    },
  });

  // Update expense request status
  const updateExpenseStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiRequest('PATCH', `/api/expense-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/counts'] });
      toast({
        title: "Status updated",
        description: "The expense request has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating the expense request.",
        variant: "destructive",
      });
    },
  });

  // Update advance request status
  const updateAdvanceStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      return apiRequest('PATCH', `/api/advance-requests/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/advance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/requests/counts'] });
      toast({
        title: "Status updated",
        description: "The advance request has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "There was an error updating the advance request.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (type, id) => {
    switch (type) {
      case "leaveRequests":
        updateLeaveStatus.mutate({ id, status: "approved" });
        break;
      case "profileUpdates":
        updateProfileStatus.mutate({ id, status: "approved" });
        break;
      case "expenseRequests":
        updateExpenseStatus.mutate({ id, status: "approved" });
        break;
      case "advanceRequests":
        updateAdvanceStatus.mutate({ id, status: "approved" });
        break;
    }
  };

  const handleReject = (type, id) => {
    switch (type) {
      case "leaveRequests":
        updateLeaveStatus.mutate({ id, status: "rejected" });
        break;
      case "profileUpdates":
        updateProfileStatus.mutate({ id, status: "rejected" });
        break;
      case "expenseRequests":
        updateExpenseStatus.mutate({ id, status: "rejected" });
        break;
      case "advanceRequests":
        updateAdvanceStatus.mutate({ id, status: "rejected" });
        break;
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  const isLoading = 
    (activeTab === "leaveRequests" && isLoadingLeave) ||
    (activeTab === "profileUpdates" && isLoadingProfile) ||
    (activeTab === "expenseRequests" && isLoadingExpense) ||
    (activeTab === "advanceRequests" && isLoadingAdvance);

  // Hardcoded leave request data
  const hardcodedLeaveRequests = [
    {
      id: 1,
      employeeId: "EMP101",
      name: "John Doe",
      department: "Sales",
      typeOfLeave: "Annual Leave",
      startDate: "Jun 15, 2023",
      endDate: "Jun 18, 2023",
      leaveBalance: "15 days",
      reason: "Family vacation"
    },
    {
      id: 2,
      employeeId: "EMP102",
      name: "Jane Smith",
      department: "Marketing",
      typeOfLeave: "Sick Leave",
      startDate: "Jun 20, 2023",
      endDate: "Jun 21, 2023",
      leaveBalance: "8 days",
      reason: "Medical appointment"
    },
    {
      id: 3,
      employeeId: "EMP103",
      name: "Michael Brown",
      department: "Engineering",
      typeOfLeave: "Emergency Leave",
      startDate: "Jun 25, 2023",
      endDate: "Jun 30, 2023",
      leaveBalance: "5 days",
      reason: "Personal emergency"
    }
  ];

  // Hardcoded profile update data
  const hardcodedProfileUpdates = [
    {
      id: 1,
      employeeId: "EMP104",
      name: "David Wilson",
      department: "IT",
      updateType: "Phone Number",
      hasDetails: false,
      reason: "Personal information update"
    },
    {
      id: 2,
      employeeId: "EMP105",
      name: "Lisa Johnson",
      department: "HR",
      updateType: "3 fields updated",
      hasDetails: true,
      details: [
        {
          field: "Address",
          oldValue: "123 Old Street, City",
          newValue: "456 New Avenue, Town"
        },
        {
          field: "Emergency Contact",
          oldValue: "Mary Johnson - 9876543210",
          newValue: "John Johnson - 8765432109"
        },
        {
          field: "Phone Number",
          oldValue: "9876543210",
          newValue: "8765432109"
        }
      ],
      reason: "Moved to new location and changed contact information"
    },
    {
      id: 3,
      employeeId: "EMP106",
      name: "Robert Chen",
      department: "Finance",
      updateType: "2 fields updated",
      hasDetails: false,
      reason: "Updated personal details after marriage"
    }
  ];
  
  // Hardcoded expense request data
  const hardcodedExpenseRequests = [
    {
      id: 1,
      employeeId: "EMP107",
      name: "Robert Johnson",
      department: "Sales",
      amount: "₹5000",
      description: "Client meeting expenses",
      hasReceipt: true
    },
    {
      id: 2,
      employeeId: "EMP108",
      name: "Sarah Williams",
      department: "Marketing",
      amount: "₹7500",
      description: "Marketing event costs",
      hasReceipt: true
    }
  ];
  
  // Hardcoded advance request data
  const hardcodedAdvanceRequests = [
    {
      id: 1,
      employeeId: "EMP109",
      name: "David Wilson",
      department: "IT",
      amount: "₹15000",
      reason: "Home emergency repairs",
      repaymentPlan: "6 months EMI"
    },
    {
      id: 2,
      employeeId: "EMP110",
      name: "Emily Davis",
      department: "HR",
      amount: "₹10000",
      reason: "Education fees",
      repaymentPlan: "12 months EMI"
    }
  ];

  return (
    <div className="bg-[#F7FBFE] p-6 rounded-xl shadow-md transition-all duration-200">
      <h2 className="text-xl font-semibold text-blue-800 mb-5 pl-2">Request Details</h2>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value)}>
        <TabsList className="grid grid-cols-4 gap-3 mb-5 bg-transparent p-0">
          <TabsTrigger value="leaveRequests" className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Leave Requests</span>
          </TabsTrigger>
          <TabsTrigger value="profileUpdates" className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
            <UserCog className="h-4 w-4 mr-2" />
            <span>Profile Updates</span>
          </TabsTrigger>
          <TabsTrigger value="expenseRequests" className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
            <DollarSign className="h-4 w-4 mr-2" />
            <span>Expense Requests</span>
          </TabsTrigger>
          <TabsTrigger value="advanceRequests" className="flex items-center justify-center py-3 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors">
            <Wallet className="h-4 w-4 mr-2" />
            <span>Advance Requests</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="leaveRequests">
          <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-[#F0F4FB] text-gray-700">
                <tr>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Employee ID</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Employee Name</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Department</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Type of Leave</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Start Date</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">End Date</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Leave Balance</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Reason</th>
                  <th className="py-4 px-5 text-left text-sm font-medium border-b border-gray-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hardcodedLeaveRequests.map(request => (
                  <tr key={request.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{request.employeeId}</td>
                    <td className="px-5 py-4 text-sm">{request.name}</td>
                    <td className="px-5 py-4 text-sm">{request.department}</td>
                    <td className="px-5 py-4 text-sm">{request.typeOfLeave}</td>
                    <td className="px-5 py-4 text-sm">{request.startDate}</td>
                    <td className="px-5 py-4 text-sm">{request.endDate}</td>
                    <td className="px-5 py-4 text-sm">{request.leaveBalance}</td>
                    <td className="px-5 py-4 text-sm">{request.reason}</td>
                    <td className="px-5 py-4 text-sm font-medium space-x-3">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white border border-green-500 text-green-500 hover:bg-green-50 hover:text-green-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                        onClick={() => handleApprove("leaveRequests", request.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-white border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors rounded-full h-8 w-8 p-0 inline-flex items-center justify-center"
                        onClick={() => handleReject("leaveRequests", request.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="profileUpdates">
          {/* Render profile updates table */}
        </TabsContent>
        <TabsContent value="expenseRequests">
          {/* Render expense requests table */}
        </TabsContent>
        <TabsContent value="advanceRequests">
          {/* Render advance requests table */}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Move propTypes definition AFTER the component declaration
RequestDetails.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default RequestDetails;