import 'dotenv/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createElevenLabsClient, ElevenLabsError } from './elevenlabs-client';
import { synthesizeWithGoogleTTS } from './google';
import type { Database } from '@/lib/types';

export type ProviderName = 'elevenlabs' | 'google';
type PreferredProvider = 'auto' | ProviderName;

const AUDIO_BUCKET = process.env.AUDIO_BUCKET || 'audio-files';
const AUDIO_DEST_DIR = process.env.AUDIO_DEST_DIR || 'listening';

let supabase: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
    }

    supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  }

  return supabase;
}

async function synthesizeWithElevenLabs(text: string): Promise<Buffer> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  const client = createElevenLabsClient({
    defaultVoiceId: voiceId,
    defaultModelId: process.env.ELEVENLABS_MODEL_ID || 'eleven_monolingual_v1',
  });

  const result = await client.synthesize(text, {
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.5,
    },
  });

  return result.buffer;
}

function elevenLabsEnvConfigured() {
  return Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID);
}

export type TextToSpeechResponse = {
  audioUrl: string;
  provider: ProviderName;
  bytes: number;
};

export type TextToSpeechOptions = {
  storagePath?: string;
  preferredProvider?: PreferredProvider;
};

export async function textToSpeech(
  text: string,
  filename: string,
  options: TextToSpeechOptions = {}
): Promise<TextToSpeechResponse> {
  let buffer: Buffer;
  let provider: ProviderName = 'google';
  const preference = options.preferredProvider ?? 'auto';

  const useElevenLabs =
    preference === 'elevenlabs' || (preference === 'auto' && elevenLabsEnvConfigured());

  if (preference === 'google') {
    buffer = await synthesizeWithGoogleTTS(text);
  } else if (useElevenLabs) {
    try {
      buffer = await synthesizeWithElevenLabs(text);
      provider = 'elevenlabs';
    } catch (error) {
      const err = error as Error;
      const status = error instanceof ElevenLabsError ? error.status : undefined;
      const reason = status === 401 || status === 402 ? 'auth/quota' : 'provider error';
      console.warn(`[tts] ElevenLabs failed (${reason}), using Google TTS fallback:`, err.message);
      buffer = await synthesizeWithGoogleTTS(text);
      provider = 'google';
    }
  } else {
    buffer = await synthesizeWithGoogleTTS(text);
  }

  const storagePath = options.storagePath ?? `${AUDIO_DEST_DIR}/${filename}`;
  const client = getSupabaseClient();

  const { error: uploadError } = await client.storage.from(AUDIO_BUCKET).upload(storagePath, buffer, {
    contentType: 'audio/mpeg',
    cacheControl: '31536000',
    upsert: true,
  });

  if (uploadError) {
    throw new Error(`Supabase upload failed: ${uploadError.message}`);
  }

  const { data } = client.storage.from(AUDIO_BUCKET).getPublicUrl(storagePath);

  return {
    audioUrl: data.publicUrl,
    provider,
    bytes: buffer.length,
  };
}
