-- O Auth grava app_metadata só depois do insert em auth.users, então o trigger não o enxerga.
-- A Edge Function admin-users registra o convite aqui antes de criar a conta; sem convite, o cadastro é recusado.

create table if not exists public.pending_users (
  email text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role text not null,
  sector text not null,
  unit_id uuid references public.units(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.pending_users enable row level security;
revoke all on public.pending_users from public, anon, authenticated;
grant all on public.pending_users to service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_pending public.pending_users;
begin
  delete from public.pending_users where email = lower(new.email) returning * into v_pending;
  if v_pending.email is null then
    raise exception 'Cadastro público desativado';
  end if;
  insert into public.profiles (id, organization_id, full_name, email, role, sector, unit_id)
  values (new.id, v_pending.organization_id, v_pending.full_name, new.email, v_pending.role, v_pending.sector, v_pending.unit_id);
  return new;
end;
$$;
