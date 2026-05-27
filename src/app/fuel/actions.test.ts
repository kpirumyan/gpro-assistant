import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLatestSyncedRaceAction, prepareSyncAction, syncRaceBatchAction } from './actions';
import { buildRaceAnalysis } from '@/test/factories';
import { prepareSync, syncRacesBatch } from '@/lib/services/race-analysis.service';
import { getGproCredentials } from '@/lib/db/queries';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      raceAnalysis: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock('@/lib/db/queries', () => ({
  getGproCredentials: vi.fn(),
}));

vi.mock('@/lib/services/race-analysis.service', () => ({
  prepareSync: vi.fn(),
  syncRacesBatch: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

describe('Race Analysis Server Actions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getLatestSyncedRaceAction', () => {
    it('returns the latest synced race if found', async () => {
      // Arrange
      vi.mocked(db.query.raceAnalysis.findFirst).mockResolvedValue(
        buildRaceAnalysis({ season: 103, race: 17 })
      );

      // Act
      const result = await getLatestSyncedRaceAction();

      // Assert
      expect(result).toEqual({ season: 103, race: 17 });
      expect(db.query.raceAnalysis.findFirst).toHaveBeenCalledTimes(1);
    });

    it('returns null if no race is found', async () => {
      // Arrange
      vi.mocked(db.query.raceAnalysis.findFirst).mockResolvedValue(undefined);

      // Act
      const result = await getLatestSyncedRaceAction();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('prepareSyncAction', () => {
    it('returns missing races on success', async () => {
      // Arrange
      const missingRaces = [
        { season: 103, race: 15 },
        { season: 103, race: 16 },
      ];
      vi.mocked(prepareSync).mockResolvedValue(missingRaces);

      // Act
      const result = await prepareSyncAction(103, 15, 103, 17);

      // Assert
      expect(result).toEqual({ success: true, missingRaces });
      expect(prepareSync).toHaveBeenCalledWith(103, 15, 103, 17);
    });

    it('returns error on failure', async () => {
      // Arrange
      vi.mocked(prepareSync).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await prepareSyncAction(103, 15, 103, 17);

      // Assert
      expect(result).toEqual({ success: false, error: 'Database error' });
    });
  });

  describe('syncRaceBatchAction', () => {
    it('returns error if no credentials', async () => {
      // Arrange
      vi.mocked(getGproCredentials).mockResolvedValue(null);

      // Act
      const result = await syncRaceBatchAction([{ season: 103, race: 15 }]);

      // Assert
      expect(result).toEqual({ success: false, error: 'No API key configured. Please add one in Settings.' });
    });

    it('calls syncRacesBatch and returns success', async () => {
      // Arrange
      vi.mocked(getGproCredentials).mockResolvedValue({ token: 'test-token' });
      vi.mocked(syncRacesBatch).mockResolvedValue({
        syncedCount: 2,
        stoppedReason: 'completed',
      });

      // Act
      const result = await syncRaceBatchAction([
        { season: 103, race: 15 },
        { season: 103, race: 16 },
      ]);

      // Assert
      expect(result).toEqual({ success: true, syncedCount: 2 });
      expect(syncRacesBatch).toHaveBeenCalledWith('test-token', [
        { season: 103, race: 15 },
        { season: 103, race: 16 },
      ]);
    });

    it('returns error with stoppedReason if sync fails', async () => {
      // Arrange
      vi.mocked(getGproCredentials).mockResolvedValue({ token: 'test-token' });
      vi.mocked(syncRacesBatch).mockResolvedValue({
        syncedCount: 1,
        stoppedReason: 'not_found',
      });

      // Act
      const result = await syncRaceBatchAction([
        { season: 103, race: 15 },
        { season: 103, race: 16 },
      ]);

      // Assert
      expect(result).toEqual({ success: false, error: 'Sync stopped prematurely. Reason: not_found. Synced: 1' });
    });
    
    it('returns general error on throw', async () => {
      // Arrange
      vi.mocked(getGproCredentials).mockResolvedValue({ token: 'test-token' });
      vi.mocked(syncRacesBatch).mockRejectedValue(new Error('Network error'));

      // Act
      const result = await syncRaceBatchAction([{ season: 103, race: 15 }]);

      // Assert
      expect(result).toEqual({ success: false, error: 'Network error' });
    });
  });
});
