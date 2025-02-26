import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";
import employeesReducer from "./slices/employeeSlice"; // Import employee slice

export const store = configureStore({
  reducer: {
    companies: companiesReducer, // Manages company-related state
    employees: employeesReducer, // Manages employee-related state
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents serialization errors with async actions
    }),
  devTools: process.env.NODE_ENV !== "production", // Enables Redux DevTools in development mode
});

export default store;
