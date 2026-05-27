"use client";

import { useActionState } from "react";
import Link from "next/link";
import { syncCarData, type SyncCarState } from "@/app/car/actions";
import { StatBar } from "@/components/StatBar";

type CarPartData = {
  name: string;
  level: number;
  wear: number;
};

type CarPanelProps = {
  parts: CarPartData[];
};

export function CarPanel({ parts }: CarPanelProps) {
  const [state, formAction, isPending] = useActionState<SyncCarState, FormData>(
    syncCarData,
    {}
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Car
          </h2>
          {parts.length > 0 && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {parts.length} components loaded
            </p>
          )}
        </div>
        <form action={formAction}>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20"
          >
            {isPending ? (
              <>
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Syncing…
              </>
            ) : (
              <>
                <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Sync
              </>
            )}
          </button>
        </form>
      </div>

      {state?.error === "AUTH_ERROR" ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
        >
          Invalid or expired API token. Please update your API key in <Link href="/settings" className="font-semibold underline hover:text-red-800 dark:hover:text-red-300">Settings</Link>.
        </div>
      ) : state?.error && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
        >
          {state.error}
        </div>
      )}

      {state?.message && (
        <div
          role="status"
          className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
        >
          {state.message}
        </div>
      )}

      {parts.length > 0 ? (
        <div className="mt-6 space-y-5">
          {parts.map((part) => (
            <div
              key={part.name}
              className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
            >
              <h3 className="mb-3 text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {part.name}
              </h3>
              <div className="space-y-2">
                <StatBar label="Level" value={part.level} min={1} max={9} />
                <StatBar label="Wear" value={part.wear} min={0} max={100} unit="%" invertColors />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <svg className="size-12 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H6.75m11.25 0h2.625c.621 0 1.125-.504 1.125-1.125v-4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v4.875c0 .621.504 1.125 1.125 1.125" />
          </svg>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            No car data yet. Click <strong>Sync</strong> to load from the GPRO API.
          </p>
        </div>
      )}
    </section>
  );
}
