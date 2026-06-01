CREATE TABLE "race_tyre_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"raw_race_data_id" integer NOT NULL,
	"type" text NOT NULL,
	"stint_index" integer,
	"laps_analyzed" integer NOT NULL,
	"tyre" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "race_tyre_analytics" ADD CONSTRAINT "race_tyre_analytics_raw_race_data_id_raw_race_data_id_fk" FOREIGN KEY ("raw_race_data_id") REFERENCES "public"."raw_race_data"("id") ON DELETE no action ON UPDATE no action;