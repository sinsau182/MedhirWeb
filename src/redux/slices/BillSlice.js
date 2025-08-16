import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/bills";

// Helper function to get company ID from session storage
const getCompanyId = () => {
  try {
    // Try to get from encrypted session storage first
    const encryptedCompanyId = getItemFromSessionStorage('employeeCompanyId', null);
    if (encryptedCompanyId) return encryptedCompanyId;
    
    // Fallback to direct session storage access
    if (typeof window !== 'undefined') {
      const rawCompanyId = sessionStorage.getItem('employeeCompanyId');
      if (rawCompanyId) {
        try {
          return JSON.parse(rawCompanyId);
        } catch {
          return rawCompanyId;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting company ID:', error);
    return null;
  }
};

// fetch bills
export const fetchBills = createAsyncThunk(
  "bills/fetchBills",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const companyId = getCompanyId();
      
      if (!companyId) {
        return rejectWithValue("Company ID not found");
      }
      
      const response = await fetch(`${API_BASE_URL}?companyId=${companyId}`, {
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

// fetch bills of vendor
export const fetchBillsOfVendor = createAsyncThunk(
  "vendorBills/fetchBillsOfVendor",
  async (vendorId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const companyId = getCompanyId();
      
      if (!companyId) {
        return rejectWithValue("Company ID not found");
      }
      
      const response = await fetch(`${API_BASE_URL}/vendor/${vendorId}?companyId=${companyId}`, {
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
      const companyId = getCompanyId();
      
      if (!companyId) {
        return rejectWithValue("Company ID not found");
      }
      
      const response = await fetch(`${API_BASE_URL}?companyId=${companyId}`, {
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

// update bill
export const updateBill = createAsyncThunk(
  "bills/updateBill",
  async ({ formData, billId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const companyId = getCompanyId();
      
      if (!companyId) {
        return rejectWithValue("Company ID not found");
      }
      
      const response = await fetch(`${API_BASE_URL}/${billId}?companyId=${companyId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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
    vendorBills: [],
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
    builder.addCase(fetchBillsOfVendor.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBillsOfVendor.fulfilled, (state, action) => {
      state.loading = false;
      state.vendorBills = action.payload;
    });
    builder.addCase(fetchBillsOfVendor.rejected, (state, action) => {
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
    builder.addCase(updateBill.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBill.fulfilled, (state, action) => {
      state.loading = false;
      // Update the bill in the bills array
      const index = state.bills.findIndex(b => b.billId === action.payload.billId);
      if (index !== -1) {
        state.bills[index] = action.payload;
      }
    });
    builder.addCase(updateBill.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default BillSlice.reducer;