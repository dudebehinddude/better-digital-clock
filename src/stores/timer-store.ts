import type { SetStateAction } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Timer {
  name: string;
  duration: number;
  completionTime: Date | undefined;
  pausedAt: Date | undefined;
  toastSent: boolean;
  toastId: string | number | undefined;
}

export const useTimerStore = create<{
  timers: Timer[];
  setTimers: (action: SetStateAction<Timer[]>) => void;
}>()(
  persist(
    (set) => ({
      timers: [],
      setTimers: (action) =>
        set((state) => ({
          timers:
            typeof action === "function" ? action(state.timers) : action,
        })),
    }),
    {
      name: "better-digital-clock-timers",
      partialize: (state) => ({
        timers: state.timers.map(
          ({ toastSent: _toastSent, toastId: _toastId, ...rest }) => ({
            ...rest,
            completionTime: rest.completionTime?.toISOString(),
            pausedAt: rest.pausedAt?.toISOString(),
          }),
        ),
      }),
      merge: (persisted, current) => {
        const raw = (persisted as { timers?: Array<Timer & { completionTime?: string; pausedAt?: string }> })?.timers ?? [];
        const now = Date.now();
        return {
          ...current,
          timers: raw.map((persistedTimer) => ({
            ...persistedTimer,
            completionTime: persistedTimer.completionTime
              ? new Date(persistedTimer.completionTime)
              : undefined,
            pausedAt: persistedTimer.pausedAt
              ? new Date(persistedTimer.pausedAt)
              : undefined,
            toastSent:
              !!persistedTimer.completionTime &&
              new Date(persistedTimer.completionTime).getTime() < now,
            toastId: undefined,
          })),
        };
      },
    },
  ),
);
