import type { SetStateAction } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Alarm {
  name: string;
  time: string;
  repeat: boolean;
  enabled: boolean;
  nextNotification: Date | undefined;
  toastId?: string | number;
  dismissed?: boolean;
}

export const useClockStore = create<{
  alarms: Alarm[];
  setAlarms: (action: SetStateAction<Alarm[]>) => void;
}>()(
  persist(
    (set) => ({
      alarms: [],
      setAlarms: (action) =>
        set((s) => ({
          alarms: typeof action === "function" ? action(s.alarms) : action,
        })),
    }),
    {
      name: "better-digital-clock-alarms",
      partialize: (s) => ({
        alarms: s.alarms.map(({ toastId, dismissed, ...a }) => ({
          ...a,
          nextNotification: a.nextNotification?.toISOString(),
        })),
      }),
      merge: (persisted, current) => {
        const raw = (persisted as { alarms?: Array<Omit<Alarm, "nextNotification"> & { nextNotification?: string }> })?.alarms ?? [];
        return {
          ...current,
          alarms: raw.map((a) => ({
            ...a,
            nextNotification: a.nextNotification
              ? new Date(a.nextNotification)
              : undefined,
          })),
        };
      },
    },
  ),
);
