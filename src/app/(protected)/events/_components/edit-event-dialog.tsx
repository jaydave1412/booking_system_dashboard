"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/spinner";
import api from "@/lib/api";
import axios from "axios";
import { UpdateEventPayload } from "@/types/event";
import { formatInTimeZone } from "date-fns-tz";

const IST = "Asia/Kolkata";

function toDatetimeLocal(iso: string) {
  return formatInTimeZone(new Date(iso), IST, "yyyy-MM-dd'T'HH:mm");
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string | null;
  onSuccess: () => void;
}

export default function EditEventDialog({
  open,
  onOpenChange,
  eventId,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<UpdateEventPayload>({
    title: "",
    description: "",
    date: "",
  });
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !eventId) return;
    setFetchLoading(true);
    setError("");
    setForm({ title: "", description: "", date: "" });
    api
      .get(`/events/${eventId}`)
      .then(({ data }) =>
        setForm({
          title: data.title,
          description: data.description,
          date: toDatetimeLocal(data.date),
        })
      )
      .catch(() => setError("Failed to load event data."))
      .finally(() => setFetchLoading(false));
  }, [open, eventId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    try {
      const payload: UpdateEventPayload = {
        ...form,
        date: new Date(form.date).toISOString(),
      };
      await api.patch(`/events/${eventId}`, payload);
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Something went wrong");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="size-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-date">Date & Time</Label>
              <Input
                id="edit-date"
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                required
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? (
                  <>
                    <Spinner />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
