import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DriverPanel } from "./DriverPanel";

vi.mock("@/app/driver/actions", () => ({
  syncDriverData: vi.fn(),
}));

const mockDriverData = {
  name: "Tom Herbert",
  overall: 90,
  concentration: 27,
  talent: 244,
  aggression: 7,
  experience: 4,
  technicalInsight: 53,
  stamina: 16,
  charisma: 94,
  motivation: 154,
  reputation: 0,
  weight: 77,
  age: 17,
  energy: 100,
  updatedAt: new Date("2025-01-15T10:00:00Z"),
};

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
