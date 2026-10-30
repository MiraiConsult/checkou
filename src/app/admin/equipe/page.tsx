"use client";

import { useCallback, useEffect, useState } from "react";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { useAuth, isStaff } from "@/hooks/useAuth";
import { fetchAdminData, type AdminUnit, type AdminUser } from "@/lib/admin";

export default function AdminTeamPage() {
  const { user } = useAuth();
  const staff = isStaff(user);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [units, setUnits] = useState<AdminUnit[]>([]);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    fetchAdminData().then((data) => {
      setError(data.error || "");
      setUsers(data.users);
      setUnits(data.units);
    });
  }, []);

  useEffect(() => {
    if (!staff) return;
    fetchAdminData().then((data) => {
      setError(data.error || "");
      setUsers(data.users);
      setUnits(data.units);
    });
  }, [staff]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-navy tracking-tight">Equipe Checkou</h2>
        <p className="text-sm text-on-surface-variant mt-1">Quem está aqui vê todas as empresas</p>
      </div>
      {error && <p className="text-sm text-error font-medium">{error}</p>}
      <UsersPanel unitId={null} users={users} units={units} templates={[]} onChange={load} />
    </div>
  );
}
