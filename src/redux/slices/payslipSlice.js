import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

// Async thunk for fetching payslip details
export const fetchPayslipDetails = createAsyncThunk(
  "payslip/fetchPayslipDetails",
  async ({ employeeId, month, year }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/payslip/generate/${employeeId}/${month}/${year}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/employee/id/${employeeId}`,
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