// backend/src/services/analysis/index.ts
// Export all analysis engine components

export * from "./IAnalysisEngine";
export * from "./AnalysisOrchestrator";
export * from "./MetadataEngine";
export * from "./AubioEngine";

// Future: EssentiaEngine will be added here when ready
// export * from "./EssentiaEngine";

import { getAnalysisOrchestrator } from "./AnalysisOrchestrator";
import { MetadataEngine } from "./MetadataEngine";
import { AubioEngine } from "./AubioEngine";

/**
 * Initialize the analysis orchestrator with default engines
 * Call this at application startup
 */
export function initializeAnalysis(): void {
  const orchestrator = getAnalysisOrchestrator();

  // Register engines in priority order
  orchestrator.registerEngine(new MetadataEngine(), true);
  orchestrator.registerEngine(new AubioEngine(), true);

  // Future: Add EssentiaEngine when available
  // orchestrator.registerEngine(new EssentiaEngine(), true);

  console.log("🎵 Analysis engines initialized");
}
