import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { FuelContent } from "./_components/FuelContent";

export const metadata: Metadata = {
  title: "Fuel consumption — GPRO Assistant",
};

export default function FuelPage() {
  return (
    <PageShell
      title="Fuel consumption"
      description="Calculate fuel usage for race strategy."
    >
      <FuelContent />
    </PageShell>
  );
}
