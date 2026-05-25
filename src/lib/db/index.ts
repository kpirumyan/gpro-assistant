import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

export const db = drizzle(sql, { schema });

if (process.env.NODE_ENV === "development") {
  import("drizzle-orm/vercel-postgres/migrator")
    .then(({ migrate }) => {
      console.log("Running development migrations...");
      return migrate(db, { migrationsFolder: "./drizzle" });
    })
    .then(() => {
      console.log("Migrations completed successfully.");
    })
    .catch((err) => {
      console.error("Failed to run migrations in development:", err);
    });
}

