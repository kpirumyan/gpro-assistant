import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SettingsPage, { SettingsFormWrapper } from "./page";
import * as actions from "@/app/settings/actions";
import * as queries from "@/lib/db/queries";
import * as client from "@/lib/gpro/client";

vi.mock("@/app/settings/actions", () => ({
  saveApiKey: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getGproCredentials: vi.fn(),
  upsertGproCredentials: vi.fn(),
}));

vi.mock("@/lib/gpro/client", () => ({
  verifyToken: vi.fn(),
}));

const FRESH_CREDENTIALS = {
  token: "secret_token",
  isValid: true,
  verifiedAt: new Date(),
};

const STALE_CREDENTIALS = {
  token: "old_token",
  isValid: false,
  verifiedAt: new Date(Date.now() - 2 * 3600 * 1000), // 2 hours ago
};

describe("SettingsFormWrapper", () => {
  beforeEach(() => {
    vi.mocked(actions.saveApiKey).mockImplementation(async (prevState, formData) => {
      const key = formData.get("gproApiKey");
      if (!key || typeof key !== "string" || !key.trim()) {
        return { error: "API key is required" };
      }
      return { message: "API key saved successfully" };
    });
    vi.mocked(queries.upsertGproCredentials).mockResolvedValue(undefined);
  });

  it("shows the API key form with valid cached credentials", async () => {
    render(await SettingsFormWrapper({ credentials: FRESH_CREDENTIALS }));

    expect(screen.getByRole("heading", { name: "GPRO API access" })).toBeInTheDocument();
    expect(screen.getByLabelText("GPRO API key", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save API key" })).toBeInTheDocument();
    expect(screen.getByText(/active api key/i)).toBeInTheDocument();
  });

  it("does not reveal any saved API key value in the UI", async () => {
    render(await SettingsFormWrapper({ credentials: FRESH_CREDENTIALS }));

    expect(screen.queryByDisplayValue(/.+/)).not.toBeInTheDocument();
    expect(screen.queryAllByText(/api key/i).length).toBeGreaterThan(0);
  });

  it("allows the user to type an API key and save it", async () => {
    const user = userEvent.setup();
    vi.mocked(client.verifyToken).mockResolvedValue(true);

    render(await SettingsFormWrapper({ credentials: STALE_CREDENTIALS }));

    await user.type(screen.getByLabelText("GPRO API key"), "gpro-test-key");
    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(actions.saveApiKey).toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
  });

  it("does not save an empty API key", async () => {
    const user = userEvent.setup();
    vi.mocked(client.verifyToken).mockResolvedValue(true);

    render(await SettingsFormWrapper({ credentials: STALE_CREDENTIALS }));

    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/required/i);
  });

  it("re-verifies and shows active status when cache is stale but token is valid", async () => {
    vi.mocked(client.verifyToken).mockResolvedValue(true);

    render(await SettingsFormWrapper({ credentials: STALE_CREDENTIALS }));

    expect(client.verifyToken).toHaveBeenCalledWith(STALE_CREDENTIALS.token);
    expect(screen.getByText(/active api key/i)).toBeInTheDocument();
  });

  it("re-verifies and shows invalid status when cache is stale and token is expired", async () => {
    vi.mocked(client.verifyToken).mockResolvedValue(false);

    render(await SettingsFormWrapper({ credentials: STALE_CREDENTIALS }));

    expect(screen.getByText(/invalid or expired/i)).toBeInTheDocument();
  });
});

describe("SettingsPage (no key saved)", () => {
  it("shows a clean form without spinner when no API key is in the database", async () => {
    vi.mocked(queries.getGproCredentials).mockResolvedValue(null);

    render(await SettingsPage());

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByLabelText("GPRO API key", { selector: "input" })).toBeInTheDocument();
    // No spinner, no status badge — just an empty form ready for input
    expect(screen.queryByText(/verifying/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/active api key/i)).not.toBeInTheDocument();
  });

  it("keeps the API key field empty when no key is saved", async () => {
    vi.mocked(queries.getGproCredentials).mockResolvedValue(null);

    render(await SettingsPage());

    expect(screen.getByLabelText("GPRO API key")).toHaveValue("");
  });
});

