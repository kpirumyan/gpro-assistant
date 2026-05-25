import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SettingsPage from "./page";
import * as actions from "@/app/settings/actions";
import * as queries from "@/lib/db/queries";
import * as client from "@/lib/gpro/client";

vi.mock("@/app/settings/actions", () => ({
  saveApiKey: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getGproApiKey: vi.fn(),
}));

vi.mock("@/lib/gpro/client", () => ({
  verifyToken: vi.fn(),
}));

describe("SettingsPage", () => {
  beforeEach(() => {
    vi.mocked(actions.saveApiKey).mockImplementation(async (prevState, formData) => {
      const key = formData.get("gproApiKey");
      if (!key || typeof key !== "string" || !key.trim()) {
        return { error: "API key is required" };
      }
      return { message: "API key saved successfully" };
    });
  });

  it("shows the API key form", async () => {
    vi.mocked(queries.getGproApiKey).mockResolvedValue(null);
    render(await SettingsPage());

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

  it("keeps the API key field empty when settings open", async () => {
    vi.mocked(queries.getGproApiKey).mockResolvedValue(null);
    render(await SettingsPage());

    expect(screen.getByLabelText("GPRO API key")).toHaveValue("");
  });

  it("does not reveal any saved API key value in the UI", async () => {
    vi.mocked(queries.getGproApiKey).mockResolvedValue("secret_token");
    vi.mocked(client.verifyToken).mockResolvedValue(true);
    render(await SettingsPage());

    expect(screen.queryByDisplayValue(/.+/)).not.toBeInTheDocument();
    expect(screen.queryAllByText(/api key/i).length).toBeGreaterThan(0);
  });

  it("allows the user to type an API key and save it", async () => {
    const user = userEvent.setup();
    vi.mocked(queries.getGproApiKey).mockResolvedValue(null);

    render(await SettingsPage());

    await user.type(screen.getByLabelText("GPRO API key"), "gpro-test-key");
    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(actions.saveApiKey).toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
  });

  it("does not save an empty API key", async () => {
    const user = userEvent.setup();
    vi.mocked(queries.getGproApiKey).mockResolvedValue(null);

    render(await SettingsPage());

    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/required/i);
  });
});
