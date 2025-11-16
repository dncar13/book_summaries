create extension if not exists "pgcrypto";

create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  author_en text not null,
  minutes_estimated int not null check (minutes_estimated between 12 and 15),
  category_he text not null,
  cover_svg text not null,
  tldr_he text not null,
  body_en text not null,
  created_at timestamptz default now()
);

create table if not exists public.events (
  id bigserial primary key,
  event_type text not null check (event_type in (
    'view_home','view_summary','finish_summary','toggle_theme','start_onboarding','finish_onboarding'
  )),
  summary_slug text,
  client_session_id text not null,
  ts timestamptz default now()
);

alter table public.summaries enable row level security;
alter table public.events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'summaries' and policyname = 'read_summaries'
  ) then
    create policy "read_summaries" on public.summaries for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies where tablename = 'events' and policyname = 'insert_events'
  ) then
    create policy "insert_events" on public.events for insert with check (true);
  end if;
end $$;

revoke select, update, delete on public.events from anon;
grant insert on public.events to anon;
