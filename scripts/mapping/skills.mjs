// Skill detection from English step text — order matters (most specific first)
const SKILL_PATTERNS = [
  ["timing",    /\b(rest|chill|cool|refrigerate|let\s+(stand|sit)|leave\s+to|set\s+aside\s+for|wait)/i],
  ["chopping",  /\b(chop|dice|slice|mince|julienne|cube|shred|grate|cut\s+(into|in)|peel)/i],
  ["frying",    /\b(fry|sauté|saute|pan-?fry|stir-?fry|sear|brown|deep-?fry|shallow\s+fry)/i],
  ["baking",    /\b(bake|oven|roast|broil|preheat\s+(?:the\s+)?oven|baking\s+sheet|baking\s+tray)/i],
  ["seasoning", /\b(season|salt|pepper|spice|marinate|sprinkle|to\s+taste|herbs?\s+and|drizzle)/i],
  ["cooking",   /\b(boil|simmer|stew|poach|steam|cook|bring\s+to\s+(?:the\s+)?boil|reduce)/i],
];

export function detectSkill(text) {
  if (!text) return undefined;
  for (const [skill, pattern] of SKILL_PATTERNS) {
    if (pattern.test(text)) return skill;
  }
  return undefined;
}

/**
 * Detects the FIRST wait time in the step text.
 * Returns minutes (rounded to int).
 *
 * Examples:
 *   "simmer for 10 minutes" → 10
 *   "bake for 1 hour"       → 60
 *   "rest for 1 1/2 hours"  → 90
 *   "chill 30-45 mins"      → 30 (uses lower bound)
 */
export function detectWaitMinutes(text) {
  if (!text) return undefined;

  // Match: "10 min", "10 minutes", "1 hour", "1 hr", "2-3 mins", "1 1/2 hours"
  const re = /(\d+(?:\s*[-–]\s*\d+)?(?:\s+\d+\/\d+)?(?:\.\d+)?)\s*(min(?:ute)?s?|hours?|hrs?|h)\b/i;
  const m = text.match(re);
  if (!m) return undefined;

  let numStr = m[1].trim();
  // Range: take lower bound
  const range = numStr.match(/^(\d+)\s*[-–]/);
  if (range) numStr = range[1];

  // Mixed fraction
  const mixed = numStr.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  let val;
  if (mixed) {
    val = parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  } else {
    val = parseFloat(numStr);
  }
  if (isNaN(val)) return undefined;

  const unit = m[2].toLowerCase();
  const isHour = unit.startsWith("h");
  const minutes = isHour ? Math.round(val * 60) : Math.round(val);
  return minutes > 0 ? minutes : undefined;
}
