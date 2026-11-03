-- Link de primeiro acesso: a pessoa escolhe a própria senha. Guarda só o hash do token,
-- vale 7 dias e uma vez. Só as Edge Functions (service_role) leem e escrevem.
create table if not exists public.access_invites (
  token_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists access_invites_user_idx on public.access_invites(user_id);

alter table public.access_invites enable row level security;
revoke all on public.access_invites from public, anon, authenticated;
grant all on public.access_invites to service_role;
