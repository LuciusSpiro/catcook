// Detect servings/portion count from instructions or recipe name
// CONSERVATIVE: only match very explicit patterns, otherwise return undefined.

const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, twelve: 12,
};

// Strict patterns that almost always indicate portions
const SERVINGS_PATTERNS = [
  /\bserves\s*[:\-]?\s*(\d+)\b/i,                  // "Serves 4", "Serves: 4"
  /\bserves\s+(one|two|three|four|five|six|seven|eight|ten|twelve)\b/i, // "Serves four"
  /\b(\d+)\s+servings?\b/i,                          // "4 servings"
  /\bfor\s+(\d+)\s+people\b/i,                       // "for 4 people"
  /\byield[s]?\s*[:\-]?\s*(\d+)\s+servings?/i,       // "Yields 6 servings"
  /\bmakes?\s+(\d+)\s+servings?\b/i,                 // "Makes 4 servings"
  /\benough\s+for\s+(\d+)\s+(?:people|servings?)/i,  // "enough for 4 people"
];

export function detectServings(meal /*, mappedCategory */) {
  const haystack = `${meal.strMeal || ""}\n${meal.strInstructions || ""}`;

  for (const re of SERVINGS_PATTERNS) {
    const m = haystack.match(re);
    if (!m) continue;
    const cap = m[1];
    let n;
    if (NUMBER_WORDS[cap?.toLowerCase()] != null) {
      n = NUMBER_WORDS[cap.toLowerCase()];
    } else {
      n = parseInt(cap, 10);
    }
    if (n >= 1 && n <= 20) return n;
  }

  return undefined;
}
