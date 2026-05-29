import { createClient } from "@/lib/supabase/client";

export async function logActivity(params: {
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
}) {
  const supabase = createClient();
  await supabase.from("activity_logs").insert({
    organization_id: params.organizationId,
    user_id: params.userId,
    user_name: params.userName,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId || null,
    description: params.description,
  });
}
