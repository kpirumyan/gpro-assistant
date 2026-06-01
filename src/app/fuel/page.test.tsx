import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import FuelPage from "./page";

vi.mock("@/lib/db/queries", () => ({
  getFuelAnalyticsList: vi.fn().mockResolvedValue([]),
  getLatestSyncedRace: vi.fn().mockResolvedValue(null),
}));

describe("FuelPage", () => {
  it("renders the fuel page without crashing and displays the shell", () => {
    render(<FuelPage />);
    expect(screen.getByRole("heading", { name: "Fuel consumption" })).toBeInTheDocument();
    
    // The Suspense fallback should be displayed initially because FuelContent is async
    const loader = document.querySelector(".lucide-loader-circle");
    expect(loader).toBeInTheDocument();
  });
});
