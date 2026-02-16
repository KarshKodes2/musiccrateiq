// backend/src/services/analysis/MetadataEngine.ts
// Extract BPM/Key from file metadata tags (ID3, Vorbis, etc.)

import * as mm from "music-metadata";
import {
  IAnalysisEngine,
  AnalysisResult,
  AnalysisOptions,
  EngineCapabilities,
} from "./IAnalysisEngine";
import { Track } from "../DatabaseService";

/**
 * MetadataEngine - Extract analysis data from existing file tags
 *
 * Features:
 * - Reads ID3 tags (MP3), Vorbis comments (FLAC, OGG), MP4 atoms, etc.
 * - Extracts BPM if present in tags
 * - Extracts key if present (supports various formats)
 * - Confidence is moderate (0.7) since tag data may be inaccurate
 *
 * Priority: 1 (lowest - other engines can override)
 */
export class MetadataEngine implements IAnalysisEngine {
  readonly name = "metadata";
  readonly priority = 1;

  private readonly supportedFormats = [
    ".mp3",
    ".flac",
    ".wav",
    ".aiff",
    ".aif",
    ".ogg",
    ".m4a",
    ".mp4",
    ".wma",
    ".opus",
  ];

  canAnalyze(track: Track): boolean {
    const ext = track.file_path.toLowerCase().split(".").pop();
    return this.supportedFormats.includes(`.${ext}`);
  }

  async isAvailable(): Promise<boolean> {
    // music-metadata is always available if installed
    return true;
  }

  async analyze(
    filePath: string,
    _options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    try {
      const metadata = await mm.parseFile(filePath, { duration: true });

      // Extract BPM
      const bpm = this.extractBPM(metadata);

      // Extract key
      const key = this.extractKey(metadata);

      // Estimate energy from loudness if available
      const energy = this.estimateEnergy(metadata);

      return {
        bpm: bpm?.value,
        bpmConfidence: bpm?.confidence ?? 0,
        key: key?.value,
        keyConfidence: key?.confidence ?? 0,
        energy,
        source: "metadata",
        engineVersion: "1.0.0",
        rawData: {
          format: metadata.format,
          tags: metadata.native,
        },
      };
    } catch (error) {
      console.error(`MetadataEngine failed for ${filePath}:`, error);
      return {
        bpmConfidence: 0,
        keyConfidence: 0,
        source: "metadata",
        engineVersion: "1.0.0",
      };
    }
  }

  getCapabilities(): EngineCapabilities {
    return {
      bpm: true,
      key: true,
      energy: false, // Very limited without actual audio analysis
      danceability: false,
      mood: false,
      genre: false,
    };
  }

  /**
   * Extract BPM from metadata
   */
  private extractBPM(
    metadata: mm.IAudioMetadata
  ): { value: number; confidence: number } | null {
    const common = metadata.common;

    // Check TBPM tag (ID3v2)
    if (common.bpm && !isNaN(common.bpm)) {
      const bpm = Math.round(common.bpm);
      // Validate reasonable BPM range
      if (bpm >= 40 && bpm <= 220) {
        return { value: bpm, confidence: 0.7 };
      }
    }

    // Check for BPM in various native tag formats
    const nativeTags = metadata.native;
    for (const format of Object.keys(nativeTags)) {
      const tags = nativeTags[format];
      for (const tag of tags) {
        if (
          tag.id.toLowerCase().includes("bpm") ||
          tag.id.toLowerCase() === "tempo"
        ) {
          const bpmValue = parseFloat(String(tag.value));
          if (!isNaN(bpmValue) && bpmValue >= 40 && bpmValue <= 220) {
            return { value: Math.round(bpmValue), confidence: 0.7 };
          }
        }
      }
    }

    return null;
  }

  /**
   * Extract key from metadata
   * Supports various formats: Camelot, Open Key, Musical
   */
  private extractKey(
    metadata: mm.IAudioMetadata
  ): { value: string; confidence: number } | null {
    const common = metadata.common;

    // Check TKEY tag (ID3v2)
    if (common.key) {
      const normalizedKey = this.normalizeKey(common.key);
      if (normalizedKey) {
        return { value: normalizedKey, confidence: 0.7 };
      }
    }

    // Check for key in native tags
    const nativeTags = metadata.native;
    for (const format of Object.keys(nativeTags)) {
      const tags = nativeTags[format];
      for (const tag of tags) {
        if (
          tag.id.toLowerCase().includes("key") ||
          tag.id.toLowerCase().includes("initialkey")
        ) {
          const normalizedKey = this.normalizeKey(String(tag.value));
          if (normalizedKey) {
            return { value: normalizedKey, confidence: 0.7 };
          }
        }
      }
    }

    return null;
  }

  /**
   * Normalize key to Camelot notation
   */
  private normalizeKey(keyStr: string): string | null {
    if (!keyStr) return null;

    const key = keyStr.trim().toUpperCase();

    // Already in Camelot format (1A-12B)
    if (/^(1[0-2]|[1-9])[AB]$/i.test(key)) {
      return key;
    }

    // Open Key format (1m-12m, 1d-12d)
    const openKeyMatch = key.match(/^(1[0-2]|[1-9])([MD])$/i);
    if (openKeyMatch) {
      const num = parseInt(openKeyMatch[1]);
      const letter = openKeyMatch[2].toUpperCase() === "M" ? "A" : "B";
      return `${num}${letter}`;
    }

    // Musical notation to Camelot
    const musicalToCamelot: Record<string, string> = {
      // Major keys
      "C": "8B", "C MAJOR": "8B", "CMAJ": "8B",
      "G": "9B", "G MAJOR": "9B", "GMAJ": "9B",
      "D": "10B", "D MAJOR": "10B", "DMAJ": "10B",
      "A": "11B", "A MAJOR": "11B", "AMAJ": "11B",
      "E": "12B", "E MAJOR": "12B", "EMAJ": "12B",
      "B": "1B", "B MAJOR": "1B", "BMAJ": "1B",
      "F#": "2B", "F# MAJOR": "2B", "F#MAJ": "2B", "GB": "2B", "GB MAJOR": "2B",
      "C#": "3B", "C# MAJOR": "3B", "C#MAJ": "3B", "DB": "3B", "DB MAJOR": "3B",
      "AB": "4B", "AB MAJOR": "4B", "ABMAJ": "4B", "G#": "4B",
      "EB": "5B", "EB MAJOR": "5B", "EBMAJ": "5B", "D#": "5B",
      "BB": "6B", "BB MAJOR": "6B", "BBMAJ": "6B", "A#": "6B",
      "F": "7B", "F MAJOR": "7B", "FMAJ": "7B",
      // Minor keys
      "AM": "8A", "A MINOR": "8A", "AMIN": "8A",
      "EM": "9A", "E MINOR": "9A", "EMIN": "9A",
      "BM": "10A", "B MINOR": "10A", "BMIN": "10A",
      "F#M": "11A", "F# MINOR": "11A", "F#MIN": "11A", "GBM": "11A",
      "C#M": "12A", "C# MINOR": "12A", "C#MIN": "12A", "DBM": "12A",
      "G#M": "1A", "G# MINOR": "1A", "G#MIN": "1A", "ABM": "1A",
      "D#M": "2A", "D# MINOR": "2A", "D#MIN": "2A", "EBM": "2A",
      "A#M": "3A", "A# MINOR": "3A", "A#MIN": "3A", "BBM": "3A",
      "FM": "4A", "F MINOR": "4A", "FMIN": "4A",
      "CM": "5A", "C MINOR": "5A", "CMIN": "5A",
      "GM": "6A", "G MINOR": "6A", "GMIN": "6A",
      "DM": "7A", "D MINOR": "7A", "DMIN": "7A",
    };

    return musicalToCamelot[key] || null;
  }

  /**
   * Estimate energy from available metadata
   * Very rough estimation - actual audio analysis is much better
   */
  private estimateEnergy(metadata: mm.IAudioMetadata): number | undefined {
    // Can't really estimate energy from metadata alone
    // This would require actual audio analysis
    return undefined;
  }
}
