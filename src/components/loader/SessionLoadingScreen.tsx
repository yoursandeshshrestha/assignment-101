import React from "react";
import LoadingSpinner from "../ui/loader/LoadingSpinner";

const SessionLoadingScreen: React.FC = () => {
  return (
    <LoadingSpinner
      title="Checking for Active Session"
      description="Please wait while we check if you have an interview in progress..."
      size="lg"
      fullScreen={true}
    />
  );
};

export default SessionLoadingScreen;
