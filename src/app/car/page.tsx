import type { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { CarContent } from "./_components/CarContent";

export const metadata: Metadata = {
  title: "Car — GPRO Assistant",
  description: "View and sync your car component levels and wear from the GPRO API.",
};

export default function CarPage() {
  return (
    <PageShell
      title="Car"
      description="Your car component levels and wear, synced from the GPRO API."
    >
      <CarContent />
    </PageShell>
  );
}
