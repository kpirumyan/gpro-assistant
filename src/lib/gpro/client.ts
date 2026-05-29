import type { DriverProfileResponse, CarDataResponse, RaceAnalysisResponse, HistoryCalendarResponse, TrackProfileResponse } from "./types";

export class AuthError extends Error {
  constructor(message = "Invalid or expired API token") {
    super(message);
    this.name = "AuthError";
  }
}

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

  const response = await fetch(`${GPRO_API_BASE_URL}/DriProfile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthError();
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

  const response = await fetch(`${GPRO_API_BASE_URL}/UpdateCar`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthError();
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  interface RawUpdateCarResponse {
    lvlChassis: number; usaChassis: number;
    lvlEngine: number; usaEngine: number;
    lvlFWing: number; usaFWing: number;
    lvlRWing: number; usaRWing: number;
    lvlUnderbody: number; usaUnderbody: number;
    lvlSidepods: number; usaSidepods: number;
    lvlCooling: number; usaCooling: number;
    lvlGear: number; usaGear: number;
    lvlBrakes: number; usaBrakes: number;
    lvlSusp: number; usaSusp: number;
    lvlElectronics: number; usaElectronics: number;
  }
  const raw = await response.json() as RawUpdateCarResponse;
  return {
    parts: [
      { name: "Chassis", level: raw.lvlChassis, wear: raw.usaChassis },
      { name: "Engine", level: raw.lvlEngine, wear: raw.usaEngine },
      { name: "Front Wing", level: raw.lvlFWing, wear: raw.usaFWing },
      { name: "Rear Wing", level: raw.lvlRWing, wear: raw.usaRWing },
      { name: "Underbody", level: raw.lvlUnderbody, wear: raw.usaUnderbody },
      { name: "Sidepods", level: raw.lvlSidepods, wear: raw.usaSidepods },
      { name: "Cooling", level: raw.lvlCooling, wear: raw.usaCooling },
      { name: "Gearbox", level: raw.lvlGear, wear: raw.usaGear },
      { name: "Brakes", level: raw.lvlBrakes, wear: raw.usaBrakes },
      { name: "Suspension", level: raw.lvlSusp, wear: raw.usaSusp },
      { name: "Electronics", level: raw.lvlElectronics, wear: raw.usaElectronics },
    ],
  };
}

/**
 * Fetches the race analysis data from the GPRO API for a specific season and race.
 * Throws on authentication, server errors, or if the race data is unavailable.
 */
export async function fetchRaceAnalysis(token: string, season: number, race: number): Promise<RaceAnalysisResponse> {
  if (!token) throw new Error("API token is required");
  if (!season || !race) throw new Error("Season and race parameters are required");

  const response = await fetch(`${GPRO_API_BASE_URL}/RaceAnalysis?SR=${season},${race}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthError();
    }
    if (response.status === 404) {
      throw new Error(`Race analysis not found for Season ${season}, Race ${race}`);
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<RaceAnalysisResponse>;
}

/**
 * Fetches the race calendar from the GPRO API.
 */
export async function fetchCalendar(token: string): Promise<unknown> {
  if (!token) throw new Error("API token is required");

  const response = await fetch(`${GPRO_API_BASE_URL}/Calendar`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthError();
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fetches the history calendar for a specific season.
 */
export async function fetchHistoryCalendar(token: string, season: number): Promise<HistoryCalendarResponse> {
  if (!token) throw new Error("API token is required");
  if (!season) throw new Error("Season parameter is required");

  const response = await fetch(`${GPRO_API_BASE_URL}/History?table=Calendar&season=${season}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthError();
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<HistoryCalendarResponse>;
}

/**
 * Fetches track profile details by track id.
 */
export async function fetchTrackProfile(token: string, trackId: number | string): Promise<TrackProfileResponse> {
  if (!token) throw new Error("API token is required");
  if (!trackId) throw new Error("Track ID is required");

  const response = await fetch(`${GPRO_API_BASE_URL}/TrackProfile?id=${trackId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new AuthError();
    }
    throw new Error(`GPRO API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<TrackProfileResponse>;
}
