const GPRO_API_BASE_URL = "https://gpro.net/en/backend/api/v2";

/**
 * Verifies the provided GPRO API token by making a lightweight request.
 * Returns true if the token is valid, false otherwise.
 */
export async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch(`${GPRO_API_BASE_URL}/Menu`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    return response.ok;
  } catch (error) {
    console.error("Failed to verify GPRO API token:", error);
    return false;
  }
}
