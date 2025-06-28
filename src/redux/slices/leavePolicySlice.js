import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { toast } from "react-toastify";
import getConfig from "next/config";
const {publicRuntimeConfig} = getConfig();
const API_URL = publicRuntimeConfig.apiURL;

export const fetchEmployeeLeavePolicy = createAsyncThunk(
  "leavePolicy/fetchEmployeeLeavePolicy",
  async (employeeId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_URL}/employee/${employeeId}/leave-policy`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      return data;
    } catch (error) {
      toast.error("Could not fetch leave policy");
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch leave policy"
      );
    }
  }
);


export const fetchLeavePolicies = createAsyncThunk(
  "leavePolicy/fetchLeavePolicies",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = sessionStorage.getItem("currentCompanyId");
      const response = await axios.get(`${API_URL}/leave-policies/company/${company}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        return rejectWithValue(
          error.response.data.message || "Failed to fetch leave policies"
        );
      }
      return rejectWithValue("Network error: Unable to fetch leave policies");
    }
  }
);

export const createLeavePolicy = createAsyncThunk(
  "leavePolicy/createLeavePolicy",
  async (policyData, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_URL}/leave-policies`,
        policyData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Fetch updated policies after successful creation
      await dispatch(fetchLeavePolicies());
      return response.data;
    } catch (error) {
      if (error.response) {
        const message = error.response.data.message;
        if (error.response.status === 409) {
          return rejectWithValue("Leave policy with this name already exists");
        }
        return rejectWithValue(message || "Failed to create leave policy");
      }
      return rejectWithValue("Network error: Unable to create leave policy");
    }
  }
);

export const updateLeavePolicy = createAsyncThunk(
  "leavePolicy/updateLeavePolicy",
  async ({ id, policyData }, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.put(
        `${API_URL}/leave-policies/${id}`,
        policyData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // After successfully updating, fetch updated list
      await dispatch(fetchLeavePolicies());
      return response.data;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        switch (error.response.status) {
          case 400:
            return rejectWithValue(
              "Invalid leave policy data. Please check all fields."
            );
          case 401:
            return rejectWithValue("Session expired. Please login again.");
          case 404:
            return rejectWithValue("Leave policy not found.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              errorData.message ||
                errorData.error ||
                "Failed to update leave policy"
            );
        }
      }
      return rejectWithValue("Network error: Unable to update leave policy");
    }
  }
);

export const deleteLeavePolicy = createAsyncThunk(
  "leavePolicy/deleteLeavePolicy",
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      await axios.delete(`${API_URL}/leave-policies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // After successfully deleting, fetch updated list
      await dispatch(fetchLeavePolicies());
      return id;
    } catch (error) {
      if (error.response) {
        const errorData = error.response.data;
        switch (error.response.status) {
          case 401:
            return rejectWithValue("Session expired. Please login again.");
          case 404:
            return rejectWithValue("Leave policy not found.");
          case 500:
            return rejectWithValue("Server error. Please try again later.");
          default:
            return rejectWithValue(
              errorData.message ||
                errorData.error ||
                "Failed to delete leave policy"
            );
        }
      }
      return rejectWithValue("Network error: Unable to delete leave policy");
    }
  }
);

const leavePolicySlice = createSlice({
  name: "leavePolicy",
  initialState: {
    loading: false,
    error: null,
    success: false,
    policies: [],
    lastUpdated: null,
    deleteSuccess: false,
    updateSuccess: false,
    employeeLeavePolicy: null,
    employeePolicyLoading: false,
    employeePolicyError: null,
  },
  reducers: {
    resetLeavePolicyState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.deleteSuccess = false;
      state.updateSuccess = false;
      state.employeeLeavePolicy = null;
      state.employeePolicyLoading = false;
      state.employeePolicyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployeeLeavePolicy.pending, (state) => {
        state.employeePolicyLoading = true;
        state.employeePolicyError = null;
      })
      .addCase(fetchEmployeeLeavePolicy.fulfilled, (state, action) => {
        state.employeePolicyLoading = false;
        state.employeeLeavePolicy = action.payload;
        state.employeePolicyError = null;
      })
      .addCase(fetchEmployeeLeavePolicy.rejected, (state, action) => {
        state.employeePolicyLoading = false;
        state.employeePolicyError = action.payload;
      })
      .addCase(fetchLeavePolicies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeavePolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.policies = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchLeavePolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLeavePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createLeavePolicy.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createLeavePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(updateLeavePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateLeavePolicy.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.updateSuccess = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateLeavePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      .addCase(deleteLeavePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteLeavePolicy.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
        state.deleteSuccess = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(deleteLeavePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.deleteSuccess = false;
      });
  },
});

export const { resetLeavePolicyState } = leavePolicySlice.actions;
export default leavePolicySlice.reducer;
