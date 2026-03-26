import { Event } from "./event";

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface BookingCustomer {
  id: string;
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  status: BookingStatus;
  customerId: string;
  eventId: string;
  customer: BookingCustomer;
  event: Event;
  createdAt: string;
  updatedAt: string;
}
