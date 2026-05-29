import type { FuelAnalyticsListEntry } from "@/lib/db/queries";

type Props = {
  data: FuelAnalyticsListEntry[];
};

export function FuelAnalyticsTable({ data }: Props) {
  return (
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
  );
}
