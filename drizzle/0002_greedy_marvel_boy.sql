CREATE TABLE "gpro_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"is_valid" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
