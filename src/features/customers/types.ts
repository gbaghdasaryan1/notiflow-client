export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
  createdAt?: string;
};

export type CreateCustomerPayload = {
  name: string;
  email?: string;
  phone?: string;
  tags?: string[];
};

export const CUSTOMERS_KEY = ['customers'] as const;