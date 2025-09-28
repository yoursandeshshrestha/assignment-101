import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import interviewReducer from "./slices/interviewSlice.js";
import { interviewStorage } from "../services/indexedDBStorage";

// Persist config for interview slice using IndexedDB
const interviewPersistConfig = {
  key: "interview",
  storage: interviewStorage,
};

const rootReducer = {
  interview: persistReducer(interviewPersistConfig, interviewReducer),
};

export const store = configureStore({
  reducer: rootReducer,
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
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
