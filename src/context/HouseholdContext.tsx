import {
  createContext, useContext, useEffect, useState, useCallback, type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { isOnline } from "../lib/supabase";
import {
  fetchUserHouseholds, fetchHouseholdMembers, createHousehold,
  joinHouseholdByCode, leaveHousehold, deleteHousehold, renameHousehold,
  type Household, type HouseholdMember,
} from "../lib/supabaseHousehold";

const ACTIVE_HH_KEY = "catcook-active-household";

interface HouseholdContextValue {
  households: Household[];
  activeHousehold: Household | null;
  activeHouseholdIndex: number;
  members: HouseholdMember[];
  loading: boolean;
  setActiveHousehold: (hh: Household) => void;
  create: (name: string) => Promise<Household | null>;
  join: (inviteCode: string) => Promise<Household | null>;
  leave: (householdId: string) => Promise<boolean>;
  kickMember: (householdId: string, userId: string) => Promise<boolean>;
  remove: (householdId: string) => Promise<boolean>;
  rename: (householdId: string, name: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const HouseholdContext = createContext<HouseholdContextValue | null>(null);

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [households, setHouseholds] = useState<Household[]>([]);
  const [activeHousehold, setActiveHH] = useState<Household | null>(null);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHouseholds = useCallback(async () => {
    if (!user || !isOnline()) { setLoading(false); return; }
    setLoading(true);
    const hhs = await fetchUserHouseholds(user.id);
    setHouseholds(hhs);

    // Restore active household from localStorage or pick first
    const savedId = localStorage.getItem(ACTIVE_HH_KEY);
    const active = hhs.find((h) => h.id === savedId) ?? hhs[0] ?? null;
    setActiveHH(active);

    if (active) {
      const m = await fetchHouseholdMembers(active.id);
      setMembers(m);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadHouseholds(); }, [loadHouseholds]);

  const setActiveHousehold = useCallback(async (hh: Household) => {
    setActiveHH(hh);
    localStorage.setItem(ACTIVE_HH_KEY, hh.id);
    const m = await fetchHouseholdMembers(hh.id);
    setMembers(m);
  }, []);

  const create = useCallback(async (name: string) => {
    if (!user) return null;
    const hh = await createHousehold(user.id, name);
    if (hh) await loadHouseholds();
    return hh;
  }, [user, loadHouseholds]);

  const join = useCallback(async (inviteCode: string) => {
    if (!user) return null;
    const hh = await joinHouseholdByCode(user.id, inviteCode);
    if (hh) await loadHouseholds();
    return hh;
  }, [user, loadHouseholds]);

  const leave = useCallback(async (householdId: string) => {
    if (!user) return false;
    const ok = await leaveHousehold(user.id, householdId);
    if (ok) await loadHouseholds();
    return ok;
  }, [user, loadHouseholds]);

  const kickMember = useCallback(async (householdId: string, userId: string) => {
    const ok = await leaveHousehold(userId, householdId);
    if (ok) await loadHouseholds();
    return ok;
  }, [loadHouseholds]);

  const remove = useCallback(async (householdId: string) => {
    const ok = await deleteHousehold(householdId);
    if (ok) await loadHouseholds();
    return ok;
  }, [loadHouseholds]);

  const renameHH = useCallback(async (householdId: string, name: string) => {
    const ok = await renameHousehold(householdId, name);
    if (ok) await loadHouseholds();
    return ok;
  }, [loadHouseholds]);

  const activeHouseholdIndex = activeHousehold
    ? households.findIndex((h) => h.id === activeHousehold.id)
    : 0;

  return (
    <HouseholdContext.Provider
      value={{
        households, activeHousehold, activeHouseholdIndex: Math.max(0, activeHouseholdIndex),
        members, loading,
        setActiveHousehold, create, join, leave, kickMember, remove, rename: renameHH, refresh: loadHouseholds,
      }}
    >
      {children}
    </HouseholdContext.Provider>
  );
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext);
  if (!ctx) throw new Error("useHousehold must be used within HouseholdProvider");
  return ctx;
}
