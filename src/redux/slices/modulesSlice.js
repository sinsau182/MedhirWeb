import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import { fetchModules } from "./modulesSlice";
import { fetchUsers, addUser } from "./usersSlice";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";

const API_BASE_URL = "http://localhost:8083/superadmin/modules";

// Update HR API URL to use the correct protocol
const HR_API_BASE_URL = "http://localhost:8083";
const HR_EMPLOYEES_ENDPOINT = `${HR_API_BASE_URL}/employees/minimal`;

// Fetch modules
export const fetchModules = createAsyncThunk(
  "modules/fetchModules",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
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

// Fetch employees
export const fetchEmployees = createAsyncThunk(
  "modules/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      // Get the HR admin token instead of superadmin token
      const token = getItemFromSessionStorage("token");
      console.log("Fetching employees from:", HR_EMPLOYEES_ENDPOINT);
      
      const response = await fetch(HR_EMPLOYEES_ENDPOINT, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      
      if (!response.ok) {
        if (response.status === 403) {
          // If forbidden, try without token (if the API allows public access)
          const publicResponse = await fetch(HR_EMPLOYEES_ENDPOINT, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          });
          
          if (!publicResponse.ok) {
            throw new Error("You don't have permission to access employee data. Please contact your administrator.");
          }
          
          const publicData = await publicResponse.json();
          return Array.isArray(publicData) ? publicData : [publicData];
        }
        
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(
          typeof errorData === 'string' 
            ? errorData 
            : JSON.parse(errorData).message || "Failed to fetch employees"
        );
      }

      const data = await response.json();
      console.log("Employees data:", data);
      
      // Handle both array and single object responses
      const employees = Array.isArray(data) ? data : [data];
      return employees;

    } catch (error) {
      console.error("Error fetching employees:", error);
      return rejectWithValue(error.message);
    }
  }
);

// Add module
export const addModule = createAsyncThunk(
  "modules/addModule",
  async (moduleData, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      console.log("Creating module with data:", moduleData);
      
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          moduleName: moduleData.moduleName,
          description: moduleData.description,
          employeeIds: moduleData.employeeIds,
          companyId: moduleData.companyId
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Error response:", errorData);
        throw new Error(errorData || "Failed to add module");
      }

      const data = await response.json();
      console.log("Module created successfully:", data);
      return data;
    } catch (error) {
      console.error("Error creating module:", error);
      return rejectWithValue(error.message);
    }
  }
);

const moduleSlice = createSlice({
  name: "modules",
  initialState: {
    modules: [],
    employees: [],
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
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
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
