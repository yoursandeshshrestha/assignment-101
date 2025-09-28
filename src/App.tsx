import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import AppContent from "./components/others/AppContent";
import SessionDetector from "./components/others/SessionDetector";
import LoadingSpinner from "./components/ui/loader/LoadingSpinner";
import ErrorBoundary from "./components/error/ErrorBoundary";
import ErrorFallback from "./components/error/ErrorFallback";
import { initializeDB } from "./services/dbInit";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    // ===== Initialize IndexedDB when the app starts ===== //
    initializeDB();
  }, []);

  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <Provider store={store}>
        <PersistGate
          loading={
            <LoadingSpinner
              title="Loading Application"
              description="Initializing your interview platform..."
              size="lg"
              fullScreen={true}
            />
          }
          persistor={persistor}
          onBeforeLift={() => {}}
        >
          <SessionDetector />
          <AppContent />
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
