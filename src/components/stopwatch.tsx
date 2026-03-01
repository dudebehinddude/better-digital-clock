import { formatElapsed } from "@/lib/time";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

export default function Stopwatch() {
  const [start, setStart] = useState<Date | undefined>(undefined);
  const [pause, setPause] = useState<Date | undefined>(undefined);
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

    const elapsedBeforePause = pause.getTime() - start.getTime();
    setPause(undefined);
    setStart(new Date(Date.now() - elapsedBeforePause));
  }

  function reset() {
    setStart(undefined);
    setPause(undefined);
  }

  return (
    <Card className="w-full max-w-[60%] gap-4">
      <div className="mx-auto">
        <p className="text-4xl font-bold font-mono tabular-nums text-white">
          {time}
        </p>
      </div>
      <div className="mx-auto">
        <Button onClick={startStop}>
          {start && !pause ? "Stop" : "Start"}
        </Button>
        {pause && <Button onClick={reset}>Reset</Button>}
      </div>
    </Card>
  );
}
