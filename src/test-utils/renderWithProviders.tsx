import React, { type PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore, persistReducer } from "redux-persist";
import type { RootState } from "../store";
import interviewSlice from "../store/slices/interviewSlice";
import { interviewStorage } from "../services/indexedDBStorage";

// Create a test store with optional initial state
export const createTestStore = (preloadedState?: Partial<RootState>) => {
  // Persist config for interview slice using IndexedDB
  const interviewPersistConfig = {
    key: "interview",
    storage: interviewStorage,
  };

  const rootReducer = {
    interview: persistReducer(interviewPersistConfig, interviewSlice),
  };

  const store = configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
          ignoredPaths: [
            "interview.startTime",
            "interview.lastActivityTime",
            "interview.pauseTime",
            "interview.endTime",
            "interview.answers",
            "interview.chatHistory",
          ],
        },
      }),
  } as Parameters<typeof configureStore>[0]);

  const persistor = persistStore(store);
  return { store, persistor };
};

type TestStore = ReturnType<typeof createTestStore>["store"];

// Render component with Redux store and persistence
interface ExtendedRenderOptions {
  preloadedState?: Partial<RootState>;
  store?: TestStore;
}

export const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState).store,
    ...renderOptions
  }: ExtendedRenderOptions = {}
) => {
  const { persistor } = createTestStore(preloadedState);

  const Wrapper = ({ children }: PropsWithChildren<object>) => (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock data for tests
export const mockInterviewState = {
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

export const mockQuestions = [
  {
    id: "1",
    text: "What is React and how does it work?",
    difficulty: "easy" as const,
    timeLimit: 20,
    category: "Frontend",
  },
  {
    id: "2",
    text: "Explain the difference between state and props in React.",
    difficulty: "medium" as const,
    timeLimit: 60,
    category: "Frontend",
  },
];

export const mockCandidate = {
  id: "candidate-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "1234567890",
  interviewStatus: "completed" as const,
  finalScore: 85,
  startTime: "2024-01-01T10:00:00Z",
  endTime: "2024-01-01T11:00:00Z",
  answers: [
    {
      questionId: "1",
      answer: "React is a JavaScript library for building user interfaces.",
      score: 90,
      feedback: "Great answer!",
      timeSpent: 15,
      timestamp: "2024-01-01T10:15:00Z",
      detailed_scores: {
        technical_accuracy: 9,
        problem_solving: 9,
        communication: 9,
        relevance: 9,
        depth_of_knowledge: 9,
      },
      strengths: ["Clear explanation"],
      areas_for_improvement: [],
      suggestions: [],
    },
  ],
  summary: "Excellent candidate with strong technical knowledge.",
};
