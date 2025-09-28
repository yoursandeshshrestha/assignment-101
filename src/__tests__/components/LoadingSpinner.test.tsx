import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingSpinner from "../../components/ui/loader/LoadingSpinner";

describe("LoadingSpinner Component", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<LoadingSpinner />);

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("should render with custom title", () => {
      render(<LoadingSpinner title="Custom Loading" />);

      expect(screen.getByText("Custom Loading")).toBeInTheDocument();
    });

    it("should render with description when provided", () => {
      render(
        <LoadingSpinner
          title="Loading Data"
          description="Please wait while we fetch your data..."
        />
      );

      expect(screen.getByText("Loading Data")).toBeInTheDocument();
      expect(
        screen.getByText("Please wait while we fetch your data...")
      ).toBeInTheDocument();
    });

    it("should not render description when not provided", () => {
      render(<LoadingSpinner title="Loading" />);

      expect(screen.getByText("Loading")).toBeInTheDocument();
      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("should render with small size", () => {
      render(<LoadingSpinner size="sm" />);

      const spinner = document.querySelector("svg");
      expect(spinner).toHaveClass("w-4", "h-4");
    });

    it("should render with medium size (default)", () => {
      render(<LoadingSpinner size="md" />);

      const spinner = document.querySelector("svg");
      expect(spinner).toHaveClass("w-6", "h-6");
    });

    it("should render with large size", () => {
      render(<LoadingSpinner size="lg" />);

      const spinner = document.querySelector("svg");
      expect(spinner).toHaveClass("w-8", "h-8");
    });
  });

  describe("Full Screen Mode", () => {
    it("should render in full screen mode", () => {
      render(<LoadingSpinner fullScreen={true} />);

      const container = screen.getByText("Loading...").closest("div");
      expect(container?.parentElement).toHaveClass(
        "fixed",
        "inset-0",
        "bg-white",
        "flex",
        "items-center",
        "justify-center",
        "z-50"
      );
    });

    it("should render in normal mode by default", () => {
      render(<LoadingSpinner />);

      const container = screen.getByText("Loading...").closest("div");
      expect(container?.parentElement).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "p-8"
      );
      expect(container?.parentElement).not.toHaveClass("fixed", "inset-0");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(<LoadingSpinner className="custom-class" />);

      const container = screen.getByText("Loading...").closest("div");
      expect(container?.parentElement).toHaveClass("custom-class");
    });

    it("should apply both default and custom classes", () => {
      render(<LoadingSpinner className="my-custom-class" />);

      const container = screen.getByText("Loading...").closest("div");
      expect(container?.parentElement).toHaveClass("my-custom-class");
      expect(container?.parentElement).toHaveClass(
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });

  describe("Title Size Classes", () => {
    it("should apply correct title size for small", () => {
      render(<LoadingSpinner size="sm" title="Small Title" />);

      const title = screen.getByText("Small Title");
      expect(title).toHaveClass("text-lg");
    });

    it("should apply correct title size for medium", () => {
      render(<LoadingSpinner size="md" title="Medium Title" />);

      const title = screen.getByText("Medium Title");
      expect(title).toHaveClass("text-xl");
    });

    it("should apply correct title size for large", () => {
      render(<LoadingSpinner size="lg" title="Large Title" />);

      const title = screen.getByText("Large Title");
      expect(title).toHaveClass("text-2xl");
    });
  });

  describe("Spinner Animation", () => {
    it("should have spinning animation", () => {
      render(<LoadingSpinner />);

      const spinner = document.querySelector("svg");
      expect(spinner).toHaveClass("animate-spin");
    });

    it("should have blue color theme", () => {
      render(<LoadingSpinner />);

      const spinner = document.querySelector("svg");
      expect(spinner).toHaveClass("text-blue-600");
    });
  });

  describe("Accessibility", () => {
    it("should have proper semantic structure", () => {
      render(
        <LoadingSpinner title="Loading content" description="Please wait" />
      );

      // Should have a heading for the title
      expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
        "Loading content"
      );

      // Should have the SVG spinner element
      expect(document.querySelector("svg")).toBeInTheDocument();
    });

    it("should be centered in container", () => {
      render(<LoadingSpinner />);

      const container = screen.getByText("Loading...").closest("div");
      expect(container?.parentElement).toHaveClass(
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });
});
