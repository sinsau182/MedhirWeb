import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Define an async thunk for fetching companies data from your backend endpoint
export const fetchCompanies = createAsyncThunk(
  "companies/fetchCompanies",
  async () => {
    const response = await fetch("http://192.168.0.221:8080/api/companies");
    if (!response.ok) {
      throw new Error("Failed to fetch companies");
    }
    return response.json();
  }
);

const companiesSlice = createSlice({
  name: "companies",
  initialState: {
    companies: [],
    loading: false,
    error: null,
  },
  reducers: {
    // Optional: you can add sync reducers if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default companiesSlice.reducer;
