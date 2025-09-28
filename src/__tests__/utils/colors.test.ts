import { describe, it, expect } from "vitest";
import {
  getScoreColor,
  getStatusColor,
  getDifficultyColor,
} from "../../utils/colors";

describe("getScoreColor", () => {
  it("should return gray for undefined score", () => {
    const result = getScoreColor(undefined);
    expect(result).toBe("text-gray-500");
  });

  it("should return gray for null score", () => {
    const result = getScoreColor(null as unknown as number);
    expect(result).toBe("text-gray-500");
  });

  it("should return gray for 0 score", () => {
    const result = getScoreColor(0);
    expect(result).toBe("text-gray-500");
  });

  it("should return green for high scores (80+)", () => {
    const highScores = [80, 85, 90, 95, 100];
    highScores.forEach((score) => {
      const result = getScoreColor(score);
      expect(result).toBe("text-green-600");
    });
  });

  it("should return yellow for medium scores (60-79)", () => {
    const mediumScores = [60, 65, 70, 75, 79];
    mediumScores.forEach((score) => {
      const result = getScoreColor(score);
      expect(result).toBe("text-yellow-600");
    });
  });

  it("should return red for low scores (below 60)", () => {
    const lowScores = [10, 20, 30, 40, 50, 59];
    lowScores.forEach((score) => {
      const result = getScoreColor(score);
      expect(result).toBe("text-red-600");
    });
  });

  it("should handle edge cases correctly", () => {
    expect(getScoreColor(79.9)).toBe("text-yellow-600");
    expect(getScoreColor(80.1)).toBe("text-green-600");
    expect(getScoreColor(59.9)).toBe("text-red-600");
    expect(getScoreColor(60.1)).toBe("text-yellow-600");
  });
});

describe("getStatusColor", () => {
  it("should return correct colors for valid statuses", () => {
    const statusTests = [
      { status: "completed", expected: "bg-green-100 text-green-800" },
      { status: "in_progress", expected: "bg-yellow-100 text-yellow-800" },
      { status: "paused", expected: "bg-orange-100 text-orange-800" },
      { status: "not_started", expected: "bg-gray-100 text-gray-800" },
    ];

    statusTests.forEach(({ status, expected }) => {
      const result = getStatusColor(status);
      expect(result).toBe(expected);
    });
  });

  it("should return default gray for invalid statuses", () => {
    const invalidStatuses = [
      "invalid",
      "unknown",
      "pending",
      "cancelled",
      "",
      null,
      undefined,
    ];

    invalidStatuses.forEach((status) => {
      const result = getStatusColor(status as unknown as string);
      expect(result).toBe("bg-gray-100 text-gray-800");
    });
  });

  it("should be case sensitive", () => {
    expect(getStatusColor("COMPLETED")).toBe("bg-gray-100 text-gray-800");
    expect(getStatusColor("Completed")).toBe("bg-gray-100 text-gray-800");
    expect(getStatusColor("completed")).toBe("bg-green-100 text-green-800");
  });
});

describe("getDifficultyColor", () => {
  it("should return correct colors for valid difficulties", () => {
    const difficultyTests = [
      { difficulty: "easy", expected: "text-green-600 bg-green-100" },
      { difficulty: "medium", expected: "text-yellow-600 bg-yellow-100" },
      { difficulty: "hard", expected: "text-red-600 bg-red-100" },
    ];

    difficultyTests.forEach(({ difficulty, expected }) => {
      const result = getDifficultyColor(difficulty);
      expect(result).toBe(expected);
    });
  });

  it("should return default gray for invalid difficulties", () => {
    const invalidDifficulties = [
      "invalid",
      "unknown",
      "beginner",
      "expert",
      "",
      null,
      undefined,
    ];

    invalidDifficulties.forEach((difficulty) => {
      const result = getDifficultyColor(difficulty as unknown as string);
      expect(result).toBe("text-gray-600 bg-gray-100");
    });
  });

  it("should be case sensitive", () => {
    expect(getDifficultyColor("EASY")).toBe("text-gray-600 bg-gray-100");
    expect(getDifficultyColor("Easy")).toBe("text-gray-600 bg-gray-100");
    expect(getDifficultyColor("easy")).toBe("text-green-600 bg-green-100");
  });

  it("should handle empty string", () => {
    const result = getDifficultyColor("");
    expect(result).toBe("text-gray-600 bg-gray-100");
  });
});

describe("Color utility functions integration", () => {
  it("should work together in typical use cases", () => {
    // Simulate a typical interview scenario
    const candidate = {
      score: 85,
      status: "completed",
      questionDifficulty: "medium",
    };

    const scoreColor = getScoreColor(candidate.score);
    const statusColor = getStatusColor(candidate.status);
    const difficultyColor = getDifficultyColor(candidate.questionDifficulty);

    expect(scoreColor).toBe("text-green-600");
    expect(statusColor).toBe("bg-green-100 text-green-800");
    expect(difficultyColor).toBe("text-yellow-600 bg-yellow-100");
  });

  it("should handle edge cases consistently", () => {
    // Test with undefined values
    const undefinedScore = getScoreColor(undefined);
    const undefinedStatus = getStatusColor(undefined as unknown as string);
    const undefinedDifficulty = getDifficultyColor(undefined);

    expect(undefinedScore).toBe("text-gray-500");
    expect(undefinedStatus).toBe("bg-gray-100 text-gray-800");
    expect(undefinedDifficulty).toBe("text-gray-600 bg-gray-100");
  });
});
