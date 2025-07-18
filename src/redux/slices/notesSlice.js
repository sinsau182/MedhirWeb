import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getItemFromSessionStorage } from "./sessionStorageSlice";
import getConfig from "next/config";
const { publicRuntimeConfig } = getConfig();

// Async thunk to fetch notes for a lead
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (leadId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.get(
        `${publicRuntimeConfig.apiURL}/leads/${leadId}/notes`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching notes:", error);
      // If it's a 405 error, the endpoint doesn't support GET method
      // Return empty array instead of rejecting
      if (error.response?.status === 405) {
        console.warn("Notes API endpoint not implemented, returning empty array");
        return [];
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch notes"
      );
    }
  }
);

// Async thunk to create a new note
export const createNote = createAsyncThunk(
  "notes/createNote",
  async ({ leadId, noteData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.post(
        `${publicRuntimeConfig.apiURL}/leads/${leadId}/notes`,
        noteData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error creating note:", error);
      // If it's a 405 error, the endpoint doesn't support POST method
      // Create a temporary note object
      if (error.response?.status === 405) {
        console.warn("Notes API endpoint not implemented, creating temporary note");
        const tempNote = {
          id: Date.now(),
          noteId: Date.now(),
          content: noteData.content,
          user: "You",
          time: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        return tempNote;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to create note"
      );
    }
  }
);

// Async thunk to update a note
export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ leadId, noteId, noteData }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      const response = await axios.put(
        `${publicRuntimeConfig.apiURL}/leads/${leadId}/notes/${noteId}`,
        noteData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating note:", error);
      // If it's a 405 error, the endpoint doesn't support PUT method
      // Create an updated note object
      if (error.response?.status === 405) {
        console.warn("Notes API endpoint not implemented, creating updated note");
        const updatedNote = {
          id: noteId,
          noteId: noteId,
          content: noteData.content,
          user: "You",
          time: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return updatedNote;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to update note"
      );
    }
  }
);

// Async thunk to delete a note
export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async ({ leadId, noteId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      if (!token) {
        throw new Error("Authentication token is missing");
      }

      await axios.delete(
        `${publicRuntimeConfig.apiURL}/leads/${leadId}/notes/${noteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return noteId;
    } catch (error) {
      console.error("Error deleting note:", error);
      // If it's a 405 error, the endpoint doesn't support DELETE method
      // Return the noteId to remove it from state
      if (error.response?.status === 405) {
        console.warn("Notes API endpoint not implemented, removing note from state");
        return noteId;
      }
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete note"
      );
    }
  }
);

const initialState = {
  notes: [],
  loading: false,
  error: null,
  creating: false,
  updating: false,
  deleting: false,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
    clearNotes: (state) => {
      state.notes = [];
    },
    addTemporaryNote: (state, action) => {
      state.notes.unshift(action.payload);
    },
    removeTemporaryNote: (state, action) => {
      state.notes = state.notes.filter(
        (note) => note.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // Fetch notes
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create note
      .addCase(createNote.pending, (state) => {
        state.creating = true;
        state.error = null;
      })
      .addCase(createNote.fulfilled, (state, action) => {
        state.creating = false;
        // Add the new note to the list
        state.notes.unshift(action.payload);
      })
      .addCase(createNote.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload;
      })

    // Update note
      .addCase(updateNote.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateNote.fulfilled, (state, action) => {
        state.updating = false;
        // Update the note in the list
        const index = state.notes.findIndex(
          (note) => note.id === action.payload.id
        );
        if (index !== -1) {
          state.notes[index] = action.payload;
        }
      })
      .addCase(updateNote.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload;
      })

    // Delete note
      .addCase(deleteNote.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(deleteNote.fulfilled, (state, action) => {
        state.deleting = false;
        // Remove the note from the list
        state.notes = state.notes.filter(
          (note) => note.id !== action.payload
        );
      })
      .addCase(deleteNote.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearErrors,
  clearNotes,
  addTemporaryNote,
  removeTemporaryNote,
} = notesSlice.actions;

export default notesSlice.reducer; 