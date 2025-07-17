import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import getConfig from "next/config";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Async thunks
export const fetchActivities = createAsyncThunk(
  "activities/fetchActivities",
  async (leadId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_BASE_URL}/leads/${leadId}/activities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, activities: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch activities");
    }
  }
);

export const addActivity = createAsyncThunk(
  "activities/addActivity",
  async ({ leadId, activity }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_BASE_URL}/leads/${leadId}/activities`,
        activity,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, activity: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add activity");
    }
  }
);

export const updateActivity = createAsyncThunk(
  "activities/updateActivity",
  async ({ leadId, activityId, activity }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.put(
        `${API_BASE_URL}/leads/${leadId}/activities/${activityId}`,
        activity,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, activity: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update activity");
    }
  }
);

export const deleteActivity = createAsyncThunk(
  "activities/deleteActivity",
  async ({ leadId, activityId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      await axios.delete(
        `${API_BASE_URL}/leads/${leadId}/activities/${activityId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, activityId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete activity");
    }
  }
);

export const markActivityDone = createAsyncThunk(
  "activities/markActivityDone",
  async ({ leadId, activityId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.patch(
        `${API_BASE_URL}/leads/${leadId}/activities/${activityId}/status`,
        "done",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { leadId, activity: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to mark activity as done");
    }
  }
);

const initialState = {
  activitiesByLead: {}, // { leadId: [activities] }
  loading: false,
  error: null,
};

const activitiesSlice = createSlice({
  name: "activities",
  initialState,
  reducers: {
    clearActivities: (state, action) => {
      const leadId = action.payload;
      if (leadId) {
        delete state.activitiesByLead[leadId];
      } else {
        state.activitiesByLead = {};
      }
    },
    addLocalActivity: (state, action) => {
      const { leadId, activity } = action.payload;
      if (!state.activitiesByLead[leadId]) {
        state.activitiesByLead[leadId] = [];
      }
      state.activitiesByLead[leadId].unshift(activity);
    },
    updateLocalActivity: (state, action) => {
      const { leadId, activity } = action.payload;
      if (state.activitiesByLead[leadId]) {
        const index = state.activitiesByLead[leadId].findIndex(
          (a) => a.id === activity.id
        );
        if (index !== -1) {
          state.activitiesByLead[leadId][index] = activity;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        const { leadId, activities } = action.payload;
        state.activitiesByLead[leadId] = activities;
        state.loading = false;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add activity
      .addCase(addActivity.fulfilled, (state, action) => {
        const { leadId, activity } = action.payload;
        if (!state.activitiesByLead[leadId]) {
          state.activitiesByLead[leadId] = [];
        }
        state.activitiesByLead[leadId].unshift(activity);
      })
      // Update activity
      .addCase(updateActivity.fulfilled, (state, action) => {
        const { leadId, activity } = action.payload;
        if (state.activitiesByLead[leadId]) {
          const index = state.activitiesByLead[leadId].findIndex(
            (a) => a.id === activity.id
          );
          if (index !== -1) {
            state.activitiesByLead[leadId][index] = activity;
          }
        }
      })
      // Delete activity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        const { leadId, activityId } = action.payload;
        if (state.activitiesByLead[leadId]) {
          state.activitiesByLead[leadId] = state.activitiesByLead[leadId].filter(
            (a) => a.id !== activityId
          );
        }
      })
      // Mark activity done
      .addCase(markActivityDone.fulfilled, (state, action) => {
        const { leadId, activity } = action.payload;
        if (state.activitiesByLead[leadId]) {
          const index = state.activitiesByLead[leadId].findIndex(
            (a) => a.id === activity.id
          );
          if (index !== -1) {
            state.activitiesByLead[leadId][index] = activity;
          }
        }
      });
  },
});

export const { clearActivities, addLocalActivity, updateLocalActivity } = activitiesSlice.actions;

// Selectors
export const selectActivitiesByLead = (state, leadId) => 
  state.activities.activitiesByLead[leadId] || [];

export const selectActivitiesLoading = (state) => state.activities.loading;
export const selectActivitiesError = (state) => state.activities.error;

export default activitiesSlice.reducer; 