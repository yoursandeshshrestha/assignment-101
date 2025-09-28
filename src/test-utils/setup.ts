import "@testing-library/jest-dom";
import { afterAll, beforeAll, vi } from "vitest";

// Mock IndexedDB
const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: {
        createObjectStore: vi.fn(),
        objectStoreNames: {
          contains: vi.fn(() => false),
        },
        transaction: vi.fn(() => ({
          objectStore: vi.fn(() => ({
            put: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
            get: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
            delete: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
            getAll: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
            clear: vi.fn(() => ({
              onsuccess: null,
              onerror: null,
            })),
          })),
        })),
        close: vi.fn(),
      },
      target: null,
    };
    // Set target to point to the request itself
    (request as any).target = request;
    return request;
  }),
  deleteDatabase: vi.fn(() => ({
    onsuccess: null,
    onerror: null,
    onblocked: null,
  })),
};

// Mock global IndexedDB
Object.defineProperty(global, "indexedDB", {
  value: mockIndexedDB,
  writable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock timers globally
vi.useFakeTimers();

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Warning: ReactDOM.render is no longer supported")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  vi.useRealTimers();
});
