import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import getConfig from "next/config";
import { getItemFromSessionStorage } from "./sessionStorageSlice";

const { publicRuntimeConfig } = getConfig();
const API_BASE_URL = publicRuntimeConfig.apiURL;

// Async thunks
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async (leadId, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.get(
        `${API_BASE_URL}/leads/${leadId}/notes`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, notes: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch notes");
    }
  }
);

export const addNote = createAsyncThunk(
  "notes/addNote",
  async ({ leadId, content }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.post(
        `${API_BASE_URL}/leads/${leadId}/notes`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, note: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to add note");
    }
  }
);

export const updateNote = createAsyncThunk(
  "notes/updateNote",
  async ({ leadId, noteId, content }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      const response = await axios.put(
        `${API_BASE_URL}/leads/${leadId}/notes/${noteId}`,
        { content },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, note: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to update note");
    }
  }
);

export const deleteNote = createAsyncThunk(
  "notes/deleteNote",
  async ({ leadId, noteId }, { rejectWithValue }) => {
    try {
      const token = getItemFromSessionStorage("token", null);
      await axios.delete(
        `${API_BASE_URL}/leads/${leadId}/notes/${noteId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { leadId, noteId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete note");
    }
  }
);

const initialState = {
  notesByLead: {}, // { leadId: [notes] }
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {
    clearNotes: (state, action) => {
      const leadId = action.payload;
      if (leadId) {
        delete state.notesByLead[leadId];
      } else {
        state.notesByLead = {};
      }
    },
    addLocalNote: (state, action) => {
      const { leadId, note } = action.payload;
      if (!state.notesByLead[leadId]) {
        state.notesByLead[leadId] = [];
      }
      state.notesByLead[leadId].unshift(note);
    },
    updateLocalNote: (state, action) => {
      const { leadId, note } = action.payload;
      if (state.notesByLead[leadId]) {
        const index = state.notesByLead[leadId].findIndex(
          (n) => n.noteId === note.noteId || n.id === note.id
        );
        if (index !== -1) {
          state.notesByLead[leadId][index] = note;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notes
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        const { leadId, notes } = action.payload;
        state.notesByLead[leadId] = notes;
        state.loading = false;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add note
      .addCase(addNote.fulfilled, (state, action) => {
        const { leadId, note } = action.payload;
        if (!state.notesByLead[leadId]) {
          state.notesByLead[leadId] = [];
        }
        state.notesByLead[leadId].unshift(note);
      })
      // Update note
      .addCase(updateNote.fulfilled, (state, action) => {
        const { leadId, note } = action.payload;
        if (state.notesByLead[leadId]) {
          const index = state.notesByLead[leadId].findIndex(
            (n) => n.noteId === note.noteId || n.id === note.id
          );
          if (index !== -1) {
            state.notesByLead[leadId][index] = note;
          }
        }
      })
      // Delete note
      .addCase(deleteNote.fulfilled, (state, action) => {
        const { leadId, noteId } = action.payload;
        if (state.notesByLead[leadId]) {
          state.notesByLead[leadId] = state.notesByLead[leadId].filter(
            (n) => n.noteId !== noteId && n.id !== noteId
          );
        }
      });
  },
});

export const { clearNotes, addLocalNote, updateLocalNote } = notesSlice.actions;

// Selectors
export const selectNotesByLead = (state, leadId) => 
  state.notes.notesByLead[leadId] || [];

export const selectNotesLoading = (state) => state.notes.loading;
export const selectNotesError = (state) => state.notes.error;

export default notesSlice.reducer; 