// backend/src/routes/settings.ts
import { Router } from "express";
import { DatabaseService } from "../services/DatabaseService";
import fs from "fs";
import path from "path";

const router = Router();

// GET /api/settings - Get all settings
router.get("/", async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const db = databaseService.getDatabase();

    const settings = db.prepare("SELECT * FROM settings").all() as Array<{
      key: string;
      value: string;
      updated_at: string;
    }>;

    // Convert array to object
    const settingsObj = settings.reduce((acc, { key, value }) => {
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    res.json(settingsObj);
  } catch (error) {
    console.error("Error getting settings:", error);
    res.status(500).json({ error: "Failed to get settings" });
  }
});

// PUT /api/settings/:key - Update a setting
router.put("/:key", async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const db = databaseService.getDatabase();
    const { key } = req.params;
    const { value } = req.body;

    // Validate music library path if that's what's being updated
    if (key === "musicLibraryPath") {
      if (!fs.existsSync(value)) {
        return res.status(400).json({ error: "Directory does not exist" });
      }

      const stats = fs.statSync(value);
      if (!stats.isDirectory()) {
        return res.status(400).json({ error: "Path must be a directory" });
      }
    }

    // Upsert setting
    db.prepare(`
      INSERT INTO settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `).run(key, value);

    res.json({ key, value, success: true });
  } catch (error) {
    console.error("Error updating setting:", error);
    res.status(500).json({ error: "Failed to update setting" });
  }
});

// POST /api/settings/music-library/scan - Trigger library scan
router.post("/music-library/scan", async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const db = databaseService.getDatabase();

    // Get music library path from settings
    const setting = db.prepare("SELECT value FROM settings WHERE key = ?")
      .get("musicLibraryPath") as { value: string } | undefined;

    if (!setting) {
      return res.status(400).json({ error: "Music library path not set" });
    }

    // TODO: Trigger LibraryScanner here
    // This will be implemented when the scan functionality is ready

    res.json({
      success: true,
      message: "Library scan started",
      path: setting.value
    });
  } catch (error) {
    console.error("Error starting library scan:", error);
    res.status(500).json({ error: "Failed to start library scan" });
  }
});

export default router;
