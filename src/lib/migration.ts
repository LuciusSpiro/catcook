import { supabase, isOnline } from "./supabase";
import { STORAGE_KEY_PLAYER, STORAGE_KEY_LIKED, STORAGE_KEY_MIGRATED } from "../constants";
import type { PlayerData } from "../types/player";
import type { Meal } from "../types/meal";

/** Migrate localStorage data to Supabase. Runs once per user. */
export async function migrateLocalData(userId: string): Promise<void> {
  const alreadyMigrated = localStorage.getItem(STORAGE_KEY_MIGRATED);
  if (alreadyMigrated || !isOnline()) return;

  const playerRaw = localStorage.getItem(STORAGE_KEY_PLAYER);
  const likedRaw = localStorage.getItem(STORAGE_KEY_LIKED);

  const player: PlayerData | null = playerRaw ? JSON.parse(playerRaw) : null;
  const liked: Meal[] = likedRaw ? JSON.parse(likedRaw) : [];

  if (!player && liked.length === 0) {
    localStorage.setItem(STORAGE_KEY_MIGRATED, "true");
    return;
  }

  try {
    await migrateProfile(userId, player);
    if (player) {
      await migrateCustomRecipes(userId, player);
      await migrateMealPlan(userId, player);
      await migratePantry(userId, player);
    }
    await migrateLikedRecipes(userId, liked);
    localStorage.setItem(STORAGE_KEY_MIGRATED, "true");
  } catch (err) {
    console.error("Migration failed:", err);
  }
}

async function migrateProfile(userId: string, player: PlayerData | null) {
  if (!player) return;
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: player.name })
    .eq("id", userId);
  if (error) console.error("Profile migration:", error);
}

async function migrateCustomRecipes(userId: string, player: PlayerData) {
  if (player.customRecipes.length === 0) return;

  // We need a household first — create a personal one
  const householdId = await getOrCreatePersonalHousehold(userId, player.name);
  if (!householdId) return;

  const rows = player.customRecipes.map((r) => ({
    household_id: householdId,
    created_by: userId,
    title: r.name,
    description: r.category,
    image_url: r.image?.startsWith("data:") ? null : r.image,
    prep_time: null,
    cook_time: r.cookingTimeMinutes,
    servings: r.servings ?? 2,
    difficulty: "easy",
    tags: r.tags ?? [],
    ingredients: r.ingredients,
    steps: r.steps,
  }));

  const { error } = await supabase.from("custom_recipes").insert(rows);
  if (error) console.error("Custom recipes migration:", error);
}

async function migrateLikedRecipes(userId: string, liked: Meal[]) {
  if (liked.length === 0) return;
  const rows = liked.map((m) => ({
    user_id: userId,
    recipe_id: m.idMeal,
  }));
  const { error } = await supabase.from("liked_recipes").upsert(rows, {
    onConflict: "user_id,recipe_id",
  });
  if (error) console.error("Liked recipes migration:", error);
}

async function migrateMealPlan(userId: string, player: PlayerData) {
  const plan = player.mealPlan;
  if (!plan || Object.keys(plan).length === 0) return;

  const householdId = await getOrCreatePersonalHousehold(userId, player.name);
  if (!householdId) return;

  const rows = Object.entries(plan).map(([date, entry]) => ({
    household_id: householdId,
    recipe_id: entry.recipeId,
    planned_date: date,
    meal_type: "dinner",
    added_by: userId,
  }));

  const { error } = await supabase.from("meal_plan").insert(rows);
  if (error) console.error("Meal plan migration:", error);
}

async function migratePantry(userId: string, player: PlayerData) {
  const pantry = player.pantry;
  if (!pantry || Object.keys(pantry).length === 0) return;

  const householdId = await getOrCreatePersonalHousehold(userId, player.name);
  if (!householdId) return;

  const rows = Object.values(pantry).map((item) => ({
    household_id: householdId,
    ingredient_name: item.name,
    quantity: item.amount ?? null,
    unit: item.unit ?? null,
    added_by: userId,
  }));

  const { error } = await supabase.from("pantry").insert(rows);
  if (error) console.error("Pantry migration:", error);
}

/** Cache to avoid creating multiple households */
let cachedHouseholdId: string | null = null;

async function getOrCreatePersonalHousehold(
  userId: string,
  playerName: string
): Promise<string | null> {
  if (cachedHouseholdId) return cachedHouseholdId;

  // Check if user already has a household
  const { data: existing } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (existing) {
    cachedHouseholdId = existing.household_id;
    return existing.household_id;
  }

  // Create personal household
  const { data: hh, error } = await supabase
    .from("households")
    .insert({ name: `${playerName}s Küche`, created_by: userId })
    .select("id")
    .single();

  if (error || !hh) {
    console.error("Household creation failed:", error);
    return null;
  }

  // Add creator as owner
  await supabase.from("household_members").insert({
    household_id: hh.id,
    user_id: userId,
    role: "owner",
  });

  cachedHouseholdId = hh.id;
  return hh.id;
}
