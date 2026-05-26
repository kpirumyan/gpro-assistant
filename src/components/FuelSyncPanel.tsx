"use client";

import { useActionState } from "react";
import Link from "next/link";
import { syncRacesData, type SyncRacesState } from "@/app/fuel/actions";
import type { FuelAnalyticsListEntry } from "@/lib/db/queries";

type FuelSyncPanelProps = {
  data: FuelAnalyticsListEntry[];
};

export function FuelSyncPanel({ data }: FuelSyncPanelProps) {
  const [state, formAction, isPending] = useActionState<SyncRacesState, FormData>(
    syncRacesData,
    {}
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sync Race History
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Download telemetry and parse fuel usage ranges from GPRO API.
            </p>
          </div>
          <form action={formAction}>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20"
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
                  Sync Fuel Data
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
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Fuel Consumption Analytics</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Calculated fuel usage ranges from your synced race history.</p>
        </div>

        {data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-950/20 text-xs font-semibold text-zinc-500 uppercase tracking-wider dark:text-zinc-400">
                  <th className="px-6 py-4">Race</th>
                  <th className="px-6 py-4">Group</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Laps</th>
                  <th className="px-6 py-4">Fast Laps</th>
                  <th className="px-6 py-4">Est. Consumption (L/lap)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 text-sm">
                {data.map((entry) => {
                  const label = entry.type === "stint" ? `Stint ${entry.stintIndex}` : "Full Race";
                  const minStr = parseFloat(entry.avgFuelPerLapMin).toFixed(3);
                  const maxStr = parseFloat(entry.avgFuelPerLapMax).toFixed(3);
                  return (
                    <tr 
                      key={entry.id} 
                      className={`hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 ${
                        entry.type === "full_race" ? "bg-zinc-50/30 dark:bg-zinc-900/20 font-medium" : ""
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">
                        S{entry.season} R{entry.race}
                      </td>
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-400">{entry.group}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          entry.type === "full_race" 
                            ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-400/10 dark:text-indigo-400"
                            : "bg-zinc-50 text-zinc-600 ring-1 ring-inset ring-zinc-500/10 dark:bg-zinc-400/10 dark:text-zinc-400"
                        }`}>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{entry.lapsAnalyzed}</td>
                      <td className="px-6 py-4 text-zinc-600 dark:text-zinc-300">{entry.fastLapsCount}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-zinc-900 dark:text-zinc-100">
                          {minStr === maxStr ? `${minStr}` : `${minStr} - ${maxStr}`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="size-12 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              No fuel analytics data yet. Click <strong>Sync Fuel Data</strong> above to load and calculate consumption.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
