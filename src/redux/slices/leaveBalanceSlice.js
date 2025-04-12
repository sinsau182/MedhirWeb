import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from '@/redux/slices/sessionStorageSlice';

// Define the base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch leave balance for a specific employee
export const fetchLeaveBalance = createAsyncThunk(
  "leaveBalance/fetch",
  async (employeeId, { getState, rejectWithValue }) => {
    try {
      // Get token from Redux state instead of using dispatch(getItem)
      const token = getItemFromSessionStorage("token", null);
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.get(
        `${BASE_URL}/api/leave-balance/current/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to fetch leave balance"
      );
    }
  }
);

// Update leave balance for a specific employee
export const updateLeaveBalance = createAsyncThunk(
  "leaveBalance/update",
  async ({ employeeId, leaveData }, { getState, rejectWithValue }) => {
    try {
      // Get token from Redux state instead of using dispatch(getItem)
      const { sessionStorage } = getState();
      const token = sessionStorage.items?.token;
      
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.put(
        `${BASE_URL}/api/leave-balance/${employeeId}`,
        leaveData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update leave balance"
      );
    }
  }
);

// Reset leave balance state
export const resetLeaveBalanceState = createAsyncThunk(
  "leaveBalance/reset",
  async () => {
    return null;
  }
);

const leaveBalanceSlice = createSlice({
  name: "leaveBalance",
  initialState: {
    balance: null,
    loading: false,
    error: null,
    success: false,
    lastUpdated: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch leave balance cases
      .addCase(fetchLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Update leave balance cases
      .addCase(updateLeaveBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLeaveBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateLeaveBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Reset state cases
      .addCase(resetLeaveBalanceState.fulfilled, (state) => {
        state.balance = null;
        state.loading = false;
        state.error = null;
        state.success = false;
        state.lastUpdated = null;
      });
  },
});

export const { clearError, clearSuccess } = leaveBalanceSlice.actions;
export default leaveBalanceSlice.reducer; 