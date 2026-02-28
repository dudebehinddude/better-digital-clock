import { useSettings } from "@/contexts/SettingsContext";
import { cn } from "@/lib/utils";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";
import { Card } from "./ui/card";
import { Slider } from "./ui/slider";

export default function Settings() {
  const [open, setOpen] = useState(false);
  const { tint, setTint } = useSettings();

  return (
    <Card
      className="absolute top-4 right-4 p-2 overflow-hidden flex flex-row min-w-0 gap-0"
      onClick={() => setOpen((prev) => !prev)}
    >
      <div
        className="grid grid-rows-2 min-w-0 transition-[grid-template-rows,grid-template-columns] duration-300 ease-in-out"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          gridTemplateColumns: open ? "1fr" : "0fr",
        }}
      >
        <div
          className={cn("min-h-0 min-w-0 overflow-hidden", open ? "mr-4" : "")}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={cn(
              "whitespace-nowrap flex flex-col gap-2",
              open ? "px-1 pb-2" : "",
            )}
          >
            <p>Background Tint</p>
            <Slider
              defaultValue={[80]}
              onValueChange={(value) =>
                setTint(Array.isArray(value) ? (value[0] ?? tint) : value)
              }
              max={100}
              step={1}
              className="w-24"
            />
          </div>
        </div>
      </div>
      <SettingsIcon className="size-6 text-white shrink-0" />
    </Card>
  );
}
