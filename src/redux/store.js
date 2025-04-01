import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";
import employeesReducer from "./slices/employeeSlice"; // Import employee slice
import modulesReducer from "./slices/modulesSlice"; // Import module slice
import usersReducer from "./slices/usersSlice"; // Import user slice
import authReducer from "./slices/authSlice"; // Import auth slice
import expensesReducer from "./slices/expenseSlice"; // Import expense slice
import payrollReducer from "./slices/payrollSlice"; // Import payroll slice
import leaveReducer from "./slices/leaveSlice"; // Import leave slice

export const store = configureStore({
  reducer: {
    companies: companiesReducer, // Manages company-related state
    employees: employeesReducer, // Manages employee-related state
    modules: modulesReducer, // Manages module-related state
    users: usersReducer, // Manages user-related state
    auth: authReducer, // Manages authentication state
    expenses: expensesReducer, // Manages expense-related state
    payroll: payrollReducer, // Manages payroll-related state
    leaveReducer: leaveReducer, // Manages leave-related state
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents serialization errors with async actions
    }),
  devTools: process.env.NODE_ENV !== "production", // Enables Redux DevTools in development mode
});

export default store;
