'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { logEvent } from '@/lib/eventClient';
import type { EventType } from '@/lib/types';

type Props = {
  parts: string[];
  title?: string;
  className?: string;
  slug?: string;
};

export function AudioPlaylist({ parts, title, className, slug }: Props) {
  const [index, setIndex] = useState(0);
  const [isPlaying, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const hasPrev = index > 0;
  const hasNext = index < parts.length - 1;

  const emit = useCallback(
    (type: EventType) => {
      void logEvent(type, slug);
    },
    [slug]
  );

  const play = useCallback(async () => {
    if (!audioRef.current) return;
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      emit('audio_error');
    }
  }, [emit]);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    element.load();
    if (isPlaying) {
      void element
        .play()
        .then(() => {
          setPlaying(true);
        })
        .catch(() => {
          setPlaying(false);
          emit('audio_error');
        });
    }
  }, [index, isPlaying, emit]);

  useEffect(() => {
    const ref = audioRef.current;
    return () => ref?.pause();
  }, []);

  const handlePrev = () => {
    if (!hasPrev) return;
    setIndex((i) => Math.max(i - 1, 0));
    emit('audio_prev');
  };

  const handleNext = () => {
    if (!hasNext) return;
    setIndex((i) => Math.min(i + 1, parts.length - 1));
    emit('audio_next');
  };

  const onEnded = () => {
    emit('audio_end');
    if (hasNext) {
      setIndex((i) => Math.min(i + 1, parts.length - 1));
      emit('audio_next');
    } else {
      setPlaying(false);
    }
  };

  const onError = () => {
    emit('audio_error');
    if (hasNext) {
      setIndex((i) => Math.min(i + 1, parts.length - 1));
      emit('audio_next');
    }
  };

  return (
    <div className={className}>
      {title ? (
        <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {title}
        </p>
      ) : null}
      <audio
        ref={audioRef}
        controls
        preload="metadata"
        className="w-full"
        src={parts[index]}
        onEnded={onEnded}
        onError={onError}
        onPlay={() => {
          setPlaying(true);
          emit('audio_play');
        }}
        onPause={() => {
          setPlaying(false);
          emit('audio_pause');
        }}
      />
      {parts.length > 1 && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!hasPrev}
              className="rounded bg-slate-200 px-3 py-1 text-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:text-white"
            >
              הקודם
            </button>
            <button
              type="button"
              onClick={() => (isPlaying ? pause() : play())}
              className="rounded bg-teal-600 px-3 py-1 font-semibold text-white disabled:opacity-50"
            >
              {isPlaying ? 'הפסק' : 'נגן'}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasNext}
              className="rounded bg-slate-200 px-3 py-1 text-slate-800 disabled:opacity-50 dark:bg-slate-700 dark:text-white"
            >
              הבא
            </button>
          </div>
          <div className="tabular-nums text-slate-600 dark:text-slate-300">
            {index + 1} / {parts.length}
          </div>
        </div>
      )}
    </div>
  );
}
