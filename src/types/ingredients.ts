export interface IngredientDef {
  name: string;
  icon: string;
  category: IngredientCategory;
}

export type IngredientCategory =
  | "Gemüse"
  | "Obst"
  | "Fleisch"
  | "Fisch & Meeresfrüchte"
  | "Milchprodukte"
  | "Getreide & Teigwaren"
  | "Gewürze & Kräuter"
  | "Öle & Fette"
  | "Saucen & Pasten"
  | "Hülsenfrüchte & Nüsse"
  | "Eier & Backzutaten"
  | "Getränke & Flüssiges"
  | "Sonstiges";

// Icons die im Icon-Picker zur Auswahl stehen
export const INGREDIENT_ICONS = [
  // Gemüse
  "🥕", "🥦", "🥬", "🥒", "🌽", "🫑", "🌶️", "🍅", "🧅", "🧄",
  "🥔", "🍆", "🫛", "🥜", "🫘", "🍄", "🥗", "🫒",
  // Obst
  "🍎", "🍐", "🍊", "🍋", "🍌", "🍇", "🍓", "🫐", "🍑", "🍍",
  "🥭", "🍉", "🥝", "🍒", "🥥",
  // Fleisch
  "🥩", "🍗", "🍖", "🥓", "🌭",
  // Fisch
  "🐟", "🦐", "🦀", "🦑", "🐙",
  // Milchprodukte
  "🧀", "🥛", "🧈", "🍦",
  // Getreide & Brot
  "🍞", "🥖", "🥐", "🍚", "🌾", "🥣",
  // Gewürze & Kräuter
  "🧂", "🌿", "🍃", "🫚", "🌰",
  // Öle & Saucen
  "🫗", "🍯", "🥫",
  // Eier & Backen
  "🥚", "🧁", "🍫", "🎂",
  // Getränke
  "💧", "🍷", "🍺", "☕", "🍵", "🧃",
  // Allgemein / Sonstige
  "🍜", "🍝", "🌮", "🥟", "🫕", "🥘", "🍲", "🧆", "🥙", "🫓",
  "⭐", "🐱", "🐾", "❤️", "✨",
] as const;

export const DEFAULT_INGREDIENTS: IngredientDef[] = [
  // ── Gemüse ──
  { name: "Kartoffel", icon: "🥔", category: "Gemüse" },
  { name: "Karotte", icon: "🥕", category: "Gemüse" },
  { name: "Zwiebel", icon: "🧅", category: "Gemüse" },
  { name: "Knoblauch", icon: "🧄", category: "Gemüse" },
  { name: "Tomate", icon: "🍅", category: "Gemüse" },
  { name: "Paprika", icon: "🫑", category: "Gemüse" },
  { name: "Gurke", icon: "🥒", category: "Gemüse" },
  { name: "Zucchini", icon: "🥒", category: "Gemüse" },
  { name: "Aubergine", icon: "🍆", category: "Gemüse" },
  { name: "Brokkoli", icon: "🥦", category: "Gemüse" },
  { name: "Blumenkohl", icon: "🥦", category: "Gemüse" },
  { name: "Spinat", icon: "🥬", category: "Gemüse" },
  { name: "Salat", icon: "🥬", category: "Gemüse" },
  { name: "Mais", icon: "🌽", category: "Gemüse" },
  { name: "Champignon", icon: "🍄", category: "Gemüse" },
  { name: "Lauch", icon: "🥬", category: "Gemüse" },
  { name: "Sellerie", icon: "🥬", category: "Gemüse" },
  { name: "Kürbis", icon: "🎃", category: "Gemüse" },
  { name: "Süßkartoffel", icon: "🥔", category: "Gemüse" },
  { name: "Erbsen", icon: "🫛", category: "Gemüse" },
  { name: "Bohnen (grün)", icon: "🫛", category: "Gemüse" },
  { name: "Chili", icon: "🌶️", category: "Gemüse" },
  { name: "Ingwer", icon: "🫚", category: "Gemüse" },
  { name: "Rote Bete", icon: "🥕", category: "Gemüse" },
  { name: "Fenchel", icon: "🥬", category: "Gemüse" },
  { name: "Radieschen", icon: "🥕", category: "Gemüse" },
  { name: "Spargel", icon: "🥬", category: "Gemüse" },
  { name: "Oliven", icon: "🫒", category: "Gemüse" },
  { name: "Avocado", icon: "🥑", category: "Gemüse" },
  { name: "Kohlrabi", icon: "🥬", category: "Gemüse" },
  { name: "Rotkohl", icon: "🥬", category: "Gemüse" },
  { name: "Weißkohl", icon: "🥬", category: "Gemüse" },

  // ── Obst ──
  { name: "Apfel", icon: "🍎", category: "Obst" },
  { name: "Banane", icon: "🍌", category: "Obst" },
  { name: "Zitrone", icon: "🍋", category: "Obst" },
  { name: "Limette", icon: "🍋", category: "Obst" },
  { name: "Orange", icon: "🍊", category: "Obst" },
  { name: "Erdbeere", icon: "🍓", category: "Obst" },
  { name: "Blaubeere", icon: "🫐", category: "Obst" },
  { name: "Himbeere", icon: "🍓", category: "Obst" },
  { name: "Weintraube", icon: "🍇", category: "Obst" },
  { name: "Pfirsich", icon: "🍑", category: "Obst" },
  { name: "Birne", icon: "🍐", category: "Obst" },
  { name: "Mango", icon: "🥭", category: "Obst" },
  { name: "Ananas", icon: "🍍", category: "Obst" },
  { name: "Kirsche", icon: "🍒", category: "Obst" },
  { name: "Wassermelone", icon: "🍉", category: "Obst" },
  { name: "Kiwi", icon: "🥝", category: "Obst" },
  { name: "Kokosnuss", icon: "🥥", category: "Obst" },
  { name: "Pflaume", icon: "🍑", category: "Obst" },
  { name: "Rosinen", icon: "🍇", category: "Obst" },

  // ── Fleisch ──
  { name: "Hähnchenbrust", icon: "🍗", category: "Fleisch" },
  { name: "Hähnchenschenkel", icon: "🍗", category: "Fleisch" },
  { name: "Hackfleisch (Rind)", icon: "🥩", category: "Fleisch" },
  { name: "Hackfleisch (gemischt)", icon: "🥩", category: "Fleisch" },
  { name: "Rindfleisch", icon: "🥩", category: "Fleisch" },
  { name: "Schweinefilet", icon: "🥩", category: "Fleisch" },
  { name: "Schweinefleisch", icon: "🥩", category: "Fleisch" },
  { name: "Speck", icon: "🥓", category: "Fleisch" },
  { name: "Schinken", icon: "🥓", category: "Fleisch" },
  { name: "Salami", icon: "🌭", category: "Fleisch" },
  { name: "Würstchen", icon: "🌭", category: "Fleisch" },
  { name: "Lammfleisch", icon: "🥩", category: "Fleisch" },
  { name: "Putenbrust", icon: "🍗", category: "Fleisch" },
  { name: "Entenbrust", icon: "🍗", category: "Fleisch" },

  // ── Fisch & Meeresfrüchte ──
  { name: "Lachs", icon: "🐟", category: "Fisch & Meeresfrüchte" },
  { name: "Thunfisch", icon: "🐟", category: "Fisch & Meeresfrüchte" },
  { name: "Kabeljau", icon: "🐟", category: "Fisch & Meeresfrüchte" },
  { name: "Forelle", icon: "🐟", category: "Fisch & Meeresfrüchte" },
  { name: "Garnelen", icon: "🦐", category: "Fisch & Meeresfrüchte" },
  { name: "Muscheln", icon: "🦀", category: "Fisch & Meeresfrüchte" },
  { name: "Tintenfisch", icon: "🦑", category: "Fisch & Meeresfrüchte" },
  { name: "Sardellen", icon: "🐟", category: "Fisch & Meeresfrüchte" },
  { name: "Hering", icon: "🐟", category: "Fisch & Meeresfrüchte" },

  // ── Milchprodukte ──
  { name: "Milch", icon: "🥛", category: "Milchprodukte" },
  { name: "Butter", icon: "🧈", category: "Milchprodukte" },
  { name: "Sahne", icon: "🥛", category: "Milchprodukte" },
  { name: "Schmand", icon: "🥛", category: "Milchprodukte" },
  { name: "Sauerrahm", icon: "🥛", category: "Milchprodukte" },
  { name: "Crème fraîche", icon: "🥛", category: "Milchprodukte" },
  { name: "Frischkäse", icon: "🧀", category: "Milchprodukte" },
  { name: "Käse (gerieben)", icon: "🧀", category: "Milchprodukte" },
  { name: "Mozzarella", icon: "🧀", category: "Milchprodukte" },
  { name: "Parmesan", icon: "🧀", category: "Milchprodukte" },
  { name: "Gouda", icon: "🧀", category: "Milchprodukte" },
  { name: "Feta", icon: "🧀", category: "Milchprodukte" },
  { name: "Joghurt", icon: "🥛", category: "Milchprodukte" },
  { name: "Quark", icon: "🥛", category: "Milchprodukte" },
  { name: "Mascarpone", icon: "🧀", category: "Milchprodukte" },
  { name: "Ricotta", icon: "🧀", category: "Milchprodukte" },

  // ── Getreide & Teigwaren ──
  { name: "Mehl", icon: "🌾", category: "Getreide & Teigwaren" },
  { name: "Reis", icon: "🍚", category: "Getreide & Teigwaren" },
  { name: "Pasta (Spaghetti)", icon: "🍝", category: "Getreide & Teigwaren" },
  { name: "Pasta (Penne)", icon: "🍝", category: "Getreide & Teigwaren" },
  { name: "Pasta (Fusilli)", icon: "🍝", category: "Getreide & Teigwaren" },
  { name: "Nudeln", icon: "🍝", category: "Getreide & Teigwaren" },
  { name: "Brot", icon: "🍞", category: "Getreide & Teigwaren" },
  { name: "Brötchen", icon: "🥖", category: "Getreide & Teigwaren" },
  { name: "Toast", icon: "🍞", category: "Getreide & Teigwaren" },
  { name: "Tortilla", icon: "🫓", category: "Getreide & Teigwaren" },
  { name: "Blätterteig", icon: "🥐", category: "Getreide & Teigwaren" },
  { name: "Pizzateig", icon: "🫓", category: "Getreide & Teigwaren" },
  { name: "Haferflocken", icon: "🥣", category: "Getreide & Teigwaren" },
  { name: "Couscous", icon: "🍚", category: "Getreide & Teigwaren" },
  { name: "Bulgur", icon: "🍚", category: "Getreide & Teigwaren" },
  { name: "Quinoa", icon: "🍚", category: "Getreide & Teigwaren" },
  { name: "Paniermehl", icon: "🌾", category: "Getreide & Teigwaren" },
  { name: "Reisnudeln", icon: "🍜", category: "Getreide & Teigwaren" },
  { name: "Lasagneplatten", icon: "🍝", category: "Getreide & Teigwaren" },

  // ── Gewürze & Kräuter ──
  { name: "Salz", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Pfeffer", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Paprikapulver", icon: "🌶️", category: "Gewürze & Kräuter" },
  { name: "Kreuzkümmel (Cumin)", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Kurkuma", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Curry", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Zimt", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Muskatnuss", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Oregano", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Basilikum", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Thymian", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Rosmarin", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Petersilie", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Schnittlauch", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Dill", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Minze", icon: "🍃", category: "Gewürze & Kräuter" },
  { name: "Koriander", icon: "🌿", category: "Gewürze & Kräuter" },
  { name: "Lorbeerblatt", icon: "🍃", category: "Gewürze & Kräuter" },
  { name: "Chilipulver", icon: "🌶️", category: "Gewürze & Kräuter" },
  { name: "Knoblauchpulver", icon: "🧄", category: "Gewürze & Kräuter" },
  { name: "Zwiebelpulver", icon: "🧅", category: "Gewürze & Kräuter" },
  { name: "Vanille", icon: "🌰", category: "Gewürze & Kräuter" },
  { name: "Safran", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Kardamom", icon: "🧂", category: "Gewürze & Kräuter" },
  { name: "Nelken", icon: "🧂", category: "Gewürze & Kräuter" },

  // ── Öle & Fette ──
  { name: "Olivenöl", icon: "🫗", category: "Öle & Fette" },
  { name: "Sonnenblumenöl", icon: "🫗", category: "Öle & Fette" },
  { name: "Rapsöl", icon: "🫗", category: "Öle & Fette" },
  { name: "Sesamöl", icon: "🫗", category: "Öle & Fette" },
  { name: "Kokosöl", icon: "🥥", category: "Öle & Fette" },
  { name: "Butterschmalz", icon: "🧈", category: "Öle & Fette" },
  { name: "Margarine", icon: "🧈", category: "Öle & Fette" },

  // ── Saucen & Pasten ──
  { name: "Tomatenmark", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Passierte Tomaten", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Sojasauce", icon: "🫗", category: "Saucen & Pasten" },
  { name: "Worcestersauce", icon: "🫗", category: "Saucen & Pasten" },
  { name: "Senf", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Ketchup", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Mayonnaise", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Essig", icon: "🫗", category: "Saucen & Pasten" },
  { name: "Balsamico", icon: "🫗", category: "Saucen & Pasten" },
  { name: "Pesto", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Tabasco", icon: "🌶️", category: "Saucen & Pasten" },
  { name: "Sambal Oelek", icon: "🌶️", category: "Saucen & Pasten" },
  { name: "Currypaste", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Tahini", icon: "🥫", category: "Saucen & Pasten" },
  { name: "Kokosmilch", icon: "🥥", category: "Saucen & Pasten" },
  { name: "Fischsauce", icon: "🐟", category: "Saucen & Pasten" },
  { name: "Teriyaki-Sauce", icon: "🫗", category: "Saucen & Pasten" },
  { name: "Hoisin-Sauce", icon: "🫗", category: "Saucen & Pasten" },
  { name: "Brühe (Gemüse)", icon: "🍲", category: "Saucen & Pasten" },
  { name: "Brühe (Hühner)", icon: "🍲", category: "Saucen & Pasten" },
  { name: "Brühe (Rinder)", icon: "🍲", category: "Saucen & Pasten" },

  // ── Hülsenfrüchte & Nüsse ──
  { name: "Kichererbsen", icon: "🫘", category: "Hülsenfrüchte & Nüsse" },
  { name: "Kidneybohnen", icon: "🫘", category: "Hülsenfrüchte & Nüsse" },
  { name: "Weiße Bohnen", icon: "🫘", category: "Hülsenfrüchte & Nüsse" },
  { name: "Linsen (rot)", icon: "🫘", category: "Hülsenfrüchte & Nüsse" },
  { name: "Linsen (grün)", icon: "🫘", category: "Hülsenfrüchte & Nüsse" },
  { name: "Erdnüsse", icon: "🥜", category: "Hülsenfrüchte & Nüsse" },
  { name: "Mandeln", icon: "🌰", category: "Hülsenfrüchte & Nüsse" },
  { name: "Walnüsse", icon: "🌰", category: "Hülsenfrüchte & Nüsse" },
  { name: "Cashews", icon: "🌰", category: "Hülsenfrüchte & Nüsse" },
  { name: "Pinienkerne", icon: "🌰", category: "Hülsenfrüchte & Nüsse" },
  { name: "Sesam", icon: "🌰", category: "Hülsenfrüchte & Nüsse" },
  { name: "Sonnenblumenkerne", icon: "🌰", category: "Hülsenfrüchte & Nüsse" },
  { name: "Erdnussbutter", icon: "🥜", category: "Hülsenfrüchte & Nüsse" },
  { name: "Tofu", icon: "🧆", category: "Hülsenfrüchte & Nüsse" },

  // ── Eier & Backzutaten ──
  { name: "Ei", icon: "🥚", category: "Eier & Backzutaten" },
  { name: "Zucker", icon: "🧂", category: "Eier & Backzutaten" },
  { name: "Puderzucker", icon: "🧂", category: "Eier & Backzutaten" },
  { name: "Brauner Zucker", icon: "🧂", category: "Eier & Backzutaten" },
  { name: "Honig", icon: "🍯", category: "Eier & Backzutaten" },
  { name: "Ahornsirup", icon: "🍯", category: "Eier & Backzutaten" },
  { name: "Backpulver", icon: "🧁", category: "Eier & Backzutaten" },
  { name: "Hefe", icon: "🧁", category: "Eier & Backzutaten" },
  { name: "Speisestärke", icon: "🌾", category: "Eier & Backzutaten" },
  { name: "Gelatine", icon: "🧁", category: "Eier & Backzutaten" },
  { name: "Schokolade (Zartbitter)", icon: "🍫", category: "Eier & Backzutaten" },
  { name: "Schokolade (Vollmilch)", icon: "🍫", category: "Eier & Backzutaten" },
  { name: "Kakao", icon: "🍫", category: "Eier & Backzutaten" },
  { name: "Vanillezucker", icon: "🧁", category: "Eier & Backzutaten" },

  // ── Getränke & Flüssiges ──
  { name: "Wasser", icon: "💧", category: "Getränke & Flüssiges" },
  { name: "Weißwein", icon: "🍷", category: "Getränke & Flüssiges" },
  { name: "Rotwein", icon: "🍷", category: "Getränke & Flüssiges" },
  { name: "Bier", icon: "🍺", category: "Getränke & Flüssiges" },
  { name: "Apfelsaft", icon: "🧃", category: "Getränke & Flüssiges" },
  { name: "Orangensaft", icon: "🍊", category: "Getränke & Flüssiges" },
  { name: "Zitronensaft", icon: "🍋", category: "Getränke & Flüssiges" },

  // ── Sonstiges ──
  { name: "Kapern", icon: "🫒", category: "Sonstiges" },
  { name: "Cornichons", icon: "🥒", category: "Sonstiges" },
  { name: "Miso-Paste", icon: "🥫", category: "Sonstiges" },
  { name: "Nori (Seetang)", icon: "🍃", category: "Sonstiges" },
  { name: "Tortilla-Chips", icon: "🌮", category: "Sonstiges" },
  { name: "Panko", icon: "🌾", category: "Sonstiges" },
  { name: "Wonton-Blätter", icon: "🥟", category: "Sonstiges" },
];

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  "Gemüse",
  "Obst",
  "Fleisch",
  "Fisch & Meeresfrüchte",
  "Milchprodukte",
  "Getreide & Teigwaren",
  "Gewürze & Kräuter",
  "Öle & Fette",
  "Saucen & Pasten",
  "Hülsenfrüchte & Nüsse",
  "Eier & Backzutaten",
  "Getränke & Flüssiges",
  "Sonstiges",
];
