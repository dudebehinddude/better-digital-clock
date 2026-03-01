import { parseTimerDuration } from "@/lib/time";
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

const timeSchema = z
  .string()
  .min(1, "Time is required")
  .refine((val) => parseTimerDuration(val) !== null, "Invalid time format")
  .refine((val) => {
    const parsed = parseTimerDuration(val);
    if (!parsed || parsed === "00:00:00") return false;
    const [h, m, s] = parsed.split(":").map(Number);
    return h * 3600 + m * 60 + s > 0;
  }, "Timer has to be longer than 0s");

const timerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  time: timeSchema,
});

type TimerFormValues = z.infer<typeof timerSchema>;

export default function TimerDialog({
  onSave,
  children,
}: {
  onSave: (name: string, duration: number) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: { name: "", time: "" },
    validators: {
      onSubmit: ({ value }) => {
        const result = timerSchema.safeParse(value);
        if (result.success) return undefined;
        const fields: Partial<Record<keyof TimerFormValues, string>> = {};
        for (const issue of result.error.issues) {
          const key = issue.path[0] as keyof TimerFormValues;
          if (key && !fields[key]) fields[key] = issue.message;
        }
        return { fields };
      },
    },
    onSubmit: ({ value }) => {
      const [hour, minute, second] = value.time.split(":").map(Number);
      const duration = second * 1000 + minute * 60 * 1000 + hour * 3600 * 1000;
      onSave(value.name, duration);

      form.reset();
      setOpen(false);
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) form.reset();
        setOpen(nextOpen);
      }}
    >
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Timer</DialogTitle>
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
                  <Label htmlFor="timer-name">Name</Label>
                  <Input
                    id="timer-name"
                    placeholder="My Timer"
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
          <form.Field
            name="time"
            validators={{
              onBlur: ({ value }) => {
                const result = timeSchema.safeParse(value);
                if (result.success) return undefined;
                return result.error.issues[0]?.message;
              },
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched &&
                field.state.meta.errors.length > 0;
              const errors = field.state.meta.errors?.map((e) => ({
                message: String(e),
              }));

              function handleTimeBlur() {
                const parsed = parseTimerDuration(field.state.value);
                if (parsed !== null) field.handleChange(parsed);
                field.handleBlur();
              }

              return (
                <Field data-invalid={isInvalid}>
                  <Label htmlFor="timer-time">Duration</Label>
                  <Input
                    id="timer-time"
                    placeholder="00:00:00"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={handleTimeBlur}
                    aria-invalid={!!isInvalid}
                  />
                  {isInvalid && <FieldError errors={errors} />}
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
            Add Timer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
