import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunk to fetch image from Minio
export const fetchMinioImage = createAsyncThunk(
  'minio/fetchImage',
  async ({ url, token, apiURL }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${apiURL}/minio/fetch-image?url=${encodeURIComponent(url)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      // Create a blob URL for preview
      const blobUrl = URL.createObjectURL(response.data);
      return { url, blobUrl };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch image');
    }
  }
);

const minioSlice = createSlice({
  name: 'minio',
  initialState: {
    images: {}, // { [url]: blobUrl }
    loading: false,
    error: null,
  },
  reducers: {
    clearMinioImage: (state, action) => {
      const url = action.payload;
      if (state.images[url]) {
        URL.revokeObjectURL(state.images[url]);
        delete state.images[url];
      }
    },
    clearAllMinioImages: (state) => {
      Object.values(state.images).forEach(blobUrl => URL.revokeObjectURL(blobUrl));
      state.images = {};
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMinioImage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMinioImage.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.images[action.payload.url] = action.payload.blobUrl;
      })
      .addCase(fetchMinioImage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearMinioImage, clearAllMinioImages } = minioSlice.actions;
export default minioSlice.reducer; 