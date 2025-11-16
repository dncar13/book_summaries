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
1. Install dependencies (pnpm recommended, npm works):
   ```bash
   npm install
   ```
2. Copy `.env.example` → `.env` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)
3. Run dev server:
   ```bash
   npm run dev -- -p 8080
   ```
4. Lint/type-check:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```
5. Production build:
   ```bash
   npm run build
   npm run start
   ```

> **Note:** The project pins `next@14.2.3` because newer binaries crash (`SIGBUS`) in this environment. Keep that version unless you verify a newer one locally.

## Supabase Setup
1. Create a Supabase project.
2. Run SQL migrations in order:
   ```bash
   supabase db push             # or run 001_init.sql manually
   psql $SUPABASE_URL < supabase/migrations/002_seed.sql
   ```
   The second file mirrors `data/summaries.ts`, so database and local fallback stay in sync.
3. Confirm RLS:
   - `summaries`: `read_summaries` SELECT policy for anon.
   - `events`: `insert_events` INSERT policy only; revoke select/update/delete for anon, grant insert.
4. Optional TS seeder (uses the same env vars):
   ```bash
   npm run seed
   ```

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
