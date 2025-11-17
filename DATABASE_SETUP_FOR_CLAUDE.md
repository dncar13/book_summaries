# הגדרת Database - מידע עבור Claude Code + MCP

## 🎯 המטרה
יצירת טבלת `summaries` במסד הנתונים Supabase עם עמודות TTS (audio_url, audio_parts)

## 📊 מצב נוכחי - Database State

### Supabase Instance
- **URL**: `https://llyunioulzfbgqvmeaxq.supabase.co`
- **Project Ref**: `llyunioulzfbgqvmeaxq`
- **Database משותף**: שני פרויקטים משתמשים באותו database:
  - `book_summaries` (פרויקט זה)
  - `amiram-5570e405` (פרויקט אחר)

### טבלאות קיימות במסד
```
profiles (auth related)
questions
listening_questions
```

### טבלאות חסרות ❌
```
summaries - לא קיימת!
events - לא קיימת!
```

## 🔑 Credentials

מיקום: `/home/daniel_pogodin/book_summaries/.env`

```bash
NEXT_PUBLIC_SUPABASE_URL=https://llyunioulzfbgqvmeaxq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseXVuaW91bHpmYmdxdm1lYXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMTc0MTksImV4cCI6MjA2NTU5MzQxOX0.11tR97IIeYJez9h8-JqgolQTKh-pLpxT6eevHcV9z7I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseXVuaW91bHpmYmdxdm1lYXhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDAxNzQxOSwiZXhwIjoyMDY1NTkzNDE5fQ.vJIwW5tBQws8tA3F2jojd2sROVgZ6Scq605GzeUZ2nc
```

## 📝 SQL לביצוע

הקובץ: `/home/daniel_pogodin/book_summaries/supabase/migrations/20250125_create_summaries.sql`

```sql
-- Create summaries table
create table if not exists public.summaries (
  id bigint primary key generated always as identity,
  slug text unique not null,
  title_en text not null,
  author_en text not null,
  minutes_estimated integer not null,
  category_he text not null,
  cover_svg text not null,
  tldr_he text not null,
  body_en text not null,
  created_at timestamp with time zone default now() not null
);

-- Add audio columns for TTS integration
alter table public.summaries 
  add column if not exists audio_url text,
  add column if not exists audio_parts jsonb;

-- Enable RLS
alter table public.summaries enable row level security;

-- Drop existing policy if exists
drop policy if exists "Allow public read access" on public.summaries;

-- Create policy for public read access
create policy "Allow public read access" on public.summaries
  for select
  to public
  using (true);

-- Grant permissions
grant select on public.summaries to anon;
grant select on public.summaries to authenticated;
```

## 🛠️ כלים זמינים

### 1. Supabase CLI (מותקן)
```bash
# נמצא ב:
/home/daniel_pogodin/.supabase/bin/supabase

# הפרויקט כבר מקושר:
supabase link --project-ref llyunioulzfbgqvmeaxq  # ✅ זה כבר נעשה
```

### 2. Node.js Scripts
```bash
# דוגמה לבדיקה אחרי יצירת הטבלה:
cd /home/daniel_pogodin/book_summaries
node scripts/check-tables.cjs
```

## ❌ מה ניסינו וכשל

### 1. supabase db push
```bash
supabase db push --include-all
```
**בעיה**: המסד מכיל 140+ migrations מפרויקט אמירם שלא קיימים מקומית. CLI מסרב להריץ.

### 2. supabase db pull
```bash
supabase db pull
```
**בעיה**: אותה בעיה - conflict עם migrations.

### 3. Node.js Direct SQL Execution
```javascript
await supabase.rpc('exec', { sql_query: sql })
```
**בעיה**: הפונקציה `exec` לא קיימת ב-database.

### 4. REST API
```javascript
fetch(`${url}/rest/v1/rpc/exec_sql`, {...})
```
**בעיה**: Endpoint לא קיים (404).

## ✅ פתרונות אפשריים

### אופציה 1: Supabase SQL Editor (Manual)
1. לך ל: https://llyunioulzfbgqvmeaxq.supabase.co/project/llyunioulzfbgqvmeaxq/sql
2. הדבק את ה-SQL מהקובץ `20250125_create_summaries.sql`
3. לחץ RUN

### אופציה 2: MCP + PostgreSQL Connection
**זה מה שאנחנו רוצים שתעשה!**

אם ל-MCP יש יכולת להתחבר ישירות ל-PostgreSQL:
- צריך connection string (שנראה כך): `postgresql://postgres:[PASSWORD]@db.llyunioulzfbgqvmeaxq.supabase.co:5432/postgres`
- הסיסמה לא נמצאת ב-.env, תצטרך לשאול את המשתמש או למצוא דרך לקבל אותה

### אופציה 3: Supabase Management API
אם יש access ל-Management API:
```bash
curl -X POST 'https://api.supabase.com/v1/projects/{ref}/database/query' \
  -H "Authorization: Bearer {SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"query": "CREATE TABLE..."}'
```

## 🔍 אימות אחרי יצירה

הרץ את זה כדי לוודא שהטבלה נוצרה:

```javascript
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  // Check if table exists
  const { data, error } = await supabase
    .from('summaries')
    .select('id, audio_url, audio_parts')
    .limit(1);
  
  if (error) {
    console.log('❌ Summaries table does not exist:', error.message);
  } else {
    console.log('✅ Summaries table exists with audio columns!');
  }
})();
```

## 📦 TTS Integration (כבר מוכן!)

אחרי שהטבלה תיוצר, מערכת ה-TTS מוכנה:
- `lib/tts/text-to-speech.ts` - Main TTS wrapper
- `lib/tts/elevenlabs-client.ts` - ElevenLabs API
- Google TTS כ-fallback
- Supabase Storage: `audio-files/listening/` bucket

דוגמת שימוש:
```typescript
import { textToSpeech } from '@/lib/tts/text-to-speech';

const result = await textToSpeech({
  text: 'Hello world',
  filename: 'test.mp3'
});

// result.url → https://...supabase.co/storage/v1/object/public/audio-files/listening/test.mp3

// Update database:
await supabase
  .from('summaries')
  .update({ audio_url: result.url })
  .eq('slug', 'some-book');
```

## 🎬 Next Steps אחרי יצירת הטבלה

1. ✅ אמת שהטבלה קיימת (`scripts/check-tables.cjs`)
2. 📝 הוסף data לטבלה (אם יש summaries קיימים)
3. 🔊 הרץ TTS generation על summaries (`scripts/generate-summary-audio.ts`)
4. 🌐 בדוק שהאתר עובד עם הטבלה החדשה

## 💡 שאלות למשתמש (אם צריך)

1. האם יש DATABASE_URL או PostgreSQL connection string?
2. האם יש גישה ל-Supabase Management API token?
3. האם אתה יכול להיכנס ל-Supabase Dashboard ולהריץ SQL ידנית?
4. האם יש data קיים של summaries שצריך להעביר מאיפשהו?

## 🔧 MCP Tools שעשויים לעזור

אם יש לך access ל:
- PostgreSQL MCP server → התחבר ישירות למסד
- Supabase MCP tool → השתמש ב-Management API
- Database migration tool → הרץ את ה-migration

---

**סיכום**: צריך להריץ את ה-SQL מ-`supabase/migrations/20250125_create_summaries.sql` ב-database. CLI רגיל לא עובד בגלל conflicts עם פרויקט אמירם. MCP עם גישה ישירה ל-PostgreSQL או Management API יוכל לעשות את זה.
