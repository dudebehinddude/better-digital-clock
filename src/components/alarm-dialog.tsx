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
import { Switch } from "./ui/switch";

const alarmSchema = z.object({
  name: z.string().min(1, "Name is required"),
  time: z
    .string()
    .min(1, "Time is required")
    .regex(/^\d{2}:\d{2}$/, "Stop trying to break me 😭"),
  date: z.string().min(1, "Date is required"),
  repeat: z.boolean().default(false),
});

export type AlarmFormValues = z.infer<typeof alarmSchema>;

function getAmPmFrom24h(time24: string): "AM" | "PM" {
  if (!time24) return "AM";
  const [h] = time24.split(":").map(Number);
  return h >= 12 ? "PM" : "AM";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function toggleAmPm(time24: string): string {
  if (!time24) return "12:00";
  const [h, m] = time24.split(":").map(Number);
  const newH = h >= 12 ? (h === 12 ? 0 : h - 12) : h === 0 ? 12 : h + 12;
  return `${String(newH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function AlarmDialog({
  children,
  onSave,
}: {
  children: React.ReactNode;
  onSave: (alarm: AlarmFormValues) => void;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      time: "",
      date: todayISO(),
      repeat: true,
    },
    validators: {
      onSubmit: ({ value }) => {
        const result = alarmSchema.safeParse(value);
        if (result.success) return undefined;
        const fields: Partial<Record<keyof AlarmFormValues, string>> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof AlarmFormValues;
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
          <form.Field name="name">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              const errors = field.state.meta.errors?.map((e) => ({
                message: String(e),
              }));
              return (
                <Field data-invalid={isInvalid}>
                  <Label htmlFor="alarm-name">Name</Label>
                  <Input
                    id="alarm-name"
                    placeholder="My Alarm"
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
          <form.Field name="repeat">
            {(field) => {
              return (
                <Field orientation="horizontal">
                  <Switch
                    id="repeat"
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                  <Label htmlFor="repeat">Repeat</Label>
                </Field>
              );
            }}
          </form.Field>
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            Add Alarm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
