import 'dotenv/config';
import googleTTSImport from 'google-tts-api';

const MAX_GOOGLE_CHARS = 200;
const googleTTS = (googleTTSImport as any).default ?? googleTTSImport;
const GOOGLE_HOST = process.env.GOOGLE_TTS_HOST || 'https://translate.google.com';

type ProviderOptions = {
  lang: string;
  slow: boolean;
};

/**
 * Split text into <=200 char chunks, preferring sentence boundaries.
 */
export function splitIntoChunks(text: string, maxLength = MAX_GOOGLE_CHARS): string[] {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return [];
  }

  const sentences =
    normalized.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g)?.map((sentence) => sentence.trim()) ??
    [normalized];

  const chunks: string[] = [];
  let current = '';

  const pushCurrent = () => {
    if (current.trim()) {
      chunks.push(current.trim());
      current = '';
    }
  };

  const flushLongSentence = (sentence: string) => {
    const words = sentence.split(/\s+/);
    let chunk = '';

    for (const word of words) {
      if (!word) continue;
      const attempt = chunk ? `${chunk} ${word}` : word;
      if (attempt.length > maxLength) {
        if (chunk) {
          chunks.push(chunk);
          chunk = '';
        }

        if (word.length > maxLength) {
          let index = 0;
          while (index < word.length) {
            chunks.push(word.slice(index, index + maxLength));
            index += maxLength;
          }
        } else {
          chunk = word;
        }
      } else {
        chunk = attempt;
      }
    }

    if (chunk) {
      chunks.push(chunk);
    }
  };

  for (const sentence of sentences) {
    if (!sentence) continue;
    const candidate = current ? `${current} ${sentence}` : sentence;

    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current) {
      pushCurrent();
    }

    if (sentence.length <= maxLength) {
      current = sentence;
      continue;
    }

    flushLongSentence(sentence);
  }

  pushCurrent();

  return chunks;
}

if (process.env.NODE_ENV !== 'production') {
  const sanityText = Array.from({ length: 20 })
    .map((_, idx) => `Sentence ${idx + 1} keeps chunk sizes predictable.`)
    .join(' ');
  const sanityChunks = splitIntoChunks(sanityText);
  for (const chunk of sanityChunks) {
    console.assert(
      chunk.length <= MAX_GOOGLE_CHARS,
      `splitIntoChunks produced chunk > ${MAX_GOOGLE_CHARS} (${chunk.length})`
    );
  }
}

async function synthesizeChunk(
  chunk: string,
  options: ProviderOptions,
  attempt = 0
): Promise<Buffer> {
  const maxAttempts = 3;

  try {
    const base64 = await googleTTS.getAudioBase64(chunk, {
      lang: options.lang,
      slow: options.slow,
      host: GOOGLE_HOST,
      timeout: 10000,
    });

    if (!base64) {
      throw new Error('Empty audio response from google-tts-api');
    }

    return Buffer.from(base64, 'base64');
  } catch (error) {
    if (attempt >= maxAttempts - 1) {
      throw error;
    }

    const delayMs = 200 * (attempt + 1);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return synthesizeChunk(chunk, options, attempt + 1);
  }
}

export async function synthesizeWithGoogleTTS(
  text: string,
  lang = 'en',
  slow = false
): Promise<Buffer> {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    throw new Error('Cannot synthesize empty text.');
  }

  const chunks = splitIntoChunks(normalized);
  if (!chunks.length) {
    throw new Error('Failed to split text for Google TTS synthesis.');
  }

  const buffers: Buffer[] = [];
  for (const chunk of chunks) {
    const buffer = await synthesizeChunk(chunk, { lang, slow });
    buffers.push(buffer);
  }

  return Buffer.concat(buffers);
}
