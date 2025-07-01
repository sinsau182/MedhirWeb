import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/bills";

// fetch bills
export const fetchBills = createAsyncThunk(
  "bills/fetchBills",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Something went wrong"); // backend error
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

// add bill
export const addBill = createAsyncThunk(
  "bills/addBill",
  async (bill, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: bill,
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Something went wrong"); // backend error
      }
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

export const BillSlice = createSlice({
  name: "bills",
  initialState: {
    bills: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBills.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBills.fulfilled, (state, action) => {
      state.loading = false;
      state.bills = action.payload;
    });
    builder.addCase(fetchBills.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(addBill.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addBill.fulfilled, (state, action) => {
      state.loading = false;
      state.bills.push(action.payload);
    });
    builder.addCase(addBill.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default BillSlice.reducer;
