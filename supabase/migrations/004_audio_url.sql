-- Add audio_url column to stories for pre-generated TTS assets
alter table public.stories add column if not exists audio_url text;
