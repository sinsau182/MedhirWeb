import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Fetch all leave types
export const fetchLeaveTypes = createAsyncThunk(
  'leaveType/fetchLeaveTypes',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching leave types with token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        return rejectWithValue('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/leave-types`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data) {
        throw new Error('No data received from server');
      }

      console.log('Leave types response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching leave types:', error);
      if (error.response?.status === 500) {
        return rejectWithValue('Server error. Please try again later.');
      }
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch leave types');
    }
  }
);

// Create leave type
export const createLeaveType = createAsyncThunk(
  'leaveType/createLeaveType',
  async (leaveTypeData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Creating leave type with data:', leaveTypeData);
      
      const response = await axios.post(`${API_URL}/leave-types`, leaveTypeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Create response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating leave type:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to create leave type');
    }
  }
);

// Update leave type
export const updateLeaveType = createAsyncThunk(
  'leaveType/updateLeaveType',
  async ({ id, leaveTypeData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Updating leave type with data:', { id, leaveTypeData });
      
      const response = await axios.put(`${API_URL}/leave-types/${id}`, leaveTypeData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating leave type:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to update leave type');
    }
  }
);

// Delete leave type
export const deleteLeaveType = createAsyncThunk(
  'leaveType/deleteLeaveType',
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      console.log('Deleting leave type:', id);
      
      const response = await axios.delete(`${API_URL}/leave-types/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting leave type:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to delete leave type');
    }
  }
);

const leaveTypeSlice = createSlice({
  name: 'leaveType',
  initialState: {
    leaveTypes: [],
    loading: false,
    error: null,
    success: false,
    lastUpdated: null
  },
  reducers: {
    resetLeaveTypeState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch leave types
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create leave type
      .addCase(createLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLeaveType.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes.push(action.payload);
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update leave type
      .addCase(updateLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLeaveType.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.leaveTypes.findIndex(type => type.id === action.payload.id);
        if (index !== -1) {
          state.leaveTypes[index] = action.payload;
        }
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete leave type
      .addCase(deleteLeaveType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteLeaveType.fulfilled, (state, action) => {
        state.loading = false;
        state.leaveTypes = state.leaveTypes.filter(type => type.id !== action.payload);
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteLeaveType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetLeaveTypeState } = leaveTypeSlice.actions;
export default leaveTypeSlice.reducer; 