import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import getConfig from "next/config";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Async thunks

export const fetchFieldTypes = createAsyncThunk(
  "fieldTypes/fetchFieldTypes",
  async (_, { rejectWithValue, getState }) => {
    try {
      // Check if we already have field types data
      const state = getState();
      if (state.fieldTypes.fieldTypes && Object.keys(state.fieldTypes.fieldTypes).length > 0) {
        return state.fieldTypes.fieldTypes; // Return existing data
      }
      
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_BASE_URL}/api/form-builder/field-types/categorized`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch field types");
    }
  }
);

const initialState = {
  fieldTypes: {},
  loading: false,
  error: null,
};

const fieldTypesSlice = createSlice({
  name: "fieldTypes",
  initialState,
  reducers: {
    clearFieldTypes: (state) => {
      state.fieldTypes = {};
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch field types
      .addCase(fetchFieldTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFieldTypes.fulfilled, (state, action) => {
        // Transform the API response to the expected format
        const apiData = action.payload.data || {};
        const transformedData = {};
        
        // Define field type metadata
        const fieldTypeMetadata = {
          TEXT: { label: "Text Input", description: "Single line text input", icon: "📝" },
          TEXTAREA: { label: "Text Area", description: "Multi-line text input", icon: "📄" },
          NUMBER: { label: "Number", description: "Numeric input field", icon: "🔢" },
          EMAIL: { label: "Email", description: "Email address input", icon: "📧" },
          PHONE: { label: "Phone", description: "Phone number input", icon: "📞" },
          URL: { label: "URL", description: "Website URL input", icon: "🔗" },
          PASSWORD: { label: "Password", description: "Password input field", icon: "🔒" },
          HIDDEN: { label: "Hidden Field", description: "Hidden input field", icon: "👁️" },
          SECTION: { label: "Section", description: "Group fields in a section", icon: "📋" },
          DIVIDER: { label: "Divider", description: "Visual separator", icon: "➖" },
          SPACER: { label: "Spacer", description: "Add vertical space", icon: "⬜" },
          SELECT: { label: "Dropdown", description: "Single choice dropdown", icon: "📋" },
          RADIO: { label: "Radio Buttons", description: "Single choice radio buttons", icon: "🔘" },
          CHECKBOX: { label: "Checkbox", description: "Single checkbox", icon: "☑️" },
          MULTI_SELECT: { label: "Multi Select", description: "Multiple choice dropdown", icon: "📋" },
          TOGGLE: { label: "Toggle", description: "On/off toggle switch", icon: "🔘" },
          OTP: { label: "OTP", description: "One-time password input", icon: "🔐" },
          CAPTCHA: { label: "CAPTCHA", description: "CAPTCHA verification", icon: "🤖" },
          EMPLOYEE_ID: { label: "Employee ID", description: "Employee identification", icon: "👤" },
          SSN: { label: "SSN", description: "Social Security Number", icon: "🆔" },
          DATE: { label: "Date", description: "Date picker", icon: "📅" },
          TIME: { label: "Time", description: "Time picker", icon: "🕐" },
          DATETIME: { label: "Date & Time", description: "Date and time picker", icon: "📅" },
          MONTH: { label: "Month", description: "Month picker", icon: "📅" },
          WEEK: { label: "Week", description: "Week picker", icon: "📅" },
          SIGNATURE: { label: "Signature", description: "Digital signature field", icon: "✍️" },
          RATING: { label: "Rating", description: "Star rating input", icon: "⭐" },
          COLOR: { label: "Color", description: "Color picker", icon: "🎨" },
          RANGE: { label: "Range", description: "Range slider", icon: "📊" },
          FILE: { label: "File Upload", description: "File upload field", icon: "📁" },
          IMAGE: { label: "Image Upload", description: "Image upload field", icon: "🖼️" },
          ADDRESS: { label: "Address", description: "Address input field", icon: "📍" },
          COORDINATES: { label: "Coordinates", description: "GPS coordinates", icon: "🗺️" },
          LOCATION: { label: "Location", description: "Location picker", icon: "📍" },
          CURRENCY: { label: "Currency", description: "Currency input field", icon: "💰" },
          PERCENTAGE: { label: "Percentage", description: "Percentage input field", icon: "📊" }
        };
        
        // Transform each category
        Object.entries(apiData).forEach(([category, fieldTypes]) => {
          transformedData[category] = fieldTypes.map(fieldType => ({
            type: fieldType,
            label: fieldTypeMetadata[fieldType]?.label || fieldType,
            description: fieldTypeMetadata[fieldType]?.description || `Field type: ${fieldType}`,
            icon: fieldTypeMetadata[fieldType]?.icon || "📝",
            defaultLabel: fieldTypeMetadata[fieldType]?.label || fieldType,
            defaultOptions: [],
            validation: {},
            properties: {}
          }));
        });
        
        state.fieldTypes = transformedData;
        state.loading = false;
      })
      .addCase(fetchFieldTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFieldTypes } = fieldTypesSlice.actions;

// Selectors
export const selectFieldTypes = (state) => state.fieldTypes.fieldTypes;
export const selectFieldTypesLoading = (state) => state.fieldTypes.loading;
export const selectFieldTypesError = (state) => state.fieldTypes.error;

// Helper function to get field type by type name
export const selectFieldTypeByType = (state, fieldType) => {
  const allFieldTypes = state.fieldTypes.fieldTypes;
  for (const category in allFieldTypes) {
    const field = allFieldTypes[category].find(f => f.type === fieldType);
    if (field) return field;
  }
  return null;
};

// Helper function to get all field types flattened
export const selectAllFieldTypes = (state) => {
  const allFieldTypes = state.fieldTypes.fieldTypes;
  const flattened = [];
  for (const category in allFieldTypes) {
    if (Array.isArray(allFieldTypes[category])) {
      flattened.push(...allFieldTypes[category]);
    }
  }
  return flattened;
};

export default fieldTypesSlice.reducer; 