// Multi-strategy parser for TheMealDB strInstructions

function cleanText(text) {
  return text
    .replace(/\r\n/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Splits a long instruction text into individual step strings.
 * Tries multiple strategies in order:
 *   1. Explicit "step N" labels
 *   2. Double newlines (paragraph breaks)
 *   3. Single newlines (if at least 3 substantial blocks)
 *   4. Fallback: whole text as a single step
 */
export function parseInstructions(raw) {
  if (!raw || typeof raw !== "string") return [];
  const text = raw.trim();
  if (!text) return [];

  // Strategy 1: "step 1", "step 2" labels
  // Match the labels to find their positions, then split between them
  const stepLabelRegex = /step\s+\d+\s*[:\.\-]?\s*\r?\n?/gi;
  const stepMatches = [...text.matchAll(stepLabelRegex)];
  if (stepMatches.length >= 2) {
    const blocks = [];
    for (let i = 0; i < stepMatches.length; i++) {
      const start = stepMatches[i].index + stepMatches[i][0].length;
      const end = i + 1 < stepMatches.length ? stepMatches[i + 1].index : text.length;
      const block = text.slice(start, end).trim();
      if (block.length >= 5) blocks.push(cleanText(block));
    }
    if (blocks.length >= 2) return blocks;
  }

  // Strategy 2: Double newlines (paragraphs)
  const doubleParts = text
    .split(/\r?\n\r?\n+/)
    .map((p) => cleanText(p))
    .filter((p) => p.length > 20);
  if (doubleParts.length >= 2) return doubleParts;

  // Strategy 3: Single newlines (only if there are at least 3 substantial blocks)
  const singleParts = text
    .split(/\r?\n/)
    .map((p) => cleanText(p))
    .filter((p) => p.length > 40);
  if (singleParts.length >= 3) return singleParts;

  // Strategy 4: Sentence-level split if instructions are one big paragraph
  if (text.length > 400) {
    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => cleanText(s))
      .filter((s) => s.length > 20);
    // Group sentences into chunks of ~2-3 for readable steps
    if (sentences.length >= 4) {
      const chunks = [];
      for (let i = 0; i < sentences.length; i += 2) {
        chunks.push(sentences.slice(i, i + 2).join(" "));
      }
      return chunks;
    }
  }

  // Fallback: single step with all text
  return [cleanText(text)];
}
