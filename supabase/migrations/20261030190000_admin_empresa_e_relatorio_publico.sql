-- Admin do cliente com checklists por pessoa, horários no relatório e link público com comentários.

alter table public.profiles add column if not exists checklist_ids uuid[] not null default '{}';
alter table public.pending_users add column if not exists checklist_ids uuid[] not null default '{}';
alter table public.checklist_executions add column if not exists public_token uuid unique;

-- Ponto da empresa para conferir se a pessoa estava no local ao enviar o checklist
alter table public.units
  add column if not exists latitude double precision,
  add column if not exists longitude double precision,
  add column if not exists radius_m integer not null default 200;

create table if not exists public.execution_comments (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.checklist_executions(id) on delete cascade,
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists execution_comments_execution_idx on public.execution_comments(execution_id, created_at);

-- Comentários só passam pelas funções abaixo, que exigem o link
alter table public.execution_comments enable row level security;
revoke all on public.execution_comments from public, anon, authenticated;
grant all on public.execution_comments to service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_pending public.pending_users;
begin
  delete from public.pending_users where email = lower(new.email) returning * into v_pending;
  if v_pending.email is null then
    raise exception 'Cadastro público desativado';
  end if;
  insert into public.profiles (id, organization_id, full_name, email, role, sector, unit_id, checklist_ids)
  values (new.id, v_pending.organization_id, v_pending.full_name, new.email, v_pending.role, v_pending.sector, v_pending.unit_id, v_pending.checklist_ids);
  return new;
end;
$$;

create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
    new.role is distinct from old.role
    or new.organization_id is distinct from old.organization_id
    or new.unit_id is distinct from old.unit_id
    or new.sector is distinct from old.sector
    or new.active is distinct from old.active
    or new.email is distinct from old.email
    or new.checklist_ids is distinct from old.checklist_ids
  ) then
    raise exception 'Alteração permitida apenas pelo Admin';
  end if;
  return new;
end;
$$;

-- Lista vazia: a pessoa vê todos os checklists da empresa
create or replace function public.get_my_checklist_ids()
returns uuid[] language sql stable security definer set search_path to 'public' as $$
  select checklist_ids from public.profiles where id = auth.uid()
$$;

revoke execute on function public.get_my_checklist_ids() from public, anon;
grant execute on function public.get_my_checklist_ids() to authenticated, service_role;

drop policy if exists templates_select on public.checklist_templates;
create policy templates_select on public.checklist_templates for select using (
  organization_id = public.get_my_org_id()
  and (
    public.get_my_unit_id() is null
    or (
      status = 'published' and public.get_my_unit_id() = any(unit_ids)
      and (public.is_my_role_admin() or cardinality(public.get_my_checklist_ids()) = 0 or id = any(public.get_my_checklist_ids()))
    )
  )
);

create or replace function public.set_execution_share(p_id uuid, p_enabled boolean)
returns uuid language plpgsql security definer set search_path to 'public' as $$
declare
  v_token uuid;
begin
  if not public.is_my_role_admin() or not exists(
    select 1 from public.checklist_executions e where e.id = p_id and public.execution_visible(e.template_id, e.unit_id)
  ) then
    raise exception 'Acesso negado';
  end if;
  update public.checklist_executions
    set public_token = case when p_enabled then coalesce(public_token, gen_random_uuid()) end
    where id = p_id
    returning public_token into v_token;
  return v_token;
end;
$$;

revoke execute on function public.set_execution_share(uuid, boolean) from public, anon;
grant execute on function public.set_execution_share(uuid, boolean) to authenticated, service_role;

create or replace function public.get_public_report(p_token uuid)
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select jsonb_build_object(
    'score', e.score, 'status', e.status, 'started_at', e.started_at, 'completed_at', e.completed_at,
    'responses', e.responses, 'geolocation', e.geolocation,
    'template_name', t.name, 'sections', t.sections,
    'operator_name', p.full_name, 'unit_name', u.name,
    'unit_location', case when u.latitude is not null then jsonb_build_object('lat', u.latitude, 'lng', u.longitude, 'radius_m', u.radius_m) end,
    'comments', coalesce((
      select jsonb_agg(jsonb_build_object('id', c.id, 'author_name', c.author_name, 'body', c.body, 'created_at', c.created_at) order by c.created_at)
      from public.execution_comments c where c.execution_id = e.id
    ), '[]'::jsonb)
  )
  from public.checklist_executions e
  join public.checklist_templates t on t.id = e.template_id
  left join public.profiles p on p.id = e.operator_id
  left join public.units u on u.id = e.unit_id
  where e.public_token = p_token
$$;

create or replace function public.add_public_comment(p_token uuid, p_author text, p_body text)
returns void language plpgsql security definer set search_path to 'public' as $$
declare
  v_execution uuid;
begin
  select id into v_execution from public.checklist_executions where public_token = p_token;
  if v_execution is null then
    raise exception 'Link inválido';
  end if;
  if length(trim(p_author)) not between 1 and 80 or length(trim(p_body)) not between 1 and 2000 then
    raise exception 'Comentário inválido';
  end if;
  if (select count(*) from public.execution_comments where execution_id = v_execution) >= 500 then
    raise exception 'Limite de comentários atingido';
  end if;
  insert into public.execution_comments (execution_id, author_name, body) values (v_execution, trim(p_author), trim(p_body));
end;
$$;

revoke execute on function public.get_public_report(uuid), public.add_public_comment(uuid, text, text) from public;
grant execute on function public.get_public_report(uuid), public.add_public_comment(uuid, text, text) to anon, authenticated, service_role;
