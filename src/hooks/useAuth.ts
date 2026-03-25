"use client";
import { create } from "zustand";

interface AuthState {
  user: { id: string; name: string; role: "master" | "admin" | "operator"; email: string; avatar_url: string | null } | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: {
    id: "1",
    name: "Carlos Silva",
    role: "admin",
    email: "carlos@empresa.com",
    avatar_url: null,
  },
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
