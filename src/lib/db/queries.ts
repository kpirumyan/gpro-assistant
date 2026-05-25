import { eq } from "drizzle-orm";
import { db } from "./index";
import { settings, driverProfiles, carParts } from "./schema";
import type { DriverProfileResponse, CarPartResponse } from "@/lib/gpro/types";

export async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
    if (result.length > 0) {
      return result[0].value;
    }
    return null;
  } catch (error) {
    console.error(`Failed to get setting ${key}:`, error);
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  try {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  } catch (error) {
    console.error(`Failed to set setting ${key}:`, error);
    throw new Error(`Failed to save setting ${key}`);
  }
}

export async function getGproApiKey(): Promise<string | null> {
  return getSetting("gpro-api-key");
}

// --- Driver Profile ---

export async function getDriverProfile() {
  try {
    const result = await db.select().from(driverProfiles).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("Failed to get driver profile:", error);
    return null;
  }
}

export async function upsertDriverProfile(data: DriverProfileResponse): Promise<void> {
  try {
    // Single-user app: always use id=1 for the one driver profile
    const existing = await db.select({ id: driverProfiles.id }).from(driverProfiles).limit(1);

    if (existing.length > 0) {
      await db
        .update(driverProfiles)
        .set({
          name: data.name,
          overall: data.overall,
          concentration: data.concentration,
          talent: data.talent,
          aggression: data.aggression,
          experience: data.experience,
          technicalInsight: data.technicalInsight,
          stamina: data.stamina,
          charisma: data.charisma,
          motivation: data.motivation,
          reputation: data.reputation,
          weight: data.weight,
          age: data.age,
          energy: data.energy,
          updatedAt: new Date(),
        })
        .where(eq(driverProfiles.id, existing[0].id));
    } else {
      await db.insert(driverProfiles).values({
        name: data.name,
        overall: data.overall,
        concentration: data.concentration,
        talent: data.talent,
        aggression: data.aggression,
        experience: data.experience,
        technicalInsight: data.technicalInsight,
        stamina: data.stamina,
        charisma: data.charisma,
        motivation: data.motivation,
        reputation: data.reputation,
        weight: data.weight,
        age: data.age,
        energy: data.energy,
      });
    }
  } catch (error) {
    console.error("Failed to upsert driver profile:", error);
    throw new Error("Failed to save driver profile");
  }
}

// --- Car Parts ---

export async function getCarParts() {
  try {
    return await db.select().from(carParts);
  } catch (error) {
    console.error("Failed to get car parts:", error);
    return [];
  }
}

export async function upsertCarParts(parts: CarPartResponse[]): Promise<void> {
  try {
    for (const part of parts) {
      await db
        .insert(carParts)
        .values({
          name: part.name,
          level: part.level,
          wear: part.wear,
        })
        .onConflictDoUpdate({
          target: carParts.name,
          set: {
            level: part.level,
            wear: part.wear,
            updatedAt: new Date(),
          },
        });
    }
  } catch (error) {
    console.error("Failed to upsert car parts:", error);
    throw new Error("Failed to save car parts");
  }
}
