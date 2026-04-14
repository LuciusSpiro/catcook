import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LikedRecipesProvider } from "./context/LikedRecipesContext";
import { PlayerProvider } from "./context/PlayerContext";
import { HouseholdProvider } from "./context/HouseholdContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/catcook/">
      <AuthProvider>
        <LikedRecipesProvider>
          <PlayerProvider>
            <HouseholdProvider>
              <App />
            </HouseholdProvider>
          </PlayerProvider>
        </LikedRecipesProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
