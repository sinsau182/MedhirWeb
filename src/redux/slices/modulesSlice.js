import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const getAuthHeaders = () => {
  const token = getItemFromSessionStorage("token");
  if (!token) {
    throw new Error("Authentication required. Please login.");
  }
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// Thunks
export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        "http://localhost:8083/superadmin/modules",
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch modules");
    }
  }
);

export const addModule = createAsyncThunk(
  "modules/addModule",
  async (moduleData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "http://localhost:8083/superadmin/modules",
        moduleData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add module");
    }
  }
);

export const updateModule = createAsyncThunk(
  "modules/updateModule",
  async ({ id, ...updateData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(
        `http://localhost:8083/superadmin/modules/${id}`,
        updateData,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update module");
    }
  }
);

export const deleteModule = createAsyncThunk(
  "modules/deleteModule",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(
        `http://localhost:8083/superadmin/modules/${id}`,
        getAuthHeaders()
      );
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete module");
    }
  }
);

const modulesSlice = createSlice({
  name: "modules",
  initialState: {
    modules: [],
    loading: false,
    err: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Modules
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
        state.err = null;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.err = action.payload;
      })
      // Add Module
      .addCase(addModule.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(addModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules.push(action.payload);
        state.err = null;
      })
      .addCase(addModule.rejected, (state, action) => {
        state.loading = false;
        state.err = action.payload;
      })
      // Update Module
      .addCase(updateModule.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(updateModule.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.modules.findIndex(module => module._id === action.payload._id);
        if (index !== -1) {
          state.modules[index] = action.payload;
        }
        state.err = null;
      })
      .addCase(updateModule.rejected, (state, action) => {
        state.loading = false;
        state.err = action.payload;
      })
      // Delete Module
      .addCase(deleteModule.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(deleteModule.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = state.modules.filter(module => module._id !== action.payload);
        state.err = null;
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.loading = false;
        state.err = action.payload;
      });
  },
});

export default modulesSlice.reducer;
