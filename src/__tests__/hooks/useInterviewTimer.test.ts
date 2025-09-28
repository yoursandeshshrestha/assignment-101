import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { useInterviewTimer } from "../../hooks/useInterviewTimer";
import interviewSlice from "../../store/slices/interviewSlice";
import { mockQuestions } from "../../test-utils/mockData";
import * as useTimerModule from "../../hooks/useTimer";

// Mock the useTimer hook

// Create a mock that returns a new instance each time
vi.mock("../../hooks/useTimer", () => ({
  useTimer: vi.fn(() => ({
    time: 0,
    isRunning: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
    setTime: vi.fn(),
  })),
}));

// Mock candidateSyncService
vi.mock("../../services/candidateSyncService", () => ({
  candidateSyncService: {
    syncInterviewStartWithId: vi.fn(),
    syncInterviewPause: vi.fn(),
    syncInterviewResume: vi.fn(),
  },
}));

// Create a test store
const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      interview: interviewSlice,
    },
    preloadedState: {
      interview: {
        isActive: false,
        currentQuestion: undefined,
        timeRemaining: undefined,
        questions: [],
        answers: [],
        currentQuestionIndex: 0,
        showWelcomeBackModal: false,
        showPauseModal: false,
        sessionId: undefined,
        startTime: undefined,
        endTime: undefined,
        lastActivityTime: undefined,
        pauseTime: undefined,
        isCompleted: false,
        candidateInfo: undefined,
        candidateId: undefined,
        chatHistory: [],
        ...initialState,
      },
    },
  });
};

// Wrapper component for Redux
const wrapper = ({
  store,
  children,
}: {
  children: React.ReactNode;
  store: ReturnType<typeof createTestStore>;
}) => React.createElement(Provider, { store, children });

describe("useInterviewTimer", () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = createTestStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initial State", () => {
    it("should return initial values when interview is not active", () => {
      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.timeRemaining).toBeUndefined();
      expect(result.current.isTimeRunning).toBe(false);
      expect(typeof result.current.formatTime).toBe("function");
      expect(typeof result.current.getTimeColor).toBe("function");
    });

    it("should return values when interview is active", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 60,
        currentQuestion: mockQuestions[0],
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.timeRemaining).toBe(60);
      expect(result.current.isTimeRunning).toBe(true);
    });
  });

  describe("formatTime", () => {
    it("should format time correctly", () => {
      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.formatTime(0)).toBe("0:00");
      expect(result.current.formatTime(30)).toBe("0:30");
      expect(result.current.formatTime(60)).toBe("1:00");
      expect(result.current.formatTime(90)).toBe("1:30");
      expect(result.current.formatTime(125)).toBe("2:05");
    });

    it("should handle edge cases", () => {
      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.formatTime(59)).toBe("0:59");
      expect(result.current.formatTime(119)).toBe("1:59");
      expect(result.current.formatTime(3600)).toBe("60:00");
    });
  });

  describe("getTimeColor", () => {
    it("should return correct colors based on time remaining", () => {
      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.getTimeColor(5)).toBe("text-red-600");
      expect(result.current.getTimeColor(10)).toBe("text-red-600");
      expect(result.current.getTimeColor(15)).toBe("text-yellow-600");
      expect(result.current.getTimeColor(30)).toBe("text-yellow-600");
      expect(result.current.getTimeColor(35)).toBe("text-gray-700");
      expect(result.current.getTimeColor(60)).toBe("text-gray-700");
    });

    it("should handle edge cases", () => {
      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.getTimeColor(0)).toBe("text-red-600");
      expect(result.current.getTimeColor(1)).toBe("text-red-600");
      expect(result.current.getTimeColor(11)).toBe("text-yellow-600");
      expect(result.current.getTimeColor(31)).toBe("text-gray-700");
    });
  });

  describe("Timer Control", () => {
    it("should start timer when interview is active and time remaining", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 60,
      });

      const mockStart = vi.fn();
      vi.mocked(useTimerModule.useTimer).mockReturnValue({
        time: 0,
        isRunning: false,
        start: mockStart,
        pause: vi.fn(),
        reset: vi.fn(),
        setTime: vi.fn(),
      });

      renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(mockStart).toHaveBeenCalled();
    });

    it("should pause timer when interview is not active", () => {
      store = createTestStore({
        isActive: false,
        timeRemaining: 60,
      });

      const mockPause = vi.fn();
      vi.mocked(useTimerModule.useTimer).mockReturnValue({
        time: 0,
        isRunning: false,
        start: vi.fn(),
        pause: mockPause,
        reset: vi.fn(),
        setTime: vi.fn(),
      });

      renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(mockPause).toHaveBeenCalled();
    });

    it("should pause timer when time remaining is 0", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 0,
      });

      const mockPause = vi.fn();
      vi.mocked(useTimerModule.useTimer).mockReturnValue({
        time: 0,
        isRunning: false,
        start: vi.fn(),
        pause: mockPause,
        reset: vi.fn(),
        setTime: vi.fn(),
      });

      renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(mockPause).toHaveBeenCalled();
    });

    it("should reset timer when timeRemaining changes", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 60,
      });

      const mockReset = vi.fn();
      vi.mocked(useTimerModule.useTimer).mockReturnValue({
        time: 0,
        isRunning: false,
        start: vi.fn(),
        pause: vi.fn(),
        reset: mockReset,
        setTime: vi.fn(),
      });

      const { rerender } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      // Update timeRemaining
      act(() => {
        store.dispatch({
          type: "interview/updateTimeRemaining",
          payload: 30,
        });
      });

      rerender();

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe("Time Expiration Handling", () => {
    it("should handle time expiration", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 1,
        currentQuestion: mockQuestions[0],
      });

      let capturedOnTick: ((time: number) => void) | undefined;

      // Mock useTimer to capture the onTick callback
      vi.mocked(useTimerModule.useTimer).mockImplementation(
        (options?: { onTick?: (time: number) => void }) => {
          capturedOnTick = options?.onTick;
          return {
            time: 0,
            isRunning: false,
            start: vi.fn(),
            pause: vi.fn(),
            reset: vi.fn(),
            setTime: vi.fn(),
          };
        }
      );

      renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      // Simulate time expiration by calling the captured onTick function
      act(() => {
        if (capturedOnTick) {
          capturedOnTick(1); // Simulate tick when time is 1
        }
      });

      // Check that submitAnswer was called with time expired answer
      const state = store.getState().interview;
      expect(state.answers).toHaveLength(1);
      expect(state.answers[0].answer).toBe("Time expired - no answer provided");
      expect(state.answers[0].score).toBe(0);
    });

    it("should not handle time expiration if already submitting", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 1,
        currentQuestion: mockQuestions[0],
      });

      let capturedOnTick: ((time: number) => void) | undefined;

      // Mock useTimer to capture the onTick callback
      vi.mocked(useTimerModule.useTimer).mockImplementation(
        (options?: { onTick?: (time: number) => void }) => {
          capturedOnTick = options?.onTick;
          return {
            time: 0,
            isRunning: false,
            start: vi.fn(),
            pause: vi.fn(),
            reset: vi.fn(),
            setTime: vi.fn(),
          };
        }
      );

      renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      // Simulate multiple rapid time expirations
      act(() => {
        if (capturedOnTick) {
          capturedOnTick(1);
          capturedOnTick(1);
          capturedOnTick(1);
        }
      });

      // Should only submit one answer
      const state = store.getState().interview;
      expect(state.answers).toHaveLength(1);
    });
  });

  describe("isTimeRunning", () => {
    it("should return true when interview is active and time remaining", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 60,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(true);
    });

    it("should return false when interview is not active", () => {
      store = createTestStore({
        isActive: false,
        timeRemaining: 60,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(false);
    });

    it("should return false when time remaining is undefined", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: undefined,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(false);
    });

    it("should return false when time remaining is 0", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 0,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined currentQuestion", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 1,
        currentQuestion: undefined,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(true);
    });

    it("should handle negative time remaining", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: -5,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(false);
    });

    it("should handle very large time remaining", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 999999,
      });

      const { result } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(true);
      expect(result.current.formatTime(999999)).toBe("16666:39");
    });
  });

  describe("Integration with Redux", () => {
    it("should update time remaining when Redux state changes", () => {
      store = createTestStore({
        isActive: true,
        timeRemaining: 60,
      });

      const { result, rerender } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.timeRemaining).toBe(60);

      // Update Redux state
      act(() => {
        store.dispatch({
          type: "interview/updateTimeRemaining",
          payload: 30,
        });
      });

      rerender();

      expect(result.current.timeRemaining).toBe(30);
    });

    it("should respond to interview state changes", () => {
      store = createTestStore({
        isActive: false,
        timeRemaining: 60,
      });

      const { result, rerender } = renderHook(() => useInterviewTimer(), {
        wrapper: ({ children }) => wrapper({ children, store }),
      });

      expect(result.current.isTimeRunning).toBe(false);

      // Start interview
      act(() => {
        store.dispatch({
          type: "interview/startInterview",
          payload: mockQuestions,
        });
      });

      rerender();

      expect(result.current.isTimeRunning).toBe(true);
    });
  });
});
