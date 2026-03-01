import { useSettings } from "@/stores/settings-store";
import { AlarmClockIcon, HourglassIcon, TimerIcon } from "lucide-react";
import { useState } from "react";
import Clock from "./components/clock";
import Settings from "./components/settings";
import Stopwatch from "./components/stopwatch";
import Timer from "./components/timer";
import { Button } from "./components/ui/button";
import { cn } from "./lib/utils";

export function App() {
  const { tint } = useSettings();

  const [view, setView] = useState<"clock" | "stopwatch" | "timer">("clock");

  function selectionClass(selectedView: string) {
    return cn(
      "rounded-full transition-all duration-200 ease-out backdrop-blur-xs bg-primary/80",
      selectedView !== view ? "bg-primary/40 px-3" : "p-4.5",
    );
  }

  function iconSelectionClass(selectedView: string) {
    return cn(
      "transition-all duration-600 ease-out",
      selectedView === view ? "scale-150" : "scale-100",
    );
  }

  return (
    <div className="relative flex w-full h-dvh items-center justify-center overflow-hidden">
      {/* Wallpaper */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/wallpaper.jpg)" }}
      />
      {/* Wallpaper tint */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `color-mix(in oklch, var(--background) ${tint}%, transparent)`,
        }}
      />

      <Settings />

      {/* Keep all views mounted so state is preserved */}
      <div className={view === "clock" ? "contents" : "hidden"}>
        <Clock />
      </div>
      <div className={view === "stopwatch" ? "contents" : "hidden"}>
        <Stopwatch />
      </div>
      <div className={view === "timer" ? "contents" : "hidden"}>
        <Timer />
      </div>

      {/* Bottom Menu */}
      <div className="absolute bottom-4 min-h-14 gap-2 flex items-center justify-center">
        <Button
          className={selectionClass("clock")}
          onClick={() => setView("clock")}
        >
          <AlarmClockIcon className={iconSelectionClass("clock")} />
        </Button>
        <Button
          className={selectionClass("stopwatch")}
          onClick={() => setView("stopwatch")}
        >
          <TimerIcon className={iconSelectionClass("stopwatch")} />
        </Button>
        <Button
          className={selectionClass("timer")}
          onClick={() => setView("timer")}
        >
          <HourglassIcon className={iconSelectionClass("timer")} />
        </Button>
      </div>
    </div>
  );
}

export default App;
