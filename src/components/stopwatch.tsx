import { formatElapsed } from "@/lib/time";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function Stopwatch() {
  const [start, setStart] = useState<Date | undefined>(undefined);
  const [pause, setPause] = useState<Date | undefined>(undefined);
  const [laps, setLaps] = useState<Date[]>([]);
  const [_, setRerender] = useState(0);

  // Constantly update time
  useEffect(() => {
    const rerenderTime = start ? 0 : 100;
    if (start && !pause) {
      const interval = setInterval(() => {
        setRerender((prev) => prev + 1);
      }, rerenderTime);
      return () => clearInterval(interval);
    }
  }, [start, pause]);

  const time = formatElapsed(start, pause ?? new Date(), {
    showMillis: true,
  });

  function startStop() {
    if (!start) {
      setStart(new Date());
      return;
    }

    if (!pause) {
      setPause(new Date());
      return;
    }

    const now = new Date().getTime();
    const elapsedBeforePause = pause.getTime() - start.getTime();
    const newStart = new Date(now - elapsedBeforePause);
    setStart((_prev) => newStart);
    setLaps((prev) =>
      prev.map(
        (lap) => new Date(newStart.getTime() + lap.getTime() - start.getTime()),
      ),
    );
    setPause(undefined);
  }

  function lap() {
    setLaps((prev) => [...prev, new Date()]);
  }

  function reset() {
    setStart(undefined);
    setPause(undefined);
    setLaps([]);
  }

  return (
    <Card className="w-full max-w-[60vw] max-h-[60vh] gap-4">
      <div className="mx-auto">
        <p className="text-4xl font-bold font-mono tabular-nums text-white">
          {time}
        </p>
      </div>
      <div className="flex flex-col gap-2 overflow-y-scroll flex-0">
        {laps.map((lap, index) => (
          <p
            key={index}
            className="text-muted-foreground font-mono tabular-nums"
          >
            {index + 1}: {index === 0 && <>{formatElapsed(start, lap, {})}</>}
            {index > 0 && (
              <>
                {formatElapsed(laps[index - 1], lap, {})} (
                {formatElapsed(start, lap, {})})
              </>
            )}
          </p>
        ))}
      </div>
      <div className="mx-auto">
        <Button onClick={startStop}>
          {start && !pause ? "Stop" : "Start"}
        </Button>
        {pause && <Button onClick={reset}>Reset</Button>}
        {start && !pause && <Button onClick={lap}>Lap</Button>}
      </div>
    </Card>
  );
}
