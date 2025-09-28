import { useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import { candidateSyncService } from "../services/candidateSyncService";
import type { RootState } from "../store";

export const useCandidateSync = () => {
  const { candidateId, isActive, chatHistory, currentQuestionIndex, answers } =
    useSelector((state: RootState) => state.interview);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<{
    chatHistoryLength: number;
    currentQuestionIndex: number;
    answersLength: number;
  }>({
    chatHistoryLength: 0,
    currentQuestionIndex: 0,
    answersLength: 0,
  });

  const syncProgress = useCallback(async () => {
    if (!candidateId || !isActive) return;

    const currentState = {
      chatHistoryLength: chatHistory.length,
      currentQuestionIndex,
      answersLength: answers.length,
    };

    // Only sync if there are actual changes
    const hasChanges =
      currentState.chatHistoryLength !==
        lastSyncRef.current.chatHistoryLength ||
      currentState.currentQuestionIndex !==
        lastSyncRef.current.currentQuestionIndex ||
      currentState.answersLength !== lastSyncRef.current.answersLength;

    if (hasChanges) {
      try {
        await candidateSyncService.syncInterviewProgress(
          candidateId,
          chatHistory,
          currentQuestionIndex,
          answers
        );

        lastSyncRef.current = currentState;
      } catch (error) {
        console.error("❌ Failed to sync interview progress:", error);
      }
    }
  }, [candidateId, isActive, chatHistory, currentQuestionIndex, answers]);

  // Set up periodic sync
  useEffect(() => {
    if (!isActive || !candidateId) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
      return;
    }

    // Initial sync
    syncProgress();

    // Set up periodic sync every 5 seconds
    syncIntervalRef.current = setInterval(syncProgress, 5000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = null;
      }
    };
  }, [isActive, candidateId, syncProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, []);

  const forceSync = useCallback(async () => {
    if (candidateId && isActive) {
      try {
        await candidateSyncService.syncInterviewProgress(
          candidateId,
          chatHistory,
          currentQuestionIndex,
          answers
        );
      } catch (error) {
        console.error("❌ Forced sync failed:", error);
      }
    }
  }, [candidateId, isActive, chatHistory, currentQuestionIndex, answers]);

  return {
    forceSync,
    isSyncing: syncIntervalRef.current !== null,
  };
};
