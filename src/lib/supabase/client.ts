import { createBrowserClient } from "@supabase/ssr";
import { accessedUnit } from "@/lib/impersonation";

export function createClient() {
  const unitId = accessedUnit();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    unitId ? { global: { headers: { "x-acessar": unitId } } } : undefined
  );
}
