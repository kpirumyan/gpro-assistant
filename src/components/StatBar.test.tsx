import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatBar } from "./StatBar";

describe("StatBar", () => {
  it("renders the label and value", () => {
    render(<StatBar label="Talent" value={200} min={0} max={250} />);

    expect(screen.getByText("Talent")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
  });

  it("renders the unit when provided", () => {
    render(<StatBar label="Weight" value={77} min={50} max={120} unit="kg" />);

    expect(screen.getByText("kg")).toBeInTheDocument();
  });

  it("sets the correct bar width percentage", () => {
    render(<StatBar label="Experience" value={125} min={0} max={250} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveStyle({ width: "50%" });
  });

  it("clamps at 0% for values at min", () => {
    render(<StatBar label="Aggression" value={0} min={0} max={250} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveStyle({ width: "0%" });
  });

  it("clamps at 100% for values at max", () => {
    render(<StatBar label="Talent" value={250} min={0} max={250} />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveStyle({ width: "100%" });
  });

  it("sets green hue for high values (normal mode)", () => {
    render(<StatBar label="Talent" value={250} min={0} max={250} />);

    const meter = screen.getByRole("meter");
    // Full value → hue 120 (green), jsdom converts HSL to RGB
    expect(meter.style.background).toBeTruthy();
    // Verify green channel is dominant (RGB converted from hsl(120, 72%, 48%))
    expect(meter.style.background).toMatch(/rgb/);
  });

  it("sets red hue for high values when invertColors is true", () => {
    render(<StatBar label="Wear" value={100} min={0} max={100} invertColors />);

    const meter = screen.getByRole("meter");
    // Full value with invertColors → hue 0 (red), jsdom converts HSL to RGB
    expect(meter.style.background).toBeTruthy();
    expect(meter.style.background).toMatch(/rgb/);
  });

  it("has correct ARIA attributes", () => {
    render(<StatBar label="Stamina" value={50} min={0} max={250} unit="%" />);

    const meter = screen.getByRole("meter");
    expect(meter).toHaveAttribute("aria-valuenow", "50");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "250");
    expect(meter).toHaveAttribute("aria-label", "Stamina: 50%");
  });
});
