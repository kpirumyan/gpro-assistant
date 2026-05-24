import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SettingsPage from "./page";

describe("SettingsPage", () => {
  it("shows the API key form", () => {
    render(<SettingsPage />);

    expect(
      screen.getByRole("heading", { name: "Settings" })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("GPRO API key", { selector: "input" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Save API key" })
    ).toBeInTheDocument();
  });

  it("keeps the API key field empty when settings open", () => {
    render(<SettingsPage />);

    expect(screen.getByLabelText("GPRO API key")).toHaveValue("");
  });

  it("does not reveal any saved API key value in the UI", () => {
    render(<SettingsPage />);

    expect(screen.queryByDisplayValue(/.+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/api key/i)).toBeVisible();
  });

  it("allows the user to type an API key and save it", async () => {
    const user = userEvent.setup();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<SettingsPage />);

    await user.type(screen.getByLabelText("GPRO API key"), "gpro-test-key");
    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(screen.getByLabelText("GPRO API key")).toHaveValue("gpro-test-key");
    expect(screen.getByRole("status")).toHaveTextContent(/saved/i);

    consoleSpy.mockRestore();
  });

  it("does not save an empty API key", async () => {
    const user = userEvent.setup();

    render(<SettingsPage />);

    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/required/i);
  });
});
