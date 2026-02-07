alter table public.course_user_courses
  add column if not exists level smallint;

comment on column public.course_user_courses.level is '学習レベル(1-5)';
