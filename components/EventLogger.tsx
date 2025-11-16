'use client';

import { useEffect } from 'react';
import { logEvent } from '@/lib/eventClient';
import type { EventType } from '@/lib/types';

interface EventLoggerProps {
  eventType: EventType;
  summarySlug?: string;
}

export function EventLogger({ eventType, summarySlug }: EventLoggerProps) {
  useEffect(() => {
    logEvent(eventType, summarySlug);
  }, [eventType, summarySlug]);

  return null;
}
