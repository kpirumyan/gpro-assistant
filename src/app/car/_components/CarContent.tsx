import { CarPanel } from "./CarPanel";
import { getCarParts } from "@/lib/db/queries";

export async function CarContent() {
  const parts = await getCarParts();

  return <CarPanel parts={parts} />;
}
