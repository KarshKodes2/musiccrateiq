// backend/src/services/analysis/AubioEngine.ts
// BPM detection using aubio (when available via node-aubio or CLI)

import { spawn } from "child_process";
import { promisify } from "util";
import { exec as execCallback } from "child_process";
import * as fs from "fs";
import {
  IAnalysisEngine,
  AnalysisResult,
  AnalysisOptions,
  EngineCapabilities,
} from "./IAnalysisEngine";
import { Track } from "../DatabaseService";

const exec = promisify(execCallback);

/**
 * AubioEngine - BPM detection using aubio library
 *
 * This engine uses the aubio command-line tools if available.
 * Falls back gracefully if aubio is not installed.
 *
 * Installation:
 * - macOS: brew install aubio
 * - Ubuntu: apt-get install aubio-tools
 * - Windows: Download from aubio.org
 *
 * Priority: 2 (higher than metadata, lower than essentia)
 */
export class AubioEngine implements IAnalysisEngine {
  readonly name = "aubio";
  readonly priority = 2;

  private aubioPath: string | null = null;
  private isChecked = false;

  private readonly supportedFormats = [
    ".mp3",
    ".flac",
    ".wav",
    ".aiff",
    ".aif",
    ".ogg",
    ".m4a",
  ];

  canAnalyze(track: Track): boolean {
    const ext = track.file_path.toLowerCase().split(".").pop();
    return this.supportedFormats.includes(`.${ext}`);
  }

  async isAvailable(): Promise<boolean> {
    if (this.isChecked) {
      return this.aubioPath !== null;
    }

    this.isChecked = true;

    // Try to find aubiotrack command
    const commands = ["aubiotrack", "aubio track"];
    for (const cmd of commands) {
      try {
        await exec(`which ${cmd.split(" ")[0]}`);
        this.aubioPath = cmd;
        console.log(`🎵 Aubio found: ${cmd}`);
        return true;
      } catch {
        // Not found, try next
      }
    }

    console.log("⚠️ Aubio not found. Install with: brew install aubio (macOS)");
    return false;
  }

  async analyze(
    filePath: string,
    options?: AnalysisOptions
  ): Promise<AnalysisResult> {
    // Verify file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Check availability
    if (!(await this.isAvailable())) {
      return {
        bpmConfidence: 0,
        keyConfidence: 0,
        source: "aubio",
        engineVersion: "unavailable",
      };
    }

    try {
      // Run aubio for BPM detection
      const bpmResult = await this.detectBPM(filePath, options?.timeout);

      // Run aubio for onset detection to estimate energy
      const energy = await this.estimateEnergy(filePath);

      return {
        bpm: bpmResult.bpm,
        bpmConfidence: bpmResult.confidence,
        // Aubio doesn't detect key - leave for other engines
        keyConfidence: 0,
        energy,
        source: "aubio",
        engineVersion: "1.0.0",
        rawData: {
          rawBpm: bpmResult.rawBpm,
          onsetDensity: bpmResult.onsetDensity,
        },
      };
    } catch (error) {
      console.error(`AubioEngine failed for ${filePath}:`, error);
      return {
        bpmConfidence: 0,
        keyConfidence: 0,
        source: "aubio",
        engineVersion: "1.0.0",
      };
    }
  }

  getCapabilities(): EngineCapabilities {
    return {
      bpm: true,
      key: false, // Aubio doesn't detect key well
      energy: true, // Can estimate from onset density
      danceability: false,
      mood: false,
      genre: false,
    };
  }

  /**
   * Detect BPM using aubio
   */
  private async detectBPM(
    filePath: string,
    timeout = 30000
  ): Promise<{
    bpm: number | undefined;
    confidence: number;
    rawBpm: number | undefined;
    onsetDensity: number | undefined;
  }> {
    return new Promise((resolve, reject) => {
      const args = [filePath];
      const command = this.aubioPath!.split(" ")[0];
      const subCommand = this.aubioPath!.includes(" ") ? "track" : "";

      const proc = spawn(command, subCommand ? [subCommand, ...args] : args, {
        timeout,
      });

      let stdout = "";
      let stderr = "";

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      proc.on("close", (code) => {
        if (code !== 0) {
          console.warn(`Aubio exited with code ${code}: ${stderr}`);
        }

        // Parse aubio output
        // Format: "BPM: 128.5"
        const bpmMatch = stdout.match(/(\d+(?:\.\d+)?)\s*(?:BPM)?/i);
        if (bpmMatch) {
          const rawBpm = parseFloat(bpmMatch[1]);
          // Validate BPM range
          if (rawBpm >= 40 && rawBpm <= 220) {
            // Round to reasonable precision
            const bpm = Math.round(rawBpm);
            // Aubio is generally reliable
            resolve({
              bpm,
              confidence: 0.8,
              rawBpm,
              onsetDensity: undefined,
            });
            return;
          }
        }

        resolve({
          bpm: undefined,
          confidence: 0,
          rawBpm: undefined,
          onsetDensity: undefined,
        });
      });

      proc.on("error", (error) => {
        reject(error);
      });
    });
  }

  /**
   * Estimate energy from onset density
   */
  private async estimateEnergy(filePath: string): Promise<number | undefined> {
    try {
      // Use aubio onset detection to count beats/onsets
      const { stdout } = await exec(
        `aubioonset -i "${filePath}" 2>/dev/null | wc -l`,
        { timeout: 30000 }
      );

      const onsetCount = parseInt(stdout.trim());
      if (isNaN(onsetCount)) return undefined;

      // Get duration to calculate onset density
      // For now, we'll just use onset count as a rough estimate
      // More onsets = more energetic
      if (onsetCount < 50) return 1;
      if (onsetCount < 100) return 2;
      if (onsetCount < 200) return 3;
      if (onsetCount < 400) return 4;
      return 5;
    } catch {
      // aubioonset not available or failed
      return undefined;
    }
  }
}
