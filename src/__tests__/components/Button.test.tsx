import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Button from "../../components/ui/button/Button";

describe("Button Component", () => {
  describe("Basic Rendering", () => {
    it("should render with default props", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("bg-blue-600", "text-white", "px-6", "h-12", "text-xl");
    });

    it("should render with custom children", () => {
      render(<Button>Custom Text</Button>);

      const button = screen.getByRole("button", { name: /custom text/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Custom Text");
    });

    it("should render without children", () => {
      render(<Button />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render primary variant by default", () => {
      render(<Button>Primary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-blue-600", "text-white", "hover:bg-blue-700");
    });

    it("should render secondary variant", () => {
      render(<Button variant="secondary">Secondary</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
    });

    it("should render danger variant", () => {
      render(<Button variant="danger">Danger</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("bg-red-600", "text-white", "hover:bg-red-700");
    });
  });

  describe("Sizes", () => {
    it("should render small size", () => {
      render(<Button size="sm">Small</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-4", "py-2", "text-sm");
    });

    it("should render medium size by default", () => {
      render(<Button size="md">Medium</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-6", "h-12", "text-xl");
    });

    it("should render large size", () => {
      render(<Button size="lg">Large</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("px-8", "py-4", "text-lg");
    });
  });

  describe("Disabled State", () => {
    it("should render disabled button", () => {
      render(<Button disabled>Disabled</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("should render loading button as disabled", () => {
      render(<Button loading>Loading</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    it("should render enabled button by default", () => {
      render(<Button>Enabled</Button>);

      const button = screen.getByRole("button");
      expect(button).not.toBeDisabled();
      expect(button).not.toHaveClass("opacity-50", "cursor-not-allowed");
    });
  });

  describe("Custom Styling", () => {
    it("should apply custom className", () => {
      render(<Button className="custom-class">Custom</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("custom-class");
    });

    it("should combine default and custom classes", () => {
      render(<Button className="my-custom-class">Custom</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("my-custom-class");
      expect(button).toHaveClass("inline-flex", "items-center", "justify-center");
    });
  });

  describe("Base Classes", () => {
    it("should have correct base classes", () => {
      render(<Button>Base</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "inline-flex",
        "items-center",
        "justify-center",
        "font-medium",
        "rounded-lg",
        "transition-colors",
        "duration-300",
        "ease-in-out",
        "cursor-pointer"
      );
    });
  });

  describe("Accessibility", () => {
    it("should be accessible via screen readers", () => {
      render(<Button>Accessible</Button>);

      const button = screen.getByRole("button", { name: /accessible/i });
      expect(button).toBeInTheDocument();
    });

    it("should be accessible when disabled", () => {
      render(<Button disabled>Disabled Accessible</Button>);

      const button = screen.getByRole("button", {
        name: /disabled accessible/i,
      });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("should have proper button role", () => {
      render(<Button>Role Test</Button>);

      const button = screen.getByRole("button");
      expect(button.tagName).toBe("BUTTON");
    });
  });
});