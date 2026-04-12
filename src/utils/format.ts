import { INGREDIENT_UNITS } from "../types/player";

export function formatIngredientAmount(
  amount: number | null | undefined,
  unit: string | undefined
): string {
  if (amount == null) return "";
  const label =
    INGREDIENT_UNITS.find((u) => u.value === unit)?.label ?? unit ?? "";
  return `${amount} ${label}`.trim();
}
