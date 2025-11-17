import { Buffer } from 'node:buffer';
import { URL } from 'node:url';

export interface ElevenLabsVoiceSettings {
  stability?: number;
  similarityBoost?: number;
  style?: number;
  useSpeakerBoost?: boolean;
}

export interface SynthesizeOptions {
  voiceId?: string;
  modelId?: string;
  voiceSettings?: ElevenLabsVoiceSettings;
  format?: 'mp3' | 'wav';
}

export interface SynthesizePayload {
  text: string;
  voiceId: string;
  modelId?: string;
  format?: 'mp3' | 'wav';
  voiceSettings?: ElevenLabsVoiceSettings;
}

export interface SynthesizeResult {
  clipId?: string;
  voiceId: string;
  buffer: Buffer;
  size: number;
  modelId?: string;
  requestId?: string;
}

export interface ElevenLabsClientConfig {
  apiKey?: string;
  baseUrl?: string;
  defaultVoiceId?: string;
  defaultModelId?: string;
  defaultVoiceSettings?: ElevenLabsVoiceSettings;
}

export interface ElevenLabsErrorShape {
  status?: number;
  message: string;
  body?: unknown;
  retryAfter?: number;
  headers?: Record<string, string>;
}

export class ElevenLabsError extends Error {
  status?: number;
  body?: unknown;
  retryAfter?: number;
  headers?: Record<string, string>;

  constructor(details: ElevenLabsErrorShape) {
    super(details.message);
    this.name = 'ElevenLabsError';
    this.status = details.status;
    this.body = details.body;
    this.retryAfter = details.retryAfter;
    this.headers = details.headers;
  }
}

export class ElevenLabsClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultVoiceId?: string;
  private readonly defaultModelId?: string;
  private readonly defaultVoiceSettings?: ElevenLabsVoiceSettings;

  constructor(config: ElevenLabsClientConfig = {}) {
    const apiKey = config.apiKey ?? process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new ElevenLabsError({
        message: 'Missing ELEVENLABS_API_KEY environment variable.',
      });
    }

    this.apiKey = apiKey;
    this.baseUrl = (config.baseUrl ?? 'https://api.elevenlabs.io').replace(/\/+$/, '');
    this.defaultVoiceId = config.defaultVoiceId;
    this.defaultModelId = config.defaultModelId;
    this.defaultVoiceSettings = config.defaultVoiceSettings;
  }

  async synthesize(text: string, options: SynthesizeOptions = {}): Promise<SynthesizeResult> {
    const voiceId = options.voiceId ?? this.defaultVoiceId;

    if (!voiceId) {
      throw new ElevenLabsError({
        message: 'Voice ID is required for ElevenLabs synthesis.',
      });
    }

    const payload: Record<string, unknown> = {
      text,
      model_id: options.modelId ?? this.defaultModelId ?? 'eleven_monolingual_v1',
      voice_settings: {
        stability: this.defaultVoiceSettings?.stability ?? options.voiceSettings?.stability ?? 0.5,
        similarity_boost:
          this.defaultVoiceSettings?.similarityBoost ??
          options.voiceSettings?.similarityBoost ??
          0.5,
      },
      output_format: options.format ?? 'mp3',
    };

    if (options.voiceSettings?.style !== undefined) {
      payload.voice_settings = {
        ...(payload.voice_settings as Record<string, unknown>),
        style: options.voiceSettings.style,
      };
    }

    if (options.voiceSettings?.useSpeakerBoost !== undefined) {
      payload.voice_settings = {
        ...(payload.voice_settings as Record<string, unknown>),
        use_speaker_boost: options.voiceSettings.useSpeakerBoost,
      };
    }

    const endpoint = new URL(`/v1/text-to-speech/${voiceId}`, this.baseUrl);

    const response = await this.request(endpoint.toString(), {
      method: 'POST',
      headers: {
        Accept: 'audio/mpeg',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      size: buffer.length,
      voiceId,
      modelId: payload.model_id as string | undefined,
      requestId: response.headers.get('x-request-id') ?? undefined,
    };
  }

  async downloadFromHistory(historyItemId: string): Promise<Buffer> {
    if (!historyItemId) {
      throw new ElevenLabsError({
        message: 'historyItemId is required to download audio from ElevenLabs history.',
      });
    }

    const endpoint = new URL(`/v1/history/${historyItemId}/audio`, this.baseUrl);
    const response = await this.request(endpoint.toString(), {
      method: 'GET',
      headers: {
        Accept: 'audio/mpeg',
      },
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async request(input: string, init: RequestInit): Promise<Response> {
    const headers = new Headers(init.headers ?? {});
    headers.set('xi-api-key', this.apiKey);

    const response = await fetch(input, {
      ...init,
      headers,
    });

    if (!response.ok) {
      const retryAfterValue = response.headers.get('retry-after');
      const retryAfter = retryAfterValue ? Number.parseInt(retryAfterValue, 10) : undefined;
      const contentType = response.headers.get('content-type') ?? '';
      let body: unknown = undefined;
      let message = `${response.status} ${response.statusText}`;
      let raw = '';

      try {
        if (contentType.includes('application/json')) {
          body = await response.json();
          const bodyMessage =
            typeof body === 'object' && body && 'detail' in body ? (body as any).detail : undefined;
          if (typeof bodyMessage === 'string') {
            message = bodyMessage;
          }
        } else {
          raw = await response.text();
          if (raw.trim()) {
            message = raw.trim();
          }
        }
      } catch (err) {
        raw = raw || `[unparseable body: ${(err as Error).message}]`;
      }

      const headersRecord: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headersRecord[key.toLowerCase()] = value;
      });

      throw new ElevenLabsError({
        status: response.status,
        message,
        body: body ?? raw,
        retryAfter,
        headers: headersRecord,
      });
    }

    return response;
  }
}

export function createElevenLabsClient(config: ElevenLabsClientConfig = {}): ElevenLabsClient {
  return new ElevenLabsClient(config);
}
