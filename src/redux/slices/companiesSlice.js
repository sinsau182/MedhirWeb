import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL =
  publicRuntimeConfig.apiURL + "/superadmin/companies";

// Fetch companies
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      
      // If no token, redirect to login
      if (!token) {
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return rejectWithValue("Token missing. Redirecting to login.");
      }

      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
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

// Create company
export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (companyData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(API_BASE_URL + "/with-head", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(companyData),
      });

      const data = await response.json();
      
      // Explicitly check for 200 status code
      if (response.status !== 200) {
        return rejectWithValue({
          message: data.message || "Something went wrong",
          status: response.status,
          data: data
        });
      }

      // Return success response with status code
      return {
        data: data,
        status: response.status
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Network Error",
        status: 0,
        data: null
      });
    }
  }
);

// Update company
export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      console.log(updatedData);
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      
      // Explicitly check for 200 status code
      if (response.status !== 200) {
        return rejectWithValue({
          message: data.message || "Something went wrong",
          status: response.status,
          data: data
        });
      }

      // Return success response with status code
      return {
        data: data,
        status: response.status
      };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Network Error",
        status: 0,
        data: null
      });
    }
  }
);

// Delete company
export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",
  async (id, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Something went wrong"); // backend error
    }

      return id; // Return deleted company's ID
    } catch (error) {
      return rejectWithValue(error.message || "Network Error");
    }
  }
);

const companiesSlice = createSlice({
  name: "companies",
  initialState: {
    companies: [],
    loading: false,
    err: null,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    lastOperationStatus: null, // Track the last operation status
  },
  reducers: {
    clearError: (state) => {
      state.err = null;
    },
    clearOperationStatus: (state) => {
      state.lastOperationStatus = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.err = action.payload; // Use `action.payload` for custom error messages
      })
      .addCase(createCompany.pending, (state) => {
        state.createLoading = true;
        state.err = null;
        state.lastOperationStatus = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.createLoading = false;
        state.lastOperationStatus = {
          success: true,
          status: action.payload.status,
          message: "Company created successfully"
        };
        // Add the new company to the list
        state.companies.push(action.payload.data);
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.createLoading = false;
        state.lastOperationStatus = {
          success: false,
          status: action.payload?.status || 0,
          message: action.payload?.message || "Failed to create company"
        };
        state.err = action.payload?.message || "Something went wrong";
      })
      .addCase(updateCompany.pending, (state) => {
        state.updateLoading = true;
        state.err = null;
        state.lastOperationStatus = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.lastOperationStatus = {
          success: true,
          status: action.payload.status,
          message: "Company updated successfully"
        };
        // Update the company in the list
        const index = state.companies.findIndex(
          (c) => c._id === action.payload.data._id
        );
        if (index !== -1) {
          state.companies[index] = action.payload.data;
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.updateLoading = false;
        state.lastOperationStatus = {
          success: false,
          status: action.payload?.status || 0,
          message: action.payload?.message || "Failed to update company"
        };
        state.err = action.payload?.message || "Something went wrong";
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.companies = state.companies.filter(
          (c) => c._id !== action.payload
        );
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.err = action.payload?.message || action.payload || "Something went wrong";
        }
      );
  },
});

export const { clearError, clearOperationStatus } = companiesSlice.actions;
export default companiesSlice.reducer;
