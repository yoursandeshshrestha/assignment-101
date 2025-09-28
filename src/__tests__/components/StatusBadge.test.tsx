import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../../components/ui/status/StatusBadge";

describe("StatusBadge Component", () => {
  describe("Basic Rendering", () => {
    it("should render with a status", () => {
      render(<StatusBadge status="active" />);

      expect(screen.getByText("active")).toBeInTheDocument();
    });

    it("should render as a span element", () => {
      render(<StatusBadge status="pending" />);

      const badge = screen.getByText("pending");
      expect(badge.tagName).toBe("SPAN");
    });

    it("should have correct base classes", () => {
      render(<StatusBadge status="completed" />);

      const badge = screen.getByText("completed");
      expect(badge).toHaveClass(
        "inline-flex",
        "px-3",
        "py-1",
        "text-xs",
        "font-semibold",
        "rounded-full"
      );
    });
  });

  describe("Status Text Formatting", () => {
    it("should replace first underscore with space in status text", () => {
      render(<StatusBadge status="in_progress" />);

      expect(screen.getByText("in progress")).toBeInTheDocument();
    });

    it("should only replace first underscore (not all)", () => {
      render(<StatusBadge status="under_review_status" />);

      expect(screen.getByText("under review_status")).toBeInTheDocument();
    });

    it("should handle status with no underscores", () => {
      render(<StatusBadge status="completed" />);

      expect(screen.getByText("completed")).toBeInTheDocument();
    });

    it("should handle empty status", () => {
      render(<StatusBadge status="" />);

      // Find the span element directly since empty text causes multiple matches
      const badge = document.querySelector("span");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("");
    });
  });

  describe("Status Colors", () => {
    it("should apply green color for completed status", () => {
      render(<StatusBadge status="completed" />);

      const badge = screen.getByText("completed");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("should apply yellow color for in_progress status", () => {
      render(<StatusBadge status="in_progress" />);

      const badge = screen.getByText("in progress");
      expect(badge).toHaveClass("bg-yellow-100", "text-yellow-800");
    });

    it("should apply orange color for paused status", () => {
      render(<StatusBadge status="paused" />);

      const badge = screen.getByText("paused");
      expect(badge).toHaveClass("bg-orange-100", "text-orange-800");
    });

    it("should apply gray color for not_started status", () => {
      render(<StatusBadge status="not_started" />);

      const badge = screen.getByText("not started");
      expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
    });

    it("should apply gray color for unknown status", () => {
      render(<StatusBadge status="unknown_status" />);

      const badge = screen.getByText("unknown status");
      expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
    });

    it("should apply gray color for active status (default)", () => {
      render(<StatusBadge status="active" />);

      const badge = screen.getByText("active");
      expect(badge).toHaveClass("bg-gray-100", "text-gray-800");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(<StatusBadge status="active" className="custom-class" />);

      const badge = screen.getByText("active");
      expect(badge).toHaveClass("custom-class");
    });

    it("should combine default and custom classes", () => {
      render(<StatusBadge status="pending" className="my-custom-class" />);

      const badge = screen.getByText("pending");
      expect(badge).toHaveClass("my-custom-class");
      expect(badge).toHaveClass("inline-flex", "px-3", "py-1");
    });

    it("should handle empty className", () => {
      render(<StatusBadge status="completed" className="" />);

      const badge = screen.getByText("completed");
      expect(badge).toHaveClass("inline-flex", "px-3", "py-1");
    });
  });

  describe("Accessibility", () => {
    it("should be accessible via screen readers", () => {
      render(<StatusBadge status="active" />);

      const badge = screen.getByText("active");
      expect(badge).toBeInTheDocument();
      // The badge should be visible and readable
      expect(badge).toHaveClass("text-xs", "font-semibold");
    });

    it("should have proper contrast with background and text colors", () => {
      render(<StatusBadge status="completed" />);

      const badge = screen.getByText("completed");
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long status text", () => {
      const longStatus = "very_long_status_name_with_many_underscores";
      render(<StatusBadge status={longStatus} />);

      expect(
        screen.getByText("very long_status_name_with_many_underscores")
      ).toBeInTheDocument();
    });

    it("should handle special characters in status", () => {
      render(<StatusBadge status="status-with-dashes" />);

      expect(screen.getByText("status-with-dashes")).toBeInTheDocument();
    });

    it("should handle numbers in status", () => {
      render(<StatusBadge status="status_123" />);

      expect(screen.getByText("status 123")).toBeInTheDocument();
    });
  });

  describe("Integration with Color Utils", () => {
    it("should use getStatusColor function correctly", () => {
      // Test that the component properly integrates with the color utility
      render(<StatusBadge status="completed" />);

      const badge = screen.getByText("completed");
      // Verify it gets the right color classes from the utility function
      expect(badge).toHaveClass("bg-green-100", "text-green-800");
    });

    it("should handle all supported status types", () => {
      const statuses = ["completed", "in_progress", "paused", "not_started"];

      statuses.forEach((status) => {
        const { unmount } = render(<StatusBadge status={status} />);
        const expectedText = status.replace("_", " ");
        expect(screen.getByText(expectedText)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
