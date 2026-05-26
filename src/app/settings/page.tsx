import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { SettingsApiKeyForm } from "@/components/SettingsApiKeyForm";
import { getGproCredentials, upsertGproCredentials } from "@/lib/db/queries";
import { verifyToken } from "@/lib/gpro/client";

export async function SettingsFormWrapper() {
  const credentials = await getGproCredentials();

  if (!credentials) {
    return <SettingsApiKeyForm hasSavedKey={false} isKeyValid={false} />;
  }

  // Cache is fresh — serve the stored validity without hitting the external API.
  if (credentials.isValid) {
    return <SettingsApiKeyForm hasSavedKey={true} isKeyValid={true} />;
  }

  // Cache is stale or invalid — re-verify and persist the new result.
  const isValid = await verifyToken(credentials.token);
  await upsertGproCredentials({ ...credentials, isValid, verifiedAt: new Date() });

  return <SettingsApiKeyForm hasSavedKey={true} isKeyValid={isValid} />;
}

export default async function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Application preferences and GPRO API token configuration."
    >
      <Suspense fallback={<SettingsApiKeyForm hasSavedKey={true} isKeyValid={undefined} />}>
        <SettingsFormWrapper />
      </Suspense>
    </PageShell>
  );
}

