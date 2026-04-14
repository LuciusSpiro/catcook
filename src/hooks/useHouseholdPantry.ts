import { useState, useEffect, useCallback } from "react";
import { useHousehold } from "../context/HouseholdContext";
import { useAuth } from "../context/AuthContext";
import { usePlayer } from "../context/PlayerContext";
import { isOnline } from "../lib/supabase";
import {
  fetchPantry, addPantryItem as addRemote, removePantryItem as removeRemote,
  bulkAddPantryItems, type SupaPantryItem,
} from "../lib/supabasePantry";
import type { PantryItem } from "../types/player";

interface PantryHook {
  pantry: Record<string, PantryItem & { supaId?: string }>;
  setPantryItem: (item: PantryItem) => void;
  removePantryItem: (name: string) => void;
  bulkAddToPantry: (items: PantryItem[]) => void;
  loading: boolean;
}

export function useHouseholdPantry(): PantryHook {
  const { activeHousehold } = useHousehold();
  const { user } = useAuth();
  const playerCtx = usePlayer();

  const useSupabase = !!activeHousehold && !!user && isOnline();

  const [supaItems, setSupaItems] = useState<SupaPantryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!useSupabase || !activeHousehold) return;
    setLoading(true);
    fetchPantry(activeHousehold.id).then((items) => {
      setSupaItems(items);
      setLoading(false);
    });
  }, [useSupabase, activeHousehold?.id]);

  // Convert to Record format
  const supaPantry: Record<string, PantryItem & { supaId?: string }> = {};
  if (useSupabase) {
    for (const item of supaItems) {
      supaPantry[item.ingredient_name.toLowerCase()] = {
        name: item.ingredient_name,
        icon: "🥫",
        inStock: true,
        amount: item.quantity ?? undefined,
        unit: item.unit as PantryItem["unit"],
        supaId: item.id,
      };
    }
  }

  const setPantryItem = useCallback(
    (item: PantryItem) => {
      if (!useSupabase || !activeHousehold || !user) {
        playerCtx.setPantryItem(item);
        return;
      }
      addRemote(activeHousehold.id, user.id, item.name, item.amount, item.unit);
      setSupaItems((prev) => [
        ...prev.filter((i) => i.ingredient_name.toLowerCase() !== item.name.toLowerCase()),
        {
          id: crypto.randomUUID(),
          ingredient_name: item.name,
          quantity: item.amount ?? null,
          unit: item.unit ?? null,
          added_by: user.id,
        },
      ]);
    },
    [useSupabase, activeHousehold, user, playerCtx]
  );

  const removePantryItemFn = useCallback(
    (name: string) => {
      if (!useSupabase) {
        playerCtx.removePantryItem(name);
        return;
      }
      const existing = supaItems.find(
        (i) => i.ingredient_name.toLowerCase() === name.toLowerCase()
      );
      if (existing) {
        removeRemote(existing.id);
        setSupaItems((prev) => prev.filter((i) => i.id !== existing.id));
      }
    },
    [useSupabase, playerCtx, supaItems]
  );

  const bulkAddToPantry = useCallback(
    (items: PantryItem[]) => {
      if (!useSupabase || !activeHousehold || !user) {
        playerCtx.bulkAddToPantry(items);
        return;
      }
      bulkAddPantryItems(
        activeHousehold.id,
        user.id,
        items.map((i) => ({ name: i.name, quantity: i.amount, unit: i.unit }))
      );
      setSupaItems((prev) => {
        const newNames = new Set(items.map((i) => i.name.toLowerCase()));
        const filtered = prev.filter((i) => !newNames.has(i.ingredient_name.toLowerCase()));
        const newItems: SupaPantryItem[] = items.map((i) => ({
          id: crypto.randomUUID(),
          ingredient_name: i.name,
          quantity: i.amount ?? null,
          unit: i.unit ?? null,
          added_by: user.id,
        }));
        return [...filtered, ...newItems];
      });
    },
    [useSupabase, activeHousehold, user, playerCtx]
  );

  if (!useSupabase) {
    return {
      pantry: playerCtx.pantry,
      setPantryItem: playerCtx.setPantryItem,
      removePantryItem: playerCtx.removePantryItem,
      bulkAddToPantry: playerCtx.bulkAddToPantry,
      loading: false,
    };
  }

  return { pantry: supaPantry, setPantryItem, removePantryItem: removePantryItemFn, bulkAddToPantry, loading };
}
