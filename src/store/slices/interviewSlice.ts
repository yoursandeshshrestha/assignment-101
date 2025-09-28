import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { InterviewQuestion, InterviewAnswer } from "../../types";
import { candidateSyncService } from "../../services/candidateSyncService";

interface InterviewState {
  isActive: boolean;
  currentQuestion?: InterviewQuestion;
  timeRemaining?: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  currentQuestionIndex: number;
  showWelcomeBackModal: boolean;
  showPauseModal: boolean;
  sessionId?: string;
  startTime?: string;
  endTime?: string;
  lastActivityTime?: string;
  pauseTime?: string;
  isCompleted: boolean;
  candidateInfo?: {
    name: string;
    email: string;
    phone: string;
    resumeText?: string;
  };
  candidateId?: string; // Track the candidate ID for synchronization
  chatHistory: Array<{
    id: string;
    type: "bot" | "user";
    content: string;
    timestamp: string;
    isQuestion?: boolean;
    difficulty?: string;
    questionId?: string;
    score?: number;
    feedback?: string;
  }>;
}

const initialState: InterviewState = {
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
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    // Transform function to handle data type conversion during rehydration
    transformInterviewState: (state) => {
      // Convert string values back to proper types
      if (typeof state.isActive === "string") {
        state.isActive = state.isActive === "true";
      }
      if (typeof state.isCompleted === "string") {
        state.isCompleted = state.isCompleted === "true";
      }
      if (typeof state.currentQuestionIndex === "string") {
        state.currentQuestionIndex = parseInt(state.currentQuestionIndex, 10);
      }
      if (typeof state.timeRemaining === "string") {
        state.timeRemaining = parseInt(state.timeRemaining, 10);
      }
      if (typeof state.showWelcomeBackModal === "string") {
        state.showWelcomeBackModal = state.showWelcomeBackModal === "true";
      }
      if (typeof state.showPauseModal === "string") {
        state.showPauseModal = state.showPauseModal === "true";
      }

      // Convert chat history timestamps from Date objects to strings if needed
      if (state.chatHistory && state.chatHistory.length > 0) {
        state.chatHistory = state.chatHistory.map((message) => ({
          ...message,
          timestamp:
            typeof message.timestamp === "object" &&
            message.timestamp !== null &&
            (message.timestamp as unknown) instanceof Date
              ? (message.timestamp as Date).toISOString()
              : message.timestamp,
        }));
      }

      // Convert answers timestamps from Date objects to strings if needed
      if (state.answers && state.answers.length > 0) {
        state.answers = state.answers.map((answer) => ({
          ...answer,
          timestamp:
            typeof answer.timestamp === "object" &&
            answer.timestamp !== null &&
            (answer.timestamp as unknown) instanceof Date
              ? (answer.timestamp as Date).toISOString()
              : answer.timestamp,
        }));
      }
    },
    startInterview: (state, action: PayloadAction<InterviewQuestion[]>) => {
      state.isActive = true;
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.currentQuestion = action.payload[0];
      state.timeRemaining = action.payload[0]?.timeLimit;
      state.answers = [];
      state.sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      state.startTime = new Date().toISOString();
      state.lastActivityTime = new Date().toISOString();

      // Create candidate in IndexedDB if candidate info is available
      if (state.candidateInfo) {
        const candidateId = `candidate_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;
        state.candidateId = candidateId;

        // Async operation - will be handled by middleware or component
        candidateSyncService
          .syncInterviewStartWithId(candidateId, {
            name: state.candidateInfo.name,
            email: state.candidateInfo.email,
            phone: state.candidateInfo.phone,
            resumeText: state.candidateInfo.resumeText,
          })
          .then(() => {})
          .catch(() => {});
      }
    },
    pauseInterview: (state) => {
      state.isActive = false;
      state.showPauseModal = true;
      state.pauseTime = new Date().toISOString();

      // Sync pause status to candidate
      if (state.candidateId) {
        candidateSyncService.syncInterviewPause(state.candidateId);
      }
    },
    resumeInterview: (state) => {
      state.isActive = true;
      state.showWelcomeBackModal = false;
      state.showPauseModal = false;
      state.lastActivityTime = new Date().toISOString();

      // Sync resume status to candidate
      if (state.candidateId) {
        candidateSyncService.syncInterviewResume(state.candidateId);
      }

      // Calculate remaining time after pause or page reload
      if (state.currentQuestion && state.timeRemaining) {
        let timeToSubtract = 0;

        // If there was a pause time, calculate pause duration
        if (state.pauseTime) {
          timeToSubtract = Math.floor(
            (new Date().getTime() - new Date(state.pauseTime).getTime()) / 1000
          );
        } else if (state.lastActivityTime) {
          // If no pause time but there's last activity time, calculate time since last activity
          // This handles page reload scenarios
          timeToSubtract = Math.floor(
            (new Date().getTime() -
              new Date(state.lastActivityTime).getTime()) /
              1000
          );
        }

        const newTimeRemaining = Math.max(
          0,
          state.timeRemaining - timeToSubtract
        );
        state.timeRemaining = newTimeRemaining;
      }

      state.pauseTime = undefined;
    },
    submitAnswer: (state, action: PayloadAction<InterviewAnswer>) => {
      const answer = action.payload;
      state.answers.push(answer);
      state.currentQuestionIndex += 1;
      state.lastActivityTime = new Date().toISOString();

      // Add scoring feedback to chat history
      const feedbackMessage = {
        id: `feedback-${Date.now()}`,
        type: "bot" as const,
        content: `Your answer has been scored: ${answer.score}/100`,
        timestamp: new Date().toISOString(),
        score: answer.score,
        feedback: answer.feedback,
        detailed_scores: answer.detailed_scores,
        strengths: answer.strengths,
        areas_for_improvement: answer.areas_for_improvement,
        suggestions: answer.suggestions,
      };
      state.chatHistory.push(feedbackMessage);

      if (state.currentQuestionIndex < state.questions.length) {
        state.currentQuestion = state.questions[state.currentQuestionIndex];
        state.timeRemaining = state.currentQuestion.timeLimit;
      } else {
        state.isActive = false;
        state.currentQuestion = undefined;
        state.timeRemaining = undefined;
        state.isCompleted = true;
        state.endTime = new Date().toISOString();

        // Immediately sync candidate completion data when interview is completed
        if (state.candidateId && state.candidateInfo) {
          const averageScore =
            state.answers.length > 0
              ? Math.round(
                  state.answers.reduce((sum, answer) => sum + answer.score, 0) /
                    state.answers.length
                )
              : 0;

          const summary = `Completed interview with ${averageScore}% average score. Answered ${state.answers.length}/${state.questions.length} questions.`;

          // Sync completion data immediately
          candidateSyncService
            .syncInterviewComplete(
              state.candidateId,
              averageScore,
              summary,
              state.chatHistory,
              state.answers
            )
            .catch(() => {});
        }
      }
    },
    updateTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    endInterview: (state) => {
      state.isActive = false;
      state.currentQuestion = undefined;
      state.timeRemaining = undefined;
      state.showWelcomeBackModal = false;
      state.isCompleted = true;
      state.endTime = new Date().toISOString();
    },
    completeInterview: (state) => {
      state.isActive = false;
      state.currentQuestion = undefined;
      state.timeRemaining = undefined;
      state.showWelcomeBackModal = false;
      state.isCompleted = true;
      state.endTime = new Date().toISOString();

      // Immediately sync candidate completion data
      if (state.candidateId && state.candidateInfo) {
        const averageScore =
          state.answers.length > 0
            ? Math.round(
                state.answers.reduce((sum, answer) => sum + answer.score, 0) /
                  state.answers.length
              )
            : 0;

        const summary = `Completed interview with ${averageScore}% average score. Answered ${state.answers.length}/${state.questions.length} questions.`;

        // Sync completion data immediately
        candidateSyncService
          .syncInterviewComplete(
            state.candidateId,
            averageScore,
            summary,
            state.chatHistory,
            state.answers
          )
          .catch(() => {});
      }
    },
    setShowWelcomeBackModal: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBackModal = action.payload;
    },
    setShowPauseModal: (state, action: PayloadAction<boolean>) => {
      state.showPauseModal = action.payload;
    },
    confirmPause: (state) => {
      state.showPauseModal = false;
      state.showWelcomeBackModal = true;
    },
    resetInterview: () => {
      return initialState;
    },
    restoreSession: (
      state,
      action: PayloadAction<{
        questions: InterviewQuestion[];
        answers: InterviewAnswer[];
        currentQuestionIndex: number;
        sessionId: string;
        startTime: string;
      }>
    ) => {
      state.isActive = true;
      state.questions = action.payload.questions;
      state.answers = action.payload.answers;
      state.currentQuestionIndex = action.payload.currentQuestionIndex;
      state.sessionId = action.payload.sessionId;
      state.startTime = action.payload.startTime;
      state.lastActivityTime = new Date().toISOString();
      state.pauseTime = undefined;

      if (state.currentQuestionIndex < state.questions.length) {
        state.currentQuestion = state.questions[state.currentQuestionIndex];
        state.timeRemaining = state.currentQuestion.timeLimit;
      } else {
        state.isActive = false;
        state.currentQuestion = undefined;
        state.timeRemaining = undefined;
      }
    },
    updateLastActivity: (state) => {
      state.lastActivityTime = new Date().toISOString();
    },
    checkForActiveSession: (state) => {
      // Check if there's a completed session
      if (state.questions.length > 0 && state.isCompleted) {
        return;
      }

      // Check if there's an active interview session that needs to be resumed
      if (
        state.questions.length > 0 &&
        state.isActive &&
        state.currentQuestionIndex < state.questions.length
      ) {
        // Update last activity time to current time for proper timing calculation
        state.lastActivityTime = new Date().toISOString();

        // Session is active, show welcome back modal
        state.showWelcomeBackModal = true;
      }
      // Check if there's a paused session that needs to be resumed
      else if (
        state.questions.length > 0 &&
        !state.isActive &&
        !state.isCompleted &&
        state.currentQuestionIndex < state.questions.length
      ) {
        // Update last activity time to current time for proper timing calculation
        state.lastActivityTime = new Date().toISOString();

        // Session is paused, show welcome back modal
        state.showWelcomeBackModal = true;
      }
    },
    checkForCompletedSession: (state) => {
      // Check if session is completed (all questions answered or explicitly ended)
      if (
        state.questions.length > 0 &&
        (state.isCompleted ||
          (!state.isActive &&
            state.currentQuestionIndex >= state.questions.length))
      ) {
        state.isCompleted = true;
        state.isActive = false;
        state.currentQuestion = undefined;
        state.timeRemaining = undefined;
        state.showWelcomeBackModal = false;
        state.showPauseModal = false;
        // Set endTime if not already set
        if (!state.endTime) {
          state.endTime = state.lastActivityTime || new Date().toISOString();
        }
      }
    },
    setCandidateInfo: (
      state,
      action: PayloadAction<{
        name: string;
        email: string;
        phone: string;
        resumeText?: string;
      }>
    ) => {
      state.candidateInfo = action.payload;
    },
    addChatMessage: (
      state,
      action: PayloadAction<{
        id: string;
        type: "bot" | "user";
        content: string;
        timestamp: string;
        isQuestion?: boolean;
        difficulty?: string;
        questionId?: string;
        score?: number;
        feedback?: string;
        detailed_scores?: {
          technical_accuracy: number;
          problem_solving: number;
          communication: number;
          relevance: number;
          depth_of_knowledge: number;
        };
        strengths?: string[];
        areas_for_improvement?: string[];
        suggestions?: string[];
      }>
    ) => {
      state.chatHistory.push(action.payload);
    },
    syncInterviewProgress: (state) => {
      // Sync current progress to candidate
      if (state.candidateId) {
        candidateSyncService.syncInterviewProgress(
          state.candidateId,
          state.chatHistory,
          state.currentQuestionIndex,
          state.answers
        );
      }
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
    syncCompletedInterview: (state) => {
      // Sync completed interview data if not already synced
      if (
        state.isCompleted &&
        state.candidateId &&
        state.candidateInfo &&
        state.answers.length > 0
      ) {
        const averageScore =
          state.answers.length > 0
            ? Math.round(
                state.answers.reduce((sum, answer) => sum + answer.score, 0) /
                  state.answers.length
              )
            : 0;

        const summary = `Completed interview with ${averageScore}% average score. Answered ${state.answers.length}/${state.questions.length} questions.`;

        // Sync completion data
        candidateSyncService
          .syncInterviewComplete(
            state.candidateId,
            averageScore,
            summary,
            state.chatHistory,
            state.answers
          )
          .catch(() => {});
      }
    },
  },
});

export const {
  transformInterviewState,
  startInterview,
  pauseInterview,
  resumeInterview,
  submitAnswer,
  updateTimeRemaining,
  endInterview,
  completeInterview,
  setShowWelcomeBackModal,
  setShowPauseModal,
  confirmPause,
  resetInterview,
  restoreSession,
  updateLastActivity,
  checkForActiveSession,
  checkForCompletedSession,
  setCandidateInfo,
  addChatMessage,
  syncInterviewProgress,
  clearChatHistory,
  syncCompletedInterview,
} = interviewSlice.actions;
export default interviewSlice.reducer;
