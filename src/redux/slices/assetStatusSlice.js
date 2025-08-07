
//export default assetStatusSlice.reducer; //
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const API_BASE = publicRuntimeConfig.apiURL + "/api/asset-settings/status-labels";

// Fetch all status labels
export const fetchAssetStatuses = createAsyncThunk(
  'assetStatuses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(API_BASE, { headers });
      
      // Handle both old and new API response formats
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch status labels');
    }
  }
);

// Fetch system default status labels
export const fetchSystemDefaultStatuses = createAsyncThunk(
  'assetStatuses/fetchSystemDefaults',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_BASE}/system-defaults`, { headers });
      
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch system default status labels');
    }
  }
);

// Add a new status label
export const addAssetStatus = createAsyncThunk(
  'assetStatuses/add',
  async (status, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.post(API_BASE, status, { headers });
      
      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add status label');
    }
  }
);

// Update a status label
export const updateAssetStatus = createAsyncThunk(
  'assetStatuses/update',
  async ({ statusLabelId, statusData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/${statusLabelId}`, statusData, { headers });
      
      const data = response.data?.data || response.data;
      return { ...data, statusLabelId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status label');
    }
  }
);

// Delete a status label
export const deleteAssetStatus = createAsyncThunk(
  'assetStatuses/delete',
  async (statusId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${API_BASE}/${statusId}`, { headers });
      return statusId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete status label');
    }
  }
);

// Batch update status labels
export const batchUpdateAssetStatuses = createAsyncThunk(
  'assetStatuses/batchUpdate',
  async (statuses, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.patch(`${API_BASE}/batch`, statuses, { headers });
      
      const data = response.data?.data?.statusLabels || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to batch update status labels');
    }
  }
);

const assetStatusSlice = createSlice({
  name: 'assetStatuses',
  initialState: {
    statuses: [],
    systemDefaults: [],
    loading: false,
    error: null,
    loadingDefaults: false,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Local state management for inline editing
    updateStatusLocal: (state, action) => {
      const { statusId, field, value } = action.payload;
      const status = state.statuses.find(st => 
        st.statusLabelId === statusId || st.id === statusId
      );
      if (status) {
        status[field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssetStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssetStatuses.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = action.payload;
      })
      .addCase(fetchAssetStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchSystemDefaultStatuses.pending, (state) => {
        state.loadingDefaults = true;
        state.error = null;
      })
      .addCase(fetchSystemDefaultStatuses.fulfilled, (state, action) => {
        state.loadingDefaults = false;
        state.systemDefaults = action.payload;
      })
      .addCase(fetchSystemDefaultStatuses.rejected, (state, action) => {
        state.loadingDefaults = false;
        state.error = action.payload;
      })
      
      .addCase(addAssetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAssetStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses.push(action.payload);
      })
      .addCase(addAssetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(updateAssetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAssetStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.statuses.findIndex(st => 
          st.statusLabelId === action.payload.statusLabelId || st.id === action.payload.statusLabelId
        );
        if (index !== -1) {
          state.statuses[index] = { ...state.statuses[index], ...action.payload };
        }
      })
      .addCase(updateAssetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(deleteAssetStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAssetStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.statuses = state.statuses.filter(st => 
          st.statusLabelId !== action.payload && st.id !== action.payload
        );
      })
      .addCase(deleteAssetStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(batchUpdateAssetStatuses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(batchUpdateAssetStatuses.fulfilled, (state, action) => {
        state.loading = false;
        if (Array.isArray(action.payload)) {
          state.statuses = action.payload;
        }
      })
      .addCase(batchUpdateAssetStatuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, updateStatusLocal } = assetStatusSlice.actions;

export default assetStatusSlice.reducer; 