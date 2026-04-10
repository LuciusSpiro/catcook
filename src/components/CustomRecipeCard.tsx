import { Pencil, Clock } from "lucide-react";
import { CAT_RATINGS, SKILLS, INGREDIENT_UNITS } from "../types/player";
import type { CustomRecipe } from "../types/player";

interface CustomRecipeCardProps {
  recipe: CustomRecipe;
  onClick: () => void;
}

export default function CustomRecipeCard({ recipe, onClick }: CustomRecipeCardProps) {
  const ratingEmoji = CAT_RATINGS[recipe.rating - 1] ?? "😺";

  return (
    <button className="custom-recipe-card" onClick={onClick}>
      {recipe.image ? (
        <div className="custom-recipe-card__image">
          <img src={recipe.image} alt={recipe.name} />
        </div>
      ) : (
        <div className="custom-recipe-card__icon">🐱</div>
      )}
      <div className="custom-recipe-card__info">
        <h3 className="custom-recipe-card__title">{recipe.name}</h3>
        <div className="custom-recipe-card__meta">
          <span className="tag tag--category">{recipe.category}</span>
          <span className="custom-recipe-card__rating">{ratingEmoji}</span>
        </div>
        {recipe.cookingTimeMinutes && (
          <div className="custom-recipe-card__time">
            <Clock size={12} /> {recipe.cookingTimeMinutes} Min.
          </div>
        )}
      </div>
    </button>
  );
}

interface CustomRecipeDetailProps {
  recipe: CustomRecipe;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function CustomRecipeDetail({ recipe, onBack, onEdit, onDelete }: CustomRecipeDetailProps) {
  return (
    <div className="recipe-detail custom-recipe-detail">
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>
          ← Zurück
        </button>
        <button className="edit-btn" onClick={onEdit}>
          <Pencil size={16} />
          Bearbeiten
        </button>
      </div>

      {recipe.image ? (
        <div className="recipe-detail__hero">
          <img src={recipe.image} alt={recipe.name} />
        </div>
      ) : (
        <div className="custom-recipe-detail__hero">
          <span className="custom-recipe-detail__big-cat">🐱</span>
        </div>
      )}

      <div className="recipe-detail__content">
        <h1 className="recipe-detail__title">{recipe.name}</h1>

        <div className="swipe-card__tags" style={{ marginBottom: 12 }}>
          <span className="tag tag--category">{recipe.category}</span>
          {recipe.cookingTimeMinutes && (
            <span className="tag tag--time">
              <Clock size={12} /> {recipe.cookingTimeMinutes} Min.
            </span>
          )}
          <span style={{ fontSize: "1.4rem" }}>
            {CAT_RATINGS.map((emoji, i) => (
              <span
                key={i}
                style={{ opacity: i < recipe.rating ? 1 : 0.25, marginRight: 2 }}
              >
                {emoji}
              </span>
            ))}
          </span>
        </div>

        {recipe.equipment.length > 0 && (
          <section className="recipe-detail__section">
            <h2>🍳 Geräte</h2>
            <div className="equipment-chips">
              {recipe.equipment.map((eq, i) => (
                <span key={i} className="equipment-chip">{eq}</span>
              ))}
            </div>
          </section>
        )}

        {recipe.ingredients.length > 0 && (
          <section className="recipe-detail__section">
            <h2>🥕 Zutaten</h2>
            <ul className="ingredient-list">
              {recipe.ingredients.map((ing, i) => {
                const unitLabel = INGREDIENT_UNITS.find((u) => u.value === ing.unit)?.label ?? ing.unit;
                const measure = ing.amount != null ? `${ing.amount} ${unitLabel}` : "";
                return (
                  <li key={i} className="ingredient-item">
                    <span className="ingredient-name">
                      <span className="ingredient-icon">{ing.icon}</span> {ing.name}
                    </span>
                    <span className="ingredient-measure">{measure}</span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {recipe.steps.length > 0 && (
          <section className="recipe-detail__section">
            <h2>📝 Arbeitsschritte</h2>
            <div className="steps-list">
              {recipe.steps.map((step, i) => {
                const skill = step.skillId
                  ? SKILLS.find((s) => s.id === step.skillId)
                  : null;
                return (
                  <div key={i} className="step-card">
                    <div className="step-card__number">{i + 1}</div>
                    <div className="step-card__content">
                      <p className="step-card__text">{step.description}</p>
                      <div className="step-card__meta">
                        {skill && (
                          <span className="step-card__skill">
                            {skill.emoji} {skill.name}
                          </span>
                        )}
                        {step.waitMinutes && step.waitMinutes > 0 && (
                          <span className="step-card__time">
                            ⏱️ {step.waitMinutes} Min.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <button className="remove-btn" onClick={onDelete}>
          🗑️ Rezept löschen
        </button>
      </div>
    </div>
  );
}
