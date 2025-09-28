import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock React DOM
const mockRender = vi.fn();
const mockCreateRoot = vi.fn(() => ({
  render: mockRender,
}));

// Mock the modules
vi.mock("react-dom/client", () => ({
  createRoot: mockCreateRoot,
}));

vi.mock("../App", () => ({
  default: () => "Mocked App Component",
}));

vi.mock("../index.css", () => ({}));

describe("main.tsx", () => {
  let mockElement: HTMLElement;
  let getElementByIdSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Create mock element
    mockElement = document.createElement("div");
    mockElement.id = "root";
    
    // Reset DOM
    document.body.innerHTML = "";
    document.body.appendChild(mockElement);
    
    // Mock getElementById
    getElementByIdSpy = vi.spyOn(document, "getElementById").mockReturnValue(mockElement);
    
    // Clear module cache to ensure fresh import
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should call createRoot with the root element", async () => {
    // Import and execute main.tsx
    await import("../main.tsx");
    
    expect(mockCreateRoot).toHaveBeenCalledWith(mockElement);
    expect(mockRender).toHaveBeenCalledTimes(1);
  });

  it("should find the root element", async () => {
    await import("../main.tsx");
    
    expect(getElementByIdSpy).toHaveBeenCalledWith("root");
  });

  it("should render with StrictMode wrapper", async () => {
    await import("../main.tsx");
    
    const renderCall = mockRender.mock.calls[0][0];
    // Check if it's StrictMode by comparing the type itself
    expect(renderCall.type).toBe(require("react").StrictMode);
  });
});
