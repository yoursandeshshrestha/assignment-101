import { indexedDBService } from "./indexedDBService";

/**
 * Initialize IndexedDB when the app starts
 */
export const initializeDB = async (): Promise<void> => {
  try {
    await indexedDBService.init();
    console.log("✅ IndexedDB initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize IndexedDB:", error);
    // App can still work without IndexedDB, just without persistence
  }
};

/**
 * Clear all data from IndexedDB (useful for development/testing)
 */
export const clearAllData = async (): Promise<void> => {
  try {
    await indexedDBService.clearStore("candidates");
    console.log("✅ All IndexedDB data cleared");
  } catch (error) {
    console.error("❌ Failed to clear IndexedDB data:", error);
  }
};

/**
 * Get database statistics
 */
export const getDBStats = async () => {
  try {
    const candidates = await indexedDBService.getAllItems("candidates");

    return {
      candidates: candidates.length,
      total: candidates.length,
    };
  } catch (error) {
    console.error("Failed to get DB stats:", error);
    return null;
  }
};
