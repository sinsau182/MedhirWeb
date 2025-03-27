import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchModules } from "./modulesSlice";
import { fetchUsers, addUser } from "./usersSlice";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/superadmin/modules";

// Fetch modules
export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch modules");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add module
export const addModule = createAsyncThunk(
  "modules/addModule",
  async (moduleData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(moduleData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to add module");
      }
      
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const moduleSlice = createSlice({
  name: "modules",
  initialState: {
    modules: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchModules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModules.fulfilled, (state, action) => {
        state.loading = false;
        state.modules = action.payload;
      })
      .addCase(fetchModules.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addModule.fulfilled, (state, action) => {
        state.modules.push(action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload || "Something went wrong";
        }
      );
  },
});

export default moduleSlice.reducer;
