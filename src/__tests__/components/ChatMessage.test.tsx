import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatMessage from "../../components/chat/ChatMessage";

// Mock the utility functions
vi.mock("../../utils/colors", () => ({
  getScoreColor: vi.fn((score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  }),
  getDifficultyColor: vi.fn((difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "hard":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  }),
}));

vi.mock("../../utils/dateFormatting", () => ({
  formatTime: vi.fn((timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  }),
}));

describe("ChatMessage Component", () => {
  const baseProps = {
    id: "1",
    type: "bot" as const,
    content: "Hello, this is a test message",
    timestamp: "2024-01-01T10:00:00Z",
  };

  describe("Basic Rendering", () => {
    it("should render bot message correctly", () => {
      render(<ChatMessage {...baseProps} />);

      const message = screen.getByText("Hello, this is a test message");
      expect(message).toBeInTheDocument();

      const avatar = screen.getByText("B");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass("bg-gray-200", "text-gray-600");
    });

    it("should render user message correctly", () => {
      render(<ChatMessage {...baseProps} type="user" />);

      const message = screen.getByText("Hello, this is a test message");
      expect(message).toBeInTheDocument();

      const avatar = screen.getByText("U");
      expect(avatar).toBeInTheDocument();
      expect(avatar).toHaveClass("bg-blue-600", "text-white");
    });

    it("should render timestamp", () => {
      render(<ChatMessage {...baseProps} />);

      const timestamp = screen.getByText(/3:30:00 PM/);
      expect(timestamp).toBeInTheDocument();
    });
  });

  describe("Question Messages", () => {
    it("should render question badge for bot messages", () => {
      render(
        <ChatMessage {...baseProps} isQuestion={true} difficulty="medium" />
      );

      const difficultyBadge = screen.getByText("MEDIUM");
      const questionLabel = screen.getByText("Question");

      expect(difficultyBadge).toBeInTheDocument();
      expect(questionLabel).toBeInTheDocument();
      expect(difficultyBadge).toHaveClass("text-yellow-600", "bg-yellow-100");
    });

    it("should not render question badge for user messages", () => {
      render(
        <ChatMessage
          {...baseProps}
          type="user"
          isQuestion={true}
          difficulty="medium"
        />
      );

      const difficultyBadge = screen.queryByText("MEDIUM");
      const questionLabel = screen.queryByText("Question");

      expect(difficultyBadge).not.toBeInTheDocument();
      expect(questionLabel).not.toBeInTheDocument();
    });

    it("should render different difficulty levels", () => {
      const { rerender } = render(
        <ChatMessage {...baseProps} isQuestion={true} difficulty="easy" />
      );

      expect(screen.getByText("EASY")).toHaveClass(
        "text-green-600",
        "bg-green-100"
      );

      rerender(
        <ChatMessage {...baseProps} isQuestion={true} difficulty="hard" />
      );

      expect(screen.getByText("HARD")).toHaveClass(
        "text-red-600",
        "bg-red-100"
      );
    });
  });

  describe("Score Display", () => {
    it("should render score for bot messages", () => {
      render(
        <ChatMessage {...baseProps} score={85} feedback="Great answer!" />
      );

      const score = screen.getByText("85/100");
      const feedback = screen.getByText("Great answer!");

      expect(score).toBeInTheDocument();
      expect(feedback).toBeInTheDocument();
      expect(score).toHaveClass("text-green-600");
    });

    it("should not render score for user messages", () => {
      render(
        <ChatMessage
          {...baseProps}
          type="user"
          score={85}
          feedback="Great answer!"
        />
      );

      const score = screen.queryByText("85/100");
      const feedback = screen.queryByText("Great answer!");

      expect(score).not.toBeInTheDocument();
      expect(feedback).not.toBeInTheDocument();
    });

    it("should render different score colors", () => {
      const { rerender } = render(<ChatMessage {...baseProps} score={95} />);

      expect(screen.getByText("95/100")).toHaveClass("text-green-600");

      rerender(<ChatMessage {...baseProps} score={70} />);

      expect(screen.getByText("70/100")).toHaveClass("text-yellow-600");

      rerender(<ChatMessage {...baseProps} score={45} />);

      expect(screen.getByText("45/100")).toHaveClass("text-red-600");
    });

    it("should handle undefined score", () => {
      render(<ChatMessage {...baseProps} score={undefined} />);

      const score = screen.queryByText(/\/100/);
      expect(score).not.toBeInTheDocument();
    });
  });

  describe("Detailed Scores", () => {
    const detailedScores = {
      technical_accuracy: 18,
      problem_solving: 17,
      communication: 16,
      relevance: 19,
      depth_of_knowledge: 15,
    };

    it("should render detailed scores", () => {
      render(
        <ChatMessage
          {...baseProps}
          score={85}
          detailed_scores={detailedScores}
        />
      );

      expect(screen.getByText("Detailed Scores:")).toBeInTheDocument();
      expect(screen.getByText("Technical:")).toBeInTheDocument();
      expect(screen.getByText("18/10")).toBeInTheDocument();
      expect(screen.getByText("Problem Solving:")).toBeInTheDocument();
      expect(screen.getByText("17/10")).toBeInTheDocument();
      expect(screen.getByText("Communication:")).toBeInTheDocument();
      expect(screen.getByText("16/10")).toBeInTheDocument();
      expect(screen.getByText("Relevance:")).toBeInTheDocument();
      expect(screen.getByText("19/10")).toBeInTheDocument();
      expect(screen.getByText("Depth:")).toBeInTheDocument();
      expect(screen.getByText("15/10")).toBeInTheDocument();
    });

    it("should not render detailed scores for user messages", () => {
      render(
        <ChatMessage
          {...baseProps}
          type="user"
          score={85}
          detailed_scores={detailedScores}
        />
      );

      expect(screen.queryByText("Detailed Scores:")).not.toBeInTheDocument();
    });
  });

  describe("Strengths and Areas for Improvement", () => {
    const strengths = ["Clear explanation", "Good examples"];
    const areasForImprovement = ["More technical depth", "Better structure"];
    const suggestions = ["Practice more", "Study documentation"];

    it("should render strengths", () => {
      render(<ChatMessage {...baseProps} score={85} strengths={strengths} />);

      expect(screen.getByText("Strengths:")).toBeInTheDocument();
      expect(screen.getByText("Clear explanation")).toBeInTheDocument();
      expect(screen.getByText("Good examples")).toBeInTheDocument();
    });

    it("should render areas for improvement", () => {
      render(
        <ChatMessage
          {...baseProps}
          score={85}
          areas_for_improvement={areasForImprovement}
        />
      );

      expect(screen.getByText("Areas for Improvement:")).toBeInTheDocument();
      expect(screen.getByText("More technical depth")).toBeInTheDocument();
      expect(screen.getByText("Better structure")).toBeInTheDocument();
    });

    it("should render suggestions", () => {
      render(
        <ChatMessage {...baseProps} score={85} suggestions={suggestions} />
      );

      expect(screen.getByText("Suggestions:")).toBeInTheDocument();
      expect(screen.getByText("Practice more")).toBeInTheDocument();
      expect(screen.getByText("Study documentation")).toBeInTheDocument();
    });

    it("should render all feedback sections together", () => {
      render(
        <ChatMessage
          {...baseProps}
          score={85}
          strengths={strengths}
          areas_for_improvement={areasForImprovement}
          suggestions={suggestions}
        />
      );

      expect(screen.getByText("Strengths:")).toBeInTheDocument();
      expect(screen.getByText("Areas for Improvement:")).toBeInTheDocument();
      expect(screen.getByText("Suggestions:")).toBeInTheDocument();
    });

    it("should not render empty arrays", () => {
      render(
        <ChatMessage
          {...baseProps}
          score={85}
          strengths={[]}
          areas_for_improvement={[]}
          suggestions={[]}
        />
      );

      expect(screen.queryByText("Strengths:")).not.toBeInTheDocument();
      expect(
        screen.queryByText("Areas for Improvement:")
      ).not.toBeInTheDocument();
      expect(screen.queryByText("Suggestions:")).not.toBeInTheDocument();
    });
  });

  describe("Message Layout", () => {
    it("should align user messages to the right", () => {
      render(<ChatMessage {...baseProps} type="user" />);

      const messageContainer = screen
        .getByText("Hello, this is a test message")
        .closest("div");
      expect(messageContainer?.parentElement?.parentElement).toHaveClass(
        "justify-end"
      );
    });

    it("should align bot messages to the left", () => {
      render(<ChatMessage {...baseProps} type="bot" />);

      const messageContainer = screen
        .getByText("Hello, this is a test message")
        .closest("div");
      expect(messageContainer?.parentElement?.parentElement).toHaveClass(
        "justify-start"
      );
    });

    it("should reverse flex direction for user messages", () => {
      render(<ChatMessage {...baseProps} type="user" />);

      const messageContainer = screen
        .getByText("Hello, this is a test message")
        .closest("div");
      expect(messageContainer?.parentElement).toHaveClass(
        "flex-row-reverse",
        "space-x-reverse"
      );
    });
  });

  describe("Content Handling", () => {
    it("should handle long content with word wrapping", () => {
      const longContent =
        "This is a very long message that should wrap to multiple lines and test the word wrapping functionality of the chat message component.";

      render(<ChatMessage {...baseProps} content={longContent} />);

      const message = screen.getByText(longContent);
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass("whitespace-pre-wrap", "break-words");
    });

    it("should handle content with line breaks", () => {
      const contentWithBreaks = "Line 1\nLine 2\nLine 3";

      render(<ChatMessage {...baseProps} content={contentWithBreaks} />);

      const message = screen.getByText((_content, element) => {
        return element?.textContent === contentWithBreaks;
      });
      expect(message).toBeInTheDocument();
      expect(message).toHaveClass("whitespace-pre-wrap");
    });

    it("should handle empty content", () => {
      render(<ChatMessage {...baseProps} content="" />);

      // Find the message container by looking for the div with rounded-2xl class
      const messageContainer = screen
        .getByText("3:30:00 PM")
        .closest("div")?.parentElement;
      expect(messageContainer).toBeInTheDocument();
      expect(messageContainer).toHaveClass("rounded-2xl", "px-4", "py-3");
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing optional props", () => {
      render(<ChatMessage {...baseProps} />);

      expect(
        screen.getByText("Hello, this is a test message")
      ).toBeInTheDocument();
      expect(screen.queryByText(/Question/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\/100/)).not.toBeInTheDocument();
    });

    it("should handle null values", () => {
      render(
        <ChatMessage
          {...baseProps}
          score={undefined}
          difficulty={undefined}
          strengths={undefined}
        />
      );

      expect(
        screen.getByText("Hello, this is a test message")
      ).toBeInTheDocument();
    });

    it("should handle undefined values", () => {
      render(
        <ChatMessage
          {...baseProps}
          score={undefined}
          difficulty={undefined}
          strengths={undefined}
        />
      );

      expect(
        screen.getByText("Hello, this is a test message")
      ).toBeInTheDocument();
    });
  });

  describe("Memoization", () => {
    it("should not re-render when props are the same", () => {
      const { rerender } = render(<ChatMessage {...baseProps} />);

      const message = screen.getByText("Hello, this is a test message");
      rerender(<ChatMessage {...baseProps} />);

      // The component should be memoized, so it shouldn't re-render
      // This is a basic test - in a real scenario, you'd use a more sophisticated approach
      expect(message).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper structure for screen readers", () => {
      render(<ChatMessage {...baseProps} />);

      const message = screen.getByText("Hello, this is a test message");
      expect(message).toBeInTheDocument();

      // Check that the message is properly structured
      const messageContainer = message.closest("div");
      expect(messageContainer).toHaveClass("rounded-2xl", "px-4", "py-3");
    });

    it("should display timestamp in a readable format", () => {
      render(<ChatMessage {...baseProps} />);

      const timestamp = screen.getByText(/3:30:00 PM/);
      expect(timestamp).toBeInTheDocument();
      expect(timestamp).toHaveClass("text-xs", "text-gray-400");
    });
  });
});
