"use server";

import { upsertGproCredentials } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { verifyToken } from "@/lib/gpro/client";

export type SaveApiKeyState = {
  message?: string;
  error?: string;
};

export async function saveApiKey(
  prevState: SaveApiKeyState,
  formData: FormData
): Promise<SaveApiKeyState> {
  const key = formData.get("gproApiKey");

  if (!key || typeof key !== "string" || !key.trim()) {
    return { error: "API key is required" };
  }

  try {
    const isValid = await verifyToken(key.trim());
    if (!isValid) {
      return { error: "Invalid or expired API token. Please check and try again." };
    }

    await upsertGproCredentials({
      token: key.trim(),
    });
    revalidatePath("/settings");
    return { message: "API key saved successfully" };
  } catch (error) {
    console.error("Failed to save API key action:", error);
    return { error: "Failed to save API key" };
  }
}

