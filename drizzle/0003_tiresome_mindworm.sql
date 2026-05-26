CREATE TABLE "race_analysis" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"race" integer NOT NULL,
	"group" text NOT NULL,
	"raw_data" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "race_analysis_season_race_unique" UNIQUE("season","race")
);
--> statement-breakpoint
CREATE TABLE "race_car_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"race_analysis_id" integer NOT NULL,
	"power" integer NOT NULL,
	"handling" integer NOT NULL,
	"acceleration" integer NOT NULL,
	"chassis_lvl" integer NOT NULL,
	"chassis_start_wear" integer NOT NULL,
	"chassis_finish_wear" integer NOT NULL,
	"engine_lvl" integer NOT NULL,
	"engine_start_wear" integer NOT NULL,
	"engine_finish_wear" integer NOT NULL,
	"f_wing_lvl" integer NOT NULL,
	"f_wing_start_wear" integer NOT NULL,
	"f_wing_finish_wear" integer NOT NULL,
	"r_wing_lvl" integer NOT NULL,
	"r_wing_start_wear" integer NOT NULL,
	"r_wing_finish_wear" integer NOT NULL,
	"underbody_lvl" integer NOT NULL,
	"underbody_start_wear" integer NOT NULL,
	"underbody_finish_wear" integer NOT NULL,
	"sidepods_lvl" integer NOT NULL,
	"sidepods_start_wear" integer NOT NULL,
	"sidepods_finish_wear" integer NOT NULL,
	"cooling_lvl" integer NOT NULL,
	"cooling_start_wear" integer NOT NULL,
	"cooling_finish_wear" integer NOT NULL,
	"gearbox_lvl" integer NOT NULL,
	"gearbox_start_wear" integer NOT NULL,
	"gearbox_finish_wear" integer NOT NULL,
	"brakes_lvl" integer NOT NULL,
	"brakes_start_wear" integer NOT NULL,
	"brakes_finish_wear" integer NOT NULL,
	"suspension_lvl" integer NOT NULL,
	"suspension_start_wear" integer NOT NULL,
	"suspension_finish_wear" integer NOT NULL,
	"electronics_lvl" integer NOT NULL,
	"electronics_start_wear" integer NOT NULL,
	"electronics_finish_wear" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_driver_snapshots" (
	"id" serial PRIMARY KEY NOT NULL,
	"race_analysis_id" integer NOT NULL,
	"name" text NOT NULL,
	"overall" integer NOT NULL,
	"concentration" integer NOT NULL,
	"talent" integer NOT NULL,
	"aggression" integer NOT NULL,
	"experience" integer NOT NULL,
	"technical_insight" integer NOT NULL,
	"stamina" integer NOT NULL,
	"charisma" integer NOT NULL,
	"motivation" integer NOT NULL,
	"reputation" integer NOT NULL,
	"weight" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "race_fuel_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"race_analysis_id" integer NOT NULL,
	"type" text NOT NULL,
	"stint_index" integer,
	"laps_analyzed" integer NOT NULL,
	"fast_laps_count" integer NOT NULL,
	"avg_fuel_per_lap_min" numeric NOT NULL,
	"avg_fuel_per_lap_max" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "race_car_snapshots" ADD CONSTRAINT "race_car_snapshots_race_analysis_id_race_analysis_id_fk" FOREIGN KEY ("race_analysis_id") REFERENCES "public"."race_analysis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_driver_snapshots" ADD CONSTRAINT "race_driver_snapshots_race_analysis_id_race_analysis_id_fk" FOREIGN KEY ("race_analysis_id") REFERENCES "public"."race_analysis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "race_fuel_analytics" ADD CONSTRAINT "race_fuel_analytics_race_analysis_id_race_analysis_id_fk" FOREIGN KEY ("race_analysis_id") REFERENCES "public"."race_analysis"("id") ON DELETE no action ON UPDATE no action;