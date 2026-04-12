import { Link } from "react-router-dom";
import type { Meal } from "../types/meal";

interface RecipeGridCardProps {
  meal: Meal;
  onClick?: () => void;
}

export default function RecipeGridCard({ meal, onClick }: RecipeGridCardProps) {
  const content = (
    <>
      <div className="recipe-grid-card__image">
        <img src={meal.strMealThumb} alt={meal.strMeal} />
      </div>
      <div className="recipe-grid-card__info">
        <h3 className="recipe-grid-card__title">{meal.strMeal}</h3>
        <div className="swipe-card__tags">
          {meal.strCategory && (
            <span className="tag tag--category">{meal.strCategory}</span>
          )}
          {meal.strArea && (
            <span className="tag tag--area">{meal.strArea}</span>
          )}
        </div>
      </div>
    </>
  );

  if (onClick) {
    return (
      <button className="recipe-grid-card" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <Link to={`/recipe/${meal.idMeal}`} className="recipe-grid-card">
      {content}
    </Link>
  );
}
