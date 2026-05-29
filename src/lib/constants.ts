/**
 * Number of races sent to the server in a single syncRaceBatchAction call.
 * Keeps individual Server Action payloads small and allows progressive
 * progress tracking on the client.
 */
export const SYNC_CHUNK_SIZE = 5;
