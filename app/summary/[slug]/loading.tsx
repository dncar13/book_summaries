export default function LoadingSummary() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="h-60 w-full animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
    </div>
  );
}
