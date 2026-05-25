CREATE TABLE "car_parts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"level" integer NOT NULL,
	"wear" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "car_parts_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "driver_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"weight" integer NOT NULL,
	"age" integer NOT NULL,
	"energy" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
