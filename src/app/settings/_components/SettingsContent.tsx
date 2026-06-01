import { SettingsApiKeyForm } from "./SettingsApiKeyForm";
import { getGproCredentials } from "@/lib/db/queries";

export async function SettingsContent() {
  const credentials = await getGproCredentials();
  const hasSavedKey = credentials !== null;

  return <SettingsApiKeyForm hasSavedKey={hasSavedKey} />;
}
