'use client';

import { useMemo, useState } from 'react';
import type { AgentRunRow, StoryLevel } from '@/lib/types';

type CoverCandidate = {
  slug: string;
  title_en: string;
  genre: string;
  hook: string;
};

type Props = {
  runs: AgentRunRow[];
  uncoveredStories: CoverCandidate[];
};

type StoryFormState = {
  topic: string;
  level: StoryLevel;
  minutes: number;
  genre: string;
};

const defaultStoryForm: StoryFormState = {
  topic: '',
  level: 'B1',
  minutes: 15,
  genre: ''
};

export function AdminConsole({ runs, uncoveredStories }: Props) {
  const [storyForm, setStoryForm] = useState<StoryFormState>(defaultStoryForm);
  const [isSubmitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    return runs.reduce(
      (acc, run) => {
        acc[run.status] = (acc[run.status] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [runs]);

  async function postJSON(payload: any) {
    const res = await fetch('/api/agents/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? 'Failed to enqueue');
    }
    return res.json();
  }

  async function handleStorySubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      if (!storyForm.topic.trim()) {
        throw new Error('Topic is required');
      }
      await postJSON({
        kind: 'story',
        items: [
          {
            topic: storyForm.topic.trim(),
            level: storyForm.level,
            minutes: storyForm.minutes,
            genre: storyForm.genre.trim() || undefined
          }
        ]
      });
      setFeedback('Story job enqueued');
      setStoryForm(defaultStoryForm);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCoverBatch() {
    if (!uncoveredStories.length) {
      setFeedback('No uncovered stories found');
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      await postJSON({
        kind: 'cover',
        items: uncoveredStories.map((story) => ({
          slug: story.slug,
          title_en: story.title_en,
          genre: story.genre,
          hook: story.hook
        }))
      });
      setFeedback(`${uncoveredStories.length} cover jobs enqueued`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : String(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Generate Story</h2>
        <p className="text-sm text-slate-500">Single enqueue helper for manual prompts.</p>
        <form onSubmit={handleStorySubmit} className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium">
            Topic
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-base"
              value={storyForm.topic}
              onChange={(e) => setStoryForm((prev) => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g. Solar-powered art school in Eilat"
            />
          </label>
          <label className="text-sm font-medium">
            Genre
            <input
              type="text"
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-base"
              value={storyForm.genre}
              onChange={(e) => setStoryForm((prev) => ({ ...prev, genre: e.target.value }))}
              placeholder="general fiction"
            />
          </label>
          <label className="text-sm font-medium">
            Level
            <select
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-base"
              value={storyForm.level}
              onChange={(e) => setStoryForm((prev) => ({ ...prev, level: e.target.value as StoryLevel }))}
            >
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Minutes
            <input
              type="number"
              min={10}
              max={20}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-base"
              value={storyForm.minutes}
              onChange={(e) => setStoryForm((prev) => ({ ...prev, minutes: Number(e.target.value) }))}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60"
              disabled={isSubmitting}
            >
              Enqueue story
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Generate Covers</h2>
            <p className="text-sm text-slate-500">
              {uncoveredStories.length
                ? `${uncoveredStories.length} stories still need specs`
                : 'All stories already have cover specs.'}
            </p>
          </div>
          <button
            type="button"
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold disabled:opacity-60"
            onClick={handleCoverBatch}
            disabled={isSubmitting || uncoveredStories.length === 0}
          >
            Enqueue missing covers
          </button>
        </div>
        {uncoveredStories.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {uncoveredStories.slice(0, 10).map((story) => (
              <li key={story.slug} className="rounded border border-dashed border-slate-200 p-2">
                <span className="font-medium">{story.title_en}</span>
                <span className="text-slate-500"> · {story.genre}</span>
              </li>
            ))}
            {uncoveredStories.length > 10 && (
              <li className="text-slate-500">and {uncoveredStories.length - 10} more…</li>
            )}
          </ul>
        )}
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Agent Runs</h2>
            <p className="text-sm text-slate-500">Recent 25 jobs with live status.</p>
          </div>
          <div className="flex gap-3 text-sm text-slate-600">
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status}>
                {status}: <strong>{count}</strong>
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="text-slate-500">
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Kind</th>
                <th className="px-2 py-1">Status</th>
                <th className="px-2 py-1">Job Key</th>
                <th className="px-2 py-1">Created</th>
                <th className="px-2 py-1">Error</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <tr key={run.id} className="border-t border-slate-100">
                  <td className="px-2 py-1 font-mono text-xs">{run.id.slice(0, 8)}</td>
                  <td className="px-2 py-1">{run.kind}</td>
                  <td className="px-2 py-1">{run.status}</td>
                  <td className="px-2 py-1 font-mono text-xs">{run.job_key}</td>
                  <td className="px-2 py-1 text-slate-500">
                    {run.created_at ? new Date(run.created_at).toLocaleTimeString() : '—'}
                  </td>
                  <td className="px-2 py-1 text-rose-500">{run.error ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {feedback && <div className="rounded bg-slate-900 px-4 py-3 text-sm text-white">{feedback}</div>}
      <p className="text-center text-sm text-slate-500">
        Refresh the page to pull the latest queue snapshot.
      </p>
    </div>
  );
}
