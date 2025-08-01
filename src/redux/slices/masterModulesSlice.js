import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = `${publicRuntimeConfig.apiURL}/api/master-modules`;

// Fetch master modules
export const fetchMasterModules = createAsyncThunk(
  "masterModules/fetchMasterModules",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);

      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return data.modules || data || []; // Handle both {modules: [...]} and direct array, fallback to empty array
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const masterModulesSlice = createSlice({
  name: "masterModules",
  initialState: {
    modules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMasterModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchMasterModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default masterModulesSlice.reducer; 