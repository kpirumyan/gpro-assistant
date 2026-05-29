ALTER TABLE "race_analysis" RENAME TO "raw_race_data";
ALTER TABLE "raw_race_data" RENAME CONSTRAINT "race_analysis_season_race_unique" TO "raw_race_data_season_race_unique";

ALTER TABLE "race_car_snapshots" RENAME COLUMN "race_analysis_id" TO "raw_race_data_id";
ALTER TABLE "race_driver_snapshots" RENAME COLUMN "race_analysis_id" TO "raw_race_data_id";
ALTER TABLE "race_fuel_analytics" RENAME COLUMN "race_analysis_id" TO "raw_race_data_id";

ALTER TABLE "race_car_snapshots" RENAME CONSTRAINT "race_car_snapshots_race_analysis_id_race_analysis_id_fk" TO "race_car_snapshots_raw_race_data_id_raw_race_data_id_fk";
ALTER TABLE "race_driver_snapshots" RENAME CONSTRAINT "race_driver_snapshots_race_analysis_id_race_analysis_id_fk" TO "race_driver_snapshots_raw_race_data_id_raw_race_data_id_fk";
ALTER TABLE "race_fuel_analytics" RENAME CONSTRAINT "race_fuel_analytics_race_analysis_id_race_analysis_id_fk" TO "race_fuel_analytics_raw_race_data_id_raw_race_data_id_fk";