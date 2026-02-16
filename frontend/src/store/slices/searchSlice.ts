// frontend/src/store/slices/searchSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { SearchState, SearchFilters } from "../../types";
import { searchAPI } from "../../services/api";

const initialState: SearchState = {
  query: "",
  results: null,
  filters: {},
  suggestions: [],
  isLoading: false,
  recentSearches: [],
  error: null,
};

export const searchTracks = createAsyncThunk(
  "search/searchTracks",
  async ({ query, filters }: { query: string; filters?: SearchFilters }) => {
    const response = await searchAPI.searchTracks(query, filters);
    return response;
  }
);

export const getSuggestions = createAsyncThunk(
  "search/getSuggestions",
  async (query: string) => {
    const response = await searchAPI.getSuggestions(query);
    return response;
  }
);

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    clearResults: (state) => {
      state.results = null;
      state.query = "";
    },
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const query = action.payload.trim();
      if (query && !state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        state.recentSearches = state.recentSearches.slice(0, 10);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchTracks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchTracks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.results = action.payload;
      })
      .addCase(searchTracks.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getSuggestions.fulfilled, (state, action) => {
        state.suggestions = action.payload;
      });
  },
});

export const { setQuery, setFilters, clearResults, addRecentSearch } =
  searchSlice.actions;
export default searchSlice.reducer;
