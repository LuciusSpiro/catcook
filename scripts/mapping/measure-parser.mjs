import { UNIT_CONVERSIONS, UNIT_KEYS_ORDERED } from "./units.mjs";

// Parse fraction strings: "1/2", "1 1/2", "1.5", "1"
function parseNumber(str) {
  if (!str) return null;
  str = str.trim();
  // Mixed fraction: "1 1/2"
  const mixed = str.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) return parseInt(mixed[1]) + parseInt(mixed[2]) / parseInt(mixed[3]);
  // Simple fraction: "1/2"
  const frac = str.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1]) / parseInt(frac[2]);
  // Decimal: "1.5", "0.25"
  const dec = parseFloat(str);
  return isNaN(dec) ? null : dec;
}

// Multi-word phrase translations (matched first as substrings, longest first)
const PHRASE_TRANSLATIONS = [
  ["to taste", "nach Geschmack"],
  ["a pinch", "eine Prise"],
  ["a handful", "eine Handvoll"],
  ["for frying", "zum Braten"],
  ["for serving", "zum Servieren"],
  ["for garnish", "zur Garnierung"],
  ["for brushing", "zum Bestreichen"],
  ["for sprinkling", "zum Bestreuen"],
  ["for greasing", "zum Einfetten"],
  ["for dusting", "zum Bestäuben"],
  ["for decoration", "zur Dekoration"],
  ["as needed", "nach Bedarf"],
  ["as required", "nach Bedarf"],
  ["finely chopped", "fein gehackt"],
  ["finely diced", "fein gewürfelt"],
  ["finely sliced", "fein geschnitten"],
  ["thinly sliced", "dünn geschnitten"],
  ["roughly chopped", "grob gehackt"],
  ["coarsely chopped", "grob gehackt"],
  ["peeled and chopped", "geschält und gehackt"],
  ["peeled and crushed", "geschält und zerdrückt"],
  ["peeled and diced", "geschält und gewürfelt"],
  ["peeled crushed", "geschält und zerdrückt"],
  ["peeled chopped", "geschält und gehackt"],
  ["room temperature", "Raumtemperatur"],
];

// Single-word translations
const WORD_TRANSLATIONS = {
  pinch: "eine Prise",
  handful: "eine Handvoll",
  optional: "optional",
  chopped: "gehackt",
  sliced: "in Scheiben",
  diced: "gewürfelt",
  minced: "fein gehackt",
  crushed: "zerdrückt",
  grated: "gerieben",
  shredded: "geraspelt",
  peeled: "geschält",
  large: "groß",
  small: "klein",
  medium: "mittel",
  whole: "ganz",
  cubed: "gewürfelt",
  cooked: "gekocht",
  melted: "geschmolzen",
  boiling: "kochend",
  hot: "heiß",
  cold: "kalt",
  fresh: "frisch",
  dried: "getrocknet",
  ground: "gemahlen",
  beaten: "verquirlt",
  softened: "weich",
  juiced: "ausgepresst",
  zested: "abgerieben",
  halved: "halbiert",
  quartered: "geviertelt",
};

function translateHint(hint) {
  if (!hint) return null;
  let str = hint.trim();
  if (!str) return null;

  let lower = str.toLowerCase();

  // Step 1: Replace multi-word phrases (longest first)
  const sortedPhrases = [...PHRASE_TRANSLATIONS].sort((a, b) => b[0].length - a[0].length);
  for (const [phrase, translation] of sortedPhrases) {
    if (lower.includes(phrase)) {
      lower = lower.split(phrase).join(translation);
    }
  }

  // Step 2: Tokenize remaining and translate single words
  const tokens = lower.split(/[\s,]+/).filter(Boolean);
  const translated = tokens.map((tok) => {
    const cleaned = tok.replace(/[.,!?]/g, "");
    if (WORD_TRANSLATIONS[cleaned]) return WORD_TRANSLATIONS[cleaned];
    if (cleaned === "and") return "und";
    if (cleaned === "or") return "oder";
    return tok;
  });

  return translated.join(" ");
}

/**
 * Parses a TheMealDB measure string into structured data.
 *
 * Examples:
 *   "800g"                  → { amount: 800,  unit: "g",  hint: null }
 *   "1 1/2 cups"            → { amount: 360,  unit: "ml", hint: null }
 *   "2 large"               → { amount: 2,    unit: "stk", hint: "groß" }
 *   "1 chopped"             → { amount: 1,    unit: "stk", hint: "gehackt" }
 *   "To taste"              → { amount: null, unit: "stk", hint: "nach Geschmack" }
 *   "Pinch"                 → { amount: null, unit: "stk", hint: "eine Prise" }
 *   "1 clove peeled crushed"→ { amount: 1,    unit: "stk", hint: "geschält und zerdrückt" }
 *   "1 (400g) tin"          → { amount: 1,    unit: "stk", hint: "(400g)" }
 *   ""                      → { amount: null, unit: "stk", hint: null }
 */
export function parseMeasure(rawMeasure) {
  if (!rawMeasure || typeof rawMeasure !== "string") {
    return { amount: null, unit: "stk", hint: null };
  }

  // Normalize whitespace
  let str = rawMeasure.replace(/\s+/g, " ").trim();
  if (!str) return { amount: null, unit: "stk", hint: null };

  // Step 1: extract leading number (incl. fractions)
  // Match: "1 1/2", "1/2", "1.5", "1", "0.25"
  // IMPORTANT: try mixed-fraction first, then simple fraction, then decimal/int
  let amount = null;
  let rest = str;
  const mixedMatch = str.match(/^(\d+\s+\d+\/\d+)\s*/);
  const fracMatch = str.match(/^(\d+\/\d+)\s*/);
  const decMatch = str.match(/^(\d+(?:\.\d+)?)\s*/);
  if (mixedMatch) {
    amount = parseNumber(mixedMatch[1]);
    rest = str.slice(mixedMatch[0].length).trim();
  } else if (fracMatch) {
    amount = parseNumber(fracMatch[1]);
    rest = str.slice(fracMatch[0].length).trim();
  } else if (decMatch) {
    amount = parseNumber(decMatch[1]);
    rest = str.slice(decMatch[0].length).trim();
  }

  // Handle parenthesized hints like "1 (400g) tin"
  const parenMatch = rest.match(/^\(([^)]+)\)\s*/);
  let parenHint = null;
  if (parenMatch) {
    parenHint = parenMatch[0].trim(); // keep parens for clarity
    rest = rest.slice(parenMatch[0].length).trim();
  }

  // Step 2: try to match a unit at the start of `rest` (longest first)
  let unit = null;
  let factor = 1;
  let hint = null;

  if (rest) {
    const lowerRest = rest.toLowerCase();
    for (const key of UNIT_KEYS_ORDERED) {
      const keyLower = key.toLowerCase();
      // Match unit as a whole word at start
      if (
        lowerRest === keyLower ||
        lowerRest.startsWith(keyLower + " ") ||
        lowerRest.startsWith(keyLower + ".") ||
        // For short units like "g", "ml" — also accept stuck-on without space
        (keyLower.length <= 3 && lowerRest.startsWith(keyLower) && !/^[a-z]/.test(lowerRest.slice(keyLower.length)))
      ) {
        const conv = UNIT_CONVERSIONS[key];
        unit = conv.unit;
        factor = conv.factor;
        hint = rest.slice(keyLower.length).trim().replace(/^\.\s*/, "");
        break;
      }
    }
  }

  // No number, only descriptive text → hint only
  if (amount === null && !unit) {
    return {
      amount: null,
      unit: "stk",
      hint: parenHint ? `${parenHint} ${translateHint(rest) || ""}`.trim() : translateHint(rest),
    };
  }

  // Number but no recognized unit → "stk"
  if (amount !== null && !unit) {
    return {
      amount,
      unit: "stk",
      hint: parenHint ? `${parenHint} ${translateHint(rest) || ""}`.trim() : translateHint(rest),
    };
  }

  // Number + unit
  let convertedAmount = amount === null ? null : amount * factor;
  // Round nicely
  if (convertedAmount !== null) {
    if (convertedAmount >= 10) convertedAmount = Math.round(convertedAmount);
    else convertedAmount = Math.round(convertedAmount * 10) / 10;
  }

  const finalHint = parenHint
    ? `${parenHint}${hint ? " " + (translateHint(hint) || "") : ""}`.trim()
    : translateHint(hint);

  return { amount: convertedAmount, unit, hint: finalHint || null };
}
