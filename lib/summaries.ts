import { cache } from 'react';
import { getSupabaseClient } from './supabase';
import { summaries as localSummaries } from '@/data/summaries';
import type { Summary } from './types';

const FALLBACK_SUMMARIES = localSummaries;

export const getSummaries = cache(async (): Promise<Summary[]> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return FALLBACK_SUMMARIES;
  }

  const { data, error } = await supabase.from('summaries').select('*').order('created_at', { ascending: false });
  if (error || !data || data.length === 0) {
    return FALLBACK_SUMMARIES;
  }
  return data as Summary[];
});

export const getSummaryBySlug = cache(async (slug: string): Promise<Summary | null> => {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return FALLBACK_SUMMARIES.find((summary) => summary.slug === slug) ?? null;
  }

  const { data, error } = await supabase.from('summaries').select('*').eq('slug', slug).single();
  if (error || !data) {
    return FALLBACK_SUMMARIES.find((summary) => summary.slug === slug) ?? null;
  }
  return data as Summary;
});
