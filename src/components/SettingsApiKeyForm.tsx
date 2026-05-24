"use client";

import { useState } from "react";

export function SettingsApiKeyForm() {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);

    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      setError("API key is required");
      return;
    }

    try {
      localStorage.setItem("gpro-api-key", trimmedKey);
      setStatus("API key saved successfully");
    } catch (err) {
      console.error("Failed to save API key", err);
      setError("Failed to save API key");
    }
  };

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

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50 dark:focus:ring-zinc-50/10"
            placeholder="Enter your API key"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="text-sm font-medium text-red-600 dark:text-red-400"
          >
            {error}
          </div>
        )}

        {status && (
          <div
            role="status"
            className="text-sm font-medium text-green-600 dark:text-green-400"
          >
            {status}
          </div>
        )}

        <button
          type="submit"
          aria-label="Save API key"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 dark:focus:ring-zinc-50/20"
        >
          Save
        </button>
      </form>
    </section>
  );
}
