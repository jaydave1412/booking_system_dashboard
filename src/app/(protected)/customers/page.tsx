"use client";

import { useState, useEffect, useCallback } from "react";
import Spinner from "@/components/spinner";
import api from "@/lib/api";
import { formatInTimeZone } from "date-fns-tz";
import { Customer } from "@/types/customers";

const IST = "Asia/Kolkata";

function formatDate(iso: string) {
  return formatInTimeZone(new Date(iso), IST, "dd MMM yyyy, hh:mm a");
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [tableLoading, setTableLoading] = useState(true);

  const fetchCustomers = useCallback(async () => {
    setTableLoading(true);
    try {
      const { data } = await api.get<Customer[]>("/customer");
      setCustomers(data);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Customers</h1>

      {/* Customers Table */}
      <div className="rounded-lg border">
        {tableLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="size-6" />
          </div>
        ) : customers.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">
            No customers found.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Created
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{customer.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {customer.email}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(customer.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {formatDate(customer.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
