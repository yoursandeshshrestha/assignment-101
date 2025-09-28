import { indexedDBService } from "./indexedDBService";

/**
 * Custom storage engine for Redux Persist using IndexedDB
 */
export const createIndexedDBStorage = (storeName: string) => ({
  getItem: async (key: string): Promise<string | null> => {
    try {
      const data = await indexedDBService.getItem(storeName, key);
      return data ? JSON.stringify(data) : null;
    } catch (error) {
      console.error("IndexedDB getItem error:", error);
      return null;
    }
  },

  setItem: async (key: string, value: string): Promise<void> => {
    try {
      const parsedValue = JSON.parse(value);
      await indexedDBService.setItem(storeName, key, parsedValue);
    } catch (error) {
      console.error("IndexedDB setItem error:", error);
      // Don't throw the error to prevent Redux Persist from failing
      // The app should continue to work even if persistence fails
      // Just log the error and continue
    }
  },

  removeItem: async (key: string): Promise<void> => {
    try {
      await indexedDBService.removeItem(storeName, key);
    } catch (error) {
      console.error("IndexedDB removeItem error:", error);
      throw error;
    }
  },
});

// Create storage instance for interview slice
export const interviewStorage = createIndexedDBStorage("interview");
