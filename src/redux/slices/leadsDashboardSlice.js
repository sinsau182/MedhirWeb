import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
import axios from 'axios';
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;
import { jwtDecode } from "jwt-decode";

export const fetchDashboard = createAsyncThunk(
    'dashboard/fetchDashboard',
    async (params, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token");
            const companyId = sessionStorage.getItem("employeeCompanyId");
            const decodedToken = jwtDecode(token);
            const roles = decodedToken.roles;

            if (roles.includes("MANAGER")) {
                const response = await axios.get(`${API_BASE_URL}/leads/dashboard/${companyId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                });
                return response.data;
            } else {
                const response = await axios.get(`${API_BASE_URL}/leads/dashboard/${companyId}?salesRep=${params.employeeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return response.data;
            }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
        }
    }
);

const leadsDashboardSlice = createSlice({
    name: "leadsDashboard",
    initialState: {
        dashboard: {},
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboard.fulfilled, (state, action) => {
                state.dashboard = action.payload;
            })
            .addCase(fetchDashboard.pending, (state) => {
                state.loading = true;
                state.dashboard = {};
                state.error = null;
            })
            .addCase(fetchDashboard.rejected, (state, action) => {
                state.loading = false;
                state.dashboard = {};
                state.error = action.payload || action.error.message;
            })
    }
});

export default leadsDashboardSlice.reducer;