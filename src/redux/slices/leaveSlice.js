import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://192.168.0.200:8084/leaves/emp123";

// Fetch Leaves
export const fetchLeaves = createAsyncThunk(
    "leaves/fetchLeaves",
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_BASE_URL);

            if (!response.ok) {
                throw new Error("Failed to fetch leaves");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Create Leave
export const createLeave = createAsyncThunk(
    "leaves/createLeave",
    async (leaveData, { rejectWithValue }) => {
        try {
            const response = await fetch("http://localhost:8080/api/v1/leaves", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(leaveData),
            });

            if (!response.ok) {
                throw new Error("Failed to create leave");
            }
            const data = await response.json();
            console.log("Created Leave:", data);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Update Leave
export const updateLeave = createAsyncThunk(
    "leaves/updateLeave",
    async ({ id, leaveData }, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/leaves/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(leaveData),
            });

            if (!response.ok) {
                throw new Error("Failed to update leave");
            }
            const data = await response.json();
            console.log("Updated Leave:", data);
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Delete Leave
export const deleteLeave = createAsyncThunk(
    "leaves/deleteLeave",
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/leaves/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete leave");
            }
            console.log("Deleted Leave ID:", id);
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Leave Slice
const leaveSlice = createSlice({
    name: "leaves",
    initialState: {
        leaves: [],
        loading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchLeaves.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload;
            })
            .addCase(fetchLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createLeave.fulfilled, (state, action) => {
                state.leaves.push(action.payload);
            })
            .addCase(updateLeave.fulfilled, (state, action) => {
                const index = state.leaves.findIndex((leave) => leave.id === action.payload.id);
                if (index !== -1) {
                    state.leaves[index] = action.payload;
                }
            })
            .addCase(deleteLeave.fulfilled, (state, action) => {
                state.leaves = state.leaves.filter((leave) => leave.id !== action.payload);
            });
    },
});

export default leaveSlice.reducer;
