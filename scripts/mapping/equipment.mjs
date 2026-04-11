// Detect kitchen equipment mentioned in instructions text
const EQUIPMENT_PATTERNS = [
  ["Pfanne",        /\b(frying\s+pan|skillet|wok)\b/i],
  ["Topf",          /\b(pot|saucepan|stockpot|dutch\s+oven|casserole)\b/i],
  ["Ofen",          /\b(oven|broil|preheat)\b/i],
  ["Mixer",         /\b(blender|food\s+processor|hand\s+mixer|stand\s+mixer)\b/i],
  ["Rührschüssel",  /\b(bowl|mixing\s+bowl)\b/i],
  ["Backblech",     /\b(baking\s+sheet|baking\s+tray|sheet\s+pan)\b/i],
  ["Backform",      /\b(baking\s+dish|cake\s+pan|loaf\s+pan|cake\s+tin|springform|baking\s+pan)\b/i],
  ["Schneidebrett", /\bcutting\s+board\b/i],
  ["Grill",         /\b(grill|bbq|barbecue|griddle)\b/i],
  ["Messer",        /\bsharp\s+knife\b/i],
  ["Sieb",          /\b(sieve|strainer|colander)\b/i],
  ["Reibe",         /\bgrater\b/i],
  ["Schneebesen",   /\bwhisk\b/i],
  ["Kochlöffel",    /\bwooden\s+spoon\b/i],
  ["Teigrolle",     /\brolling\s+pin\b/i],
  ["Frittierteig",  /\bdeep\s+fry/i],
  ["Heißluftfritteuse", /\bair\s+fryer\b/i],
  ["Slow Cooker",   /\bslow\s+cooker\b/i],
  ["Dampfgarer",    /\bsteamer\b/i],
];

export function extractEquipment(instructionsText) {
  if (!instructionsText) return [];
  const found = new Set();
  for (const [name, regex] of EQUIPMENT_PATTERNS) {
    if (regex.test(instructionsText)) found.add(name);
  }
  return Array.from(found);
}
