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

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Something went wrong"); // backend error
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Network Error");
        }
    }
);

// Fetch all expenses
export const fetchAllExpenses = createAsyncThunk(
    "expenses/fetchAllExpenses",
    async (_, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            console.log('Fetching all expenses from:', `${API_BASE_URL}`);
            
            const response = await fetch(`${API_BASE_URL}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            console.log('Fetch response status:', response.status);
            const data = await response.json();
            console.log('Fetched expenses:', data);

            if (!response.ok) {
                console.error('Fetch API Error:', data);
                return rejectWithValue(data.message || "Something went wrong"); // backend error
            }
            return data;
        } catch (error) {
            console.error('Fetch Network Error:', error);
            return rejectWithValue(error.message || "Network Error");
        }
    }
);

export const createExpense = createAsyncThunk(
    "expenses/createExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            console.log('Creating expense with data:', expenseData);
            console.log('API URL:', `${API_BASE_URL}`);
            
            const response = await fetch(`${API_BASE_URL}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
                body: expenseData
            });

            console.log('Response status:', response.status);
            const data = await response.json(); // always parse the response
            console.log('Response data:', data);

            if (!response.ok) {
                console.error('API Error:', data);
                return rejectWithValue(data.message || "Something went wrong"); // backend error
            }
            return data;
        } catch (error) {
            console.error('Network Error:', error);
            return rejectWithValue(error.message || "Network error");
        }
    }
);

export const updateExpense = createAsyncThunk(
    "expenses/updateExpense",
    async (expenseData, { rejectWithValue }) => {
        try {
            const token = getItemFromSessionStorage("token", null);
            const response = await fetch(`${API_BASE_URL}/employee/${expenseData.id}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(expenseData)
            });

            const data = await response.json();

            if (!response.ok) {
                return rejectWithValue(data.message || "Something went wrong"); // backend error
            }
            return data;
        } catch (error) {
            return rejectWithValue(error.message || "Network Error");
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
            .addCase(fetchAllExpenses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllExpenses.fulfilled, (state, action) => {
                state.loading = false;
                state.expenses = action.payload;
            })
            .addCase(fetchAllExpenses.rejected, (state, action) => {
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
            })
    }
});

export default expensesSlice.reducer;