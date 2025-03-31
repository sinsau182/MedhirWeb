import {
  Employee,
  LeaveRequest,
  ProfileUpdate,
  ExpenseRequest,
  AdvanceRequest,
} from "../schema.js";

const RequestsCount = {
  leave: 0,
  profile: 0,
  expense: 0,
  advance: 0,
  total: 0,
};

const createLeaveRequestWithEmployee = (leaveRequest, employee) => ({
  ...leaveRequest,
  employee,
});

const createProfileUpdateWithEmployee = (profileUpdate, employee) => ({
  ...profileUpdate,
  employee,
});

const createExpenseRequestWithEmployee = (expenseRequest, employee) => ({
  ...expenseRequest,
  employee,
});

const createAdvanceRequestWithEmployee = (advanceRequest, employee) => ({
  ...advanceRequest,
  employee,
});

const RequestTab = [
  "leaveRequests",
  "profileUpdates",
  "expenseRequests",
  "advanceRequests",
];

const RequestStatus = ["pending", "approved", "rejected"];

export {
  RequestsCount,
  createLeaveRequestWithEmployee,
  createProfileUpdateWithEmployee,
  createExpenseRequestWithEmployee,
  createAdvanceRequestWithEmployee,
  RequestTab,
  RequestStatus,
};
