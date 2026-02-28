import { useTime } from "@/contexts/TimeContext";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AlarmClockIcon } from "lucide-react";
import { Card } from "./ui/card";

export function Clock() {
  const time = useTime();

  return (
    <Card className="w-full max-w-[60%] gap-4">
      <div className="mx-auto">
        <p>{format(time, "EEEE, MMMM d, yyyy")}</p>
        <p className="text-4xl font-bold font-mono tabular-nums text-white">
          {time.toLocaleTimeString()}
        </p>
      </div>
      <div className="mx-auto">
        <Button>
          <AlarmClockIcon /> Add Alarm
        </Button>
      </div>
    </Card>
  );
}
