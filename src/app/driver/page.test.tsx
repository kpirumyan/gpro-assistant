import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DriverPage from "./page";

vi.mock("@/lib/db/queries", () => ({
  getDriverProfile: vi.fn().mockResolvedValue(null),
}));

describe("DriverPage", () => {
  it("renders the driver page without crashing and displays the shell", () => {
    render(<DriverPage />);
    expect(screen.getByRole("heading", { name: "Driver" })).toBeInTheDocument();
    
    // The Suspense fallback should be displayed initially because DriverContent is async
    const loader = document.querySelector(".lucide-loader-circle");
    expect(loader).toBeInTheDocument();
  });
});
