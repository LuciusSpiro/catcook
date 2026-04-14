import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import catRecipeImg from "../assets/cat-recipe.png";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import { usePlayer } from "../context/PlayerContext";
import { getCustomRecipeById } from "../data/localRecipes";
import { useAllRecipes } from "../hooks/useAllRecipes";
import FilterBar from "../components/FilterBar";
import RecipeEditor from "../components/RecipeEditor";
import RecipeDetail from "../components/RecipeDetail";
import CustomRecipeCard, { CustomRecipeDetail } from "../components/CustomRecipeCard";
import type { CustomRecipe } from "../types/player";
import type { Meal } from "../types/meal";

const FILTER_STORAGE_KEY = "catcook-cookbook-filters";

interface StoredFilters {
  category: string | null;
  area: string | null;
  includedIngredients: string[];
}

function loadFilters(): StoredFilters {
  try {
    const raw = localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return { category: null, area: null, includedIngredients: [] };
    const parsed = JSON.parse(raw) as Partial<StoredFilters>;
    return {
      category: parsed.category ?? null,
      area: parsed.area ?? null,
      includedIngredients: Array.isArray(parsed.includedIngredients) ? parsed.includedIngredients : [],
    };
  } catch {
    return { category: null, area: null, includedIngredients: [] };
  }
}

export default function LikedRecipesPage() {
  const { likedRecipes, removeLike } = useLikedRecipes();
  const { player, removeCustomRecipe } = usePlayer();
  const allRecipes = useAllRecipes();
  const [editorRecipe, setEditorRecipe] = useState<CustomRecipe | "new" | null>(null);
  const [viewingCustom, setViewingCustom] = useState<CustomRecipe | null>(null);
  const [viewingLiked, setViewingLiked] = useState<Meal | null>(null);

  const [initialFilters] = useState(loadFilters);
  const [category, setCategory] = useState<string | null>(initialFilters.category);
  const [area, setArea] = useState<string | null>(initialFilters.area);
  const [includedIngredients, setIncludedIngredients] = useState<string[]>(initialFilters.includedIngredients);

  useEffect(() => {
    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify({ category, area, includedIngredients } satisfies StoredFilters),
    );
  }, [category, area, includedIngredients]);

  const customRecipes = player?.customRecipes ?? [];
  const customIds = useMemo(() => new Set(customRecipes.map((r) => r.id)), [customRecipes]);

  const filteredRecipes = useMemo(() => {
    const needles = includedIngredients.map((n) => n.toLowerCase());
    return allRecipes.filter((r) => {
      if (category && (r.category ?? "").toLowerCase() !== category.toLowerCase()) return false;
      if (area && (r.area ?? "").toLowerCase() !== area.toLowerCase()) return false;
      if (needles.length > 0) {
        const names = r.ingredients.map((i) => i.name.toLowerCase());
        if (!needles.every((n) => names.some((name) => name.includes(n)))) return false;
      }
      return true;
    });
  }, [allRecipes, category, area, includedIngredients]);

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

  const handleCardClick = (recipe: CustomRecipe) => {
    if (customIds.has(recipe.id)) {
      setViewingCustom(recipe);
      return;
    }
    const meal = likedRecipes.find((m) => m.idMeal === recipe.id);
    if (meal) setViewingLiked(meal);
  };

  return (
    <div className="page liked-page">
      <div className="liked-page__header">
        <h1 className="page-title">Kochbuch</h1>
        <button className="add-recipe-fab" onClick={() => setEditorRecipe("new")} aria-label="Rezept erstellen">
          <Plus size={24} />
        </button>
      </div>

      <FilterBar
        category={category}
        area={area}
        excludedIngredients={includedIngredients}
        onCategoryChange={setCategory}
        onAreaChange={setArea}
        onExcludedIngredientsChange={setIncludedIngredients}
        ingredientMode="include"
      />

      {filteredRecipes.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 20px" }}>
          <span style={{ fontSize: "2.5rem" }}>🔍</span>
          <p className="text-light">Keine Rezepte gefunden. Passe die Filter an.</p>
        </div>
      ) : (
        <div className="custom-recipe-grid">
          {filteredRecipes.map((recipe) => (
            <CustomRecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => handleCardClick(recipe)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
