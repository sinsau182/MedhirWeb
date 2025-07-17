// src/store/invoiceSlice.js

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/invoices";

// 🔐 Token Helper
const getTokenOrThrow = () => {
  const token = getItemFromSessionStorage("token", null);
  if (!token) throw new Error("Authentication token not found. Please log in again.");
  return token;
};

// 📥 Fetch All Invoices
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async (_, { rejectWithValue }) => {
    try {
      const token = getTokenOrThrow();
      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || "Failed to fetch invoices");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

// ➕ Add Invoice
export const addInvoice = createAsyncThunk(
  "invoices/addInvoice",
  async (invoiceData, { rejectWithValue }) => {
    try {
      const token = getTokenOrThrow();
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(invoiceData)
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || "Failed to add invoice");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

// 🔄 Project-Customer List
export const fetchProjectCustomerList = createAsyncThunk(
  "invoices/fetchProjectCustomerList",
  async (_, { rejectWithValue }) => {
    try {
      const token = getTokenOrThrow();
      const response = await fetch(`${publicRuntimeConfig.apiURL}/leads/project-customer/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (!response.ok) return rejectWithValue(data.message || "Failed to fetch project-customer list");
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

// ✅ Invoice Slice
const invoiceSlice = createSlice({
  name: "invoices",
  initialState: {
    invoices: [],
    projectCustomerList: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetchInvoices
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addInvoice
      .addCase(addInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.invoices.push(action.payload); // Optionally update state
      })
      .addCase(addInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // fetchProjectCustomerList
      .addCase(fetchProjectCustomerList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectCustomerList.fulfilled, (state, action) => {
        state.loading = false;
        state.projectCustomerList = action.payload;
      })
      .addCase(fetchProjectCustomerList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default invoiceSlice.reducer;
