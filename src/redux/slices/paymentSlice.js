import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/payments";

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

// fetch payments
export const fetchPayments = createAsyncThunk(
    "payments/fetchPayments",
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
            return rejectWithValue(data.message || "Something went wrong");
        }
        return data;
        } catch (error) {
        return rejectWithValue(error.message || "Network Error");
        }
    }
    );

// fetch payments of vendor
export const fetchPaymentsOfVendor = createAsyncThunk(
    "vendorPayments/fetchPaymentsOfVendor",
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
            return rejectWithValue(data.message || "Something went wrong");
        }
        return data;
        } catch (error) {
        return rejectWithValue(error.message || "Network Error");
        }
    }
);

// add payment
export const addPayment = createAsyncThunk(
    "payments/addPayment",
    async (payment, { rejectWithValue }) => {
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
            body: payment,
        });
        const data = await response.json();
        if (!response.ok) {
            return rejectWithValue(data.message || "Something went wrong");
        }
        return data;
        } catch (error) {
        return rejectWithValue(error.message || "Network Error");
        }
    }
);

// update payment
export const updatePayment = createAsyncThunk(
    "payments/updatePayment",
    async ({ paymentId, payment }, { rejectWithValue }) => {
        try {
        const token = getItemFromSessionStorage("token", null);
        const companyId = getCompanyId();
        
        if (!companyId) {
          return rejectWithValue("Company ID not found");
        }
        
        const response = await fetch(`${API_BASE_URL}/${paymentId}?companyId=${companyId}`, {
            method: "PUT",
            headers: {
            Authorization: `Bearer ${token}`,
            },
            body: payment,
        });
        const data = await response.json();
        if (!response.ok) {
            return rejectWithValue(data.message || "Something went wrong");
        }
        return data;
        } catch (error) {
        return rejectWithValue(error.message || "Network Error");
        }
    }
);

const paymentSlice = createSlice({
    name: "payments",
    initialState: {
        payments: [],
        vendorPayments: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchPayments.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPayments.fulfilled, (state, action) => {
            state.loading = false;
            state.payments = action.payload;
        });
        builder.addCase(fetchPayments.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(fetchPaymentsOfVendor.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchPaymentsOfVendor.fulfilled, (state, action) => {
            state.loading = false;
            state.vendorPayments = action.payload;
        });
        builder.addCase(fetchPaymentsOfVendor.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(addPayment.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(addPayment.fulfilled, (state, action) => {
            state.loading = false;
            state.payments.push(action.payload);
        });
        builder.addCase(addPayment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(updatePayment.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updatePayment.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.payments.findIndex(p => p.id === action.payload.id);
            if (index !== -1) {
                state.payments[index] = action.payload;
            }
        });
        builder.addCase(updatePayment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default paymentSlice.reducer;