import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL + "/expenses";

// Fetch expenses by employee ID
export const fetchExpenseByEmployeeId = createAsyncThunk(
    "expenses/fetchExpenseByEmployeeId",
    async (_, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const employee = sessionStorage.getItem("employeeId");
            const response = await fetch(`${API_BASE_URL}/employee/${employee}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to fetch expense by employee ID");
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
    

export const createExpense = createAsyncThunk(
    "expenses/createExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) {
                throw new Error("Failed to create expense");
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateExpense = createAsyncThunk(
    "expenses/updateExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}/${expenseData.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expenseData)
            });

            if (!response.ok) {
                throw new Error("Failed to update expense");
            }
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
    

export const expensesSlice = createSlice({
    name: "expenses",
    initialState: {
        expenses: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenseByEmployeeId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchExpenseByEmployeeId.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload;
            })
            .addCase(fetchExpenseByEmployeeId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
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
                state.error = action.error.message;
            })

            .addCase(updateExpense.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateExpense.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = state.expenses.map(expense => expense.id === action.payload.id ? action.payload : expense);
            })
            .addCase(updateExpense.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    }
});

export default expensesSlice.reducer;