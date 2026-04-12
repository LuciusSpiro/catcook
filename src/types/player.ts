export type SkillId = "chopping" | "cooking" | "frying" | "baking" | "seasoning" | "timing";

export interface SkillDef {
  id: SkillId;
  name: string;
  emoji: string;
  description: string;
}

export const SKILLS: SkillDef[] = [
  { id: "chopping", name: "Schnibbeln", emoji: "🔪", description: "Schneiden, Hacken, Würfeln" },
  { id: "cooking", name: "Kochen", emoji: "🍲", description: "Suppen, Eintöpfe, Pasta" },
  { id: "frying", name: "Braten", emoji: "🍳", description: "Pfannengerichte, Schnitzel" },
  { id: "baking", name: "Backen", emoji: "🧁", description: "Kuchen, Brot, Aufläufe" },
  { id: "seasoning", name: "Würzen", emoji: "🧂", description: "Gewürze, Marinaden, Saucen" },
  { id: "timing", name: "Timing", emoji: "⏱️", description: "Garzeiten, Ruhezeiten" },
];

export type AchievementTier = "locked" | "bronze" | "silver" | "gold";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  thresholds: [number, number, number]; // bronze, silver, gold
  statKey: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: "collector",
    name: "Sammelkatze",
    description: "Rezepte geliked",
    emoji: "😻",
    thresholds: [5, 15, 30],
    statKey: "recipes_liked",
  },
  {
    id: "chef",
    name: "Küchenchef",
    description: "Eigene Rezepte erstellt",
    emoji: "🐱‍🍳",
    thresholds: [1, 5, 15],
    statKey: "recipes_created",
  },
  {
    id: "chopper",
    name: "Schnibbeltatze",
    description: "Schritte mit Schnibbeln",
    emoji: "🔪",
    thresholds: [3, 10, 25],
    statKey: "skill_chopping",
  },
  {
    id: "cook",
    name: "Suppenkasper",
    description: "Schritte mit Kochen",
    emoji: "🍲",
    thresholds: [3, 10, 25],
    statKey: "skill_cooking",
  },
  {
    id: "fryer",
    name: "Bratpfote",
    description: "Schritte mit Braten",
    emoji: "🍳",
    thresholds: [3, 10, 25],
    statKey: "skill_frying",
  },
  {
    id: "baker",
    name: "Backmieze",
    description: "Schritte mit Backen",
    emoji: "🧁",
    thresholds: [3, 10, 25],
    statKey: "skill_baking",
  },
  {
    id: "seasoner",
    name: "Gewürzschnurrli",
    description: "Schritte mit Würzen",
    emoji: "🧂",
    thresholds: [3, 10, 25],
    statKey: "skill_seasoning",
  },
  {
    id: "timer",
    name: "Zeitkatze",
    description: "Schritte mit Wartezeit",
    emoji: "⏱️",
    thresholds: [5, 15, 30],
    statKey: "timing_steps",
  },
  {
    id: "gourmet",
    name: "Feinschmecker",
    description: "5-Katzen-Bewertungen vergeben",
    emoji: "⭐",
    thresholds: [3, 10, 20],
    statKey: "five_star_ratings",
  },
  {
    id: "toolmaster",
    name: "Gerätemeister",
    description: "Verschiedene Geräte verwendet",
    emoji: "🔧",
    thresholds: [3, 8, 15],
    statKey: "unique_equipment",
  },
];

export const CAT_RATINGS = ["🙀", "😿", "😺", "😸", "😻"] as const;

// ── Miausbildungssystem: 20 Ränge ──
export interface RankDef {
  rank: number;
  name: string;
  emoji: string;
  xpRequired: number;
}

export const RANKS: RankDef[] = [
  { rank: 1,  name: "Plongeur-Perserkätzchen", emoji: "🧽", xpRequired: 0 },
  { rank: 2,  name: "Küchenkätzchen",        emoji: "🐱", xpRequired: 30 },
  { rank: 3,  name: "Schnurr-Schüler",       emoji: "📚", xpRequired: 80 },
  { rank: 4,  name: "Miau-Azubi",            emoji: "🎓", xpRequired: 150 },
  { rank: 5,  name: "Pfoten-Praktikant",     emoji: "🐾", xpRequired: 250 },
  { rank: 6,  name: "Schnibbel-Schnurrer",   emoji: "🔪", xpRequired: 380 },
  { rank: 7,  name: "Topf-Tiger",            emoji: "🐯", xpRequired: 540 },
  { rank: 8,  name: "Bratz-Bengale",         emoji: "🍳", xpRequired: 730 },
  { rank: 9,  name: "Würz-Wildkatze",        emoji: "🧂", xpRequired: 960 },
  { rank: 10, name: "Pfannen-Panther",       emoji: "🐆", xpRequired: 1250 },
  { rank: 11, name: "Ofen-Ozelot",           emoji: "🔥", xpRequired: 1600 },
  { rank: 12, name: "Gesellen-Kater",        emoji: "😼", xpRequired: 2000 },
  { rank: 13, name: "Commis de Catsine",     emoji: "🐈", xpRequired: 2250 },
  { rank: 14, name: "Sauce-Siamkatz",        emoji: "🫗", xpRequired: 2600 },
  { rank: 15, name: "Grill-Gepard",          emoji: "🥩", xpRequired: 3100 },
  { rank: 16, name: "Purrfessional Koch",    emoji: "👨‍🍳", xpRequired: 3800 },
  { rank: 17, name: "Schnurr-Sommelier",     emoji: "🍷", xpRequired: 4600 },
  { rank: 18, name: "Tatzen-Teppanyaki",     emoji: "🥢", xpRequired: 5500 },
  { rank: 19, name: "Purr-Patissier",        emoji: "🎂", xpRequired: 6600 },
  { rank: 20, name: "Katz-Gardemanger",      emoji: "⭐", xpRequired: 7900 },
  { rank: 21, name: "Felliger Feinschmecker", emoji: "🏅", xpRequired: 9500 },
  { rank: 22, name: "Miau-sterchef Supreme", emoji: "👑", xpRequired: 11500 },
];

export function getRank(xp: number): RankDef {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xpRequired) return RANKS[i];
  }
  return RANKS[0];
}

export function getNextRank(xp: number): RankDef | null {
  const current = getRank(xp);
  const next = RANKS.find((r) => r.rank === current.rank + 1);
  return next ?? null;
}

// XP rewards
export const XP_RECIPE_COMPLETE_BASE = 20;
export const XP_PER_STEP = 5;
export const XP_SKILL_LEVELUP = 15;

export interface CustomRecipeStep {
  description: string;
  skillId?: SkillId;
  waitMinutes?: number;
}

export type IngredientUnit = "g" | "kg" | "ml" | "l" | "stk";

export const INGREDIENT_UNITS: { value: IngredientUnit; label: string }[] = [
  { value: "g", label: "g" },
  { value: "kg", label: "kg" },
  { value: "ml", label: "ml" },
  { value: "l", label: "l" },
  { value: "stk", label: "Stk." },
];

export interface RecipeIngredient {
  name: string;
  icon: string;
  amount: number | null;
  unit: IngredientUnit;
}

export interface CustomRecipe {
  id: string;
  name: string;
  category: string;
  rating: number; // 1-5
  cookingTimeMinutes?: number;
  servings?: number;
  image?: string; // base64 data URL or external URL
  ingredients: RecipeIngredient[];
  steps: CustomRecipeStep[];
  equipment: string[];
  createdAt: string;
  // Optional fields populated only for imported recipes (TheMealDB)
  area?: string;
  tags?: string[];
  youtube?: string;
}

export const RECIPE_CATEGORIES = [
  "Vorspeise",
  "Hauptgericht",
  "Beilage",
  "Dessert",
  "Suppe",
  "Salat",
  "Snack",
  "Getränk",
  "Frühstück",
  "Gebäck",
] as const;

export interface CustomIngredient {
  name: string;
  icon: string;
}

// Meal planner: maps "YYYY-MM-DD" → recipe id
export interface MealPlanEntry {
  recipeId: string;
  recipeName: string;
  recipeImage?: string;
}

// Pantry: what you have at home
export interface PantryItem {
  name: string;
  icon: string;
  inStock: boolean;
  amount?: number;
  unit?: IngredientUnit;
}

export interface PlayerData {
  name: string;
  xp: number;
  customRecipes: CustomRecipe[];
  customIngredients: CustomIngredient[];
  mealPlan?: Record<string, MealPlanEntry>;
  pantry?: Record<string, PantryItem>;
}
