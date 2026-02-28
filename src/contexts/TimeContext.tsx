import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const TimeContext = createContext<Date | null>(null);

export function TimeProvider({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <TimeContext.Provider value={time}>{children}</TimeContext.Provider>
  );
}

export function useTime() {
  const time = useContext(TimeContext);
  if (time === null) {
    throw new Error("useTime must be used within a TimeProvider");
  }
  return time;
}
