import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE_URL = "http://192.168.0.200:8084/leaves";

// Fetch Leaves
export const fetchLeaves = createAsyncThunk(
    "leaves/fetchLeaves",
    async (employeeId, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_BASE_URL}/${employeeId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to fetch leaves");
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
            const token = localStorage.getItem("token");
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(leaveData),
            });

            // Read the response body only once
            const responseText = await response.text();
            
            if (!response.ok) {
                // Try to parse as JSON if it looks like JSON
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(errorData.message || "Failed to create leave");
                } catch (jsonError) {
                    // If not JSON, use the text response
                    throw new Error(responseText || "Failed to create leave");
                }
            }

            // Try to parse as JSON if it looks like JSON
            try {
                return JSON.parse(responseText);
            } catch (jsonError) {
                // If not JSON, return the text response
                return { message: responseText };
            }
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

const initialState = {
    leaves: [],
    loading: false,
    error: null,
    submissionStatus: null,
    submissionError: null,
};

// Leave Slice
const leaveSlice = createSlice({
    name: "leaves",
    initialState,
    reducers: {
        clearSubmissionStatus: (state) => {
            state.submissionStatus = null;
            state.submissionError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Leaves
            .addCase(fetchLeaves.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchLeaves.fulfilled, (state, action) => {
                state.loading = false;
                state.leaves = action.payload;
            })
            .addCase(fetchLeaves.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Leave
            .addCase(createLeave.pending, (state) => {
                state.loading = true;
                state.submissionStatus = null;
                state.submissionError = null;
            })
            .addCase(createLeave.fulfilled, (state, action) => {
                state.loading = false;
                state.submissionStatus = "success";
                state.leaves.push(action.payload);
            })
            .addCase(createLeave.rejected, (state, action) => {
                state.loading = false;
                state.submissionStatus = "error";
                state.submissionError = action.payload;
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

export const { clearSubmissionStatus } = leaveSlice.actions;
export default leaveSlice.reducer;
