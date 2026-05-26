import { Metadata } from "next";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Car setup — GPRO Assistant",
};

export default function SetupPage() {
  return (
    <PageShell
      title="Car setup"
      description="Configure and compare car setup parameters. Coming soon."
    />
  );
}
