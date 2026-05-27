"use client";

import { useActionState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { syncDriverData, type SyncDriverState } from "@/app/driver/actions";
import { StatBar } from "@/components/StatBar";

const ClientDate = dynamic(() => import("@/components/ClientDate").then((mod) => mod.ClientDate), { ssr: false });

type DriverData = {
  name: string;
  overall: number;
  concentration: number;
  talent: number;
  aggression: number;
  experience: number;
  technicalInsight: number;
  stamina: number;
  charisma: number;
  motivation: number;
  reputation: number;
  weight: number;
  age: number;
  energy: number;
  updatedAt: Date;
};

type DriverPanelProps = {
  data: DriverData | null;
};

const SKILL_FIELDS = [
  { key: "overall", label: "Overall", min: 0, max: 250 },
  { key: "concentration", label: "Concentration", min: 0, max: 250 },
  { key: "talent", label: "Talent", min: 0, max: 250 },
  { key: "aggression", label: "Aggression", min: 0, max: 250 },
  { key: "experience", label: "Experience", min: 0, max: 250 },
  { key: "technicalInsight", label: "Technical Insight", min: 0, max: 250 },
  { key: "stamina", label: "Stamina", min: 0, max: 250 },
  { key: "charisma", label: "Charisma", min: 0, max: 250 },
  { key: "motivation", label: "Motivation", min: 0, max: 250 },
  { key: "reputation", label: "Reputation", min: 0, max: 250 },
] as const;

const ATTRIBUTE_FIELDS = [
  { key: "energy", label: "Energy", min: 0, max: 100, unit: "%" },
  { key: "weight", label: "Weight", min: 50, max: 120, unit: "kg" },
  { key: "age", label: "Age", min: 17, max: 50, unit: "yr" },
] as const;

export function DriverPanel({ data }: DriverPanelProps) {
  const [state, formAction, isPending] = useActionState<SyncDriverState, FormData>(
    syncDriverData,
    {}
  );

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Driver Profile
          </h2>
          {data && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {data.name} · last synced{" "}
              <ClientDate date={data.updatedAt} fallback={"..."} />
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

      {data ? (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Skills
            </h3>
            <div className="space-y-2">
              {SKILL_FIELDS.map(({ key, label, min, max }) => (
                <StatBar
                  key={key}
                  label={label}
                  value={data[key]}
                  min={min}
                  max={max}
                />
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-6 dark:border-zinc-800">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Attributes
            </h3>
            <div className="space-y-2">
              {ATTRIBUTE_FIELDS.map(({ key, label, min, max, unit }) => (
                <StatBar
                  key={key}
                  label={label}
                  value={data[key]}
                  min={min}
                  max={max}
                  unit={unit}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
          <svg className="size-12 text-zinc-300 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            No driver data yet. Click <strong>Sync</strong> to load from the GPRO API.
          </p>
        </div>
      )}
    </section>
  );
}
