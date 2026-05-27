"use client";

import Link from "next/link";
import { useRaceSync } from "./useRaceSync";

type FuelSyncPanelProps = {
  latestSyncedRace: { season: number; race: number } | null;
};

export function FuelSyncPanel({ latestSyncedRace }: FuelSyncPanelProps) {
  const {
    syncMode, setSyncMode,
    fromSeason, setFromSeason,
    fromRace, setFromRace,
    toSeason, setToSeason,
    toRace, setToRace,
    step, setStep,
    error,
    message,
    missingRaces, setMissingRaces,
    progress,
    isBackward,
    handlePrepare,
    handleStartSync,
    handleCancel
  } = useRaceSync(latestSyncedRace);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sync Race History
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Download telemetry and parse fuel usage ranges from GPRO API.
            </p>
          </div>

          <form onSubmit={handlePrepare} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="radio"
                  name="syncMode"
                  value="single"
                  checked={syncMode === "single"}
                  onChange={() => setSyncMode("single")}
                  disabled={step !== "idle" && step !== "confirm"}
                  className="text-zinc-900 focus:ring-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-50"
                />
                Single Race
              </label>
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                <input
                  type="radio"
                  name="syncMode"
                  value="range"
                  checked={syncMode === "range"}
                  onChange={() => setSyncMode("range")}
                  disabled={step !== "idle" && step !== "confirm"}
                  className="text-zinc-900 focus:ring-zinc-900 dark:text-zinc-50 dark:focus:ring-zinc-50"
                />
                Range
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Season</label>
                <input
                  aria-label="Season"
                  type="number"
                  min="1"
                  value={fromSeason}
                  onChange={(e) => setFromSeason(parseInt(e.target.value) || 1)}
                  disabled={step !== "idle" && step !== "confirm"}
                  className="w-20 rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Race</label>
                <input
                  aria-label="Race"
                  type="number"
                  min="1"
                  max="17"
                  value={fromRace}
                  onChange={(e) => setFromRace(parseInt(e.target.value) || 1)}
                  disabled={step !== "idle" && step !== "confirm"}
                  className="w-20 rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              </div>

              {syncMode === "range" && (
                <>
                  <span className="text-zinc-400">to</span>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Season</label>
                    <input
                      aria-label="To Season"
                      type="number"
                      min="1"
                      value={toSeason}
                      onChange={(e) => setToSeason(parseInt(e.target.value) || 1)}
                      disabled={step !== "idle" && step !== "confirm"}
                      className="w-20 rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Race</label>
                    <input
                      aria-label="To Race"
                      type="number"
                      min="1"
                      max="17"
                      value={toRace}
                      onChange={(e) => setToRace(parseInt(e.target.value) || 1)}
                      disabled={step !== "idle" && step !== "confirm"}
                      className="w-20 rounded-md border border-zinc-300 px-3 py-1.5 text-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </>
              )}
            </div>

            {isBackward && (
              <div className="text-sm text-red-600 dark:text-red-400">
                Invalid range: &quot;To&quot; race must be after &quot;From&quot; race.
              </div>
            )}

            {step === "idle" || step === "preparing" || step === "confirm" ? (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-2">
                <button
                  type="submit"
                  disabled={step === "preparing" || isBackward || step === "confirm"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20"
                >
                  {step === "preparing" ? (
                    <>
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Preparing...
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
              </div>
            ) : null}
          </form>

          {step === "confirm" && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/50 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                You are about to sync <strong>{missingRaces.length}</strong> missing races. This will consume {missingRaces.length} API credits.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={handleStartSync}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                >
                  Confirm Sync
                </button>
                <button
                  onClick={() => { setStep("idle"); setMissingRaces([]); }}
                  className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {step === "syncing" && (
            <div className="mt-4 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Syncing {progress} / {missingRaces.length} races...
                </span>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {Math.round((progress / missingRaces.length) * 100)}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
                <div
                  className="h-full bg-zinc-900 transition-all duration-300 dark:bg-zinc-50"
                  style={{ width: `${(progress / missingRaces.length) * 100}%` }}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-600/20 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  Cancel Sync
                </button>
              </div>
            </div>
          )}

          {error === "AUTH_ERROR" ? (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
            >
              Invalid or expired API token. Please update your API key in <Link href="/settings" className="font-semibold underline hover:text-red-800 dark:hover:text-red-300">Settings</Link>.
            </div>
          ) : error && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
            >
              {error}
            </div>
          )}

          {message && step === "idle" && (
            <div
              role="status"
              className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
            >
              {message}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
