export type UserRole = "master" | "admin" | "operator";

export interface Organization {
  id: string;
  name: string;
  plan: "professional" | "enterprise" | "enterprise_plus";
  created_at: string;
}

export interface Unit {
  id: string;
  organization_id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Profile {
  id: string;
  organization_id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}
