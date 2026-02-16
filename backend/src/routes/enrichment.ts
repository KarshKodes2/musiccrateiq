// backend/src/routes/enrichment.ts
import { Router } from 'express';
import { MetadataEnrichmentService } from '../services/MetadataEnrichmentService';
import { DatabaseService } from '../services/DatabaseService';

const router = Router();
const enrichmentService = new MetadataEnrichmentService();

// POST /api/enrichment/track/:id - Enrich single track metadata
router.post('/track/:id', async (req, res) => {
  try {
    const trackId = Number(req.params.id);
    const { sources = ['spotify', 'musicbrainz'], autoApply = false, minConfidence = 0.7 } = req.body;

    const enrichedData = await enrichmentService.enrichTrackMetadata(trackId, sources);

    if (!enrichedData) {
      return res.status(404).json({ error: 'No matching metadata found' });
    }

    if (enrichedData.confidence < minConfidence) {
      return res.json({
        success: false,
        message: `Match confidence (${(enrichedData.confidence * 100).toFixed(1)}%) is below threshold (${minConfidence * 100}%)`,
        data: enrichedData,
      });
    }

    // Auto-apply if requested
    if (autoApply) {
      const databaseService: DatabaseService = req.app.locals.databaseService;
      const db = databaseService.getDatabase();

      const updates: any = {};
      if (enrichedData.spotify_id) updates.spotify_id = enrichedData.spotify_id;
      if (enrichedData.popularity !== undefined) updates.popularity = enrichedData.popularity;
      if (enrichedData.isrc) updates.isrc = enrichedData.isrc;
      if (enrichedData.year) updates.year = enrichedData.year;
      if (enrichedData.genre) updates.genre = enrichedData.genre;
      if (enrichedData.genre_tags) updates.genre_tags = JSON.stringify(enrichedData.genre_tags);
      if (enrichedData.streams) updates.play_count = enrichedData.streams;
      if (enrichedData.artwork_url) updates.artwork_path = enrichedData.artwork_url;

      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = Object.values(updates);

      if (setClause) {
        db.prepare(`UPDATE tracks SET ${setClause} WHERE id = ?`)
          .run(...values, trackId);
      }

      const updatedTrack = db.prepare('SELECT * FROM tracks WHERE id = ?').get(trackId);

      return res.json({
        success: true,
        message: 'Metadata enriched and applied',
        data: enrichedData,
        track: updatedTrack,
      });
    }

    res.json({
      success: true,
      message: 'Metadata found',
      data: enrichedData,
    });
  } catch (error: any) {
    console.error('Error enriching track:', error);
    res.status(500).json({ error: error.message || 'Failed to enrich track metadata' });
  }
});

// POST /api/enrichment/library - Enrich entire library in batch
router.post('/library', async (req, res) => {
  try {
    const { limit = 100, minConfidence = 0.7 } = req.body;

    const result = await enrichmentService.enrichLibrary(limit, minConfidence);

    res.json({
      success: true,
      message: `Library enrichment complete`,
      ...result,
    });
  } catch (error: any) {
    console.error('Error enriching library:', error);
    res.status(500).json({ error: error.message || 'Failed to enrich library' });
  }
});

// GET /api/enrichment/popular - Get most popular tracks from enriched data
router.get('/popular', async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const db = databaseService.getDatabase();
    const { limit = 50, minPopularity = 50 } = req.query;

    const tracks = db.prepare(`
      SELECT *
      FROM tracks
      WHERE popularity >= ? AND spotify_id IS NOT NULL
      ORDER BY popularity DESC
      LIMIT ?
    `).all(Number(minPopularity), Number(limit));

    res.json(tracks);
  } catch (error) {
    console.error('Error getting popular tracks:', error);
    res.status(500).json({ error: 'Failed to get popular tracks' });
  }
});

// GET /api/enrichment/stats - Get enrichment statistics
router.get('/stats', async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;
    const db = databaseService.getDatabase();

    const stats = {
      total: db.prepare('SELECT COUNT(*) as count FROM tracks').get() as any,
      enriched: db.prepare('SELECT COUNT(*) as count FROM tracks WHERE spotify_id IS NOT NULL').get() as any,
      withPopularity: db.prepare('SELECT COUNT(*) as count FROM tracks WHERE popularity > 0').get() as any,
      avgPopularity: db.prepare('SELECT AVG(popularity) as avg FROM tracks WHERE popularity > 0').get() as any,
      topGenres: db.prepare(`
        SELECT genre, COUNT(*) as count
        FROM tracks
        WHERE genre IS NOT NULL AND genre != ''
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 10
      `).all(),
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting enrichment stats:', error);
    res.status(500).json({ error: 'Failed to get enrichment stats' });
  }
});

export default router;
