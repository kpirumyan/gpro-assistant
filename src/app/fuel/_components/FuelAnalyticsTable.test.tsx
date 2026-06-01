import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FuelAnalyticsTable } from "./FuelAnalyticsTable";
import type { FuelAnalyticsListEntry } from "@/lib/db/queries";

const mockData: FuelAnalyticsListEntry[] = [
  {
    id: 1,
    season: 100,
    race: 1,
    group: "Elite",
    type: "full_race",
    stintIndex: null,
    lapsAnalyzed: 50,
    fastLapsCount: 2,
    trackFuelConsumption: "High",
    avgFuelPerKmMin: "0.250",
    avgFuelPerKmMax: "0.300",
    createdAt: new Date(),
  },
  {
    id: 2,
    season: 100,
    race: 1,
    group: "Elite",
    type: "stint",
    stintIndex: 1,
    lapsAnalyzed: 20,
    fastLapsCount: 0,
    trackFuelConsumption: "High",
    avgFuelPerKmMin: "0.200",
    avgFuelPerKmMax: "0.200",
    createdAt: new Date(),
  }
];

describe("FuelAnalyticsTable", () => {
  it("renders with default L/km unit", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    // Header should be L/km
    expect(screen.getByText("Est. Consumption (L/km)")).toBeInTheDocument();
    
    // Values should be original
    expect(screen.getByText("0.250 - 0.300")).toBeInTheDocument();
    expect(screen.getByText("0.200")).toBeInTheDocument();
  });

  it("updates values when switched to L/100km", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    // Find the unit selector. We'll assume it's a combobox (select).
    const selector = screen.getByRole("combobox");
    
    // Change to L/100km
    fireEvent.change(selector, { target: { value: 'l_100km' } });
    
    // Header should update
    expect(screen.getByText("Est. Consumption (L/100km)")).toBeInTheDocument();
    
    // Values should be multiplied by 100
    // 0.250 * 100 = 25.000, 0.300 * 100 = 30.000
    expect(screen.getByText("25.000 - 30.000")).toBeInTheDocument();
    expect(screen.getByText("20.000")).toBeInTheDocument();
  });

  it("updates and swaps min/max when switched to km/L", () => {
    render(<FuelAnalyticsTable data={mockData} />);
    
    const selector = screen.getByRole("combobox");
    
    // Change to km/L
    fireEvent.change(selector, { target: { value: 'km_l' } });
    
    // Header should update
    expect(screen.getByText("Est. Consumption (km/L)")).toBeInTheDocument();
    
    // Values should be inverted: 1 / 0.300 = 3.333, 1 / 0.250 = 4.000
    // So the range string should be "3.333 - 4.000"
    // For 0.200: 1 / 0.200 = 5.000
    expect(screen.getByText("3.333 - 4.000")).toBeInTheDocument();
    expect(screen.getByText("5.000")).toBeInTheDocument();
  });
});
