export const SESSION_STORAGE_KEY = 'learnflow_session_id';

export const ONBOARDING_STORAGE_KEY = 'learnflow_onboarding';
export const PROGRESS_STORAGE_KEY = 'learnflow_progress';
export const FINISHED_STORAGE_KEY = 'learnflow_finished';
export const POINTS_STORAGE_KEY = 'learnflow_points';
export const STREAK_STORAGE_KEY = 'learnflow_streak';
export const LAST_FINISH_STORAGE_KEY = 'learnflow_last_finish';

export const PACE_STORAGE_KEY = 'learnflow_pace';
export const DAILY_VIEW_STORAGE_KEY = 'learnflow_daily_view';

export function getBrowserSafeWindow(): Window | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window;
}

export function ensureSessionId(): string | null {
  const win = getBrowserSafeWindow();
  if (!win) return null;
  let sessionId = win.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    win.localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  return sessionId;
}
