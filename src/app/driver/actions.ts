"use server";

import { revalidatePath } from "next/cache";
import { getGproApiKey, upsertDriverProfile } from "@/lib/db/queries";
import { fetchDriverProfile } from "@/lib/gpro/client";

export type SyncDriverState = {
  message?: string;
  error?: string;
};

export async function syncDriverData(): Promise<SyncDriverState> {
  try {
    const apiKey = await getGproApiKey();
    if (!apiKey) {
      return { error: "No API key configured. Please add one in Settings." };
    }

    const profile = await fetchDriverProfile(apiKey);
    await upsertDriverProfile(profile);
    revalidatePath("/driver");
    return { message: "Driver data synced successfully" };
  } catch (error) {
    console.error("Failed to sync driver data:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to sync driver data: ${message}` };
  }
}
