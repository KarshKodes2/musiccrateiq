// backend/src/index.ts - Main Server Entry Point
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import dotenv from "dotenv";
import path from "path";
import { DatabaseService } from "./services/DatabaseService";
import { FileWatcherService } from "./services/FileWatcherService";
import { errorHandler } from "./middleware/errorHandler";
import { Logger } from "./utils/logger";

// Import routes
import libraryRoutes from "./routes/library";
import cratesRoutes from "./routes/crates";
import playlistsRoutes from "./routes/playlists";
import searchRoutes from "./routes/search";
import analyticsRoutes from "./routes/analytics";
import seratoRoutes from "./routes/serato";
import batchRoutes from "./routes/batch";
import settingsRoutes from "./routes/settings";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Global database instance
let databaseService: DatabaseService;
let fileWatcherService: FileWatcherService;

// Middleware
// IMPORTANT: CORS must be BEFORE helmet to prevent security headers from blocking CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));
app.use(compression());
app.use(morgan("combined", {
  stream: { write: (message: string) => Logger.info(message.trim()) }
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes
app.use("/api/library", libraryRoutes);
app.use("/api/crates", cratesRoutes);
app.use("/api/playlists", playlistsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/serato", seratoRoutes);
app.use("/api/batch", batchRoutes);
app.use("/api/settings", settingsRoutes);

// Serve static files (uploaded artwork, etc.)
const uploadsPath = path.join(__dirname, "..", process.env.UPLOADS_FOLDER || "uploads");
app.use("/uploads", express.static(uploadsPath));

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${_req.method} ${_req.path}`,
    path: _req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    Logger.info("🎵 DJ Library Manager - Starting server...");

    // Initialize database
    Logger.info("📊 Initializing database...");
    databaseService = new DatabaseService();
    await databaseService.initialize();
    Logger.info("✅ Database initialized successfully");

    // Make database service available to all routes via app.locals
    app.locals.databaseService = databaseService;

    // Get library stats
    const stats = databaseService.getLibraryStats();
    Logger.info(`📚 Library contains ${stats.totalTracks} tracks`);

    // Start file watcher if enabled and music library path is configured
    const musicLibraryPath = process.env.MUSIC_LIBRARY_PATH;
    const watchEnabled = process.env.WATCH_ENABLED !== "false"; // Default to true if not set

    if (musicLibraryPath && watchEnabled) {
      Logger.info(`👀 Starting file watcher for: ${musicLibraryPath}`);
      fileWatcherService = new FileWatcherService(databaseService);
      fileWatcherService.start(musicLibraryPath);
      Logger.info("✅ File watcher started");
    } else if (musicLibraryPath && !watchEnabled) {
      Logger.info("⚠️  File watcher DISABLED (WATCH_ENABLED=false)");
      Logger.info("💡 Use 'Scan Library' button to manually refresh your library");
    } else {
      Logger.warn("⚠️  MUSIC_LIBRARY_PATH not set - file watcher disabled");
    }

    // Start HTTP server
    app.listen(PORT, () => {
      Logger.info("=".repeat(60));
      Logger.info(`🚀 Server running on port ${PORT}`);
      Logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      Logger.info(`📡 API available at: http://localhost:${PORT}/api`);
      Logger.info(`💊 Health check: http://localhost:${PORT}/health`);
      Logger.info("=".repeat(60));
    });

  } catch (error) {
    Logger.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  Logger.info("📴 SIGTERM received. Shutting down gracefully...");

  if (fileWatcherService) {
    fileWatcherService.stop();
    Logger.info("✅ File watcher stopped");
  }

  if (databaseService) {
    databaseService.close();
    Logger.info("✅ Database connection closed");
  }

  process.exit(0);
});

process.on("SIGINT", async () => {
  Logger.info("📴 SIGINT received. Shutting down gracefully...");

  if (fileWatcherService) {
    fileWatcherService.stop();
    Logger.info("✅ File watcher stopped");
  }

  if (databaseService) {
    databaseService.close();
    Logger.info("✅ Database connection closed");
  }

  process.exit(0);
});

// Handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  Logger.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason: any) => {
  Logger.error("❌ Unhandled Rejection:", reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
