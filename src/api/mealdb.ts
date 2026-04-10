import type { Meal, MealSummary, Category, Area, Ingredient, IngredientListItem } from "../types/meal";

const BASE = "https://www.themealdb.com/api/json/v1/1";

function parseIngredients(raw: Record<string, string | null>): Ingredient[] {
  const ingredients: Ingredient[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = raw[`strIngredient${i}`]?.trim();
    const measure = raw[`strMeasure${i}`]?.trim() ?? "";
    if (name) {
      ingredients.push({ name, measure });
    }
  }
  return ingredients;
}

function toMeal(raw: Record<string, string | null>): Meal {
  return {
    idMeal: raw.idMeal!,
    strMeal: raw.strMeal!,
    strCategory: raw.strCategory ?? "",
    strArea: raw.strArea ?? "",
    strMealThumb: raw.strMealThumb ?? "",
    strInstructions: raw.strInstructions ?? "",
    strYoutube: raw.strYoutube || undefined,
    strTags: raw.strTags || undefined,
    ingredients: parseIngredients(raw),
  };
}

export async function getRandomMeal(): Promise<Meal> {
  const res = await fetch(`${BASE}/random.php`);
  const data = await res.json();
  return toMeal(data.meals[0]);
}

export async function getMealById(id: string): Promise<Meal> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  return toMeal(data.meals[0]);
}

export async function getMealsByCategory(category: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealsByArea(area: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/filter.php?a=${encodeURIComponent(area)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${BASE}/list.php?c=list`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getAreas(): Promise<Area[]> {
  const res = await fetch(`${BASE}/list.php?a=list`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getIngredientList(): Promise<IngredientListItem[]> {
  const res = await fetch(`${BASE}/list.php?i=list`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealsByIngredient(ingredient: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = await res.json();
  return data.meals ?? [];
}
