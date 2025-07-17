import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/payments";

// fetch payments
export const fetchPayments = createAsyncThunk(
    "payments/fetchPayments",
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
        const response = await fetch(`${API_BASE_URL}/vendor/${vendorId}`, {
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
        const response = await fetch(`${API_BASE_URL}`, {
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
    },
});

export default paymentSlice.reducer;