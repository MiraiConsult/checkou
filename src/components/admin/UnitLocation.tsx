"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";
import { inputClass, type AdminUnit } from "@/lib/admin";

export function UnitLocation({ unit }: { unit: AdminUnit }) {
  const [coords, setCoords] = useState(unit.latitude != null ? `${unit.latitude}, ${unit.longitude}` : "");
  const [radius, setRadius] = useState(unit.radius_m ?? 200);
  const [status, setStatus] = useState("");

  const useCurrent = () => {
    setStatus("");
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),
      () => setStatus("Não foi possível obter a localização. Verifique a permissão do navegador."),
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const save = async () => {
    const match = coords.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/);
    const latitude = match ? Number(match[1]) : null;
    const longitude = match ? Number(match[2]) : null;
    if (coords.trim() && (latitude === null || longitude === null || Math.abs(latitude) > 90 || Math.abs(longitude) > 180)) {
      setStatus("Use o formato -29.123456, -51.123456");
      return;
    }
    const { error } = await createClient().from("units").update({ latitude, longitude, radius_m: radius || 200 }).eq("id", unit.id);
    setStatus(error ? "Não foi possível salvar a localização." : "Localização salva");
  };

  return (
    <Card>
      <h3 className="text-sm font-bold text-navy mb-1">Localização da empresa</h3>
      <p className="text-xs text-on-surface-variant mb-4">Usada para conferir se a pessoa estava no local ao enviar o checklist.</p>
      <div className="flex flex-col gap-2">
        <input type="text" value={coords} onChange={(e) => setCoords(e.target.value)} placeholder="Coordenadas: -29.123456, -51.123456" className={inputClass} />
        <div className="flex gap-2">
          <input type="number" min={20} value={radius} onChange={(e) => setRadius(parseInt(e.target.value) || 0)} aria-label="Raio em metros" className={cn(inputClass, "w-28")} />
          <Button variant="outline" className="flex-1" onClick={useCurrent}>Usar a minha</Button>
          <Button variant="primary" onClick={save}>Salvar</Button>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant mt-2">{status || "O número é o raio em metros. No Google Maps, clique com o botão direito no restaurante para copiar as coordenadas."}</p>
    </Card>
  );
}
