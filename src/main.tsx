import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";

import App from "./App.tsx";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SettingsProvider } from "./store/settingsProvider";
import "./styles/globals.css";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <ErrorBoundary>
        <SettingsProvider>
          <App />
        </SettingsProvider>
      </ErrorBoundary>
    </MotionConfig>
  </StrictMode>,
);
