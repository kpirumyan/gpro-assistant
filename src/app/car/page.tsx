import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { CarPanel } from "./_components/CarPanel";
import { getCarParts } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Car — GPRO Assistant",
  description: "View and sync your car component levels and wear from the GPRO API.",
};

export default async function CarPage() {
  const parts = await getCarParts();

  return (
    <PageShell
      title="Car"
      description="Your car component levels and wear, synced from the GPRO API."
    >
      <div className="mt-8">
        <CarPanel parts={parts} />
      </div>
    </PageShell>
  );
}
