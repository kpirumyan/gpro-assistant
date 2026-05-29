import { db } from "../db";
import { rawRaceData, raceCarSnapshots, raceDriverSnapshots, raceFuelAnalytics } from "../db/schema";
import { fetchRaceAnalysis } from "../gpro/client";
import type { RaceAnalysisResponse } from "../gpro/types";

export interface SyncResult {
  syncedCount: number;
  stoppedReason: "already_exists" | "not_found" | "error" | "limit_reached" | "completed";
  lastRaceChecked?: { season: number; race: number };
}

/**
 * Fetches and saves a batch of specific missing races.
 * Stops immediately if the API returns a 404 (race doesn't exist yet) or throws an error.
 */
export async function syncRacesBatch(
  token: string,
  racesToFetch: { season: number; race: number }[]
): Promise<SyncResult> {
  let syncedCount = 0;
  let lastRaceChecked: { season: number; race: number } | undefined = undefined;

  for (const raceInfo of racesToFetch) {
    lastRaceChecked = raceInfo;
    try {
      console.log(`Fetching race analysis for S${raceInfo.season} R${raceInfo.race}...`);
      const data = await fetchRaceAnalysis(token, raceInfo.season, raceInfo.race);
      
      // Save data
      await saveRaceAnalysisData(raceInfo.season, raceInfo.race, data);
      syncedCount++;

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`Failed to fetch S${raceInfo.season} R${raceInfo.race}: ${msg}`);
      if (msg.toLowerCase().includes("not found")) {
        return { syncedCount, stoppedReason: "not_found", lastRaceChecked };
      } else {
        return { syncedCount, stoppedReason: "error", lastRaceChecked };
      }
    }
  }

  return { 
    syncedCount, 
    stoppedReason: "completed",
    lastRaceChecked 
  };
}

/**
 * Saves the raw race data and extracts snapshots and fuel analytics.
 */
export async function saveRaceAnalysisData(season: number, race: number, data: RaceAnalysisResponse) {
  await db.transaction(async (tx) => {
    // 1. Insert raw_race_data
    const [insertedAnalysis] = await tx.insert(rawRaceData).values({
      season,
      race,
      group: data.group ? String(data.group) : "Unknown",
      rawData: data as Record<string, unknown>,
    }).returning({ id: rawRaceData.id });

    const rawRaceDataId = insertedAnalysis.id;

    // 2. Insert race_car_snapshots
    await tx.insert(raceCarSnapshots).values({
      rawRaceDataId,
      power: data.carPower || 0,
      handling: data.handling || 0,
      acceleration: data.acceleration || 0,
      chassisLvl: data.chassis?.lvl || 0,
      chassisStartWear: data.chassis?.startWear || 0,
      chassisFinishWear: data.chassis?.finishWear || 0,
      engineLvl: data.engine?.lvl || 0,
      engineStartWear: data.engine?.startWear || 0,
      engineFinishWear: data.engine?.finishWear || 0,
      fWingLvl: data.fWing?.lvl || 0,
      fWingStartWear: data.fWing?.startWear || 0,
      fWingFinishWear: data.fWing?.finishWear || 0,
      rWingLvl: data.rWing?.lvl || 0,
      rWingStartWear: data.rWing?.startWear || 0,
      rWingFinishWear: data.rWing?.finishWear || 0,
      underbodyLvl: data.underbody?.lvl || 0,
      underbodyStartWear: data.underbody?.startWear || 0,
      underbodyFinishWear: data.underbody?.finishWear || 0,
      sidepodsLvl: data.sidepods?.lvl || 0,
      sidepodsStartWear: data.sidepods?.startWear || 0,
      sidepodsFinishWear: data.sidepods?.finishWear || 0,
      coolingLvl: data.cooling?.lvl || 0,
      coolingStartWear: data.cooling?.startWear || 0,
      coolingFinishWear: data.cooling?.finishWear || 0,
      gearboxLvl: data.gearbox?.lvl || 0,
      gearboxStartWear: data.gearbox?.startWear || 0,
      gearboxFinishWear: data.gearbox?.finishWear || 0,
      brakesLvl: data.brakes?.lvl || 0,
      brakesStartWear: data.brakes?.startWear || 0,
      brakesFinishWear: data.brakes?.finishWear || 0,
      suspensionLvl: data.suspension?.lvl || 0,
      suspensionStartWear: data.suspension?.startWear || 0,
      suspensionFinishWear: data.suspension?.finishWear || 0,
      electronicsLvl: data.electronics?.lvl || 0,
      electronicsStartWear: data.electronics?.startWear || 0,
      electronicsFinishWear: data.electronics?.finishWear || 0,
    });

    // 3. Insert race_driver_snapshots
    if (data.driver) {
      await tx.insert(raceDriverSnapshots).values({
        rawRaceDataId,
        name: data.driver.name || "Unknown",
        overall: data.driver.overall || 0,
        concentration: data.driver.concentration || 0,
        talent: data.driver.talent || 0,
        aggression: data.driver.aggressiveness || 0,
        experience: data.driver.experience || 0,
        technicalInsight: data.driver.techInsight || 0,
        stamina: data.driver.stamina || 0,
        charisma: data.driver.charisma || 0,
        motivation: data.driver.motivation || 0,
        reputation: data.driver.reputation || 0,
        weight: data.driver.weight || 0,
      });
    }

    // 4. Calculate and insert race_fuel_analytics
    const analytics = calculateFuelAnalytics(data);
    if (analytics.length > 0) {
      await tx.insert(raceFuelAnalytics).values(
        analytics.map(a => ({
          ...a,
          rawRaceDataId,
          avgFuelPerLapMin: a.avgFuelPerLapMin.toString(),
          avgFuelPerLapMax: a.avgFuelPerLapMax.toString(),
        }))
      );
    }
  });
}

export interface FuelAnalyticsResult {
  type: 'stint' | 'full_race';
  stintIndex: number | null;
  lapsAnalyzed: number;
  fastLapsCount: number;
  avgFuelPerLapMin: number;
  avgFuelPerLapMax: number;
}

/**
 * Calculates fuel analytics from the race analysis response.
 */
export function calculateFuelAnalytics(data: Partial<RaceAnalysisResponse>): FuelAnalyticsResult[] {
  const results: FuelAnalyticsResult[] = [];
  const pits = data.pits || [];
  const laps = data.laps || [];

  if (typeof data.startFuel !== 'number' || laps.length === 0) {
    return results; // Cannot analyze without start fuel and laps
  }

  let fullRaceConsumedMin = 0;
  let fullRaceConsumedMax = 0;
  let fullRaceLapsAnalyzed = 0;
  let fullRaceFastLaps = 0;
  let validStintsCount = 0;

  let currentStintStartLap = 1;
  const PIT_STOP_FUEL_ERROR = 3; // The error margin "X% ... X+3%" interpreted as an absolute +3 value for safety.

  for (let i = 0; i <= pits.length; i++) {
    const isLastStint = i === pits.length;
    
    // Start fuel for this stint
    const startFuel = i === 0 ? data.startFuel : pits[i - 1].refilledTo;
    
    // Determine end lap for this stint
    const currentStintEndLap = isLastStint ? laps.length : (pits[i].lap || laps.length);
    
    if (startFuel === undefined) {
       currentStintStartLap = currentStintEndLap + 1;
       continue;
    }

    // Finish fuel for this stint
    const finishFuelReported = isLastStint ? data.finishFuel : pits[i].fuelLeft;

    if (finishFuelReported === undefined) {
       currentStintStartLap = currentStintEndLap + 1;
       continue;
    }

    // Actual finish fuel could be up to +3 greater than reported due to error in game data.
    // Except for the finish line where the value is exact.
    const minFinishFuel = finishFuelReported;
    const maxFinishFuel = isLastStint ? finishFuelReported : finishFuelReported + PIT_STOP_FUEL_ERROR;

    const consumedMin = startFuel - maxFinishFuel;
    const consumedMax = startFuel - minFinishFuel;

    // Count laps and fast laps for this stint
    let lapsInStint = 0;
    let fastLapsInStint = 0;
    
    for (let lapNum = currentStintStartLap; lapNum <= currentStintEndLap; lapNum++) {
      const lapData = laps[lapNum - 1];
      if (lapData) {
        lapsInStint++;
        if (lapData.boostLap && lapData.boostLap > 0) {
          fastLapsInStint++;
        }
      }
    }

    // We only analyze long stints (>= 10 laps)
    if (lapsInStint >= 10) {
      results.push({
        type: 'stint',
        stintIndex: i + 1,
        lapsAnalyzed: lapsInStint,
        fastLapsCount: fastLapsInStint,
        avgFuelPerLapMin: consumedMin / lapsInStint,
        avgFuelPerLapMax: consumedMax / lapsInStint
      });
      
      fullRaceConsumedMin += consumedMin;
      fullRaceConsumedMax += consumedMax;
      fullRaceLapsAnalyzed += lapsInStint;
      fullRaceFastLaps += fastLapsInStint;
      validStintsCount++;
    }

    currentStintStartLap = currentStintEndLap + 1;
  }

  // Aggregate full race stats from valid stints
  if (validStintsCount > 0) {
    results.push({
      type: 'full_race',
      stintIndex: null,
      lapsAnalyzed: fullRaceLapsAnalyzed,
      fastLapsCount: fullRaceFastLaps,
      avgFuelPerLapMin: fullRaceConsumedMin / fullRaceLapsAnalyzed,
      avgFuelPerLapMax: fullRaceConsumedMax / fullRaceLapsAnalyzed
    });
  }

  return results;
}

/**
 * Generates a flat chronological array of { season, race } objects.
 * Assumes a maximum of 17 races per season.
 */
export function generateRaceRange(
  fromSeason: number,
  fromRace: number,
  toSeason: number,
  toRace: number
): { season: number; race: number }[] {
  const result: { season: number; race: number }[] = [];

  if (fromSeason > toSeason || (fromSeason === toSeason && fromRace > toRace)) {
    throw new Error('Invalid range: from > to');
  }

  let currentSeason = fromSeason;
  let currentRace = fromRace;

  while (currentSeason < toSeason || (currentSeason === toSeason && currentRace <= toRace)) {
    result.push({ season: currentSeason, race: currentRace });
    currentRace++;
    if (currentRace > 17) {
      currentRace = 1;
      currentSeason++;
    }
  }

  return result;
}

/**
 * Queries the database for existing races within the given range.
 * Returns an array of { season, race } objects using an optimized query.
 */
export async function getExistingRacesInRange(
  fromSeason: number,
  fromRace: number,
  toSeason: number,
  toRace: number
): Promise<{ season: number; race: number }[]> {
  if (fromSeason > toSeason || (fromSeason === toSeason && fromRace > toRace)) {
    throw new Error('Invalid range: from > to');
  }

  const existingRaces = await db.query.rawRaceData.findMany({
    where: (ra, { and, or, eq, gte, lte, gt, lt }) => {
      if (fromSeason === toSeason) {
        return and(
          eq(ra.season, fromSeason),
          gte(ra.race, fromRace),
          lte(ra.race, toRace)
        );
      }

      return or(
        // Races in the first season, from the starting race onwards
        and(eq(ra.season, fromSeason), gte(ra.race, fromRace)),
        // Races in strictly intermediate seasons
        and(gt(ra.season, fromSeason), lt(ra.season, toSeason)),
        // Races in the final season, up to the ending race
        and(eq(ra.season, toSeason), lte(ra.race, toRace))
      );
    },
    columns: {
      season: true,
      race: true,
    },
    orderBy: (ra, { asc }) => [asc(ra.season), asc(ra.race)],
  });

  return existingRaces;
}

/**
 * Prepares the sync operation by generating the full range of races and 
 * filtering out the ones that already exist in the database.
 * Returns an array of { season, race } that are missing and need to be synced.
 */
export async function prepareSync(
  fromSeason: number,
  fromRace: number,
  toSeason: number,
  toRace: number
): Promise<{ season: number; race: number }[]> {
  const fullRange = generateRaceRange(fromSeason, fromRace, toSeason, toRace);
  const existingRaces = await getExistingRacesInRange(fromSeason, fromRace, toSeason, toRace);

  const missingRaces: { season: number; race: number }[] = [];
  let existingIdx = 0;

  for (const r of fullRange) {
    const er = existingRaces[existingIdx];
    if (er && er.season === r.season && er.race === r.race) {
      existingIdx++; // Skip this race as it already exists
    } else {
      missingRaces.push(r);
    }
  }

  return missingRaces;
}

