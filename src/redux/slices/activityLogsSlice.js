import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import getConfig from "next/config";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Async thunks
export const fetchActivityLogs = createAsyncThunk(
  "activityLogs/fetchActivityLogs",
  async (leadId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_BASE_URL}/leads/${leadId}/activity-logs`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, logs: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch activity logs");
    }
  }
);

const initialState = {
  logsByLead: {}, // { leadId: [logs] }
  loading: false,
  error: null,
};

const activityLogsSlice = createSlice({
  name: "activityLogs",
  initialState,
  reducers: {
    clearActivityLogs: (state, action) => {
      const leadId = action.payload;
      if (leadId) {
        delete state.logsByLead[leadId];
      } else {
        state.logsByLead = {};
      }
    },
    addLocalLog: (state, action) => {
      const { leadId, log } = action.payload;
      if (!state.logsByLead[leadId]) {
        state.logsByLead[leadId] = [];
      }
      state.logsByLead[leadId].unshift(log);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activity logs
      .addCase(fetchActivityLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityLogs.fulfilled, (state, action) => {
        const { leadId, logs } = action.payload;
        state.logsByLead[leadId] = logs;
        state.loading = false;
      })
      .addCase(fetchActivityLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearActivityLogs, addLocalLog } = activityLogsSlice.actions;

// Selectors
export const selectActivityLogsByLead = (state, leadId) => 
  state.activityLogs.logsByLead[leadId] || [];

export const selectActivityLogsLoading = (state) => state.activityLogs.loading;
export const selectActivityLogsError = (state) => state.activityLogs.error;

export default activityLogsSlice.reducer; 