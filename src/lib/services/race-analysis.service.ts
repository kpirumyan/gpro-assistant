import { db } from "../db";
import { raceAnalysis, raceCarSnapshots, raceDriverSnapshots, raceFuelAnalytics } from "../db/schema";
import { fetchRaceAnalysis } from "../gpro/client";
import type { RaceAnalysisResponse } from "../gpro/types";

export interface SyncResult {
  syncedCount: number;
  stoppedReason: "already_exists" | "not_found" | "error" | "limit_reached";
  lastRaceChecked?: { season: number; race: number };
}

/**
 * Synchronizes race history by fetching past races in reverse chronological order.
 * Stops when a race is already in the database or when the API returns a 404 (race not found).
 */
export async function syncRaceHistory(
  token: string,
  startSeason: number,
  startRace: number,
  maxRacesToSync: number = 20
): Promise<SyncResult> {
  let currentSeason = startSeason;
  let currentRace = startRace;
  let syncedCount = 0;
  let stoppedReason: SyncResult["stoppedReason"] = "limit_reached";

  while (syncedCount < maxRacesToSync) {
    // Check if race exists in DB
    const existing = await db.query.raceAnalysis.findFirst({
      where: (ra, { and, eq }) => and(eq(ra.season, currentSeason), eq(ra.race, currentRace)),
    });

    if (existing) {
      console.log(`Race S${currentSeason} R${currentRace} already exists in DB. Stopping sync.`);
      stoppedReason = "already_exists";
      break;
    }

    try {
      console.log(`Fetching race analysis for S${currentSeason} R${currentRace}...`);
      const data = await fetchRaceAnalysis(token, currentSeason, currentRace);
      
      // Save data
      await saveRaceAnalysisData(currentSeason, currentRace, data);
      syncedCount++;

      // Move to previous race
      currentRace--;
      if (currentRace < 1) {
        currentSeason--;
        currentRace = 17; // Assuming max 17 races per season, if it's less, 404 will handle it.
      }
      
      // Safety break to avoid negative seasons
      if (currentSeason < 1) {
         stoppedReason = "not_found";
         break;
      }

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`Failed to fetch S${currentSeason} R${currentRace}: ${msg}`);
      if (msg.includes("not found")) {
        // Normal stop condition: previous race hasn't happened or doesn't exist
        stoppedReason = "not_found";
      } else {
        stoppedReason = "error";
      }
      break;
    }
  }

  return { 
    syncedCount, 
    stoppedReason,
    lastRaceChecked: { season: currentSeason, race: currentRace }
  };
}

/**
 * Saves the raw race data and extracts snapshots and fuel analytics.
 */
export async function saveRaceAnalysisData(season: number, race: number, data: RaceAnalysisResponse) {
  await db.transaction(async (tx) => {
    // 1. Insert race_analysis (Raw Data)
    const [insertedAnalysis] = await tx.insert(raceAnalysis).values({
      season,
      race,
      group: data.group ? String(data.group) : "Unknown",
      rawData: data as Record<string, unknown>,
    }).returning({ id: raceAnalysis.id });

    const raceAnalysisId = insertedAnalysis.id;

    // 2. Insert race_car_snapshots
    await tx.insert(raceCarSnapshots).values({
      raceAnalysisId,
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
        raceAnalysisId,
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
          raceAnalysisId,
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
