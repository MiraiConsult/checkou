"use client";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { accessedUnit } from "@/lib/impersonation";

interface UserProfile {
  id: string;
  name: string;
  role: "master" | "admin" | "operator";
  email: string;
  avatar_url: string | null;
  organization_id: string;
  sector: string;
  unit_id: string | null;
  // Preenchido quando a equipe Checkou está acessando a conta de uma empresa nesta aba
  acting_name: string | null;
}

// Equipe Checkou: administra todas as empresas. Quem tem unit_id é usuário de um cliente.
export function isStaff(user: UserProfile | null) {
  return !!user && !user.unit_id && (user.role === "admin" || user.role === "master");
}

// Administrador de um cliente gerencia os usuários só da própria empresa
export function canManageUsers(user: UserProfile | null) {
  return !!user && (user.role === "admin" || user.role === "master");
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  setUser: (user: UserProfile | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  fetchUser: async () => {
    const supabase = createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      set({ user: null, loading: false });
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, role, email, avatar_url, organization_id, sector, unit_id")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      const staffProfile = !profile.unit_id && (profile.role === "admin" || profile.role === "master");
      const accessed = staffProfile ? accessedUnit() : null;
      const { data: unit } = accessed
        ? await supabase.from("units").select("id, name").eq("id", accessed).maybeSingle()
        : { data: null };
      set({
        user: {
          id: profile.id,
          name: profile.full_name,
          role: profile.role as "master" | "admin" | "operator",
          email: profile.email,
          avatar_url: profile.avatar_url,
          organization_id: profile.organization_id,
          sector: profile.sector || "geral",
          unit_id: unit?.id ?? profile.unit_id,
          acting_name: unit?.name ?? null,
        },
        loading: false,
      });
    } else {
      set({ user: null, loading: false });
    }
  },
  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null });
    window.location.href = "/login";
  },
}));
