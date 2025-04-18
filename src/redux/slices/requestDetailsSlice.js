import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

// Async thunks for fetching data
export const fetchPendingLeaveRequests = createAsyncThunk(
  'requestDetails/fetchPendingLeaveRequests',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token');
      const company = localStorage.getItem('selectedCompanyId');
      if (!token) {
        return rejectWithValue('Authentication token not found');
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leave/status/${company}/Pending`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data.leaves)) {
        const regularLeaves = response.data.leaves.filter(leave => leave.leaveName !== "Comp-Off");
        const compOffLeaves = response.data.leaves.filter(leave => leave.leaveName === "Comp-Off");
        
        return {
          regularLeaves,
          compOffLeaves
        };
      }
      
      return { regularLeaves: [], compOffLeaves: [] };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch pending leave requests');
    }
  }
);

export const fetchProfileUpdates = createAsyncThunk(
  'requestDetails/fetchProfileUpdates',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token');
      if (!token) {
        return rejectWithValue('Authentication token not found');
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/hradmin/update-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        const updatesWithChanges = response.data.filter(update => update.changes && update.changes.length > 0);
        return updatesWithChanges;
      }
      
      return [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch profile updates');
    }
  }
);

export const updateLeaveStatus = createAsyncThunk(
  'requestDetails/updateLeaveStatus',
  async ({ leaveId, status, remarks }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token');
      if (!token) {
        return rejectWithValue('Authentication token not found');
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/leave/update-status`,
        {
          leaveId,
          status,
          remarks
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || `Failed to ${status.toLowerCase()} leave request`);
    }
  }
);

export const updateProfileRequestStatus = createAsyncThunk(
  'requestDetails/updateProfileRequestStatus',
  async ({ employeeId, status }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token');
      if (!token) {
        return rejectWithValue('Authentication token not found');
      }

      const formData = new FormData();
      formData.append('status', status);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/hradmin/update-requests/${employeeId}`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      return { employeeId, status, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || `Failed to ${status.toLowerCase()} profile update`);
    }
  }
);

// Initial state
const initialState = {
  pendingLeaves: [],
  pendingCompOffs: [],
  profileUpdates: [],
  loading: false,
  error: null,
  profileLoading: false,
  profileError: null,
  approvingProfileUpdateId: null,
  approvingLeaveId: null,
  rejectingLeaveId: null
};

// Create the slice
const requestDetailsSlice = createSlice({
  name: 'requestDetails',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
      state.profileError = null;
    },
    setApprovingProfileUpdateId: (state, action) => {
      state.approvingProfileUpdateId = action.payload;
    },
    setApprovingLeaveId: (state, action) => {
      state.approvingLeaveId = action.payload;
    },
    setRejectingLeaveId: (state, action) => {
      state.rejectingLeaveId = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Fetch pending leave requests
    builder
      .addCase(fetchPendingLeaveRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingLeaveRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingLeaves = action.payload.regularLeaves;
        state.pendingCompOffs = action.payload.compOffLeaves;
      })
      .addCase(fetchPendingLeaveRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch profile updates
      .addCase(fetchProfileUpdates.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchProfileUpdates.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.profileUpdates = action.payload;
      })
      .addCase(fetchProfileUpdates.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })
      
      // Update leave status
      .addCase(updateLeaveStatus.pending, (state, action) => {
        if (action.meta.arg.status === 'Approved') {
          state.approvingLeaveId = action.meta.arg.leaveId;
        } else if (action.meta.arg.status === 'Rejected') {
          state.rejectingLeaveId = action.meta.arg.leaveId;
        }
      })
      .addCase(updateLeaveStatus.fulfilled, (state) => {
        state.approvingLeaveId = null;
        state.rejectingLeaveId = null;
      })
      .addCase(updateLeaveStatus.rejected, (state) => {
        state.approvingLeaveId = null;
        state.rejectingLeaveId = null;
      })
      
      // Update profile request status
      .addCase(updateProfileRequestStatus.pending, (state, action) => {
        state.approvingProfileUpdateId = action.meta.arg.employeeId;
      })
      .addCase(updateProfileRequestStatus.fulfilled, (state) => {
        state.approvingProfileUpdateId = null;
      })
      .addCase(updateProfileRequestStatus.rejected, (state) => {
        state.approvingProfileUpdateId = null;
      });
  }
});

// Export actions
export const { clearErrors, setApprovingProfileUpdateId, setApprovingLeaveId, setRejectingLeaveId } = requestDetailsSlice.actions;

// Export reducer
export default requestDetailsSlice.reducer; 