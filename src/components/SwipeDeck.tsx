import { X, Heart } from "lucide-react";
import SwipeCard from "./SwipeCard";
import type { Meal } from "../types/meal";
import chefStirring from "../assets/chef-stirring.png";
import catSoup from "../assets/cat-soup.png";

interface SwipeDeckProps {
  currentMeal: Meal | null;
  nextMeal: Meal | null;
  thirdMeal: Meal | null;
  isLoading: boolean;
  isEmpty: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onTap?: (meal: Meal) => void;
}

export default function SwipeDeck({
  currentMeal,
  nextMeal,
  thirdMeal,
  isLoading,
  isEmpty,
  onSwipe,
  onTap,
}: SwipeDeckProps) {
  if (isLoading) {
    return (
      <div className="swipe-deck">
        <div className="swipe-deck__loading">
          <img className="loading-cat" src={chefStirring} alt="Loading" width="80" />
          <p>Rezepte werden geladen...</p>
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="swipe-deck">
        <div className="swipe-deck__empty">
          <img className="empty-state__img" src={catSoup} alt="Keine Rezepte" width="100" />
          <p>Keine Rezepte mehr!</p>
          <p className="text-light">Ändere die Filter oder komm später wieder.</p>
        </div>
      </div>
    );
  }

  // Build stack bottom-to-top so the current card renders last (on top)
  const cards: { meal: Meal; index: number }[] = [];
  if (thirdMeal) cards.push({ meal: thirdMeal, index: 2 });
  if (nextMeal) cards.push({ meal: nextMeal, index: 1 });
  if (currentMeal) cards.push({ meal: currentMeal, index: 0 });

  return (
    <div className="swipe-deck">
      <div className="swipe-deck__cards">
        {cards.map(({ meal, index }) => (
          <SwipeCard
            key={meal.idMeal}
            meal={meal}
            onSwipe={onSwipe}
            onTap={onTap}
            isTop={index === 0}
            stackIndex={index}
          />
        ))}
      </div>

      <div className="swipe-deck__actions">
        <button
          className="action-btn action-btn--nope"
          onClick={() => onSwipe("left")}
          aria-label="Rezept ablehnen"
        >
          <X size={32} />
        </button>
        <button
          className="action-btn action-btn--like"
          onClick={() => onSwipe("right")}
          aria-label="Rezept merken"
        >
          <Heart size={32} />
        </button>
      </div>
    </div>
  );
}
