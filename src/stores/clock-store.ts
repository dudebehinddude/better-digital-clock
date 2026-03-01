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
        set((state) => ({
          alarms: typeof action === "function" ? action(state.alarms) : action,
        })),
    }),
    {
      name: "better-digital-clock-alarms",
      partialize: (state) => ({
        alarms: state.alarms.map(({ toastId: _, ...rest }) => ({
          ...rest,
          nextNotification: rest.nextNotification?.toISOString(),
        })),
      }),
      merge: (persisted, current) => {
        const raw =
          (
            persisted as {
              alarms?: Array<
                Omit<Alarm, "nextNotification"> & { nextNotification?: string }
              >;
            }
          )?.alarms ?? [];
        return {
          ...current,
          alarms: raw.map((persistedAlarm) => ({
            ...persistedAlarm,
            nextNotification: persistedAlarm.nextNotification
              ? new Date(persistedAlarm.nextNotification)
              : undefined,
          })),
        };
      },
    },
  ),
);
