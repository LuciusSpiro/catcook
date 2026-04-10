import { useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import type { CustomRecipe } from "../types/player";
import CookingSession from "../components/CookingSession";

export default function CookPage() {
  const { player } = usePlayer();
  const [selectedRecipe, setSelectedRecipe] = useState<CustomRecipe | null>(null);

  const customRecipes = player?.customRecipes ?? [];

  if (selectedRecipe) {
    return <CookingSession recipe={selectedRecipe} onExit={() => setSelectedRecipe(null)} />;
  }

  if (customRecipes.length === 0) {
    return (
      <div className="page cook-page">
        <div className="empty-state">
          <span className="empty-cat">👨‍🍳</span>
          <h2>Keine Rezepte zum Kochen</h2>
          <p className="text-light">
            Erstelle zuerst ein eigenes Rezept in den Favoriten!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page cook-page">
      <h1 className="page-title">🍳 Was kochen wir?</h1>
      <p className="text-light" style={{ marginBottom: 16 }}>
        Wähle ein Rezept und starte den Kochprozess!
      </p>
      <div className="cook-recipe-list">
        {customRecipes.map((recipe) => (
          <button
            key={recipe.id}
            className="cook-recipe-item"
            onClick={() => setSelectedRecipe(recipe)}
          >
            {recipe.image ? (
              <img
                className="cook-recipe-item__img"
                src={recipe.image}
                alt={recipe.name}
              />
            ) : (
              <div className="cook-recipe-item__placeholder">🐱</div>
            )}
            <div className="cook-recipe-item__info">
              <h3 className="cook-recipe-item__title">{recipe.name}</h3>
              <div className="cook-recipe-item__meta">
                <span className="tag tag--category">{recipe.category}</span>
                {recipe.cookingTimeMinutes && (
                  <span className="cook-recipe-item__time">
                    ⏱️ {recipe.cookingTimeMinutes} Min.
                  </span>
                )}
              </div>
              <span className="cook-recipe-item__steps">
                {recipe.steps.length} Schritte · {recipe.ingredients.length} Zutaten
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
