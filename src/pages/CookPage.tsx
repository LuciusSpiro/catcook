import { useMemo, useState } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useAllRecipes } from "../hooks/useAllRecipes";
import { useHouseholdPantry } from "../hooks/useHouseholdPantry";
import type { CustomRecipe } from "../types/player";
import CookingSession from "../components/CookingSession";
import RecipePickItem from "../components/RecipePickItem";
import catUtensils from "../assets/cat-utensils.png";
import chefStirring from "../assets/chef-stirring.png";

export default function CookPage() {
  const { player } = usePlayer();
  const allRecipes = useAllRecipes();
  const { pantry } = useHouseholdPantry();
  const [selectedRecipe, setSelectedRecipe] = useState<CustomRecipe | null>(null);

  const customRecipes = player?.customRecipes ?? [];
  const likedRecipes = allRecipes.filter((r) => !customRecipes.some((c) => c.id === r.id));

  const cookableRecipes = useMemo(() => {
    const stocked = new Set(
      Object.values(pantry)
        .filter((p) => p.inStock)
        .map((p) => p.name.toLowerCase()),
    );
    if (stocked.size === 0) return [];
    return allRecipes.filter(
      (r) => r.ingredients.length > 0 && r.ingredients.every((i) => stocked.has(i.name.toLowerCase())),
    );
  }, [allRecipes, pantry]);

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

  return (
    <div className="page cook-page">
      <div className="cook-page__header-img">
        <img src={chefStirring} alt="Chef Cat" width="80" />
      </div>
      <h1 className="page-title">Was kochen wir?</h1>
      <p className="text-light" style={{ marginBottom: 16 }}>
        Wähle ein Rezept und starte den Kochprozess!
      </p>

      {cookableRecipes.length > 0 ? (
        <>
          <h2 className="section-subtitle">🍳 Jetzt kochbar ({cookableRecipes.length})</h2>
          <p className="text-light" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
            Diese Rezepte kannst du mit deinem Lagerbestand direkt zubereiten.
          </p>
          <div className="cook-recipe-list">
            {cookableRecipes.map((r) => (
              <RecipePickItem key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} />
            ))}
          </div>
        </>
      ) : (
        <div className="cook-cookable-empty">
          <p className="text-light" style={{ fontSize: "0.9rem" }}>
            🐾 Noch keine Rezepte mit deinem aktuellen Lager kochbar — füge Zutaten in den Einkauf ein.
          </p>
        </div>
      )}

      {customRecipes.length > 0 && (
        <>
          <h2 className="section-subtitle">🐱 Eigene Rezepte</h2>
          <div className="cook-recipe-list">
            {customRecipes.map((r) => (
              <RecipePickItem key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} />
            ))}
          </div>
        </>
      )}

      {likedRecipes.length > 0 && (
        <>
          <h2 className="section-subtitle">😻 Gelikte Rezepte</h2>
          <div className="cook-recipe-list">
            {likedRecipes.map((r) => (
              <RecipePickItem key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
