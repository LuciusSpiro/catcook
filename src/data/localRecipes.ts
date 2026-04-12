// Local recipe provider — replaces TheMealDB API with statically imported recipes.
// Mirrors the API surface of `src/api/mealdb.ts` so that consumers can swap imports
// without changes to the surrounding code.

import baseRezepteMapped from "./baseRezepteMapped.json";
import type { CustomRecipe } from "../types/player";
import { formatIngredientAmount } from "../utils/format";
import type {
  Meal,
  MealSummary,
  Category,
  Area,
  IngredientListItem,
  Ingredient,
} from "../types/meal";

// Cast the imported JSON to our type. The conversion script guarantees this shape.
const ALL_RECIPES = baseRezepteMapped as CustomRecipe[];

// ── Adapter: CustomRecipe → Meal (TheMealDB shape) ──────────────────────────

export function customRecipeToMeal(recipe: CustomRecipe): Meal {
  const ingredients: Ingredient[] = recipe.ingredients.map((ing) => ({
    name: ing.icon ? `${ing.icon} ${ing.name}` : ing.name,
    measure: formatIngredientAmount(ing.amount, ing.unit),
  }));

  const strInstructions = recipe.steps
    .map((s, i) => {
      const prefix = `${i + 1}. `;
      const skill = s.skillId ? ` [${s.skillId}]` : "";
      const wait = s.waitMinutes ? ` ⏱️ ${s.waitMinutes} Min.` : "";
      return `${prefix}${s.description}${skill}${wait}`;
    })
    .join("\n\n");

  return {
    idMeal: recipe.id,
    strMeal: recipe.name,
    strCategory: recipe.category,
    strArea: recipe.area ?? "",
    strMealThumb: recipe.image ?? "",
    strInstructions,
    strYoutube: recipe.youtube,
    strTags: recipe.tags?.join(","),
    ingredients,
  };
}

// ── In-memory indexes ───────────────────────────────────────────────────────

const BY_ID = new Map<string, CustomRecipe>();
ALL_RECIPES.forEach((r) => BY_ID.set(r.id, r));

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Direct lookup for the cook flow: given a liked Meal.idMeal, return the
// original CustomRecipe (with structured steps, hints, skills, etc.).
export function getCustomRecipeById(id: string): CustomRecipe | undefined {
  return BY_ID.get(id);
}

// ── API mirror (matches src/api/mealdb.ts) ──────────────────────────────────

export async function getRandomMeal(): Promise<Meal> {
  const idx = Math.floor(Math.random() * ALL_RECIPES.length);
  return customRecipeToMeal(ALL_RECIPES[idx]);
}

export async function getMealById(id: string): Promise<Meal> {
  const recipe = BY_ID.get(id);
  if (!recipe) throw new Error(`Recipe not found: ${id}`);
  return customRecipeToMeal(recipe);
}

export async function getMealsByCategory(category: string): Promise<MealSummary[]> {
  return ALL_RECIPES
    .filter((r) => r.category === category)
    .map((r) => ({
      idMeal: r.id,
      strMeal: r.name,
      strMealThumb: r.image ?? "",
    }));
}

export async function getMealsByArea(area: string): Promise<MealSummary[]> {
  return ALL_RECIPES
    .filter((r) => r.area === area)
    .map((r) => ({
      idMeal: r.id,
      strMeal: r.name,
      strMealThumb: r.image ?? "",
    }));
}

export async function getCategories(): Promise<Category[]> {
  const set = new Set<string>();
  ALL_RECIPES.forEach((r) => r.category && set.add(r.category));
  return Array.from(set).sort().map((c) => ({ strCategory: c }));
}

export async function getAreas(): Promise<Area[]> {
  const set = new Set<string>();
  ALL_RECIPES.forEach((r) => r.area && set.add(r.area));
  return Array.from(set).sort().map((a) => ({ strArea: a }));
}

export async function getIngredientList(): Promise<IngredientListItem[]> {
  const set = new Set<string>();
  ALL_RECIPES.forEach((r) =>
    r.ingredients.forEach((i) => i.name && set.add(i.name))
  );
  return Array.from(set).sort().map((name) => ({ strIngredient: name }));
}

// Suppress unused warning if shuffle is not used elsewhere
void shuffle;
