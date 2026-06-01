import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageShell } from "./PageShell";

describe("PageShell", () => {
  it("renders the title and description correctly", () => {
    render(
      <PageShell title="Test Title" description="Test Description" />
    );

    expect(screen.getByRole("heading", { name: "Test Title" })).toBeInTheDocument();
    expect(screen.getByText("Test Description")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <PageShell title="Test" description="Test desc">
        <div data-testid="child-element">Child content</div>
      </PageShell>
    );

    expect(screen.getByTestId("child-element")).toBeInTheDocument();
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("wraps children in Suspense by testing the fallback", () => {
    // To test Suspense fallback in JSDOM, we need a component that suspends (throws a Promise).
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const SuspendingComponent = () => {
      throw promise;
    };

    render(
      <PageShell title="Suspense Test" description="Desc">
        <SuspendingComponent />
      </PageShell>
    );

    // The Loader2 icon should be rendered by the fallback.
    // Lucide react icons usually have a class like 'lucide-loader-circle' or we can select by some visible attribute.
    // Wait, Loader2 renders an SVG. The fallback has a div with "flex justify-center p-8".
    // We can also query by looking for the animate-spin class.
    const svg = document.querySelector("svg.animate-spin");
    expect(svg).toBeInTheDocument();

    // Resolve the promise to clean up
    resolvePromise!(true);
  });
});
