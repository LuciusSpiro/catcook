import { useState, useEffect, useCallback, useRef } from "react";
import { getRandomMeal, getMealsByCategory, getMealsByArea, getMealById } from "../data/localRecipes";
import type { Meal } from "../types/meal";

const BATCH_SIZE = 5;
const REFILL_THRESHOLD = 2;

interface UseRecipeStackOptions {
  category: string | null;
  area: string | null;
  excludedIngredients: string[];
}

export function useRecipeStack({ category, area, excludedIngredients }: UseRecipeStackOptions) {
  const [stack, setStack] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const seenIds = useRef(new Set<string>());
  const filterPool = useRef<string[]>([]);
  const isFetching = useRef(false);

  const isFiltered = category !== null || area !== null;

  const fetchRandomBatch = useCallback(async () => {
    const promises = Array.from({ length: BATCH_SIZE }, () => getRandomMeal());
    const meals = await Promise.all(promises);
    return meals.filter((m) => !seenIds.current.has(m.idMeal));
  }, []);

  const fetchFilteredBatch = useCallback(async () => {
    // Fill pool if empty
    if (filterPool.current.length === 0) {
      let summaries: { idMeal: string }[] = [];
      if (category) {
        summaries = await getMealsByCategory(category);
      } else if (area) {
        summaries = await getMealsByArea(area);
      }
      // Shuffle
      const ids = summaries
        .map((s) => s.idMeal)
        .filter((id) => !seenIds.current.has(id));
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      filterPool.current = ids;
    }

    const batch = filterPool.current.splice(0, BATCH_SIZE);
    if (batch.length === 0) return [];

    const meals = await Promise.all(batch.map((id) => getMealById(id)));
    return meals.filter((m) => !seenIds.current.has(m.idMeal));
  }, [category, area]);

  const excludedLower = excludedIngredients.map((i) => i.toLowerCase());

  const hasExcludedIngredient = useCallback(
    (meal: Meal) =>
      excludedLower.length > 0 &&
      meal.ingredients.some((ing) =>
        excludedLower.includes(ing.name.toLowerCase())
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [excludedLower.join(",")]
  );

  const fetchMore = useCallback(async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    setIsLoading((prev) => prev || true);

    try {
      const raw = isFiltered
        ? await fetchFilteredBatch()
        : await fetchRandomBatch();

      const newMeals = raw.filter((m) => !hasExcludedIngredient(m));
      newMeals.forEach((m) => seenIds.current.add(m.idMeal));
      setStack((prev) => [...prev, ...newMeals]);
    } finally {
      isFetching.current = false;
      setIsLoading(false);
    }
  }, [isFiltered, fetchFilteredBatch, fetchRandomBatch, hasExcludedIngredient]);

  // Reset when category/area filters change
  useEffect(() => {
    seenIds.current.clear();
    filterPool.current = [];
    setStack([]);
    setIsLoading(true);
    isFetching.current = false;
    fetchMore();
  }, [category, area]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-filter existing stack when excluded ingredients change
  useEffect(() => {
    if (excludedLower.length === 0) return;
    setStack((prev) => {
      const filtered = prev.filter((m) => !hasExcludedIngredient(m));
      return filtered;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excludedLower.join(",")]);

  // Auto-refill when stack is low
  useEffect(() => {
    if (stack.length <= REFILL_THRESHOLD && !isFetching.current) {
      fetchMore();
    }
  }, [stack.length, fetchMore]);

  const removeTop = useCallback(() => {
    setStack((prev) => prev.slice(1));
  }, []);

  return {
    currentMeal: stack[0] ?? null,
    nextMeal: stack[1] ?? null,
    thirdMeal: stack[2] ?? null,
    isLoading: isLoading && stack.length === 0,
    removeTop,
    isEmpty: !isLoading && stack.length === 0,
  };
}
