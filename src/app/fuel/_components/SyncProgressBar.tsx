"use client";

type SyncProgressBarProps = {
  progress: number;
  total: number;
  onCancel: () => void;
};

export function SyncProgressBar({ progress, total, onCancel }: SyncProgressBarProps) {
  const percent = Math.round((progress / total) * 100);
  return (
    <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Syncing {progress} / {total} races...
        </span>
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {percent}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-50"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-4 flex justify-end">
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
        >
          Cancel Sync
        </button>
      </div>
    </div>
  );
}
