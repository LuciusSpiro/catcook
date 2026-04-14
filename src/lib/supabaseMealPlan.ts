import { supabase } from "./supabase";

export interface SupaMealPlanEntry {
  id: string;
  recipe_id: string;
  planned_date: string;
  meal_type: string;
  added_by: string;
}

export async function fetchMealPlan(
  householdId: string,
  from: string,
  to: string
): Promise<SupaMealPlanEntry[]> {
  const { data, error } = await supabase
    .from("meal_plan")
    .select("id, recipe_id, planned_date, meal_type, added_by")
    .eq("household_id", householdId)
    .gte("planned_date", from)
    .lte("planned_date", to);

  if (error) {
    console.error("fetchMealPlan:", error);
    return [];
  }
  return data ?? [];
}

export async function addMealPlanEntry(
  householdId: string,
  userId: string,
  recipeId: string,
  date: string,
  mealType = "dinner"
): Promise<void> {
  const { error } = await supabase.from("meal_plan").insert({
    household_id: householdId,
    recipe_id: recipeId,
    planned_date: date,
    meal_type: mealType,
    added_by: userId,
  });
  if (error) console.error("addMealPlanEntry:", error);
}

export async function removeMealPlanEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from("meal_plan")
    .delete()
    .eq("id", entryId);
  if (error) console.error("removeMealPlanEntry:", error);
}
