import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const getAuthHeaders = () => {
  const token = getItemFromSessionStorage("token");
  if (!token) {
    throw new Error("Authentication required. Please login.");
  }
  
  // Remove any "Bearer " prefix if it exists
  const cleanToken = token.replace("Bearer ", "");
  
  return {
    headers: {
      Authorization: `Bearer ${cleanToken}`,
      "Content-Type": "application/json",
    },
  };
};

// Thunks
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const response = await axios.get(
        "http://localhost:8083/superadmin/companies",
        headers
      );
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue("Authentication required to access this resource");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to fetch companies");
    }
  }
);

export const createCompany = createAsyncThunk(
  "companies/createCompany",
  async (companyData, { rejectWithValue }) => {
    try {
      const headers = getAuthHeaders();
      const payload = {
        ...companyData,
        _class: "com.medhir.rest.model.CompanyModel"
      };
      
      const response = await axios.post(
        "http://localhost:8083/superadmin/companies",
        payload,
        headers
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response || error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        return rejectWithValue("Authentication required to access this resource");
      }
      return rejectWithValue(error.response?.data?.message || "Failed to create company");
    }
  }
);

export const updateCompany = createAsyncThunk(
  "companies/updateCompany",
  async ({ id, updatedData }) => {
    try {
      const mongoId = id || updatedData._id;
      const payload = {
        ...updatedData,
        _class: "com.medhir.rest.model.CompanyModel"
      };
      
      const response = await axios.put(
        `http://localhost:8083/superadmin/companies/${mongoId}`,
        payload,
        getAuthHeaders()
      );
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response || error);
      throw error.response?.data?.message || "Failed to update company";
    }
  }
);

export const deleteCompany = createAsyncThunk(
  "companies/deleteCompany",
  async (id) => {
    try {
      await axios.delete(
        `http://localhost:8083/superadmin/companies/${id}`,
        getAuthHeaders()
      );
      return id;
    } catch (error) {
      console.error("API Error:", error.response || error);
      throw error.response?.data?.message || "Failed to delete company";
    }
  }
);

const companiesSlice = createSlice({
  name: "companies",
  initialState: {
    companies: [],
    loading: false,
    err: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = Array.isArray(action.payload) ? action.payload : [];
        console.log("Updated companies state:", state.companies);
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.err = action.error.message;
        console.error("Fetch companies error:", action.error);
      })
      // Create Company
      .addCase(createCompany.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.companies.push(action.payload);
        }
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.loading = false;
        state.err = action.error.message;
      })
      // Update Company
      .addCase(updateCompany.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(updateCompany.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          const index = state.companies.findIndex(
            (company) => company._id === action.payload._id
          );
          if (index !== -1) {
            state.companies[index] = action.payload;
          }
        }
      })
      .addCase(updateCompany.rejected, (state, action) => {
        state.loading = false;
        state.err = action.error.message;
      })
      // Delete Company
      .addCase(deleteCompany.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(deleteCompany.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = state.companies.filter(
          (company) => company._id !== action.payload
        );
      })
      .addCase(deleteCompany.rejected, (state, action) => {
        state.loading = false;
        state.err = action.error.message;
      });
  },
});

export default companiesSlice.reducer;
