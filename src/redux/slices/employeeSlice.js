import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "@/redux/slices/sessionStorageSlice";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL + "/hradmin";

// Fetch employees
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = localStorage.getItem("selectedCompanyId");
      const response = await fetch(`${API_BASE_URL}/companies/${company}/employees`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch employees");
      }
      return await response.json();
    } catch (error) {
      toast.error("Error fetching employees:", error);
      // return rejectWithValue(error.message);
    }
  }
);

// // Fetch all employees
// export const fetchAllEmployees = createAsyncThunk(
//   "employees/fetchAllEmployees",
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = getItemFromSessionStorage("token", null);
//       const response = await fetch(`${API_BASE_URL}/employees`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch employees");
//       }
//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

// Create employee

export const createEmployee = createAsyncThunk(
  "employee/createEmployee",
  async (formData, { rejectWithValue }) => {
    try {
      // Retrieve token from sessionStorage
      const token = getItemFromSessionStorage("token", null);

      const response = await axios.post(`${API_BASE_URL}/employees`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Attach token
        },
      });

      return response.data;
    } catch (error) {
      toast.error("Error creating employee:", error);
      // return rejectWithValue(
      //   error.response ? error.response.data : error.message
      // );
    }
  }
);

// Update employee
export const updateEmployee = createAsyncThunk(
  "employees/updateEmployee",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const company = localStorage.getItem("selectedCompanyId");

      // Create FormData object for file uploads
      const formData = new FormData();

      // Add the employee data as a JSON string
      const employeeData = updatedData.get("employee");
      formData.append("employee", employeeData);

      // Add any files that were included
      if (updatedData.has("employeeImgUrl")) {
        formData.append("employeeImgUrl", updatedData.get("employeeImgUrl"));
      }
      if (updatedData.has("aadharImgUrl")) {
        formData.append("aadharImgUrl", updatedData.get("aadharImgUrl"));
      }

      const response = await axios.put(`${API_BASE_URL}/employees/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data) {
        throw new Error("Failed to update employee");
      }

      return response.data;
    } catch (error) {
      toast.error("Error updating employee:", error);
      // return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete employee
export const deleteEmployee = createAsyncThunk(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
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
