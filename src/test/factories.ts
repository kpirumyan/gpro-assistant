import {
  gproCredentials,
  driverProfiles,
  carParts,
  raceAnalysis,
  raceFuelAnalytics,
  raceCarSnapshots,
  raceDriverSnapshots,
} from '@/lib/db/schema';

export function buildGproCredentials(overrides?: Partial<typeof gproCredentials.$inferSelect>): typeof gproCredentials.$inferSelect {
  return {
    id: 1,
    token: 'test-token',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildDriverProfile(overrides?: Partial<typeof driverProfiles.$inferSelect>): typeof driverProfiles.$inferSelect {
  return {
    id: 1,
    name: 'Test Driver',
    overall: 100,
    concentration: 100,
    talent: 100,
    aggression: 100,
    experience: 100,
    technicalInsight: 100,
    stamina: 100,
    charisma: 100,
    motivation: 100,
    reputation: 100,
    weight: 70,
    age: 25,
    energy: 100,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildCarPart(overrides?: Partial<typeof carParts.$inferSelect>): typeof carParts.$inferSelect {
  return {
    id: 1,
    name: 'Chassis',
    level: 5,
    wear: 10,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildRaceAnalysis(overrides?: Partial<typeof raceAnalysis.$inferSelect>): typeof raceAnalysis.$inferSelect {
  return {
    id: 1,
    season: 100,
    race: 1,
    group: 'A',
    rawData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildRaceFuelAnalytics(overrides?: Partial<typeof raceFuelAnalytics.$inferSelect>): typeof raceFuelAnalytics.$inferSelect {
  return {
    id: 1,
    raceAnalysisId: 1,
    type: 'stint',
    stintIndex: 1,
    lapsAnalyzed: 10,
    fastLapsCount: 0,
    avgFuelPerLapMin: "5.0",
    avgFuelPerLapMax: "5.5",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function buildRaceCarSnapshot(overrides?: Partial<typeof raceCarSnapshots.$inferSelect>): typeof raceCarSnapshots.$inferSelect {
  return {
    id: 1,
    raceAnalysisId: 1,
    power: 100,
    handling: 100,
    acceleration: 100,
    chassisLvl: 1, chassisStartWear: 0, chassisFinishWear: 10,
    engineLvl: 1, engineStartWear: 0, engineFinishWear: 10,
    fWingLvl: 1, fWingStartWear: 0, fWingFinishWear: 10,
    rWingLvl: 1, rWingStartWear: 0, rWingFinishWear: 10,
    underbodyLvl: 1, underbodyStartWear: 0, underbodyFinishWear: 10,
    sidepodsLvl: 1, sidepodsStartWear: 0, sidepodsFinishWear: 10,
    coolingLvl: 1, coolingStartWear: 0, coolingFinishWear: 10,
    gearboxLvl: 1, gearboxStartWear: 0, gearboxFinishWear: 10,
    brakesLvl: 1, brakesStartWear: 0, brakesFinishWear: 10,
    suspensionLvl: 1, suspensionStartWear: 0, suspensionFinishWear: 10,
    electronicsLvl: 1, electronicsStartWear: 0, electronicsFinishWear: 10,
    ...overrides,
  };
}

export function buildRaceDriverSnapshot(overrides?: Partial<typeof raceDriverSnapshots.$inferSelect>): typeof raceDriverSnapshots.$inferSelect {
  return {
    id: 1,
    raceAnalysisId: 1,
    name: 'Test Driver',
    overall: 100,
    concentration: 100,
    talent: 100,
    aggression: 100,
    experience: 100,
    technicalInsight: 100,
    stamina: 100,
    charisma: 100,
    motivation: 100,
    reputation: 100,
    weight: 70,
    ...overrides,
  };
}
