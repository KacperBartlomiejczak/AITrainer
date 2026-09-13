import { useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";

export type AsyncResourceStatus = "loading" | "ready" | "error";

export interface AsyncResource<T> {
  status: AsyncResourceStatus;
  data: T;
  reload: () => Promise<void>;
}

/**
 * Loads data (e.g. from the local database) whenever the screen gains focus,
 * so returning to a screen shows changes made elsewhere. Never throws: failures become `status: "error"`.
 * `load` and `initialData` must be stable references (module-level functions/constants).
 */
export function useAsyncResource<T>(load: () => Promise<T>, initialData: T, label: string): AsyncResource<T> {
  const [status, setStatus] = useState<AsyncResourceStatus>("loading");
  const [data, setData] = useState<T>(initialData);
  const latestRequestId = useRef(0);

  const reload = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    try {
      const nextData = await load();
      // Only the newest request may update state; a slower older response is outdated
      if (requestId !== latestRequestId.current) return;
      setData(nextData);
      setStatus("ready");
    } catch (error: unknown) {
      console.error(`[db] Failed to load ${label}`, error);
      if (requestId === latestRequestId.current) setStatus("error");
    }
  }, [load, label]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  return { status, data, reload };
}
