import { supabase } from "./supabase";

export interface SupabaseProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

export async function fetchProfile(userId: string): Promise<SupabaseProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .single();
  if (error) {
    console.error("fetchProfile:", error);
    return null;
  }
  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<SupabaseProfile, "display_name" | "avatar_url">>
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  if (error) console.error("updateProfile:", error);
}
