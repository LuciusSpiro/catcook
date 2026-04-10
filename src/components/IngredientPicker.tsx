import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, X } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { DEFAULT_INGREDIENTS, INGREDIENT_ICONS, INGREDIENT_CATEGORIES } from "../types/ingredients";
import type { IngredientDef } from "../types/ingredients";
import type { RecipeIngredient, IngredientUnit } from "../types/player";
import { INGREDIENT_UNITS } from "../types/player";

interface IngredientPickerProps {
  ingredients: RecipeIngredient[];
  onChange: (ingredients: RecipeIngredient[]) => void;
}

export default function IngredientPicker({ ingredients, onChange }: IngredientPickerProps) {
  const { player, addCustomIngredient } = usePlayer();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [editingIconIdx, setEditingIconIdx] = useState<number | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine default + custom ingredients
  const allIngredients = useMemo(() => {
    const custom = (player?.customIngredients ?? []).map(
      (c): IngredientDef => ({ name: c.name, icon: c.icon, category: "Sonstiges" })
    );
    return [...DEFAULT_INGREDIENTS, ...custom];
  }, [player?.customIngredients]);

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return allIngredients;
    const q = search.toLowerCase();
    return allIngredients.filter((ing) => ing.name.toLowerCase().includes(q));
  }, [search, allIngredients]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<string, IngredientDef[]> = {};
    for (const ing of filtered) {
      if (!groups[ing.category]) groups[ing.category] = [];
      groups[ing.category].push(ing);
    }
    return groups;
  }, [filtered]);

  // Already selected names (lowercase) for filtering
  const selectedNames = useMemo(
    () => new Set(ingredients.map((i) => i.name.toLowerCase())),
    [ingredients]
  );

  // Close dropdown on outside click
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  const selectIngredient = (ing: IngredientDef) => {
    if (selectedNames.has(ing.name.toLowerCase())) return;
    onChange([...ingredients, { name: ing.name, icon: ing.icon, amount: null, unit: "g" }]);
    setSearch("");
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const removeIngredient = (idx: number) => {
    onChange(ingredients.filter((_, i) => i !== idx));
  };

  const updateAmount = (idx: number, amount: number | null) => {
    const copy = [...ingredients];
    copy[idx] = { ...copy[idx], amount };
    onChange(copy);
  };

  const updateUnit = (idx: number, unit: IngredientUnit) => {
    const copy = [...ingredients];
    copy[idx] = { ...copy[idx], unit };
    onChange(copy);
  };

  const updateIcon = (idx: number, icon: string) => {
    const copy = [...ingredients];
    copy[idx] = { ...copy[idx], icon };
    onChange(copy);
    setEditingIconIdx(null);
  };

  const handleAddCustom = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addCustomIngredient({ name: trimmed, icon: newIcon });
    onChange([...ingredients, { name: trimmed, icon: newIcon, amount: null, unit: "g" }]);
    setNewName("");
    setNewIcon("⭐");
    setShowNewForm(false);
    setSearch("");
    setShowDropdown(false);
  };

  const noResults = search.trim() && filtered.length === 0;

  return (
    <div className="ingredient-picker">
      {/* Selected ingredients */}
      {ingredients.length > 0 && (
        <div className="ip-selected">
          {ingredients.map((ing, idx) => (
            <div key={idx} className="ip-item">
              <button
                type="button"
                className="ip-item__icon-btn"
                onClick={() => setEditingIconIdx(editingIconIdx === idx ? null : idx)}
                title="Icon ändern"
              >
                {ing.icon}
              </button>
              <span className="ip-item__name">{ing.name}</span>
              <input
                type="number"
                className="ip-item__amount"
                placeholder="0"
                min={0}
                value={ing.amount ?? ""}
                onChange={(e) => updateAmount(idx, e.target.value ? parseFloat(e.target.value) : null)}
              />
              <select
                className="ip-item__unit"
                value={ing.unit}
                onChange={(e) => updateUnit(idx, e.target.value as IngredientUnit)}
              >
                {INGREDIENT_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
              <button
                type="button"
                className="editor-remove-btn"
                onClick={() => removeIngredient(idx)}
              >
                <X size={16} />
              </button>

              {/* Icon Picker inline */}
              {editingIconIdx === idx && (
                <div className="ip-icon-picker">
                  {INGREDIENT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`ip-icon-btn ${ing.icon === icon ? "ip-icon-btn--active" : ""}`}
                      onClick={() => updateIcon(idx, icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search / Add */}
      <div className="ip-search-wrap" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          className="editor-input"
          placeholder="Zutat suchen oder hinzufügen..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
        />

        {showDropdown && (
          <div className="ip-dropdown">
            {Object.keys(grouped).length > 0 && (
              <div className="ip-dropdown__list">
                {INGREDIENT_CATEGORIES.filter((cat) => grouped[cat])
                  .map((cat) => (
                    <div key={cat}>
                      <div className="ip-dropdown__cat">{cat}</div>
                      {grouped[cat].map((ing) => {
                        const isSelected = selectedNames.has(ing.name.toLowerCase());
                        return (
                          <button
                            key={ing.name}
                            type="button"
                            className={`ip-dropdown__item ${isSelected ? "ip-dropdown__item--disabled" : ""}`}
                            onClick={() => !isSelected && selectIngredient(ing)}
                            disabled={isSelected}
                          >
                            <span className="ip-dropdown__icon">{ing.icon}</span>
                            <span>{ing.name}</span>
                            {isSelected && <span className="ip-dropdown__check">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  ))}
              </div>
            )}

            {noResults && !showNewForm && (
              <div className="ip-dropdown__empty">
                Keine Zutat gefunden.
              </div>
            )}

            {/* Add custom ingredient */}
            {!showNewForm ? (
              <button
                type="button"
                className="ip-dropdown__add"
                onClick={() => {
                  setShowNewForm(true);
                  setNewName(search);
                }}
              >
                <Plus size={16} /> Eigene Zutat erstellen
              </button>
            ) : (
              <div className="ip-new-form">
                <div className="ip-new-form__header">Neue Zutat</div>
                <div className="ip-new-form__row">
                  <button
                    type="button"
                    className="ip-new-form__icon-preview"
                    title="Icon wählen"
                  >
                    {newIcon}
                  </button>
                  <input
                    type="text"
                    className="editor-input editor-input--flex"
                    placeholder="Name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="ip-icon-picker ip-icon-picker--compact">
                  {INGREDIENT_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`ip-icon-btn ${newIcon === icon ? "ip-icon-btn--active" : ""}`}
                      onClick={() => setNewIcon(icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <div className="ip-new-form__actions">
                  <button
                    type="button"
                    className="editor-add-btn"
                    onClick={handleAddCustom}
                    disabled={!newName.trim()}
                  >
                    <Plus size={14} /> Hinzufügen
                  </button>
                  <button
                    type="button"
                    className="ip-new-form__cancel"
                    onClick={() => setShowNewForm(false)}
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
