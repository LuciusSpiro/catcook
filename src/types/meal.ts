export interface Ingredient {
  name: string;
  measure: string;
}

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strMealThumb: string;
  strInstructions: string;
  strYoutube?: string;
  strTags?: string;
  ingredients: Ingredient[];
}

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface Category {
  strCategory: string;
}

export interface Area {
  strArea: string;
}

export interface IngredientListItem {
  strIngredient: string;
}
