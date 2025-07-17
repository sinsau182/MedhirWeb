import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import axios from "axios";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_URL = publicRuntimeConfig.apiURL;
// Fetch departments for dropdown
export const fetchDepartmentsForDropdown = createAsyncThunk(
  "designation/fetchDepartments",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(`${API_URL}/departments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch departments"
      );
    }
  }
);

// Fetch all designations
export const fetchDesignations = createAsyncThunk(
  "designation/fetchDesignations",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("employeeCompanyId");
      const response = await axios.get(
        `${API_URL}/api/designations/company/${company}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch designations"
      );
    }
  }
);

// Create designation
export const createDesignation = createAsyncThunk(
  "designation/create",
  async (designationData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_URL}/api/designations`,
        designationData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to create designation"
      );
    }
  }
);

// Update designation
export const updateDesignation = createAsyncThunk(
  "designation/update",
  async ({ id, designationData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.put(
        `${API_URL}/api/designations/${id}`,
        designationData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to update designation"
      );
    }
  }
);

// Delete designation
export const deleteDesignation = createAsyncThunk(
  "designation/delete",
  async (id, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.delete(`${API_URL}/api/designations/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to delete designation"
      );
    }
  }
);

const designationSlice = createSlice({
  name: "designation",
  initialState: {
    departments: [],
    designations: [],
    loading: false,
    error: null,
    success: false,
    updateSuccess: false,
    deleteSuccess: false,
    overtimeEligible: false,
  },
  reducers: {
    resetDesignationState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch departments
      .addCase(fetchDepartmentsForDropdown.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentsForDropdown.fulfilled, (state, action) => {
        state.loading = false;
        state.departments = action.payload;
      })
      .addCase(fetchDepartmentsForDropdown.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch designations
      .addCase(fetchDesignations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDesignations.fulfilled, (state, action) => {
        state.loading = false;
        state.designations = action.payload;
      })
      .addCase(fetchDesignations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create designation
      .addCase(createDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createDesignation.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(createDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update designation
      .addCase(updateDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateDesignation.fulfilled, (state) => {
        state.loading = false;
        state.updateSuccess = true;
      })
      .addCase(updateDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete designation
      .addCase(deleteDesignation.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteDesignation.fulfilled, (state) => {
        state.loading = false;
        state.deleteSuccess = true;
      })
      .addCase(deleteDesignation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetDesignationState } = designationSlice.actions;
export default designationSlice.reducer;
