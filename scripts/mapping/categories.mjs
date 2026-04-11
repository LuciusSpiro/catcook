// Maps TheMealDB strCategory → CatCook RECIPE_CATEGORIES
export const CATEGORY_MAP = {
  Beef: "Hauptgericht",
  Chicken: "Hauptgericht",
  Pork: "Hauptgericht",
  Lamb: "Hauptgericht",
  Goat: "Hauptgericht",
  Seafood: "Hauptgericht",
  Pasta: "Hauptgericht",
  Vegetarian: "Hauptgericht",
  Vegan: "Hauptgericht",
  Miscellaneous: "Hauptgericht",
  Side: "Beilage",
  Starter: "Vorspeise",
  Breakfast: "Frühstück",
  Dessert: "Dessert",
};

// Heuristic re-classification based on recipe name
const RE_SOUP    = /\b(soup|stew|broth|chowder|bisque)\b/i;
const RE_SALAD   = /\bsalad\b/i;
const RE_BAKERY  = /\b(cake|cookie|biscuit|muffin|tart|pie|brownie|scone|bread|pudding|crumble|crisp|cheesecake)\b/i;
const RE_DRINK   = /\b(smoothie|juice|cocktail|tea|latte|coffee|drink|punch|martini|mojito|lemonade)\b/i;
const RE_SNACK   = /\b(dip|sandwich|wrap|nachos|chips|popcorn|fries)\b/i;

export function mapCategory(meal) {
  const baseCat = CATEGORY_MAP[meal.strCategory] || "Hauptgericht";
  const name = meal.strMeal || "";

  if (RE_SOUP.test(name)) return "Suppe";
  if (RE_SALAD.test(name)) return "Salat";
  if (RE_DRINK.test(name)) return "Getränk";

  // Bakery overrides Dessert/Breakfast for cake-y items
  if ((baseCat === "Dessert" || baseCat === "Frühstück") && RE_BAKERY.test(name)) {
    return "Gebäck";
  }

  // Snack heuristics override Misc/Vegetarian
  if (RE_SNACK.test(name) && (baseCat === "Hauptgericht" || meal.strCategory === "Miscellaneous")) {
    return "Snack";
  }

  return baseCat;
}
