export interface Service {
  id: string;
  title: string;
  description: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServicePayload {
  title: string;
  description: string;
  cost: number;
}

export interface UpdateServicePayload {
  title: string;
  description: string;
  cost: number;
}
