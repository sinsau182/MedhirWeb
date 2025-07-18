import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

// Async thunk to fetch manager's employees count
export const fetchManagerEmployeeCount = createAsyncThunk(
  "managerDashboard/fetchManagerEmployeeCount",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/employees/manager/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data.length;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching manager employee count:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch employee count"
      );
    }
  }
);

// Async thunk to fetch pending leave requests
export const fetchManagerPendingLeaves = createAsyncThunk(
  "managerDashboard/fetchManagerPendingLeaves",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/manager/leave/status/Pending/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data.leaves)) {
        const regularLeaves = response.data.leaves.filter(
          (leave) => leave.leaveName !== "Comp-Off"
        );
        const compOffLeaves = response.data.leaves.filter(
          (leave) => leave.leaveName === "Comp-Off"
        );

        return {
          regularLeaves,
          compOffLeaves,
        };
      }

      return { regularLeaves: [], compOffLeaves: [] };
    } catch (error) {
      console.error("Error fetching pending leaves:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pending leaves"
      );
    }
  }
);

// Async thunk to fetch profile updates
export const fetchManagerProfileUpdates = createAsyncThunk(
  "managerDashboard/fetchManagerProfileUpdates",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const employeeId = sessionStorage.getItem("employeeId");
      
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/manager/${employeeId}/members/update-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    } catch (error) {
      console.error("Error fetching profile updates:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile updates"
      );
    }
  }
);

// Async thunk to fetch all manager dashboard data
export const fetchManagerDashboardData = createAsyncThunk(
  "managerDashboard/fetchManagerDashboardData",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Fetch all data in parallel
      await Promise.all([
        dispatch(fetchManagerEmployeeCount()),
        dispatch(fetchManagerPendingLeaves()),
        dispatch(fetchManagerProfileUpdates()),
      ]);
      
      return { success: true };
    } catch (error) {
      return rejectWithValue("Failed to fetch dashboard data");
    }
  }
);

const initialState = {
  employeeCount: 0,
  pendingLeaves: [],
  pendingCompOffs: [],
  profileUpdates: [],
  loading: false,
  error: null,
  employeeCountLoading: false,
  employeeCountError: null,
  pendingLeavesLoading: false,
  pendingLeavesError: null,
  profileUpdatesLoading: false,
  profileUpdatesError: null,
};

const managerDashboardSlice = createSlice({
  name: "managerDashboard",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.employeeCountError = null;
      state.pendingLeavesError = null;
      state.profileUpdatesError = null;
    },
    resetDashboard: (state) => {
      state.employeeCount = 0;
      state.pendingLeaves = [];
      state.pendingCompOffs = [];
      state.profileUpdates = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Employee count
    builder
      .addCase(fetchManagerEmployeeCount.pending, (state) => {
        state.employeeCountLoading = true;
        state.employeeCountError = null;
      })
      .addCase(fetchManagerEmployeeCount.fulfilled, (state, action) => {
        state.employeeCountLoading = false;
        state.employeeCount = action.payload;
      })
      .addCase(fetchManagerEmployeeCount.rejected, (state, action) => {
        state.employeeCountLoading = false;
        state.employeeCountError = action.payload;
      })

    // Pending leaves
      .addCase(fetchManagerPendingLeaves.pending, (state) => {
        state.pendingLeavesLoading = true;
        state.pendingLeavesError = null;
      })
      .addCase(fetchManagerPendingLeaves.fulfilled, (state, action) => {
        state.pendingLeavesLoading = false;
        state.pendingLeaves = action.payload.regularLeaves;
        state.pendingCompOffs = action.payload.compOffLeaves;
      })
      .addCase(fetchManagerPendingLeaves.rejected, (state, action) => {
        state.pendingLeavesLoading = false;
        state.pendingLeavesError = action.payload;
      })

    // Profile updates
      .addCase(fetchManagerProfileUpdates.pending, (state) => {
        state.profileUpdatesLoading = true;
        state.profileUpdatesError = null;
      })
      .addCase(fetchManagerProfileUpdates.fulfilled, (state, action) => {
        state.profileUpdatesLoading = false;
        state.profileUpdates = action.payload;
      })
      .addCase(fetchManagerProfileUpdates.rejected, (state, action) => {
        state.profileUpdatesLoading = false;
        state.profileUpdatesError = action.payload;
      })

    // All dashboard data
      .addCase(fetchManagerDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagerDashboardData.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchManagerDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetDashboard } = managerDashboardSlice.actions;

export default managerDashboardSlice.reducer; 