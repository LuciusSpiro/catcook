import { useState, useMemo } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import { getCustomRecipeById } from "../data/localRecipes";
import type { CustomRecipe } from "../types/player";
import CookingSession from "../components/CookingSession";
import catUtensils from "../assets/cat-utensils.png";
import chefStirring from "../assets/chef-stirring.png";

export default function CookPage() {
  const { player } = usePlayer();
  const { likedRecipes } = useLikedRecipes();
  const [selectedRecipe, setSelectedRecipe] = useState<CustomRecipe | null>(null);

  const customRecipes = player?.customRecipes ?? [];

  // Map liked recipes (Meal[]) to CustomRecipe via lookup. If a liked meal's
  // idMeal isn't in our local dataset (older data shape), skip it.
  const likedAsCustom = useMemo<CustomRecipe[]>(() => {
    const customIds = new Set(customRecipes.map((r) => r.id));
    return likedRecipes
      .map((m) => getCustomRecipeById(m.idMeal))
      .filter((r): r is CustomRecipe => !!r)
      .filter((r) => !customIds.has(r.id)); // avoid duplicates if same id somewhere
  }, [likedRecipes, customRecipes]);

  const allRecipes = useMemo<CustomRecipe[]>(
    () => [...customRecipes, ...likedAsCustom],
    [customRecipes, likedAsCustom]
  );

  if (selectedRecipe) {
    return <CookingSession recipe={selectedRecipe} onExit={() => setSelectedRecipe(null)} />;
  }

  if (allRecipes.length === 0) {
    return (
      <div className="page cook-page">
        <div className="empty-state">
          <img className="empty-state__img" src={catUtensils} alt="Cat" width="120" />
          <h2>Keine Rezepte zum Kochen</h2>
          <p className="text-light">
            Swipe Rezepte nach rechts oder erstelle ein eigenes, um hier kochen zu können!
          </p>
        </div>
      </div>
    );
  }

  const renderRecipeItem = (recipe: CustomRecipe) => (
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
  );

  return (
    <div className="page cook-page">
      <div className="cook-page__header-img">
        <img src={chefStirring} alt="Chef Cat" width="80" />
      </div>
      <h1 className="page-title">Was kochen wir?</h1>
      <p className="text-light" style={{ marginBottom: 16 }}>
        Wähle ein Rezept und starte den Kochprozess!
      </p>

      {customRecipes.length > 0 && (
        <>
          <h2 className="section-subtitle">🐱 Eigene Rezepte</h2>
          <div className="cook-recipe-list">
            {customRecipes.map(renderRecipeItem)}
          </div>
        </>
      )}

      {likedAsCustom.length > 0 && (
        <>
          <h2 className="section-subtitle">😻 Gelikte Rezepte</h2>
          <div className="cook-recipe-list">
            {likedAsCustom.map(renderRecipeItem)}
          </div>
        </>
      )}
    </div>
  );
}
