import { supabase } from "./supabase";

export async function fetchLikedRecipeIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("liked_recipes")
    .select("recipe_id")
    .eq("user_id", userId);
  if (error) {
    console.error("fetchLikedRecipeIds:", error);
    return [];
  }
  return data.map((r) => r.recipe_id);
}

export async function addLikeRemote(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from("liked_recipes")
    .upsert({ user_id: userId, recipe_id: recipeId }, { onConflict: "user_id,recipe_id" });
  if (error) console.error("addLikeRemote:", error);
}

export async function removeLikeRemote(userId: string, recipeId: string): Promise<void> {
  const { error } = await supabase
    .from("liked_recipes")
    .delete()
    .eq("user_id", userId)
    .eq("recipe_id", recipeId);
  if (error) console.error("removeLikeRemote:", error);
}
