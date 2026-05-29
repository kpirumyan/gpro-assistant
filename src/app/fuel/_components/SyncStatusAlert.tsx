"use client";

import Link from "next/link";

type SyncStatusAlertProps = {
  error: string | null;
  message: string | null;
  isIdle: boolean;
};

export function SyncStatusAlert({ error, message, isIdle }: SyncStatusAlertProps) {
  if (error === "AUTH_ERROR") {
    return (
      <div
        role="alert"
        className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
      >
        Invalid or expired API token. Please update your API key in{" "}
        <Link href="/settings" className="font-semibold underline hover:text-red-800 dark:hover:text-red-300">
          Settings
        </Link>
        .
      </div>
    );
  }

  if (error) {
    return (
      <div
        role="alert"
        className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
      >
        {error}
      </div>
    );
  }

  if (message && isIdle) {
    return (
      <div
        role="status"
        className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
      >
        {message}
      </div>
    );
  }

  return null;
}
