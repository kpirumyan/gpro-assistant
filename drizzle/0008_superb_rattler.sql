ALTER TABLE "race_fuel_analytics" RENAME COLUMN "avg_fuel_per_lap_min" TO "avg_fuel_per_km_min";
ALTER TABLE "race_fuel_analytics" RENAME COLUMN "avg_fuel_per_lap_max" TO "avg_fuel_per_km_max";

-- Convert existing data (divide L/lap by lap distance in km)
UPDATE "race_fuel_analytics"
SET avg_fuel_per_km_min = race_fuel_analytics.avg_fuel_per_km_min / CAST(t.lap_distance AS numeric),
    avg_fuel_per_km_max = race_fuel_analytics.avg_fuel_per_km_max / CAST(t.lap_distance AS numeric)
FROM "raw_race_data" rrd
JOIN "tracks" t ON rrd.track_id = t.id
WHERE race_fuel_analytics.raw_race_data_id = rrd.id;