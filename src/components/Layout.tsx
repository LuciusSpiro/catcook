import { NavLink } from "react-router-dom";
import { Heart, UtensilsCrossed, Plus } from "lucide-react";
import type { ReactNode } from "react";
import PlayerMenu from "./PlayerMenu";
import NamePromptModal from "./NamePromptModal";
import { usePlayer } from "../context/PlayerContext";


export default function Layout({ children }: { children: ReactNode }) {
  const { player, setName } = usePlayer();

  return (
    <div className="app-shell">
      {!player && <NamePromptModal onSubmit={setName} />}

      <header className="app-header">
        <span className="logo">🐱 CatCook</span>
        <PlayerMenu />
      </header>

      <main className="app-main">{children}</main>

      <nav className="tab-bar">
        <NavLink to="/" end className="tab-link">
          <UtensilsCrossed size={24} />
          <span>Entdecken</span>
        </NavLink>

        <NavLink to="/cook" className="tab-cook-btn">
          <Plus size={28} strokeWidth={3} />
        </NavLink>

        <NavLink to="/liked" className="tab-link">
          <Heart size={24} />
          <span>Favoriten</span>
        </NavLink>
      </nav>
    </div>
  );
}
