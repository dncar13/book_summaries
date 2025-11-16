import { AdminConsole } from '@/components/admin/AdminConsole';
import { getServiceSupabaseClient } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = getServiceSupabaseClient();
  const { data: runs } = await supabase
    .from('agent_runs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(25);

  const { data: stories } = await supabase
    .from('stories')
    .select('slug,title_en,genre,hook,cover_spec')
    .order('created_at', { ascending: false })
    .limit(50);

  const uncovered = (stories ?? [])
    .filter((story) => !story.cover_spec)
    .map((story) => ({
      slug: story.slug,
      title_en: story.title_en,
      genre: story.genre,
      hook: story.hook
    }));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-bold">Agents Admin</h1>
      <p className="text-sm text-slate-500">
        Enqueue story/cover jobs, monitor agent_runs, and check for missing cover specs.
      </p>
      <div className="mt-8">
        <AdminConsole runs={runs ?? []} uncoveredStories={uncovered} />
      </div>
    </main>
  );
}
