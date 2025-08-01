import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
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
      return rejectWithValue(error.response?.data?.message || "An error occurred");
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
      return rejectWithValue(error.response?.data?.message || "An error occurred");
    }
  }
);

const initialState = {
  payroll: null,
  loading: false,
  error: null,
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(generatePayroll.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generatePayroll.fulfilled, (state, action) => {
      state.payroll = action.payload;
      state.loading = false;
    });
    builder.addCase(generatePayroll.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
    builder.addCase(getPayroll.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getPayroll.fulfilled, (state, action) => {
      state.payroll = action.payload;
      state.loading = false;
    });
    builder.addCase(getPayroll.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });
  },
});

export default payrollSlice.reducer;