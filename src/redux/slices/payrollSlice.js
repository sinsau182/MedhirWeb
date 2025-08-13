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

// Get Employee Payslip for specific month
export const getEmployeePayslip = createAsyncThunk(
  "payroll/getEmployeePayslip",
  async ({ employeeId, year, month }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";
      
      // Convert month name to number
      const monthMap = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12
      };
      
      const monthNumber = monthMap[month] || month;
      
      const response = await fetch(`${baseUrl}/api/payroll/employee/${employeeId}/payslip?year=${year}&month=${monthNumber}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 409) {
          // No payslip found for this month
          return rejectWithValue({ status: 409, message: "No payslip found for this month" });
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payslip");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
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
  employeePayslip: null,
  employeePayslipLoading: false,
  employeePayslipError: null,
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
      })
      // Employee Payslip
      .addCase(getEmployeePayslip.pending, (state) => {
        state.employeePayslipLoading = true;
        state.employeePayslipError = null;
      })
      .addCase(getEmployeePayslip.fulfilled, (state, action) => {
        state.employeePayslipLoading = false;
        state.employeePayslipError = null;
        state.employeePayslip = action.payload;
      })
      .addCase(getEmployeePayslip.rejected, (state, action) => {
        state.employeePayslipLoading = false;
        state.employeePayslipError = action.payload;
      });
  },
});

export const { clearPayrollError, clearPayroll } = payrollSlice.actions;
export default payrollSlice.reducer;