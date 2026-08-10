-- Run this once in Supabase Dashboard → SQL Editor.
create table if not exists public.daylight_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.daylight_profiles enable row level security;

create policy "Users can read only their own Daylight data"
on public.daylight_profiles for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create only their own Daylight data"
on public.daylight_profiles for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update only their own Daylight data"
on public.daylight_profiles for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
