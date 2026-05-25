import { describe, it, expect } from "vitest";
import { verifyToken } from "../client";

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
