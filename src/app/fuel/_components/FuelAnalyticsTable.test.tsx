import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FuelAnalyticsTable } from "./FuelAnalyticsTable";
import type { FuelAnalyticsListEntry } from "@/lib/db/queries";

const mockData: FuelAnalyticsListEntry[] = [
  {
    id: 1,
    season: 100,
    race: 1,
    type: "full_race",
    stintIndex: null,
    lapsAnalyzed: 50,
    fastLapsCount: 2,
    trackFuelConsumption: "High",
    trackName: null,
    pilotName: null,
    avgFuelPerKmMin: "0.250",
    avgFuelPerKmMax: "0.300",
    createdAt: new Date(),
    tyre: null,
  } as FuelAnalyticsListEntry,
  {
    id: 2,
    season: 100,
    race: 1,
    type: "stint",
    stintIndex: 1,
    lapsAnalyzed: 20,
    fastLapsCount: 0,
    trackFuelConsumption: "High",
    trackName: null,
    pilotName: null,
    avgFuelPerKmMin: "0.200",
    avgFuelPerKmMax: "0.200",
    createdAt: new Date(),
    tyre: "Soft",
  } as FuelAnalyticsListEntry,
  {
    id: 3,
    season: 100,
    race: 1,
    type: "stint",
    stintIndex: 2,
    lapsAnalyzed: 15,
    fastLapsCount: 0,
    trackFuelConsumption: "High",
    trackName: null,
    pilotName: null,
    avgFuelPerKmMin: "0.210",
    avgFuelPerKmMax: "0.210",
    createdAt: new Date(),
    tyre: "Extra Soft",
  } as FuelAnalyticsListEntry
];

describe("FuelAnalyticsTable", () => {
  it("renders with default L/km unit", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    // Header should be L/km
    expect(screen.getByText("Est. Consumption (L/km)")).toBeInTheDocument();
    
    // Values should be formatted to 2 decimal places
    expect(screen.getByText("0.25 - 0.30")).toBeInTheDocument();
    expect(screen.getByText("0.20")).toBeInTheDocument();
  });

  it("updates values when switched to L/100km", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    // Find the unit selector. It's the third combobox (after pilot and consumption filters).
    const selector = screen.getAllByRole("combobox")[2];
    
    // Change to L/100km
    fireEvent.change(selector, { target: { value: 'l_100km' } });
    
    // Header should update
    expect(screen.getByText("Est. Consumption (L/100km)")).toBeInTheDocument();
    
    // Values should be multiplied by 100
    // 0.250 * 100 = 25.00, 0.300 * 100 = 30.00
    expect(screen.getByText("25.00 - 30.00")).toBeInTheDocument();
    expect(screen.getByText("20.00")).toBeInTheDocument();
  });

  it("updates and swaps min/max when switched to km/L", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    const selector = screen.getAllByRole("combobox")[2];
    
    // Change to km/L
    fireEvent.change(selector, { target: { value: 'km_l' } });
    
    // Header should update
    expect(screen.getByText("Est. Consumption (km/L)")).toBeInTheDocument();
    
    // Values should be inverted: 1 / 0.300 = 3.33, 1 / 0.250 = 4.00
    // So the range string should be "3.33 - 4.00"
    // For 0.200: 1 / 0.200 = 5.00
    expect(screen.getByText("3.33 - 4.00")).toBeInTheDocument();
    expect(screen.getByText("5.00")).toBeInTheDocument();
  });

  it("renders Tyres column with correct values and badges", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    // Header should contain Tyres
    expect(screen.getByText("Tyres")).toBeInTheDocument();

    // Full race should have "-"
    
    // We expect "Soft" and "Extra Soft" to be visible
    expect(screen.getByText("Soft")).toBeInTheDocument();
    expect(screen.getByText("Extra Soft")).toBeInTheDocument();

    // Check for the "-" text (might be multiple, so we can just check if it's there)
    const dash = screen.getAllByText("-");
    expect(dash.length).toBeGreaterThan(0);
  });
});
