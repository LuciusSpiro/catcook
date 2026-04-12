import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { INGREDIENT_UNITS } from "../types/player";
import type { CustomRecipe } from "../types/player";
import SwipeRow from "./SwipeRow";

interface PantryCheckScreenProps {
  recipe: CustomRecipe;
  onDone: () => void;
}

export default function PantryCheckScreen({ recipe, onDone }: PantryCheckScreenProps) {
  const { setPantryItem, removePantryItem } = usePlayer();
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const allChecked = checked.size >= recipe.ingredients.length;

  const handleHaveEnough = (idx: number) => {
    const ing = recipe.ingredients[idx];
    setPantryItem({
      name: ing.name,
      icon: ing.icon,
      inStock: true,
      amount: ing.amount ?? undefined,
      unit: ing.unit,
    });
    setChecked((prev) => new Set(prev).add(idx));
  };

  const handleNeedMore = (idx: number) => {
    const ing = recipe.ingredients[idx];
    removePantryItem(ing.name);
    setChecked((prev) => new Set(prev).add(idx));
  };

  const formatAmount = (ing: { amount: number | null; unit: string }) => {
    if (ing.amount == null) return "";
    const label = INGREDIENT_UNITS.find((u) => u.value === ing.unit)?.label ?? ing.unit;
    return `${ing.amount} ${label}`;
  };

  return (
    <div className="pantry-check">
      <h2 className="pantry-check__title">🐱 Was brauchst du nachkaufen?</h2>
      <p className="text-light pantry-check__hint">
        ← Brauche ich · Rechts → Hab noch genug
      </p>

      <div className="pantry-check__list">
        {recipe.ingredients.map((ing, idx) =>
          checked.has(idx) ? null : (
            <SwipeRow
              key={`${ing.name}-${idx}`}
              icon={ing.icon}
              label={ing.name}
              sublabel={formatAmount(ing)}
              onSwipeLeft={() => handleNeedMore(idx)}
              onSwipeRight={() => handleHaveEnough(idx)}
            />
          )
        )}
      </div>

      {allChecked && (
        <p className="pantry-check__done-text">Alles gecheckt! 🐾</p>
      )}

      <button
        className="editor-save-btn"
        onClick={onDone}
        style={{ marginTop: 16 }}
      >
        {allChecked ? "Weiter zum Ergebnis" : `Überspringen (${recipe.ingredients.length - checked.size} übrig)`}
      </button>
    </div>
  );
}
