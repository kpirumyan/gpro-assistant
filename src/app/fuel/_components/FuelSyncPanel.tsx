"use client";

import { useRaceSync } from "./useRaceSync";

import { SyncConfirmPrompt } from "./SyncConfirmPrompt";
import { SyncProgressBar } from "./SyncProgressBar";
import { SyncStatusAlert } from "./SyncStatusAlert";

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

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
    step,
    error,
    message,
    missingRaces,
    progress,
    isBackward,
    overwrite,
    setOverwrite,
    handlePrepare,
    handleStartSync,
    handleCancel,
    handleCancelConfirm,
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

          <form action={handlePrepare} className="flex flex-col gap-4">
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

            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="overwriteExisting"
                checked={overwrite}
                onChange={(e) => setOverwrite(e.target.checked)}
                disabled={step !== "idle" && step !== "confirm"}
                className="size-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-50"
              />
              <label htmlFor="overwriteExisting" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Overwrite existing data
              </label>
            </div>

            {isBackward && (
              <div className="text-sm text-red-600 dark:text-red-400">
                Invalid range: &quot;To&quot; race must be after &quot;From&quot; race.
              </div>
            )}

            {(step === "idle" || step === "preparing" || step === "confirm") && (
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
            )}
          </form>

          {step === "confirm" && (
            <SyncConfirmPrompt
              raceCount={missingRaces.length}
              onConfirm={handleStartSync}
              onCancel={handleCancelConfirm}
            />
          )}

          {step === "syncing" && (
            <SyncProgressBar
              progress={progress}
              total={missingRaces.length}
              onCancel={handleCancel}
            />
          )}

          <SyncStatusAlert error={error} message={message} isIdle={step === "idle"} />
        </div>
      </section>
    </div>
  );
}
