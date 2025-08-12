import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
import { toast } from "sonner";
const {publicRuntimeConfig} = getConfig();

// Generate Payroll for all employees
export const generatePayroll = createAsyncThunk(
  "payroll/generatePayroll",
  async (payload, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${publicRuntimeConfig.apiURL}/api/payroll/generate`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

// Get Payroll for all employees
export const getPayroll = createAsyncThunk(
  "payroll/getPayroll",
  async (params, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/api/payroll/view`,
        {
          params: {
            companyId: params.companyId,
            year: params.year,
            month: params.month
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: "An error occurred" });
    }
  }
);

// Send Payslips API
export const sendPayslips = createAsyncThunk(
  "payroll/sendPayslips",
  async (employeeIds, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";
      
      const response = await fetch(`${baseUrl}/api/payroll/send-payslips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ employeeIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send payslips");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  payroll: null,
  loading: false,
  error: null,
  sendPayslipsLoading: false,
  sendPayslipsError: null,
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    clearPayrollError: (state) => {
      state.error = null;
      state.sendPayslipsError = null;
    },
    clearPayroll: (state) => {
      state.payroll = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generatePayroll.pending, (state) => {
        state.loading = true;
      })
      .addCase(generatePayroll.fulfilled, (state, action) => {
        state.payroll = action.payload;
        state.loading = false;
      })
      .addCase(generatePayroll.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(getPayroll.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPayroll.fulfilled, (state, action) => {
        state.payroll = action.payload;
        state.loading = false;
      })
      .addCase(getPayroll.rejected, (state, action) => {
        state.error = action.payload;
        state.payroll = null; // Clear payroll data when there's an error
        state.loading = false;
      })
      // Send Payslips
      .addCase(sendPayslips.pending, (state) => {
        state.sendPayslipsLoading = true;
        state.sendPayslipsError = null;
      })
      .addCase(sendPayslips.fulfilled, (state, action) => {
        state.sendPayslipsLoading = false;
        state.sendPayslipsError = null;
        toast.success("Payslips sent successfully!");
      })
      .addCase(sendPayslips.rejected, (state, action) => {
        state.sendPayslipsLoading = false;
        state.sendPayslipsError = action.payload;
        toast.error(action.payload || "Failed to send payslips");
      });
  },
});

export const { clearPayrollError, clearPayroll } = payrollSlice.actions;
export default payrollSlice.reducer;