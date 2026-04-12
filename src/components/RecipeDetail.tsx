import { ArrowLeft, Play, Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Meal } from "../types/meal";
import { useLikedRecipes } from "../context/LikedRecipesContext";

interface RecipeDetailProps {
  meal: Meal;
  onBack?: () => void;
  onEdit?: () => void;
}

export default function RecipeDetail({ meal, onBack, onEdit }: RecipeDetailProps) {
  const navigate = useNavigate();
  const { isLiked, removeLike } = useLikedRecipes();

  const handleRemove = () => {
    removeLike(meal.idMeal);
    navigate("/liked");
  };

  return (
    <div className="recipe-detail">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack ?? (() => navigate(-1))}>
          <ArrowLeft size={20} />
          Zurück
        </button>
        {onEdit && (
          <button className="edit-btn" onClick={onEdit}>
            <Pencil size={16} />
            Bearbeiten
          </button>
        )}
      </div>

      <div className="recipe-detail__hero">
        <img src={meal.strMealThumb} alt={meal.strMeal} />
      </div>

      <div className="recipe-detail__content">
        <h1 className="recipe-detail__title">{meal.strMeal}</h1>

        <div className="swipe-card__tags" style={{ marginBottom: 16 }}>
          {meal.strCategory && (
            <span className="tag tag--category">{meal.strCategory}</span>
          )}
          {meal.strArea && (
            <span className="tag tag--area">{meal.strArea}</span>
          )}
        </div>

        {meal.ingredients.length > 0 && (
          <section className="recipe-detail__section">
            <h2>Zutaten</h2>
            <ul className="ingredient-list">
              {meal.ingredients.map((ing, i) => (
                <li key={i} className="ingredient-item">
                  <span className="ingredient-name">{ing.name}</span>
                  <span className="ingredient-measure">{ing.measure}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="recipe-detail__section">
          <h2>Zubereitung</h2>
          <div className="recipe-detail__instructions">
            {meal.strInstructions.split("\n").map((p, i) =>
              p.trim() ? <p key={i}>{p}</p> : null
            )}
          </div>
        </section>

        {meal.strYoutube && (
          <a
            href={meal.strYoutube}
            target="_blank"
            rel="noopener noreferrer"
            className="youtube-link"
          >
            <Play size={20} />
            Video ansehen
          </a>
        )}

        {isLiked(meal.idMeal) && (
          <button className="remove-btn" onClick={handleRemove}>
            <Trash2 size={18} />
            Aus Favoriten entfernen
          </button>
        )}
      </div>
    </div>
  );
}
