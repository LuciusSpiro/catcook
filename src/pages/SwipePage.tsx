import { useState, useCallback, useEffect } from "react";
import SwipeDeck from "../components/SwipeDeck";
import FilterBar from "../components/FilterBar";
import RecipeDetail from "../components/RecipeDetail";
import { useRecipeStack } from "../hooks/useRecipeStack";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import type { Meal } from "../types/meal";

export default function SwipePage() {
  const [category, setCategory] = useState<string | null>(null);
  const [area, setArea] = useState<string | null>(null);
  const [excludedIngredients, setExcludedIngredients] = useState<string[]>([]);
  const [previewMeal, setPreviewMeal] = useState<Meal | null>(null);

  const { currentMeal, nextMeal, thirdMeal, isLoading, isEmpty, removeTop } =
    useRecipeStack({ category, area, excludedIngredients });

  const { addLike } = useLikedRecipes();

  const handleSwipe = useCallback(
    (direction: "left" | "right") => {
      if (direction === "right" && currentMeal) {
        addLike(currentMeal);
      }
      removeTop();
    },
    [currentMeal, addLike, removeTop]
  );

  // Browser-Back schließt das Overlay
  useEffect(() => {
    if (!previewMeal) return;

    const onPopState = () => setPreviewMeal(null);
    window.history.pushState(null, "", "");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [previewMeal]);

  if (previewMeal) {
    return (
      <div className="page detail-page detail-page--overlay">
        <RecipeDetail
          meal={previewMeal}
          onBack={() => {
            window.history.back();
          }}
        />
      </div>
    );
  }

  return (
    <div className="page swipe-page">
      <div className="swipe-container">
        <FilterBar
          category={category}
          area={area}
          excludedIngredients={excludedIngredients}
          onCategoryChange={setCategory}
          onAreaChange={setArea}
          onExcludedIngredientsChange={setExcludedIngredients}
        />
        <SwipeDeck
          currentMeal={currentMeal}
          nextMeal={nextMeal}
          thirdMeal={thirdMeal}
          isLoading={isLoading}
          isEmpty={isEmpty}
          onSwipe={handleSwipe}
          onTap={setPreviewMeal}
        />
      </div>
    </div>
  );
}
