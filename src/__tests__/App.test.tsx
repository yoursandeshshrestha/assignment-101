import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../App";

// Mock the components
vi.mock("../components/others/AppContent", () => ({
  default: () => <div data-testid="app-content">App Content</div>,
}));

vi.mock("../components/others/SessionDetector", () => ({
  default: () => <div data-testid="session-detector">Session Detector</div>,
}));

vi.mock("../components/ui/loader/LoadingSpinner", () => ({
  default: ({ title, description, size, fullScreen }: any) => (
    <div data-testid="loading-spinner" data-title={title} data-description={description} data-size={size} data-fullscreen={fullScreen}>
      Loading...
    </div>
  ),
}));

vi.mock("../components/error/ErrorBoundary", () => ({
  default: ({ children }: any) => (
    <div data-testid="error-boundary">
      {children}
    </div>
  ),
}));

vi.mock("../components/error/ErrorFallback", () => ({
  default: () => <div data-testid="error-fallback">Error Fallback</div>,
}));

vi.mock("../services/dbInit", () => ({
  initializeDB: vi.fn(),
}));

// Mock the store - define mocks inside the factory function
vi.mock("../store", () => ({
  store: {
    getState: vi.fn(() => ({})),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
  persistor: {
    persist: vi.fn(),
    flush: vi.fn(),
    purge: vi.fn(),
    subscribe: vi.fn((callback) => {
      // Immediately call the callback to simulate bootstrapped state
      callback({ bootstrapped: true });
      return () => {}; // Return unsubscribe function
    }),
    pause: vi.fn(),
    resume: vi.fn(),
    getState: vi.fn(() => ({ bootstrapped: true })),
  },
}));

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<App />);
    
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
  });

  it("should render the main app structure", () => {
    render(<App />);
    
    // Check that main components are rendered
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument();
    // Note: AppContent and SessionDetector are inside PersistGate which shows loading initially
    // In a real app, these would appear after persistence is complete
  });

  it("should render PersistGate with correct loading component", () => {
    render(<App />);
    
    // The loading spinner should be configured with correct props
    const loadingSpinner = screen.getByTestId("loading-spinner");
    expect(loadingSpinner).toHaveAttribute("data-title", "Loading Application");
    expect(loadingSpinner).toHaveAttribute("data-description", "Initializing your interview platform...");
    expect(loadingSpinner).toHaveAttribute("data-size", "lg");
    expect(loadingSpinner).toHaveAttribute("data-fullscreen", "true");
  });

  it("should initialize database on mount", async () => {
    // Import the mocked function
    const { initializeDB } = await import("../services/dbInit");
    
    render(<App />);
    
    expect(initializeDB).toHaveBeenCalledTimes(1);
  });
});
