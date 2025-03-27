import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL + "/hradmin/employees";

// Fetch employees
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create employee
export const createEmployee = createAsyncThunk(
  "employees/createEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(employeeData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create employee");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update employee
export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update employee");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete employee");
      }

      return id; // Return deleted employee's ID
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const employeesSlice = createSlice({
  name: "employees",
  initialState: {
    employees: [],
    loading: false,
    err: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.err = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.err = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (e) => e._id === action.payload._id
        );
        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (e) => e._id !== action.payload
        );
      })
      .addMatcher(
        (action) => action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.err = action.payload || "Something went wrong";
        }
      );
  },
});

export default employeesSlice.reducer;
