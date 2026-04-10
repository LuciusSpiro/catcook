import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LikedRecipesProvider } from "./context/LikedRecipesContext";
import { PlayerProvider } from "./context/PlayerContext";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename="/CatCook/">
      <LikedRecipesProvider>
        <PlayerProvider>
          <App />
        </PlayerProvider>
      </LikedRecipesProvider>
    </BrowserRouter>
  </StrictMode>
);
