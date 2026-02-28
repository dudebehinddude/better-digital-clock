import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type SettingsContextValue = {
  tint: number;
  setTint: (value: number) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [tint, setTint] = useState(80);

  return (
    <SettingsContext.Provider value={{ tint, setTint }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (ctx === null) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
