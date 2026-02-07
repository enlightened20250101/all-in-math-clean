
-- === AUTO PROFILE CREATION ===
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.email, 'user'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- === PROFILE EXTENSIONS ===
alter table public.profiles
  add column if not exists grade text,
  add column if not exists learning_stage text,
  add column if not exists target_level text,
  add column if not exists user_rank text;

-- === REPORTS (ABUSE/MODERATION) ===
create table if not exists public.reports (
  id bigserial primary key,
  target_type text not null,
  target_id text not null,
  reason text not null,
  created_by uuid references auth.users(id) on delete set null,
  status text not null default 'open',
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy if not exists "reports insert (self)"
on public.reports for insert
to authenticated
with check (auth.uid() = created_by);

create policy if not exists "reports read (self)"
on public.reports for select
to authenticated
using (auth.uid() = created_by);

create policy if not exists "reports read (admin)"
on public.reports for select
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.user_rank = 'admin'
  )
);

create policy if not exists "reports update (admin)"
on public.reports for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.user_rank = 'admin'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.user_rank = 'admin'
  )
);

alter table if exists public.groups
add column if not exists color text default 'sky';

create or replace function public.revoke_group_invites(
  p_group_id uuid
) returns void
language plpgsql
security definer
as $$
begin
  update public.group_invites
    set revoked_at = now()
  where group_id = p_group_id
    and revoked_at is null
    and (expires_at is null or expires_at > now());
end;
$$;
