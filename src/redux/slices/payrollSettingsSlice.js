import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import company, { CompanyServiceClient } from "@/generated/company_grpc_web_pb";

// Async thunk for fetching TDS settings
export const fetchTDS = createAsyncThunk(
  "payrollSettings/fetchTDS",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = localStorage.getItem("selectedCompanyId");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/tds-settings/company/${company}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch TDS settings");
    }
  }
);

// Async thunk for fetching Professional Tax settings
export const fetchPTAX = createAsyncThunk(
  "payrollSettings/fetchPTAX",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = localStorage.getItem("selectedCompanyId");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/professional-tax-settings/company/${company}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Professional Tax settings");
    }
  }
);

// Async thunk for saving/updating TDS settings
export const saveTDS = createAsyncThunk(
  "payrollSettings/saveTDS",
  async (tdsData, { getState, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const { isTdsConfigured } = getState().payrollSettings;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tds-settings`;
      
      // If TDS is already configured, use PUT to update, otherwise use POST to create
      const method = isTdsConfigured ? "put" : "post";

      const response = await axios({
        method,
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          tdsRate: parseFloat(tdsData.tdsRate),
          description: tdsData.description,
          companyId: localStorage.getItem("selectedCompanyId"),
        },
      });
      return response.data;
    } catch (error) {
      // If we get a 404 saying settings already exist, try updating instead
      if (error.response?.status === 404 && error.response?.data?.message?.includes("already exist")) {
        try {
          const token = getItemFromSessionStorage("token", null);
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/tds-settings`,
            {
              tdsRate: parseFloat(tdsData.tdsRate),
              description: tdsData.description,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return response.data;
        } catch (updateError) {
          return rejectWithValue(updateError.response?.data?.message || "Failed to update TDS settings");
        }
      }
      return rejectWithValue(error.response?.data?.message || "Failed to save TDS settings");
    }
  }
);

// Async thunk for saving/updating Professional Tax settings
export const savePTAX = createAsyncThunk(
  "payrollSettings/savePTAX",
  async (ptaxData, { getState, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const { isPtaxConfigured } = getState().payrollSettings;
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/professional-tax-settings`;
      
      // If Professional Tax is already configured, use PUT to update, otherwise use POST to create
      const method = isPtaxConfigured ? "put" : "post";

      const response = await axios({
        method,
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          monthlySalaryThreshold: parseFloat(ptaxData.monthlySalaryThreshold),
          amountAboveThreshold: parseFloat(ptaxData.amountAboveThreshold),
          amountBelowThreshold: parseFloat(ptaxData.amountBelowThreshold),
          description: ptaxData.description,
          companyId: localStorage.getItem("selectedCompanyId"),
        },
      });
      return response.data;
    } catch (error) {
      // If we get a 404 saying settings already exist, try updating instead
      if (error.response?.status === 404 && error.response?.data?.message?.includes("already exist")) {
        try {
          const token = getItemFromSessionStorage("token", null);
          const response = await axios.put(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/professional-tax-settings`,
            {
              monthlySalaryThreshold: parseFloat(ptaxData.monthlySalaryThreshold),
              amountAboveThreshold: parseFloat(ptaxData.amountAboveThreshold),
              amountBelowThreshold: parseFloat(ptaxData.amountBelowThreshold),
              description: ptaxData.description,
            },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return response.data;
        } catch (updateError) {
          return rejectWithValue(updateError.response?.data?.message || "Failed to update Professional Tax settings");
        }
      }
      return rejectWithValue(error.response?.data?.message || "Failed to save Professional Tax settings");
    }
  }
);

const initialState = {
  tdsData: null,
  ptaxData: null,
  loading: false,
  error: null,
  isTdsConfigured: false,
  isPtaxConfigured: false,
};

const payrollSettingsSlice = createSlice({
  name: "payrollSettings",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetTdsForm: (state) => {
      state.tdsData = null;
      state.isTdsConfigured = false;
    },
    resetPtaxForm: (state) => {
      state.ptaxData = null;
      state.isPtaxConfigured = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // TDS reducers
      .addCase(fetchTDS.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTDS.fulfilled, (state, action) => {
        state.loading = false;
        state.tdsData = action.payload;
        state.isTdsConfigured = !!action.payload;
      })
      .addCase(fetchTDS.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isTdsConfigured = false;
      })
      // PTAX reducers
      .addCase(fetchPTAX.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPTAX.fulfilled, (state, action) => {
        state.loading = false;
        state.ptaxData = action.payload;
        state.isPtaxConfigured = !!action.payload;
      })
      .addCase(fetchPTAX.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isPtaxConfigured = false;
      })
      // Save TDS reducers
      .addCase(saveTDS.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTDS.fulfilled, (state, action) => {
        state.loading = false;
        state.tdsData = action.payload;
        state.isTdsConfigured = true;
      })
      .addCase(saveTDS.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Save PTAX reducers
      .addCase(savePTAX.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePTAX.fulfilled, (state, action) => {
        state.loading = false;
        state.ptaxData = action.payload;
        state.isPtaxConfigured = true;
      })
      .addCase(savePTAX.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetTdsForm, resetPtaxForm } = payrollSettingsSlice.actions;
export default payrollSettingsSlice.reducer; 