import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://192.168.0.200:8084/payroll/expenses/emp123";

// Fetch employees
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(API_BASE_URL);

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create employee
export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create expense");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Update employee
export const updateExpense = createAsyncThunk(
  "expense/updateExpense",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update expense");
      }

      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete expense
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice

const expenseSlice = createSlice({
    name: "expenses",
    initialState: {
        expenses: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(fetchExpenses.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchExpenses.fulfilled, (state, action) => {
            state.loading = false;
            state.expenses = action.payload;
        })
        .addCase(fetchExpenses.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(createExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(createExpense.fulfilled, (state, action) => {
            state.loading = false;
            state.expenses.push(action.payload);
        })
        .addCase(createExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(updateExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateExpense.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.expenses.findIndex((expense) => expense.id === action.payload.id);
            if (index !== -1) {
            state.expenses[index] = action.payload;
            }
        })
        .addCase(updateExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        })
        .addCase(deleteExpense.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteExpense.fulfilled, (state, action) => {
            state.loading = false;
            const index = state.expenses.findIndex((expense) => expense.id === action.payload);
            if (index !== -1) {
            state.expenses.splice(index, 1);
            }
        })
        .addCase(deleteExpense.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
    });

export default expenseSlice.reducer;
