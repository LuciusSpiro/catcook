import { createContext, useContext, useCallback, useMemo, useEffect, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useLikedRecipes } from "./LikedRecipesContext";
import { useAuth } from "./AuthContext";
import { STORAGE_KEY_PLAYER } from "../constants";
import type { PlayerData, CustomRecipe, CustomIngredient, AchievementTier, MealPlanEntry, PantryItem, SkillId } from "../types/player";
import { SKILLS } from "../types/player";
import { calculateCookReward, type CookReward } from "../utils/cookReward";
export type { CookReward } from "../utils/cookReward";
import { updateProfile } from "../lib/supabaseProfile";
import { migrateLocalData } from "../lib/migration";
import { isOnline } from "../lib/supabase";

interface PlayerContextValue {
  player: PlayerData | null;
  setName: (name: string) => void;
  addCustomRecipe: (recipe: CustomRecipe) => void;
  updateCustomRecipe: (recipe: CustomRecipe) => void;
  removeCustomRecipe: (id: string) => void;
  addCustomIngredient: (ingredient: CustomIngredient) => void;
  completeRecipeCook: (recipe: CustomRecipe, goodTiming?: boolean) => CookReward;
  setMealPlan: (date: string, entry: MealPlanEntry | null) => void;
  mealPlan: Record<string, MealPlanEntry>;
  pantry: Record<string, PantryItem>;
  setPantryItem: (item: PantryItem) => void;
  removePantryItem: (name: string) => void;
  bulkAddToPantry: (items: PantryItem[]) => void;
  stats: Record<string, number>;
  getAchievementTier: (statKey: string, thresholds: [number, number, number]) => AchievementTier;
  skillXp: Record<string, number>;
  resetProgress: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useLocalStorage<PlayerData | null>(STORAGE_KEY_PLAYER, null);
  const { likedRecipes } = useLikedRecipes();
  const { user } = useAuth();

  // Run migration once when user becomes available
  useEffect(() => {
    if (user && isOnline()) {
      migrateLocalData(user.id);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setName = useCallback(
    (name: string) => {
      setPlayer((prev) =>
        prev ? { ...prev, name } : { name, xp: 0, customRecipes: [], customIngredients: [] }
      );
      if (user && isOnline()) {
        updateProfile(user.id, { display_name: name });
      }
    },
    [setPlayer, user]
  );

  const addCustomRecipe = useCallback(
    (recipe: CustomRecipe) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        return { ...prev, customRecipes: [recipe, ...prev.customRecipes] };
      });
    },
    [setPlayer]
  );

  const updateCustomRecipe = useCallback(
    (recipe: CustomRecipe) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          customRecipes: prev.customRecipes.map((r) => (r.id === recipe.id ? recipe : r)),
        };
      });
    },
    [setPlayer]
  );

  const addCustomIngredient = useCallback(
    (ingredient: CustomIngredient) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const existing = prev.customIngredients ?? [];
        if (existing.some((i) => i.name.toLowerCase() === ingredient.name.toLowerCase())) return prev;
        return { ...prev, customIngredients: [...existing, ingredient] };
      });
    },
    [setPlayer]
  );

  const removeCustomRecipe = useCallback(
    (id: string) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        return { ...prev, customRecipes: prev.customRecipes.filter((r) => r.id !== id) };
      });
    },
    [setPlayer]
  );

  const rawStats = useMemo(() => {
    const recipes = player?.customRecipes ?? [];
    const s: Record<string, number> = {
      recipes_liked: likedRecipes.length,
      recipes_created: recipes.length,
      skill_chopping: 0, skill_cooking: 0, skill_frying: 0,
      skill_baking: 0, skill_seasoning: 0, timing_steps: 0,
      five_star_ratings: 0, unique_equipment: 0,
    };
    const equipmentSet = new Set<string>();
    for (const recipe of recipes) {
      if (recipe.rating === 5) s.five_star_ratings++;
      for (const step of recipe.steps) {
        if (step.skillId) s[`skill_${step.skillId}`]++;
        if (step.waitMinutes && step.waitMinutes > 0) s.timing_steps++;
      }
      for (const eq of recipe.equipment) equipmentSet.add(eq.toLowerCase());
    }
    s.unique_equipment = equipmentSet.size;
    return s;
  }, [player?.customRecipes, likedRecipes.length]);

  const stats = useMemo(() => {
    const baseline = player?.achievementBaseline ?? {};
    const s: Record<string, number> = {};
    for (const key of Object.keys(rawStats)) {
      s[key] = Math.max(0, rawStats[key] - (baseline[key] ?? 0));
    }
    return s;
  }, [rawStats, player?.achievementBaseline]);

  const skillXp = useMemo(() => {
    const counts = player?.skillCookCounts ?? {};
    return Object.fromEntries(SKILLS.map((s) => [s.id, counts[s.id] ?? 0]));
  }, [player?.skillCookCounts]);

  const getAchievementTier = useCallback(
    (statKey: string, thresholds: [number, number, number]): AchievementTier => {
      const val = stats[statKey] ?? 0;
      if (val >= thresholds[2]) return "gold";
      if (val >= thresholds[1]) return "silver";
      if (val >= thresholds[0]) return "bronze";
      return "locked";
    },
    [stats]
  );

  const completeRecipeCook = useCallback(
    (recipe: CustomRecipe, goodTiming = false): CookReward => {
      const reward = calculateCookReward(
        player?.xp ?? 0,
        (player?.skillCookCounts ?? {}) as Partial<Record<SkillId, number>>,
        recipe,
        goodTiming,
      );
      setPlayer((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          xp: (prev.xp ?? 0) + reward.totalXp,
          skillCookCounts: reward.newSkillCounts,
          cookSessions: (prev.cookSessions ?? 0) + 1,
        };
      });
      return reward;
    },
    [player?.xp, player?.customRecipes, setPlayer]
  );

  const mealPlan = player?.mealPlan ?? {};
  const pantry = player?.pantry ?? {};

  const setPantryItem = useCallback(
    (item: PantryItem) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const p = { ...(prev.pantry ?? {}) };
        p[item.name.toLowerCase()] = item;
        return { ...prev, pantry: p };
      });
    },
    [setPlayer]
  );

  const removePantryItem = useCallback(
    (name: string) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const p = { ...(prev.pantry ?? {}) };
        delete p[name.toLowerCase()];
        return { ...prev, pantry: p };
      });
    },
    [setPlayer]
  );

  const bulkAddToPantry = useCallback(
    (items: PantryItem[]) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const p = { ...(prev.pantry ?? {}) };
        for (const item of items) p[item.name.toLowerCase()] = item;
        return { ...prev, pantry: p };
      });
    },
    [setPlayer]
  );

  const resetProgress = useCallback(() => {
    setPlayer((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        xp: 0,
        skillCookCounts: {},
        cookSessions: 0,
        achievementBaseline: { ...rawStats },
      };
    });
  }, [setPlayer, rawStats]);

  const setMealPlan = useCallback(
    (date: string, entry: MealPlanEntry | null) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const plan = { ...(prev.mealPlan ?? {}) };
        if (entry) plan[date] = entry;
        else delete plan[date];
        return { ...prev, mealPlan: plan };
      });
    },
    [setPlayer]
  );

  return (
    <PlayerContext.Provider
      value={{
        player, setName, addCustomRecipe, updateCustomRecipe, removeCustomRecipe,
        addCustomIngredient, completeRecipeCook, setMealPlan, mealPlan, pantry,
        setPantryItem, removePantryItem, bulkAddToPantry, stats, getAchievementTier, skillXp,
        resetProgress,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
