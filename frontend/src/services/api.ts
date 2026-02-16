// frontend/src/services/api.ts
import axios from "axios";
import {
  Track,
  Crate,
  Playlist,
  LibraryStats,
  SearchFilters,
  SearchResults,
  CreateCrateData,
  CreatePlaylistData,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getApiBaseUrl = () => import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const libraryAPI = {
  getStats: () =>
    api.get<LibraryStats>("/library/stats").then((res) => res.data),
  getStreamUrl: (trackId: number) =>
    `${getApiBaseUrl()}/library/tracks/${trackId}/stream`,
  getTracks: (params?: any) =>
    api.get<Track[]>("/library/tracks", { params }).then((res) => res.data),
  scanLibrary: () => api.post("/library/scan").then((res) => res.data),
  stopScan: () => api.post("/library/scan/stop").then((res) => res.data),
  getScanProgress: () =>
    api.get("/library/scan/progress").then((res) => res.data),
  getTrack: (id: number) =>
    api.get<Track>(`/library/tracks/${id}`).then((res) => res.data),
  updateTrack: (id: number, data: Partial<Track>) =>
    api.put<Track>(`/library/tracks/${id}`, data).then((res) => res.data),
  deleteTrack: (id: number) =>
    api.delete(`/library/tracks/${id}`).then((res) => res.data),
};

export const cratesAPI = {
  getCrates: () => api.get<Crate[]>("/crates").then((res) => res.data),
  createCrate: (data: CreateCrateData) =>
    api.post<Crate>("/crates", data).then((res) => res.data),
  updateCrate: (id: number, data: Partial<Crate>) =>
    api.put<Crate>(`/crates/${id}`, data).then((res) => res.data),
  deleteCrate: (id: number) =>
    api.delete(`/crates/${id}`).then((res) => res.data),
  addTrackToCrate: (crateId: number, trackId: number) =>
    api.post(`/crates/${crateId}/tracks`, { trackId }).then((res) => res.data),
  removeTrackFromCrate: (crateId: number, trackId: number) =>
    api.delete(`/crates/${crateId}/tracks/${trackId}`).then((res) => res.data),
};

export const playlistsAPI = {
  getPlaylists: () => api.get<Playlist[]>("/playlists").then((res) => res.data),
  createPlaylist: (data: CreatePlaylistData) =>
    api.post<Playlist>("/playlists", data).then((res) => res.data),
  updatePlaylist: (id: number, data: Partial<Playlist>) =>
    api.put<Playlist>(`/playlists/${id}`, data).then((res) => res.data),
  deletePlaylist: (id: number) =>
    api.delete(`/playlists/${id}`).then((res) => res.data),
  addTrackToPlaylist: (playlistId: number, trackId: number) =>
    api
      .post(`/playlists/${playlistId}/tracks`, { trackId })
      .then((res) => res.data),
  removeTrackFromPlaylist: (playlistId: number, trackId: number) =>
    api
      .delete(`/playlists/${playlistId}/tracks/${trackId}`)
      .then((res) => res.data),
};

export const searchAPI = {
  search: (query: string, filters?: SearchFilters) =>
    api
      .get<SearchResults>("/search", { params: { q: query, ...filters } })
      .then((res) => res.data),
  searchTracks: (query: string, filters?: SearchFilters) =>
    api
      .get<SearchResults>("/search", { params: { q: query, ...filters } })
      .then((res) => res.data),
  getSuggestions: (query: string) =>
    api
      .get<string[]>("/search/suggestions", { params: { q: query } })
      .then((res) => res.data),
};

export const analyticsAPI = {
  getStats: () => api.get("/analytics").then((res) => res.data),
};

export { api };
export default api;
