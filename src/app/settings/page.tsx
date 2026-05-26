import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";
import { SettingsApiKeyForm } from "@/components/SettingsApiKeyForm";
import { getGproCredentials } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "Settings — GPRO Assistant",
};

export default async function SettingsPage() {
  const credentials = await getGproCredentials();
  const hasSavedKey = credentials !== null;

  return (
    <PageShell
      title="Settings"
      description="Application preferences and GPRO API token configuration."
    >
      <SettingsApiKeyForm hasSavedKey={hasSavedKey} />
    </PageShell>
  );
}
