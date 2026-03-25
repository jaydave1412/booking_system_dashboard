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
import { Checkbox } from "@/components/ui/checkbox";
import Spinner from "@/components/spinner";
import api from "@/lib/api";
import axios from "axios";
import { UpdateEmployeePayload } from "@/types/employee";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string | null;
  onSuccess: () => void;
}

export default function EditEmployeeDialog({
  open,
  onOpenChange,
  employeeId,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<UpdateEmployeePayload>({ name: "", email: "" });
  const [changePassword, setChangePassword] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !employeeId) return;
    setFetchLoading(true);
    setError("");
    setChangePassword(false);
    setForm({ name: "", email: "" });
    api
      .get(`/employee/${employeeId}`)
      .then(({ data }) => setForm({ name: data.name, email: data.email }))
      .catch(() => setError("Failed to load employee data."))
      .finally(() => setFetchLoading(false));
  }, [open, employeeId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitLoading(true);
    setError("");
    try {
      const payload: UpdateEmployeePayload = changePassword
        ? form
        : { name: form.name, email: form.email };
      await api.patch(`/employee/${employeeId}`, payload);
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
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex justify-center py-6">
            <Spinner className="size-6" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="change-password"
                checked={changePassword}
                onCheckedChange={(checked) => setChangePassword(!!checked)}
              />
              <Label htmlFor="change-password">Change password</Label>
            </div>

            {changePassword && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-password">New Password</Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={form.password ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            )}

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
