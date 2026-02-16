// frontend/src/store/slices/cratesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { Crate, CratesState, Track } from "../../types";
import { cratesAPI } from "../../services/api";

const initialState: CratesState = {
  crates: [],
  selectedCrate: null,
  isLoading: false,
  draggedTrack: null,
  error: null,
};

// Async thunks
export const fetchCrates = createAsyncThunk("crates/fetchCrates", async () => {
  const response = await cratesAPI.getCrates();
  return response;
});

const cratesSlice = createSlice({
  name: "crates",
  initialState,
  reducers: {
    setSelectedCrate: (state, action: PayloadAction<Crate | null>) => {
      state.selectedCrate = action.payload;
    },
    setDraggedTrack: (state, action: PayloadAction<Track | null>) => {
      state.draggedTrack = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCrates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.crates = action.payload;
      })
      .addCase(fetchCrates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch crates";
      });
  },
});

export const { setSelectedCrate, setDraggedTrack, clearError } =
  cratesSlice.actions;
export default cratesSlice.reducer;
