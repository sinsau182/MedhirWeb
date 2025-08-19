import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const {publicRuntimeConfig} = getConfig();

// Async thunk for fetching TDS settings
export const fetchTDS = createAsyncThunk(
  "payrollSettings/fetchTDS",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("employeeCompanyId");
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/tds-settings/company/${company}`,
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
      const company = sessionStorage.getItem("employeeCompanyId");
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/professional-tax-settings/company/${company}`,
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

// Async thunk for fetching Payroll Freeze Settings
export const fetchPayrollFreezeSettings = createAsyncThunk(
  "payrollSettings/fetchPayrollFreezeSettings",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("employeeCompanyId");
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/api/settings/payroll/company/${company}`,
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
      return rejectWithValue(error.response?.data?.message || "Failed to fetch Payroll Freeze settings");
    }
  }
);

// Async thunk for saving/updating TDS settings
export const saveTDS = createAsyncThunk(
  "payrollSettings/saveTDS",
  async (tdsData, { getState, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const companyId = sessionStorage.getItem("employeeCompanyId");
      const { isTdsConfigured } = getState().payrollSettings;
      
      const url = isTdsConfigured 
        ? `${publicRuntimeConfig.apiURL}/tds-settings/company/${companyId}`
        : `${publicRuntimeConfig.apiURL}/tds-settings`;

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
          companyId: companyId,
        },
      });
      return response.data;
    } catch (error) {
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
      const companyId = sessionStorage.getItem("employeeCompanyId");
      const response = await axios({
        method: "post",
        url: `${publicRuntimeConfig.apiURL}/professional-tax-settings`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          monthlySalaryThreshold: parseFloat(ptaxData.monthlySalaryThreshold),
          amountAboveThreshold: parseFloat(ptaxData.amountAboveThreshold),
          amountBelowThreshold: parseFloat(ptaxData.amountBelowThreshold),
          description: ptaxData.description,
          companyId: companyId,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to save Professional Tax settings");
    }
  }
);

// Async thunk for saving/updating Payroll Freeze Settings
export const savePayrollFreezeSettings = createAsyncThunk(
  "payrollSettings/savePayrollFreezeSettings",
  async (freezeData, { getState, rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const companyId = sessionStorage.getItem("employeeCompanyId");
      const { isPayrollFreezeConfigured, payrollFreezeData } = getState().payrollSettings;
      
      let url, method;
      
      if (isPayrollFreezeConfigured && payrollFreezeData?.settingsId) {
        // Update existing settings using the settingsId
        url = `${publicRuntimeConfig.apiURL}/api/settings/payroll/update/${payrollFreezeData.settingsId}`;
        method = "put";
      } else {
        // Create new settings
        url = `${publicRuntimeConfig.apiURL}/api/settings/payroll/create`;
        method = "post";
      }

      const response = await axios({
        method,
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          payrollEnablementDate: parseInt(freezeData.payrollEnablementDay),
          freezeAfterDays: parseInt(freezeData.freezeAfterDays),
          companyId: companyId,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to save Payroll Freeze settings");
    }
  }
);

export const fetchPayrollSettings = createAsyncThunk(
    "payrollSettings/fetchPayrollSettings",
    async (companyId, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/payroll/company/${companyId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch payroll settings");
        }
    }
);

const initialState = {
  tdsData: null,
  ptaxData: null,
  payrollFreezeData: null,
  loading: false,
  error: null,
  isTdsConfigured: false,
  isPtaxConfigured: false,
  isPayrollFreezeConfigured: false,
  settings: null,
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
    resetPayrollFreezeForm: (state) => {
      state.payrollFreezeData = null;
      state.isPayrollFreezeConfigured = false;
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
      // Payroll Freeze Settings reducers
      .addCase(fetchPayrollFreezeSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollFreezeSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollFreezeData = action.payload;
        state.isPayrollFreezeConfigured = !!action.payload;
      })
      .addCase(fetchPayrollFreezeSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isPayrollFreezeConfigured = false;
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
      })
      // Save Payroll Freeze Settings reducers
      .addCase(savePayrollFreezeSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(savePayrollFreezeSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.payrollFreezeData = action.payload;
        state.isPayrollFreezeConfigured = true;
      })
      .addCase(savePayrollFreezeSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPayrollSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(fetchPayrollSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
    })
    .addCase(fetchPayrollSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
    });
  },
});

export const { clearErrors, resetTdsForm, resetPtaxForm, resetPayrollFreezeForm } = payrollSettingsSlice.actions;
export default payrollSettingsSlice.reducer; 