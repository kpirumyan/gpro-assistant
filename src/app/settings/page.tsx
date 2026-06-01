import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SettingsContent } from "./_components/SettingsContent";

export const metadata: Metadata = {
  title: "Settings — GPRO Assistant",
};

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Application preferences and GPRO API token configuration."
    >
      <SettingsContent />
    </PageShell>
  );
}
