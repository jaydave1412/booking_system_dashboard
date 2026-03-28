"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/spinner";
import api from "@/lib/api";
import axios from "axios";
import { formatInTimeZone } from "date-fns-tz";
import { Service, CreateServicePayload } from "@/types/service";
import EditServiceDialog from "./_components/edit-service-dialog";

const IST = "Asia/Kolkata";

function formatDate(iso: string) {
  return formatInTimeZone(new Date(iso), IST, "dd MMM yyyy, hh:mm a");
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [form, setForm] = useState<CreateServicePayload>({
    title: "",
    description: "",
    cost: 0,
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get<Service[]>("/services");
      setServices(data);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  async function handleCreate(e: React.SubmitEvent) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError("");
    try {
      const payload: CreateServicePayload = {
        ...form,
      };
      await api.post<Service>("/services", payload);
      setForm({ title: "", description: "", cost: 0 });
      await fetchServices();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setCreateError(err.response?.data?.message ?? "Something went wrong");
      } else {
        setCreateError("Something went wrong");
      }
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(id: string) {
    setEditId(id);
    setEditOpen(true);
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    setDeletingId(id);
    try {
      await api.delete(`/services/${id}`);
      await fetchServices();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Services</h1>

      {/* Create Service */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Create Service</CardTitle>
        </CardHeader>
        <CardContent>
          {createError && (
            <p className="text-sm text-destructive mb-3">{createError}</p>
          )}
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
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
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                value={form.cost}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cost: parseFloat(e.target.value) }))
                }
                required
              />
            </div>
            <Button
              type="submit"
              disabled={createLoading}
              className="self-start"
            >
              {createLoading ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create Service"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Services Table */}
      <div className="rounded-lg border">
        {tableLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            No services found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Description
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Cost
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Updated
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{service.title}</td>
                  <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                    {service.description}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {service.cost}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(service.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(service.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(service.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(service.id)}
                        disabled={deletingId === service.id}
                      >
                        {deletingId === service.id ? (
                          <>
                            <Spinner />
                            Deleting...
                          </>
                        ) : (
                          "Delete"
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditServiceDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        serviceId={editId}
        onSuccess={fetchServices}
      />
    </div>
  );
}
