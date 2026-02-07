alter table public.course_user_courses
  add column if not exists mastered_topic_ids jsonb;

comment on column public.course_user_courses.mastered_topic_ids is '学習済みトピックID一覧';
