// frontend/src/store/slices/playlistsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { PlaylistsState, CreatePlaylistData } from "../../types";
import { playlistsAPI } from "../../services/api";

const initialState: PlaylistsState = {
  playlists: [],
  currentPlaylist: null,
  isLoading: false,
  isCreating: false,
  error: null,
};

export const fetchPlaylists = createAsyncThunk(
  "playlists/fetchPlaylists",
  async () => {
    const response = await playlistsAPI.getPlaylists();
    return response;
  }
);

export const createPlaylist = createAsyncThunk(
  "playlists/createPlaylist",
  async (data: CreatePlaylistData) => {
    const response = await playlistsAPI.createPlaylist(data);
    return response;
  }
);

const playlistsSlice = createSlice({
  name: "playlists",
  initialState,
  reducers: {
    setCurrentPlaylist: (state, action: PayloadAction<string | null>) => {
      state.currentPlaylist = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylists.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlaylists.fulfilled, (state, action) => {
        state.isLoading = false;
        state.playlists = action.payload;
      })
      .addCase(fetchPlaylists.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch playlists";
      })
      .addCase(createPlaylist.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPlaylist.fulfilled, (state, action) => {
        state.isCreating = false;
        state.playlists.push(action.payload);
      })
      .addCase(createPlaylist.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.error.message || "Failed to create playlist";
      });
  },
});

export const { setCurrentPlaylist, clearError } = playlistsSlice.actions;

export default playlistsSlice.reducer;
