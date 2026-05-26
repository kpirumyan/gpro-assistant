import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Dashboard — GPRO Assistant",
};

export default function Home() {
  return (
    <PageShell
      title="GPRO Assistant"
      description="Collect, visualize, and analyze data from the official GPRO API. Use the navigation above to open calculators and settings."
    >
      <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
        Coming soon: live race data, fuel and tire tools, and car setup helpers.
      </p>
    </PageShell>
  );
}
