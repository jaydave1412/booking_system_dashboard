export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
}

export interface UpdateEventPayload {
  title: string;
  description: string;
  date: string;
}
