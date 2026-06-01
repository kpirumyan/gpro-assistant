import { describe, it, expect } from "vitest";
import {
  verifyToken,
  fetchDriverProfile,
  fetchCarData,
  fetchRaceAnalysis,
  AuthError,
  fetchOffice,
  fetchCalendar,
  fetchHistoryCalendar,
  fetchTrackProfile,
} from "../client";
import { server } from "../../../test/msw/server";
import { http, HttpResponse } from "msw";
import driverProfileFixture from "../__fixtures__/driver-profile.json";
import carDataFixture from "../__fixtures__/car-data.json";
import raceAnalysisFixture from "../__fixtures__/race-analysis.json";
import calendarFixture from "../__fixtures__/calendar.json";
import historyCalendarFixture from "../__fixtures__/history-calendar.json";
import trackProfileFixture from "../__fixtures__/track-profile.json";

describe("verifyToken", () => {
  it("should return true for a valid token", async () => {
    const isValid = await verifyToken("VALID_TOKEN");
    expect(isValid).toBe(true);
  });

  it("should return false for an invalid token", async () => {
    const isValid = await verifyToken("INVALID_TOKEN");
    expect(isValid).toBe(false);
  });

  it("should return false if no token is provided", async () => {
    const isValid = await verifyToken("");
    expect(isValid).toBe(false);
  });
});

describe("fetchDriverProfile", () => {
  it("should return driver profile data for a valid token", async () => {
    const profile = await fetchDriverProfile("VALID_TOKEN");
    expect(profile).toEqual(driverProfileFixture);
  });

  it("should throw on invalid token", async () => {
    await expect(fetchDriverProfile("INVALID_TOKEN")).rejects.toThrow(
      "Invalid or expired API token"
    );
  });

  it("should throw on empty token", async () => {
    await expect(fetchDriverProfile("")).rejects.toThrow(
      "API token is required"
    );
  });
});

describe("fetchCarData", () => {
  it("should return car data for a valid token", async () => {
    const data = await fetchCarData("VALID_TOKEN");
    expect(data.parts).toHaveLength(11);
    expect(data.parts[0]).toMatchObject({
      name: "Chassis",
      level: carDataFixture.lvlChassis,
      wear: carDataFixture.usaChassis,
    });
  });

  it("should throw on invalid token", async () => {
    await expect(fetchCarData("INVALID_TOKEN")).rejects.toThrow(
      "Invalid or expired API token"
    );
  });

  it("should throw on empty token", async () => {
    await expect(fetchCarData("")).rejects.toThrow(
      "API token is required"
    );
  });
});

describe("fetchRaceAnalysis", () => {
  it("should return race analysis data for a valid token", async () => {
    const data = await fetchRaceAnalysis("VALID_TOKEN", 99, 1);
    expect(data.startFuel).toBe(raceAnalysisFixture.startFuel);
    expect(data.pits).toHaveLength(raceAnalysisFixture.pits.length);
    expect(data.laps).toHaveLength(raceAnalysisFixture.laps.length);
  });

  it("should throw on invalid token", async () => {
    await expect(fetchRaceAnalysis("INVALID_TOKEN", 99, 1)).rejects.toThrow(
      "Invalid or expired API token"
    );
  });

  it("should throw on empty token", async () => {
    await expect(fetchRaceAnalysis("", 99, 1)).rejects.toThrow(
      "API token is required"
    );
  });

  it("should throw on missing season or race", async () => {
    await expect(fetchRaceAnalysis("VALID_TOKEN", 0, 1)).rejects.toThrow(
      "Season and race parameters are required"
    );
    await expect(fetchRaceAnalysis("VALID_TOKEN", 99, 0)).rejects.toThrow(
      "Season and race parameters are required"
    );
  });

  it("should throw when race analysis is not found", async () => {
    await expect(fetchRaceAnalysis("VALID_TOKEN", 1, 1)).rejects.toThrow(
      "Race analysis not found for Season 1, Race 1"
    );
  });
});

describe("fetchOffice", () => {
  it("should return office data with seasonNb for a valid token", async () => {
    server.use(
      http.get("https://gpro.net/en/backend/api/v2/Office", ({ request }) => {
        if (request.headers.get("Authorization") === "Bearer VALID_TOKEN") {
          return HttpResponse.json({ seasonNb: 110 }, { status: 200 });
        }
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
      })
    );

    const data = await fetchOffice("VALID_TOKEN");
    expect(data).toEqual({ seasonNb: 110 });
  });

  it("should throw AuthError on invalid token", async () => {
    server.use(
      http.get("https://gpro.net/en/backend/api/v2/Office", () => {
        return HttpResponse.json({ error: "Unauthorized" }, { status: 401 });
      })
    );

    await expect(fetchOffice("INVALID_TOKEN")).rejects.toThrow(AuthError);
  });

  it("should throw on empty token", async () => {
    await expect(fetchOffice("")).rejects.toThrow(
      "API token is required"
    );
  });
});

describe("fetchCalendar", () => {
  it("should return calendar data for a valid token", async () => {
    const calendar = await fetchCalendar("VALID_TOKEN");
    expect(calendar).toEqual(calendarFixture);
  });

  it("should throw AuthError on invalid token", async () => {
    await expect(fetchCalendar("INVALID_TOKEN")).rejects.toThrow(AuthError);
  });

  it("should throw on empty token", async () => {
    await expect(fetchCalendar("")).rejects.toThrow(
      "API token is required"
    );
  });
});

describe("fetchHistoryCalendar", () => {
  it("should return history calendar data for a valid token and season", async () => {
    const data = await fetchHistoryCalendar("VALID_TOKEN", 99);
    expect(data).toEqual(historyCalendarFixture);
  });

  it("should throw AuthError on invalid token", async () => {
    await expect(fetchHistoryCalendar("INVALID_TOKEN", 99)).rejects.toThrow(AuthError);
  });

  it("should throw on empty token", async () => {
    await expect(fetchHistoryCalendar("", 99)).rejects.toThrow(
      "API token is required"
    );
  });

  it("should throw on missing season", async () => {
    await expect(fetchHistoryCalendar("VALID_TOKEN", 0)).rejects.toThrow(
      "Season parameter is required"
    );
  });
});

describe("fetchTrackProfile", () => {
  it("should return track profile for a valid token and trackId", async () => {
    const trackProfile = await fetchTrackProfile("VALID_TOKEN", 1);
    expect(trackProfile).toEqual(trackProfileFixture);
  });

  it("should throw AuthError on invalid token", async () => {
    await expect(fetchTrackProfile("INVALID_TOKEN", 1)).rejects.toThrow(AuthError);
  });

  it("should throw on empty token", async () => {
    await expect(fetchTrackProfile("", 1)).rejects.toThrow(
      "API token is required"
    );
  });

  it("should throw on missing track ID", async () => {
    await expect(fetchTrackProfile("VALID_TOKEN", "")).rejects.toThrow(
      "Track ID is required"
    );
  });
});
