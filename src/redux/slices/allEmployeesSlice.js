import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
const {publicRuntimeConfig} = getConfig();
const API_BASE_URL = `${publicRuntimeConfig.apiURL}/hradmin`;

// Fetch all employees
export const fetchAllEmployees = createAsyncThunk(
  "employees/fetchAllEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch employees");
    }
  }
);

const allEmployeesSlice = createSlice({
    name: "employees",
    initialState: {
        employees: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchAllEmployees.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAllEmployees.fulfilled, (state, action) => {
            state.loading = false;
            state.employees = action.payload;
        })
        .addCase(fetchAllEmployees.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
    });

export const { } = allEmployeesSlice.actions;
export default allEmployeesSlice.reducer;
