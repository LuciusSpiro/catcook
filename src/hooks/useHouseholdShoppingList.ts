import { useCallback, useEffect, useState } from "react";
import { useHousehold } from "../context/HouseholdContext";
import { useAuth } from "../context/AuthContext";
import { isOnline } from "../lib/supabase";
import {
  fetchShoppingList, upsertShoppingList, clearShoppingList, subscribeShoppingList,
} from "../lib/supabaseShoppingList";

interface ShoppingListState {
  targetDate: string | null;
  dismissedKeys: Set<string>;
  generated: boolean;
  loading: boolean;
  sharedAcrossHousehold: boolean;
  generate: (targetDate: string) => Promise<void>;
  clear: () => Promise<void>;
  addDismissed: (key: string) => Promise<void>;
  setDismissed: (keys: string[]) => Promise<void>;
}

export function useHouseholdShoppingList(): ShoppingListState {
  const { activeHousehold } = useHousehold();
  const { user } = useAuth();
  const useSupabase = !!activeHousehold && !!user && isOnline();

  const [targetDate, setTargetDate] = useState<string | null>(null);
  const [dismissed, setDismissedState] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!useSupabase || !activeHousehold) {
      setTargetDate(null);
      setDismissedState(new Set());
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchShoppingList(activeHousehold.id).then((list) => {
      if (cancelled) return;
      if (list) {
        setTargetDate(list.target_date);
        setDismissedState(new Set(list.dismissed_keys));
      } else {
        setTargetDate(null);
        setDismissedState(new Set());
      }
      setLoading(false);
    });
    const unsub = subscribeShoppingList(activeHousehold.id, (list) => {
      if (!list) {
        setTargetDate(null);
        setDismissedState(new Set());
      } else {
        setTargetDate(list.target_date);
        setDismissedState(new Set(list.dismissed_keys));
      }
    });
    return () => { cancelled = true; unsub(); };
  }, [useSupabase, activeHousehold?.id]);

  const generate = useCallback(async (date: string) => {
    setTargetDate(date);
    setDismissedState(new Set());
    if (useSupabase && activeHousehold && user) {
      await upsertShoppingList(activeHousehold.id, user.id, date, []);
    }
  }, [useSupabase, activeHousehold, user]);

  const clear = useCallback(async () => {
    setTargetDate(null);
    setDismissedState(new Set());
    if (useSupabase && activeHousehold) {
      await clearShoppingList(activeHousehold.id);
    }
  }, [useSupabase, activeHousehold]);

  const addDismissed = useCallback(async (key: string) => {
    const next = new Set(dismissed);
    next.add(key);
    setDismissedState(next);
    if (useSupabase && activeHousehold && user && targetDate) {
      await upsertShoppingList(activeHousehold.id, user.id, targetDate, Array.from(next));
    }
  }, [dismissed, useSupabase, activeHousehold, user, targetDate]);

  const setDismissed = useCallback(async (keys: string[]) => {
    const next = new Set(keys);
    setDismissedState(next);
    if (useSupabase && activeHousehold && user && targetDate) {
      await upsertShoppingList(activeHousehold.id, user.id, targetDate, keys);
    }
  }, [useSupabase, activeHousehold, user, targetDate]);

  return {
    targetDate,
    dismissedKeys: dismissed,
    generated: targetDate !== null,
    loading,
    sharedAcrossHousehold: useSupabase,
    generate, clear, addDismissed, setDismissed,
  };
}
