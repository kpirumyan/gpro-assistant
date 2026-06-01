import { eq, desc, and, isNull, or } from "drizzle-orm";
import { db } from "./index";
import { gproCredentials, driverProfiles, carParts, rawRaceData, raceFuelAnalytics, tracks, raceDriverSnapshots, raceTyreAnalytics } from "./schema";
import type { DriverProfileResponse, CarPartResponse } from "@/lib/gpro/types";

// --- GPRO Credentials ---

export type GproCredentials = {
  token: string;
};

/**
 * Returns the stored GPRO credentials.
 */
export async function getGproCredentials(): Promise<GproCredentials | null> {
  try {
    const result = await db.select().from(gproCredentials).limit(1);
    if (result.length === 0) return null;

    return {
      token: result[0].token,
    };
  } catch (error) {
    console.error("Failed to get GPRO credentials:", error);
    return null;
  }
}

/**
 * Atomically saves or updates the GPRO credentials.
 */
export async function upsertGproCredentials(
  data: GproCredentials
): Promise<void> {
  try {
    const existing = await db.select({ id: gproCredentials.id }).from(gproCredentials).limit(1);

    if (existing.length > 0) {
      await db
        .update(gproCredentials)
        .set({
          token: data.token,
          updatedAt: new Date(),
        })
        .where(eq(gproCredentials.id, existing[0].id));
    } else {
      await db.insert(gproCredentials).values({
        token: data.token,
      });
    }
  } catch (error) {
    console.error("Failed to upsert GPRO credentials:", error);
    throw new Error("Failed to save GPRO credentials");
  }
}



// --- Driver Profile ---

export async function getDriverProfile() {
  try {
    const result = await db.select().from(driverProfiles).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get driver profile:", error);
    return null;
  }
}

export async function upsertDriverProfile(data: DriverProfileResponse): Promise<void> {
  try {
    // Single-user app: always use id=1 for the one driver profile
    const existing = await db.select({ id: driverProfiles.id }).from(driverProfiles).limit(1);

    if (existing.length > 0) {
      await db
        .update(driverProfiles)
        .set({
          name: data.driName,
          overall: data.overall,
          concentration: data.concentration,
          talent: data.talent,
          aggression: data.aggressiveness,
          experience: data.experience,
          technicalInsight: data.techInsight,
          stamina: data.stamina,
          charisma: data.charisma,
          motivation: data.motivation,
          reputation: data.reputation,
          weight: data.weight,
          age: data.age,
          energy: data.energy,
          updatedAt: new Date(),
        })
        .where(eq(driverProfiles.id, existing[0].id));
    } else {
      await db.insert(driverProfiles).values({
        name: data.driName,
        overall: data.overall,
        concentration: data.concentration,
        talent: data.talent,
        aggression: data.aggressiveness,
        experience: data.experience,
        technicalInsight: data.techInsight,
        stamina: data.stamina,
        charisma: data.charisma,
        motivation: data.motivation,
        reputation: data.reputation,
        weight: data.weight,
        age: data.age,
        energy: data.energy,
      });
    }
  } catch (error) {
    console.error("Failed to upsert driver profile:", error);
    throw new Error("Failed to save driver profile");
  }
}

// --- Car Parts ---

export async function getCarParts() {
  try {
    return await db.select().from(carParts);
  } catch (error) {
    console.error("Failed to get car parts:", error);
    return [];
  }
}

export async function upsertCarParts(parts: CarPartResponse[]): Promise<void> {
  try {
    for (const part of parts) {
      await db
        .insert(carParts)
        .values({
          name: part.name,
          level: part.level,
          wear: part.wear,
        })
        .onConflictDoUpdate({
          target: carParts.name,
          set: {
            level: part.level,
            wear: part.wear,
            updatedAt: new Date(),
          },
        });
    }
  } catch (error) {
    console.error("Failed to upsert car parts:", error);
    throw new Error("Failed to save car parts");
  }
}

// --- Fuel / Race Sync ---

/**
 * Returns the most recently synced race (season + race number), or null if
 * no race data has been synced yet.
 */
export async function getLatestSyncedRace(): Promise<{ season: number; race: number } | null> {
  const latestDbEntry = await db.query.rawRaceData.findFirst({
    orderBy: [desc(rawRaceData.season), desc(rawRaceData.race)],
  });
  return latestDbEntry ? { season: latestDbEntry.season, race: latestDbEntry.race } : null;
}

export type FuelAnalyticsListEntry = {
  id: number;
  season: number;
  race: number;
  type: string;
  stintIndex: number | null;
  lapsAnalyzed: number;
  fastLapsCount: number;
  avgFuelPerKmMin: string;
  avgFuelPerKmMax: string;
  trackFuelConsumption: string | null;
  trackName: string | null;
  pilotName: string | null;
  tyre: string | null;
  createdAt: Date;
};

export async function getFuelAnalyticsList(): Promise<FuelAnalyticsListEntry[]> {
  try {
    return await db
      .select({
        id: raceFuelAnalytics.id,
        season: rawRaceData.season,
        race: rawRaceData.race,
        type: raceFuelAnalytics.type,
        stintIndex: raceFuelAnalytics.stintIndex,
        lapsAnalyzed: raceFuelAnalytics.lapsAnalyzed,
        fastLapsCount: raceFuelAnalytics.fastLapsCount,
        avgFuelPerKmMin: raceFuelAnalytics.avgFuelPerKmMin,
        avgFuelPerKmMax: raceFuelAnalytics.avgFuelPerKmMax,
        trackFuelConsumption: tracks.fuelConsumption,
        trackName: tracks.name,
        pilotName: raceDriverSnapshots.name,
        tyre: raceTyreAnalytics.tyre,
        createdAt: raceFuelAnalytics.createdAt,
      })
      .from(raceFuelAnalytics)
      .innerJoin(rawRaceData, eq(raceFuelAnalytics.rawRaceDataId, rawRaceData.id))
      .leftJoin(tracks, eq(rawRaceData.trackId, tracks.id))
      .leftJoin(raceDriverSnapshots, eq(rawRaceData.id, raceDriverSnapshots.rawRaceDataId))
      .leftJoin(
        raceTyreAnalytics,
        and(
          eq(raceFuelAnalytics.rawRaceDataId, raceTyreAnalytics.rawRaceDataId),
          eq(raceFuelAnalytics.type, raceTyreAnalytics.type),
          or(
            eq(raceFuelAnalytics.stintIndex, raceTyreAnalytics.stintIndex),
            and(isNull(raceFuelAnalytics.stintIndex), isNull(raceTyreAnalytics.stintIndex))
          )
        )
      )
      .orderBy(
        desc(rawRaceData.season),
        desc(rawRaceData.race),
        desc(raceFuelAnalytics.type),
        raceFuelAnalytics.stintIndex
      );
  } catch (error) {
    console.error("Failed to get fuel analytics list:", error);
    return [];
  }
}

