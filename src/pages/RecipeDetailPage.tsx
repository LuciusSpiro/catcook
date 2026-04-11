import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getMealById } from "../data/localRecipes";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import RecipeDetail from "../components/RecipeDetail";
import type { Meal } from "../types/meal";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { likedRecipes } = useLikedRecipes();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Check liked recipes first to avoid API call
    const liked = likedRecipes.find((m) => m.idMeal === id);
    if (liked) {
      setMeal(liked);
      setIsLoading(false);
      return;
    }

    // Fetch from API
    getMealById(id)
      .then(setMeal)
      .finally(() => setIsLoading(false));
  }, [id, likedRecipes]);

  if (isLoading) {
    return (
      <div className="page detail-page">
        <div className="swipe-deck__loading">
          <span className="loading-cat">🐱</span>
          <p>Rezept wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="page detail-page">
        <div className="empty-state">
          <span className="empty-cat">😿</span>
          <h2>Rezept nicht gefunden</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="page detail-page">
      <RecipeDetail meal={meal} />
    </div>
  );
}
