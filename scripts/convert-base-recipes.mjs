// Converts baseRezepte.json (TheMealDB raw) → baseRezepteMapped.json (CustomRecipe[])
//
// Usage: node scripts/convert-base-recipes.mjs

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { mapCategory } from "./mapping/categories.mjs";
import { parseInstructions } from "./mapping/instructions.mjs";
import { detectSkill, detectWaitMinutes } from "./mapping/skills.mjs";
import { extractEquipment } from "./mapping/equipment.mjs";
import { detectServings } from "./mapping/servings.mjs";
import { parseMeasure } from "./mapping/measure-parser.mjs";
import { matchIngredient, stats as ingStats, resetStats } from "./mapping/ingredients.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INPUT = path.join(ROOT, "baseRezepte.json");
const OUTPUT = path.join(ROOT, "baseRezepteMapped.json");
const SRC_DATA = path.join(ROOT, "src", "data", "baseRezepteMapped.json");

// ── Helpers ────────────────────────────────────────────────

function extractIngredients(meal) {
  const rawIngredients = [];
  const hints = []; // [{ ingredientName, hint }] for later step-injection

  for (let i = 1; i <= 20; i++) {
    const rawName = (meal[`strIngredient${i}`] || "").trim();
    const rawMeasure = (meal[`strMeasure${i}`] || "").trim();
    if (!rawName) continue;

    const matched = matchIngredient(rawName);
    if (!matched) continue;

    const parsed = parseMeasure(rawMeasure);

    rawIngredients.push({
      name: matched.name,
      icon: matched.icon,
      amount: parsed.amount,
      unit: parsed.unit,
    });

    if (parsed.hint) {
      hints.push({ ingredientName: matched.name, hint: parsed.hint });
    }
  }

  // ── Merge duplicates ──
  // Same name + same unit → sum amounts.
  // Same name but different units (or null) → prefer the one with the highest
  // informational content (has unit AND amount > has unit > has amount > nothing).
  const byName = new Map();
  for (const ing of rawIngredients) {
    const key = ing.name;
    const existing = byName.get(key);
    if (!existing) {
      byName.set(key, ing);
      continue;
    }

    // Same name and same unit → sum
    if (existing.unit === ing.unit) {
      if (existing.amount == null && ing.amount == null) {
        // both null → keep as-is
      } else {
        existing.amount = (existing.amount ?? 0) + (ing.amount ?? 0);
        // Round nicely
        if (existing.amount >= 10) existing.amount = Math.round(existing.amount);
        else existing.amount = Math.round(existing.amount * 10) / 10;
      }
      continue;
    }

    // Same name but different units → pick the more informative one
    const scoreExisting = (existing.unit !== "stk" ? 2 : 0) + (existing.amount != null ? 1 : 0);
    const scoreNew = (ing.unit !== "stk" ? 2 : 0) + (ing.amount != null ? 1 : 0);
    if (scoreNew > scoreExisting) {
      byName.set(key, ing);
    }
    // else: drop the new one (existing wins)
  }

  return { ingredients: Array.from(byName.values()), hints };
}

function injectHintsIntoSteps(steps, hints) {
  if (!hints.length) return steps;

  // For each hint, find the FIRST step that mentions the ingredient (case-insensitive)
  // and append a small parenthetical note. If no step mentions it, prepend a prep step.
  const stepsWithHints = steps.map((s) => ({ ...s, _appendedHints: [] }));
  const orphanHints = [];

  for (const { ingredientName, hint } of hints) {
    const lowerIng = ingredientName.toLowerCase();
    let placed = false;

    for (const step of stepsWithHints) {
      // Match ingredient name OR its English root (just check first word)
      const lowerDesc = step.description.toLowerCase();
      const firstWord = lowerIng.split(/[\s(]/)[0];
      if (lowerDesc.includes(lowerIng) || (firstWord.length > 3 && lowerDesc.includes(firstWord))) {
        step._appendedHints.push(`${ingredientName}: ${hint}`);
        placed = true;
        break;
      }
    }

    if (!placed) orphanHints.push(`${ingredientName} (${hint})`);
  }

  // Build final steps
  const finalSteps = stepsWithHints.map((s) => {
    let desc = s.description;
    if (s._appendedHints.length) {
      desc = `${desc} [${s._appendedHints.join("; ")}]`;
    }
    return {
      description: desc,
      ...(s.skillId ? { skillId: s.skillId } : {}),
      ...(s.waitMinutes ? { waitMinutes: s.waitMinutes } : {}),
    };
  });

  // Prepend a prep-step for any orphan hints
  if (orphanHints.length) {
    finalSteps.unshift({
      description: `Vorbereitung: ${orphanHints.join(", ")}.`,
      skillId: "chopping",
    });
  }

  return finalSteps;
}

function estimateCookingTime(instructions) {
  if (!instructions) return undefined;
  const re = /(\d+)\s*(min(?:ute)?s?|hours?|hrs?|h)\b/gi;

  // Collect all time mentions, but EXCLUDE long passive-rest periods
  // (chill 2hrs, marinate overnight) — those skew the total massively.
  // Heuristic: include only durations <= 90 minutes.
  let total = 0;
  let m;
  while ((m = re.exec(instructions)) !== null) {
    const val = parseInt(m[1], 10);
    if (isNaN(val)) continue;
    const isHour = /^h/i.test(m[2]);
    const minutes = isHour ? val * 60 : val;
    if (minutes > 90) continue; // skip long passive periods
    total += minutes;
  }
  if (total === 0) return undefined;
  // Cap at 3h
  total = Math.min(total, 180);
  return Math.ceil(total / 5) * 5;
}

// ── Main conversion ─────────────────────────────────────────

function convertMeal(meal) {
  const category = mapCategory(meal);

  // 1) Ingredients
  const { ingredients, hints } = extractIngredients(meal);

  // 2) Instructions → step strings
  const stepStrings = parseInstructions(meal.strInstructions || "");

  // 3) Build raw step objects with skill/time detection
  let steps = stepStrings.map((desc) => ({
    description: desc,
    skillId: detectSkill(desc),
    waitMinutes: detectWaitMinutes(desc),
  }));

  // Fallback if parser failed completely
  if (steps.length === 0) {
    steps = [
      {
        description: (meal.strInstructions || "Keine Anleitung verfügbar.")
          .replace(/\r\n/g, " ")
          .replace(/\s+/g, " ")
          .trim(),
      },
    ];
  }

  // 4) Inject measure hints into matching steps
  steps = injectHintsIntoSteps(steps, hints);

  // 5) Equipment + servings + cooking time
  const equipment = extractEquipment(meal.strInstructions || "");
  const servings = detectServings(meal, category);
  const cookingTimeMinutes = estimateCookingTime(meal.strInstructions);

  // 6) createdAt
  let createdAt;
  try {
    createdAt = meal.dateModified
      ? new Date(meal.dateModified.replace(" ", "T") + "Z").toISOString()
      : new Date().toISOString();
  } catch {
    createdAt = new Date().toISOString();
  }

  // Tags from strTags (comma-separated)
  const tags = meal.strTags
    ? meal.strTags.split(",").map((t) => t.trim()).filter(Boolean)
    : undefined;

  return {
    id: `meal-${meal.idMeal}`,
    name: meal.strMeal,
    category,
    rating: 3,
    ...(servings != null ? { servings } : {}),
    ...(cookingTimeMinutes != null ? { cookingTimeMinutes } : {}),
    ...(meal.strMealThumb ? { image: meal.strMealThumb } : {}),
    ingredients,
    steps,
    equipment,
    createdAt,
    ...(meal.strArea ? { area: meal.strArea } : {}),
    ...(tags && tags.length ? { tags } : {}),
    ...(meal.strYoutube ? { youtube: meal.strYoutube } : {}),
  };
}

// ── Validation ──────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "Vorspeise", "Hauptgericht", "Beilage", "Dessert", "Suppe",
  "Salat", "Snack", "Getränk", "Frühstück", "Gebäck",
]);
const VALID_UNITS = new Set(["g", "kg", "ml", "l", "stk"]);
const VALID_SKILLS = new Set(["chopping", "cooking", "frying", "baking", "seasoning", "timing"]);

function validate(recipe) {
  const errors = [];
  if (!recipe.id || !recipe.id.startsWith("meal-")) errors.push("invalid id");
  if (!recipe.name) errors.push("missing name");
  if (!VALID_CATEGORIES.has(recipe.category)) errors.push(`invalid category: ${recipe.category}`);
  if (typeof recipe.rating !== "number") errors.push("invalid rating");
  if (!Array.isArray(recipe.ingredients)) errors.push("ingredients not array");
  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) errors.push("steps empty");
  if (!Array.isArray(recipe.equipment)) errors.push("equipment not array");

  for (const ing of recipe.ingredients) {
    if (!ing.name) errors.push("ingredient missing name");
    if (!VALID_UNITS.has(ing.unit)) errors.push(`invalid unit: ${ing.unit}`);
    if (ing.amount !== null && (typeof ing.amount !== "number" || isNaN(ing.amount) || !isFinite(ing.amount))) {
      errors.push(`invalid amount: ${ing.amount}`);
    }
  }
  for (const step of recipe.steps) {
    if (!step.description) errors.push("step missing description");
    if (step.skillId && !VALID_SKILLS.has(step.skillId)) errors.push(`invalid skillId: ${step.skillId}`);
    if (step.waitMinutes != null && (typeof step.waitMinutes !== "number" || isNaN(step.waitMinutes))) {
      errors.push(`invalid waitMinutes: ${step.waitMinutes}`);
    }
  }
  if (recipe.servings != null && (typeof recipe.servings !== "number" || recipe.servings < 1)) {
    errors.push(`invalid servings: ${recipe.servings}`);
  }
  if (recipe.cookingTimeMinutes != null && (typeof recipe.cookingTimeMinutes !== "number" || isNaN(recipe.cookingTimeMinutes))) {
    errors.push(`invalid cookingTimeMinutes: ${recipe.cookingTimeMinutes}`);
  }

  return errors;
}

// ── Run ─────────────────────────────────────────────────────

function main() {
  console.log(`Reading ${INPUT}...`);
  const meals = JSON.parse(fs.readFileSync(INPUT, "utf-8"));
  console.log(`Loaded ${meals.length} meals.`);

  resetStats();

  const recipes = [];
  const validationErrors = [];

  for (const meal of meals) {
    try {
      const recipe = convertMeal(meal);
      const errs = validate(recipe);
      if (errs.length) {
        validationErrors.push({ id: meal.idMeal, name: meal.strMeal, errors: errs });
      }
      recipes.push(recipe);
    } catch (e) {
      console.error(`Failed on meal ${meal.idMeal} (${meal.strMeal}):`, e.message);
    }
  }

  console.log(`\n✓ Converted ${recipes.length}/${meals.length} recipes`);

  // Stats
  console.log(`\n── Ingredient matching ──`);
  console.log(`  Exact matches:   ${ingStats.exact}`);
  console.log(`  Fuzzy matches:   ${ingStats.fuzzy}`);
  console.log(`  Auto-created:    ${ingStats.auto}`);
  const totalMatches = ingStats.exact + ingStats.fuzzy + ingStats.auto;
  if (totalMatches > 0) {
    const exactPct = ((ingStats.exact / totalMatches) * 100).toFixed(1);
    const fuzzyPct = ((ingStats.fuzzy / totalMatches) * 100).toFixed(1);
    const autoPct = ((ingStats.auto / totalMatches) * 100).toFixed(1);
    console.log(`  Coverage:        ${exactPct}% exact, ${fuzzyPct}% fuzzy, ${autoPct}% auto`);
  }

  // Top unmatched
  const unmatchedSorted = Object.entries(ingStats.unmatched).sort((a, b) => b[1] - a[1]);
  console.log(`\n── Top 30 unmatched ingredients (auto-created) ──`);
  unmatchedSorted.slice(0, 30).forEach(([name, count]) => {
    console.log(`  ${count.toString().padStart(4)}× ${name}`);
  });

  // Recipe stats
  const withServings = recipes.filter((r) => r.servings != null).length;
  const withCookingTime = recipes.filter((r) => r.cookingTimeMinutes != null).length;
  const withImage = recipes.filter((r) => r.image).length;
  const avgSteps = (recipes.reduce((s, r) => s + r.steps.length, 0) / recipes.length).toFixed(1);
  const avgIngs = (recipes.reduce((s, r) => s + r.ingredients.length, 0) / recipes.length).toFixed(1);

  console.log(`\n── Recipe stats ──`);
  console.log(`  Recipes with servings:      ${withServings}/${recipes.length} (${((withServings/recipes.length)*100).toFixed(0)}%)`);
  console.log(`  Recipes with cooking time:  ${withCookingTime}/${recipes.length}`);
  console.log(`  Recipes with image:         ${withImage}/${recipes.length}`);
  console.log(`  Avg steps per recipe:       ${avgSteps}`);
  console.log(`  Avg ingredients per recipe: ${avgIngs}`);

  // Category distribution
  const catCounts = {};
  recipes.forEach((r) => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });
  console.log(`\n── Category distribution ──`);
  Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([c, n]) => {
    console.log(`  ${n.toString().padStart(4)}  ${c}`);
  });

  // Validation errors
  if (validationErrors.length) {
    console.log(`\n⚠ ${validationErrors.length} recipes have validation errors:`);
    validationErrors.slice(0, 10).forEach((v) => {
      console.log(`  meal-${v.id} (${v.name}): ${v.errors.join(", ")}`);
    });
  } else {
    console.log(`\n✓ All recipes pass validation.`);
  }

  // Write output to root (canonical) and src/data (import target)
  const json = JSON.stringify(recipes, null, 2);
  fs.writeFileSync(OUTPUT, json, "utf-8");
  fs.mkdirSync(path.dirname(SRC_DATA), { recursive: true });
  fs.writeFileSync(SRC_DATA, json, "utf-8");
  const sizeKb = (fs.statSync(OUTPUT).size / 1024).toFixed(0);
  console.log(`\n✓ Wrote ${OUTPUT} (${sizeKb} KB)`);
  console.log(`✓ Wrote ${SRC_DATA}`);
}

main();
