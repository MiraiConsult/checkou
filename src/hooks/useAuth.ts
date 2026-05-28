"use client";
import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

interface UserProfile {
  id: string;
  name: string;
  role: "master" | "admin" | "operator";
  email: string;
  avatar_url: string | null;
  organization_id: string;
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
      .select("id, full_name, role, email, avatar_url, organization_id")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      set({
        user: {
          id: profile.id,
          name: profile.full_name,
          role: profile.role as "master" | "admin" | "operator",
          email: profile.email,
          avatar_url: profile.avatar_url,
          organization_id: profile.organization_id,
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
