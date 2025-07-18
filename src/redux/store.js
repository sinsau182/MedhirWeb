import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";
import employeesReducer from "./slices/employeeSlice"; // Import employee slice
import modulesReducer from "./slices/modulesSlice"; // Import module slice
import authReducer from "./slices/authSlice"; // Import auth slice
import expensesReducer from "./slices/expensesSlice"; // Import expense slice
import leaveReducer from "./slices/leaveSlice"; // Manages leave-related state
import leaveTypeReducer from "./slices/leaveTypeSlice";
import leavePolicyReducer from "./slices/leavePolicySlice";
import publicHolidayReducer from "./slices/publicHolidaySlice";
import departmentReducer from "./slices/departmentSlice";
import designationReducer from "./slices/designationSlice";
import sessionStorageReducer from './slices/sessionStorageSlice';
import leaveBalanceReducer from "./slices/leaveBalanceSlice";
import requestDetailsReducer from './slices/requestDetailsSlice';
import payrollSettingsReducer from "./slices/payrollSettingsSlice";
import payslipReducer from "./slices/payslipSlice";
import allEmployeesSlice from "./slices/allEmployeesSlice";
import managerEmployeeSlice from "./slices/managerEmployeeSlice";
import managerDashboardSlice from "./slices/managerDashboardSlice";
import leadsReducer from "./slices/leadsSlice";
import incomesReducer from "./slices/incomesSlice";
import attendancesReducer from "./slices/attendancesSlice";
import vendorReducer from "./slices/vendorSlice";
import billsReducer from "./slices/BillSlice";
import paymentsReducer from "./slices/paymentSlice";
import purchaseOrderReducer from "./slices/PurchaseOrderSlice";
import pipelineReducer from "./slices/pipelineSlice";

import notesReducer from "./slices/notesSlice";
import masterModulesReducer from "./slices/masterModulesSlice";
// import assetCategoryReducer from './slices/assetCategorySlice';
// import assetLocationReducer from './slices/assetLocationSlice';
// import assetStatusReducer from './slices/assetStatusSlice';
// import customFieldsReducer from './slices/customFieldsSlice';
// import idFormattingReducer from './slices/idFormattingSlice';
// import assetReducer from './slices/assetSlice';

export const store = configureStore({
  reducer: {
    companies: companiesReducer, // Manages company-related state
    employees: employeesReducer, // Manages employee-related state
    modules: modulesReducer, // Manages module-related state
    masterModules: masterModulesReducer, // Manages master modules state
    auth: authReducer, // Manages authentication state
    expenses: expensesReducer, // Manages expense-related state
    leave: leaveReducer, // Manages leave-related state
    leaveType: leaveTypeReducer,
    leavePolicy: leavePolicyReducer,
    publicHoliday: publicHolidayReducer,
    department: departmentReducer,
    designation: designationReducer,
    sessionStorage: sessionStorageReducer,
    leaveBalance: leaveBalanceReducer,
    requestDetails: requestDetailsReducer,
    payrollSettings: payrollSettingsReducer,
    payslip: payslipReducer,
    allEmployees: allEmployeesSlice,
    managerEmployee: managerEmployeeSlice,
    managerDashboard: managerDashboardSlice,
    leads: leadsReducer,
    pipelines: pipelineReducer,
    incomes: incomesReducer,
    attendances: attendancesReducer,
    vendors: vendorReducer,
    bills: billsReducer,
    payments: paymentsReducer,
    purchaseOrders: purchaseOrderReducer,
    pipelines: pipelineReducer,

    notes: notesReducer,
    // assetCategories: assetCategoryReducer,
    // assetLocations: assetLocationReducer,
    // assetStatuses: assetStatusReducer,
    // customFields: customFieldsReducer,
    // idFormatting: idFormattingReducer,
    // assets: assetReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents serialization errors with async actions
    }),
  devTools: process.env.NODE_ENV !== "production", // Enables Redux DevTools in development mode
});

export default store;