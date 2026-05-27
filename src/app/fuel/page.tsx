import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FuelSyncPanel } from "./_components/FuelSyncPanel";
import { FuelAnalyticsTable } from "./_components/FuelAnalyticsTable";
import { getFuelAnalyticsList } from "@/lib/db/queries";
import { getLatestSyncedRaceAction } from "./actions";

export const metadata: Metadata = {
  title: "Fuel consumption — GPRO Assistant",
};

export default async function FuelPage() {
  const data = await getFuelAnalyticsList();
  const latestSyncedRace = await getLatestSyncedRaceAction();

  return (
    <PageShell
      title="Fuel consumption"
      description="Calculate fuel usage for race strategy."
    >
      <div className="space-y-6">
        <FuelSyncPanel latestSyncedRace={latestSyncedRace} />
        <FuelAnalyticsTable data={data} />
      </div>
    </PageShell>
  );
}

