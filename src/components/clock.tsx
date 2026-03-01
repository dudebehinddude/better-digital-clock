import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlarmClockIcon, TrashIcon } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { AlarmDialog, type AlarmFormValues } from "./alarm-dialog";
import { Card } from "./ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Switch } from "./ui/switch";

interface Alarm {
  name: string;
  time: string; // HH:MM (24h)
  repeat: boolean;
  enabled: boolean;
  nextNotification: Date | undefined;
  toastId?: string | number | undefined;
  dismissed?: boolean;
}

export default function Clock() {
  const [now, setNow] = useState(() => new Date());
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Update clock time
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 100);
    return () => clearInterval(id);
  }, []);

  function addAlarm(alarm: AlarmFormValues) {
    const nextNotification = new Date(alarm.date ?? new Date());

    // Parse time: form uses <input type="time"> which gives 24h "HH:mm"
    const [hoursStr, minutesStr] = alarm.time.split(":");
    const hours = Number(hoursStr);
    const minutes = Number(minutesStr);

    nextNotification.setHours(hours, minutes, 0, 0);
    if (nextNotification.getTime() <= Date.now()) {
      nextNotification.setDate(nextNotification.getDate() + 1);
    }

    setAlarms((prev) => [
      ...prev,
      {
        name: alarm.name,
        time: alarm.time,
        repeat: alarm.repeat,
        enabled: true,
        nextNotification,
      },
    ]);
  }

  alarms.forEach((alarm, index) => {
    if (
      alarm.nextNotification &&
      alarm.nextNotification.getTime() < Date.now() &&
      !alarm.toastId
    ) {
      const toastId = toast("Alarm", {
        description: `${alarm.name} · ${format(alarm.nextNotification, "p")}`,
        duration: Infinity,
        action: {
          label: "OK",
          onClick: () => {
            toast.dismiss(toastId);
            setAlarms((prev) => {
              const idx = prev.findIndex((a) => a.toastId === toastId);
              if (idx === -1) return prev;

              const alarm = prev[idx];
              if (!alarm.repeat) {
                const next = [...prev];
                next.splice(idx, 1);
                return next;
              }

              const nextNotification = new Date(alarm.nextNotification!);
              nextNotification.setDate(nextNotification.getDate() + 1);
              const next = [...prev];
              next[idx] = {
                ...alarm,
                nextNotification,
                toastId: undefined,
                dismissed: undefined,
              };
              return next;
            });
          },
        },
      });
      setAlarms((prev) => {
        const newAlarms = [...prev];
        newAlarms[index] = { ...alarm, toastId };
        return newAlarms;
      });
    }
  });

  return (
    <Card className="w-full max-w-[60vw] h-full max-h-[80vh] gap-4">
      <div className="mx-auto">
        <p>{format(now, "EEEE, MMMM d, yyyy")}</p>
        <p className="text-4xl font-bold font-mono tabular-nums text-white">
          {now.toLocaleTimeString()}
        </p>
      </div>
      <p className="text-lg font-bold">Alarms</p>
      <div className="flex flex-col gap-2 overflow-y-scroll flex-0">
        {alarms
          .sort((a, b) => {
            const [aHour, aMin] = a.time.split(":").map(Number);
            const [bHour, bMin] = b.time.split(":").map(Number);
            if (aHour !== bHour) {
              return aHour - bHour;
            }
            if (aMin !== bMin) {
              return aMin - bMin;
            }
            return a.name.localeCompare(b.name);
          })
          .map((alarm, index) => (
            <AlarmItem
              key={index}
              alarm={alarm}
              index={index}
              setAlarms={setAlarms}
            />
          ))}
      </div>
      <div className="mx-auto">
        <AlarmDialog onSave={addAlarm}>
          <Button>
            <AlarmClockIcon /> Add Alarm
          </Button>
        </AlarmDialog>
      </div>
    </Card>
  );
}

function AlarmItem({
  alarm,
  index,
  setAlarms,
}: {
  alarm: Alarm;
  index: number;
  setAlarms: Dispatch<SetStateAction<Alarm[]>>;
}) {
  const now = new Date();

  function remove() {
    if (alarm.toastId) {
      toast.dismiss(alarm.toastId);
    }

    setAlarms((prev) => {
      const newAlarms = [...prev];
      newAlarms.splice(index, 1);
      return newAlarms;
    });
  }

  function toggleEnabled() {
    if (!alarm.repeat) return;

    setAlarms((prev) => {
      const newAlarms = [...prev];
      if (alarm.enabled) {
        newAlarms[index] = { ...alarm, enabled: false };
        return newAlarms;
      }

      const [hoursStr, minutesStr] = alarm.time.split(":");
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);
      const nextNotification = new Date();
      nextNotification.setHours(hours, minutes, 0, 0);
      if (nextNotification.getTime() <= Date.now()) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      newAlarms[index] = {
        ...alarm,
        enabled: true,
        nextNotification,
        toastId: undefined,
        dismissed: undefined,
      };
      return newAlarms;
    });
  }

  const next = alarm.nextNotification;
  const moreThanOneDay =
    next && next.getTime() - now.getTime() > 24 * 3600 * 1000;
  const nextLabel = next
    ? moreThanOneDay
      ? format(next, "PPpp")
      : format(next, "p")
    : alarm.time;

  return (
    <ContextMenu>
      <ContextMenuTrigger onClick={toggleEnabled}>
        <div className="flex gap-4 items-center">
          <div className="w-8">
            {alarm.repeat && <Switch checked={alarm.enabled} />}
          </div>
          <div>
            <p className="font-bold">{alarm.name}</p>
            <p>{nextLabel}</p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={remove} variant="destructive">
          <TrashIcon /> Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
