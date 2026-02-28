import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { SettingsProvider } from "./contexts/SettingsContext.tsx";
import { TimeProvider } from "./contexts/TimeContext.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TimeProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </TimeProvider>
  </StrictMode>,
);
