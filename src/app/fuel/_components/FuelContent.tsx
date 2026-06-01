import { FuelSyncPanel } from "./FuelSyncPanel";
import { FuelAnalyticsTable } from "./FuelAnalyticsTable";
import { getFuelAnalyticsList, getLatestSyncedRace } from "@/lib/db/queries";

export async function FuelContent() {
  const data = await getFuelAnalyticsList();
  const latestSyncedRace = await getLatestSyncedRace();

  return (
    <div className="space-y-6">
      <FuelSyncPanel latestSyncedRace={latestSyncedRace} />
      <FuelAnalyticsTable data={data} />
    </div>
  );
}
