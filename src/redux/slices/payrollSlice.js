import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/payslip/generate/emp121";

// Fetch Payslips for emp123
export const fetchPayrolls = createAsyncThunk(
  "payroll/fetchPayslips",
  async (_, { rejectWithValue }) => {
    try {
      const reponse = await fetch(API_BASE_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!reponse.ok) {
        throw new Error("Failed to fetch payrolls");
      }
      const data = await reponse.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch Payslip by ID
export const fetchPayslipById = createAsyncThunk(
  "payroll/fetchPayslipById",

  async (month, year, { rejectWithValue }) => {
    try {
      const response = await fetch(
        API_BASE_URL +
          month +
          "/" +
          year,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payslip by ID");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const payrollSlice = createSlice({
  name: "payroll",
  initialState: {
    payrolls: [],
    selectedPayslip: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload;
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchPayslipById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayslipById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayslip = action.payload;
      })
      .addCase(fetchPayslipById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default payrollSlice.reducer;
