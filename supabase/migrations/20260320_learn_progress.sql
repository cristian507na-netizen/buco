-- Buco Aprende: tabla de progreso de lecciones
create table if not exists public.learn_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  module_id text not null,
  chapter_id text not null,
  completed boolean default false,
  completed_at timestamptz,
  reading_time_seconds integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, module_id, chapter_id)
);

alter table public.learn_progress enable row level security;

create policy "Users can manage their own learn progress"
  on public.learn_progress
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
