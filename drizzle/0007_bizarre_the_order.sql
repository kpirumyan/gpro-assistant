CREATE TABLE IF NOT EXISTS "season_calendars" (
	"id" serial PRIMARY KEY NOT NULL,
	"season" integer NOT NULL,
	"race" integer NOT NULL,
	"track_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "season_calendars_season_race_unique" UNIQUE("season","race")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracks" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"power" integer NOT NULL,
	"acceleration" integer NOT NULL,
	"handling" integer NOT NULL,
	"downforce" text NOT NULL,
	"overtaking" text NOT NULL,
	"susp_rigidity" text NOT NULL,
	"fuel_consumption" text NOT NULL,
	"tyre_wear" text NOT NULL,
	"grip_level" text NOT NULL,
	"laps" integer NOT NULL,
	"race_distance" text NOT NULL,
	"lap_distance" text NOT NULL,
	"avg_speed" text NOT NULL,
	"time_in_out_pits" text NOT NULL,
	"nb_turns" integer NOT NULL,
	"category" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "raw_race_data" ADD COLUMN "track_id" integer;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "raw_race_data" ADD CONSTRAINT "raw_race_data_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;