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

    let season: number | undefined;
    let race: number | undefined;

    try {
      // 1. Try to fetch calendar to find the current active race and its season
      const calendarData = await fetchCalendar(credentials.token) as { events?: Array<Record<string, unknown>> };
      const calendarEvents = calendarData?.events;

      if (Array.isArray(calendarEvents) && calendarEvents.length > 0) {
        const currentRace = calendarEvents.find(
          (r) => r.isCurrentRace === 1 || r.isCurrentRace === "1"
        );
        const targetRace = currentRace || calendarEvents[calendarEvents.length - 1];
        
        if (targetRace) {
          if (targetRace.season) {
            season = Number(targetRace.season);
          }
          if (targetRace.idx) {
            race = Number(targetRace.idx);
          }
        }
      }
    } catch (calendarError) {
      console.warn("Failed to fetch calendar, falling back to database checks:", calendarError);
    }

    // 2. Fallback: try to see what season we last synced if API fetch failed
    if (season === undefined || race === undefined) {
      const latestDbEntry = await db.query.raceAnalysis.findFirst({
        orderBy: [desc(raceAnalysis.season), desc(raceAnalysis.race)],
      });

      if (latestDbEntry) {
        season = latestDbEntry.season;
        race = latestDbEntry.race;
      }
    }

    if (season === undefined || race === undefined) {
      return { error: "Failed to determine current season and race. GPRO API is unavailable and database is empty." };
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
