import { supabase } from "./supabase";

// SQL schema (run in Supabase SQL editor):
//
// create table if not exists public.shopping_list (
//   household_id uuid primary key references public.households(id) on delete cascade,
//   target_date date not null,
//   generated_at timestamptz not null default now(),
//   dismissed_keys text[] not null default '{}',
//   updated_by uuid references auth.users(id),
//   updated_at timestamptz not null default now()
// );
// alter table public.shopping_list enable row level security;
// create policy "members can read" on public.shopping_list for select using (
//   exists (select 1 from public.household_members m
//           where m.household_id = shopping_list.household_id and m.user_id = auth.uid())
// );
// create policy "members can write" on public.shopping_list for all using (
//   exists (select 1 from public.household_members m
//           where m.household_id = shopping_list.household_id and m.user_id = auth.uid())
// );

export interface SupaShoppingList {
  household_id: string;
  target_date: string;
  generated_at: string;
  dismissed_keys: string[];
  updated_by: string | null;
  updated_at: string;
}

export async function fetchShoppingList(householdId: string): Promise<SupaShoppingList | null> {
  const { data, error } = await supabase
    .from("shopping_list")
    .select("*")
    .eq("household_id", householdId)
    .maybeSingle();
  if (error) {
    console.error("fetchShoppingList:", error);
    return null;
  }
  return (data as SupaShoppingList | null) ?? null;
}

export async function upsertShoppingList(
  householdId: string,
  userId: string,
  targetDate: string,
  dismissedKeys: string[],
): Promise<SupaShoppingList | null> {
  const { data, error } = await supabase
    .from("shopping_list")
    .upsert({
      household_id: householdId,
      target_date: targetDate,
      dismissed_keys: dismissedKeys,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    }, { onConflict: "household_id" })
    .select()
    .single();
  if (error) {
    console.error("upsertShoppingList:", error);
    return null;
  }
  return data as SupaShoppingList;
}

export async function clearShoppingList(householdId: string): Promise<void> {
  const { error } = await supabase
    .from("shopping_list")
    .delete()
    .eq("household_id", householdId);
  if (error) console.error("clearShoppingList:", error);
}

export function subscribeShoppingList(
  householdId: string,
  onChange: (list: SupaShoppingList | null) => void,
) {
  const channel = supabase
    .channel(`shopping_list:${householdId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "shopping_list", filter: `household_id=eq.${householdId}` },
      (payload) => {
        if (payload.eventType === "DELETE") onChange(null);
        else onChange(payload.new as SupaShoppingList);
      },
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
}
