"use client";
import { create } from "zustand";

interface ChecklistState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useChecklists = create<ChecklistState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
