import type { DriverProfileResponse, CarDataResponse } from "./types";

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

/**
 * Fetches the current driver profile from the GPRO API.
 * Throws on authentication or server errors.
 */
export async function fetchDriverProfile(token: string): Promise<DriverProfileResponse> {
  if (!token) throw new Error("API token is required");

  const response = await fetch(`${GPRO_API_BASE_URL}/GetDriverProfile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid or expired API token");
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<DriverProfileResponse>;
}

/**
 * Fetches the current car data from the GPRO API.
 * Throws on authentication or server errors.
 */
export async function fetchCarData(token: string): Promise<CarDataResponse> {
  if (!token) throw new Error("API token is required");

  const response = await fetch(`${GPRO_API_BASE_URL}/GetCar`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid or expired API token");
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<CarDataResponse>;
}
