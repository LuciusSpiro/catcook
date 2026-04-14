import { createContext, useContext, useCallback, useEffect, useRef, type ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { STORAGE_KEY_LIKED } from "../constants";
import { useAuth } from "./AuthContext";
import { addLikeRemote, removeLikeRemote } from "../lib/supabaseLikes";
import { isOnline } from "../lib/supabase";
import type { Meal } from "../types/meal";

interface LikedRecipesContextValue {
  likedRecipes: Meal[];
  addLike: (meal: Meal) => void;
  removeLike: (id: string) => void;
  isLiked: (id: string) => boolean;
}

const LikedRecipesContext = createContext<LikedRecipesContextValue | null>(null);

export function LikedRecipesProvider({ children }: { children: ReactNode }) {
  const [likedRecipes, setLikedRecipes] = useLocalStorage<Meal[]>(STORAGE_KEY_LIKED, []);
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  // Keep ref in sync for use in callbacks without re-creating them
  useEffect(() => { userRef.current = user; }, [user]);

  const addLike = useCallback(
    (meal: Meal) => {
      setLikedRecipes((prev) => {
        if (prev.some((m) => m.idMeal === meal.idMeal)) return prev;
        return [meal, ...prev];
      });
      if (userRef.current && isOnline()) {
        addLikeRemote(userRef.current.id, meal.idMeal);
      }
    },
    [setLikedRecipes]
  );

  const removeLike = useCallback(
    (id: string) => {
      setLikedRecipes((prev) => prev.filter((m) => m.idMeal !== id));
      if (userRef.current && isOnline()) {
        removeLikeRemote(userRef.current.id, id);
      }
    },
    [setLikedRecipes]
  );

  const isLiked = useCallback(
    (id: string) => likedRecipes.some((m) => m.idMeal === id),
    [likedRecipes]
  );

  return (
    <LikedRecipesContext.Provider value={{ likedRecipes, addLike, removeLike, isLiked }}>
      {children}
    </LikedRecipesContext.Provider>
  );
}

export function useLikedRecipes() {
  const ctx = useContext(LikedRecipesContext);
  if (!ctx) throw new Error("useLikedRecipes must be used within LikedRecipesProvider");
  return ctx;
}
