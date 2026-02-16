// frontend/src/types/index.ts

export type Era = "70s" | "80s" | "90s" | "2000s" | "2010s" | "2020s";
export type AnalysisSource = "metadata" | "aubio" | "essentia" | "manual" | "pending";
export type AnalysisStatus = "pending" | "analyzing" | "complete" | "failed";

export interface Track {
  id: number;
  file_path: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  label?: string;
  remixer?: string;
  composer?: string;
  year?: number;
  duration: number;
  bitrate?: number;
  sample_rate?: number;
  file_size: number;
  bpm: number;
  bpm_locked: boolean;
  bpm_confidence: number;
  bpm_source: AnalysisSource;
  key_signature: string;
  key_locked: boolean;
  key_confidence: number;
  key_source: AnalysisSource;
  energy_level: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  tempo_stability: number;
  dynamic_range: number;
  intro_time: number;
  outro_time: number;
  explicit_content: boolean;
  language?: string;
  mood?: string;
  mood_tags?: string; // JSON array of mood strings
  genre_tags?: string; // JSON array of genre strings
  era?: Era;
  color?: string;
  rating: number;
  play_count: number;
  skip_count: number;
  last_played?: string; // Date as string
  date_added: string; // Date as string
  file_hash: string;
  analysis_status: AnalysisStatus;
  analysis_version?: string;
  needs_reanalysis: boolean;
  serato_id?: string;
  beatgrid?: string;
  cue_points?: string;
  loops?: string;
  waveform_overview?: string;
  waveform_detail?: string;
  artwork_path?: string;
  comment?: string;
  grouping?: string;
  folder_path?: string;
  created_at: string;
  updated_at: string;
}

export interface Crate {
  id: number;
  name: string;
  type: string;
  description?: string;
  color?: string;
  icon?: string;
  is_smart: boolean;
  is_folder: boolean;
  parent_id?: number;
  sort_order: number;
  criteria?: string;
  serato_crate_path?: string;
  track_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  total_duration: number;
  avg_bpm: number;
  energy_curve?: string;
  harmonic_flow_score: number;
  transition_quality: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface LibraryStats {
  totalTracks: { count: number }[];
  totalDuration: { total: number }[];
  totalSize: { total: number }[];
  avgBPM: { avg: number }[];
  genreBreakdown: { genre: string; count: number }[];
  energyBreakdown: { energy_level: number; count: number }[];
  keyBreakdown: { key_signature: string; count: number }[];
  recentlyAdded: { count: number }[];
  topRated: { count: number }[];
  explicitCount: { count: number }[];
}

export interface SearchFilters {
  genre?: string;
  energyLevel?: number;
  bpmMin?: number;
  bpmMax?: number;
  key?: string;
  yearMin?: number;
  yearMax?: number;
  rating?: number;
  explicit?: boolean;
  language?: string;
  mood?: string;
  durationMin?: number;
  durationMax?: number;
  sortBy?: string;
  limit?: number;
}

export interface SearchResults {
  tracks: Track[];
  crates: Crate[];
  playlists: Playlist[];
}

export interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  activeTab: string;
  modals: {
    trackInfo: boolean;
    createCrate: boolean;
    createPlaylist: boolean;
    settings: boolean;
  };
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title?: string;
  message: string;
  duration?: number;
  timestamp?: string;
}

export interface AuthState {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface CratesState {
  crates: Crate[];
  selectedCrate: Crate | null;
  isLoading: boolean;
  draggedTrack: Track | null;
  error: string | null;
}

export interface PlaylistsState {
  playlists: Playlist[];
  currentPlaylist: string | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

export interface SearchState {
  query: string;
  results: SearchResults | null;
  filters: SearchFilters;
  suggestions: string[];
  isLoading: boolean;
  recentSearches: string[];
  error: string | null;
}

export interface PlayerState {
  currentTrack?: Track | null;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  crossfader: number;
  cuePlaying: boolean;
  deckA?: Track | null;
  deckB?: Track | null;
}

export interface AudioState {
  player: PlayerState;
  waveformData: Record<string, number[]>;
  analyzingTracks: string[];
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultView: "list" | "grid" | "artwork";
  autoAnalyze: boolean;
  seratoSync: boolean;
  notifications: boolean;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  preferences?: UserPreferences;
}

export interface CreateCrateData {
  name: string;
  type?: string;
  description?: string;
}

export interface CreatePlaylistData {
  name: string;
  description?: string;
}

export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface ScanProgress {
  current: number;
  total: number;
  currentFile?: string;
  isScanning?: boolean;
  percentage?: number;
}

export interface LibraryState {
  tracks: Track[];
  stats: LibraryStats | null;
  isLoading: boolean;
  lastScan: string | null;
  scanProgress: number;
  isScanning: boolean;
  selectedTracks: string[];
  viewMode: "list" | "grid" | "artwork";
  sortBy: SortOption;
}

// Electron IPC types
declare global {
  interface Window {
    electron?: {
      selectFolder: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      selectFile: (options?: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
      saveFile: (options?: any) => Promise<{ canceled: boolean; filePath?: string }>;
      showMessage: (options?: any) => Promise<any>;
    };
  }
}
