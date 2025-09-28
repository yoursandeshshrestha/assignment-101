import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../../store";
import {
  transformInterviewState,
  checkForActiveSession,
  checkForCompletedSession,
  syncCompletedInterview,
} from "../../store/slices/interviewSlice";

const SessionDetector: React.FC = () => {
  const dispatch = useDispatch();
  const {
    questions,
    currentQuestionIndex,
    isActive,
    showWelcomeBackModal,
    isCompleted,
  } = useSelector((state: RootState) => state.interview);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // ===== Only check once after Redux Persist has hydrated ===== //
    if (hasCheckedRef.current) {
      return;
    }

    // ===== Checking for active session after Redux Persist has hydrated ===== //
    const checkSession = () => {
      // ===== First transform the state to handle string values from localStorage ===== //
      dispatch(transformInterviewState());

      // ===== Convert string values to proper types (handles Redux Persist serialization issues) ===== //
      const isActiveBool = isActive === true || String(isActive) === "true";
      const isCompletedBool =
        isCompleted === true || String(isCompleted) === "true";
      const currentQuestionIndexNum =
        typeof currentQuestionIndex === "string"
          ? parseInt(currentQuestionIndex, 10)
          : currentQuestionIndex;

      // ===== First check for completed sessions ===== //
      if (questions.length > 0 && isCompletedBool) {
        dispatch(checkForCompletedSession());
        dispatch(syncCompletedInterview());
        hasCheckedRef.current = true;
        return;
      }

      // ===== Check if session is completed but not marked as such ===== //
      if (
        questions.length > 0 &&
        !isActiveBool &&
        currentQuestionIndexNum >= questions.length
      ) {
        dispatch(checkForCompletedSession());
        hasCheckedRef.current = true;
        return;
      }

      // ===== Check if there's an active session that needs to be resumed ===== //
      if (
        questions.length > 0 &&
        isActiveBool &&
        currentQuestionIndexNum < questions.length &&
        !showWelcomeBackModal
      ) {
        dispatch(checkForActiveSession());
      }

      // ===== Check if there's a paused session that needs to be resumed ===== //
      if (
        questions.length > 0 &&
        !isActiveBool &&
        !isCompletedBool &&
        currentQuestionIndexNum < questions.length
      ) {
        dispatch(checkForActiveSession());
      }

      hasCheckedRef.current = true;
    };

    // ===== Add a small delay to ensure Redux Persist has hydrated ===== //
    const timeoutId = setTimeout(checkSession, 1500);

    return () => clearTimeout(timeoutId);
  }, [
    dispatch,
    questions.length,
    currentQuestionIndex,
    isActive,
    showWelcomeBackModal,
    isCompleted,
  ]);

  return null; // ===== This component doesn't render anything ===== //
};

export default SessionDetector;
