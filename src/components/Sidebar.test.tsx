import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

// Mock next/link to render a plain anchor
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it("renders all navigation links", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Driver")).toBeInTheDocument();
    expect(screen.getByText("Car")).toBeInTheDocument();
    expect(screen.getByText("Fuel Consumption")).toBeInTheDocument();
    expect(screen.getByText("Tire Wear")).toBeInTheDocument();
    expect(screen.getByText("Car Setup")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("renders the brand link", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    expect(screen.getByText("GPRO Assistant")).toBeInTheDocument();
  });

  it("starts expanded by default when localStorage is empty", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses when toggle button is clicked", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    fireEvent.click(toggle);
    act(() => { vi.runAllTimers(); });

    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
    ).toBeInTheDocument();
  });

  it("expands when toggle button is clicked in collapsed state", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    const toggleCollapse = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    fireEvent.click(toggleCollapse);
    act(() => { vi.runAllTimers(); });

    const toggleExpand = screen.getByRole("button", {
      name: /expand sidebar/i,
    });
    fireEvent.click(toggleExpand);
    act(() => { vi.runAllTimers(); });

    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
  });

  it("saves collapsed state to localStorage on toggle", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    fireEvent.click(toggle);
    act(() => { vi.runAllTimers(); });

    expect(localStorage.getItem("sidebar-collapsed")).toBe("true");
  });

  it("restores collapsed state from localStorage on mount", () => {
    localStorage.setItem("sidebar-collapsed", "true");
    render(<Sidebar />);
    
    // Initial render should be expanded (for hydration match)
    expect(screen.getByRole("button", { name: /collapse sidebar/i })).toBeInTheDocument();
    
    // Advance timers to trigger state restoration
    act(() => { vi.runAllTimers(); });

    // After timer runs, it should be collapsed
    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument();
  });

  it("restores expanded state from localStorage on mount", () => {
    localStorage.setItem("sidebar-collapsed", "false");
    render(<Sidebar />);
    
    act(() => { vi.runAllTimers(); });

    expect(screen.getByRole("button", { name: /collapse sidebar/i })).toBeInTheDocument();
  });

  it("marks current page link with aria-current", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");

    const driverLink = screen.getByRole("link", { name: /driver/i });
    expect(driverLink).not.toHaveAttribute("aria-current");
  });

  it("has accessible sidebar landmark", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("aria-label", "Main navigation");
  });

  it("shows tooltips in collapsed state", () => {
    localStorage.setItem("sidebar-collapsed", "true");
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });
    
    expect(screen.getByRole("button", { name: /expand sidebar/i })).toBeInTheDocument();

    const tooltips = screen.getAllByRole("tooltip", { hidden: true });
    expect(tooltips.length).toBeGreaterThan(0);
    expect(tooltips[0]).toHaveTextContent("Home");
  });

  it("does not render tooltips in expanded state", () => {
    render(<Sidebar />);
    act(() => { vi.runAllTimers(); });
    
    expect(screen.queryByRole("tooltip", { hidden: true })).not.toBeInTheDocument();
  });
});
