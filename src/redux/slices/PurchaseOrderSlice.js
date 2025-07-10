import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/purchase-orders";

// fetch purchase orders
export const fetchPurchaseOrders = createAsyncThunk(
    "purchase-orders/fetchPurchaseOrders",
    async (_, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message);
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

// create purchase order
export const createPurchaseOrder = createAsyncThunk(
    "purchase-orders/createPurchaseOrder",
    async (purchaseOrder, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: purchaseOrder,
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message);
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);


export const purchaseOrderSlice = createSlice({
    name: "purchase-orders",
    initialState: {
        purchaseOrders: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPurchaseOrders.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(fetchPurchaseOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.purchaseOrders = action.payload;
        });
        builder.addCase(fetchPurchaseOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        builder.addCase(createPurchaseOrder.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(createPurchaseOrder.fulfilled, (state, action) => {
            state.loading = false;
            state.purchaseOrders.push(action.payload);
        });
        builder.addCase(createPurchaseOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export default purchaseOrderSlice.reducer;