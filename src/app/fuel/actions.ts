"use server";

import { revalidatePath } from "next/cache";
import { getGproCredentials } from "@/lib/db/queries";
import { prepareSync, syncRacesBatch } from "@/lib/services/race-analysis.service";

export type SyncRacesState = {
  message?: string;
  error?: string;
  syncedCount?: number;
};

export async function prepareSyncAction(
  fromSeason: number,
  fromRace: number,
  toSeason: number,
  toRace: number,
  overwrite?: boolean
): Promise<{ success: true; missingRaces: { season: number; race: number }[] } | { success: false; error: string }> {
  try {
    const missingRaces = await prepareSync(fromSeason, fromRace, toSeason, toRace, overwrite);
    return { success: true, missingRaces };
  } catch (error) {
    console.error("Failed to prepare sync:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error during preparation" };
  }
}

export async function syncRaceBatchAction(
  races: { season: number; race: number }[]
): Promise<{ success: true; syncedCount: number } | { success: false; error: string }> {
  try {
    const credentials = await getGproCredentials();
    if (!credentials) {
      return { success: false, error: "No API key configured. Please add one in Settings." };
    }

    const result = await syncRacesBatch(credentials.token, races);
    
    // We can clear cache so UI components that rely on DB get refreshed.
    revalidatePath("/fuel");

    if (result.stoppedReason !== "completed") {
       return { success: false, error: `Sync stopped prematurely. Reason: ${result.stoppedReason}. Synced: ${result.syncedCount}` };
    }

    return { success: true, syncedCount: result.syncedCount };
  } catch (error) {
    console.error("Failed to sync batch:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error during sync" };
  }
}
