import { Section, VocabItem, QuizItem } from './contentSchemas';
import type { StoryDocT, CoverSpecT } from './contentSchemas';
import type { z } from 'zod';

export type Summary = {
  id: string;
  slug: string;
  title_en: string;
  author_en: string;
  minutes_estimated: number;
  category_he: string;
  cover_svg: string;
  tldr_he: string;
  body_en: string;
  created_at?: string | null;
  cover_seed?: string | null;
  audio_url?: string | null;
  audio_parts?: string[] | null;
};

export type WordGlossaryEntry = {
  base: string;
  forms: string[];
  translationHe: string;
};

export type StoryLevel = StoryDocT['level'];

export type StorySection = z.infer<typeof Section>;
export type StoryVocabEntry = z.infer<typeof VocabItem>;
export type StoryQuizQuestion = z.infer<typeof QuizItem>;
export type CoverSpec = CoverSpecT;
export type StoryDoc = StoryDocT;

export type StoryRow = StoryDoc & {
  id: string;
  cover_spec: CoverSpec | null;
  cover_svg: string | null;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  audio_url?: string | null;
  audio_parts?: string[] | null;
};

export type EventType =
  | 'view_home'
  | 'view_summary'
  | 'finish_summary'
  | 'toggle_theme'
  | 'start_onboarding'
  | 'finish_onboarding'
  | 'audio_play'
  | 'audio_pause'
  | 'audio_next'
  | 'audio_prev'
  | 'audio_end'
  | 'audio_error';

export type SummaryRow = Summary & { created_at: string | null };

export type EventRow = {
  id: number;
  event_type: EventType;
  summary_slug: string | null;
  client_session_id: string;
  ts: string | null;
};

export type AgentRunKind = 'story' | 'cover';
export type AgentRunStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export type AgentRunRow = {
  id: string;
  kind: AgentRunKind;
  status: AgentRunStatus;
  job_key: string | null;
  input: Record<string, unknown>;
  output: Record<string, unknown> | null;
  error: string | null;
  metrics: Record<string, unknown> | null;
  created_at: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export type Database = {
  public: {
    Tables: {
      summaries: {
        Row: SummaryRow;
        Insert: Omit<SummaryRow, 'id'> & { id?: string };
        Update: Partial<SummaryRow>;
        Relationships: [];
      };
      stories: {
        Row: StoryRow;
        Insert: Omit<StoryRow, 'id' | 'created_at' | 'updated_at' | 'cover_spec' | 'cover_svg' | 'published_at'> & {
          id?: string;
          cover_spec?: CoverSpec | null;
          cover_svg?: string | null;
          published_at?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<StoryRow>;
        Relationships: [];
      };
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, 'id' | 'ts'> & { ts?: string | null };
        Update: Partial<EventRow>;
        Relationships: [];
      };
      agent_runs: {
        Row: AgentRunRow;
        Insert: Omit<AgentRunRow, 'id' | 'output' | 'error' | 'metrics' | 'started_at' | 'finished_at' | 'created_at'> & {
          id?: string;
          output?: AgentRunRow['output'];
          error?: string | null;
          metrics?: AgentRunRow['metrics'];
          started_at?: string | null;
          finished_at?: string | null;
          created_at?: string | null;
        };
        Update: Partial<AgentRunRow>;
        Relationships: [];
      };
    };
    Views: {
      agent_open_jobs: {
        Row: AgentRunRow;
        Relationships: [];
      };
    };
    Functions: {
      take_agent_jobs: {
        Args: { p_kind: AgentRunKind; p_limit: number };
        Returns: AgentRunRow[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
