import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ScoreDisplay from "../../components/ui/score/ScoreDisplay";

describe("ScoreDisplay Component", () => {
  describe("Basic Rendering", () => {
    it("should render with a score", () => {
      render(<ScoreDisplay score={85} />);

      expect(screen.getByText("85/100")).toBeInTheDocument();
      expect(screen.getByText("Score:")).toBeInTheDocument();
    });

    it("should render without a score", () => {
      render(<ScoreDisplay />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
      expect(screen.getByText("Score:")).toBeInTheDocument();
    });

    it("should render with score 0 as N/A (falsy)", () => {
      render(<ScoreDisplay score={0} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
      expect(screen.getByText("Score:")).toBeInTheDocument();
    });

    it("should render as a div element", () => {
      render(<ScoreDisplay score={75} />);

      const container = screen.getByText("75/100").closest("div");
      expect(container?.tagName).toBe("DIV");
    });
  });

  describe("Score Formatting", () => {
    it("should format score as X/100", () => {
      render(<ScoreDisplay score={92} />);

      expect(screen.getByText("92/100")).toBeInTheDocument();
    });

    it("should handle decimal scores", () => {
      render(<ScoreDisplay score={87.5} />);

      expect(screen.getByText("87.5/100")).toBeInTheDocument();
    });

    it("should handle negative scores", () => {
      render(<ScoreDisplay score={-10} />);

      expect(screen.getByText("-10/100")).toBeInTheDocument();
    });

    it("should handle very high scores", () => {
      render(<ScoreDisplay score={150} />);

      expect(screen.getByText("150/100")).toBeInTheDocument();
    });
  });

  describe("Label Display", () => {
    it("should show label by default", () => {
      render(<ScoreDisplay score={80} />);

      expect(screen.getByText("Score:")).toBeInTheDocument();
    });

    it("should hide label when showLabel is false", () => {
      render(<ScoreDisplay score={80} showLabel={false} />);

      expect(screen.getByText("80/100")).toBeInTheDocument();
      expect(screen.queryByText("Score:")).not.toBeInTheDocument();
    });

    it("should hide label even with no score", () => {
      render(<ScoreDisplay showLabel={false} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
      expect(screen.queryByText("Score:")).not.toBeInTheDocument();
    });
  });

  describe("Score Colors", () => {
    it("should apply green color for high scores (80+)", () => {
      render(<ScoreDisplay score={85} />);

      const scoreElement = screen.getByText("85/100");
      expect(scoreElement).toHaveClass("text-green-600");
    });

    it("should apply green color for perfect score (100)", () => {
      render(<ScoreDisplay score={100} />);

      const scoreElement = screen.getByText("100/100");
      expect(scoreElement).toHaveClass("text-green-600");
    });

    it("should apply yellow color for medium scores (60-79)", () => {
      render(<ScoreDisplay score={75} />);

      const scoreElement = screen.getByText("75/100");
      expect(scoreElement).toHaveClass("text-yellow-600");
    });

    it("should apply yellow color for border case (60)", () => {
      render(<ScoreDisplay score={60} />);

      const scoreElement = screen.getByText("60/100");
      expect(scoreElement).toHaveClass("text-yellow-600");
    });

    it("should apply red color for low scores (<60)", () => {
      render(<ScoreDisplay score={45} />);

      const scoreElement = screen.getByText("45/100");
      expect(scoreElement).toHaveClass("text-red-600");
    });

    it("should apply gray color for score 0 (falsy)", () => {
      render(<ScoreDisplay score={0} />);

      const scoreElement = screen.getByText("N/A");
      expect(scoreElement).toHaveClass("text-gray-500");
    });

    it("should apply gray color for undefined/null scores", () => {
      render(<ScoreDisplay />);

      const scoreElement = screen.getByText("N/A");
      expect(scoreElement).toHaveClass("text-gray-500");
    });

    it("should apply gray color for falsy scores", () => {
      render(<ScoreDisplay score={0} />);

      // Note: 0 is falsy, so it should get gray color according to getScoreColor logic
      const scoreElement = screen.getByText("N/A");
      expect(scoreElement).toHaveClass("text-gray-500");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(<ScoreDisplay score={90} className="custom-class" />);

      const container = screen.getByText("90/100").closest("div");
      expect(container).toHaveClass("custom-class");
    });

    it("should combine default and custom classes", () => {
      render(<ScoreDisplay score={70} className="my-custom-class" />);

      const container = screen.getByText("70/100").closest("div");
      expect(container).toHaveClass("my-custom-class");
      expect(container).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should handle empty className", () => {
      render(<ScoreDisplay score={80} className="" />);

      const container = screen.getByText("80/100").closest("div");
      expect(container).toHaveClass("flex", "items-center", "space-x-2");
    });
  });

  describe("Layout and Structure", () => {
    it("should have correct base classes", () => {
      render(<ScoreDisplay score={85} />);

      const container = screen.getByText("85/100").closest("div");
      expect(container).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should have label with correct classes", () => {
      render(<ScoreDisplay score={75} />);

      const label = screen.getByText("Score:");
      expect(label).toHaveClass("text-sm", "text-gray-600");
    });

    it("should have score with correct classes", () => {
      render(<ScoreDisplay score={95} />);

      const score = screen.getByText("95/100");
      expect(score).toHaveClass("text-sm", "font-semibold");
    });
  });

  describe("Accessibility", () => {
    it("should be accessible with proper text content", () => {
      render(<ScoreDisplay score={88} />);

      expect(screen.getByText("Score:")).toBeInTheDocument();
      expect(screen.getByText("88/100")).toBeInTheDocument();
    });

    it("should be accessible without label", () => {
      render(<ScoreDisplay score={65} showLabel={false} />);

      expect(screen.getByText("65/100")).toBeInTheDocument();
    });

    it("should have proper contrast with color classes", () => {
      render(<ScoreDisplay score={90} />);

      const scoreElement = screen.getByText("90/100");
      expect(scoreElement).toHaveClass("text-green-600");
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined score", () => {
      render(<ScoreDisplay score={undefined} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("should handle null score", () => {
      render(<ScoreDisplay score={null as any} />);

      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("should handle very large numbers", () => {
      render(<ScoreDisplay score={999999} />);

      expect(screen.getByText("999999/100")).toBeInTheDocument();
    });

    it("should handle decimal scores with many places", () => {
      render(<ScoreDisplay score={85.12345} />);

      expect(screen.getByText("85.12345/100")).toBeInTheDocument();
    });
  });

  describe("Integration with Color Utils", () => {
    it("should use getScoreColor function correctly", () => {
      render(<ScoreDisplay score={85} />);

      const scoreElement = screen.getByText("85/100");
      // Verify it gets the right color classes from the utility function
      expect(scoreElement).toHaveClass("text-green-600");
    });

    it("should handle all score ranges correctly", () => {
      const testCases = [
        { score: 95, expectedColor: "text-green-600" },
        { score: 80, expectedColor: "text-green-600" },
        { score: 70, expectedColor: "text-yellow-600" },
        { score: 60, expectedColor: "text-yellow-600" },
        { score: 50, expectedColor: "text-red-600" },
        { score: 0, expectedColor: "text-gray-500" },
        { score: undefined, expectedColor: "text-gray-500" },
      ];

      testCases.forEach(({ score, expectedColor }) => {
        const { unmount } = render(<ScoreDisplay score={score} />);
        // Handle the case where score is 0 (falsy) - it shows as N/A
        const expectedText =
          score !== undefined && score !== 0 ? `${score}/100` : "N/A";
        const scoreElement = screen.getByText(expectedText);
        expect(scoreElement).toHaveClass(expectedColor);
        unmount();
      });
    });
  });
});
