import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { DriverPanel } from "@/components/DriverPanel";
import { getDriverProfile } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Driver — GPRO Assistant",
  description: "View and sync your driver's skills and attributes from the GPRO API.",
};

export default async function DriverPage() {
  const profile = await getDriverProfile();

  return (
    <PageShell
      title="Driver"
      description="Your driver's skills and attributes, synced from the GPRO API."
    >
      <div className="mt-8">
        <DriverPanel data={profile} />
      </div>
    </PageShell>
  );
}
