import { Suspense } from "react";
import { PageShell } from "@/components/PageShell";
import { SettingsApiKeyForm } from "@/components/SettingsApiKeyForm";
import { getGproCredentials, upsertGproCredentials, type GproCredentials } from "@/lib/db/queries";
import { verifyToken } from "@/lib/gpro/client";

/**
 * Slow path: runs verifyToken against the external API only when the cache is stale.
 * Receives pre-fetched credentials as a prop so SettingsPage can determine the
 * correct Suspense fallback without waiting for this component.
 */
export async function SettingsFormWrapper({
  credentials,
}: {
  credentials: GproCredentials;
}) {
  // Cache is fresh — serve the stored validity without hitting the external API.
  if (credentials.isValid) {
    return <SettingsApiKeyForm hasSavedKey={true} isKeyValid={true} />;
  }

  // Cache is stale or marked invalid — re-verify and persist the new result.
  const isValid = await verifyToken(credentials.token);
  await upsertGproCredentials({ ...credentials, isValid, verifiedAt: new Date() });

  return <SettingsApiKeyForm hasSavedKey={true} isKeyValid={isValid} />;
}

/**
 * Fast path: reads credentials from DB (no external API call).
 * Uses hasSavedKey to render an honest Suspense fallback:
 *   - no key → no spinner, just an empty form
 *   - key exists but stale → spinner shown while SettingsFormWrapper re-verifies
 *   - key exists and fresh → resolves instantly (SettingsFormWrapper skips verifyToken)
 */
export default async function SettingsPage() {
  const credentials = await getGproCredentials();
  const hasSavedKey = credentials !== null;

  return (
    <PageShell
      title="Settings"
      description="Application preferences and GPRO API token configuration."
    >
      {hasSavedKey ? (
        <Suspense fallback={<SettingsApiKeyForm hasSavedKey={true} isKeyValid={undefined} />}>
          <SettingsFormWrapper credentials={credentials} />
        </Suspense>
      ) : (
        <SettingsApiKeyForm hasSavedKey={false} isKeyValid={false} />
      )}
    </PageShell>
  );
}


