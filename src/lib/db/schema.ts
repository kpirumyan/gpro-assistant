import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

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
