import { useState, useMemo } from "react";
import { ShoppingCart, Package, Trash2 } from "lucide-react";
import { usePlayer } from "../context/PlayerContext";
import { getCustomRecipeById } from "../data/localRecipes";
import { formatIngredientAmount } from "../utils/format";
import { toDateStr } from "../utils/date";
import type { PantryItem } from "../types/player";
import SwipeRow from "../components/SwipeRow";

type Tab = "shopping" | "pantry";

interface AggregatedItem {
  name: string;
  icon: string;
  amount: number | null;
  unit: string;
  inPantry: boolean;
}

function aggregateIngredients(
  mealPlan: Record<string, { recipeId: string }>,
  fromDate: string,
  toDate: string,
  pantry: Record<string, PantryItem>
): AggregatedItem[] {
  const items = new Map<string, AggregatedItem>();

  const dates = Object.keys(mealPlan).filter((d) => d >= fromDate && d <= toDate);
  for (const date of dates) {
    const entry = mealPlan[date];
    const recipe = getCustomRecipeById(entry.recipeId);
    if (!recipe) continue;

    for (const ing of recipe.ingredients) {
      const key = `${ing.name.toLowerCase()}__${ing.unit}`;
      const existing = items.get(key);
      if (existing) {
        if (existing.amount != null && ing.amount != null) {
          existing.amount = Math.round((existing.amount + ing.amount) * 10) / 10;
        }
      } else {
        items.set(key, {
          name: ing.name,
          icon: ing.icon,
          amount: ing.amount,
          unit: ing.unit,
          inPantry: !!pantry[ing.name.toLowerCase()]?.inStock,
        });
      }
    }
  }

  return Array.from(items.values()).sort((a, b) => a.name.localeCompare(b.name, "de"));
}

export default function ShoppingPage() {
  const { mealPlan, pantry, setPantryItem, removePantryItem, bulkAddToPantry } = usePlayer();
  const [tab, setTab] = useState<Tab>("shopping");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + (7 - d.getDay())); // next Sunday
    return toDateStr(d);
  });
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [listGenerated, setListGenerated] = useState(false);
  const [pantrySearch, setPantrySearch] = useState("");

  const today = toDateStr(new Date());

  const shoppingList = useMemo(
    () => aggregateIngredients(mealPlan, today, targetDate, pantry),
    [mealPlan, today, targetDate, pantry]
  );

  const visibleItems = useMemo(
    () => shoppingList.filter((item) => !item.inPantry && !dismissed.has(`${item.name}__${item.unit}`)),
    [shoppingList, dismissed]
  );

  const pantryItems = useMemo(
    () =>
      Object.values(pantry)
        .filter((p) => p.inStock)
        .filter((p) => !pantrySearch || p.name.toLowerCase().includes(pantrySearch.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name, "de")),
    [pantry, pantrySearch]
  );

  const handleBought = (item: AggregatedItem) => {
    setPantryItem({
      name: item.name,
      icon: item.icon,
      inStock: true,
      amount: item.amount ?? undefined,
      unit: item.unit as PantryItem["unit"],
    });
    setDismissed((prev) => new Set(prev).add(`${item.name}__${item.unit}`));
  };

  const handleDismiss = (item: AggregatedItem) => {
    setDismissed((prev) => new Set(prev).add(`${item.name}__${item.unit}`));
  };

  const handleBuyAll = () => {
    const items: PantryItem[] = visibleItems.map((item) => ({
      name: item.name,
      icon: item.icon,
      inStock: true,
      amount: item.amount ?? undefined,
      unit: item.unit as PantryItem["unit"],
    }));
    bulkAddToPantry(items);
    setDismissed(new Set(shoppingList.map((i) => `${i.name}__${i.unit}`)));
  };

  return (
    <div className="page shopping-page">
      {/* Tab Toggle */}
      <div className="shopping-tabs">
        <button
          className={`shopping-tab ${tab === "shopping" ? "shopping-tab--active" : ""}`}
          onClick={() => setTab("shopping")}
        >
          <ShoppingCart size={18} />
          Einkaufsliste
        </button>
        <button
          className={`shopping-tab ${tab === "pantry" ? "shopping-tab--active" : ""}`}
          onClick={() => setTab("pantry")}
        >
          <Package size={18} />
          Vorratslager
        </button>
      </div>

      {/* ── Shopping List ── */}
      {tab === "shopping" && (
        <div className="shopping-list-section">
          <div className="shopping-date-row">
            <label className="editor-mini-label">Einkaufen bis</label>
            <input
              type="date"
              className="editor-input shopping-date-input"
              value={targetDate}
              min={today}
              onChange={(e) => { setTargetDate(e.target.value); setDismissed(new Set()); setListGenerated(false); }}
            />
            <button
              className="shopping-generate-btn"
              onClick={() => { setDismissed(new Set()); setListGenerated(true); }}
            >
              Liste erstellen
            </button>
          </div>

          {!listGenerated ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <span style={{ fontSize: "2.5rem" }}>📋</span>
              <h2 style={{ fontSize: "1.1rem" }}>Datum wählen und Liste erstellen</h2>
              <p className="text-light">
                Wähle bis wann du einkaufen möchtest und klicke auf "Liste erstellen".
              </p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <span style={{ fontSize: "2.5rem" }}>🛒</span>
              <h2 style={{ fontSize: "1.1rem" }}>
                {shoppingList.length === 0
                  ? "Keine Rezepte geplant"
                  : "Alles erledigt!"}
              </h2>
              <p className="text-light">
                {shoppingList.length === 0
                  ? "Plane Rezepte im Wochenplaner, um deine Einkaufsliste zu füllen."
                  : "Alle Zutaten sind eingekauft oder im Lager. 🐾"}
              </p>
            </div>
          ) : (
            <>
              <p className="text-light shopping-hint">
                ← Nicht nötig · Rechts → Gekauft
              </p>
              <div className="shopping-items">
                {visibleItems.map((item) => (
                  <SwipeRow
                    key={`${item.name}__${item.unit}`}
                    icon={item.icon}
                    label={item.name}
                    sublabel={formatIngredientAmount(item.amount, item.unit)}
                    onSwipeLeft={() => handleDismiss(item)}
                    onSwipeRight={() => handleBought(item)}
                  />
                ))}
              </div>
              <button className="editor-save-btn shopping-buy-all" onClick={handleBuyAll}>
                🛒 Alles übernehmen ({visibleItems.length})
              </button>
            </>
          )}
        </div>
      )}

      {/* ── Pantry ── */}
      {tab === "pantry" && (
        <div className="pantry-section">
          <input
            type="text"
            className="editor-input"
            placeholder="Im Vorrat suchen..."
            value={pantrySearch}
            onChange={(e) => setPantrySearch(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          {pantryItems.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px 20px" }}>
              <span style={{ fontSize: "2.5rem" }}>📦</span>
              <h2 style={{ fontSize: "1.1rem" }}>Lager ist leer</h2>
              <p className="text-light">
                Kaufe Zutaten über die Einkaufsliste ein, um dein Lager zu füllen.
              </p>
            </div>
          ) : (
            <div className="pantry-items">
              {pantryItems.map((item) => (
                <div key={item.name} className="pantry-item">
                  <span className="pantry-item__icon">{item.icon}</span>
                  <span className="pantry-item__name">{item.name}</span>
                  <span className="pantry-item__amount">
                    {formatIngredientAmount(item.amount, item.unit)}
                  </span>
                  <button
                    className="pantry-item__remove"
                    onClick={() => removePantryItem(item.name)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
