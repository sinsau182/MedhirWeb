import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/vendors";

// Fetch vendors
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
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

// Add vendor
export const addVendor = createAsyncThunk(
  "vendors/addVendor",
  async (vendor, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Create a clean version of vendor data without file objects for JSON
      const cleanVendorData = { ...vendor };
      delete cleanVendorData.gstDocument;
      delete cleanVendorData.bankPassbook;
      
      formData.append('vendor', JSON.stringify(cleanVendorData));
      
      // Add GST document if it exists
      if (vendor.gstDocument) {
        formData.append('gstDocument', vendor.gstDocument);
      }
      
      // Add bank passbook if it exists
      if (vendor.bankPassbook) {
        formData.append('bankPassbook', vendor.bankPassbook);
      }
      
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Remove Content-Type header to let browser set it automatically for FormData
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

// Update vendor
export const updateVendor = createAsyncThunk(
  "vendors/updateVendor",
  async (vendor, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Create a clean version of vendor data without file objects for JSON
      const cleanVendorData = { ...vendor };
      delete cleanVendorData.gstDocument;
      delete cleanVendorData.bankPassbook;
      
      formData.append('vendor', JSON.stringify(cleanVendorData));
      
      // Add GST document if it exists
      if (vendor.gstDocument) {
        formData.append('gstDocument', vendor.gstDocument);
      }
      
      // Add bank passbook if it exists
      if (vendor.bankPassbook) {
        formData.append('bankPassbook', vendor.bankPassbook);
      }
      
      const response = await fetch(`${API_BASE_URL}/${vendor.vendorId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Remove Content-Type header to let browser set it automatically for FormData
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

// add vendorBills
export const addVendorBills = createAsyncThunk(
  "vendors/addVendorBills",
  async (vendorBills, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/bills`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorBills),
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

// update vendor credit for vendor
export const updateVendorCredit = createAsyncThunk(
  "vendors/updateVendorCredit",
  async (vendorCredit, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/${vendorCredit.vendorId}/credits`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendorCredit),
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

export const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    vendors: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchVendors.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchVendors.fulfilled, (state, action) => {
      state.loading = false;
      state.vendors = action.payload;
    });
    builder.addCase(fetchVendors.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(addVendor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addVendor.fulfilled, (state, action) => {
      state.loading = false;
      state.vendors.push(action.payload);
    });
    builder.addCase(addVendor.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
    builder.addCase(updateVendor.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateVendor.fulfilled, (state, action) => {
      state.loading = false;
      // Update the vendor in the vendors array
      const index = state.vendors.findIndex(v => v.vendorId === action.payload.vendorId);
      if (index !== -1) {
        state.vendors[index] = action.payload;
      }
    });
    builder.addCase(updateVendor.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  },
});

export default vendorSlice.reducer;