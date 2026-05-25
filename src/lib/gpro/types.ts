/**
 * GPRO API response types.
 * Keep in sync with the API documentation at https://api.gpro.net
 */

// --- Driver Profile ---

export interface DriverProfileResponse {
  driName: string;
  overall: number;
  concentration: number;
  talent: number;
  aggressiveness: number;
  experience: number;
  techInsight: number;
  stamina: number;
  charisma: number;
  motivation: number;
  reputation: number;
  weight: number;
  age: number;
  energy: number;
}

// --- Car Data ---

export interface CarPartResponse {
  name: string;
  level: number;
  wear: number;
}

export interface CarDataResponse {
  parts: CarPartResponse[];
}
