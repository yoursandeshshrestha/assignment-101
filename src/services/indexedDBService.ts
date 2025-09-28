/**
 * IndexedDB Service for storing application data
 * Provides a simple interface for CRUD operations
 */

class IndexedDBService {
  private dbName = "SwipeInterviewDB";
  private version = 2;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    // If already initializing, return the existing promise
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error("Failed to open IndexedDB:", request.error);
        this.initPromise = null;
        reject(new Error("Failed to open IndexedDB"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.initPromise = null;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains("candidates")) {
          db.createObjectStore("candidates", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("interview")) {
          db.createObjectStore("interview", { keyPath: "id" });
        }
      };
    });

    return this.initPromise;
  }

  isReady(): boolean {
    return this.db !== null;
  }

  isHealthy(): boolean {
    return this.db !== null;
  }

  private async ensureReady(): Promise<void> {
    if (!this.isReady()) {
      await this.init();
    }
  }

  // Helper function to remove null values from objects (IndexedDB can't store null)
  private cleanForStorage(value: unknown): unknown {
    // Convert Redux proxy objects to plain objects first
    let plainValue: unknown;
    try {
      plainValue = JSON.parse(JSON.stringify(value));
    } catch (error) {
      // If JSON serialization fails, try to handle it gracefully
      plainValue = value;
    }

    if (plainValue === null) {
      return undefined;
    }

    if (Array.isArray(plainValue)) {
      return plainValue.map((item) => this.cleanForStorage(item));
    }

    if (typeof plainValue === "object" && plainValue !== null) {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(plainValue)) {
        if (val !== null) {
          cleaned[key] = this.cleanForStorage(val);
        }
      }
      return cleaned;
    }

    return plainValue;
  }

  async setItem(storeName: string, key: string, value: unknown): Promise<void> {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        await this.ensureReady();

        return new Promise((resolve, reject) => {
          try {
            const transaction = this.db!.transaction([storeName], "readwrite");
            const store = transaction.objectStore(storeName);
            const request = store.put({
              id: key,
              data: this.cleanForStorage(value),
              timestamp: Date.now(),
            });

            request.onsuccess = () => resolve();
            request.onerror = () => {
              console.error(
                `Failed to store data in ${storeName}:`,
                request.error
              );
              reject(new Error(`Failed to store data in ${storeName}`));
            };
          } catch (error) {
            console.error(`Transaction error for ${storeName}:`, error);
            reject(new Error(`Failed to create transaction for ${storeName}`));
          }
        });
      } catch (error) {
        retryCount++;
        if (retryCount >= maxRetries) {
          console.error(
            `Failed to setItem after ${maxRetries} retries:`,
            error
          );
          throw error;
        }
        console.warn(
          `Retrying setItem (attempt ${retryCount}/${maxRetries}):`,
          error
        );
        // Wait a bit before retrying
        await new Promise((resolve) => setTimeout(resolve, 100 * retryCount));
      }
    }
  }

  async getItem(storeName: string, key: string): Promise<unknown> {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result ? result.data : null);
        };
        request.onerror = () => {
          console.error(`Failed to get data from ${storeName}:`, request.error);
          reject(new Error(`Failed to get data from ${storeName}`));
        };
      } catch (error) {
        console.error(`Transaction error for ${storeName}:`, error);
        reject(new Error(`Failed to create transaction for ${storeName}`));
      }
    });
  }

  async removeItem(storeName: string, key: string): Promise<void> {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error(
            `Failed to delete data from ${storeName}:`,
            request.error
          );
          reject(new Error(`Failed to delete data from ${storeName}`));
        };
      } catch (error) {
        console.error(`Transaction error for ${storeName}:`, error);
        reject(new Error(`Failed to create transaction for ${storeName}`));
      }
    });
  }

  async getAllItems(storeName: string): Promise<unknown[]> {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
          const results = request.result;
          resolve(results.map((item) => item.data));
        };
        request.onerror = () => {
          console.error(
            `Failed to get all data from ${storeName}:`,
            request.error
          );
          reject(new Error(`Failed to get all data from ${storeName}`));
        };
      } catch (error) {
        console.error(`Transaction error for ${storeName}:`, error);
        reject(new Error(`Failed to create transaction for ${storeName}`));
      }
    });
  }

  async clearStore(storeName: string): Promise<void> {
    await this.ensureReady();

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db!.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.error(`Failed to clear ${storeName}:`, request.error);
          reject(new Error(`Failed to clear ${storeName}`));
        };
      } catch (error) {
        console.error(`Transaction error for ${storeName}:`, error);
        reject(new Error(`Failed to create transaction for ${storeName}`));
      }
    });
  }

  async clearAllData(): Promise<void> {
    await this.ensureReady();

    try {
      // Clear all object stores
      await this.clearStore("candidates");
      await this.clearStore("interview");
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw new Error(`Failed to clear all data: ${error}`);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }

  // Method to keep connection alive
  async keepAlive(): Promise<void> {
    if (!this.isReady()) {
      await this.ensureReady();
    }
  }

  async deleteDatabase(): Promise<void> {
    // Close current connection
    await this.close();

    return new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(this.dbName);

      deleteRequest.onsuccess = () => {
        this.db = null;
        this.initPromise = null;
        resolve();
      };

      deleteRequest.onerror = () => {
        console.error("Failed to delete database:", deleteRequest.error);
        reject(new Error("Failed to delete database"));
      };

      deleteRequest.onblocked = () => {
        // Force close any remaining connections
        setTimeout(() => {
          if (deleteRequest.onsuccess) {
            deleteRequest.onsuccess(new Event("success"));
          }
        }, 100);
      };
    });
  }

  async checkDataExists(): Promise<{
    candidates: number;
    interview: number;
  }> {
    await this.ensureReady();

    try {
      const candidates = await this.getAllItems("candidates");
      const interview = await this.getAllItems("interview");

      return {
        candidates: candidates.length,
        interview: interview.length,
      };
    } catch (error) {
      console.error("Error checking data:", error);
      return { candidates: 0, interview: 0 };
    }
  }
}

export const indexedDBService = new IndexedDBService();
