import { useMemo } from "react";
import { usePlayer } from "../context/PlayerContext";
import { useLikedRecipes } from "../context/LikedRecipesContext";
import { getCustomRecipeById } from "../data/localRecipes";
import type { CustomRecipe } from "../types/player";

export function useAllRecipes(): CustomRecipe[] {
  const { player } = usePlayer();
  const { likedRecipes } = useLikedRecipes();
  const customRecipes = player?.customRecipes ?? [];

  const likedAsCustom = useMemo<CustomRecipe[]>(() => {
    const customIds = new Set(customRecipes.map((r) => r.id));
    return likedRecipes
      .map((m) => getCustomRecipeById(m.idMeal))
      .filter((r): r is CustomRecipe => !!r)
      .filter((r) => !customIds.has(r.id));
  }, [likedRecipes, customRecipes]);

  return useMemo(
    () => [...customRecipes, ...likedAsCustom],
    [customRecipes, likedAsCustom]
  );
}
