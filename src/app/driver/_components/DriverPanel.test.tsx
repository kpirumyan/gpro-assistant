import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DriverPanel } from "./DriverPanel";
import driverProfileFixture from "@/lib/gpro/__fixtures__/driver-profile.json";
import { buildDriverProfile } from "@/test/factories";

vi.mock("@/app/driver/actions", () => ({
  syncDriverData: vi.fn(),
}));

const mockDriverData = buildDriverProfile({
  name: driverProfileFixture.driName,
  overall: driverProfileFixture.overall,
  concentration: driverProfileFixture.concentration,
  talent: driverProfileFixture.talent,
  aggression: driverProfileFixture.aggressiveness,
  experience: driverProfileFixture.experience,
  technicalInsight: driverProfileFixture.techInsight,
  stamina: driverProfileFixture.stamina,
  charisma: driverProfileFixture.charisma,
  motivation: driverProfileFixture.motivation,
  reputation: driverProfileFixture.reputation,
  weight: driverProfileFixture.weight,
  age: driverProfileFixture.age,
  energy: driverProfileFixture.energy,
  updatedAt: new Date("2025-01-15T10:00:00Z"),
});

describe("DriverPanel", () => {
  it("shows the sync button", () => {
    render(<DriverPanel data={null} />);

    expect(screen.getByRole("button", { name: /sync/i })).toBeInTheDocument();
  });

  it("shows placeholder when no data is available", () => {
    render(<DriverPanel data={null} />);

    expect(screen.getByText(/no driver data yet/i)).toBeInTheDocument();
  });

  it("displays driver name when data is present", () => {
    render(<DriverPanel data={mockDriverData} />);

    expect(screen.getByText(/tom herbert/i)).toBeInTheDocument();
  });

  it("displays all skill bars when data is present", () => {
    render(<DriverPanel data={mockDriverData} />);

    expect(screen.getByText("Overall")).toBeInTheDocument();
    expect(screen.getByText("Concentration")).toBeInTheDocument();
    expect(screen.getByText("Talent")).toBeInTheDocument();
    expect(screen.getByText("Aggression")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Technical Insight")).toBeInTheDocument();
    expect(screen.getByText("Stamina")).toBeInTheDocument();
    expect(screen.getByText("Charisma")).toBeInTheDocument();
    expect(screen.getByText("Motivation")).toBeInTheDocument();
    expect(screen.getByText("Reputation")).toBeInTheDocument();
  });

  it("displays attribute bars when data is present", () => {
    render(<DriverPanel data={mockDriverData} />);

    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("Weight")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
  });
});
