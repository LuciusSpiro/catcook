import { useState } from "react";
import { Plus } from "lucide-react";
import catRecipeImg from "../assets/cat-recipe.png";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import { usePlayer } from "../context/PlayerContext";
import { getCustomRecipeById } from "../data/localRecipes";
import RecipeGridCard from "../components/RecipeGridCard";
import RecipeEditor from "../components/RecipeEditor";
import RecipeDetail from "../components/RecipeDetail";
import CustomRecipeCard, { CustomRecipeDetail } from "../components/CustomRecipeCard";
import type { CustomRecipe } from "../types/player";
import type { Meal } from "../types/meal";

export default function LikedRecipesPage() {
  const { likedRecipes, removeLike } = useLikedRecipes();
  const { player, removeCustomRecipe } = usePlayer();
  const [editorRecipe, setEditorRecipe] = useState<CustomRecipe | "new" | null>(null);
  const [viewingCustom, setViewingCustom] = useState<CustomRecipe | null>(null);
  const [viewingLiked, setViewingLiked] = useState<Meal | null>(null);

  const customRecipes = player?.customRecipes ?? [];

  // Sync viewing custom recipe with latest player data
  const currentCustom = viewingCustom
    ? customRecipes.find((r) => r.id === viewingCustom.id) ?? null
    : null;

  // Edit a liked (swiped) recipe: convert to CustomRecipe, open editor
  const editLikedRecipe = (meal: Meal) => {
    const customRecipe = getCustomRecipeById(meal.idMeal);
    if (!customRecipe) return;
    setViewingLiked(null);
    setEditorRecipe(customRecipe);
  };

  // When saving a liked recipe edit, it becomes a custom recipe
  const handleEditorClose = () => {
    if (editorRecipe && editorRecipe !== "new") {
      // If this was a liked recipe being edited, remove it from likes
      const wasLiked = likedRecipes.some((m) => m.idMeal === editorRecipe.id);
      if (wasLiked) {
        removeLike(editorRecipe.id);
      }
      // Refresh custom recipe view if we were viewing it
      const updated = player?.customRecipes.find((r) => r.id === editorRecipe.id);
      if (updated) setViewingCustom(updated);
    }
    setEditorRecipe(null);
  };

  // ── Editor Mode ──
  if (editorRecipe && editorRecipe !== "new") {
    return (
      <div className="page liked-page">
        <RecipeEditor existingRecipe={editorRecipe} onClose={handleEditorClose} />
      </div>
    );
  }

  if (editorRecipe === "new") {
    return (
      <div className="page liked-page">
        <RecipeEditor onClose={() => setEditorRecipe(null)} />
      </div>
    );
  }

  // ── Detail View: Custom Recipe ──
  if (currentCustom) {
    return (
      <div className="page detail-page">
        <CustomRecipeDetail
          recipe={currentCustom}
          onBack={() => setViewingCustom(null)}
          onEdit={() => setEditorRecipe(currentCustom)}
          onDelete={() => {
            removeCustomRecipe(currentCustom.id);
            setViewingCustom(null);
          }}
        />
      </div>
    );
  }

  // ── Detail View: Liked (swiped) Recipe ──
  if (viewingLiked) {
    return (
      <div className="page detail-page">
        <RecipeDetail
          meal={viewingLiked}
          onBack={() => setViewingLiked(null)}
          onEdit={() => editLikedRecipe(viewingLiked)}
        />
      </div>
    );
  }

  // ── List View ──
  const hasContent = likedRecipes.length > 0 || customRecipes.length > 0;

  if (!hasContent) {
    return (
      <div className="page liked-page">
        <div className="empty-state">
          <img className="empty-state__img" src={catRecipeImg} alt="Cat" width="120" />
          <h2>Noch keine Rezepte</h2>
          <p className="text-light">
            Swipe Rezepte nach rechts oder erstelle dein eigenes!
          </p>
          <button className="add-recipe-btn" onClick={() => setEditorRecipe("new")}>
            <Plus size={20} />
            Eigenes Rezept erstellen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page liked-page">
      <div className="liked-page__header">
        <h1 className="page-title">Meine Rezepte</h1>
        <button className="add-recipe-fab" onClick={() => setEditorRecipe("new")} aria-label="Rezept erstellen">
          <Plus size={24} />
        </button>
      </div>

      {customRecipes.length > 0 && (
        <>
          <h2 className="section-subtitle">🐱 Eigene Rezepte</h2>
          <div className="custom-recipe-grid">
            {customRecipes.map((recipe) => (
              <CustomRecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={() => setViewingCustom(recipe)}
              />
            ))}
          </div>
        </>
      )}

      {likedRecipes.length > 0 && (
        <>
          <h2 className="section-subtitle">😻 Gelikte Rezepte</h2>
          <div className="recipe-grid">
            {likedRecipes.map((meal) => (
              <RecipeGridCard
                key={meal.idMeal}
                meal={meal}
                onClick={() => setViewingLiked(meal)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
