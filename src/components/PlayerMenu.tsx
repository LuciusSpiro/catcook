import { NavLink } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import avatar from "../assets/avatar.png";

export default function PlayerMenu() {
  const { player } = usePlayer();

  if (!player) return null;

  return (
    <NavLink to="/profile" className="player-menu__trigger" aria-label="Profil">
      <img src={avatar} alt="Profil" width="44" height="44" className="player-menu__avatar-img" />
    </NavLink>
  );
}
