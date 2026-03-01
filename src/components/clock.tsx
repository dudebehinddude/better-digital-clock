import { Button } from "@/components/ui/button";
import { useClockStore, type Alarm } from "@/stores/clock-store";
import { format } from "date-fns";
import { AlarmClockIcon, ClockIcon, TrashIcon } from "lucide-react";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";
import { AlarmDialog, type AlarmFormValues } from "./alarm-dialog";
import { SetClockDialog, type SetClockFormValues } from "./set-clock-dialog";
import { Card } from "./ui/card";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./ui/context-menu";
import { Switch } from "./ui/switch";

export default function Clock() {
  const [now, setNow] = useState(() => new Date());
  const [clockOffset, setClockOffset] = useState(0);
  const alarms = useClockStore((s) => s.alarms);
  const setAlarms = useClockStore((s) => s.setAlarms);

  useEffect(() => {
    const id = setInterval(
      () => setNow(new Date(new Date().getTime() + clockOffset)),
      100,
    );
    return () => clearInterval(id);
  }, [clockOffset, alarms]);

  function addAlarm(alarm: AlarmFormValues) {
    const nextNotification = alarm.repeat ? new Date() : new Date(alarm.date);

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
    if (!alarm.enabled || !alarm.nextNotification) return;
    if (alarm.nextNotification.getTime() < now.getTime() && !alarm.toastId) {
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
              nextNotification.setDate(now.getDate());
              if (nextNotification.getTime() <= now.getTime()) {
                nextNotification.setDate(nextNotification.getDate() + 1);
              }

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

  function setClock(form: SetClockFormValues) {
    const realNow = new Date();

    const [y, m, d] = form.date.split("-").map(Number);
    const formDate = new Date(y, m - 1, d);

    const [hoursStr, minutesStr, secondsStr] = form.time.split(":").map(Number);
    formDate.setHours(hoursStr, minutesStr, secondsStr, 0);

    const newOffset = formDate.getTime() - realNow.getTime();
    setClockOffset((_prev) => newOffset);

    if (newOffset < clockOffset) {
      // Recompute time immediately to avoid alarm notifications going off before the clock updates
      setNow((_prev) => new Date(new Date().getTime() + newOffset));
    }

    // Recompute repeat alarms from the new "current" time
    updateEnabledRepeatAlarms(formDate);
  }

  function updateEnabledRepeatAlarms(nextNow?: Date) {
    const updateTime = nextNow ?? now;

    const newAlarms = [...alarms];
    alarms.forEach((alarm, index) => {
      if (!alarm.enabled || !alarm.repeat) return;
      const nextNotification = new Date(updateTime.getTime());

      const [hoursStr, minutesStr] = alarm.time.split(":");
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);

      nextNotification.setHours(hours, minutes, 0, 0);
      if (nextNotification.getTime() <= updateTime.getTime()) {
        nextNotification.setDate(nextNotification.getDate() + 1);
      }

      newAlarms[index] = {
        ...alarm,
        nextNotification,
      };
    });

    setAlarms((_prev) => newAlarms);
  }

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
        {[...alarms]
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
          .map((alarm) => {
            const stateIndex = alarms.findIndex((a) => a === alarm);
            return (
              <AlarmItem
                key={stateIndex}
                alarm={alarm}
                index={stateIndex}
                setAlarms={setAlarms}
                now={now}
              />
            );
          })}
      </div>
      <div className="mx-auto">
        <SetClockDialog onSave={setClock} onReset={() => setClockOffset(0)}>
          <Button>
            <ClockIcon /> Set Clock
          </Button>
        </SetClockDialog>
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
  now,
}: {
  alarm: Alarm;
  index: number;
  setAlarms: Dispatch<SetStateAction<Alarm[]>>;
  now: Date;
}) {
  const realNow = new Date();

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
        if (alarm.toastId) {
          toast.dismiss(alarm.toastId);
        }

        newAlarms[index] = {
          ...alarm,
          enabled: false,
          nextNotification: undefined,
        };
        return newAlarms;
      }

      const [hoursStr, minutesStr] = alarm.time.split(":");
      const hours = Number(hoursStr);
      const minutes = Number(minutesStr);
      const nextNotification = realNow;
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

  const next =
    alarm.nextNotification ??
    new Date(
      new Date().setHours(
        Number(alarm.time.split(":")[0]),
        Number(alarm.time.split(":")[1]),
        0,
        0,
      ),
    );
  const moreThanOneDay =
    next && next.getTime() - now.getTime() > 24 * 3600 * 1000;
  const nextLabel = next
    ? moreThanOneDay
      ? format(next, "PPp")
      : format(next, "p")
    : format(alarm.time, "p");

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex gap-4 items-center">
          <div className="w-8" onClick={(e) => e.stopPropagation()}>
            {alarm.repeat && (
              <Switch checked={alarm.enabled} onCheckedChange={toggleEnabled} />
            )}
          </div>
          <div>
            <p className="font-bold">{alarm.name}</p>
            <p>
              {nextLabel} {!alarm.repeat && "· No Repeat"}
            </p>
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
