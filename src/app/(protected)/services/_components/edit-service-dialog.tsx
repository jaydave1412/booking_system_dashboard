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
import { UpdateServicePayload } from "@/types/service";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  serviceId: string | null;
  onSuccess: () => void;
}

export default function EditServiceDialog({
  open,
  onOpenChange,
  serviceId,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<UpdateServicePayload>({
    title: "",
    description: "",
    cost: 0,
  });
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !serviceId) return;
    setFetchLoading(true);
    setError("");
    setForm({ title: "", description: "", cost: 0 });
    api
      .get(`/services/${serviceId}`)
      .then(({ data }) =>
        setForm({
          title: data.title,
          description: data.description,
          cost: data.cost,
        }),
      )
      .catch(() => setError("Failed to load service data."))
      .finally(() => setFetchLoading(false));
  }, [open, serviceId]);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    try {
      const payload: UpdateServicePayload = {
        ...form,
      };
      await api.patch(`/services/${serviceId}`, payload);
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
          <DialogTitle>Edit Service</DialogTitle>
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <textarea
                id="edit-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-cost">Cost</Label>

              <Input
                required
                id="edit-cost"
                type="number"
                value={form.cost}
                onChange={(e) => {
                  setForm((f) => ({ ...f, cost: parseFloat(e.target.value) }));
                }}
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
