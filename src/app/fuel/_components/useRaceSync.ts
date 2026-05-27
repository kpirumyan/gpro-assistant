import { useState, useRef, useTransition } from "react";
import { prepareSyncAction, syncRaceBatchAction } from "@/app/fuel/actions";

export function useRaceSync(latestSyncedRace: { season: number; race: number } | null) {
  const [syncMode, setSyncMode] = useState<"single" | "range">("single");
  const [fromSeason, setFromSeason] = useState(latestSyncedRace ? latestSyncedRace.season : 100);
  const [fromRace, setFromRace] = useState(latestSyncedRace ? latestSyncedRace.race : 1);
  const [toSeason, setToSeason] = useState(latestSyncedRace ? latestSyncedRace.season : 100);
  const [toRace, setToRace] = useState(latestSyncedRace ? latestSyncedRace.race : 1);

  const [step, setStep] = useState<"idle" | "preparing" | "confirm" | "syncing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [missingRaces, setMissingRaces] = useState<{ season: number; race: number }[]>([]);
  const [progress, setProgress] = useState(0);

  const cancelRef = useRef(false);
  const [, startTransition] = useTransition();

  const isBackward =
    syncMode === "range" &&
    (fromSeason > toSeason || (fromSeason === toSeason && fromRace > toRace));

  const handlePrepare = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBackward) return;

    setError(null);
    setMessage(null);
    setStep("preparing");

    const tSeason = syncMode === "single" ? fromSeason : toSeason;
    const tRace = syncMode === "single" ? fromRace : toRace;

    startTransition(async () => {
      const res = await prepareSyncAction(fromSeason, fromRace, tSeason, tRace);
      
      if (!res.success) {
        setError(res.error);
        setStep("idle");
        return;
      }

      if (res.missingRaces.length === 0) {
        setMessage("All selected races are already synced.");
        setStep("idle");
        return;
      }

      setMissingRaces(res.missingRaces);
      setStep("confirm");
    });
  };

  const handleStartSync = () => {
    setStep("syncing");
    setProgress(0);
    setError(null);
    setMessage(null);
    cancelRef.current = false;

    startTransition(async () => {
      const CHUNK_SIZE = 5;
      let syncedCount = 0;

      for (let i = 0; i < missingRaces.length; i += CHUNK_SIZE) {
        if (cancelRef.current) {
          setMessage(`Sync cancelled. ${syncedCount} races synced.`);
          setStep("idle");
          return;
        }

        const chunk = missingRaces.slice(i, i + CHUNK_SIZE);
        const res = await syncRaceBatchAction(chunk);

        if (!res.success) {
          setError(res.error);
          setStep("idle");
          return;
        }

        syncedCount += res.syncedCount;
        setProgress(syncedCount);
      }

      setMessage(`Successfully synced ${syncedCount} races.`);
      setStep("idle");
    });
  };

  const handleCancel = () => {
    cancelRef.current = true;
  };

  return {
    syncMode, setSyncMode,
    fromSeason, setFromSeason,
    fromRace, setFromRace,
    toSeason, setToSeason,
    toRace, setToRace,
    step, setStep,
    error, setError,
    message, setMessage,
    missingRaces, setMissingRaces,
    progress,
    isBackward,
    handlePrepare,
    handleStartSync,
    handleCancel
  };
}
