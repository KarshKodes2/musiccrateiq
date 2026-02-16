// backend/src/services/analysis/IAnalysisEngine.ts
// Pluggable audio analysis engine interface
// Strategy: Aubio + Metadata NOW, Essentia LATER (no Python today, no regrets later)

import { Track, AnalysisSource } from "../DatabaseService";

/**
 * Result of analyzing a single audio file
 */
export interface AnalysisResult {
  // BPM detection
  bpm?: number;
  bpmConfidence: number; // 0-1 (low confidence = flag for re-analysis later)

  // Key detection (Camelot format: 1A-12B)
  key?: string;
  keyConfidence: number; // 0-1

  // Energy level (1-5 scale)
  energy?: number;

  // Source of this analysis
  source: AnalysisSource;

  // Engine version for cache invalidation
  engineVersion?: string;

  // Raw analysis data for debugging
  rawData?: Record<string, unknown>;
}

/**
 * Options for analysis
 */
export interface AnalysisOptions {
  // Force re-analysis even if cached
  force?: boolean;

  // Only analyze specific aspects
  analyzeOnly?: ("bpm" | "key" | "energy")[];

  // Timeout in milliseconds
  timeout?: number;
}

/**
 * Pluggable analysis engine interface
 *
 * Implementations:
 * - MetadataEngine: Extract BPM/Key from file tags (ID3, Vorbis, etc.)
 * - AubioEngine: Node.js Aubio bindings for BPM + rough energy
 * - EssentiaEngine: [FUTURE] Python microservice for high-accuracy analysis
 */
export interface IAnalysisEngine {
  /**
   * Unique name of this engine
   */
  readonly name: string;

  /**
   * Priority for conflict resolution (higher = more trusted)
   * - MetadataEngine: 1 (trust existing tags moderately)
   * - AubioEngine: 2 (good for most tracks)
   * - EssentiaEngine: 3 (highest accuracy) [FUTURE]
   * - Manual: 10 (user always wins)
   */
  readonly priority: number;

  /**
   * Check if this engine can analyze the given track
   * @param track - Track to check
   * @returns true if this engine can handle the file
   */
  canAnalyze(track: Track): boolean;

  /**
   * Check if this engine is available (dependencies installed, etc.)
   * @returns true if engine is ready to use
   */
  isAvailable(): Promise<boolean>;

  /**
   * Analyze a single audio file
   * @param filePath - Absolute path to audio file
   * @param options - Analysis options
   * @returns Analysis result with confidence scores
   */
  analyze(filePath: string, options?: AnalysisOptions): Promise<AnalysisResult>;

  /**
   * Get capabilities of this engine
   */
  getCapabilities(): EngineCapabilities;
}

/**
 * What this engine can analyze
 */
export interface EngineCapabilities {
  bpm: boolean;
  key: boolean;
  energy: boolean;
  danceability: boolean;
  mood: boolean;
  genre: boolean;
}

/**
 * Registration info for dependency injection
 */
export interface EngineRegistration {
  engine: IAnalysisEngine;
  enabled: boolean;
}
