import { formatElapsed, formatUntil } from "@/lib/time";
import {
  CheckIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import TimerDialog from "./timer-dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";

interface Timer {
  name: string;
  duration: number;
  completionTime: Date | undefined;
  pausedAt: Date | undefined;
  toastSent: boolean;
  toastId: string | number | undefined;
}

export default function Timer() {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [_, setRerender] = useState(0);

  // Check for completed timers and show toast (runs every re-render)
  timers.forEach((timer, index) => {
    if (
      timer.completionTime &&
      timer.completionTime.getTime() < Date.now() &&
      !timer.toastSent
    ) {
      const toastId = toast("Timer Done", {
        description: timer.name,
        duration: Infinity,
        action: {
          label: "OK",
          onClick: () => {
            toast.dismiss();
            setTimers((prev) => {
              const newTimers = [...prev];
              newTimers[index] = { ...timer, completionTime: undefined };
              return newTimers;
            });
          },
        },
      });

      setTimers((prev) => {
        const newTimers = [...prev];
        newTimers[index] = { ...timer, toastSent: true, toastId };
        return newTimers;
      });
    }
  });

  // Update times
  useEffect(() => {
    const intervalTime = timers.length > 0 ? 50 : 1000;
    const interval = setInterval(() => {
      setRerender((prev) => prev + 1);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [timers.length]);

  function addTimer(name: string, duration: number) {
    setTimers((prev) => [
      ...prev,
      {
        name,
        duration,
        completionTime: new Date(Date.now() + duration),
        pausedAt: undefined,
        toastSent: false,
        toastId: undefined,
      },
    ]);
  }

  if (timers.length === 0) {
    return (
      <Card className="w-full max-w-[60%] h-50 p-2 flex items-center justify-center">
        <TimerDialog onSave={addTimer}>
          <div className="border-2 border-dashed border-white/20 px-20 py-5 flex flex-col gap-2">
            <p className="text-lg font-bold">No timers yet</p>
            <p className="text-muted-foreground flex items-center gap-2">
              <PlusIcon /> Add a Timer
            </p>
          </div>
        </TimerDialog>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[60%] max-h-50 p-2">
      <div className={"h-full flex flex-col overflow-y-scroll gap-8 p-2 pb-8"}>
        {[...timers]
          .sort(
            (a, b) =>
              (a.completionTime ?? new Date()).getTime() -
              (b.completionTime ?? new Date()).getTime(),
          )
          .map((timer) => {
            const index = timers.indexOf(timer);
            return (
              <TimerItem
                key={`${index} ${timer.name}`}
                timer={timer}
                index={index}
                setTimers={setTimers}
              />
            );
          })}
      </div>
      <div className="absolute bottom-4 right-4">
        <TimerDialog onSave={addTimer}>
          <Button>
            <PlusIcon /> Add a Timer
          </Button>
        </TimerDialog>
      </div>
    </Card>
  );
}

function TimerItem({
  timer,
  index,
  setTimers,
}: {
  timer: Timer;
  index: number;
  setTimers: Dispatch<SetStateAction<Timer[]>>;
}) {
  const alert =
    timer.completionTime && timer.completionTime.getTime() < Date.now();
  const alertAnimation = alert ? "animate-[flash-destructive_1s_infinite]" : "";

  let time = "";
  if (timer.pausedAt && timer.completionTime) {
    time = formatElapsed(timer.pausedAt, timer.completionTime, {
      showMillis: false,
    });
  } else {
    time = formatUntil(timer.completionTime ?? new Date());
  }

  let actionButton: React.ReactNode;
  if (alert) {
    actionButton = (
      <Button key="acknowledge" className="rounded-full" onClick={acknowledge}>
        <CheckIcon />
      </Button>
    );
  } else if (timer.pausedAt) {
    actionButton = (
      <Button key="resume" className="rounded-full" onClick={resume}>
        <PlayIcon />
      </Button>
    );
  } else if (timer.completionTime) {
    actionButton = (
      <Button key="pause" className="rounded-full" onClick={pause}>
        <PauseIcon />
      </Button>
    );
  } else {
    actionButton = (
      <Button key="reset" className="rounded-full" onClick={reset}>
        <RotateCcwIcon />
      </Button>
    );
  }

  function acknowledge() {
    if (timer.toastId) {
      toast.dismiss(timer.toastId);
    }

    setTimers((prev) => {
      const newTimers = [...prev];
      newTimers[index] = { ...timer, completionTime: undefined };
      return newTimers;
    });
  }

  function reset() {
    if (timer.toastId) {
      toast.dismiss(timer.toastId);
    }

    setTimers((prev) => {
      const newTimers = [...prev];
      newTimers[index] = {
        ...timer,
        completionTime: new Date(Date.now() + timer.duration),
        pausedAt: undefined,
        toastSent: false,
      };
      return newTimers;
    });
  }

  function pause() {
    setTimers((prev) => {
      const newTimers = [...prev];
      newTimers[index] = { ...timer, pausedAt: new Date() };
      return newTimers;
    });
  }

  function resume() {
    if (!timer.pausedAt || !timer.completionTime) return;
    const remaining = timer.completionTime.getTime() - timer.pausedAt.getTime();

    setTimers((prev) => {
      const newTimers = [...prev];
      newTimers[index] = {
        ...timer,
        pausedAt: undefined,
        completionTime: new Date(Date.now() + remaining),
      };
      return newTimers;
    });
  }

  function remove() {
    if (timer.toastId) {
      toast.dismiss(timer.toastId);
    }

    setTimers((prev) => {
      const newTimers = [...prev];
      newTimers.splice(index, 1);
      return newTimers;
    });
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex flex-row gap-4 items-center">
          <div className="flex flex-col gap-2">{actionButton}</div>
          <div>
            <p className="text-lg font-bold">
              <span className={alertAnimation}>{timer.name}</span>
            </p>
            <p className="text-muted-foreground">
              <span className={alertAnimation}>{time}</span>
            </p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={reset}>
          <RotateCcwIcon /> Reset
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onClick={remove}>
          <TrashIcon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
