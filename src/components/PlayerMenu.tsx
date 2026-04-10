import { NavLink } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { getRank } from "../types/player";

export default function PlayerMenu() {
  const { player } = usePlayer();

  if (!player) return null;

  const totalXp = player.xp ?? 0;
  const currentRank = getRank(totalXp);

  return (
    <NavLink to="/profile" className="player-menu__trigger" aria-label="Profil">
      <svg viewBox="0 0 40 44" width="36" height="40">
        {/* Chef hat */}
        <ellipse cx="20" cy="6" rx="10" ry="5" fill="white" stroke="#e0e0e0" strokeWidth="0.8" />
        <ellipse cx="16" cy="4" rx="3" ry="4" fill="white" />
        <ellipse cx="20" cy="3" rx="3" ry="4.5" fill="white" />
        <ellipse cx="24" cy="4" rx="3" ry="4" fill="white" />
        <rect x="11" y="6" width="18" height="5" rx="1" fill="white" stroke="#e0e0e0" strokeWidth="0.8" />
        {/* Cat face */}
        <circle cx="20" cy="26" r="13" fill="#ff6b6b" />
        {/* Ears */}
        <polygon points="9,19 6,6 16,16" fill="#ff6b6b" />
        <polygon points="31,19 34,6 24,16" fill="#ff6b6b" />
        <polygon points="10,18 8,9 15,16" fill="#ffb3b3" />
        <polygon points="30,18 32,9 25,16" fill="#ffb3b3" />
        {/* Eyes */}
        <circle cx="15" cy="24" r="2.2" fill="white" />
        <circle cx="25" cy="24" r="2.2" fill="white" />
        <circle cx="15.5" cy="24.5" r="1.2" fill="#2d2d2d" />
        <circle cx="25.5" cy="24.5" r="1.2" fill="#2d2d2d" />
        {/* Nose */}
        <ellipse cx="20" cy="28" rx="1.5" ry="1" fill="#e05555" />
        {/* Mouth */}
        <path d="M17,30 Q20,33 23,30" fill="none" stroke="#e05555" strokeWidth="0.8" />
      </svg>
    </NavLink>
  );
}
