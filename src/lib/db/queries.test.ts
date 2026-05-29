import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getLatestSyncedRace } from './queries';
import { buildRawRaceData } from '@/test/factories';
import { db } from '@/lib/db';

vi.mock('@/lib/db', () => ({
  db: {
    query: {
      rawRaceData: {
        findFirst: vi.fn(),
      },
    },
  },
}));

describe('getLatestSyncedRace', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns the latest synced race if found', async () => {
    // Arrange
    vi.mocked(db.query.rawRaceData.findFirst).mockResolvedValue(
      buildRawRaceData({ season: 103, race: 17 })
    );

    // Act
    const result = await getLatestSyncedRace();

    // Assert
    expect(result).toEqual({ season: 103, race: 17 });
    expect(db.query.rawRaceData.findFirst).toHaveBeenCalledTimes(1);
  });

  it('returns null if no race is found', async () => {
    // Arrange
    vi.mocked(db.query.rawRaceData.findFirst).mockResolvedValue(undefined);

    // Act
    const result = await getLatestSyncedRace();

    // Assert
    expect(result).toBeNull();
  });
});
