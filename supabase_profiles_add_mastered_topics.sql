-- Add mastered topics to profiles
alter table public.profiles
  add column if not exists mastered_topic_ids text[] default '{}'::text[];

comment on column public.profiles.mastered_topic_ids
  is 'Topic IDs the user has already mastered (global across courses).';
