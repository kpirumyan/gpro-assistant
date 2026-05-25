import { eq } from "drizzle-orm";
import { db } from "./index";
import { settings } from "./schema";

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
