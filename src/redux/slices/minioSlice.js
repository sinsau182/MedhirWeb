import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";

// Define the base URL for Minio operations
const { publicRuntimeConfig } = getConfig();
const MINIO_BASE_URL = publicRuntimeConfig.apiURL + "/minio";

const getAuthHeaders = () => {
  const token = getItemFromSessionStorage("token", null);
  return token ? { Authorization: `Bearer ${token}` } : {};
};



// Async thunk to fetch image from Minio
export const fetchImageFromMinio = createAsyncThunk(
  "minio/fetchImage",
  async ({ url }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      console.log('Minio fetch - URL:', url);
      console.log('Minio fetch - Token:', token ? 'Token exists' : 'No token');
      console.log('Minio fetch - Token length:', token ? token.length : 0);
      console.log('Minio fetch - Endpoint:', `${MINIO_BASE_URL}/fetch-image?url=${encodeURIComponent(url)}`);

      const response = await fetch(`${MINIO_BASE_URL}/fetch-image?url=${encodeURIComponent(url)}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      console.log('Minio fetch - Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Minio fetch - Error response:', errorText);
        
        // Handle 401 authentication errors and access denied errors gracefully
        if (response.status === 401 || response.status === 403 || errorText.includes('Access Denied')) {
          console.log('Authentication failed or access denied, returning null for graceful fallback');
          return {
            originalUrl: url,
            dataUrl: null,
            blob: null,
            contentType: null,
            error: 'Authentication required or access denied'
          };
        }
        
        throw new Error(`Failed to fetch image from Minio: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      
      // Convert blob to data URL for easy use in components
      const dataUrl = URL.createObjectURL(blob);
      
      console.log('Minio fetch - Success, dataUrl created');
      
      return {
        originalUrl: url,
        dataUrl: dataUrl,
        blob: blob,
        contentType: response.headers.get('content-type') || 'image/jpeg',
      };
    } catch (error) {
      console.error('Minio fetch - Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to preload multiple images
export const preloadImages = createAsyncThunk(
  "minio/preloadImages",
  async ({ urls }, { dispatch, rejectWithValue }) => {
    try {
      const promises = urls.map(url => 
        dispatch(fetchImageFromMinio({ url })).unwrap()
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      const failed = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);
      
      return {
        successful,
        failed,
        total: urls.length,
      };
    } catch (error) {
      return rejectWithValue("Failed to preload images");
    }
  }
);

// Async thunk to clear cached images
export const clearImageCache = createAsyncThunk(
  "minio/clearCache",
  async (_, { getState }) => {
    const state = getState();
    const cachedImages = state.minio.cachedImages;
    
    // Revoke object URLs to free memory
    Object.values(cachedImages).forEach(imageData => {
      if (imageData.dataUrl) {
        URL.revokeObjectURL(imageData.dataUrl);
      }
    });
    
    return null;
  }
);

const minioSlice = createSlice({
  name: "minio",
  initialState: {
    cachedImages: {}, // Store cached images by URL
    loading: false,
    error: null,
    preloadStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    preloadProgress: 0,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearPreloadStatus: (state) => {
      state.preloadStatus = 'idle';
      state.preloadProgress = 0;
    },
    // Action to manually add an image to cache (useful for direct image URLs)
    addImageToCache: (state, action) => {
      const { url, dataUrl, blob, contentType } = action.payload;
      state.cachedImages[url] = {
        dataUrl,
        blob,
        contentType,
        timestamp: Date.now(),
      };
    },
    // Action to remove specific image from cache
    removeImageFromCache: (state, action) => {
      const url = action.payload;
      if (state.cachedImages[url]) {
        URL.revokeObjectURL(state.cachedImages[url].dataUrl);
        delete state.cachedImages[url];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch image cases
      .addCase(fetchImageFromMinio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchImageFromMinio.fulfilled, (state, action) => {
        state.loading = false;
        const { originalUrl, dataUrl, blob, contentType } = action.payload;
        state.cachedImages[originalUrl] = {
          dataUrl,
          blob,
          contentType,
          timestamp: Date.now(),
        };
      })
      .addCase(fetchImageFromMinio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Preload images cases
      .addCase(preloadImages.pending, (state) => {
        state.preloadStatus = 'loading';
        state.preloadProgress = 0;
        state.error = null;
      })
      .addCase(preloadImages.fulfilled, (state, action) => {
        state.preloadStatus = 'succeeded';
        state.preloadProgress = 100;
        // Add successfully preloaded images to cache
        action.payload.successful.forEach(imageData => {
          const { originalUrl, dataUrl, blob, contentType } = imageData;
          state.cachedImages[originalUrl] = {
            dataUrl,
            blob,
            contentType,
            timestamp: Date.now(),
          };
        });
      })
      .addCase(preloadImages.rejected, (state, action) => {
        state.preloadStatus = 'failed';
        state.error = action.payload;
      })
      // Clear cache cases
      .addCase(clearImageCache.fulfilled, (state) => {
        state.cachedImages = {};
      });
  },
});

export const { 
  clearError, 
  clearPreloadStatus, 
  addImageToCache, 
  removeImageFromCache 
} = minioSlice.actions;

// Selectors
export const selectCachedImage = (state, url) => state.minio.cachedImages[url];
export const selectIsImageCached = (state, url) => !!state.minio.cachedImages[url];
export const selectMinioLoading = (state) => state.minio.loading;
export const selectMinioError = (state) => state.minio.error;
export const selectPreloadStatus = (state) => state.minio.preloadStatus;
export const selectPreloadProgress = (state) => state.minio.preloadProgress;

export default minioSlice.reducer; 