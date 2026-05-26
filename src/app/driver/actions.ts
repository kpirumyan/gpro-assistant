"use server";

import { revalidatePath } from "next/cache";
import { getGproCredentials, upsertDriverProfile } from "@/lib/db/queries";
import { fetchDriverProfile, AuthError } from "@/lib/gpro/client";

export type SyncDriverState = {
  message?: string;
  error?: string;
};

export async function syncDriverData(): Promise<SyncDriverState> {
  try {
    const credentials = await getGproCredentials();
    if (!credentials) {
      return { error: "No API key configured. Please add one in Settings." };
    }

    const profile = await fetchDriverProfile(credentials.token);
    await upsertDriverProfile(profile);
    revalidatePath("/driver");
    return { message: "Driver data synced successfully" };
  } catch (error) {
    console.error("Failed to sync driver data:", error);
    if (error instanceof AuthError) {
      return { error: "AUTH_ERROR" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Failed to sync driver data: ${message}` };
  }
}
