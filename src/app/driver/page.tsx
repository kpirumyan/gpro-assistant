import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { DriverContent } from "./_components/DriverContent";

export const metadata: Metadata = {
  title: "Driver — GPRO Assistant",
  description: "View and sync your driver's skills and attributes from the GPRO API.",
};

export default function DriverPage() {
  return (
    <PageShell
      title="Driver"
      description="Your driver's skills and attributes, synced from the GPRO API."
    >
      <DriverContent />
    </PageShell>
  );
}
