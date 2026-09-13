import { useEffect, useState } from "react";

const TICK_MS = 1000;

/** Seconds since `startedAt` (epoch ms), refreshed every second; 0 when nothing is running. */
export function useElapsedSeconds(startedAt: number | null): number {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (startedAt === null) return;
    const interval = setInterval(() => setNow(Date.now()), TICK_MS);
    return () => clearInterval(interval);
  }, [startedAt]);

  return startedAt === null ? 0 : Math.max(0, Math.floor((now - startedAt) / 1000));
}
