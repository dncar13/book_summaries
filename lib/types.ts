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
};

export type EventType =
  | 'view_home'
  | 'view_summary'
  | 'finish_summary'
  | 'toggle_theme'
  | 'start_onboarding'
  | 'finish_onboarding';

export type SummaryRow = Summary & { created_at: string | null };

export type EventRow = {
  id: number;
  event_type: EventType;
  summary_slug: string | null;
  client_session_id: string;
  ts: string | null;
};

export type Database = {
  public: {
    Tables: {
      summaries: {
        Row: SummaryRow;
        Insert: Omit<SummaryRow, 'id'> & { id?: string };
        Update: Partial<SummaryRow>;
      };
      events: {
        Row: EventRow;
        Insert: Omit<EventRow, 'id' | 'ts'> & { ts?: string | null };
        Update: Partial<EventRow>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
