import type { CustomRecipe } from "../types/player";

interface RecipePickItemProps {
  recipe: CustomRecipe;
  onClick: () => void;
}

export default function RecipePickItem({ recipe, onClick }: RecipePickItemProps) {
  return (
    <button className="cook-recipe-item" onClick={onClick}>
      {recipe.image ? (
        <img className="cook-recipe-item__img" src={recipe.image} alt={recipe.name} />
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
}
