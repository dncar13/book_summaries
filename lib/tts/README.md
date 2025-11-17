# Text-to-Speech Integration

מערכת ה-TTS של LearnFlow משתמשת ב-ElevenLabs כאשר קיימים מפתחות מתאימים, ומחליפה אוטומטית ל-Google TTS (דרך `google-tts-api`) כברירת מחדל כדי שנוכל לסנתז כל סיפור ללא מגבלות quota.

## סביבת הפיתוח

```bash
# ElevenLabs (אופציונלי)
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL
ELEVENLABS_MODEL_ID=eleven_monolingual_v1

# יעד אחסון
AUDIO_BUCKET=audio-files
AUDIO_DEST_DIR=listening
```

## שימוש בסיסי

```ts
import { textToSpeech } from '@/lib/tts/text-to-speech';

const { audioUrl, provider, bytes } = await textToSpeech(
  'Hello, welcome to LearnFlow!',
  'welcome-message.mp3'
);

console.log(audioUrl);    // כתובת ציבורית ב-Supabase Storage
console.log(provider);    // 'elevenlabs' או 'google'
console.log(bytes);       // גודל הקובץ
```

הפונקציה מבצעת:
1. ניסיון סינתזה ב-ElevenLabs (אם מוגדר API Key + Voice ID).
2. נפילה ל-Google TTS עם פיצול טקסט לקטעים של עד 200 תווים.
3. העלאה ל-Supabase Storage לנתיב `${AUDIO_DEST_DIR}/${filename}` עם `upsert: true`.
4. החזרה של כתובת ציבורית לשימוש ב-UI.

## מחולל אודיו לסיפורים

```bash
npx tsx scripts/generate-story-audio.ts deliberate-focus-horizon
npx tsx scripts/generate-story-audio.ts all --force
```

הסקריפט טוען סיפורים מ-Supabase (`stories.slug`, `body_en`, `audio_url`), מפעיל את מנוע ה-TTS, מעלה את ה-MP3 ל-`AUDIO_BUCKET/AUDIO_DEST_DIR`, ומעדכן את העמודה `audio_url`. אם Supabase אינו נגיש, הוא נופל לנתונים המקומיים ב-`data/summaries.ts` (ללא עדכון DB).

## Fallback + פיצול טקסט

- `lib/tts/google.ts` מכיל את `splitIntoChunks` שמעדיף גבולות משפטים ומוודא גודל מקסימלי של 200 תווים.
- כל קטע נשלח ל-`google-tts-api.getAudioBase64`, עם עד 3 ניסיונות לכל קטע ועיכוב ביניהם.
- `Buffer.concat` מאחד את כל הקטעים לקובץ MP3 אחד לפני ההעלאה.

## קבצים רלוונטיים

- `lib/tts/elevenlabs-client.ts` – לקוח ElevenLabs עם טיפול בשגיאות 401/402.
- `lib/tts/google.ts` – מחלק טקסט ומייצר Buffer מ-Google TTS.
- `lib/tts/text-to-speech.ts` – עטיפה אחת שמחליטה על ספק הקול ומעלה ל-Supabase.
- `scripts/generate-story-audio.ts` – CLI לגנרציה המונית של אודיו לסיפורים.
