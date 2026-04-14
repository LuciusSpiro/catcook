import { useState, useEffect, useCallback } from "react";
import { useHousehold } from "../context/HouseholdContext";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { isOnline } from "../lib/supabase";
import {
  fetchMealPlan, addMealPlanEntry, removeMealPlanEntry,
  type SupaMealPlanEntry,
} from "../lib/supabaseMealPlan";
import type { MealPlanEntry } from "../types/player";

interface MealPlanHook {
  /** Date-string → entry mapping (compatible with existing PlanPage) */
  mealPlan: Record<string, MealPlanEntry & { supaId?: string }>;
  setMealPlan: (date: string, entry: MealPlanEntry | null) => void;
  loading: boolean;
}

/**
 * If an active household is online, uses Supabase meal_plan table.
 * Otherwise falls back to localStorage via PlayerContext.
 */
export function useHouseholdMealPlan(fromDate: string, toDate: string): MealPlanHook {
  const { activeHousehold } = useHousehold();
  const { user } = useAuth();
  const playerCtx = usePlayer();

  const useSupabase = !!activeHousehold && !!user && isOnline();

  const [supaEntries, setSupaEntries] = useState<SupaMealPlanEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch from Supabase when household or date range changes
  useEffect(() => {
    if (!useSupabase || !activeHousehold) return;
    setLoading(true);
    fetchMealPlan(activeHousehold.id, fromDate, toDate).then((entries) => {
      setSupaEntries(entries);
      setLoading(false);
    });
  }, [useSupabase, activeHousehold?.id, fromDate, toDate]);

  // Convert Supabase entries to the Record format PlanPage expects
  const supaMealPlan: Record<string, MealPlanEntry & { supaId?: string }> = {};
  if (useSupabase) {
    for (const e of supaEntries) {
      supaMealPlan[e.planned_date] = {
        recipeId: e.recipe_id,
        recipeName: "", // will be resolved by PlanPage via allRecipes
        supaId: e.id,
      };
    }
  }

  const setMealPlan = useCallback(
    (date: string, entry: MealPlanEntry | null) => {
      if (!useSupabase || !activeHousehold || !user) {
        // Fallback to localStorage
        playerCtx.setMealPlan(date, entry);
        return;
      }

      if (entry) {
        // Add entry
        addMealPlanEntry(activeHousehold.id, user.id, entry.recipeId, date);
        setSupaEntries((prev) => [
          ...prev.filter((e) => e.planned_date !== date),
          {
            id: crypto.randomUUID(),
            recipe_id: entry.recipeId,
            planned_date: date,
            meal_type: "dinner",
            added_by: user.id,
          },
        ]);
      } else {
        // Remove entry
        const existing = supaEntries.find((e) => e.planned_date === date);
        if (existing) {
          removeMealPlanEntry(existing.id);
          setSupaEntries((prev) => prev.filter((e) => e.id !== existing.id));
        }
      }
    },
    [useSupabase, activeHousehold, user, playerCtx, supaEntries]
  );

  if (!useSupabase) {
    return {
      mealPlan: playerCtx.mealPlan,
      setMealPlan: playerCtx.setMealPlan,
      loading: false,
    };
  }

  return { mealPlan: supaMealPlan, setMealPlan, loading };
}
