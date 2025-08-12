import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const {publicRuntimeConfig} = getConfig();
// Helper function to check if payslip exists for a specific month/year
export const checkPayslipAvailability = createAsyncThunk(
  "payslip/checkAvailability",
  async ({ employeeId, year, month }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/api/payroll/employee/${employeeId}/payslip?year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return { available: true, data: response.data };
    } catch (error) {
      if (error.response?.status === 409) {
        return { available: false, month, year };
      }
      return rejectWithValue(error.response?.data?.message || "Failed to check payslip availability");
    }
  }
);

// Helper function to get available months for payslip generation
export const getAvailablePayslipMonths = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
  
  const availableMonths = [];
  
  // Add n-1 month (current month - 1)
  const targetMonth = currentMonth - 1;
  if (targetMonth > 0) {
    availableMonths.push({
      month: targetMonth,
      year: currentYear,
      monthName: new Date(currentYear, targetMonth - 1, 1).toLocaleString('default', { month: 'long' })
    });
  }
  
  // Add previous months as fallbacks (n-2, n-3, etc.)
  for (let monthOffset = 2; monthOffset <= 6; monthOffset++) {
    const fallbackMonth = currentMonth - monthOffset;
    if (fallbackMonth > 0) {
      availableMonths.push({
        month: fallbackMonth,
        year: currentYear,
        monthName: new Date(currentYear, fallbackMonth - 1, 1).toLocaleString('default', { month: 'long' })
      });
    }
  }
  
  // If we're in January, add December of previous year
  if (currentMonth === 1) {
    availableMonths.push({
      month: 12,
      year: currentYear - 1,
      monthName: 'December'
    });
  }
  
  return availableMonths;
};

// Async thunk for fetching payslip details
export const fetchPayslipDetails = createAsyncThunk(
  "payslip/fetchPayslipDetails",
  async ({ employeeId, month, year }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      // Convert month name to month number and implement n-1 logic
      const monthMap = {
        "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
        "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
      };
      
      // Get current month number and calculate n-1 month
      const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11
      const targetMonth = currentMonth - 1; // n-1 month
      
      // Try to fetch payslip for target month first
      let response = await axios.get(
        `${publicRuntimeConfig.apiURL}/api/payroll/employee/${employeeId}/payslip?year=${year}&month=${targetMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      return response.data;
      
    } catch (error) {
      // If target month fails, try previous months
      if (error.response?.status === 409) {
        try {
          const token = getItemFromSessionStorage("token", null);
          const currentMonth = new Date().getMonth() + 1;
          
          // Try previous months (n-2, n-3, etc.)
          for (let monthOffset = 2; monthOffset <= 6; monthOffset++) {
            const fallbackMonth = currentMonth - monthOffset;
            if (fallbackMonth > 0) {
              try {
                const fallbackResponse = await axios.get(
                  `${publicRuntimeConfig.apiURL}/api/payroll/employee/${employeeId}/payslip?year=${year}&month=${fallbackMonth}`,
                  {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  }
                );
                return fallbackResponse.data;
              } catch (fallbackError) {
                // Continue to next month if this one fails
                continue;
              }
            }
          }
        } catch (fallbackError) {
          // If all fallback attempts fail, return the original error
        }
      }
      
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payslip details");
    }
  }
);

// Async thunk for fetching employee details
export const fetchEmployeeDetails = createAsyncThunk(
  "payslip/fetchEmployeeDetails",
  async (employeeId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/employee/id/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch employee details");
    }
  }
);

const initialState = {
  payslipData: null,
  employeeData: null,
  loading: false,
  error: null,
};

const payslipSlice = createSlice({
  name: "payslip",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    resetPayslipState: (state) => {
      state.payslipData = null;
      state.employeeData = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payslip Details
      .addCase(fetchPayslipDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayslipDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.payslipData = action.payload;
      })
      .addCase(fetchPayslipDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Payslip Availability
      .addCase(checkPayslipAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkPayslipAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.payslipData = action.payload.available ? action.payload.data : null;
      })
      .addCase(checkPayslipAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Employee Details
      .addCase(fetchEmployeeDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployeeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.employeeData = action.payload;
      })
      .addCase(fetchEmployeeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors, resetPayslipState } = payslipSlice.actions;
export default payslipSlice.reducer; 