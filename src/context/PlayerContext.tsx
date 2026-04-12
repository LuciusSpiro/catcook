import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useLikedRecipes } from "./LikedRecipesContext";
import { STORAGE_KEY_PLAYER, SKILL_MAX_LEVEL, SKILL_XP_PER_LEVEL } from "../constants";
import type { PlayerData, CustomRecipe, CustomIngredient, AchievementTier, MealPlanEntry, PantryItem } from "../types/player";
import { SKILLS, getRank, XP_RECIPE_COMPLETE_BASE, XP_PER_STEP, XP_SKILL_LEVELUP } from "../types/player";

function getSkillLevel(xp: number): number {
  return Math.min(SKILL_MAX_LEVEL, Math.floor(xp / SKILL_XP_PER_LEVEL) + 1);
}

export interface CookReward {
  baseXp: number;
  stepXp: number;
  skillLevelUps: { skillName: string; emoji: string; newLevel: number }[];
  skillBonusXp: number;
  totalXp: number;
  oldRank: number;
  newRank: number;
}

interface PlayerContextValue {
  player: PlayerData | null;
  setName: (name: string) => void;
  addCustomRecipe: (recipe: CustomRecipe) => void;
  updateCustomRecipe: (recipe: CustomRecipe) => void;
  removeCustomRecipe: (id: string) => void;
  addCustomIngredient: (ingredient: CustomIngredient) => void;
  completeRecipeCook: (recipe: CustomRecipe) => CookReward;
  setMealPlan: (date: string, entry: MealPlanEntry | null) => void;
  mealPlan: Record<string, MealPlanEntry>;
  pantry: Record<string, PantryItem>;
  setPantryItem: (item: PantryItem) => void;
  removePantryItem: (name: string) => void;
  bulkAddToPantry: (items: PantryItem[]) => void;
  stats: Record<string, number>;
  getAchievementTier: (statKey: string, thresholds: [number, number, number]) => AchievementTier;
  skillXp: Record<string, number>;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useLocalStorage<PlayerData | null>(STORAGE_KEY_PLAYER, null);
  const { likedRecipes } = useLikedRecipes();

  const setName = useCallback(
    (name: string) => {
      setPlayer((prev) =>
        prev
          ? { ...prev, name }
          : { name, xp: 0, customRecipes: [], customIngredients: [] }
      );
    },
    [setPlayer]
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

  // Compute stats from actual data
  const stats = useMemo(() => {
    const recipes = player?.customRecipes ?? [];
    const s: Record<string, number> = {
      recipes_liked: likedRecipes.length,
      recipes_created: recipes.length,
      skill_chopping: 0,
      skill_cooking: 0,
      skill_frying: 0,
      skill_baking: 0,
      skill_seasoning: 0,
      timing_steps: 0,
      five_star_ratings: 0,
      unique_equipment: 0,
    };

    const equipmentSet = new Set<string>();

    for (const recipe of recipes) {
      if (recipe.rating === 5) s.five_star_ratings++;
      for (const step of recipe.steps) {
        if (step.skillId) s[`skill_${step.skillId}`]++;
        if (step.waitMinutes && step.waitMinutes > 0) s.timing_steps++;
      }
      for (const eq of recipe.equipment) {
        equipmentSet.add(eq.toLowerCase());
      }
    }

    s.unique_equipment = equipmentSet.size;
    return s;
  }, [player?.customRecipes, likedRecipes.length]);

  // Compute skill XP (count of steps using each skill)
  const skillXp = useMemo(() => {
    const xp: Record<string, number> = {
      chopping: stats.skill_chopping,
      cooking: stats.skill_cooking,
      frying: stats.skill_frying,
      baking: stats.skill_baking,
      seasoning: stats.skill_seasoning,
      timing: stats.timing_steps,
    };
    return xp;
  }, [stats]);

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

  // Complete a cooking session — calculate and award XP
  const completeRecipeCook = useCallback(
    (recipe: CustomRecipe): CookReward => {
      const currentXp = player?.xp ?? 0;
      const oldRank = getRank(currentXp).rank;

      // Base + step XP
      const baseXp = XP_RECIPE_COMPLETE_BASE;
      const stepXp = recipe.steps.length * XP_PER_STEP;

      // Check for skill level-ups: simulate adding this recipe's skill steps
      // We need to count current skill usage vs what it will be after
      const skillCounts: Record<string, number> = {};
      const allRecipes = player?.customRecipes ?? [];
      for (const r of allRecipes) {
        for (const step of r.steps) {
          if (step.skillId) {
            skillCounts[step.skillId] = (skillCounts[step.skillId] ?? 0) + 1;
          }
        }
      }

      // Count skills used in this recipe's steps
      const recipeSkillCounts: Record<string, number> = {};
      for (const step of recipe.steps) {
        if (step.skillId) {
          recipeSkillCounts[step.skillId] = (recipeSkillCounts[step.skillId] ?? 0) + 1;
        }
      }

      // Detect level-ups
      const skillLevelUps: CookReward["skillLevelUps"] = [];
      for (const [skillId, addedCount] of Object.entries(recipeSkillCounts)) {
        const before = skillCounts[skillId] ?? 0;
        const after = before + addedCount;
        const levelBefore = getSkillLevel(before);
        const levelAfter = getSkillLevel(after);
        if (levelAfter > levelBefore) {
          const skillDef = SKILLS.find((s) => s.id === skillId);
          if (skillDef) {
            for (let lv = levelBefore + 1; lv <= levelAfter; lv++) {
              skillLevelUps.push({
                skillName: skillDef.name,
                emoji: skillDef.emoji,
                newLevel: lv,
              });
            }
          }
        }
      }

      const skillBonusXp = skillLevelUps.length * XP_SKILL_LEVELUP;
      const totalXp = baseXp + stepXp + skillBonusXp;

      const newTotalXp = currentXp + totalXp;
      const newRank = getRank(newTotalXp).rank;

      // Award XP
      setPlayer((prev) => {
        if (!prev) return prev;
        return { ...prev, xp: (prev.xp ?? 0) + totalXp };
      });

      return { baseXp, stepXp, skillLevelUps, skillBonusXp, totalXp, oldRank, newRank };
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
        for (const item of items) {
          p[item.name.toLowerCase()] = item;
        }
        return { ...prev, pantry: p };
      });
    },
    [setPlayer]
  );

  const setMealPlan = useCallback(
    (date: string, entry: MealPlanEntry | null) => {
      setPlayer((prev) => {
        if (!prev) return prev;
        const plan = { ...(prev.mealPlan ?? {}) };
        if (entry) {
          plan[date] = entry;
        } else {
          delete plan[date];
        }
        return { ...prev, mealPlan: plan };
      });
    },
    [setPlayer]
  );

  return (
    <PlayerContext.Provider
      value={{
        player,
        setName,
        addCustomRecipe,
        updateCustomRecipe,
        removeCustomRecipe,
        addCustomIngredient,
        completeRecipeCook,
        setMealPlan,
        mealPlan,
        pantry,
        setPantryItem,
        removePantryItem,
        bulkAddToPantry,
        stats,
        getAchievementTier,
        skillXp,
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
