import { DriverPanel } from "./DriverPanel";
import { getDriverProfile } from "@/lib/db/queries";

export async function DriverContent() {
  const profile = await getDriverProfile();

  return <DriverPanel data={profile} />;
}
