import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SettingsPage from "./page";
import { SettingsApiKeyForm } from "@/components/SettingsApiKeyForm";
import * as actions from "@/app/settings/actions";
import * as queries from "@/lib/db/queries";

vi.mock("@/app/settings/actions", () => ({
  saveApiKey: vi.fn(),
}));

vi.mock("@/lib/db/queries", () => ({
  getGproCredentials: vi.fn(),
  upsertGproCredentials: vi.fn(),
}));

describe("SettingsApiKeyForm", () => {
  beforeEach(() => {
    vi.mocked(actions.saveApiKey).mockImplementation(async (prevState, formData) => {
      const key = formData.get("gproApiKey");
      if (!key || typeof key !== "string" || !key.trim()) {
        return { error: "API key is required" };
      }
      return { message: "API key saved successfully" };
    });
  });

  it("shows the API key form", () => {
    render(<SettingsApiKeyForm hasSavedKey={true} />);

    expect(screen.getByRole("heading", { name: "GPRO API access" })).toBeInTheDocument();
    expect(screen.getByLabelText("GPRO API key", { selector: "input" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save API key" })).toBeInTheDocument();
    expect(screen.getByText(/active api key is currently saved/i)).toBeInTheDocument();
  });

  it("does not reveal any saved API key value in the UI", () => {
    render(<SettingsApiKeyForm hasSavedKey={true} />);

    expect(screen.queryByDisplayValue(/.+/)).not.toBeInTheDocument();
  });

  it("allows the user to type an API key and save it", async () => {
    const user = userEvent.setup();

    render(<SettingsApiKeyForm hasSavedKey={false} />);

    await user.type(screen.getByLabelText("GPRO API key"), "gpro-test-key");
    await user.click(screen.getByRole("button", { name: "Save API key" }));

    expect(actions.saveApiKey).toHaveBeenCalled();
    expect(await screen.findByRole("status")).toHaveTextContent(/saved/i);
  });

  it("disables the save button when the API key is empty", () => {
    render(<SettingsApiKeyForm hasSavedKey={true} />);

    const saveButton = screen.getByRole("button", { name: "Save API key" });
    expect(saveButton).toBeDisabled();
  });
});

describe("SettingsPage", () => {
  it("renders the settings page with the form when key is saved", async () => {
    vi.mocked(queries.getGproCredentials).mockResolvedValue({ token: "existing_token" });

    render(await SettingsPage());

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByText(/active api key is currently saved/i)).toBeInTheDocument();
  });

  it("shows a clean form without the active key banner when no API key is in the database", async () => {
    vi.mocked(queries.getGproCredentials).mockResolvedValue(null);

    render(await SettingsPage());

    expect(screen.getByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(screen.getByLabelText("GPRO API key", { selector: "input" })).toBeInTheDocument();
    expect(screen.queryByText(/active api key/i)).not.toBeInTheDocument();
  });

  it("keeps the API key field empty when no key is saved", async () => {
    vi.mocked(queries.getGproCredentials).mockResolvedValue(null);

    render(await SettingsPage());

    expect(screen.getByLabelText("GPRO API key")).toHaveValue("");
  });
});
