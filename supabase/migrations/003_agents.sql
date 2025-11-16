create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title_en text not null,
  level text not null check (level in ('B1','B2')),
  reading_minutes int not null check (reading_minutes between 10 and 20),
  genre text not null,
  hook text not null,
  tldr_he text not null,
  body_en text not null,
  sections jsonb not null check (jsonb_typeof(sections) = 'array'),
  vocab jsonb not null check (jsonb_typeof(vocab) = 'array'),
  quiz jsonb not null check (jsonb_typeof(quiz) = 'array'),
  topics jsonb not null check (jsonb_typeof(topics) = 'array'),
  cover_spec jsonb,
  cover_svg text,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.stories enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'stories' and policyname = 'read_stories'
  ) then
    create policy "read_stories" on public.stories for select using (true);
  end if;
end $$;

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('story','cover')),
  status text not null default 'queued' check (status in ('queued','running','succeeded','failed')),
  job_key text,
  input jsonb not null,
  output jsonb,
  error text,
  metrics jsonb,
  created_at timestamptz default now(),
  started_at timestamptz,
  finished_at timestamptz
);

alter table public.agent_runs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where tablename = 'agent_runs' and policyname = 'service_only_agent_runs'
  ) then
    create policy "service_only_agent_runs"
      on public.agent_runs
      for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;

create index if not exists agent_runs_status_idx on public.agent_runs (status);
create index if not exists agent_runs_kind_idx on public.agent_runs (kind);
create index if not exists agent_runs_job_key_idx on public.agent_runs (job_key);
create unique index if not exists agent_runs_unique_open_job on public.agent_runs (job_key)
  where job_key is not null and status in ('queued','running');

create or replace view public.agent_open_jobs as
  select *
  from public.agent_runs
  where status in ('queued','running');

create or replace function public.take_agent_jobs(p_kind text, p_limit int)
returns setof public.agent_runs
language sql
security definer
set search_path = public
as $$
  update public.agent_runs
  set status = 'running',
      started_at = now()
  where id in (
    select id
    from public.agent_runs
    where kind = p_kind
      and status = 'queued'
    order by created_at
    for update skip locked
    limit p_limit
  )
  returning *;
$$;

grant execute on function public.take_agent_jobs(text, int) to service_role;
