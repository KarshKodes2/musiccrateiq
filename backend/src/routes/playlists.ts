// backend/src/routes/playlists.ts
import { Router } from "express";
import { DatabaseService } from "../services/DatabaseService";
import { PlaylistGenerator } from "../services/PlaylistGenerator";

const router = Router();
const playlistGenerator = new PlaylistGenerator();

// GET /api/playlists - Get all playlists
router.get("/", async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const db = databaseService.getDatabase();
    const playlists = db
      .prepare(
        `
      SELECT p.*, COUNT(pt.track_id) as track_count
      FROM playlists p
      LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `
      )
      .all();

    res.json(playlists);
  } catch (error) {
    console.error("Error getting playlists:", error);
    res.status(500).json({ error: "Failed to get playlists" });
  }
});

// GET /api/playlists/:id - Get specific playlist
router.get("/:id", async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const playlistId = Number(req.params.id);
    const db = databaseService.getDatabase();

    const playlist = db
      .prepare("SELECT * FROM playlists WHERE id = ?")
      .get(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const tracks = db
      .prepare(
        `
      SELECT t.*, pt.position, pt.transition_type, pt.transition_quality,
             pt.mix_in_time, pt.mix_out_time, pt.notes
      FROM tracks t
      JOIN playlist_tracks pt ON t.id = pt.track_id
      WHERE pt.playlist_id = ?
      ORDER BY pt.position
    `
      )
      .all(playlistId);

    res.json({ ...playlist as any, tracks });
  } catch (error) {
    console.error("Error getting playlist:", error);
    res.status(500).json({ error: "Failed to get playlist" });
  }
});

// POST /api/playlists - Create new playlist
router.post("/", async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const { name, description, tracks = [] } = req.body;
    const db = databaseService.getDatabase();

    // Calculate playlist metrics
    const totalDuration = tracks.reduce(
      (sum: number, track: any) => sum + (track.duration || 0),
      0
    );
    const avgBPM =
      tracks.length > 0
        ? tracks.reduce(
            (sum: number, track: any) => sum + (track.bpm || 0),
            0
          ) / tracks.length
        : 0;

    // Insert playlist
    const playlistResult = db
      .prepare(
        `
      INSERT INTO playlists (name, description, total_duration, avg_bpm, is_public)
      VALUES (?, ?, ?, ?, ?)
    `
      )
      .run(name, description, totalDuration, avgBPM, false);

    const playlistId = playlistResult.lastInsertRowid as number;

    // Add tracks to playlist
    if (tracks.length > 0) {
      const insertTrack = db.prepare(`
        INSERT INTO playlist_tracks (playlist_id, track_id, position, transition_type, mix_in_time, mix_out_time)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      tracks.forEach((track: any, index: number) => {
        insertTrack.run(
          playlistId,
          track.id,
          index + 1,
          track.transition_type || null,
          track.mix_in_time || null,
          track.mix_out_time || null
        );
      });
    }

    const playlist = db
      .prepare("SELECT * FROM playlists WHERE id = ?")
      .get(playlistId);
    res.status(201).json(playlist);
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// POST /api/playlists/generate-harmonic - Generate harmonic playlist
router.post("/generate-harmonic", async (req, res) => {
  try {
    const options = {
      startKey: req.body.startKey || "4A",
      targetDuration: req.body.targetDuration || 3600,
      energyCurve: req.body.energyCurve || "standard",
      preferredGenres: req.body.preferredGenres || [],
      excludeExplicit: req.body.excludeExplicit !== false,
      allowKeyJumps: req.body.allowKeyJumps !== false,
      minRating: req.body.minRating || 3,
    };

    const playlist = await playlistGenerator.generateHarmonicPlaylist(options);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating harmonic playlist:", error);
    res.status(500).json({ error: "Failed to generate harmonic playlist" });
  }
});

// POST /api/playlists/generate-event - Generate event-specific playlist
router.post("/generate-event", async (req, res) => {
  try {
    const { eventType, duration, guestPreferences } = req.body;
    const playlist = await playlistGenerator.generateEventPlaylist(
      eventType,
      duration,
      guestPreferences
    );
    res.json(playlist);
  } catch (error) {
    console.error("Error generating event playlist:", error);
    res.status(500).json({ error: "Failed to generate event playlist" });
  }
});

// POST /api/playlists/generate-valentine - Generate Valentine's Day playlist by era
router.post("/generate-valentine", async (req, res) => {
  try {
    const { era = '2020s', duration = 3600 } = req.body;

    if (!['80s', '90s', '2000s', '2010s', '2020s'].includes(era)) {
      return res.status(400).json({ error: "Invalid era. Must be one of: 80s, 90s, 2000s, 2010s, 2020s" });
    }

    const playlist = await playlistGenerator.generateValentinePlaylist(era as any, duration);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating Valentine playlist:", error);
    res.status(500).json({ error: "Failed to generate Valentine playlist" });
  }
});

// POST /api/playlists/generate-gospel - Generate Gospel flow playlist
router.post("/generate-gospel", async (req, res) => {
  try {
    const { duration = 3600 } = req.body;
    const playlist = await playlistGenerator.generateGospelFlow(duration);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating Gospel playlist:", error);
    res.status(500).json({ error: "Failed to generate Gospel playlist" });
  }
});

// POST /api/playlists/generate-nigerian-party - Generate Nigerian party playlist
router.post("/generate-nigerian-party", async (req, res) => {
  try {
    const { duration = 3600 } = req.body;
    const playlist = await playlistGenerator.generateNigerianParty(duration);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating Nigerian party playlist:", error);
    res.status(500).json({ error: "Failed to generate Nigerian party playlist" });
  }
});

// POST /api/playlists/generate-nigerian-elder - Generate Nigerian elder-friendly playlist
router.post("/generate-nigerian-elder", async (req, res) => {
  try {
    const { duration = 3600 } = req.body;
    const playlist = await playlistGenerator.generateNigerianElderFriendly(duration);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating Nigerian elder-friendly playlist:", error);
    res.status(500).json({ error: "Failed to generate Nigerian elder-friendly playlist" });
  }
});

// POST /api/playlists/generate-nigerian-classic-modern - Generate Nigerian classic to modern blend
router.post("/generate-nigerian-classic-modern", async (req, res) => {
  try {
    const { duration = 3600 } = req.body;
    const playlist = await playlistGenerator.generateNigerianClassicModern(duration);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating Nigerian classic-modern playlist:", error);
    res.status(500).json({ error: "Failed to generate Nigerian classic-modern playlist" });
  }
});

// POST /api/playlists/generate-elder-friendly - Generate elder-friendly international playlist
router.post("/generate-elder-friendly", async (req, res) => {
  try {
    const { duration = 3600 } = req.body;
    const playlist = await playlistGenerator.generateElderFriendlyInternational(duration);
    res.json(playlist);
  } catch (error) {
    console.error("Error generating elder-friendly playlist:", error);
    res.status(500).json({ error: "Failed to generate elder-friendly playlist" });
  }
});

export default router;
