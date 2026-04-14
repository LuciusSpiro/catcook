import { NavLink } from "react-router-dom";
import { useHousehold } from "../context/HouseholdContext";
import { getHouseImage } from "../utils/houseImages";

export default function HouseholdBadge() {
  const { activeHousehold, activeHouseholdIndex } = useHousehold();

  if (!activeHousehold) return null;

  return (
    <NavLink to="/household" className="household-badge" aria-label="Haushalte">
      <img
        src={getHouseImage(activeHouseholdIndex)}
        alt={activeHousehold.name}
        className="household-badge__img"
      />
    </NavLink>
  );
}
