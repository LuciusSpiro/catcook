import { NavLink } from "react-router-dom";
import { BookOpen, UtensilsCrossed, CalendarDays, ShoppingBag } from "lucide-react";
import nowCookImg from "../assets/nowCook.png";
import type { ReactNode } from "react";
import PlayerMenu from "./PlayerMenu";
import HouseholdBadge from "./HouseholdBadge";
import NamePromptModal from "./NamePromptModal";
import { usePlayer } from "../context/PlayerContext";
import { useHousehold } from "../context/HouseholdContext";
import logo from "../assets/logo.png";
import headerLogo from "../assets/header.png";


export default function Layout({ children }: { children: ReactNode }) {
  const { player, setName } = usePlayer();
  const { activeHousehold } = useHousehold();
  const hasHousehold = !!activeHousehold;

  return (
    <div className="app-shell">
      <img className="app-bg-logo" src={logo} alt="" aria-hidden="true" />
      {!player && <NamePromptModal onSubmit={setName} />}

      <header className="app-header">
        <HouseholdBadge />
        <NavLink to="/" className="logo-link" aria-label="Startseite">
          <img className="logo-img" src={headerLogo} alt="CatCook" />
        </NavLink>
        <PlayerMenu />
      </header>

      <main className="app-main">{children}</main>

      <nav className="tab-bar">
        <NavLink to="/" end className="tab-link">
          <UtensilsCrossed size={24} />
          <span>Entdecken</span>
        </NavLink>

        {hasHousehold && (
          <NavLink to="/plan" className="tab-link">
            <CalendarDays size={24} />
            <span>Planer</span>
          </NavLink>
        )}

        <NavLink to="/cook" className="tab-cook-btn">
          <img src={nowCookImg} alt="Jetzt Kochen" className="tab-cook-btn__img" />
        </NavLink>

        {hasHousehold && (
          <NavLink to="/shopping" className="tab-link">
            <ShoppingBag size={24} />
            <span>Zutaten</span>
          </NavLink>
        )}

        <NavLink to="/liked" className="tab-link">
          <BookOpen size={24} />
          <span>Kochbuch</span>
        </NavLink>
      </nav>
    </div>
  );
}
