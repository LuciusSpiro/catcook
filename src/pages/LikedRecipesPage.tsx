import { useState } from "react";
import { Plus } from "lucide-react";
import catRecipeImg from "../assets/cat-recipe.png";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import { usePlayer } from "../context/PlayerContext";
import RecipeGridCard from "../components/RecipeGridCard";
import RecipeEditor from "../components/RecipeEditor";
import CustomRecipeCard, { CustomRecipeDetail } from "../components/CustomRecipeCard";
import type { CustomRecipe } from "../types/player";

export default function LikedRecipesPage() {
  const { likedRecipes } = useLikedRecipes();
  const { player, removeCustomRecipe } = usePlayer();
  const [editorRecipe, setEditorRecipe] = useState<CustomRecipe | "new" | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<CustomRecipe | null>(null);

  const customRecipes = player?.customRecipes ?? [];

  // Sync viewing recipe with latest data after edit
  const currentViewing = viewingRecipe
    ? customRecipes.find((r) => r.id === viewingRecipe.id) ?? null
    : null;

  if (currentViewing && editorRecipe && editorRecipe !== "new") {
    // Editing mode from detail view
    return (
      <div className="page liked-page">
        <RecipeEditor
          existingRecipe={editorRecipe}
          onClose={() => {
            setEditorRecipe(null);
            // Refresh the viewing recipe from updated data
            const updated = player?.customRecipes.find((r) => r.id === editorRecipe.id);
            if (updated) setViewingRecipe(updated);
          }}
        />
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

  if (currentViewing) {
    return (
      <div className="page detail-page">
        <CustomRecipeDetail
          recipe={currentViewing}
          onBack={() => setViewingRecipe(null)}
          onEdit={() => setEditorRecipe(currentViewing)}
          onDelete={() => {
            removeCustomRecipe(currentViewing.id);
            setViewingRecipe(null);
          }}
        />
      </div>
    );
  }

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
                onClick={() => setViewingRecipe(recipe)}
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
              <RecipeGridCard key={meal.idMeal} meal={meal} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
