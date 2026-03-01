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
        set((s) => ({
          timers: typeof action === "function" ? action(s.timers) : action,
        })),
    }),
    {
      name: "better-digital-clock-timers",
      partialize: (s) => ({
        timers: s.timers.map(({ toastSent, toastId, ...t }) => ({
          ...t,
          completionTime: t.completionTime?.toISOString(),
          pausedAt: t.pausedAt?.toISOString(),
        })),
      }),
      merge: (persisted, current) => {
        const raw = (persisted as { timers?: Array<Timer & { completionTime?: string; pausedAt?: string }> })?.timers ?? [];
        const now = Date.now();
        return {
          ...current,
          timers: raw.map((t) => ({
            ...t,
            completionTime: t.completionTime
              ? new Date(t.completionTime)
              : undefined,
            pausedAt: t.pausedAt ? new Date(t.pausedAt) : undefined,
            toastSent:
              !!t.completionTime &&
              new Date(t.completionTime).getTime() < now,
            toastId: undefined,
          })),
        };
      },
    },
  ),
);
