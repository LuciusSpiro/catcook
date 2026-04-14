import { supabase } from "./supabase";
import { MAX_HOUSEHOLDS } from "../constants";

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
}

export interface HouseholdMember {
  user_id: string;
  role: "owner" | "member";
  display_name: string;
}

export async function fetchUserHouseholds(userId: string): Promise<Household[]> {
  const { data, error } = await supabase
    .from("household_members")
    .select("household_id, households(id, name, invite_code, created_by)")
    .eq("user_id", userId);

  if (error) {
    console.error("fetchUserHouseholds:", error);
    return [];
  }
  return (data ?? [])
    .map((row: Record<string, unknown>) => row.households as Household)
    .filter(Boolean);
}

export async function fetchHouseholdMembers(householdId: string): Promise<HouseholdMember[]> {
  const { data, error } = await supabase
    .from("household_members")
    .select("user_id, role, profiles(display_name)")
    .eq("household_id", householdId);

  if (error) {
    console.error("fetchHouseholdMembers:", error);
    return [];
  }
  return (data ?? []).map((row: Record<string, unknown>) => ({
    user_id: row.user_id as string,
    role: row.role as "owner" | "member",
    display_name: (row.profiles as Record<string, string>)?.display_name ?? "Katze",
  }));
}

export async function createHousehold(
  userId: string,
  name: string
): Promise<Household | null> {
  // Check limit
  const existing = await fetchUserHouseholds(userId);
  if (existing.length >= MAX_HOUSEHOLDS) return null;

  // Use RPC to atomically create household + add owner membership
  const { data, error } = await supabase.rpc("create_household_with_owner", {
    household_name: name,
  });

  if (error || !data?.[0]) {
    console.error("createHousehold:", error);
    return null;
  }

  return data[0] as Household;
}

export async function joinHouseholdByCode(
  userId: string,
  inviteCode: string
): Promise<Household | null> {
  // Check user's household limit
  const existing = await fetchUserHouseholds(userId);
  if (existing.length >= MAX_HOUSEHOLDS) return null;

  // Use RPC to atomically join by invite code
  const { data, error } = await supabase.rpc("join_household_by_code", {
    code: inviteCode,
  });

  if (error || !data?.[0]) {
    console.error("joinHouseholdByCode:", error);
    return null;
  }

  return data[0] as Household;
}

export async function leaveHousehold(userId: string, householdId: string): Promise<boolean> {
  const { error } = await supabase
    .from("household_members")
    .delete()
    .eq("household_id", householdId)
    .eq("user_id", userId);

  if (error) {
    console.error("leaveHousehold:", error);
    return false;
  }
  return true;
}

export async function deleteHousehold(householdId: string): Promise<boolean> {
  const { error } = await supabase
    .from("households")
    .delete()
    .eq("id", householdId);

  if (error) {
    console.error("deleteHousehold:", error);
    return false;
  }
  return true;
}

export async function renameHousehold(householdId: string, name: string): Promise<boolean> {
  const { error } = await supabase
    .from("households")
    .update({ name })
    .eq("id", householdId);

  if (error) {
    console.error("renameHousehold:", error);
    return false;
  }
  return true;
}
