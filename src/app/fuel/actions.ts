"use server";

import { revalidatePath } from "next/cache";
import { getGproCredentials } from "@/lib/db/queries";
import { fetchCalendar, AuthError } from "@/lib/gpro/client";
import { syncRaceHistory } from "@/lib/services/race-analysis.service";
import { db } from "@/lib/db";
import { raceAnalysis } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export type SyncRacesState = {
  message?: string;
  error?: string;
  syncedCount?: number;
};

export async function syncRacesData(): Promise<SyncRacesState> {
  try {
    const credentials = await getGproCredentials();
    if (!credentials) {
      return { error: "No API key configured. Please add one in Settings." };
    }

    let season = 103; // Safe default for 2026 if all else fails
    let race = 17;

    try {
      // 1. Try to fetch calendar to find the current active race and its season
      const calendar = await fetchCalendar(credentials.token) as Array<Record<string, unknown>>;
      if (Array.isArray(calendar) && calendar.length > 0) {
        const currentRace = calendar.find(
          (r) => r.isCurrentRace === 1 || r.isCurrentRace === "1"
        );
        if (currentRace) {
          if (currentRace.season) {
            season = Number(currentRace.season);
          }
          if (currentRace.idx) {
            race = Number(currentRace.idx);
          }
        } else {
          // If no active race is marked, try to get the latest one from the list
          const latestRace = calendar[calendar.length - 1];
          if (latestRace) {
            if (latestRace.season) {
              season = Number(latestRace.season);
            }
            if (latestRace.idx) {
              race = Number(latestRace.idx);
            }
          }
        }
      }
    } catch (calendarError) {
      console.warn("Failed to fetch calendar, falling back to database checks:", calendarError);
      
      // 2. Fallback: try to see what season we last synced
      const latestDbEntry = await db.query.raceAnalysis.findFirst({
        orderBy: [desc(raceAnalysis.season), desc(raceAnalysis.race)],
      });

      if (latestDbEntry) {
        season = latestDbEntry.season;
        race = latestDbEntry.race;
      }
    }

    // Call the synchronization service
    const result = await syncRaceHistory(credentials.token, season, race);

    revalidatePath("/fuel");

    if (result.syncedCount === 0) {
      if (result.stoppedReason === "already_exists") {
        return { message: "All races are already up to date.", syncedCount: 0 };
      }
      return { message: "No new races to sync.", syncedCount: 0 };
    }

    return {
      message: `Successfully synced ${result.syncedCount} race(s).`,
      syncedCount: result.syncedCount,
    };
  } catch (error) {
    console.error("Failed to sync races:", error);
    if (error instanceof AuthError) {
      return { error: "AUTH_ERROR" };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: `Sync failed: ${message}` };
  }
}
