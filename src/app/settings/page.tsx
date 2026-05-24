import { PageShell } from "@/components/PageShell";
import { SettingsApiKeyForm } from "@/components/SettingsApiKeyForm";

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Application preferences and GPRO API token configuration."
    >
      <SettingsApiKeyForm />
    </PageShell>
  );
}
