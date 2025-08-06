//// id formatting  slice
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getItemFromSessionStorage } from './sessionStorageSlice';
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

const API_BASE = publicRuntimeConfig.apiURL + "/api/asset-settings/id-formatting";
const GENERATE_API = publicRuntimeConfig.apiURL + "/api/asset-settings/generate-asset-id";

// Fetch ID formatting for all categories
export const fetchIdFormattings = createAsyncThunk(
  'idFormatting/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(API_BASE, { headers });

      const data = response.data?.data || response.data;
      
      // Convert array to object with categoryId as key for easier access
      const formattingsByCategory = {};
      if (Array.isArray(data)) {
        data.forEach(format => {
          formattingsByCategory[format.categoryId] = format;
        });
      }

      return formattingsByCategory;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ID formattings');
    }
  }
);

// Fetch ID formatting for specific category
export const fetchIdFormattingByCategory = createAsyncThunk(
  'idFormatting/fetchByCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${API_BASE}/category/${categoryId}`, { headers });

      const data = response.data?.data || response.data;
      return { categoryId, formatting: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ID formatting');
    }
  }
);

// Add a new ID formatting
export const addIdFormatting = createAsyncThunk(
  'idFormatting/add',
  async (formattingData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(API_BASE, formattingData, { headers });

      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add ID formatting');
    }
  }
);

// Update ID formatting for a category
export const updateIdFormatting = createAsyncThunk(
  'idFormatting/update',
  async ({ categoryId, formattingData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.patch(`${API_BASE}/category/${categoryId}`, formattingData, { headers });

      const data = response.data?.data || response.data;
      return { categoryId, formatting: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update ID formatting');
    }
  }
);

// Delete ID formatting for a category
export const deleteIdFormatting = createAsyncThunk(
  'idFormatting/delete',
  async (categoryId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${API_BASE}/category/${categoryId}`, { headers });

      return categoryId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete ID formatting');
    }
  }
);

// Preview next asset ID
export const previewNextAssetId = createAsyncThunk(
  'idFormatting/previewNextId',
  async ({ categoryId, subCategoryId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let url = `${API_BASE}/preview/${categoryId}`;
      if (subCategoryId) {
        url += `?subCategoryId=${subCategoryId}`;
      }

      const response = await axios.get(url, { headers });

      const data = response.data?.data || response.data;
      return { categoryId, subCategoryId, preview: data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to preview asset ID');
    }
  }
);

// Generate next asset ID
export const generateAssetId = createAsyncThunk(
  'idFormatting/generateId',
  async ({ categoryId, subCategoryId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage('token', null);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.post(GENERATE_API, {
        categoryId,
        subCategoryId
      }, { headers });

      const data = response.data?.data || response.data;
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate asset ID');
    }
  }
);

const idFormattingSlice = createSlice({
  name: 'idFormatting',
  initialState: {
    formattingsByCategory: {}, // Object with categoryId as key
    loading: false,
    error: null,
    previewing: false,
    generating: false,
    lastGenerated: null,
    previewData: {},
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPreview: (state) => {
      state.previewData = {};
    },
    clearLastGenerated: (state) => {
      state.lastGenerated = null;
    },
    // Local state management for ID formatting
    updateFormattingLocal: (state, action) => {
      const { categoryId, field, value } = action.payload;
      if (state.formattingsByCategory[categoryId]) {
        state.formattingsByCategory[categoryId][field] = value;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all ID formattings
      .addCase(fetchIdFormattings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdFormattings.fulfilled, (state, action) => {
        state.loading = false;
        state.formattingsByCategory = action.payload;
      })
      .addCase(fetchIdFormattings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch by category
      .addCase(fetchIdFormattingByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIdFormattingByCategory.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, formatting } = action.payload;
        state.formattingsByCategory[categoryId] = formatting;
      })
      .addCase(fetchIdFormattingByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Add ID formatting
      .addCase(addIdFormatting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addIdFormatting.fulfilled, (state, action) => {
        state.loading = false;
        const formatting = action.payload;
        state.formattingsByCategory[formatting.categoryId] = formatting;
      })
      .addCase(addIdFormatting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update ID formatting
      .addCase(updateIdFormatting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIdFormatting.fulfilled, (state, action) => {
        state.loading = false;
        const { categoryId, formatting } = action.payload;
        state.formattingsByCategory[categoryId] = formatting;
      })
      .addCase(updateIdFormatting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete ID formatting
      .addCase(deleteIdFormatting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIdFormatting.fulfilled, (state, action) => {
        state.loading = false;
        delete state.formattingsByCategory[action.payload];
      })
      .addCase(deleteIdFormatting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Preview next asset ID
      .addCase(previewNextAssetId.pending, (state) => {
        state.previewing = true;
        state.error = null;
      })
      .addCase(previewNextAssetId.fulfilled, (state, action) => {
        state.previewing = false;
        const { categoryId, subCategoryId, preview } = action.payload;
        const key = subCategoryId ? `${categoryId}-${subCategoryId}` : categoryId;
        state.previewData[key] = preview;
      })
      .addCase(previewNextAssetId.rejected, (state, action) => {
        state.previewing = false;
        state.error = action.payload;
      })
      
      // Generate asset ID
      .addCase(generateAssetId.pending, (state) => {
        state.generating = true;
        state.error = null;
      })
      .addCase(generateAssetId.fulfilled, (state, action) => {
        state.generating = false;
        state.lastGenerated = action.payload;
      })
      .addCase(generateAssetId.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearPreview, 
  clearLastGenerated, 
  updateFormattingLocal 
} = idFormattingSlice.actions;

export default idFormattingSlice.reducer; 