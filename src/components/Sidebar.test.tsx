import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("renders all navigation links", () => {
    render(<Sidebar />);

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

    expect(screen.getByText("GPRO Assistant")).toBeInTheDocument();
  });

  it("starts expanded by default when localStorage is empty", () => {
    render(<Sidebar />);

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("collapses when toggle button is clicked", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    await user.click(toggle);

    // After collapsing, button label changes to "Expand sidebar"
    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
    ).toBeInTheDocument();
  });

  it("expands when toggle button is clicked in collapsed state", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const toggleCollapse = screen.getByRole("button", {
      name: /collapse sidebar/i,
    });
    await user.click(toggleCollapse);

    const toggleExpand = screen.getByRole("button", {
      name: /expand sidebar/i,
    });
    await user.click(toggleExpand);

    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
  });

  it("saves collapsed state to localStorage on toggle", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });
    await user.click(toggle);

    expect(localStorage.getItem("sidebar-collapsed")).toBe("true");
  });

  it("restores collapsed state from localStorage on mount", () => {
    localStorage.setItem("sidebar-collapsed", "true");

    render(<Sidebar />);

    expect(
      screen.getByRole("button", { name: /expand sidebar/i }),
    ).toBeInTheDocument();
  });

  it("restores expanded state from localStorage on mount", () => {
    localStorage.setItem("sidebar-collapsed", "false");

    render(<Sidebar />);

    expect(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    ).toBeInTheDocument();
  });

  it("marks current page link with aria-current", () => {
    render(<Sidebar />);

    // pathname is "/" by default (from mock)
    const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("aria-current", "page");

    // Other links should not have aria-current
    const driverLink = screen.getByRole("link", { name: /driver/i });
    expect(driverLink).not.toHaveAttribute("aria-current");
  });

  it("has accessible sidebar landmark", () => {
    render(<Sidebar />);

    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("aria-label", "Main navigation");
  });
});
