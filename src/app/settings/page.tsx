import { PageShell } from "@/components/PageShell";
import { SettingsApiKeyForm } from "@/components/SettingsApiKeyForm";
import { getGproApiKey } from "@/lib/db/queries";
import { verifyToken } from "@/lib/gpro/client";

export default async function SettingsPage() {
  const apiKey = await getGproApiKey();
  const hasSavedKey = !!apiKey;
  const isKeyValid = apiKey ? await verifyToken(apiKey) : false;

  return (
    <PageShell
      title="Settings"
      description="Application preferences and GPRO API token configuration."
    >
      <SettingsApiKeyForm hasSavedKey={hasSavedKey} isKeyValid={isKeyValid} />
    </PageShell>
  );
}
