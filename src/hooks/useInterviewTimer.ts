import { useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateTimeRemaining,
  submitAnswer,
} from "../store/slices/interviewSlice";
import type { RootState } from "../store";
import { useTimer } from "./useTimer";

export const useInterviewTimer = () => {
  const dispatch = useDispatch();
  const { isActive, timeRemaining, currentQuestion } = useSelector(
    (state: RootState) => state.interview
  );

  const isSubmittingRef = useRef(false);

  const handleTimeUp = useCallback(() => {
    if (currentQuestion && !isSubmittingRef.current) {
      isSubmittingRef.current = true;

      const timeExpiredAnswer = {
        questionId: currentQuestion.id,
        answer: "Time expired - no answer provided",
        score: 0,
        feedback: "No answer provided within the time limit",
        timeSpent: currentQuestion.timeLimit,
        timestamp: new Date().toISOString(),
        detailed_scores: {
          technical_accuracy: 0,
          problem_solving: 0,
          communication: 0,
          relevance: 0,
          depth_of_knowledge: 0,
        },
        strengths: [],
        areas_for_improvement: [
          "Please provide an answer within the time limit",
        ],
        suggestions: [
          "Try to answer more quickly or ask for clarification if needed",
        ],
      };

      dispatch(submitAnswer(timeExpiredAnswer));

      // Reset the submitting flag after a short delay
      setTimeout(() => {
        isSubmittingRef.current = false;
      }, 1000);
    }
  }, [dispatch, currentQuestion]);

  // Use the generic timer hook for countdown functionality
  const timer = useTimer({
    initialTime: 0,
    interval: 1000,
    onTick: () => {
      if (timeRemaining && timeRemaining > 0) {
        const newTime = timeRemaining - 1;
        dispatch(updateTimeRemaining(newTime));

        if (newTime <= 0) {
          handleTimeUp();
        }
      }
    },
  });

  // Control the timer based on interview state
  useEffect(() => {
    if (isActive && timeRemaining && timeRemaining > 0) {
      timer.start();
    } else {
      timer.pause();
    }
  }, [isActive, timeRemaining, timer]);

  // Reset timer when timeRemaining changes (new question)
  useEffect(() => {
    if (timeRemaining !== undefined) {
      timer.reset();
    }
  }, [timeRemaining, timer]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const getTimeColor = useCallback((time: number): string => {
    if (time <= 10) return "text-red-600";
    if (time <= 30) return "text-yellow-600";
    return "text-gray-700";
  }, []);

  return {
    timeRemaining,
    formatTime,
    getTimeColor,
    isTimeRunning: isActive && timeRemaining !== undefined && timeRemaining > 0,
  };
};
