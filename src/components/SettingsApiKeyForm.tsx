"use client";

import { useActionState } from "react";
import { saveApiKey } from "@/app/settings/actions";

export function SettingsApiKeyForm({
  hasSavedKey,
  isKeyValid,
}: {
  hasSavedKey?: boolean;
  isKeyValid?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(saveApiKey, {});

  return (
    <section className="mt-10 max-w-2xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          GPRO API access
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Store your personal API token here so the app can fetch race data,
          generate derived analytics, and persist results for later use.
        </p>
      </div>

      {hasSavedKey && (
        <div
          className={`mt-6 flex items-start gap-3 rounded-xl border p-4 text-sm font-medium ${
            isKeyValid
              ? "border-green-200 bg-green-50 text-green-700 dark:border-green-900/50 dark:bg-green-900/20 dark:text-green-400"
              : "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {isKeyValid ? (
            <>
              <svg className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>An active API key is currently saved.</span>
            </>
          ) : (
            <>
              <svg className="mt-0.5 size-5 shrink-0 text-red-600 dark:text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>The saved API key appears to be invalid or expired. Please enter a new one.</span>
            </>
          )}
        </div>
      )}

      <form action={formAction} className="mt-6 space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="gpro-api-key"
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            GPRO API key
          </label>
          <input
            id="gpro-api-key"
            name="gproApiKey"
            type="password"
            autoComplete="off"
            spellCheck={false}
            disabled={isPending}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50/10"
            placeholder="Enter your API key"
          />
        </div>

        {state?.error && (
          <div
            role="alert"
            className="text-sm font-medium text-red-600 dark:text-red-400"
          >
            {state.error}
          </div>
        )}

        {state?.message && (
          <div
            role="status"
            className="text-sm font-medium text-green-600 dark:text-green-400"
          >
            {state.message}
          </div>
        )}

        <button
          type="submit"
          aria-label="Save API key"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20 disabled:opacity-50"
        >
          {isPending ? "Saving..." : "Save"}
        </button>
      </form>
    </section>
  );
}
