// backend/src/services/BatchEditService.ts
import { DatabaseService, Track } from "./DatabaseService";

export interface BatchEditOperation {
  trackIds: number[];
  updates: Partial<Track>;
}

export interface BatchEditResult {
  success: boolean;
  updatedCount: number;
  failedCount: number;
  errors: string[];
}

export class BatchEditService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Update multiple tracks with the same values
   */
  public async batchUpdate(operation: BatchEditOperation): Promise<BatchEditResult> {
    const result: BatchEditResult = {
      success: true,
      updatedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      await this.db.initialize();

      for (const trackId of operation.trackIds) {
        try {
          const updated = this.db.updateTrack(trackId, operation.updates);

          if (updated) {
            result.updatedCount++;
          } else {
            result.failedCount++;
            result.errors.push(`Failed to update track ${trackId}`);
          }
        } catch (error: any) {
          result.failedCount++;
          result.errors.push(`Error updating track ${trackId}: ${error.message}`);
          console.error(`Error updating track ${trackId}:`, error);
        }
      }

      result.success = result.failedCount === 0;
      return result;
    } catch (error: any) {
      console.error("Batch update error:", error);
      return {
        success: false,
        updatedCount: result.updatedCount,
        failedCount: result.failedCount + operation.trackIds.length - result.updatedCount,
        errors: [...result.errors, error.message],
      };
    }
  }

  /**
   * Update genre for multiple tracks
   */
  public async batchUpdateGenre(trackIds: number[], genre: string): Promise<BatchEditResult> {
    return this.batchUpdate({
      trackIds,
      updates: { genre },
    });
  }

  /**
   * Update BPM for multiple tracks
   */
  public async batchUpdateBPM(trackIds: number[], bpm: number): Promise<BatchEditResult> {
    return this.batchUpdate({
      trackIds,
      updates: { bpm },
    });
  }

  /**
   * Update key for multiple tracks
   */
  public async batchUpdateKey(trackIds: number[], key: string): Promise<BatchEditResult> {
    return this.batchUpdate({
      trackIds,
      updates: { key_signature: key },
    });
  }

  /**
   * Update rating for multiple tracks
   */
  public async batchUpdateRating(trackIds: number[], rating: number): Promise<BatchEditResult> {
    return this.batchUpdate({
      trackIds,
      updates: { rating },
    });
  }

  /**
   * Update energy level for multiple tracks
   */
  public async batchUpdateEnergy(trackIds: number[], energy: number): Promise<BatchEditResult> {
    return this.batchUpdate({
      trackIds,
      updates: { energy_level: energy },
    });
  }

  /**
   * Add tracks to multiple crates
   */
  public async batchAddToCrates(trackIds: number[], crateIds: number[]): Promise<BatchEditResult> {
    const result: BatchEditResult = {
      success: true,
      updatedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      await this.db.initialize();

      for (const crateId of crateIds) {
        for (const trackId of trackIds) {
          try {
            this.db.addTrackToCrate(crateId, trackId);
            result.updatedCount++;
          } catch (error: any) {
            result.failedCount++;
            result.errors.push(
              `Failed to add track ${trackId} to crate ${crateId}: ${error.message}`
            );
          }
        }
      }

      result.success = result.failedCount === 0;
      return result;
    } catch (error: any) {
      return {
        success: false,
        updatedCount: result.updatedCount,
        failedCount: trackIds.length * crateIds.length - result.updatedCount,
        errors: [...result.errors, error.message],
      };
    }
  }

  /**
   * Remove tracks from multiple crates
   */
  public async batchRemoveFromCrates(
    trackIds: number[],
    crateIds: number[]
  ): Promise<BatchEditResult> {
    const result: BatchEditResult = {
      success: true,
      updatedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      await this.db.initialize();

      for (const crateId of crateIds) {
        for (const trackId of trackIds) {
          try {
            const removed = this.db.removeTrackFromCrate(crateId, trackId);
            if (removed) {
              result.updatedCount++;
            } else {
              result.failedCount++;
            }
          } catch (error: any) {
            result.failedCount++;
            result.errors.push(
              `Failed to remove track ${trackId} from crate ${crateId}: ${error.message}`
            );
          }
        }
      }

      result.success = result.failedCount === 0;
      return result;
    } catch (error: any) {
      return {
        success: false,
        updatedCount: result.updatedCount,
        failedCount: trackIds.length * crateIds.length - result.updatedCount,
        errors: [...result.errors, error.message],
      };
    }
  }

  /**
   * Delete multiple tracks
   */
  public async batchDelete(trackIds: number[]): Promise<BatchEditResult> {
    const result: BatchEditResult = {
      success: true,
      updatedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      await this.db.initialize();

      for (const trackId of trackIds) {
        try {
          const deleted = this.db.deleteTrack(trackId);

          if (deleted) {
            result.updatedCount++;
          } else {
            result.failedCount++;
            result.errors.push(`Failed to delete track ${trackId}`);
          }
        } catch (error: any) {
          result.failedCount++;
          result.errors.push(`Error deleting track ${trackId}: ${error.message}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;
    } catch (error: any) {
      return {
        success: false,
        updatedCount: result.updatedCount,
        failedCount: trackIds.length - result.updatedCount,
        errors: [...result.errors, error.message],
      };
    }
  }

  /**
   * Parse metadata from filename pattern
   * Example pattern: "{artist} - {title} [{bpm}bpm] ({key})"
   */
  public parseFilename(filename: string, pattern: string): Partial<Track> {
    const metadata: any = {};

    // Remove extension
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

    // Simple pattern matching for common formats
    // Format: "Artist - Title"
    if (pattern === "artist-title") {
      const match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+)$/);
      if (match) {
        metadata.artist = match[1].trim();
        metadata.title = match[2].trim();
      }
    }

    // Format: "Artist - Title [BPM]"
    if (pattern === "artist-title-bpm") {
      const match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+?)\s*\[(\d+)(?:bpm)?\]$/i);
      if (match) {
        metadata.artist = match[1].trim();
        metadata.title = match[2].trim();
        metadata.bpm = parseInt(match[3]);
      }
    }

    // Format: "Artist - Title (Key)"
    if (pattern === "artist-title-key") {
      const match = nameWithoutExt.match(/^(.+?)\s*-\s*(.+?)\s*\(([A-G][#b]?m?)\)$/);
      if (match) {
        metadata.artist = match[1].trim();
        metadata.title = match[2].trim();
        metadata.key_signature = match[3].trim();
      }
    }

    return metadata;
  }

  /**
   * Batch parse filenames to metadata
   */
  public async batchParseFilenames(
    trackIds: number[],
    pattern: string
  ): Promise<BatchEditResult> {
    const result: BatchEditResult = {
      success: true,
      updatedCount: 0,
      failedCount: 0,
      errors: [],
    };

    try {
      await this.db.initialize();

      for (const trackId of trackIds) {
        try {
          const track = this.db.getTrackById(trackId);

          if (track) {
            const filename = track.file_path.split("/").pop() || "";
            const metadata = this.parseFilename(filename, pattern);

            if (Object.keys(metadata).length > 0) {
              const updated = this.db.updateTrack(trackId, metadata);

              if (updated) {
                result.updatedCount++;
              } else {
                result.failedCount++;
                result.errors.push(`Failed to update track ${trackId} with parsed metadata`);
              }
            } else {
              result.failedCount++;
              result.errors.push(`No metadata could be parsed from filename for track ${trackId}`);
            }
          } else {
            result.failedCount++;
            result.errors.push(`Track ${trackId} not found`);
          }
        } catch (error: any) {
          result.failedCount++;
          result.errors.push(`Error parsing filename for track ${trackId}: ${error.message}`);
        }
      }

      result.success = result.failedCount === 0;
      return result;
    } catch (error: any) {
      return {
        success: false,
        updatedCount: result.updatedCount,
        failedCount: trackIds.length - result.updatedCount,
        errors: [...result.errors, error.message],
      };
    }
  }
}

export default new BatchEditService();
