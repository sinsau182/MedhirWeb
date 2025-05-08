import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice"; // Assuming this utility exists
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
// Async thunk to fetch manager's employees
export const fetchManagerEmployees = createAsyncThunk(
  "managerEmployee/fetchManagerEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null); // Retrieve the token from sessionStorage
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/employees/manager/MED101`, // Hardcoded API endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      );

      return response.data; // Return the fetched data
    } catch (error) {
      console.error("Error fetching manager employees:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch manager employees"
      );
    }
  }
);

const managerEmployeeSlice = createSlice({
  name: "managerEmployee",
  initialState: {
    employees: [], // List of employees
    loading: false, // Loading state
    error: null, // Error state
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagerEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload; // Store the fetched employees
      })
      .addCase(fetchManagerEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Store the error message
      });
  },
});

export default managerEmployeeSlice.reducer;
