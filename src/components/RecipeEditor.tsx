import { useState, useRef } from "react";
import { ArrowLeft, Plus, X, Clock, Camera, Upload } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { SKILLS, RECIPE_CATEGORIES, CAT_RATINGS } from "../types/player";
import type { CustomRecipe, CustomRecipeStep, SkillId, RecipeIngredient } from "../types/player";
import { resizeImage } from "../utils/image";
import IngredientPicker from "./IngredientPicker";

interface RecipeEditorProps {
  onClose: () => void;
  existingRecipe?: CustomRecipe;
}

export default function RecipeEditor({ onClose, existingRecipe }: RecipeEditorProps) {
  const { addCustomRecipe, updateCustomRecipe } = usePlayer();
  const isEditing = !!existingRecipe;

  const [name, setName] = useState(existingRecipe?.name ?? "");
  const [category, setCategory] = useState(existingRecipe?.category ?? "");
  const [rating, setRating] = useState(existingRecipe?.rating ?? 0);
  const [cookingTime, setCookingTime] = useState<number | undefined>(existingRecipe?.cookingTimeMinutes);
  const [image, setImage] = useState<string | undefined>(existingRecipe?.image);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>(existingRecipe?.ingredients ?? []);
  const [steps, setSteps] = useState<CustomRecipeStep[]>(
    existingRecipe?.steps ?? [{ description: "" }]
  );
  const [equipment, setEquipment] = useState<string[]>(
    existingRecipe?.equipment.length ? existingRecipe.equipment : [""]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addStep = () => setSteps([...steps, { description: "" }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, update: Partial<CustomRecipeStep>) => {
    const copy = [...steps];
    copy[i] = { ...copy[i], ...update };
    setSteps(copy);
  };

  const addEquipment = () => setEquipment([...equipment, ""]);
  const removeEquipment = (i: number) => setEquipment(equipment.filter((_, idx) => idx !== i));
  const updateEquipment = (i: number, val: string) => {
    const copy = [...equipment];
    copy[i] = val;
    setEquipment(copy);
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    const resized = await resizeImage(file);
    setImage(resized);
  };

  const canSave =
    name.trim() &&
    category &&
    rating > 0 &&
    ingredients.some((ing) => ing.name.trim()) &&
    steps.some((s) => s.description.trim());

  const handleSave = () => {
    const recipe: CustomRecipe = {
      id: existingRecipe?.id ?? `custom-${Date.now()}`,
      name: name.trim(),
      category,
      rating,
      cookingTimeMinutes: cookingTime,
      image,
      ingredients: ingredients.filter((ing) => ing.name.trim()),
      steps: steps.filter((s) => s.description.trim()),
      equipment: equipment.filter((e) => e.trim()),
      createdAt: existingRecipe?.createdAt ?? new Date().toISOString(),
    };
    if (isEditing) {
      updateCustomRecipe(recipe);
    } else {
      addCustomRecipe(recipe);
    }
    onClose();
  };

  return (
    <div className="recipe-editor">
      <button className="back-btn" onClick={onClose}>
        <ArrowLeft size={20} />
        Zurück
      </button>

      <h1 className="recipe-editor__title">
        {isEditing ? "✏️ Rezept bearbeiten" : "🐱 Neues Rezept"}
      </h1>

      {/* Image */}
      <div className="editor-field">
        <label className="editor-label">📸 Bild</label>
        <div className="editor-image-area">
          {image ? (
            <div className="editor-image-preview">
              <img src={image} alt="Rezeptbild" />
              <button
                type="button"
                className="editor-image-remove"
                onClick={() => setImage(undefined)}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="editor-image-placeholder">
              <span>🐱</span>
              <span className="editor-image-placeholder__text">Bild hinzufügen</span>
            </div>
          )}
          <div className="editor-image-actions">
            <button
              type="button"
              className="editor-image-btn"
              onClick={() => cameraInputRef.current?.click()}
            >
              <Camera size={18} />
              Foto
            </button>
            <button
              type="button"
              className="editor-image-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={18} />
              Hochladen
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="editor-image-input"
            onChange={(e) => handleImageFile(e.target.files?.[0])}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="editor-image-input"
            onChange={(e) => handleImageFile(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* Name */}
      <div className="editor-field">
        <label className="editor-label">Rezeptname</label>
        <input
          type="text"
          className="editor-input"
          placeholder="z.B. Katzen-Carbonara..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
        />
      </div>

      {/* Category + Cooking Time row */}
      <div className="editor-row-group">
        <div className="editor-field editor-field--flex">
          <label className="editor-label">Kategorie</label>
          <select
            className="editor-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Wählen...</option>
            {RECIPE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="editor-field editor-field--time">
          <label className="editor-label">⏱️ Kochdauer</label>
          <div className="editor-time-input">
            <input
              type="number"
              className="editor-input editor-input--tiny"
              placeholder="0"
              min={0}
              value={cookingTime ?? ""}
              onChange={(e) => setCookingTime(e.target.value ? parseInt(e.target.value) : undefined)}
            />
            <span className="editor-time-unit">Min.</span>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="editor-field">
        <label className="editor-label">Bewertung</label>
        <div className="cat-rating">
          {CAT_RATINGS.map((emoji, i) => (
            <button
              key={i}
              type="button"
              className={`cat-rating__btn ${rating === i + 1 ? "cat-rating__btn--active" : ""}`}
              onClick={() => setRating(i + 1)}
              title={`${i + 1} von 5`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="editor-field">
        <label className="editor-label">🥕 Zutaten</label>
        <IngredientPicker ingredients={ingredients} onChange={setIngredients} />
      </div>

      {/* Steps */}
      <div className="editor-field">
        <label className="editor-label">📝 Arbeitsschritte</label>
        {steps.map((step, i) => (
          <div key={i} className="editor-step">
            <div className="editor-step__header">
              <span className="editor-step__number">Schritt {i + 1}</span>
              {steps.length > 1 && (
                <button type="button" className="editor-remove-btn" onClick={() => removeStep(i)}>
                  <X size={16} />
                </button>
              )}
            </div>
            <textarea
              className="editor-textarea"
              placeholder="Was wird gemacht?"
              value={step.description}
              onChange={(e) => updateStep(i, { description: e.target.value })}
              rows={2}
            />
            <div className="editor-step__meta">
              <div className="editor-step__skill">
                <label className="editor-mini-label">Skill</label>
                <select
                  className="editor-select editor-select--small"
                  value={step.skillId ?? ""}
                  onChange={(e) =>
                    updateStep(i, { skillId: (e.target.value || undefined) as SkillId | undefined })
                  }
                >
                  <option value="">Kein Skill</option>
                  {SKILLS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.emoji} {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="editor-step__time">
                <label className="editor-mini-label">
                  <Clock size={12} /> Wartezeit
                </label>
                <div className="editor-time-input">
                  <input
                    type="number"
                    className="editor-input editor-input--tiny"
                    placeholder="0"
                    min={0}
                    value={step.waitMinutes ?? ""}
                    onChange={(e) =>
                      updateStep(i, {
                        waitMinutes: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                  />
                  <span className="editor-time-unit">Min.</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="editor-add-btn" onClick={addStep}>
          <Plus size={16} /> Schritt hinzufügen
        </button>
      </div>

      {/* Equipment */}
      <div className="editor-field">
        <label className="editor-label">🍳 Geräte</label>
        {equipment.map((eq, i) => (
          <div key={i} className="editor-row">
            <input
              type="text"
              className="editor-input editor-input--flex"
              placeholder="z.B. Pfanne, Ofen, Mixer..."
              value={eq}
              onChange={(e) => updateEquipment(i, e.target.value)}
            />
            {equipment.length > 1 && (
              <button type="button" className="editor-remove-btn" onClick={() => removeEquipment(i)}>
                <X size={16} />
              </button>
            )}
          </div>
        ))}
        <button type="button" className="editor-add-btn" onClick={addEquipment}>
          <Plus size={16} /> Gerät hinzufügen
        </button>
      </div>

      {/* Save */}
      <button
        type="button"
        className="editor-save-btn"
        disabled={!canSave}
        onClick={handleSave}
      >
        {isEditing ? "✏️ Änderungen speichern" : "🐾 Rezept speichern"}
      </button>
    </div>
  );
}
