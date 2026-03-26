export interface Customer {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateCustomerPayload {
  name: string;
  email: string;
  password?: string;
}
