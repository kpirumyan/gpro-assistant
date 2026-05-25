import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CarPanel } from "./CarPanel";

vi.mock("@/app/car/actions", () => ({
  syncCarData: vi.fn(),
}));

const mockParts = [
  { name: "Chassis", level: 2, wear: 48 },
  { name: "Engine", level: 2, wear: 10 },
  { name: "Front Wing", level: 2, wear: 49 },
];

describe("CarPanel", () => {
  it("shows the sync button", () => {
    render(<CarPanel parts={[]} />);

    expect(screen.getByRole("button", { name: /sync/i })).toBeInTheDocument();
  });

  it("shows placeholder when no parts are available", () => {
    render(<CarPanel parts={[]} />);

    expect(screen.getByText(/no car data yet/i)).toBeInTheDocument();
  });

  it("displays part names when data is present", () => {
    render(<CarPanel parts={mockParts} />);

    expect(screen.getByText("Chassis")).toBeInTheDocument();
    expect(screen.getByText("Engine")).toBeInTheDocument();
    expect(screen.getByText("Front Wing")).toBeInTheDocument();
  });

  it("displays level and wear bars for each part", () => {
    render(<CarPanel parts={mockParts} />);

    // Each part has a Level and Wear bar
    const levelLabels = screen.getAllByText("Level");
    const wearLabels = screen.getAllByText("Wear");
    expect(levelLabels).toHaveLength(mockParts.length);
    expect(wearLabels).toHaveLength(mockParts.length);
  });

  it("shows component count when data is present", () => {
    render(<CarPanel parts={mockParts} />);

    expect(screen.getByText(/3 components loaded/i)).toBeInTheDocument();
  });
});
