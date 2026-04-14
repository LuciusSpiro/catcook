import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Debug: make accessible from browser console
if (typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__supabase = supabase;
}

export function isOnline(): boolean {
  return navigator.onLine;
}
