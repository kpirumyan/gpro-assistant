"use server";

import { revalidatePath } from "next/cache";
import { getGproCredentials, upsertCarParts } from "@/lib/db/queries";
import { fetchCarData } from "@/lib/gpro/client";

export type SyncCarState = {
  message?: string;
  error?: string;
};

export async function syncCarData(): Promise<SyncCarState> {
  try {
    const credentials = await getGproCredentials();
    if (!credentials) {
      return { error: "No API key configured. Please add one in Settings." };
    }

    const carData = await fetchCarData(credentials.token);
    await upsertCarParts(carData.parts);
    revalidatePath("/car");
    return { message: "Car data synced successfully" };
  } catch (error) {
    console.error("Failed to sync car data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to sync car data: ${message}` };
  }
}
