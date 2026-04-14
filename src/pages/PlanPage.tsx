import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Shuffle, X } from "lucide-react";
import { useAllRecipes } from "../hooks/useAllRecipes";
import { useHouseholdMealPlan } from "../hooks/useHouseholdMealPlan";
import { toDateStr, getMonday, getWeekDays } from "../utils/date";
import RecipePickItem from "../components/RecipePickItem";
import type { CustomRecipe } from "../types/player";

const DAY_NAMES = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_NAMES = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export default function PlanPage() {
  const allRecipes = useAllRecipes();
  const [weekOffset, setWeekOffset] = useState(0);
  const [pickingDate, setPickingDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = getMonday(today);
  monday.setDate(monday.getDate() + weekOffset * 7);
  const weekDays = getWeekDays(monday);

  const fromDate = toDateStr(weekDays[0]);
  const toDate = toDateStr(weekDays[6]);
  const { mealPlan, setMealPlan } = useHouseholdMealPlan(fromDate, toDate);

  const weekLabel = (() => {
    const first = weekDays[0];
    const last = weekDays[6];
    if (first.getMonth() === last.getMonth()) {
      return `${first.getDate()}.–${last.getDate()}. ${MONTH_NAMES[first.getMonth()]} ${first.getFullYear()}`;
    }
    return `${first.getDate()}. ${MONTH_NAMES[first.getMonth()].slice(0, 3)} – ${last.getDate()}. ${MONTH_NAMES[last.getMonth()].slice(0, 3)} ${last.getFullYear()}`;
  })();

  const filteredRecipes = useMemo(() => {
    if (!searchTerm.trim()) return allRecipes;
    const q = searchTerm.toLowerCase();
    return allRecipes.filter((r) =>
      r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q)
    );
  }, [allRecipes, searchTerm]);

  // Resolve recipe name/image for Supabase entries (which only store recipe_id)
  const resolveEntry = (entry: { recipeId: string; recipeName?: string; recipeImage?: string }) => {
    if (entry.recipeName) return entry;
    const recipe = allRecipes.find((r) => r.id === entry.recipeId);
    return {
      ...entry,
      recipeName: recipe?.name ?? entry.recipeId,
      recipeImage: recipe?.image,
    };
  };

  const assignRandom = (date: string) => {
    if (allRecipes.length === 0) return;
    const recipe = allRecipes[Math.floor(Math.random() * allRecipes.length)];
    setMealPlan(date, { recipeId: recipe.id, recipeName: recipe.name, recipeImage: recipe.image });
  };

  const assignRecipe = (date: string, recipe: CustomRecipe) => {
    setMealPlan(date, { recipeId: recipe.id, recipeName: recipe.name, recipeImage: recipe.image });
    setPickingDate(null);
    setSearchTerm("");
  };

  if (pickingDate) {
    return (
      <div className="page plan-page">
        <div className="plan-picker">
          <div className="plan-picker__header">
            <button className="back-btn" onClick={() => { setPickingDate(null); setSearchTerm(""); }}>
              <ChevronLeft size={20} />
              Zurück
            </button>
            <span className="plan-picker__date">
              {new Date(pickingDate).toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" })}
            </span>
          </div>

          <button
            className="plan-random-btn"
            onClick={() => { assignRandom(pickingDate); setPickingDate(null); setSearchTerm(""); }}
          >
            <Shuffle size={18} />
            Zufälliges Rezept
          </button>

          <input
            type="text"
            className="editor-input plan-picker__search"
            placeholder="Rezept suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />

          <div className="plan-picker__list">
            {filteredRecipes.length === 0 && (
              <p className="text-light" style={{ textAlign: "center", padding: 20 }}>
                {allRecipes.length === 0
                  ? "Noch keine Rezepte. Swipe oder erstelle welche!"
                  : "Kein Rezept gefunden."}
              </p>
            )}
            {filteredRecipes.map((recipe) => (
              <RecipePickItem key={recipe.id} recipe={recipe} onClick={() => assignRecipe(pickingDate, recipe)} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page plan-page">
      <h1 className="page-title">📅 Wochenplan</h1>

      <div className="plan-week-nav">
        <button className="plan-nav-btn" onClick={() => setWeekOffset(weekOffset - 1)}>
          <ChevronLeft size={20} />
        </button>
        <div className="plan-week-nav__label">
          {weekLabel}
          {weekOffset !== 0 && (
            <button className="plan-today-btn" onClick={() => setWeekOffset(0)}>Heute</button>
          )}
        </div>
        <button className="plan-nav-btn" onClick={() => setWeekOffset(weekOffset + 1)}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="plan-days">
        {weekDays.map((day, i) => {
          const dateStr = toDateStr(day);
          const rawEntry = mealPlan[dateStr];
          const entry = rawEntry ? resolveEntry(rawEntry) : null;
          const isToday = dateStr === toDateStr(today);
          const isPast = day < today && !isToday;

          return (
            <div key={dateStr} className={`plan-day ${isToday ? "plan-day--today" : ""} ${isPast ? "plan-day--past" : ""}`}>
              <div className="plan-day__header">
                <span className="plan-day__name">{DAY_NAMES[i]}</span>
                <span className="plan-day__date">{day.getDate()}.</span>
              </div>

              {entry ? (
                <div className="plan-day__recipe">
                  {entry.recipeImage && <img className="plan-day__img" src={entry.recipeImage} alt={entry.recipeName} />}
                  <span className="plan-day__recipe-name">{entry.recipeName}</span>
                  <button className="plan-day__remove" onClick={() => setMealPlan(dateStr, null)}><X size={14} /></button>
                </div>
              ) : (
                <div className="plan-day__empty">
                  <button className="plan-day__add" onClick={() => setPickingDate(dateStr)}>+ Rezept</button>
                  <button className="plan-day__random" onClick={() => assignRandom(dateStr)} title="Zufälliges Rezept"><Shuffle size={14} /></button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
