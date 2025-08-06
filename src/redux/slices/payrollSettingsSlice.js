import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

export const fetchPayrollSettings = createAsyncThunk(
    "payrollSettings/fetchPayrollSettings",
    async (companyId, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            
            const response = await fetch(`${publicRuntimeConfig.apiURL}/api/settings/payroll/company/${companyId}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        
        } catch (error) {
            return rejectWithValue(error.message || "Failed to fetch payroll settings");
        }
    }
);

const payrollSettingsSlice = createSlice({
    name: "payrollSettings",
    initialState: {
        settings: null,
        loading: false,
        error: null
    },
    reducers: {
        clearPayrollSettings: (state) => {
            state.settings = null;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPayrollSettings.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPayrollSettings.fulfilled, (state, action) => {
                state.loading = false;
                state.settings = action.payload;
            })
            .addCase(fetchPayrollSettings.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearPayrollSettings } = payrollSettingsSlice.actions;
export default payrollSettingsSlice.reducer; 