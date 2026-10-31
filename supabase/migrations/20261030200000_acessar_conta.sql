-- Acessar a conta do cliente: a equipe Checkou manda x-acessar por aba e o banco a trata como aquela empresa.
-- O cabeçalho só vale para admin ou master ativo, sem empresa, e para uma empresa da mesma organização.
create or replace function public.get_my_unit_id()
returns uuid language plpgsql stable security definer set search_path to 'public' as $$
declare
  v_profile public.profiles;
  v_unit text;
begin
  select * into v_profile from public.profiles where id = auth.uid();
  if v_profile.unit_id is not null then
    return v_profile.unit_id;
  end if;
  if not coalesce(v_profile.active, false) or v_profile.role not in ('admin', 'master') then
    return null;
  end if;
  v_unit := nullif(current_setting('request.headers', true), '')::json ->> 'x-acessar';
  if v_unit is null then
    return null;
  end if;
  return (select id from public.units where id::text = v_unit and organization_id = v_profile.organization_id);
end;
$$;
