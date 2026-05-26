import { pgTable, serial, text, integer, boolean, timestamp, jsonb, numeric, unique } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const gproCredentials = pgTable("gpro_credentials", {
  id: serial("id").primaryKey(),
  token: text("token").notNull(),
  isValid: boolean("is_valid").notNull().default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const driverProfiles = pgTable("driver_profiles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  overall: integer("overall").notNull(),
  concentration: integer("concentration").notNull(),
  talent: integer("talent").notNull(),
  aggression: integer("aggression").notNull(),
  experience: integer("experience").notNull(),
  technicalInsight: integer("technical_insight").notNull(),
  stamina: integer("stamina").notNull(),
  charisma: integer("charisma").notNull(),
  motivation: integer("motivation").notNull(),
  reputation: integer("reputation").notNull(),
  weight: integer("weight").notNull(),
  age: integer("age").notNull(),
  energy: integer("energy").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const carParts = pgTable("car_parts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  level: integer("level").notNull(),
  wear: integer("wear").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const raceAnalysis = pgTable("race_analysis", {
  id: serial("id").primaryKey(),
  season: integer("season").notNull(),
  race: integer("race").notNull(),
  group: text("group").notNull(),
  rawData: jsonb("raw_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    seasonRaceUnique: unique().on(table.season, table.race)
  }
});

export const raceFuelAnalytics = pgTable("race_fuel_analytics", {
  id: serial("id").primaryKey(),
  raceAnalysisId: integer("race_analysis_id").references(() => raceAnalysis.id).notNull(),
  type: text("type").notNull(),
  stintIndex: integer("stint_index"),
  lapsAnalyzed: integer("laps_analyzed").notNull(),
  fastLapsCount: integer("fast_laps_count").notNull(),
  avgFuelPerLapMin: numeric("avg_fuel_per_lap_min").notNull(),
  avgFuelPerLapMax: numeric("avg_fuel_per_lap_max").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const raceCarSnapshots = pgTable("race_car_snapshots", {
  id: serial("id").primaryKey(),
  raceAnalysisId: integer("race_analysis_id").references(() => raceAnalysis.id).notNull(),
  power: integer("power").notNull(),
  handling: integer("handling").notNull(),
  acceleration: integer("acceleration").notNull(),
  chassisLvl: integer("chassis_lvl").notNull(),
  chassisStartWear: integer("chassis_start_wear").notNull(),
  chassisFinishWear: integer("chassis_finish_wear").notNull(),
  engineLvl: integer("engine_lvl").notNull(),
  engineStartWear: integer("engine_start_wear").notNull(),
  engineFinishWear: integer("engine_finish_wear").notNull(),
  fWingLvl: integer("f_wing_lvl").notNull(),
  fWingStartWear: integer("f_wing_start_wear").notNull(),
  fWingFinishWear: integer("f_wing_finish_wear").notNull(),
  rWingLvl: integer("r_wing_lvl").notNull(),
  rWingStartWear: integer("r_wing_start_wear").notNull(),
  rWingFinishWear: integer("r_wing_finish_wear").notNull(),
  underbodyLvl: integer("underbody_lvl").notNull(),
  underbodyStartWear: integer("underbody_start_wear").notNull(),
  underbodyFinishWear: integer("underbody_finish_wear").notNull(),
  sidepodsLvl: integer("sidepods_lvl").notNull(),
  sidepodsStartWear: integer("sidepods_start_wear").notNull(),
  sidepodsFinishWear: integer("sidepods_finish_wear").notNull(),
  coolingLvl: integer("cooling_lvl").notNull(),
  coolingStartWear: integer("cooling_start_wear").notNull(),
  coolingFinishWear: integer("cooling_finish_wear").notNull(),
  gearboxLvl: integer("gearbox_lvl").notNull(),
  gearboxStartWear: integer("gearbox_start_wear").notNull(),
  gearboxFinishWear: integer("gearbox_finish_wear").notNull(),
  brakesLvl: integer("brakes_lvl").notNull(),
  brakesStartWear: integer("brakes_start_wear").notNull(),
  brakesFinishWear: integer("brakes_finish_wear").notNull(),
  suspensionLvl: integer("suspension_lvl").notNull(),
  suspensionStartWear: integer("suspension_start_wear").notNull(),
  suspensionFinishWear: integer("suspension_finish_wear").notNull(),
  electronicsLvl: integer("electronics_lvl").notNull(),
  electronicsStartWear: integer("electronics_start_wear").notNull(),
  electronicsFinishWear: integer("electronics_finish_wear").notNull(),
});

export const raceDriverSnapshots = pgTable("race_driver_snapshots", {
  id: serial("id").primaryKey(),
  raceAnalysisId: integer("race_analysis_id").references(() => raceAnalysis.id).notNull(),
  name: text("name").notNull(),
  overall: integer("overall").notNull(),
  concentration: integer("concentration").notNull(),
  talent: integer("talent").notNull(),
  aggression: integer("aggression").notNull(),
  experience: integer("experience").notNull(),
  technicalInsight: integer("technical_insight").notNull(),
  stamina: integer("stamina").notNull(),
  charisma: integer("charisma").notNull(),
  motivation: integer("motivation").notNull(),
  reputation: integer("reputation").notNull(),
  weight: integer("weight").notNull(),
});
