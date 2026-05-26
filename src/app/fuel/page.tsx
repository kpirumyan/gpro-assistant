import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FuelSyncPanel } from "@/components/FuelSyncPanel";
import { getFuelAnalyticsList } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Fuel consumption — GPRO Assistant",
};

export default async function FuelPage() {
  const data = await getFuelAnalyticsList();

  return (
    <PageShell
      title="Fuel consumption"
      description="Calculate fuel usage for race strategy."
    >
      <FuelSyncPanel data={data} />
    </PageShell>
  );
}

