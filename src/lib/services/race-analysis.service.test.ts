import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateFuelAnalytics, generateRaceRange, getExistingRacesInRange, prepareSync, syncRacesBatch, saveRaceAnalysisData } from './race-analysis.service';
import { buildRawRaceData } from '../../test/factories';
import { fetchRaceAnalysis, fetchHistoryCalendar, fetchTrackProfile } from '../gpro/client';
import { db } from '../db';

vi.mock('../db', () => ({
  db: {
    query: {
      rawRaceData: {
        findMany: vi.fn(),
        findFirst: vi.fn()
      },
      seasonCalendars: {
        findFirst: vi.fn()
      },
      tracks: {
        findFirst: vi.fn()
      }
    },
    transaction: vi.fn(),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        onConflictDoNothing: vi.fn()
      }))
    })),
    delete: vi.fn(() => ({
      where: vi.fn()
    }))
  }
}));

vi.mock('../gpro/client', () => ({
  fetchRaceAnalysis: vi.fn(),
  fetchHistoryCalendar: vi.fn(),
  fetchTrackProfile: vi.fn()
}));

describe('getExistingRacesInRange', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should query DB and return existing races', async () => {
    vi.mocked(db.query.rawRaceData.findMany).mockResolvedValue([
      buildRawRaceData({ season: 100, race: 16 })
    ]);

    const result = await getExistingRacesInRange(100, 15, 100, 17);
    
    expect(db.query.rawRaceData.findMany).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      expect.objectContaining({ season: 100, race: 16 })
    ]);
  });

  it('should throw an error for invalid backward ranges', async () => {
    await expect(getExistingRacesInRange(101, 2, 100, 16)).rejects.toThrow('Invalid range: from > to');
  });
});

describe('prepareSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate range and filter out existing races', async () => {
    vi.mocked(db.query.rawRaceData.findMany).mockResolvedValue([
      buildRawRaceData({ season: 100, race: 16 })
    ]);

    const result = await prepareSync(100, 15, 100, 17);
    
    // full range: [100/15, 100/16, 100/17]
    // existing: [100/16]
    // missing: [100/15, 100/17]
    expect(result).toEqual([
      { season: 100, race: 15 },
      { season: 100, race: 17 }
    ]);
  });

  it('should return empty array if all races exist', async () => {
    vi.mocked(db.query.rawRaceData.findMany).mockResolvedValue([
      buildRawRaceData({ season: 100, race: 15 })
    ]);

    const result = await prepareSync(100, 15, 100, 15);
    expect(result).toEqual([]);
  });

  it('should return full array if overwrite is true even if all races exist', async () => {
    vi.mocked(db.query.rawRaceData.findMany).mockResolvedValue([
      buildRawRaceData({ season: 100, race: 15 })
    ]);

    const result = await prepareSync(100, 15, 100, 15, true);
    expect(result).toEqual([
      { season: 100, race: 15 }
    ]);
  });

  it('should throw an error for invalid backward ranges', async () => {
    await expect(prepareSync(101, 2, 100, 16)).rejects.toThrow('Invalid range: from > to');
  });
});

describe('syncRacesBatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and save races successfully', async () => {
    vi.mocked(fetchRaceAnalysis).mockResolvedValue({
      carPower: 100,
      startFuel: 100,
      finishFuel: 10
    } as unknown as Awaited<ReturnType<typeof fetchRaceAnalysis>>);

    vi.mocked(fetchHistoryCalendar).mockResolvedValue({
      managers: [{ pos: 15, trackId: 1 }, { pos: 16, trackId: 2 }]
    } as unknown as Awaited<ReturnType<typeof fetchHistoryCalendar>>);

    vi.mocked(fetchTrackProfile).mockResolvedValue({
      trackName: "Test Track"
    } as unknown as Awaited<ReturnType<typeof fetchTrackProfile>>);

    vi.mocked(db.transaction).mockImplementation(async () => {});

    const result = await syncRacesBatch('token', [{ season: 100, race: 15 }, { season: 100, race: 16 }]);
    
    expect(fetchRaceAnalysis).toHaveBeenCalledTimes(2);
    expect(db.transaction).toHaveBeenCalledTimes(2);
    expect(result.syncedCount).toBe(2);
    expect(result.stoppedReason).toBe('completed');
  });

  it('should stop and return not_found if API throws 404 error', async () => {
    vi.mocked(fetchRaceAnalysis).mockRejectedValue(new Error('Race analysis not found (404)'));
    vi.mocked(db.transaction).mockImplementation(async () => {});

    const result = await syncRacesBatch('token', [{ season: 100, race: 15 }, { season: 100, race: 16 }]);
    
    expect(fetchRaceAnalysis).toHaveBeenCalledTimes(1);
    expect(db.transaction).not.toHaveBeenCalled();
    expect(result.syncedCount).toBe(0);
    expect(result.stoppedReason).toBe('not_found');
    expect(result.lastRaceChecked).toEqual({ season: 100, race: 15 });
  });

  it('should stop and return error for other API errors', async () => {
    vi.mocked(fetchRaceAnalysis).mockRejectedValue(new Error('Internal Server Error'));

    const result = await syncRacesBatch('token', [{ season: 100, race: 15 }]);
    
    expect(result.syncedCount).toBe(0);
    expect(result.stoppedReason).toBe('error');
  });
});

describe('saveRaceAnalysisData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should upsert rawRaceData and delete old children before inserting new ones', async () => {
    const mockTx = {
      delete: vi.fn(() => ({
        where: vi.fn()
      })),
      insert: vi.fn(() => ({
        values: vi.fn(() => ({
          onConflictDoUpdate: vi.fn(() => ({
            returning: vi.fn().mockResolvedValue([{ id: 123 }])
          })),
          returning: vi.fn().mockResolvedValue([{ id: 123 }]) // default returning for non-upserts
        }))
      }))
    };

    vi.mocked(db.transaction).mockImplementation(async (cb: Parameters<typeof db.transaction>[0]) => {
      return cb(mockTx as unknown as Parameters<typeof cb>[0]);
    });

    const mockData = { carPower: 100, group: 'A' } as unknown as import('../gpro/types').RaceAnalysisResponse;
    await saveRaceAnalysisData(100, 15, mockData, 1);

    // Should call insert for rawRaceData (with onConflictDoUpdate), then 3 deletes for children, then inserts for children
    expect(mockTx.insert).toHaveBeenCalled();
    expect(mockTx.delete).toHaveBeenCalledTimes(3); // raceFuelAnalytics, raceDriverSnapshots, raceCarSnapshots
  });
});

describe('generateRaceRange', () => {
  it('should generate races within the same season', () => {
    const range = generateRaceRange(100, 15, 100, 17);
    expect(range).toEqual([
      { season: 100, race: 15 },
      { season: 100, race: 16 },
      { season: 100, race: 17 }
    ]);
  });

  it('should generate races across multiple seasons', () => {
    const range = generateRaceRange(100, 16, 101, 2);
    expect(range).toEqual([
      { season: 100, race: 16 },
      { season: 100, race: 17 },
      { season: 101, race: 1 },
      { season: 101, race: 2 }
    ]);
  });

  it('should throw an error for invalid backward ranges', () => {
    expect(() => generateRaceRange(101, 2, 100, 16)).toThrowError('Invalid range: from > to');
  });

  it('should handle single race range', () => {
    const range = generateRaceRange(100, 15, 100, 15);
    expect(range).toEqual([
      { season: 100, race: 15 }
    ]);
  });
});

describe('calculateFuelAnalytics', () => {
  it('should return empty array if no laps or startFuel', () => {
    expect(calculateFuelAnalytics({})).toEqual([]);
    expect(calculateFuelAnalytics({ startFuel: 100 })).toEqual([]);
    expect(calculateFuelAnalytics({ laps: [{}] })).toEqual([]);
  });

  it('should correctly calculate fuel for a single stint race without pits', () => {
    // 10 laps race, no pits
    const data = {
      startFuel: 100,
      finishFuel: 50,
      // laps[0] = pre-start, laps[1..10] = driven (10 real laps)
      laps: Array(11).fill({ boostLap: 0 }),
      pits: []
    };

    const results = calculateFuelAnalytics(data);
    expect(results).toHaveLength(2); // stint and full_race
    
    const stint = results.find(r => r.type === 'stint');
    expect(stint).toBeDefined();
    expect(stint?.stintIndex).toBe(1);
    expect(stint?.lapsAnalyzed).toBe(10);
    // start = 100, finish = 50. exact finish fuel = 50.
    // min consumed = 100 - 50 = 50. max consumed = 100 - 50 = 50.
    expect(stint?.avgFuelPerLapMin).toBe(50 / 10);
    expect(stint?.avgFuelPerLapMax).toBe(50 / 10);
    
    const fullRace = results.find(r => r.type === 'full_race');
    expect(fullRace?.avgFuelPerLapMin).toBe(5);
    expect(fullRace?.avgFuelPerLapMax).toBe(5);
  });

  it('should correctly calculate fuel for a 2-stint race with pit stop errors', () => {
    const data = {
      startFuel: 100,
      finishFuel: 10,
      laps: Array(21).fill({ boostLap: 0 }).map((_, i) => ({ boostLap: i === 1 ? 1 : 0 })), // boost at lap 1 → fast laps: 1, 2, 3
      pits: [
        {
          lap: 10,
          fuelLeft: 10, // reported 10, so actual could be 10..13. Consumed: start(100) - actual(13 to 10) = 87 to 90.
          refilledTo: 80
        }
      ]
    };

    const results = calculateFuelAnalytics(data);
    
    // Stints:
    // Stint 1: Laps 1-10. start = 100. finishFuelReported = 10. minFinish = 10, maxFinish = 13.
    // consumedMin = 100 - 13 = 87. consumedMax = 100 - 10 = 90.
    // avgMin = 8.7, avgMax = 9.0.
    
    // Stint 2: Laps 11-20. start = 80. finishFuel = 10 (exact). 
    // consumedMin = 80 - 10 = 70. consumedMax = 80 - 10 = 70.
    // avgMin = 7.0, avgMax = 7.0.
    
    expect(results).toHaveLength(3); // 2 stints + 1 full race
    
    const stint1 = results.find(r => r.type === 'stint' && r.stintIndex === 1);
    expect(stint1?.avgFuelPerLapMin).toBeCloseTo(8.7);
    expect(stint1?.avgFuelPerLapMax).toBeCloseTo(9.0);
    expect(stint1?.lapsAnalyzed).toBe(10);
    expect(stint1?.fastLapsCount).toBe(3); // laps 1, 2, 3 are fast

    const stint2 = results.find(r => r.type === 'stint' && r.stintIndex === 2);
    expect(stint2?.avgFuelPerLapMin).toBeCloseTo(7.0);
    expect(stint2?.avgFuelPerLapMax).toBeCloseTo(7.0);
    expect(stint2?.lapsAnalyzed).toBe(10);
    expect(stint2?.fastLapsCount).toBe(0);

    const fullRace = results.find(r => r.type === 'full_race');
    // total consumed min = 87 + 70 = 157
    // total consumed max = 90 + 70 = 160
    // laps = 20
    expect(fullRace?.avgFuelPerLapMin).toBeCloseTo(157 / 20);
    expect(fullRace?.avgFuelPerLapMax).toBeCloseTo(160 / 20);
  });

  it('should ignore stints shorter than 10 laps', () => {
    const data = {
      startFuel: 100,
      finishFuel: 10,
      // laps[0] = pre-start, laps[1..15] = driven (15 real laps)
      // pit after lap 5: stint 1 = 5 laps (ignored), stint 2 = 10 laps (included)
      laps: Array(16).fill({ boostLap: 0 }),
      pits: [
        {
          lap: 5, // 5 laps is < 10
          fuelLeft: 50,
          refilledTo: 80
        }
      ]
    };

    const results = calculateFuelAnalytics(data);
    
    // Stint 1: 5 laps (ignored)
    // Stint 2: 10 laps (included)
    expect(results).toHaveLength(1); // 1 stint, no full race since a stint was dropped

    const stint2 = results.find(r => r.type === 'stint');
    expect(stint2?.stintIndex).toBe(2);
    expect(stint2?.lapsAnalyzed).toBe(10);
  });

  it('should expand a single boost marker into a 3-lap window', () => {
    const data = {
      startFuel: 100,
      finishFuel: 10,
      // laps[0] = pre-start, laps[1..20] = driven. boost on lap 5 → fast: 5, 6, 7
      laps: Array(21).fill({ boostLap: 0 }).map((_, i) => ({ boostLap: i === 5 ? 1 : 0 })),
      pits: []
    };

    const results = calculateFuelAnalytics(data);
    const fullRace = results.find(r => r.type === 'full_race');
    expect(fullRace?.fastLapsCount).toBe(3);

    const stint = results.find(r => r.type === 'stint');
    expect(stint?.fastLapsCount).toBe(3);
  });

  it('should deduplicate overlapping boost windows', () => {
    const data = {
      startFuel: 100,
      finishFuel: 10,
      // boost on laps 5 and 7 → windows {5,6,7} ∪ {7,8,9} = {5,6,7,8,9} → 5 fast laps
      laps: Array(21).fill({ boostLap: 0 }).map((_, i) => ({
        boostLap: i === 5 || i === 7 ? 1 : 0,
      })),
      pits: []
    };

    const results = calculateFuelAnalytics(data);
    const fullRace = results.find(r => r.type === 'full_race');
    expect(fullRace?.fastLapsCount).toBe(5);
  });

  it('should cap the boost window at the last driven lap', () => {
    const data = {
      startFuel: 100,
      finishFuel: 10,
      // 15-lap race: laps[0..15]. boost on lap 14 → would try {14,15,16}, but 16 > 15 → {14,15}
      laps: Array(16).fill({ boostLap: 0 }).map((_, i) => ({ boostLap: i === 14 ? 1 : 0 })),
      pits: []
    };

    const results = calculateFuelAnalytics(data);
    const fullRace = results.find(r => r.type === 'full_race');
    expect(fullRace?.fastLapsCount).toBe(2); // only laps 14 and 15
  });

  it('should correctly split boost window across stint boundary', () => {
    const data = {
      startFuel: 100,
      finishFuel: 10,
      // 20-lap race, pit after lap 10. boost on lap 9 → window {9,10,11}
      // stint 1 (laps 1-10): fast laps = {9,10} → 2
      // stint 2 (laps 11-20): fast laps = {11} → 1
      laps: Array(21).fill({ boostLap: 0 }).map((_, i) => ({ boostLap: i === 9 ? 1 : 0 })),
      pits: [{ lap: 10, fuelLeft: 50, refilledTo: 80 }]
    };

    const results = calculateFuelAnalytics(data);
    const stint1 = results.find(r => r.type === 'stint' && r.stintIndex === 1);
    const stint2 = results.find(r => r.type === 'stint' && r.stintIndex === 2);
    const fullRace = results.find(r => r.type === 'full_race');

    expect(stint1?.fastLapsCount).toBe(2);
    expect(stint2?.fastLapsCount).toBe(1);
    expect(fullRace?.fastLapsCount).toBe(3); // 2 from stint 1 + 1 from stint 2
  });
});
