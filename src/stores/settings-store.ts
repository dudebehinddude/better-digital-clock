import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSettingsStore = create<{
  tint: number;
  setTint: (value: number) => void;
}>()(
  persist(
    (set) => ({
      tint: 20,
      setTint: (value) => set({ tint: value }),
    }),
    { name: "better-digital-clock-settings" },
  ),
);

export function useSettings() {
  const tint = useSettingsStore((s) => s.tint);
  const setTint = useSettingsStore((s) => s.setTint);
  return { tint, setTint };
}
