// backend/src/services/analysis/AnalysisOrchestrator.ts
// Coordinates multiple analysis engines and merges results

import {
  IAnalysisEngine,
  AnalysisResult,
  AnalysisOptions,
  EngineRegistration,
} from "./IAnalysisEngine";
import { Track, AnalysisSource } from "../DatabaseService";

/**
 * Merged analysis result from all engines
 */
export interface MergedAnalysisResult {
  bpm?: number;
  bpmConfidence: number;
  bpmSource: AnalysisSource;

  key?: string;
  keyConfidence: number;
  keySource: AnalysisSource;

  energy?: number;

  // Flag for later re-analysis if confidence is low
  needsReanalysis: boolean;

  // Which engines contributed
  contributingEngines: string[];

  // Combined engine version for cache
  analysisVersion: string;
}

/**
 * Orchestrates multiple analysis engines
 *
 * Features:
 * - Registers engines via dependency injection
 * - Runs engines in priority order
 * - Merges results (higher priority wins conflicts)
 * - Flags low-confidence results for future re-analysis
 * - Caches results to avoid reprocessing
 */
export class AnalysisOrchestrator {
  private engines: EngineRegistration[] = [];
  private confidenceThreshold = 0.6; // Below this, flag for re-analysis

  constructor() {
    console.log("🎵 AnalysisOrchestrator initialized");
  }

  /**
   * Register an analysis engine
   * @param engine - Engine to register
   * @param enabled - Whether engine is enabled
   */
  registerEngine(engine: IAnalysisEngine, enabled = true): void {
    this.engines.push({ engine, enabled });
    // Sort by priority (ascending so higher priority is processed last and wins)
    this.engines.sort((a, b) => a.engine.priority - b.engine.priority);
    console.log(`📊 Registered engine: ${engine.name} (priority: ${engine.priority})`);
  }

  /**
   * Unregister an engine by name
   */
  unregisterEngine(name: string): void {
    this.engines = this.engines.filter((reg) => reg.engine.name !== name);
    console.log(`🗑️ Unregistered engine: ${name}`);
  }

  /**
   * Enable/disable an engine
   */
  setEngineEnabled(name: string, enabled: boolean): void {
    const reg = this.engines.find((r) => r.engine.name === name);
    if (reg) {
      reg.enabled = enabled;
      console.log(`${enabled ? "✅" : "❌"} Engine ${name} ${enabled ? "enabled" : "disabled"}`);
    }
  }

  /**
   * Get all registered engines
   */
  getEngines(): { name: string; priority: number; enabled: boolean }[] {
    return this.engines.map((reg) => ({
      name: reg.engine.name,
      priority: reg.engine.priority,
      enabled: reg.enabled,
    }));
  }

  /**
   * Check which engines are available
   */
  async checkAvailability(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    for (const reg of this.engines) {
      results[reg.engine.name] = await reg.engine.isAvailable();
    }
    return results;
  }

  /**
   * Analyze a track using all available engines
   * @param track - Track to analyze
   * @param options - Analysis options
   * @returns Merged analysis result
   */
  async analyze(
    track: Track,
    options?: AnalysisOptions
  ): Promise<MergedAnalysisResult> {
    const results: Array<{ engine: IAnalysisEngine; result: AnalysisResult }> = [];

    // Run each enabled engine
    for (const reg of this.engines) {
      if (!reg.enabled) continue;

      const engine = reg.engine;

      // Check if engine can handle this track
      if (!engine.canAnalyze(track)) {
        continue;
      }

      // Check if engine is available
      const available = await engine.isAvailable();
      if (!available) {
        console.warn(`⚠️ Engine ${engine.name} not available, skipping`);
        continue;
      }

      try {
        const result = await engine.analyze(track.file_path, options);
        results.push({ engine, result });
        console.log(
          `✅ ${engine.name}: BPM=${result.bpm ?? "?"} (${(result.bpmConfidence * 100).toFixed(0)}%), ` +
          `Key=${result.key ?? "?"} (${(result.keyConfidence * 100).toFixed(0)}%)`
        );
      } catch (error) {
        console.error(`❌ Engine ${engine.name} failed:`, error);
      }
    }

    // Merge results
    return this.mergeResults(results);
  }

  /**
   * Analyze multiple tracks in batch
   */
  async analyzeBatch(
    tracks: Track[],
    options?: AnalysisOptions,
    onProgress?: (completed: number, total: number, track: Track) => void
  ): Promise<Map<number, MergedAnalysisResult>> {
    const results = new Map<number, MergedAnalysisResult>();

    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      try {
        const result = await this.analyze(track, options);
        results.set(track.id!, result);
        onProgress?.(i + 1, tracks.length, track);
      } catch (error) {
        console.error(`Failed to analyze track ${track.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Merge results from multiple engines
   * Higher priority engines win conflicts
   */
  private mergeResults(
    results: Array<{ engine: IAnalysisEngine; result: AnalysisResult }>
  ): MergedAnalysisResult {
    const merged: MergedAnalysisResult = {
      bpmConfidence: 0,
      bpmSource: "pending",
      keyConfidence: 0,
      keySource: "pending",
      needsReanalysis: false,
      contributingEngines: [],
      analysisVersion: "",
    };

    // Process in priority order (lower first, so higher overwrites)
    for (const { engine, result } of results) {
      merged.contributingEngines.push(engine.name);

      // BPM - take highest confidence or higher priority with equal confidence
      if (
        result.bpm !== undefined &&
        result.bpmConfidence >= merged.bpmConfidence
      ) {
        merged.bpm = result.bpm;
        merged.bpmConfidence = result.bpmConfidence;
        merged.bpmSource = result.source;
      }

      // Key - same logic
      if (
        result.key !== undefined &&
        result.keyConfidence >= merged.keyConfidence
      ) {
        merged.key = result.key;
        merged.keyConfidence = result.keyConfidence;
        merged.keySource = result.source;
      }

      // Energy - higher priority wins
      if (result.energy !== undefined) {
        merged.energy = result.energy;
      }

      // Build version string
      if (result.engineVersion) {
        merged.analysisVersion += `${engine.name}:${result.engineVersion};`;
      }
    }

    // Flag for re-analysis if any confidence is low
    merged.needsReanalysis =
      merged.bpmConfidence < this.confidenceThreshold ||
      merged.keyConfidence < this.confidenceThreshold;

    return merged;
  }

  /**
   * Set the confidence threshold for flagging re-analysis
   */
  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold));
  }
}

// Singleton instance
let orchestratorInstance: AnalysisOrchestrator | null = null;

export function getAnalysisOrchestrator(): AnalysisOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AnalysisOrchestrator();
  }
  return orchestratorInstance;
}
