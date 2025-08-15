import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

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

export const createOrUpdateEmployeeAdvance = createAsyncThunk(
  "employeeAdvance/createOrUpdate",
  async ({ companyId, employeeId, month, year, thisMonthAdvance, deductedThisMonth }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      const response = await axios.post(
        `${API_BASE_URL}/api/employee-advances/create-or-update`,
        {
          companyId,
          employeeId,
          month,
          year,
          thisMonthAdvance: thisMonthAdvance || 0,
          deductedThisMonth: deductedThisMonth || 0
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
          error.response.data.message || "Failed to create/update employee advance"
        );
      }
      return rejectWithValue("Network error: Unable to create/update employee advance");
    }
  }
);

export const fetchCompanyEmployeeAdvances = createAsyncThunk(
  "employeeAdvance/fetchCompanyAdvances",
  async ({ companyId, month, year }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      const response = await axios.get(
        `${API_BASE_URL}/api/employee-advances/company/${companyId}/month/${month}/year/${year}`,
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
          error.response.data.message || "Failed to fetch employee advances"
        );
      }
      return rejectWithValue("Network error: Unable to fetch employee advances");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  success: false,
  message: "",
  advances: [],
  companyAdvances: [],
  companyAdvancesLoading: false,
  companyAdvancesError: null,
};

const employeeAdvanceSlice = createSlice({
  name: "employeeAdvance",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.message = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrUpdateEmployeeAdvance.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createOrUpdateEmployeeAdvance.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.success = true;
        state.message = "Employee advance updated successfully";
      })
      .addCase(createOrUpdateEmployeeAdvance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(fetchCompanyEmployeeAdvances.pending, (state) => {
        state.companyAdvancesLoading = true;
        state.companyAdvancesError = null;
      })
      .addCase(fetchCompanyEmployeeAdvances.fulfilled, (state, action) => {
        state.companyAdvancesLoading = false;
        state.companyAdvancesError = null;
        state.companyAdvances = action.payload;
      })
      .addCase(fetchCompanyEmployeeAdvances.rejected, (state, action) => {
        state.companyAdvancesLoading = false;
        state.companyAdvancesError = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = employeeAdvanceSlice.actions;
export default employeeAdvanceSlice.reducer;
