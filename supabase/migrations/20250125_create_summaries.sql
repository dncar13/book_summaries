-- Create summaries table
create table if not exists public.summaries (
  id bigint primary key generated always as identity,
  slug text unique not null,
  title_en text not null,
  author_en text not null,
  minutes_estimated integer not null,
  category_he text not null,
  cover_svg text not null,
  tldr_he text not null,
  body_en text not null,
  created_at timestamp with time zone default now() not null
);

-- Add audio columns for TTS integration
alter table public.summaries 
  add column if not exists audio_url text,
  add column if not exists audio_parts jsonb;

-- Enable RLS
alter table public.summaries enable row level security;

-- Drop existing policy if exists
drop policy if exists "Allow public read access" on public.summaries;

-- Create policy for public read access
create policy "Allow public read access" on public.summaries
  for select
  to public
  using (true);

-- Grant permissions
grant select on public.summaries to anon;
grant select on public.summaries to authenticated;
