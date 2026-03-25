"use client";
import { Card } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const data = [
  { day: "Seg", execucoes: 45, meta: 50 },
  { day: "Ter", execucoes: 52, meta: 50 },
  { day: "Qua", execucoes: 38, meta: 50 },
  { day: "Qui", execucoes: 60, meta: 50 },
  { day: "Sex", execucoes: 55, meta: 50 },
  { day: "Sáb", execucoes: 28, meta: 30 },
  { day: "Dom", execucoes: 12, meta: 20 },
];

export function WeeklyChart() {
  return (
    <Card>
      <h3 className="text-lg font-bold text-navy mb-4">Execuções da Semana</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e7e8e9" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#717786" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#717786" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e7e8e9", fontSize: "12px" }}
          />
          <Bar dataKey="execucoes" fill="#007EF9" radius={[4, 4, 0, 0]} name="Execuções" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
