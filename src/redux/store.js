import { configureStore } from "@reduxjs/toolkit";
import companiesReducer from "./slices/companiesSlice";

export const store = configureStore({
  reducer: {
    companies: companiesReducer,
  },
});
