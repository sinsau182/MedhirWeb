import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import getConfig from "next/config";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Async thunks
export const createForm = createAsyncThunk(
  "formBuilder/createForm",
  async (formData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_BASE_URL}/api/form-builder/forms`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to create form");
    }
  }
);

export const fetchForms = createAsyncThunk(
  "formBuilder/fetchForms",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_BASE_URL}/api/form-builder/forms`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch forms");
    }
  }
);

export const fetchFormByStage = createAsyncThunk(
  "formBuilder/fetchFormByStage",
  async (stageId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_BASE_URL}/api/form-builder/forms/stage/${stageId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch form by stage");
    }
  }
);

export const submitFormData = createAsyncThunk(
  "formBuilder/submitFormData",
  async (formSubmissionData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_BASE_URL}/api/form-submissions`,
        formSubmissionData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to submit form data");
    }
  }
);

const initialState = {
  forms: [],
  loading: false,
  error: null,
  success: false,
  lastCreatedForm: null,
  currentForm: null,
  formSubmissionLoading: false,
  formSubmissionError: null,
  formSubmissionSuccess: false,
};

const formBuilderSlice = createSlice({
  name: "formBuilder",
  initialState,
  reducers: {
    clearFormBuilderState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.lastCreatedForm = null;
    },
    resetFormBuilderError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create form
      .addCase(createForm.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createForm.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastCreatedForm = action.payload.data;
        state.forms.push(action.payload.data);
        state.error = null;
      })
      .addCase(createForm.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      // Fetch forms
      .addCase(fetchForms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchForms.fulfilled, (state, action) => {
        state.loading = false;
        state.forms = action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchForms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch form by stage
      .addCase(fetchFormByStage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentForm = null;
      })
      .addCase(fetchFormByStage.fulfilled, (state, action) => {
        state.loading = false;
        state.currentForm = action.payload.data;
        state.error = null;
      })
      .addCase(fetchFormByStage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentForm = null;
      })
      // Submit form data
      .addCase(submitFormData.pending, (state) => {
        state.formSubmissionLoading = true;
        state.formSubmissionError = null;
        state.formSubmissionSuccess = false;
      })
      .addCase(submitFormData.fulfilled, (state, action) => {
        state.formSubmissionLoading = false;
        state.formSubmissionSuccess = true;
        state.formSubmissionError = null;
      })
      .addCase(submitFormData.rejected, (state, action) => {
        state.formSubmissionLoading = false;
        state.formSubmissionError = action.payload;
        state.formSubmissionSuccess = false;
      });
  },
});

export const { clearFormBuilderState, resetFormBuilderError } = formBuilderSlice.actions;

// Selectors
export const selectFormBuilder = (state) => state.formBuilder;
export const selectForms = (state) => state.formBuilder.forms;
export const selectFormBuilderLoading = (state) => state.formBuilder.loading;
export const selectFormBuilderError = (state) => state.formBuilder.error;
export const selectFormBuilderSuccess = (state) => state.formBuilder.success;
export const selectLastCreatedForm = (state) => state.formBuilder.lastCreatedForm;
export const selectCurrentForm = (state) => state.formBuilder.currentForm;
export const selectFormSubmissionLoading = (state) => state.formBuilder.formSubmissionLoading;
export const selectFormSubmissionError = (state) => state.formBuilder.formSubmissionError;
export const selectFormSubmissionSuccess = (state) => state.formBuilder.formSubmissionSuccess;

export default formBuilderSlice.reducer; 