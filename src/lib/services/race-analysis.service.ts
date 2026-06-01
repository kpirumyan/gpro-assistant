import { db } from "../db";
import { rawRaceData, raceCarSnapshots, raceDriverSnapshots, raceFuelAnalytics, seasonCalendars, tracks } from "../db/schema";
import { fetchRaceAnalysis, fetchHistoryCalendar, fetchTrackProfile, fetchOffice, fetchCalendar } from "../gpro/client";
import type { RaceAnalysisResponse } from "../gpro/types";
import { eq, and } from "drizzle-orm";

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
  let currentSeason: number | undefined = undefined;

  for (const raceInfo of racesToFetch) {
    lastRaceChecked = raceInfo;
    try {
      const data = await fetchRaceAnalysis(token, raceInfo.season, raceInfo.race);
      
      // Resolve trackId
      let trackId: number | undefined = undefined;

      const calendarEntry = await db.query.seasonCalendars.findFirst({
        where: and(eq(seasonCalendars.season, raceInfo.season), eq(seasonCalendars.race, raceInfo.race))
      });

      if (!calendarEntry) {
         if (currentSeason === undefined) {
            try {
               const office = await fetchOffice(token);
               currentSeason = office?.seasonNb ?? -1;
            } catch {
               currentSeason = -1;
            }
         }

         if (raceInfo.season === currentSeason) {
            const calData = await fetchCalendar(token);
            if (Array.isArray(calData)) {
               for (const ev of calData) {
                  if (ev.idx !== undefined) {
                     const raceNum = Number(ev.idx);
                     const tId = ev.trackId !== undefined ? Number(ev.trackId) : 0;
                     
                     if (isNaN(raceNum) || isNaN(tId)) {
                        continue;
                     }

                     await db.insert(seasonCalendars).values({
                        season: raceInfo.season,
                        race: raceNum,
                        trackId: tId
                     }).onConflictDoNothing();

                     if (raceNum === raceInfo.race && tId > 0) {
                        trackId = tId;
                     }
                  }
               }
            }
         } else {
            const calData = await fetchHistoryCalendar(token, raceInfo.season);
            if (calData.managers && calData.managers.length > 0) {
               for (const ev of calData.managers) {
                  if (ev.pos !== undefined && ev.pos !== null && ev.trackId !== undefined && ev.trackId !== null) {
                     const raceNum = Number(ev.pos);
                     const tId = Number(ev.trackId);
                     
                     if (isNaN(raceNum) || isNaN(tId)) {
                        continue;
                     }

                     await db.insert(seasonCalendars).values({
                        season: raceInfo.season,
                        race: raceNum,
                        trackId: tId
                     }).onConflictDoNothing();

                     if (raceNum === raceInfo.race) {
                        trackId = tId;
                     }
                  }
               }
            }
         }
      } else {
         trackId = calendarEntry.trackId;
      }

      if (trackId) {
         const trackEntry = await db.query.tracks.findFirst({ where: eq(tracks.id, trackId) });
         if (!trackEntry) {
            const trackData = await fetchTrackProfile(token, trackId);
            await db.insert(tracks).values({
              id: trackId,
              name: trackData.trackName || "Unknown",
              power: trackData.power || 0,
              acceleration: trackData.accel || 0,
              handling: trackData.handl || 0,
              downforce: trackData.downforce || "Unknown",
              overtaking: trackData.overtaking || "Unknown",
              suspRigidity: trackData.suspRigidity || "Unknown",
              fuelConsumption: trackData.fuelConsumption || "Unknown",
              tyreWear: trackData.tyreWear || "Unknown",
              gripLevel: trackData.gripLevel || "Unknown",
              laps: trackData.laps || 0,
              raceDistance: trackData.raceDistance || "0",
              lapDistance: trackData.lapDistance || "0",
              avgSpeed: trackData.avgSpeed || "0",
              timeInOutPits: trackData.timeInOutPits || "0",
              nbTurns: trackData.nbTurns || 0,
              category: trackData.category || "Unknown",
            }).onConflictDoNothing();
         }
      }

      // Save data
      await saveRaceAnalysisData(raceInfo.season, raceInfo.race, data, trackId);
      syncedCount++;

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`Failed to fetch S${raceInfo.season} R${raceInfo.race}: ${msg}`);
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
export async function saveRaceAnalysisData(season: number, race: number, data: RaceAnalysisResponse, trackId?: number) {
  await db.transaction(async (tx) => {
    // 1. Insert raw_race_data
    const [insertedAnalysis] = await tx.insert(rawRaceData).values({
      season,
      race,
      trackId,
      group: data.group ? String(data.group) : "Unknown",
      rawData: data as Record<string, unknown>,
    }).onConflictDoUpdate({
      target: [rawRaceData.season, rawRaceData.race],
      set: {
        trackId,
        group: data.group ? String(data.group) : "Unknown",
        rawData: data as Record<string, unknown>,
        updatedAt: new Date(),
      }
    }).returning({ id: rawRaceData.id });

    const rawRaceDataId = insertedAnalysis.id;

    // 1.5 Delete old children for this rawRaceDataId (in case it was an update)
    await tx.delete(raceFuelAnalytics).where(eq(raceFuelAnalytics.rawRaceDataId, rawRaceDataId));
    await tx.delete(raceDriverSnapshots).where(eq(raceDriverSnapshots.rawRaceDataId, rawRaceDataId));
    await tx.delete(raceCarSnapshots).where(eq(raceCarSnapshots.rawRaceDataId, rawRaceDataId));

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

  // API always returns lap 0 at index 0, so total driven laps is laps.length - 1
  const totalDrivenLaps = laps.length - 1;

  // Build the complete set of fast lap indices for the whole race.
  // Each boostLap marker in the API expands to a 3-lap window (N, N+1, N+2).
  // Math.min caps the window so it never exceeds the last driven lap.
  // Overlapping windows are deduplicated automatically by the Set.
  const boostLapSet = new Set<number>();
  for (let i = 1; i <= totalDrivenLaps; i++) {
    const lapBoost = laps[i]?.boostLap;
    if (lapBoost && lapBoost > 0) {
      for (let j = i; j <= Math.min(i + 2, totalDrivenLaps); j++) {
        boostLapSet.add(j);
      }
    }
  }

  let currentStintStartLap = 1;
  const PIT_STOP_FUEL_ERROR = 3; // The error margin "X% ... X+3%" interpreted as an absolute +3 value for safety.

  for (let i = 0; i <= pits.length; i++) {
    const isLastStint = i === pits.length;
    
    // Start fuel for this stint
    const startFuel = i === 0 ? data.startFuel : pits[i - 1].refilledTo;
    
    // Determine end lap for this stint
    const currentStintEndLap = isLastStint ? totalDrivenLaps : (pits[i].lap ?? totalDrivenLaps);
    
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

    // Lap count is pure arithmetic: start and end laps are already known from pit data
    const lapsInStint = currentStintEndLap - currentStintStartLap + 1;

    // Count fast laps by intersecting the pre-built boostLapSet with this stint's range
    const fastLapsInStint = [...boostLapSet]
      .filter(l => l >= currentStintStartLap && l <= currentStintEndLap)
      .length;

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

  // Aggregate full race stats only from valid stints (>= 10 laps).
  // fastLapsCount is accumulated per-stint to stay consistent with lapsAnalyzed:
  // if a short stint is excluded, its boost laps are excluded too.
  if (validStintsCount > 0 && fullRaceLapsAnalyzed === totalDrivenLaps) {
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
  toRace: number,
  overwrite: boolean = false
): Promise<{ season: number; race: number }[]> {
  const fullRange = generateRaceRange(fromSeason, fromRace, toSeason, toRace);
  
  if (overwrite) {
    return fullRange;
  }

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

