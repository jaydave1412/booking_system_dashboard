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
import { Employee, CreateEmployeePayload } from "@/types/employee";
import EditEmployeeDialog from "./_components/edit-employee-dialog";

const IST = "Asia/Kolkata";

function formatDate(iso: string) {
  return formatInTimeZone(new Date(iso), IST, "dd MMM yyyy, hh:mm a");
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [form, setForm] = useState<CreateEmployeePayload>({
    name: "",
    email: "",
    password: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get<Employee[]>("/employee");
      setEmployees(data);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (form.password !== form.password.trim()) {
      setCreateError("Password cannot start or end with a space.");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      await api.post<Employee>("/employee", form);
      setForm({ name: "", email: "", password: "" });
      await fetchEmployees();
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
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    setDeletingId(id);
    try {
      await api.delete(`/employee/${id}`);
      await fetchEmployees();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Employees</h1>

      {/* Create Employee */}
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Create Employee</CardTitle>
        </CardHeader>
        <CardContent>
          {createError && (
            <p className="text-sm text-destructive mb-3">{createError}</p>
          )}
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={createLoading} className="self-start">
              {createLoading ? (
                <>
                  <Spinner />
                  Creating...
                </>
              ) : (
                "Create Employee"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <div className="rounded-lg border">
        {tableLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : employees.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            No employees found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{emp.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(emp.createdAt)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(emp.updatedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(emp.id)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(emp.id)}
                        disabled={deletingId === emp.id}
                      >
                        {deletingId === emp.id ? (
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

      <EditEmployeeDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        employeeId={editId}
        onSuccess={fetchEmployees}
      />
    </div>
  );
}
