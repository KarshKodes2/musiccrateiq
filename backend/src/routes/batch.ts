// backend/src/routes/batch.ts - Batch Operations API Routes
import { Router, Request, Response } from "express";
import { BatchEditService } from "../services/BatchEditService";
import { Logger } from "../utils/logger";

const router = Router();
const batchEditService = new BatchEditService();

/**
 * POST /api/batch/update
 * Batch update multiple tracks with same values
 *
 * Body: {
 *   trackIds: number[],
 *   updates: {
 *     genre?: string,
 *     bpm?: number,
 *     key?: string,
 *     rating?: number,
 *     energy_level?: number
 *   }
 * }
 */
router.post("/update", async (req: Request, res: Response) => {
  try {
    const { trackIds, updates } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!updates || typeof updates !== "object") {
      return res.status(400).json({ error: "updates object is required" });
    }

    Logger.info(`Batch updating ${trackIds.length} tracks`);

    const result = await batchEditService.batchUpdate({ trackIds, updates });

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch update:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/update-genre
 * Batch update genre for multiple tracks
 *
 * Body: { trackIds: number[], genre: string }
 */
router.post("/update-genre", async (req: Request, res: Response) => {
  try {
    const { trackIds, genre } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!genre || typeof genre !== "string") {
      return res.status(400).json({ error: "genre string is required" });
    }

    const result = await batchEditService.batchUpdateGenre(trackIds, genre);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch update genre:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/update-bpm
 * Batch update BPM for multiple tracks
 *
 * Body: { trackIds: number[], bpm: number }
 */
router.post("/update-bpm", async (req: Request, res: Response) => {
  try {
    const { trackIds, bpm } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!bpm || typeof bpm !== "number") {
      return res.status(400).json({ error: "bpm number is required" });
    }

    const result = await batchEditService.batchUpdateBPM(trackIds, bpm);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch update BPM:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/update-key
 * Batch update musical key for multiple tracks
 *
 * Body: { trackIds: number[], key: string }
 */
router.post("/update-key", async (req: Request, res: Response) => {
  try {
    const { trackIds, key } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!key || typeof key !== "string") {
      return res.status(400).json({ error: "key string is required" });
    }

    const result = await batchEditService.batchUpdateKey(trackIds, key);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch update key:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/update-rating
 * Batch update rating for multiple tracks
 *
 * Body: { trackIds: number[], rating: number }
 */
router.post("/update-rating", async (req: Request, res: Response) => {
  try {
    const { trackIds, rating } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (rating === undefined || typeof rating !== "number") {
      return res.status(400).json({ error: "rating number is required" });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: "rating must be between 0 and 5" });
    }

    const result = await batchEditService.batchUpdateRating(trackIds, rating);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch update rating:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/update-energy
 * Batch update energy level for multiple tracks
 *
 * Body: { trackIds: number[], energyLevel: number }
 */
router.post("/update-energy", async (req: Request, res: Response) => {
  try {
    const { trackIds, energyLevel } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (energyLevel === undefined || typeof energyLevel !== "number") {
      return res.status(400).json({ error: "energyLevel number is required" });
    }

    if (energyLevel < 1 || energyLevel > 5) {
      return res.status(400).json({ error: "energyLevel must be between 1 and 5" });
    }

    const result = await batchEditService.batchUpdateEnergy(trackIds, energyLevel);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch update energy:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/add-to-crates
 * Add multiple tracks to multiple crates
 *
 * Body: { trackIds: number[], crateIds: number[] }
 */
router.post("/add-to-crates", async (req: Request, res: Response) => {
  try {
    const { trackIds, crateIds } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!crateIds || !Array.isArray(crateIds) || crateIds.length === 0) {
      return res.status(400).json({ error: "crateIds array is required" });
    }

    Logger.info(`Adding ${trackIds.length} tracks to ${crateIds.length} crates`);

    const result = await batchEditService.batchAddToCrates(trackIds, crateIds);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch add to crates:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/remove-from-crates
 * Remove multiple tracks from multiple crates
 *
 * Body: { trackIds: number[], crateIds: number[] }
 */
router.post("/remove-from-crates", async (req: Request, res: Response) => {
  try {
    const { trackIds, crateIds } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!crateIds || !Array.isArray(crateIds) || crateIds.length === 0) {
      return res.status(400).json({ error: "crateIds array is required" });
    }

    Logger.info(`Removing ${trackIds.length} tracks from ${crateIds.length} crates`);

    const result = await batchEditService.batchRemoveFromCrates(trackIds, crateIds);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch remove from crates:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/delete
 * Delete multiple tracks from library
 *
 * Body: { trackIds: number[] }
 */
router.post("/delete", async (req: Request, res: Response) => {
  try {
    const { trackIds } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    Logger.warn(`Batch deleting ${trackIds.length} tracks`);

    const result = await batchEditService.batchDelete(trackIds);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch delete:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/batch/parse-filenames
 * Parse metadata from filenames for multiple tracks
 *
 * Body: {
 *   trackIds: number[],
 *   pattern: "artist-title" | "artist-title-bpm" | "artist-title-key" | "title-artist"
 * }
 */
router.post("/parse-filenames", async (req: Request, res: Response) => {
  try {
    const { trackIds, pattern } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ error: "trackIds array is required" });
    }

    if (!pattern || typeof pattern !== "string") {
      return res.status(400).json({ error: "pattern string is required" });
    }

    const validPatterns = ["artist-title", "artist-title-bpm", "artist-title-key", "title-artist"];
    if (!validPatterns.includes(pattern)) {
      return res.status(400).json({
        error: `pattern must be one of: ${validPatterns.join(", ")}`
      });
    }

    Logger.info(`Parsing filenames for ${trackIds.length} tracks with pattern: ${pattern}`);

    const result = await batchEditService.batchParseFilenames(trackIds, pattern);

    res.json(result);
  } catch (error: any) {
    Logger.error("Error in batch parse filenames:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
