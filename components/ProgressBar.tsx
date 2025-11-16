interface ProgressBarProps {
  value: number;
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, value));

  return (
    <div className="space-y-1" aria-label={label ?? 'התקדמות קריאה'}>
      {label ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      ) : null}
      <div
        className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        aria-label={label ?? 'התקדמות קריאה'}
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-brand-violet to-brand-teal transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
