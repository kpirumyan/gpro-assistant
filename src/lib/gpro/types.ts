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

// --- Race Analysis ---

export interface RaceAnalysisCarPart {
  lvl: number;
  startWear: number;
  finishWear: number;
}

export interface RaceAnalysisResponse {
  driver?: {
    name?: string;
    overall?: number;
    concentration?: number;
    talent?: number;
    aggressiveness?: number;
    experience?: number;
    techInsight?: number;
    stamina?: number;
    charisma?: number;
    motivation?: number;
    reputation?: number;
    weight?: number;
    [key: string]: unknown;
  };
  carPower?: number;
  handling?: number;
  acceleration?: number;
  chassis?: RaceAnalysisCarPart;
  engine?: RaceAnalysisCarPart;
  fWing?: RaceAnalysisCarPart;
  rWing?: RaceAnalysisCarPart;
  underbody?: RaceAnalysisCarPart;
  sidepods?: RaceAnalysisCarPart;
  cooling?: RaceAnalysisCarPart;
  gearbox?: RaceAnalysisCarPart;
  brakes?: RaceAnalysisCarPart;
  suspension?: RaceAnalysisCarPart;
  electronics?: RaceAnalysisCarPart;
  startFuel?: number;
  finishFuel?: number;
  pits?: Array<{
    lap?: number;
    fuelLeft?: number;
    refilledTo?: number;
    [key: string]: unknown;
  }>;
  laps?: Array<{
    boostLap?: number;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}
