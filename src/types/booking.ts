import { Service } from "./service";

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
  serviceId: string;
  customer: BookingCustomer;
  service: Service;
  date: string;
  createdAt: string;
  updatedAt: string;
}
