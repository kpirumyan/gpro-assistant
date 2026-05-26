import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Tire wear — GPRO Assistant",
};

export default function TiresPage() {
  return (
    <PageShell
      title="Tire wear"
      description="Estimate tire degradation across stints. Coming soon."
    />
  );
}
