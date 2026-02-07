-- === USER COURSES (LEARNING PLANS) ===
create table if not exists public.course_user_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  base_course_id text not null,
  goal int not null default 65,
  level smallint,
  mastered_topic_ids jsonb,
  start_topic_id text,
  target_topic_id text,
  target_type text,
  target_name text,
  target_date text,
  weekly_hours int,
  note text,
  electives jsonb,
  is_active boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists course_user_courses_user_id_idx
  on public.course_user_courses (user_id);

create unique index if not exists course_user_courses_active_unique
  on public.course_user_courses (user_id)
  where is_active = true and is_archived = false;

alter table public.course_user_courses enable row level security;

create policy if not exists "course_user_courses select (self)"
on public.course_user_courses for select
to authenticated
using (auth.uid() = user_id);

create policy if not exists "course_user_courses insert (self)"
on public.course_user_courses for insert
to authenticated
with check (auth.uid() = user_id);

create policy if not exists "course_user_courses update (self)"
on public.course_user_courses for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy if not exists "course_user_courses delete (self)"
on public.course_user_courses for delete
to authenticated
using (auth.uid() = user_id);
