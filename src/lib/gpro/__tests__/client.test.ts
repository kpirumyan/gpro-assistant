import { describe, it, expect } from "vitest";
import { verifyToken, fetchDriverProfile, fetchCarData } from "../client";

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
    expect(profile).toMatchObject({
      driName: "Tom Herbert",
      overall: 90,
      concentration: 27,
      talent: 244,
    });
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
      level: 1,
      wear: 48,
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
