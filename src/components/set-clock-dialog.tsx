import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Field, FieldError } from "./ui/field";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const setClockSchema = z.object({
  time: z
    .string()
    .min(1, "Time is required")
    .regex(/^\d{2}:\d{2}:\d{2}$/, "Stop trying to break me 😭"),
  date: z.string().min(1, "Date is required"),
});

export type SetClockFormValues = z.infer<typeof setClockSchema>;

function getAmPmFrom24h(time24: string): "AM" | "PM" {
  if (!time24) return "AM";
  const [h] = time24.split(":").map(Number);
  return h >= 12 ? "PM" : "AM";
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function toggleAmPm(time24: string): string {
  if (!time24) return "12:00";
  const [h, m] = time24.split(":").map(Number);
  const newH = h >= 12 ? (h === 12 ? 0 : h - 12) : h === 0 ? 12 : h + 12;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function SetClockDialog({
  children,
  onSave,
  onReset,
}: {
  children: React.ReactNode;
  onSave: (alarm: SetClockFormValues) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      time: "",
      date: todayISO(),
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = setClockSchema.safeParse(value);
        if (result.success) return undefined;
        const fields: Partial<Record<keyof SetClockFormValues, string>> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof SetClockFormValues;
          if (key && !fields[key]) fields[key] = issue.message;
        }
        return { fields };
      },
    },
    onSubmit: ({ value }) => {
      onSave(value);
      form.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        form.reset();
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Alarm</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <form.Field name="time">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              const errors = field.state.meta.errors?.map((e) => ({
                message: String(e),
              }));
              const ampm = getAmPmFrom24h(field.state.value);
              return (
                <Field data-invalid={isInvalid}>
                  <Label htmlFor="alarm-time">Time</Label>
                  <div className="flex flex-row items-center gap-2">
                    <Input
                      id="alarm-time"
                      type="time"
                      step="1"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      aria-invalid={!!isInvalid}
                      className="flex-1"
                    />
                    <Select
                      value={ampm}
                      onValueChange={() => {
                        field.handleChange(toggleAmPm(field.state.value));
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AM">AM</SelectItem>
                        <SelectItem value="PM">PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              );
            }}
          </form.Field>
          <form.Field name="date">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              const errors = field.state.meta.errors?.map((e) => ({
                message: String(e),
              }));
              return (
                <Field data-invalid={isInvalid}>
                  <Label htmlFor="alarm-date">Date</Label>
                  <Input
                    id="alarm-date"
                    type="date"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={!!isInvalid}
                  />
                  {isInvalid && <FieldError errors={errors} />}
                </Field>
              );
            }}
          </form.Field>
          <div className="flex flex-row items-center gap-2">
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              Set Clock
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onReset();
                setOpen(false);
              }}
            >
              Reset Clock
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
