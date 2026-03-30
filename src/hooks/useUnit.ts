"use client";
import { create } from "zustand";

export interface UnitData {
  id: string;
  label: string;
  conformidade: number;
  conformidadeTrend: string;
  checklistsHoje: { done: number; total: number };
  tarefasAbertas: number;
  tarefasAtrasadas: number;
  tarefasNoPrazo: number;
  aprovacoesPendentes: number;
  areas: { name: string; value: number; color: "tertiary" | "primary" | "warning" | "error" }[];
  execucoes: { id: number; checklist: string; operator: string; initials: string; score: number; status: string; date: string }[];
}

const units: Record<string, UnitData> = {
  empresa: {
    id: "empresa",
    label: "Empresa Alfa",
    conformidade: 88,
    conformidadeTrend: "+2.4%",
    checklistsHoje: { done: 24, total: 30 },
    tarefasAbertas: 12,
    tarefasAtrasadas: 4,
    tarefasNoPrazo: 8,
    aprovacoesPendentes: 5,
    areas: [
      { name: "Cozinha", value: 92, color: "tertiary" },
      { name: "Salão", value: 85, color: "primary" },
      { name: "Banheiros", value: 70, color: "warning" },
      { name: "Estoque", value: 88, color: "primary" },
      { name: "Recepção", value: 95, color: "tertiary" },
    ],
    execucoes: [
      { id: 1, checklist: "Abertura de Loja", operator: "Ana Lima", initials: "AL", score: 95, status: "approved", date: "23 Mar, 09:30" },
      { id: 2, checklist: "Higienização Cozinha", operator: "João Santos", initials: "JS", score: 82, status: "completed", date: "23 Mar, 08:15" },
      { id: 3, checklist: "Segurança Noturna", operator: "Maria Costa", initials: "MC", score: 68, status: "rejected", date: "22 Mar, 22:00" },
      { id: 4, checklist: "Controle Temperatura", operator: "Pedro Alves", initials: "PA", score: 91, status: "approved", date: "22 Mar, 14:20" },
      { id: 5, checklist: "Limpeza Banheiros", operator: "Carla Nunes", initials: "CN", score: 77, status: "completed", date: "22 Mar, 11:45" },
    ],
  },
  grupo: {
    id: "grupo",
    label: "Grupo Beta",
    conformidade: 74,
    conformidadeTrend: "-1.2%",
    checklistsHoje: { done: 18, total: 25 },
    tarefasAbertas: 22,
    tarefasAtrasadas: 9,
    tarefasNoPrazo: 13,
    aprovacoesPendentes: 11,
    areas: [
      { name: "Cozinha", value: 78, color: "primary" },
      { name: "Salão", value: 65, color: "warning" },
      { name: "Banheiros", value: 58, color: "error" },
      { name: "Estoque", value: 82, color: "primary" },
      { name: "Recepção", value: 71, color: "warning" },
    ],
    execucoes: [
      { id: 1, checklist: "Abertura de Loja", operator: "Ricardo Mendes", initials: "RM", score: 72, status: "completed", date: "23 Mar, 10:00" },
      { id: 2, checklist: "Controle Temperatura", operator: "Fernanda Souza", initials: "FS", score: 65, status: "rejected", date: "23 Mar, 07:45" },
      { id: 3, checklist: "Inventário Semanal", operator: "Bruno Dias", initials: "BD", score: 88, status: "approved", date: "22 Mar, 15:30" },
      { id: 4, checklist: "Segurança Noturna", operator: "Camila Rocha", initials: "CR", score: 55, status: "rejected", date: "22 Mar, 21:00" },
      { id: 5, checklist: "Higienização Cozinha", operator: "Ricardo Mendes", initials: "RM", score: 78, status: "completed", date: "21 Mar, 09:15" },
    ],
  },
  unidade: {
    id: "unidade",
    label: "Unidade Sul",
    conformidade: 93,
    conformidadeTrend: "+4.1%",
    checklistsHoje: { done: 9, total: 10 },
    tarefasAbertas: 5,
    tarefasAtrasadas: 1,
    tarefasNoPrazo: 4,
    aprovacoesPendentes: 2,
    areas: [
      { name: "Cozinha", value: 97, color: "tertiary" },
      { name: "Salão", value: 94, color: "tertiary" },
      { name: "Banheiros", value: 88, color: "primary" },
      { name: "Estoque", value: 91, color: "tertiary" },
      { name: "Recepção", value: 98, color: "tertiary" },
    ],
    execucoes: [
      { id: 1, checklist: "Abertura de Loja", operator: "Tatiana Alves", initials: "TA", score: 98, status: "approved", date: "23 Mar, 08:00" },
      { id: 2, checklist: "Higienização Cozinha", operator: "Diego Martins", initials: "DM", score: 95, status: "approved", date: "23 Mar, 07:30" },
      { id: 3, checklist: "Controle Temperatura", operator: "Tatiana Alves", initials: "TA", score: 92, status: "approved", date: "22 Mar, 14:00" },
      { id: 4, checklist: "Segurança Noturna", operator: "Rafael Lima", initials: "RL", score: 85, status: "completed", date: "22 Mar, 22:30" },
      { id: 5, checklist: "Limpeza Banheiros", operator: "Diego Martins", initials: "DM", score: 90, status: "completed", date: "22 Mar, 10:00" },
    ],
  },
};

interface UnitStore {
  activeUnit: string;
  setActiveUnit: (unit: string) => void;
  getUnitData: () => UnitData;
}

export const useUnit = create<UnitStore>((set, get) => ({
  activeUnit: "empresa",
  setActiveUnit: (unit) => set({ activeUnit: unit }),
  getUnitData: () => units[get().activeUnit] || units.empresa,
}));

export const unitTabs = [
  { label: "Empresa Alfa", id: "empresa" },
  { label: "Grupo Beta", id: "grupo" },
  { label: "Unidade Sul", id: "unidade" },
];
