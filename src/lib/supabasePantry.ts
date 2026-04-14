import { supabase } from "./supabase";

export interface SupaPantryItem {
  id: string;
  ingredient_name: string;
  quantity: number | null;
  unit: string | null;
  added_by: string;
}

export async function fetchPantry(householdId: string): Promise<SupaPantryItem[]> {
  const { data, error } = await supabase
    .from("pantry")
    .select("id, ingredient_name, quantity, unit, added_by")
    .eq("household_id", householdId);

  if (error) {
    console.error("fetchPantry:", error);
    return [];
  }
  return data ?? [];
}

export async function addPantryItem(
  householdId: string,
  userId: string,
  name: string,
  quantity?: number,
  unit?: string
): Promise<void> {
  const { error } = await supabase.from("pantry").insert({
    household_id: householdId,
    ingredient_name: name,
    quantity: quantity ?? null,
    unit: unit ?? null,
    added_by: userId,
  });
  if (error) console.error("addPantryItem:", error);
}

export async function removePantryItem(itemId: string): Promise<void> {
  const { error } = await supabase.from("pantry").delete().eq("id", itemId);
  if (error) console.error("removePantryItem:", error);
}

export async function bulkAddPantryItems(
  householdId: string,
  userId: string,
  items: { name: string; quantity?: number; unit?: string }[]
): Promise<void> {
  const rows = items.map((item) => ({
    household_id: householdId,
    ingredient_name: item.name,
    quantity: item.quantity ?? null,
    unit: item.unit ?? null,
    added_by: userId,
  }));
  const { error } = await supabase.from("pantry").insert(rows);
  if (error) console.error("bulkAddPantryItems:", error);
}
