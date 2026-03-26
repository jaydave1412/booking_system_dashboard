"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/spinner";
import api from "@/lib/api";
import { formatInTimeZone } from "date-fns-tz";
import { Booking, BookingStatus } from "@/types/booking";

const IST = "Asia/Kolkata";

function formatDate(iso: string) {
  return formatInTimeZone(new Date(iso), IST, "dd MMM yyyy, hh:mm a");
}

const STATUS_STYLES: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ id: string; message: string; success: boolean } | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Booking[]>("/bookings");
      setBookings(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  async function handleStatusChange(booking: Booking, newStatus: BookingStatus) {
    setUpdatingId(booking.id);
    setAlert(null);
    try {
      await api.patch(`/bookings/${booking.id}`, { status: newStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === booking.id ? { ...b, status: newStatus } : b))
      );
      setAlert({
        id: booking.id,
        message: `Booking for "${booking.event.title}" has been ${newStatus.toLowerCase()}.`,
        success: true,
      });
    } catch {
      setAlert({
        id: booking.id,
        message: "Failed to update booking status. Please try again.",
        success: false,
      });
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Bookings</h1>

      {alert && (
        <div
          className={`rounded-md px-4 py-3 text-sm ${
            alert.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {alert.message}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="size-6" />
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-16">
              No bookings found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booked At</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-medium">{booking.customer.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{booking.customer.email}</td>
                      <td className="px-4 py-3">{booking.event.title}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(booking.event.date)}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(booking.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          {booking.status === "CANCELLED" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === booking.id}
                              onClick={() => handleStatusChange(booking, "CONFIRMED")}
                            >
                              {updatingId === booking.id ? (
                                <>
                                  <Spinner />
                                  Confirming...
                                </>
                              ) : (
                                "Confirm"
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={updatingId === booking.id}
                              onClick={() => handleStatusChange(booking, "CANCELLED")}
                            >
                              {updatingId === booking.id ? (
                                <>
                                  <Spinner />
                                  Cancelling...
                                </>
                              ) : (
                                "Cancel"
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
