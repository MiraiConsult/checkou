"use client";
import { create } from "zustand";

interface TaskState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useTasks = create<TaskState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
