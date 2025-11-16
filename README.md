# LearnFlow

LearnFlow is a production-ready MVP for Hebrew-speaking learners who practice English through original 12–15 minute narrative stories. The UI is fully RTL in Hebrew while all story content stays in English (B1–B2 level). Covers are generated SVGs so no copyrighted art is used.

## Product Highlights
- **Mobile-first RTL UI** – hero, carousel-style feed, onboarding, reader, and about page all tuned for screens ≥360px.
- **Original content** – three ~2k-word summaries with Hebrew TL;DR blocks and procedural SVG covers.
- **Local progression** – onboarding choices, scroll progress, finish state, points, and streaks live in `localStorage`; no auth required.
- **Light gamification** – +1 point for first summary view per day, +10 for finishing, daily mission banner, streak counter.
- **Anonymous analytics** – client-side event helper logs page views, finish events, onboarding steps, and theme toggles to Supabase `events` (insert-only RLS).
- **Dark/light mode** – Hebrew toggle powered by `next-themes`, announced via `aria-live` for screen readers.
- **SEO/meta** – per-route metadata, canonical tags, OG image API that renders the generated cover SVG, sitemap, and robots.txt.

## Tech Stack
- **Next.js 14.2.3 (App Router)** with React Server Components-first approach.
- **TypeScript + Tailwind CSS** (no additional CSS frameworks).
- **Supabase** (Postgres + Storage) with SQL migrations and seed files.
- **next/font** self-hosted Heebo + Inter.
- **next-themes** for persistent dark/light switching.
- **Lucide icons** for minimal client components.

## Project Structure
```
app/                # App Router routes, metadata, OG API, sitemap, robots
components/         # UI building blocks (cards, banners, reader, onboarding, etc.)
data/summaries.ts  # Local fallback + source of truth for Supabase seed
lib/                # Supabase client, hooks, session helpers, typed definitions
scripts/seed.ts     # Optional TS seeder that upserts summaries
supabase/migrations # 001 schema + policies, 002 content seed
```

## Getting Started

### Prerequisites
- Node.js 18+ (tested with Node.js 20)
- npm or pnpm

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/dncar13/book_summaries.git
   cd book_summaries
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   > The project uses `npm` and pins `next@14.2.3` because newer binaries (14.2.33+) crash with `SIGBUS` in certain environments. If you encounter startup issues, ensure you're using exactly version 14.2.3.

3. **Configure environment variables:**
   
   The project is pre-configured to use a shared Supabase database. A `.env` file has been created with the necessary credentials:
   
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://llyunioulzfbgqvmeaxq.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[configured]
   NEXT_PUBLIC_SITE_URL=http://localhost:8080
   SUPABASE_SERVICE_ROLE_KEY=[configured]
   ```
   
   > **Note:** This project shares the same Supabase database as [amiram-5570e405](https://github.com/dncar13/amiram-5570e405). The credentials are already configured in `.env`.

4. **Run dev server:**
   ```bash
   npm run dev -- -p 8080
   ```
   
   The app will be available at [http://localhost:8080](http://localhost:8080)

5. **Verify the setup:**
   - Server should show: `✓ Ready in ~1-2s`
   - Browser should load the Hebrew UI homepage
   - Check browser console for any Supabase connection errors

### Additional Commands

- **Lint/type-check:**
  ```bash
  npm run lint
  npx tsc --noEmit
  ```

- **Production build:**
  ```bash
  npm run build
  npm run start
  ```

### Troubleshooting

#### Server crashes immediately on startup
**Symptom:** Server starts but exits before showing "Ready"

**Solution:** This is caused by Next.js 14.2.33+ having a SIGBUS crash. The project should be pinned to `14.2.3`:
```bash
rm -rf node_modules package-lock.json .next
npm install
npm run dev -- -p 8080
```

#### Port 8080 already in use
```bash
# Kill existing process
pkill -f "next dev"
# Or use a different port
npm run dev -- -p 3000
```

#### Missing Supabase credentials
If you see "Missing required Supabase configuration", verify that `.env` exists and contains the correct values. You can reference `.env.example` for the expected format.

## Supabase Setup

**The database is already configured and shared with the [amiram-5570e405](https://github.com/dncar13/amiram-5570e405) project.**

### Database Structure
The Supabase instance includes:
- `summaries` table - stores the learning stories
- `events` table - anonymous analytics tracking
- RLS policies configured for public read access on summaries

### If you need to set up a new Supabase instance:

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run SQL migrations in order:
   ```bash
   supabase db push             # or run 001_init.sql manually
   psql $SUPABASE_URL < supabase/migrations/002_seed.sql
   psql $SUPABASE_URL < supabase/migrations/003_agents.sql
   ```
   The migrations create tables, policies, and seed initial content from `data/summaries.ts`.

3. Update `.env` with your new credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. Confirm RLS policies:
   - `summaries`: `read_summaries` SELECT policy for anon role
   - `events`: `insert_events` INSERT policy only (no select/update/delete for anon)

5. Optional TS seeder (uses the env vars):
   ```bash
   npm run seed
   ```

## Agents & Parallel Generation
- **Service env** – add `SUPABASE_SERVICE_ROLE_KEY`, `AGENT_BATCH_SIZE` (default `4`), and optional `AGENT_LOOP_DELAY_MS` to `.env`. The service key never ships to the browser; it is only used by `/api/agents/enqueue`, the admin console, and `workers/runner.ts`.
- **Pluggable providers + hedging** – `lib/llm/provider.ts` defines the interface (name, `maxConcurrent`, `callJSON`). `lib/llm/providers/index.ts` registers providers per kind; update this file with your Codex/Cloud provider adapters. `lib/llm/router.ts` fans out the same prompt across providers, validates via Zod, and returns the first success (`Promise.any`). Built-in concurrency control enforces `maxConcurrent` slots per provider.
- **Schemas** – `lib/contentSchemas.ts` exports the `StoryDoc` and `CoverSpec` Zod validators plus TypeScript types. These correspond to the columns in `stories`.
- **Prompts** – `lib/prompts/story.ts` has `storySystem()`/`storyUser()` plus optional outline + per-section prompts for the two-phase flow. `lib/prompts/cover.ts` contains the CoverSpec agent prompt. `lib/prompts/rewriter.ts` is the readability/safety gate used when you need to tame a story. Use these helpers when wiring Codex jobs so the prompt text always matches code.
- **API enqueue** – `/api/agents/enqueue` accepts `{ kind: 'story'|'cover', items: [...] }`. Each row computes a `job_key` (`story:{slug|topic}`) so duplicates are rejected via a partial unique index on open jobs. The route requires the service-role env.
- **Runner** – `workers/runner.ts` is the Cloud Code worker. Run via `npx tsx workers/runner.ts story` or `... cover`. Launch as many windows as needed (e.g. 3× story, 2× cover) to reach 16 in-flight jobs with `AGENT_BATCH_SIZE=4`. The runner pulls jobs with the `take_agent_jobs` RPC, calls `hedgeJSON`, writes `stories`, and updates `agent_runs`. It logs failures and keeps looping forever.
- **Admin UI** – `/admin` (server-rendered) shows the queue, enqueues single stories, and batches “generate covers for uncovered stories.” It uses the service key on the server only. Refresh manually to see new queue snapshots.
- **Two-phase option** – use `storyOutlineUser()` to lock the outline, then parallelize `storySectionUser()` calls per heading. After sections converge, run `storyUser()` once to add TL;DR, vocab, quiz. The prompts live in `lib/prompts/story.ts` so you can copy/paste straight into Codex.
- **Quality gates** – plug the `rewriterSystem()`/`rewriterUser()` prompt into a separate queue kind if readability/moderation fails. You can enqueue rewrite jobs that target the same `job_key` so the uniqueness guard prevents racing.

## Analytics + Gamification
- `lib/eventClient.ts` inserts into `events` with the anon key (insert-only).
- `EventLogger` client component fires `view_home` and `view_summary` when pages mount.
- Theme toggle, onboarding completion, and `Mark as finished` buttons log their respective events.
- `useReadingProgress` manages scroll tracking, finish state, points, streaks, and dispatches a custom `learnflow-rewards` event so the rewards widget updates live.

## Legal & Originality
- All summaries, TL;DR text, and titles are written specifically for LearnFlow; no quotes or explicit book titles.
- Covers are generated at runtime via `GeneratedCover.tsx` using gradients, shapes, and custom typography only.
- README and `/about` remind users that content and covers are original paraphrases.

## Screenshot Descriptions
1. **Home / Feed (mobile)** – Hebrew hero call-to-action, mission banner, rewards widget, and a horizontal carousel of SVG summary cards.
2. **Summary Reader (dark mode)** – cover art, progress bar, font-size controls, English narrative paragraphs, Hebrew TL;DR block, finish/like/share buttons, and local points banner.
3. **Onboarding Flow (desktop)** – two step cards (method overview + pace selector) with RTL copy and rounded radio tiles.

## Manual QA Checklist
- **Home**: RTL layout, hero buttons route correctly, carousel scrolls on mobile, theme toggle persists preference.
- **Onboarding**: two steps render Hebrew instructions, pace selection stores value in `localStorage`, finishing shows completion state.
- **Summary Reader**: progress updates on scroll, font-adjust buttons work, “Mark as finished” disables after click and increments points/streak, TL;DR shows 3–4 Hebrew lines, share button copies URL with UTM when Web Share API unavailable.
- **Gamification**: rewards panel reflects points/streak after finishing; daily banner minutes reflect onboarding pace.
- **Analytics**: check browser network tab for `events` inserts on page load, finish, onboarding, and theme toggles.
- **Accessibility**: keyboard navigation covers cards/buttons, `ThemeToggle` announces changes via `aria-live`, progress bar exposes `aria-valuenow`, contrast meets AA in both themes.
- **Meta**: view source to confirm `<html dir="rtl" lang="he">`, canonical URLs, OG images from `/api/og/[slug]`, and a populated `sitemap.xml` + `robots.txt`.
