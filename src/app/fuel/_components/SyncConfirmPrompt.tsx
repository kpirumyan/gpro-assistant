"use client";

type SyncConfirmPromptProps = {
  raceCount: number;
  onConfirm: () => void;
  onCancel: () => void;
};

export function SyncConfirmPrompt({ raceCount, onConfirm, onCancel }: SyncConfirmPromptProps) {
  return (
    <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
      <p className="text-sm text-blue-800 dark:text-blue-300">
        You are about to sync <strong>{raceCount}</strong> missing races. This will consume {raceCount} API credits.
      </p>
      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onConfirm}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
        >
          Confirm Sync
        </button>
        <button
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
