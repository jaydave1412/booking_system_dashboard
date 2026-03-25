export interface Employee {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  password: string;
}

export interface UpdateEmployeePayload {
  name: string;
  email: string;
  password?: string;
}
