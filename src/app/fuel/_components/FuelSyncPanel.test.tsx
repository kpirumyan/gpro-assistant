import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { FuelSyncPanel } from "./FuelSyncPanel";
import { prepareSyncAction, syncRaceBatchAction } from "@/app/fuel/actions";

vi.mock("@/app/fuel/actions", () => ({
  prepareSyncAction: vi.fn(),
  syncRaceBatchAction: vi.fn(),
}));

const mockPrepare = vi.mocked(prepareSyncAction);
const mockSyncBatch = vi.mocked(syncRaceBatchAction);

describe("FuelSyncPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with single race mode by default", () => {
    render(<FuelSyncPanel latestSyncedRace={{ season: 100, race: 1 }} />);
    
    expect(screen.getByRole("radio", { name: /single race/i })).toBeChecked();
    expect(screen.getByRole("radio", { name: /range/i })).not.toBeChecked();
    
    // In single mode, there should be 2 inputs (Season, Race)
    expect(screen.getAllByRole("spinbutton", { name: /season/i })).toHaveLength(1);
    expect(screen.getAllByRole("spinbutton", { name: /race/i })).toHaveLength(1);
  });

  it("toggles to range mode and shows 4 inputs", async () => {
    const user = userEvent.setup();
    render(<FuelSyncPanel latestSyncedRace={null} />);
    
    await user.click(screen.getByRole("radio", { name: /range/i }));
    
    expect(screen.getAllByRole("spinbutton", { name: /season/i })).toHaveLength(2);
    expect(screen.getAllByRole("spinbutton", { name: /race/i })).toHaveLength(2);
  });

  it("shows error and disables button if range is backward", async () => {
    const user = userEvent.setup();
    render(<FuelSyncPanel latestSyncedRace={{ season: 100, race: 5 }} />);
    
    await user.click(screen.getByRole("radio", { name: /range/i }));
    const [, toRace] = screen.getAllByRole("spinbutton", { name: /race/i });
    
    // Use fireEvent for number input to bypass userEvent clearing issues with number types
    fireEvent.change(toRace, { target: { value: "4" } });

    expect(screen.getByText(/invalid range/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sync fuel data/i })).toBeDisabled();
  });

  it("completes full sync flow", async () => {
    const user = userEvent.setup();
    mockPrepare.mockResolvedValue({ success: true, missingRaces: [{ season: 100, race: 1 }, { season: 100, race: 2 }] });
    mockSyncBatch.mockResolvedValue({ success: true, syncedCount: 2 });

    render(<FuelSyncPanel latestSyncedRace={{ season: 100, race: 1 }} />);
    
    // Click prepare
    await user.click(screen.getByRole("button", { name: /sync fuel data/i }));
    
    // Should show confirm step
    expect(await screen.findByText(/you are about to sync/i)).toBeInTheDocument();
    
    // Click confirm
    await user.click(screen.getByRole("button", { name: /confirm sync/i }));
    
    // Should show syncing and then success
    expect(await screen.findByText(/successfully synced 2 races/i)).toBeInTheDocument();
  });
});
