-- Empresas (units) com checklists e usuários próprios, galeria opcional e fechamento de acessos.
-- Usuário sem unit_id é da equipe Checkou e vê tudo; com unit_id, só a própria empresa.

alter table public.checklist_templates
  add column if not exists unit_ids uuid[] not null default '{}',
  add column if not exists allow_gallery boolean not null default false;

alter table public.profiles
  add column if not exists unit_id uuid references public.units(id) on delete restrict,
  add column if not exists active boolean not null default true;

create index if not exists profiles_unit_id_idx on public.profiles(unit_id);
create index if not exists checklist_templates_unit_ids_idx on public.checklist_templates using gin(unit_ids);

-- Usuário desativado perde o acesso na hora, sem esperar o token expirar
create or replace function public.get_my_org_id()
returns uuid language sql stable security definer set search_path to 'public' as $$
  select organization_id from public.profiles where id = auth.uid() and active
$$;

create or replace function public.get_my_unit_id()
returns uuid language sql stable security definer set search_path to 'public' as $$
  select unit_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_my_role_admin()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and active and role in ('admin', 'master'))
$$;

create or replace function public.is_platform_staff()
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists(select 1 from public.profiles where id = auth.uid() and active and role in ('admin', 'master') and unit_id is null)
$$;

create or replace function public.execution_visible(p_template_id uuid, p_unit_id uuid)
returns boolean language sql stable security definer set search_path to 'public' as $$
  select exists(select 1 from public.checklist_templates t where t.id = p_template_id and t.organization_id = public.get_my_org_id())
    and (public.get_my_unit_id() is null or p_unit_id = public.get_my_unit_id())
$$;

revoke execute on function public.get_my_org_id(), public.get_my_unit_id(), public.is_my_role_admin(),
  public.is_platform_staff(), public.execution_visible(uuid, uuid) from public, anon;
grant execute on function public.get_my_org_id(), public.get_my_unit_id(), public.is_my_role_admin(),
  public.is_platform_staff(), public.execution_visible(uuid, uuid) to authenticated, service_role;

-- Conta nova só nasce pelo Admin: app_metadata é o único campo que o usuário não controla
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  v_org uuid := (new.raw_app_meta_data ->> 'organization_id')::uuid;
begin
  if v_org is null then
    raise exception 'Cadastro público desativado';
  end if;
  insert into public.profiles (id, organization_id, full_name, email, role, sector, unit_id)
  values (
    new.id, v_org,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_app_meta_data ->> 'role', 'operator'),
    coalesce(new.raw_app_meta_data ->> 'sector', 'geral'),
    (new.raw_app_meta_data ->> 'unit_id')::uuid
  );
  return new;
end;
$$;

-- O próprio usuário não pode mudar função, empresa, setor ou status
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
  ) then
    raise exception 'Alteração permitida apenas pelo Admin';
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- profiles
drop policy if exists profiles_insert on public.profiles;
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select using (
  id = auth.uid()
  or (organization_id = public.get_my_org_id() and (public.get_my_unit_id() is null or unit_id = public.get_my_unit_id()))
);

-- organizations
drop policy if exists org_update on public.organizations;
create policy org_update on public.organizations for update
  using (id = public.get_my_org_id() and public.is_platform_staff());

-- units
drop policy if exists units_all on public.units;
create policy units_select on public.units for select using (
  organization_id = public.get_my_org_id() and (public.get_my_unit_id() is null or id = public.get_my_unit_id())
);
create policy units_write on public.units for all
  using (organization_id = public.get_my_org_id() and public.is_platform_staff())
  with check (organization_id = public.get_my_org_id() and public.is_platform_staff());

-- checklist_templates
drop policy if exists templates_all on public.checklist_templates;
create policy templates_select on public.checklist_templates for select using (
  organization_id = public.get_my_org_id()
  and (public.get_my_unit_id() is null or (status = 'published' and public.get_my_unit_id() = any(unit_ids)))
);
create policy templates_write on public.checklist_templates for all
  using (organization_id = public.get_my_org_id() and public.is_platform_staff())
  with check (organization_id = public.get_my_org_id() and public.is_platform_staff());

-- checklist_executions
drop policy if exists exec_all on public.checklist_executions;
create policy exec_select on public.checklist_executions for select
  using (public.execution_visible(template_id, unit_id));
create policy exec_insert on public.checklist_executions for insert
  with check (operator_id = auth.uid() and public.execution_visible(template_id, unit_id));
create policy exec_update on public.checklist_executions for update
  using (public.execution_visible(template_id, unit_id) and public.is_my_role_admin());
create policy exec_delete on public.checklist_executions for delete
  using (public.execution_visible(template_id, unit_id) and public.is_platform_staff());

-- tasks
drop policy if exists tasks_all on public.tasks;
create policy tasks_all on public.tasks for all
  using (organization_id = public.get_my_org_id() and (public.get_my_unit_id() is null or unit_id = public.get_my_unit_id()))
  with check (organization_id = public.get_my_org_id() and (public.get_my_unit_id() is null or unit_id = public.get_my_unit_id()));

-- alert_configs e activity_logs ficam com a equipe
drop policy if exists alerts_all on public.alert_configs;
create policy alerts_all on public.alert_configs for all
  using (organization_id = public.get_my_org_id() and public.is_platform_staff())
  with check (organization_id = public.get_my_org_id() and public.is_platform_staff());

drop policy if exists activity_select on public.activity_logs;
create policy activity_select on public.activity_logs for select
  using (organization_id = public.get_my_org_id() and public.is_platform_staff());

-- Foto de evidência só com login
drop policy if exists "Anyone can upload evidence" on storage.objects;
create policy "Authenticated can upload evidence" on storage.objects for insert to authenticated
  with check (bucket_id = 'evidence');
