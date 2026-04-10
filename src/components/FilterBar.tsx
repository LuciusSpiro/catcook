import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { getCategories, getAreas, getIngredientList } from "../api/mealdb";
import type { Category, Area, IngredientListItem } from "../types/meal";

interface FilterBarProps {
  category: string | null;
  area: string | null;
  excludedIngredients: string[];
  onCategoryChange: (cat: string | null) => void;
  onAreaChange: (area: string | null) => void;
  onExcludedIngredientsChange: (ingredients: string[]) => void;
}

export default function FilterBar({
  category,
  area,
  excludedIngredients,
  onCategoryChange,
  onAreaChange,
  onExcludedIngredientsChange,
}: FilterBarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [areas, setAreas] = useState<Area[]>([]);
  const [ingredients, setIngredients] = useState<IngredientListItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
    getAreas().then(setAreas);
    getIngredientList().then(setIngredients);
  }, []);

  const hasFilters = category !== null || area !== null || excludedIngredients.length > 0;

  const clearFilters = () => {
    onCategoryChange(null);
    onAreaChange(null);
    onExcludedIngredientsChange([]);
  };

  const addExcludedIngredient = (name: string) => {
    if (name && !excludedIngredients.includes(name)) {
      onExcludedIngredientsChange([...excludedIngredients, name]);
    }
  };

  const removeExcludedIngredient = (name: string) => {
    onExcludedIngredientsChange(excludedIngredients.filter((i) => i !== name));
  };

  return (
    <div className="filter-bar">
      <button
        className={`filter-toggle ${isOpen ? "filter-toggle--active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <SlidersHorizontal size={18} />
        Filter
        {hasFilters && <span className="filter-badge" />}
      </button>

      {hasFilters && (
        <button className="filter-clear" onClick={clearFilters}>
          <X size={14} />
          Zurücksetzen
        </button>
      )}

      {excludedIngredients.length > 0 && (
        <div className="filter-chips">
          {excludedIngredients.map((name) => (
            <button
              key={name}
              className="filter-chip"
              onClick={() => removeExcludedIngredient(name)}
            >
              {name}
              <X size={12} />
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="filter-panel">
          <div className="filter-group">
            <label className="filter-label">Kategorie</label>
            <select
              className="filter-select"
              value={category ?? ""}
              onChange={(e) =>
                onCategoryChange(e.target.value || null)
              }
            >
              <option value="">Alle Kategorien</option>
              {categories.map((c) => (
                <option key={c.strCategory} value={c.strCategory}>
                  {c.strCategory}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Region</label>
            <select
              className="filter-select"
              value={area ?? ""}
              onChange={(e) =>
                onAreaChange(e.target.value || null)
              }
            >
              <option value="">Alle Regionen</option>
              {areas.map((a) => (
                <option key={a.strArea} value={a.strArea}>
                  {a.strArea}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Ohne diese Zutaten</label>
            <select
              className="filter-select"
              value=""
              onChange={(e) => {
                addExcludedIngredient(e.target.value);
                e.target.value = "";
              }}
            >
              <option value="">Zutat ausschließen...</option>
              {ingredients
                .filter((ing) => !excludedIngredients.includes(ing.strIngredient))
                .map((ing) => (
                  <option key={ing.strIngredient} value={ing.strIngredient}>
                    {ing.strIngredient}
                  </option>
                ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
