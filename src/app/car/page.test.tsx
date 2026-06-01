import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CarPage from "./page";

vi.mock("@/lib/db/queries", () => ({
  getCarParts: vi.fn().mockResolvedValue([]),
}));

describe("CarPage", () => {
  it("renders the car page without crashing and displays the shell", () => {
    render(<CarPage />);
    expect(screen.getByRole("heading", { name: "Car" })).toBeInTheDocument();
    
    // The Suspense fallback should be displayed initially because CarContent is async
    const loader = document.querySelector(".lucide-loader-circle");
    expect(loader).toBeInTheDocument();
  });
});
