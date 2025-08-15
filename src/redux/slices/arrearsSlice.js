import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';

// Get the base URL from environment or use a default
const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Client-side: use window.location or environment variable
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";
  }
  // Server-side: use environment variable
  return process.env.API_URL || "http://localhost:8083";
};

const API_BASE_URL = getBaseUrl();

// Async thunk for updating arrears paid
export const updateArrearsPaid = createAsyncThunk(
  'arrears/updateArrearsPaid',
  async (payload, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/arrears`,
        {
          employeeId: payload.employeeId,
          companyId: payload.companyId,
          month: payload.month,
          year: payload.year,
          arrearsPaid: payload.arrearsPaid
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to update arrears paid"
        );
      }
      return rejectWithValue("Network error: Unable to update arrears paid");
    }
  }
);

// Async thunk for updating arrears deducted
export const updateArrearsDeducted = createAsyncThunk(
  'arrears/updateArrearsDeducted',
  async (payload, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/arrears`,
        {
          employeeId: payload.employeeId,
          companyId: payload.companyId,
          month: payload.month,
          year: payload.year,
          arrearsDeducted: payload.arrearsDeducted
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to update arrears deducted"
        );
      }
      return rejectWithValue("Network error: Unable to update arrears deducted");
    }
  }
);

// Async thunk for fetching company arrears
export const fetchCompanyArrears = createAsyncThunk(
  'arrears/fetchCompanyArrears',
  async ({ companyId, month, year }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/arrears/company/${companyId}/month/${month}/year/${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch company arrears"
        );
      }
      return rejectWithValue("Network error: Unable to fetch company arrears");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
  arrearsPaidData: null,
  arrearsDeductedData: null,
  companyArrears: [],
  companyArrearsLoading: false,
  companyArrearsError: null,
};

const arrearsSlice = createSlice({
  name: 'arrears',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetArrearsState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.arrearsPaidData = null;
      state.arrearsDeductedData = null;
      state.companyArrears = [];
      state.companyArrearsLoading = false;
      state.companyArrearsError = null;
    },
  },
  extraReducers: (builder) => {
    // Update arrears paid
    builder
      .addCase(updateArrearsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateArrearsPaid.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.arrearsPaidData = action.payload;
        state.error = null;
      })
      .addCase(updateArrearsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Update arrears deducted
    builder
      .addCase(updateArrearsDeducted.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateArrearsDeducted.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.arrearsDeductedData = action.payload;
        state.error = null;
      })
      .addCase(updateArrearsDeducted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      });

    // Fetch company arrears
    builder
      .addCase(fetchCompanyArrears.pending, (state) => {
        state.companyArrearsLoading = true;
        state.companyArrearsError = null;
      })
      .addCase(fetchCompanyArrears.fulfilled, (state, action) => {
        state.companyArrearsLoading = false;
        state.companyArrears = action.payload;
        state.companyArrearsError = null;
      })
      .addCase(fetchCompanyArrears.rejected, (state, action) => {
        state.companyArrearsLoading = false;
        state.companyArrearsError = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetArrearsState } = arrearsSlice.actions;
export default arrearsSlice.reducer;
