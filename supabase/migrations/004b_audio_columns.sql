do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'summaries'
  ) then
    alter table public.summaries add column if not exists audio_url text;
    alter table public.summaries add column if not exists audio_parts jsonb;
  end if;

  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'stories'
  ) then
    alter table public.stories add column if not exists audio_url text;
    alter table public.stories add column if not exists audio_parts jsonb;
  end if;
end $$;
